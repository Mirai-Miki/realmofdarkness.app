/**
 * Chronicles of Darkness Discord Bot
 *
 * This bot handles commands and interactions for the CoD game system,
 * providing dice rolling, character management, and other utilities.
 */
"use strict";
require(`${process.cwd()}/alias`);
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { handleErrorDebug } = require("@errors");
const {
  Client,
  GatewayIntentBits,
  Collection,
  Partials,
} = require("discord.js");

// Load environment variables
dotenv.config();

// Determine environment and source directory
const runningFromDist = process.env.NODE_ENV !== "development";
const srcDir = runningFromDist ? "dist" : "src";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.GuildMember, Partials.User],
});

/* Loading Commands in Client */
client.commands = new Collection();
const commandsPath = path.join(process.cwd(), srcDir, "commands", "cod");
if (!fs.existsSync(commandsPath)) {
  console.error(`Commands directory not found: ${commandsPath}`);
  process.exit(1);
}

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of commandFiles) {
  try {
    const command = require(`@commands/cod/${file}`);
    if (command.data) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`Command ${file} is missing data property`);
    }
  } catch (error) {
    console.error(`Failed to load command from ${file}:`, error);
  }
}

/* Event Listeners */
const eventsPath = path.join(process.cwd(), srcDir, "events");
if (!fs.existsSync(eventsPath)) {
  console.error(`Events directory not found: ${eventsPath}`);
  process.exit(1);
}

const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of eventFiles) {
  try {
    const event = require(`@events/${file}`);
    if (event.name) {
      if (event.once) {
        client.once(event.name, async (...args) => {
          try {
            await event.execute(...args);
          } catch (error) {
            await handleErrorDebug(error, client);
          }
        });
      } else {
        client.on(event.name, async (...args) => {
          try {
            await event.execute(...args);
          } catch (error) {
            await handleErrorDebug(error, client);
          }
        });
      }
    } else {
      console.warn(`Event ${file} is missing a name property`);
    }
  } catch (error) {
    console.error(`Failed to load event ${file}:`, error);
  }
}

// Signal successful initialization
client.on("ready", () => {
  console.log(
    `Connected as: ${client.user.tag} || Shard: ${client.shard?.ids} || Guilds: ${client.guilds.cache.size}`
  );
});

// Log in to Discord using token from environment variables
client.login(process.env.TOKEN_COD).catch((error) => {
  console.error("Failed to log in to Discord:", error);
  process.exit(1);
});
