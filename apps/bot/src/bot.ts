/**
 * Unified Discord Bot Entry Point
 *
 * This unified bot handles commands and interactions for all game systems.
 *
 * @remarks
 * This bot is designed to handle thousands of guilds with minimal memory footprint
 * by using aggressive cache management. It primarily responds to slash command
 * interactions and does not require extensive caching of guild members, channels,
 * messages, or other Discord entities.
 *
 * @see {@link https://discord.js.org/docs/packages/discord.js/14.25.1/Client:Class#options | Discord.js Client Options}
 */
import * as path from "path";
import * as dotenv from "dotenv";
import { logger } from "@realm/logger";
import { loader } from "framework";
import { cacheSettings, sweeperOptions } from "framework/client.config";
import { Client, GatewayIntentBits, Partials, Options } from "discord.js";

// Load environment variables from root .env file
dotenv.config({
  path: path.join(process.cwd(), "../../.env"),
  quiet: true,
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  logger.error("Missing DISCORD_TOKEN environment variable");
  process.exit(1);
}

const botName = "Realm of Darkness Bot";
logger.setAppName(botName);

// Initialize Discord client with aggressive caching
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember, Partials.User],
  makeCache: Options.cacheWithLimits(cacheSettings),
  sweepers: sweeperOptions,
  // Don't wait for guild data to be ready (faster startup)
  waitGuildTimeout: 0,
  // Reduce REST request timeout for faster failures
  rest: {
    timeout: 15_000, // 15 seconds
  },
});

// Determine environment and source directory
const runningFromDist = process.env.NODE_ENV !== "development";
const srcDir = runningFromDist ? "dist" : "src";

/* ============================================================================
 * Framework Initialization
 * ============================================================================
 * Load interaction handlers and Discord events using the framework loader.
 * The loader scans for *.handlers.ts and *.event.ts files and registers them.
 */
// Load interaction handlers (commands, buttons, modals, etc.)
await loader.loadInteractionHandlers(path.join(process.cwd(), srcDir));

// Load Discord events (ready, interactionCreate, etc.)
await loader.loadDiscordEvents(path.join(process.cwd(), srcDir), client);

/* ============================================================================
 * Discord Authentication
 * ============================================================================
 * Authenticates with Discord using the bot token.
 * The token is loaded from the DISCORD_TOKEN environment variable.
 */
client.login(token).catch((error) => {
  if (error instanceof Error)
    logger.error(`Failed to log in ${botName} to Discord:`, { error });
  process.exit(1);
});
