"use strict";
const path = require("path");
const { ShardingManager } = require("discord.js");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Determine environment and file extension
const isDev = process.env.NODE_ENV === "development";
const rootDir = isDev ? "src" : "dist";
const botFile = path.join(__dirname, "..", "bots", "cod-bot.js");

const manager = new ShardingManager(botFile, {
  token: process.env.TOKEN_COD,
  totalShards: "auto",
});

manager.on("shardCreate", (shard) => {
  console.log(`Launched shard ${shard.id}`);
  shard.on("error", (error) => {
    console.error(`Error in shard ${shard.id}:`, error);
  });
});

manager.spawn().catch((error) => {
  console.error("Error while spawning shards:", error);
});
