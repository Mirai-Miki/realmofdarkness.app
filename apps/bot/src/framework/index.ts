/**
 * Framework Module
 *
 * This module provides the core infrastructure for the Discord bot.
 * It implements a View-First architecture where:
 * - Views define Interface Contracts (IDs + Schemas)
 * - Handlers implement the contracts
 * - The framework handles registration and routing
 *
 * @module framework
 */

// Base Classes
export {
  BaseInteractionHandler,
  CommandHandler,
  InterfaceHandler,
} from "./entities/interaction-handlers.entity";

// Event System
export { DiscordEvent, createEvent } from "./entities/discord-event.entity";

// Registry
export { Registry, registry } from "./registry";

// Router
export { InteractionRouter } from "./interaction-router";

// Loader
export { Loader, loader } from "./loader";
