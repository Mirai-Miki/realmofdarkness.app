/**
 * Unified Shard Launcher
 *
 * Launches Discord bot shards for any of the three bot types:
 * - Chronicles of Darkness (cod)
 * - World of Darkness 5th Edition (5th)
 * - World of Darkness 20th Anniversary Edition (20th)
 */
import * as path from "path";
import { ShardingManager } from "discord.js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Bot type configuration
type BotType = "cod" | "5th" | "20th";

interface BotConfig {
  token: string;
  name: string;
}

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

console.log(`Starting ${config.name} shard manager...`);

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
  console.log(`Launched ${config.name} shard ${shard.id}`);

  shard.on("error", (error) => {
    console.error(`Error in ${config.name} shard ${shard.id}:`, error);
  });

  shard.on("ready", () => {
    console.log(`${config.name} shard ${shard.id} is ready`);
  });

  shard.on("disconnect", () => {
    console.log(`${config.name} shard ${shard.id} disconnected`);
  });

  shard.on("reconnecting", () => {
    console.log(`${config.name} shard ${shard.id} reconnecting`);
  });
});

// Start the shards
manager.spawn().catch((error) => {
  console.error(`Error while spawning ${config.name} shards:`, error);
  process.exit(1);
});
