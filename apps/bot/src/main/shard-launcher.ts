/**
 * Unified Shard Launcher
 *
 * Launches Discord bot shards for one or more bot types:
 * - Chronicles of Darkness (cod)
 * - World of Darkness 5th Edition (5th)
 * - World of Darkness 20th Anniversary Edition (20th)
 *
 * @remarks
 * This launcher can spawn multiple ShardingManagers in a single process.
 * Each manager handles shards for one bot type. Pass bot types as arguments:
 * - `node shard-launcher.js cod 5th 20th` - Start all three bots
 * - `node shard-launcher.js 5th` - Start only 5th edition bot
 * - `node shard-launcher.js` - Start all bots (default)
 */
import * as path from "path";
import { ShardingManager } from "discord.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { logger } from "@realm/logger";
import { BotTypes } from "../types/bot.definitions.js";
import type { BotType } from "../types/bot.definitions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env
dotenv.config({
  path: path.join(process.cwd(), "../../.env"),
  quiet: true,
});

logger.setAppName("shard-launcher");

/**
 * Configuration for a specific bot instance.
 */
interface BotConfig {
  /** Bot type identifier */
  type: BotType;
  /** Discord bot token from environment variables */
  token: string;
  /** Human-readable name for logging */
  name: string;
}

/**
 * Configuration mapping for all bot types.
 * Each bot type has its own Discord token and display name.
 */
const BOT_CONFIGS: BotConfig[] = [
  {
    type: BotTypes.Cod,
    token: process.env.TOKEN_COD!,
    name: "Chronicles of Darkness",
  },
  {
    type: BotTypes.Wod5,
    token: process.env.TOKEN_5TH!,
    name: "World of Darkness 5th Edition",
  },
  {
    type: BotTypes.Wod20,
    token: process.env.TOKEN_20TH!,
    name: "World of Darkness 20th Anniversary",
  },
];

/**
 * Parses and validates bot types from command line arguments.
 *
 * @returns Array of validated bot types to launch
 * @remarks If no arguments provided, returns all bot types
 */
function getBotTypes(): BotType[] {
  const args = process.argv.slice(2);

  // No arguments = launch all bots
  if (args.length === 0) {
    logger.info("No bot types specified, launching all bots");
    return [BotTypes.Cod, BotTypes.Wod5, BotTypes.Wod20];
  }

  // Validate each argument
  const validTypes = [BotTypes.Cod, BotTypes.Wod5, BotTypes.Wod20];
  const requestedTypes: BotType[] = [];

  for (const arg of args) {
    if (!validTypes.includes(arg as BotType)) {
      logger.error(`Invalid bot type: ${arg}`);
      logger.info("Valid bot types: cod, 5th, 20th");
      process.exit(1);
    }
    requestedTypes.push(arg as BotType);
  }

  return requestedTypes;
}

/**
 * Creates and configures a ShardingManager for a specific bot type.
 *
 * @param config - Bot configuration (type, token, name)
 * @returns Configured ShardingManager instance
 */
function createShardManager(config: BotConfig): ShardingManager {
  const isDev = process.env.NODE_ENV === "development";
  const fileExtension = isDev ? "ts" : "js";
  const botFile = path.join(__dirname, `bot.${fileExtension}`);

  logger.info(`Creating shard manager for ${config.name}...`);

  const manager = new ShardingManager(botFile, {
    token: config.token,
    totalShards: "auto",
    shardArgs: [config.type], // Pass bot type to each shard
    execArgv: isDev ? ["--import", "tsx"] : ["ts-node/register"],
  });

  // Set up event handlers
  manager.on("shardCreate", (shard) => {
    logger.info(`[${config.name}] Launched shard ${shard.id}`);

    shard.on("error", (error) => {
      logger.exception(`[${config.name}] Error in shard ${shard.id}:`, error);
    });

    shard.on("ready", () => {
      logger.info(`[${config.name}] Shard ${shard.id} is ready`);
    });

    shard.on("disconnect", () => {
      logger.warning(`[${config.name}] Shard ${shard.id} disconnected`);
    });

    shard.on("reconnecting", () => {
      logger.info(`[${config.name}] Shard ${shard.id} reconnecting`);
    });

    shard.on("death", () => {
      logger.error(`[${config.name}] Shard ${shard.id} died`);
    });
  });

  return manager;
}

/**
 * Main launcher function.
 * Creates and spawns ShardingManagers for all requested bot types.
 */
async function main(): Promise<void> {
  const requestedTypes = getBotTypes();
  const managers: ShardingManager[] = [];

  logger.info(`Starting ${requestedTypes.length} bot(s)...`);

  // Create managers for requested bot types
  for (const botType of requestedTypes) {
    const config = BOT_CONFIGS.find((c) => c.type === botType);

    if (!config) {
      logger.error(`Configuration not found for bot type: ${botType}`);
      continue;
    }

    // Validate token exists
    if (!config.token) {
      logger.error(
        `Missing token for ${config.name} (TOKEN_${botType.toUpperCase()})`
      );
      logger.error(`Skipping ${config.name}...`);
      continue;
    }

    const manager = createShardManager(config);
    managers.push(manager);
  }

  // Spawn all managers
  if (managers.length === 0) {
    logger.error("No valid bot configurations found. Exiting.");
    process.exit(1);
  }

  try {
    await Promise.all(managers.map((manager) => manager.spawn()));
    logger.info(`Successfully launched ${managers.length} bot manager(s)`);
  } catch (error) {
    logger.exception("Error while spawning shard managers:", error);
    process.exit(1);
  }

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down gracefully...");
    for (const manager of managers) {
      for (const shard of manager.shards.values()) {
        shard.kill();
      }
    }
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, shutting down gracefully...");
    for (const manager of managers) {
      for (const shard of manager.shards.values()) {
        shard.kill();
      }
    }
    process.exit(0);
  });
}

// Start the launcher
main().catch((error) => {
  logger.exception("Fatal error in shard launcher:", error);
  process.exit(1);
});
