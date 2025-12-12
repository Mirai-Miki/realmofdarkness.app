import type { z } from "zod";
import type { Snowflake } from "./primitives/index.js";

/**
 * Event client interface for the Realm of Darkness application.
 * Defines the contract for pub/sub event communication.
 *
 * This interface provides a clean abstraction layer, allowing:
 * - Easy testing with mock event clients
 * - Swappable event implementations (Redis, RabbitMQ, in-memory, etc.)
 * - No dependency on specific pub/sub libraries in business logic
 *
 * @packageDocumentation
 */

/**
 * Scope information for determining which hierarchical channels to publish to.
 */
export interface PublishScope {
  /** Character ID (for character events) */
  characterId?: Snowflake;
  /** Guild ID (for character, guild, or member events) */
  guildId?: Snowflake;
  /** User ID (for user events) */
  userId?: Snowflake;
  /** Member ID (for specific member events) */
  memberId?: Snowflake;
}

/**
 * Metadata overrides for event publishing.
 *
 * **Use Case: Metadata Injection (Loopback Prevention)**
 *
 * Repositories publish events, but need to masquerade as the original source
 * (e.g., WebSocket connection, bot shard) to prevent loopback.
 */
export interface MetadataOverrides {
  /** Override publisherId (for loopback prevention) */
  publisherId?: string;
  /** Override actorId (user who triggered the action) */
  actorId?: string;
  /** Correlation ID for tracing */
  correlationId?: string;
}

/**
 * Handler function for subscription callbacks.
 */
export type EventHandler<T> = (event: T) => void | Promise<void>;

/**
 * Event client interface contract.
 *
 * Implementations must provide:
 * - Connection management
 * - Type-safe event publishing with schema validation
 * - Channel subscriptions (exact match and pattern matching)
 * - Automatic self-filtering (don't receive own events)
 * - Graceful disconnection
 *
 * @example
 * ```typescript
 * // In business logic (depends only on interface)
 * import type { IEventClient } from '@realm/common';
 * import { CharacterUpdatedEventSchema } from '@realm/common';
 *
 * class CharacterRepository {
 *   constructor(private events: IEventClient) {}
 *
 *   async save(character: Character, options: SaveOptions) {
 *     // ... persist to database ...
 *
 *     await this.events.publish(
 *       'realm:character:updated',
 *       CharacterUpdatedEventSchema,
 *       { type: 'character:updated', data: character.toDTO() },
 *       { characterId: character.id },
 *       { publisherId: options.sourceId }
 *     );
 *   }
 * }
 *
 * // In application assembly (uses concrete implementation)
 * import { EventClient } from '@realm/events';
 * const eventClient = new EventClient();
 * const repo = new CharacterRepository(eventClient);
 * ```
 */
export interface IEventClient {
  /**
   * Connect to the event system.
   */
  connect(): Promise<void>;

  /**
   * Publish an event to hierarchical channels automatically.
   *
   * @param baseChannel - Base channel name
   * @param schema - Zod schema for validation
   * @param event - Event data (without metadata)
   * @param scope - Scope information to determine which channels to publish to
   * @param metadataOverrides - Optional metadata overrides (publisherId, actorId, correlationId)
   * @returns Array of channels published to
   */
  publish<T>(
    baseChannel: string,
    schema: z.ZodSchema<T>,
    event: Omit<T, "metadata">,
    scope: PublishScope,
    metadataOverrides?: MetadataOverrides
  ): Promise<string[]>;

  /**
   * Subscribe to a specific channel (exact match).
   *
   * @param channel - Channel name
   * @param schema - Zod schema for validation
   * @param handler - Callback function for events
   */
  subscribe<T>(
    channel: string,
    schema: z.ZodSchema<T>,
    handler: EventHandler<T>
  ): void;

  /**
   * Subscribe to a channel pattern (wildcard support).
   *
   * @param pattern - Channel pattern (e.g., "realm:character:*:guild:456")
   * @param schema - Zod schema for validation
   * @param handler - Callback function for events
   */
  subscribePattern<T>(
    pattern: string,
    schema: z.ZodSchema<T>,
    handler: EventHandler<T>
  ): void;

  /**
   * Unsubscribe from a channel or pattern.
   *
   * @param channelOrPattern - Channel name or pattern to unsubscribe from
   */
  unsubscribe(channelOrPattern: string): Promise<void>;

  /**
   * Disconnect from the event system and clean up resources.
   */
  disconnect(): Promise<void>;
}
