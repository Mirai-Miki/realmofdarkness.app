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
import type { BotType, BotCommand, BotComponent, BotEvent } from "types";

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { logger } from "@realm/logger";
import { RealmError } from "@realm/common";
import type {
  GuildMember,
  User,
  CacheWithLimitsOptions,
  SweeperOptions,
} from "discord.js";
import {
  Client,
  GatewayIntentBits,
  Collection,
  Partials,
  Options,
} from "discord.js";
import {
  BotCommandSchema,
  BotComponentSchema,
  BotEventSchema,
} from "../types/bot.definitions";

// Load environment variables from root .env file
dotenv.config({
  path: path.resolve(__dirname, "../../../../.env"),
  quiet: true,
});

/**
 * Type-safe dynamic import helper for bot commands using Zod validation
 *
 * @param filePath - Absolute path to the command module file
 * @returns Validated BotCommand object or null if validation fails
 *
 * @remarks
 * This function dynamically imports a command module and validates its structure
 * against the BotCommandSchema using Zod. Invalid commands are logged but don't
 * stop the bot from starting.
 */
async function loadCommand(filePath: string): Promise<BotCommand | null> {
  try {
    const module = (await import(filePath)) as { default?: unknown } & Record<
      string,
      unknown
    >;
    const command = module.default ?? module;

    const result = BotCommandSchema.safeParse(command);
    if (result.success) {
      return command as BotCommand;
    } else {
      logger.warning(
        `Invalid command structure in ${filePath}: ${result.error.message}`
      );
      return null;
    }
  } catch (error) {
    logger.exception(`Failed to load command from ${filePath}`, error);
    return null;
  }
}

/**
 * Type-safe dynamic import helper for bot components using Zod validation
 *
 * @param filePath - Absolute path to the component module file
 * @returns Validated BotComponent object or null if validation fails
 *
 * @remarks
 * Components are interactive message elements (buttons, select menus, etc.)
 */
async function loadComponent(filePath: string): Promise<BotComponent | null> {
  try {
    const module = (await import(filePath)) as { default?: unknown } & Record<
      string,
      unknown
    >;
    const component = module.default ?? module;

    const result = BotComponentSchema.safeParse(component);
    if (result.success) {
      return component as BotComponent;
    } else {
      logger.warning(
        `Invalid component structure in ${filePath}: ${result.error.message}`
      );
      return null;
    }
  } catch (error) {
    logger.exception(`Failed to load component from ${filePath}`, error);
    return null;
  }
}

/**
 * Type-safe dynamic import helper for bot events using Zod validation
 *
 * @param filePath - Absolute path to the event module file
 * @returns Validated BotEvent object or null if validation fails
 *
 * @remarks
 * Events are Discord.js lifecycle and gateway events (ready, interactionCreate,
 * guildCreate, etc.) that the bot responds to.
 */
async function loadEvent(filePath: string): Promise<BotEvent | null> {
  try {
    const module = (await import(filePath)) as { default?: unknown } & Record<
      string,
      unknown
    >;
    const event = module.default ?? module;

    const result = BotEventSchema.safeParse(event);
    if (result.success) {
      return event as BotEvent;
    } else {
      logger.warning(
        `Invalid event structure in ${filePath}: ${result.error.message}`
      );
      return null;
    }
  } catch (error) {
    logger.exception(`Failed to load event from ${filePath}`, error);
    return null;
  }
}

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
  /** Path to command files */
  commandsPath: string;
  /** Path to component files */
  componentsPath: string;
  /** Whether this bot uses components (buttons, select menus) */
  hasComponents: boolean;
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
    intents: [GatewayIntentBits.Guilds],
    commandsPath: "interactions/commands/cod",
    componentsPath: "interactions/components/cod",
    hasComponents: false,
  },
  "5th": {
    token: process.env.TOKEN_5TH!,
    name: "5th Edition Bot",
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    commandsPath: "commands/5th",
    componentsPath: "components/5th",
    hasComponents: true,
  },
  "20th": {
    token: process.env.TOKEN_20TH!,
    name: "20th Anniversary Edition Bot",
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    commandsPath: "commands/20th",
    componentsPath: "components/20th",
    hasComponents: true,
  },
} as const;

// Get bot type and configuration
const botType = getBotType();
const config = BOT_CONFIG[botType];
logger.setAppName(config.name);

/**
 * Cache limit settings for Discord.js managers
 *
 * @remarks
 * These settings are passed to Options.cacheWithLimits() to create a cache factory.
 * This minimizes memory usage for bots serving thousands of guilds by aggressively
 * limiting what gets cached.
 *
 * Cache Strategy:
 * - Only cache users who are registered in our database
 * - Keep bot's own user/member always cached
 * - Use keepOverLimit to filter based on registration status
 * - Rely on sweepers to periodically clean up unregistered users
 *
 * @see {@link https://discord.js.org/docs/packages/discord.js/14.25.1/SweeperOptions:Interface | Sweeper Options}
 * @see {@link https://discordjs.guide/legacy/miscellaneous/cache-customization | Cache Customization Guide}
 */
