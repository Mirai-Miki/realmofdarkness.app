import { Redis, type RedisOptions } from "ioredis";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import type { ILogger, Snowflake } from "@realm/common";
import { RealmError } from "@realm/common";
import type { ChannelName } from "../channels";
import {
  buildCharacterChannel,
  buildGuildChannel,
  buildMemberChannel,
  buildUserChannel,
} from "../channels/index.js";
import { EventMetadataSchema } from "../contracts/base-event";

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
 *
 * @example
 * ```typescript
 * // In Repository:
 * await eventClient.publish(
 *   Channels.CHARACTER_UPDATED,
 *   schema,
 *   event,
 *   { characterId: "123" },
 *   { publisherId: options.sourceId }  // Masquerade as socket/shard
 * );
 * ```
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
 * Internal subscription metadata.
 */
interface Subscription<T = unknown> {
  channel: string;
  schema: z.ZodSchema<T>;
  handler: EventHandler<T>;
  isPattern: boolean;
}

interface RedisURL {
  host: string;
  port: number;
}

interface EventOptions {
  url?: RedisURL;
  redisOptions?: RedisOptions;
}

/**
 * Redis-based event client for pub/sub with hierarchical channel support.
 *
 * **Key Features:**
 * - Automatic multi-channel publishing (hierarchical fan-out)
 * - Self-filtering (events from this client are not delivered to this client)
 * - Event deduplication (same event on multiple channels)
 * - Zod schema validation at boundaries
 * - Pattern-based subscriptions (wildcards)
 *
 * @example
 * ```typescript
 * const client = new RedisEventClient({
 *   host: "localhost",
 *   port: 6379,
 * });
 *
 * await client.connect();
 *
 * // Publish character update (auto-fans to multiple channels)
 * await client.publish(
 *   Channels.CHARACTER_UPDATED,
 *   CharacterUpdatedEventSchema,
 *   {
 *     type: "character:updated",
 *     data: { characterId: 123, name: "Dracula", ... },
 *   },
 *   { characterId: "123", guildId: "456" }
 * );
 *
 * // Subscribe to specific character
 * client.subscribe(
 *   buildCharacterChannel("updated", "character", "123"),
 *   CharacterUpdatedEventSchema,
 *   (event) => console.log("Character updated:", event.data.name)
 * );
 *
 * // Subscribe to all characters in guild
 * client.subscribe(
 *   buildCharacterChannel("updated", "guild", "456"),
 *   CharacterUpdatedEventSchema,
 *   (event) => console.log("Guild character updated:", event.data.name)
 * );
 * ```
 */
export class EventClient {
  private readonly redis: Redis;
  private readonly redisSub: Redis;
  private readonly publisherId: string;
  private readonly subscriptions = new Map<string, Subscription<any>[]>();
  private readonly recentEventIds = new Set<string>();
  private cleanupInterval?: NodeJS.Timeout;
  private readonly logger: ILogger;

