import { REST, Routes } from "discord.js";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { config } from "dotenv";
import { resolve } from "path";
import { loader } from "../src/framework/loader";

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

const BOT_CONFIGS: BotConfig[] = [
  {
    name: "WoD 5th Edition",
    clientId: process.env.CLIENT_ID_5TH,
    token: process.env.TOKEN_5TH,
  },
  {
    name: "WoD 20th Anniversary",
    clientId: process.env.CLIENT_ID_20TH,
    token: process.env.TOKEN_20TH,
  },
  {
    name: "Chronicles of Darkness",
    clientId: process.env.CLIENT_ID_COD,
    token: process.env.TOKEN_COD,
  },
];

async function deployCommands(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║         Discord Command Deployment (Global)              ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const featuresPath = join(process.cwd(), "./src/features");

  // Use loader to scan for command handlers (DRY - same logic as runtime)
  const commandHandlers = await loader.scanCommandHandlers(featuresPath);

  console.log(`📋 Found ${commandHandlers.length} total commands\n`);

  // Extract command data for deployment
  const allCommands = commandHandlers.map((handler) => handler.data.toJSON());

  const results: DeployResult[] = [];

  // Note: Currently deploying all commands to all bots
  // TODO: Implement bot-specific command filtering when we have multiple bot types
  for (const { name, clientId, token } of BOT_CONFIGS) {
    if (!clientId || !token) {
      console.log(`⚠️  Skipping ${name} (missing credentials)\n`);
      results.push({ bot: name, success: false, error: "Missing credentials" });
      continue;
    }

    console.log(`🤖 ${name}: Deploying ${allCommands.length} commands`);

    try {
      const rest = new REST().setToken(token);

      await rest.put(Routes.applicationCommands(clientId), {
        body: allCommands,
      });

      console.log(
        `✅ Successfully deployed ${allCommands.length} commands for ${name}\n`
      );
      results.push({ bot: name, success: true, count: allCommands.length });
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

deployCommands().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