const makeCacheSettings: CacheWithLimitsOptions = {
  // ===== Application Commands (keep small cache for quick lookups) =====
  ApplicationCommandManager: 10,

  // ===== Emojis (keep limited for command responses) =====
  ApplicationEmojiManager: 500,
  BaseGuildEmojiManager: 0, // Don't cache guild emojis separately
  GuildEmojiManager: 0, // Don't cache guild emojis separately

  // ===== Auto Moderation (not used by bot) =====
  AutoModerationRuleManager: 0,

  // ===== Messages (not needed - interaction-based only) =====
  MessageManager: 0,
  GuildMessageManager: 0,
  DMMessageManager: 0,

  // ===== Threads (not needed - slash commands don't use threads) =====
  ThreadManager: 0,
  GuildTextThreadManager: 0,
  GuildForumThreadManager: 0,
  ThreadMemberManager: 0,

  // ===== Reactions (not used) =====
  ReactionManager: 0,
  ReactionUserManager: 0,

  // ===== Voice & Presence (not needed) =====
  VoiceStateManager: 0,
  PresenceManager: 0,

  // ===== Stage Instances (not used) =====
  StageInstanceManager: 0,

  // ===== Bans (not needed - bot doesn't manage bans) =====
  GuildBanManager: 0,

  // ===== Invites (not needed) =====
  GuildInviteManager: 0,

  // ===== Scheduled Events (not needed) =====
  GuildScheduledEventManager: 0,

  // ===== Stickers (keep small cache for command responses) =====
  GuildStickerManager: 20,

  // ===== Entitlements (not used - no premium features via Discord) =====
  EntitlementManager: 0,

  // ===== Guild Members (minimal caching) =====
  // TODO: Implement registered user check in keepOverLimit
  GuildMemberManager: {
    maxSize: 1,
    keepOverLimit: (member: GuildMember) =>
      member.id === member.client.user?.id,
  },

  // ===== Users (minimal caching) =====
  // TODO: Implement registered user check in keepOverLimit
  UserManager: {
    maxSize: 1,
    keepOverLimit: (user: User) => user.id === user.client.user?.id,
  },

  // NOTE: The following managers CANNOT be customized (Discord.js limitation):
  // - GuildManager, ChannelManager, GuildChannelManager
  // - RoleManager, PermissionOverwriteManager
  // Attempting to customize these will break core functionality!
};

/**
 * Sweeper options to periodically clear caches
 *
 * @remarks
 * Sweepers run at intervals to remove stale cache entries, keeping memory usage low.
 * More aggressive sweeping = lower memory usage but more API calls.
 */
const sweeperOptions: SweeperOptions = {
  // Sweep guild members every 5 minutes - remove everything except bot
  // TODO: Implement registered user check in filter
  guildMembers: {
    interval: 300,
    filter: () => (member: GuildMember) => member.id !== member.client.user?.id,
  },
  // Sweep users every 10 minutes - remove everything except bot
  // TODO: Implement registered user check in filter
  users: {
    interval: 600,
    filter: () => (user: User) => user.id !== user.client.user?.id,
  },
  // Sweep threads every hour (default behavior, can be customized)
  threads: {
    interval: 3600, // Every hour
    lifetime: 14400, // Remove threads archived more than 4 hours ago
  },
};

// Initialize Discord client with bot-specific configuration and aggressive caching
const client = new Client({
  intents: config.intents,
  partials: [Partials.GuildMember, Partials.User],
  makeCache: Options.cacheWithLimits(makeCacheSettings),
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
 * Command Loading
 * ============================================================================
 * Dynamically loads slash command implementations from the file system.
 * Commands are organized by game system (cod/5th/20th) in separate directories.
 */
client.commands = new Collection<string, BotCommand>();
const commandsPath = path.join(process.cwd(), srcDir, config.commandsPath);

if (fs.existsSync(commandsPath)) {
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await loadCommand(filePath);

    if (command) {
      client.commands.set(command.data.name, command);
      logger.debug(`Loaded command: ${command.data.name}`);
    } else {
      logger.warning(`Failed to load command from file: ${file}`);
    }
  }
} else {
  logger.error(`Commands directory not found: ${commandsPath}`);
  process.exit(1);
}

/* ============================================================================
 * Component Loading (5th/20th bots only)
 * ============================================================================
 * Loads interactive message components (buttons, select menus, modals).
 * Components have custom IDs that can include data separated by pipes (|).
 */
client.components = new Collection<string, BotComponent>();

if (config.hasComponents) {
  const componentsPath = path.join(
    process.cwd(),
    srcDir,
    config.componentsPath
  );

  if (fs.existsSync(componentsPath)) {
    const componentFiles = fs
      .readdirSync(componentsPath)
      .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

    for (const file of componentFiles) {
      const filePath = path.join(componentsPath, file);
      const component = await loadComponent(filePath);

      if (component) {
        client.components.set(component.name, component);
        logger.debug(`Loaded component: ${component.name}`);
      } else {
        logger.warning(`Failed to load component from file: ${file}`);
      }
    }
  } else {
    logger.warning(`Components directory not found: ${componentsPath}`);
  }
}

/* ============================================================================
 * Event Listeners
 * ============================================================================
 * Loads Discord.js event handlers for lifecycle and gateway events.
 * Events can be configured to run once (e.g., ClientReady) or repeatedly.
 */
const eventsPath = path.join(process.cwd(), srcDir, "discord-events");

if (fs.existsSync(eventsPath)) {
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await loadEvent(filePath);

    if (event) {
      if (event.once) {
        client.once(event.name, (...args: Parameters<typeof event.execute>) => {
          Promise.resolve(event.execute(...args)).catch((error) => {
            logger.exception(`Event ${event.name} execution failed`, error);
          });
        });
      } else {
        client.on(event.name, (...args: Parameters<typeof event.execute>) => {
          Promise.resolve(event.execute(...args)).catch((error) => {
            logger.exception(`Event ${event.name} execution failed`, error);
          });
        });
      }
      logger.debug(`Loaded event: ${event.name}`);
    } else {
      logger.warning(`Failed to load event from file: ${file}`);
    }
  }
} else {
  logger.error(`Events directory not found: ${eventsPath}`);
  process.exit(1);
}

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
