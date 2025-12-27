import { REST, Routes } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";
import { readdir, writeFile, mkdir } from "fs/promises";
import { config } from "dotenv";
import { resolve } from "path";
import { BotTypes } from "types";

// Load root .env
config({ path: resolve(process.cwd(), "../../.env"), quiet: true });

interface BotConfig {
  name: string;
  clientId: string | undefined;
  token: string | undefined;
}

interface DeployResult {
  bot: string;
  success: boolean;
  count?: number;
  error?: string;
}

interface CommandWithPath {
  data: any;
  filePath: string;
}

const BOT_CONFIGS: BotConfig[] = [
  {
    name: BotTypes.Wod5,
    clientId: process.env.CLIENT_ID_5TH,
    token: process.env.TOKEN_5TH,
  },
  {
    name: BotTypes.Wod20,
    clientId: process.env.CLIENT_ID_20TH,
    token: process.env.TOKEN_20TH,
  },
  {
    name: BotTypes.Cod,
    clientId: process.env.CLIENT_ID_COD,
    token: process.env.TOKEN_COD,
  },
];

/**
 * Get folder names for a bot type
 * Each bot should only load commands from its specific folder and common folder
 */
function getBotFolders(botType: string): string[] {
  const commonFolder = "common";

  switch (botType) {
    case BotTypes.Wod5:
      return [BotTypes.Wod5, commonFolder];
    case BotTypes.Wod20:
      return [BotTypes.Wod20, commonFolder];
    case BotTypes.Cod:
      return [BotTypes.Cod, commonFolder];
    default:
      return [commonFolder];
  }
}

async function deployCommands(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║         Discord Command Deployment (Global)              ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const commandsPath = join(process.cwd(), "./src/interactions/commands");
  const commandFiles = await getCommandFiles(commandsPath);

  // Load all commands with their file paths
  const allCommands: CommandWithPath[] = [];
  for (const file of commandFiles) {
    try {
      const commandModule = await import(pathToFileURL(file).href);

      // Check for CommonJS style (module.exports = { data, execute })
      if ("data" in commandModule && "execute" in commandModule) {
        allCommands.push({ data: commandModule.data.toJSON(), filePath: file });
        continue;
      }

      // Check for ES module named exports (export const commandName = { data, execute })
      // Look for any property that has data and execute
      for (const [_key, value] of Object.entries(commandModule)) {
        if (
          typeof value === "object" &&
          value !== null &&
          "data" in value &&
          "execute" in value
        ) {
          allCommands.push({
            data: (value as any).data.toJSON(),
            filePath: file,
          });
          break; // Only take the first valid command from each file
        }
      }
    } catch (error) {
      console.error(`⚠️  Failed to load command ${file}:`, error);
    }
  }

  console.log(`📋 Found ${allCommands.length} total commands\n`);

  const results: DeployResult[] = [];

  for (const { name, clientId, token } of BOT_CONFIGS) {
    if (!clientId || !token) {
      console.log(`⚠️  Skipping ${name} (missing credentials)\n`);
      results.push({ bot: name, success: false, error: "Missing credentials" });
      continue;
    }

    // Filter commands for this bot based on folder
    const botFolders = getBotFolders(name);
    const botCommands = allCommands.filter((cmd) => {
      // Normalize path separators for cross-platform compatibility
      const normalizedPath = cmd.filePath.replace(/\\/g, "/");

      // Check if command is in any of this bot's folders
      return botFolders.some((folder) =>
        normalizedPath.includes(`/commands/${folder}/`)
      );
    });

    console.log(
      `🤖 ${name}: Deploying ${botCommands.length} commands (folders: ${botFolders.join(", ")})`
    );

    try {
      const rest = new REST().setToken(token);
      const commandData = botCommands.map((cmd) => cmd.data);

      await rest.put(Routes.applicationCommands(clientId), {
        body: commandData,
      });

      console.log(
        `✅ Successfully deployed ${botCommands.length} commands for ${name}\n`
      );
      results.push({ bot: name, success: true, count: botCommands.length });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to deploy ${name}:`, errorMessage, "\n");
      results.push({ bot: name, success: false, error: errorMessage });
    }
  }

  // Write output file for Turbo cache
  const turboDir = join(process.cwd(), ".turbo");
  await mkdir(turboDir, { recursive: true });
  await writeFile(
    join(turboDir, "deploy.log"),
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
  );

  // Exit with error if any deployment failed
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} bot(s) failed to deploy`);
    process.exit(1);
  }

  console.log("✨ All deployments completed successfully!\n");
}

async function getCommandFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getCommandFiles(fullPath)));
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

deployCommands().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
