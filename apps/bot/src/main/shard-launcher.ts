/**
 * Unified Shard Launcher
 *
 * Launches Discord bot shards for any of the three bot types:
 * - Chronicles of Darkness (cod)
 * - World of Darkness 5th Edition (5th)
 * - World of Darkness 20th Anniversary Edition (20th)
 *
 * @remarks
 * This launcher uses Discord.js ShardingManager to automatically spawn
 * and manage multiple bot shards for horizontal scaling. Shards are
 * automatically distributed based on Discord's recommended shard count.
 */
import * as path from "path";
import { ShardingManager } from "discord.js";
import * as dotenv from "dotenv";

import { logger } from "@realm/logger";

// Load environment variables
dotenv.config();

/**
 * Supported bot types for the World of Darkness platform.
 * Each bot type corresponds to a different game system.
 */
type BotType = "cod" | "5th" | "20th";

/**
 * Configuration for a specific bot instance.
 */
interface BotConfig {
  /** Discord bot token from environment variables */
  token: string;
  /** Human-readable name for logging */
  name: string;
}

/**
 * Configuration mapping for all bot types.
 * Each bot type has its own Discord token and display name.
 */
const BOT_CONFIG: Record<BotType, BotConfig> = {
  cod: {
    token: process.env.TOKEN_COD!,
    name: "Chronicles of Darkness",
  },
  "5th": {
    token: process.env.TOKEN_5TH!,
    name: "5th Edition",
  },
  "20th": {
    token: process.env.TOKEN_20TH!,
    name: "20th Anniversary Edition",
  },
};

// Get bot type from command line arguments
/**
 * Parses and validates the bot type from command line arguments.
 *
 * @returns The validated bot type ("cod", "5th", or "20th")
 * @throws Exits the process with code 1 if no argument is provided or invalid bot type
 */
function getBotType(): BotType {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Bot type must be specified as command line argument");
    console.error("Usage: node shardLauncher.js <cod|5th|20th>");
    process.exit(1);
  }

  const botType = args[0] as BotType;
  if (!["cod", "5th", "20th"].includes(botType)) {
    console.error(`Invalid bot type: ${botType}`);
    console.error("Valid bot types: cod, 5th, 20th");
    process.exit(1);
  }

  return botType;
}

// Determine environment and file extension
const isDev: boolean = process.env.NODE_ENV === "development";
const fileExtension: string = isDev ? "ts" : "js";
const botType = getBotType();
const config = BOT_CONFIG[botType];

// Validate token exists
if (!config.token) {
  logger.error(
    `Missing token for ${config.name} (TOKEN_${botType.toUpperCase()})`
  );
  process.exit(1);
}

logger.info(`Starting ${config.name} shard manager...`);

// Path to the unified bot file
const botFile: string = path.join(__dirname, `bot.${fileExtension}`);

// Create shard manager
const manager = new ShardingManager(botFile, {
  token: config.token,
  totalShards: "auto",
  shardArgs: [botType], // Pass bot type as argument to the bot
  execArgv: isDev ? ["--require", "ts-node/register"] : [],
});

// Event handlers
manager.on("shardCreate", (shard) => {
  logger.info(`Launched ${config.name} shard ${shard.id}`);

  shard.on("error", (error) => {
    logger.exception(`Error in ${config.name} shard ${shard.id}:`, error);
  });

  shard.on("ready", () => {
    logger.info(`${config.name} shard ${shard.id} is ready`);
  });

  shard.on("disconnect", () => {
    logger.info(`${config.name} shard ${shard.id} disconnected`);
  });

  shard.on("reconnecting", () => {
    logger.info(`${config.name} shard ${shard.id} reconnecting`);
  });
});

// Start the shards
manager.spawn().catch((error) => {
  console.error(`Error while spawning ${config.name} shards:`, error);
  process.exit(1);
});
