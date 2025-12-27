import { REST, Routes } from "discord.js";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import { readdir, writeFile, mkdir } from "fs/promises";
import { config } from "dotenv";
import { resolve } from "path";
import { BotTypes } from "../src/types/bot.definitions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load root .env
config({ path: resolve(__dirname, "../../../.env"), quiet: true });

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

async function deployCommands(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║         Discord Command Deployment (Global)              ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const commandsPath = join(__dirname, "../src/interactions/commands");
  const commandFiles = await getCommandFiles(commandsPath);

  const commands: unknown[] = [];
  for (const file of commandFiles) {
    try {
      const commandModule = await import(pathToFileURL(file).href);

      // Check for CommonJS style (module.exports = { data, execute })
      if ("data" in commandModule && "execute" in commandModule) {
        commands.push(commandModule.data.toJSON());
        continue;
      }

      // Check for ES module named exports (export const commandName = { data, execute })
      // Look for any property that has data and execute
      for (const [key, value] of Object.entries(commandModule)) {
        if (
          typeof value === "object" &&
          value !== null &&
          "data" in value &&
          "execute" in value
        ) {
          commands.push((value as any).data.toJSON());
          break; // Only take the first valid command from each file
        }
      }
    } catch (error) {
      console.error(`⚠️  Failed to load command ${file}:`, error);
    }
  }

  console.log(`📋 Found ${commands.length} commands to deploy\n`);

  const results: DeployResult[] = [];

  for (const { name, clientId, token } of BOT_CONFIGS) {
    if (!clientId || !token) {
      console.log(`⚠️  Skipping ${name} (missing credentials)\n`);
      results.push({ bot: name, success: false, error: "Missing credentials" });
      continue;
    }

    try {
      console.log(`🚀 Deploying commands for ${name}...`);
      const rest = new REST().setToken(token);

      await rest.put(Routes.applicationCommands(clientId), { body: commands });

      console.log(
        `✅ Successfully deployed ${commands.length} commands for ${name}\n`
      );
      results.push({ bot: name, success: true, count: commands.length });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to deploy ${name}:`, errorMessage, "\n");
      results.push({ bot: name, success: false, error: errorMessage });
    }
  }

  // Write output file for Turbo cache
  const turboDir = join(__dirname, "../.turbo");
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
