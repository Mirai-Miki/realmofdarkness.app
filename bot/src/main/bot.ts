/**
 * Unified Discord Bot Entry Point
 *
 * This unified bot handles commands and interactions for all game systems:
 * - Chronicles of Darkness (CoD)
 * - World of Darkness 5th Edition (V5)
 * - World of Darkness 20th Anniversary Edition (V20)
 */
import type { BotType, BotCommand, BotComponent, BotEvent } from "types";

import "shared/utils/source-maps";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { Logging } from "shared/logger";
import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import {
  BotCommandSchema,
  BotComponentSchema,
  BotEventSchema,
} from "validations";

// Load environment variables
dotenv.config();

const logger = Logging.getLogger();
const location = {
  location: "main/bot.ts",
};

/**
 * Type-safe dynamic import helper for bot commands using Zod validation
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
      return result.data as BotCommand;
    } else {
      logger.warn(
        `Invalid command structure in ${filePath}: ${result.error.message}`,
        location
      );
      return null;
    }
  } catch (error) {
    logger.error(`Failed to load command from ${filePath}`, {
      error: error instanceof Error ? error : new Error(String(error)),
      ...location,
    });
    return null;
  }
}

/**
 * Type-safe dynamic import helper for bot components using Zod validation
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
      return result.data as BotComponent;
    } else {
      logger.warn(
        `Invalid component structure in ${filePath}: ${result.error.message}`,
        location
      );
      return null;
    }
  } catch (error) {
    logger.error(`Failed to load component from ${filePath}`, {
      error: error instanceof Error ? error : new Error(String(error)),
      ...location,
    });
    return null;
  }
}

/**
 * Type-safe dynamic import helper for bot events using Zod validation
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
      return result.data as BotEvent;
    } else {
      logger.warn(
        `Invalid event structure in ${filePath}: ${result.error.message}`,
        location
      );
      return null;
    }
  } catch (error) {
    logger.error(`Failed to load event from ${filePath}`, {
      error: error instanceof Error ? error : new Error(String(error)),
      ...location,
    });
    return null;
  }
}

// Determine bot type from environment variable or command line argument
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

  throw new Error(
    "Bot type must be specified via BOT_TYPE environment variable or command line argument"
  );
};

// Bot configuration
const BOT_CONFIG = {
  cod: {
    token: process.env.TOKEN_COD!,
    name: "Chronicles of Darkness Bot",
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    commandsPath: "commands/cod",
    componentsPath: "components/cod",
    hasComponents: false,
  },
  "5th": {
    token: process.env.TOKEN_5TH!,
    name: "5th Edition Bot",
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessages,
    ],
    commandsPath: "commands/5th",
    componentsPath: "components/5th",
    hasComponents: true,
  },
  "20th": {
    token: process.env.TOKEN_20TH!,
    name: "20th Anniversary Edition Bot",
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessages,
    ],
    commandsPath: "commands/20th",
    componentsPath: "components/20th",
    hasComponents: true,
  },
} as const;

// Determine environment and source directory
const runningFromDist = process.env.NODE_ENV !== "development";
const srcDir = runningFromDist ? "dist" : "src";

// Get bot type and configuration
const botType = getBotType();
const config = BOT_CONFIG[botType];
logger.setAppName(config.name);

// Initialize Discord client with bot-specific configuration
const client = new Client({
  intents: config.intents,
  partials: [Partials.GuildMember, Partials.User],
});

/* Loading Command Interaction in Client */
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
      logger.debug(`Loaded command: ${command.data.name}`, location);
    } else {
      logger.warn(`Failed to load command from file: ${file}`, location);
    }
  }
} else {
  logger.error(`Commands directory not found: ${commandsPath}`, location);
  process.exit(1);
}

/* Loading Component Interactions in Client (for bots that support them) */
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
        logger.debug(`Loaded component: ${component.name}`, location);
      } else {
        logger.warn(`Failed to load component from file: ${file}`, location);
      }
    }
  } else {
    logger.warn(`Components directory not found: ${componentsPath}`, location);
  }
}

/* Event Listeners */
const eventsPath = path.join(process.cwd(), srcDir, "events");

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
          try {
            // Execute the event handler
            void event.execute(...args);
          } catch (error) {
            if (error instanceof Error)
              logger.error(`Event ${event.name} execution failed`, { error });
          }
        });
      } else {
        client.on(event.name, (...args: Parameters<typeof event.execute>) => {
          try {
            // Execute the event handler
            void event.execute(...args);
          } catch (error) {
            if (error instanceof Error)
              logger.error(`Event ${event.name} execution failed`, { error });
          }
        });
      }
      logger.debug(`Loaded event: ${event.name}`, location);
    } else {
      logger.warn(`Failed to load event from file: ${file}`, location);
    }
  }
} else {
  logger.error(`Events directory not found: ${eventsPath}`);
  process.exit(1);
}

// Log in to Discord using bot-specific token
client.login(config.token).catch((error) => {
  if (error instanceof Error)
    logger.error(`Failed to log in ${config.name} to Discord:`, { error });
  process.exit(1);
});
