/**
 * Bot Shard Launcher
 *
 * Launches Discord bot shards for the unified bot application.
 *
 * @remarks
 * This launcher spawns a single ShardingManager that handles all
 * commands for all supported game ecosystems.
 */
import * as path from "path";
import { ShardingManager } from "discord.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { logger } from "@realm/logger";
import { SystemRepository } from "@realm/repositories";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env
dotenv.config({
  path: path.join(process.cwd(), "../../.env"),
  quiet: true,
});

logger.setAppName("shard-launcher");

/**
 * Creates and configures a ShardingManager for the bot.
 *
 * @returns Configured ShardingManager instance
 */
function createShardManager(): ShardingManager {
  const isDev = process.env.NODE_ENV === "development";
  const fileExtension = isDev ? "ts" : "js";
  const botFile = path.join(__dirname, `bot.${fileExtension}`);

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error("Missing DISCORD_TOKEN environment variable");
  }

  logger.info(`Creating shard manager...`);

  const manager = new ShardingManager(botFile, {
    token: token,
    totalShards: "auto",
    execArgv: isDev ? ["--import", "tsx"] : ["ts-node/register"],
  });

  // Set up event handlers
  manager.on("shardCreate", (shard) => {
    logger.info(`Launched shard ${shard.id}`);

    shard.on("error", (error) => {
      logger.exception(`Error in shard ${shard.id}:`, error);
    });

    shard.on("ready", () => {
      logger.info(`Shard ${shard.id} is ready`);
    });

    shard.on("disconnect", () => {
      logger.warn(`Shard ${shard.id} disconnected`);
    });

    shard.on("reconnecting", () => {
      logger.info(`Shard ${shard.id} reconnecting`);
    });

    shard.on("death", () => {
      logger.info(`Shard ${shard.id} died`);
    });
  });

  return manager;
}

/**
 * Main launcher function.
 * Creates and spawns the ShardingManager for the bot.
 */
async function main(): Promise<void> {
  const systemRepo = new SystemRepository();
  const isDbHealthy = await systemRepo.healthCheck();

  if (!isDbHealthy) {
    throw new Error("Failed to connect to the database.");
  }

  const manager = createShardManager();

  logger.info(`Starting bot manager...`);

  await manager.spawn();
  logger.info(`Successfully launched bot manager!`);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down gracefully...");
    for (const shard of manager.shards.values()) {
      shard.kill();
    }
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, shutting down gracefully...");
    for (const shard of manager.shards.values()) {
      shard.kill();
    }
    process.exit(0);
  });
}

// Start the launcher
main().catch(async (error) => {
  logger.fatal("Fatal error in shard launcher:", { error });
  // Allow async discord logger time to send the HTTP request before exiting
  await new Promise((resolve) => setTimeout(resolve, 4000));
  process.exit(1);
});
