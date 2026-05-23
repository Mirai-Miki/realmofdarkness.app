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
export { InteractionRouter } from "./interaction-router/interaction-router";

// Interaction Context
export {
  parseHandlerIdFromCustomId,
  type BaseInteractionContext,
  type CommandContext,
  type InterfaceContext,
  type AutocompleteContext,
  type ContextMenuContext,
} from "./interaction-router/interaction-context";

// Middleware
export {
  composeMiddleware,
  type InteractionMiddleware,
} from "./interaction-router/interaction-middleware";

// Loader
export { Loader, loader } from "./loader";
