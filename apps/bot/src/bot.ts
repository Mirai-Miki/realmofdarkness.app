/**
 * Unified Discord Bot Entry Point
 *
 * This unified bot handles commands and interactions for all game systems:
 * - Chronicles of Darkness (CoD)
 * - World of Darkness 5th Edition (V5)
 * - World of Darkness 20th Anniversary Edition (V20)
 *
 * @remarks
 * This bot is designed to handle thousands of guilds with minimal memory footprint
 * by using aggressive cache management. It primarily responds to slash command
 * interactions and does not require extensive caching of guild members, channels,
 * messages, or other Discord entities.
 *
 * @see {@link https://discord.js.org/docs/packages/discord.js/14.25.1/Client:Class#options | Discord.js Client Options}
 */
import type { BotType } from "types";

import * as path from "path";
import * as dotenv from "dotenv";
import { logger } from "@realm/logger";
import { RealmError } from "@realm/common";
import { loader } from "framework";
import { cacheSettings, sweeperOptions } from "framework/client.config";
import { Client, GatewayIntentBits, Partials, Options } from "discord.js";

// Load environment variables from root .env file
dotenv.config({
  path: path.join(process.cwd(), "../../.env"),
  quiet: true,
});

/**
 * Determines the bot type from environment variables or command line arguments
 *
 * @returns The bot type ('cod', '5th', or '20th')
 * @throws {RealmError} If bot type is not specified or invalid
 */
const getBotType = (): BotType => {
  // Check environment variable first
  if (process.env.BOT_TYPE) {
    return process.env.BOT_TYPE as BotType;
  }

  // Check command line arguments
  const args = process.argv.slice(2);
  if (args.length > 0 && ["cod", "5th", "20th"].includes(args[0])) {
    return args[0] as BotType;
  }

  throw new RealmError(
    "Bot type must be specified via BOT_TYPE environment variable or command line argument"
  );
};

/**
 * Configuration for a single bot instance
 */
interface BotConfig {
  /** Discord bot token */
  token: string;
  /** Human-readable bot name */
  name: string;
  /** Gateway intents required for this bot */
  intents: GatewayIntentBits[];
}

/**
 * Bot configuration for each game system
 *
 * @remarks
 * Each bot has different requirements:
 * - CoD: Minimal intents, no components
 * - 5th/20th: Require GuildMembers intent for user tracking, use components
 */
const BOT_CONFIG: Record<BotType, BotConfig> = {
  cod: {
    token: process.env.TOKEN_COD!,
    name: "Chronicles of Darkness Bot",
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  },
  "5th": {
    token: process.env.TOKEN_5TH!,
    name: "5th Edition Bot",
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  },
  "20th": {
    token: process.env.TOKEN_20TH!,
    name: "20th Anniversary Edition Bot",
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  },
} as const;

// Get bot type and configuration
const botType = getBotType();
const config = BOT_CONFIG[botType];
logger.setAppName(config.name);

// Initialize Discord client with bot-specific configuration and aggressive caching
const client = new Client({
  intents: config.intents,
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
 * Authenticates with Discord using the bot token for the selected game system.
 * The token is loaded from environment variables (TOKEN_COD, TOKEN_5TH, TOKEN_20TH).
 */
client.login(config.token).catch((error) => {
  if (error instanceof Error)
    logger.error(`Failed to log in ${config.name} to Discord:`, { error });
  process.exit(1);
});