  /**
   * Create a new Redis event client.
   *
   * @param logger - Logger instance for event client operations
   * @param options - ioredis connection options or connection string
   */
  constructor(logger: ILogger, options?: EventOptions) {
    this.publisherId = uuidv4();
    this.logger = logger;

    // Create Redis clients
    if (options?.redisOptions) {
      this.redis = new Redis(options.redisOptions);
      this.redisSub = new Redis(options.redisOptions);
    } else {
      // Use default URL with optional overrides
      const redisUrl = `redis://${options?.url?.host ?? "localhost"}:${options?.url?.port ?? 6379}`;
      this.redis = new Redis(redisUrl);
      this.redisSub = new Redis(redisUrl);
    }

    // Set up message handlers
    this.redisSub.on("message", (channel, message) => {
      void this.handleMessage(channel, message, false);
    });
    this.redisSub.on("pmessage", (pattern, channel, message) => {
      void this.handleMessage(channel, message, true);
    });

    // Clean up old event IDs every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.recentEventIds.clear();
    }, 60000);

    this.logger.debug("RedisEventClient created", {
      fields: { publisherId: this.publisherId },
    });
  }

  /**
   * Connect to Redis.
   */
  public async connect(): Promise<void> {
    await Promise.all([this.redis.connect(), this.redisSub.connect()]);
    this.logger.info("RedisEventClient connected", {
      fields: { publisherId: this.publisherId },
    });
  }

  /**
   * Publish an event to hierarchical channels automatically.
   *
   * **Multi-Channel Fan-Out:**
   * - Publishes to specific scoped channel (character:123, guild:456, etc.)
   * - Publishes to guild-scoped channel (if applicable)
   * - Publishes to global channel (optional broadcast)
   *
   * **Metadata Injection (Loopback Prevention):**
   * Pass `metadataOverrides.publisherId` to masquerade as the original source.
   * Used by repositories to prevent loopback to the initiating client.
   *
   * **Deduplication:**
   * Subscribers receive each event only once via `eventId` tracking,
   * even if subscribed to multiple overlapping channels.
   *
   * @param baseChannel - Base channel name (e.g., Channels.CHARACTER_UPDATED)
   * @param schema - Zod schema for validation
   * @param event - Event data (without metadata)
   * @param scope - Scope information to determine which channels to publish to
   * @param metadataOverrides - Optional metadata overrides (publisherId, actorId, correlationId)
   * @returns Array of channels published to
   *
   * @example
   * ```typescript
   * // Direct publish (uses this client's publisherId)
   * await client.publish(
   *   Channels.CHARACTER_UPDATED,
   *   CharacterUpdatedEventSchema,
   *   {
   *     type: "character:updated",
   *     data: { characterId: 123, guildId: "456", name: "Dracula" }
   *   },
   *   { characterId: "123", guildId: "456" }
   * );
   *
   * // Repository publish (masquerades as socket to prevent loopback)
   * await eventClient.publish(
   *   Channels.CHARACTER_UPDATED,
   *   schema,
   *   event,
   *   scope,
   *   { publisherId: saveOptions.sourceId }  // Prevent loopback
   * );
   * ```
   */
  public async publish<T>(
    baseChannel: ChannelName,
    schema: z.ZodSchema<T>,
    event: Omit<T, "metadata">,
    scope: PublishScope,
    metadataOverrides?: MetadataOverrides
  ): Promise<string[]> {
    // Add metadata (with overrides)
    const eventWithMetadata = {
      ...event,
      metadata: {
        eventId: uuidv7(),
        publisherId: metadataOverrides?.publisherId ?? this.publisherId,
        timestamp: new Date().toISOString(),
        actorId: metadataOverrides?.actorId,
      },
    };

    // Validate event
    const validation = schema.safeParse(eventWithMetadata);
    if (!validation.success) {
      throw new RealmError("Invalid event data", {
        fields: {
          channel: baseChannel,
          errors: validation.error.message,
        },
      });
    }

    // Determine channels based on event type and scope
    const channels = this.determineChannels(baseChannel, scope);

    // Serialize event
    const message = JSON.stringify(validation.data);

    // Publish to all determined channels
    await Promise.all(
      channels.map((channel) => this.redis.publish(channel, message))
    );

    this.logger.debug("Published event to multiple channels", {
      fields: {
        eventType:
          "type" in event && typeof event.type === "string"
            ? event.type
            : "unknown",
        eventId: eventWithMetadata.metadata.eventId,
        publisherId: eventWithMetadata.metadata.publisherId,
        channels: channels.join(", "),
        channelCount: channels.length.toString(),
      },
    });

    return channels;
  }

  /**
   * Subscribe to a specific channel (exact match).
   *
   * @param channel - Channel name (use builder functions for scoped channels)
   * @param schema - Zod schema for validation
   * @param handler - Callback function for events
   * @param options - Subscription options
   *
   * @example
   * ```typescript
   * // Subscribe to specific character
   * client.subscribe(
   *   buildCharacterChannel("updated", "character", "123"),
   *   CharacterUpdatedEventSchema,
   *   (event) => console.log(event.data.name)
   * );
   *
   * // Subscribe to all character updates in guild
   * client.subscribe(
   *   buildCharacterChannel("updated", "guild", "456"),
   *   CharacterUpdatedEventSchema,
   *   (event) => console.log(event.data.name)
   * );
   * ```
   */
  public subscribe<T>(
    channel: string,
    schema: z.ZodSchema<T>,
    handler: EventHandler<T>
  ): void {
    const subscription: Subscription<T> = {
      channel,
      schema,
      handler,
      isPattern: false,
    };

    // Store subscription
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
      // Subscribe to Redis channel
      void this.redisSub.subscribe(channel);
    }
    this.subscriptions.get(channel)!.push(subscription);

    this.logger.debug("Subscribed to channel", {
      fields: { channel, publisherId: this.publisherId },
    });
  }

  /**
   * Subscribe to a channel pattern (wildcard support).
   *
   * @param pattern - Channel pattern (e.g., "realm:character:*:guild:456")
   * @param schema - Zod schema for validation
   * @param handler - Callback function for events
   *
   * @example
   * ```typescript
   * import { buildChannelPattern } from "@realm/events";
   *
   * // Subscribe to all character events in guild
   * client.subscribePattern(
   *   buildChannelPattern("character", "*", "guild", "456"),
   *   CharacterEventSchema,
   *   (event) => {
   *     switch (event.type) {
   *       case "character:created": // ...
   *       case "character:updated": // ...
   *     }
   *   }
   * );
   * ```
   */
  public subscribePattern<T>(
    pattern: string,
    schema: z.ZodSchema<T>,
    handler: EventHandler<T>
  ): void {
    const subscription: Subscription<T> = {
      channel: pattern,
      schema,
      handler,
      isPattern: true,
    };

    // Store subscription
    if (!this.subscriptions.has(pattern)) {
      this.subscriptions.set(pattern, []);
      // Subscribe to Redis pattern
      void this.redisSub.psubscribe(pattern);
    }
    this.subscriptions.get(pattern)!.push(subscription);

    this.logger.debug("Subscribed to channel pattern", {
      fields: { pattern, publisherId: this.publisherId },
    });
  }

  /**
   * Unsubscribe from a channel or pattern.
   *
   * @param channelOrPattern - Channel name or pattern to unsubscribe from
   */
  public async unsubscribe(channelOrPattern: string): Promise<void> {
    const subscriptions = this.subscriptions.get(channelOrPattern);
    if (!subscriptions || subscriptions.length === 0) return;

    // Remove from map
    this.subscriptions.delete(channelOrPattern);

    // Unsubscribe from Redis
    const isPattern = subscriptions[0].isPattern;
    if (isPattern) {
      await this.redisSub.punsubscribe(channelOrPattern);
    } else {
      await this.redisSub.unsubscribe(channelOrPattern);
    }

    this.logger.debug("Unsubscribed from channel", {
      fields: { channel: channelOrPattern, publisherId: this.publisherId },
    });
  }

  /**
   * Disconnect from Redis and clean up resources.
   */
  public async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    await Promise.all([this.redis.quit(), this.redisSub.quit()]);

    this.logger.info("RedisEventClient disconnected", {
      fields: { publisherId: this.publisherId },
    });
  }

  /**
   * Type guard to check if action is a valid character action.
   */
  private isCharacterAction(
    action: string
  ): action is "created" | "updated" | "deleted" | "guildChanged" {
    return ["created", "updated", "deleted", "guildChanged"].includes(action);
  }

  /**
   * Type guard to check if action is a valid guild/member action.
   */
  private isGuildOrMemberAction(
    action: string
  ): action is "created" | "updated" | "deleted" {
    return ["created", "updated", "deleted"].includes(action);
  }

  /**
   * Type guard to check if action is a valid user action.
   */
  private isUserAction(action: string): action is "updated" {
    return action === "updated";
  }

  /**
   * Determine which channels to publish to based on event type and scope.
   */
  private determineChannels(
    baseChannel: ChannelName,
    scope: PublishScope
  ): string[] {
    const channels: string[] = [];

    // Parse base channel (e.g., "realm:character:updated")
    const parts = baseChannel.split(":");
    const domain = parts[1]; // "character", "guild", "member", "user"
    const action = parts[2]; // "created", "updated", "deleted", etc.

    // Add global channel
    channels.push(baseChannel);

    // Add scoped channels based on domain
    if (domain === "character" && this.isCharacterAction(action)) {
      // Specific character channel
      if (scope.characterId) {
        channels.push(
          buildCharacterChannel(action, "character", scope.characterId)
        );
      }

      // Guild-scoped channel (if character is in a guild)
      if (scope.guildId) {
        channels.push(buildCharacterChannel(action, "guild", scope.guildId));
      }
    } else if (domain === "guild" && this.isGuildOrMemberAction(action)) {
      // Specific guild channel
      if (scope.guildId) {
        channels.push(buildGuildChannel(action, scope.guildId));
      }
    } else if (domain === "member" && this.isGuildOrMemberAction(action)) {
      // Member events are always guild-scoped
      if (scope.guildId) {
        channels.push(
          buildMemberChannel(action, scope.guildId, scope.memberId)
        );
      }
    } else if (domain === "user" && this.isUserAction(action)) {
      // Specific user channel
      if (scope.userId) {
        channels.push(buildUserChannel(action, scope.userId));
      }
    }

    return channels;
  }

  /**
   * Handle incoming message from Redis.
   */
  private async handleMessage(
    channel: string,
    message: string,
    isPattern: boolean
  ): Promise<void> {
    try {
      // Parse message - unknown type until validated
      const rawEvent: unknown = JSON.parse(message);

      // Type guard: ensure event has metadata property
      if (
        typeof rawEvent !== "object" ||
        rawEvent === null ||
        !("metadata" in rawEvent)
      ) {
        this.logger.error("Event missing metadata property", {
          fields: { channel },
        });
        return;
      }

      // Validate metadata
      const metadataValidation = EventMetadataSchema.safeParse(
        rawEvent.metadata
      );
      if (!metadataValidation.success) {
        this.logger.error("Invalid event metadata", {
          fields: {
            channel,
            errors: metadataValidation.error.message,
          },
        });
        return;
      }

      const { eventId, publisherId } = metadataValidation.data;

      // Skip self-published events
      if (publisherId === this.publisherId) {
        return;
      }

      // Skip duplicate events (already processed from another channel)
      if (this.recentEventIds.has(eventId)) {
        return;
      }

      // Mark as processed
      this.recentEventIds.add(eventId);

      // Find subscriptions for this channel
      const subscriptions = isPattern
        ? Array.from(this.subscriptions.entries())
            .filter(([pattern]) => this.matchPattern(pattern, channel))
            .flatMap(([, subs]) => subs)
        : this.subscriptions.get(channel) || [];

      // Execute handlers
      for (const subscription of subscriptions) {
        try {
          // Validate event against schema
          const validation = subscription.schema.safeParse(rawEvent);
          if (!validation.success) {
            // Extract type safely for logging
            const eventType =
              typeof rawEvent === "object" &&
              rawEvent !== null &&
              "type" in rawEvent &&
              typeof rawEvent.type === "string"
                ? rawEvent.type
                : "unknown";

            this.logger.error("Event validation failed for subscription", {
              fields: {
                channel,
                eventType,
                errors: validation.error.message,
              },
            });
            continue;
          }

          // Execute handler
          await subscription.handler(validation.data);
        } catch (error) {
          // Log handler errors but don't break subscription
          // Extract type safely for logging
          const eventType =
            typeof rawEvent === "object" &&
            rawEvent !== null &&
            "type" in rawEvent &&
            typeof rawEvent.type === "string"
              ? rawEvent.type
              : "unknown";

          this.logger.exception("Event handler error", error, {
            fields: {
              channel,
              eventType,
            },
          });
        }
      }
    } catch (error) {
      this.logger.exception("Failed to process Redis message", error, {
        fields: {
          channel,
        },
      });
    }
  }

  /**
   * Check if a channel matches a pattern (simple wildcard matching).
   */
  private matchPattern(pattern: string, channel: string): boolean {
    const regexPattern = pattern.replace(/\*/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(channel);
  }
}
