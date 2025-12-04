# Redis Event System - Architecture & Implementation

**Purpose:** Enable real-time communication between apps (API, Bots, Web) in the monorepo.

---

## Overview

The Realm of Darkness platform consists of multiple independent processes:

- **NestJS API** - HTTP/WebSocket server for the web frontend
- **Discord Bot Shards** - Multiple bot instances handling Discord events
- **Web Frontend** - React SPA connected via WebSocket

These processes need to communicate changes in real-time:

- Bot updates character → API notifies web clients via WebSocket
- API creates dice roll → Bot posts result to Discord channel
- API broadcasts event → All connected clients receive update

**Solution:** Redis Pub/Sub with typed event contracts.

---

## Architecture

### Event Flow Example: Character Update

```
┌─────────────────┐
│  Discord Bot    │  User runs /hunger command
│   (Shard 1)     │
└────────┬────────┘
         │ 1. Update character in DB
         │    (via CharacterRepository)
         │
         │ 2. Publish event to Redis
         ▼
┌─────────────────────────────────────┐
│         Redis Pub/Sub               │
│   Channel: "character:updated"      │
└────────┬────────────────────────────┘
         │
         │ 3. Event broadcast to subscribers
         │
    ┌────┴─────┬─────────────┐
    ▼          ▼             ▼
┌────────┐ ┌────────┐ ┌──────────────┐
│ API    │ │ Other  │ │ Other APIs   │
│ Server │ │ Shards │ │ (if scaled)  │
└───┬────┘ └────────┘ └──────────────┘
    │
    │ 4. Receive event, validate
    │
    │ 5. Push to WebSocket clients
    ▼
┌─────────────────┐
│  Web Clients    │
│  (React Apps)   │
└─────────────────┘
```

---

## Package Structure: `events/`

New package to house all event-related code:

```
events/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                    # Main exports
│   │
│   ├── client/                     # Redis client setup
│   │   ├── RedisEventClient.ts    # Publisher/Subscriber wrapper
│   │   └── config.ts              # Redis connection config
│   │
│   ├── contracts/                  # Event schemas and types
│   │   ├── index.ts
│   │   ├── character-events.ts    # Character CRUD events
│   │   ├── gateway-events.ts      # WebSocket protocol events
│   │   ├── discord-events.ts      # Discord-related events
│   │   └── system-events.ts       # System/health events
│   │
│   ├── channels/                   # Channel name constants
│   │   └── index.ts
│   │
│   ├── handlers/                   # Helper utilities
│   │   ├── EventEmitter.ts        # Type-safe event emitter
│   │   └── EventValidator.ts      # Zod validation wrapper
│   │
│   └── types/
│       ├── index.ts
│       └── event-metadata.ts      # Common event metadata
│
└── test/
    ├── client.test.ts
    └── contracts.test.ts
```

---

## Event Contracts

### Core Principles

1. **Typed Events**: Every event has a Zod schema and inferred TypeScript type
2. **Versioned**: Events include version field for future compatibility
3. **Metadata**: All events carry standard metadata (timestamp, source, etc.)
4. **Validated**: Events validated on publish and subscribe

### Base Event Structure

```typescript
// events/src/types/event-metadata.ts

import { z } from "zod";

/**
 * Standard metadata for all events
 */
export const EventMetadataSchema = z.object({
  /** Unique event ID (UUID v7 for time-ordering) */
  eventId: z.string().uuid(),

  /** Event schema version (semver) */
  version: z.string().regex(/^\d+\.\d+\.\d+$/),

  /** ISO timestamp when event was created */
  timestamp: z.string().datetime(),

  /** Source application that published the event */
  source: z.enum(["api", "bot", "migration", "system"]),

  /** Optional correlation ID for tracing related events */
  correlationId: z.string().uuid().optional(),

  /** Optional user/actor who triggered the event */
  actorId: z.string().optional(),
});

export type EventMetadata = z.infer<typeof EventMetadataSchema>;

/**
 * Base schema all events must extend
 */
export const BaseEventSchema = z.object({
  metadata: EventMetadataSchema,
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;
```

### Character Events

```typescript
// events/src/contracts/character-events.ts

import { z } from "zod";
import { BaseEventSchema } from "../types/event-metadata.js";
import { Splats } from "shared";

/**
 * Published when a character is created
 */
export const CharacterCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal("character:created"),
  data: z.object({
    characterId: z.number().int().positive(),
    userId: z.bigint(),
    guildId: z.bigint().optional(),
    name: z.string(),
    splat: z.nativeEnum(Splats),
  }),
});

export type CharacterCreatedEvent = z.infer<typeof CharacterCreatedEventSchema>;

/**
 * Published when a character is updated
 */
export const CharacterUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal("character:updated"),
  data: z.object({
    characterId: z.number().int().positive(),
    userId: z.bigint(),
    guildId: z.bigint().optional(),
    name: z.string(),
    splat: z.nativeEnum(Splats),
    /** Fields that were changed (for partial updates) */
    changedFields: z.array(z.string()).optional(),
  }),
});

export type CharacterUpdatedEvent = z.infer<typeof CharacterUpdatedEventSchema>;

/**
 * Published when a character is deleted
 */
export const CharacterDeletedEventSchema = BaseEventSchema.extend({
  type: z.literal("character:deleted"),
  data: z.object({
    characterId: z.number().int().positive(),
    userId: z.bigint(),
    name: z.string(),
  }),
});

export type CharacterDeletedEvent = z.infer<typeof CharacterDeletedEventSchema>;

/**
 * Union of all character events
 */
export const CharacterEventSchema = z.discriminatedUnion("type", [
  CharacterCreatedEventSchema,
  CharacterUpdatedEventSchema,
  CharacterDeletedEventSchema,
]);

export type CharacterEvent = z.infer<typeof CharacterEventSchema>;
```

### Gateway/WebSocket Events

```typescript
// events/src/contracts/gateway-events.ts

import { z } from "zod";
import { BaseEventSchema } from "../types/event-metadata.js";

/**
 * Published when data should be broadcast to web clients
 */
export const GatewayBroadcastEventSchema = BaseEventSchema.extend({
  type: z.literal("gateway:broadcast"),
  data: z.object({
    /** Target channel/room (e.g., "user:123456", "guild:789012") */
    channel: z.string(),

    /** The message to broadcast to WebSocket clients */
    message: z.object({
      type: z.string(),
      payload: z.unknown(),
    }),

    /** Optional: specific connection IDs to target */
    connectionIds: z.array(z.string()).optional(),
  }),
});

export type GatewayBroadcastEvent = z.infer<typeof GatewayBroadcastEventSchema>;
```

### Discord Events

```typescript
// events/src/contracts/discord-events.ts

import { z } from "zod";
import { BaseEventSchema } from "../types/event-metadata.js";

/**
 * Request to post a message to Discord channel
 * Published by API, consumed by bot
 */
export const DiscordMessageRequestSchema = BaseEventSchema.extend({
  type: z.literal("discord:message:request"),
  data: z.object({
    guildId: z.bigint(),
    channelId: z.bigint(),
    content: z.object({
      text: z.string().optional(),
      embeds: z.array(z.unknown()).optional(), // discord.js embed format
      components: z.array(z.unknown()).optional(),
    }),
    /** Optional: Reference message ID to reply to */
    replyToMessageId: z.bigint().optional(),
  }),
});

export type DiscordMessageRequest = z.infer<typeof DiscordMessageRequestSchema>;

/**
 * Dice roll result to post to Discord
 */
export const DiscordDiceRollEventSchema = BaseEventSchema.extend({
  type: z.literal("discord:diceroll:post"),
  data: z.object({
    guildId: z.bigint(),
    channelId: z.bigint(),
    userId: z.bigint(),
    characterName: z.string().optional(),
    roll: z.object({
      pool: z.number().int(),
      difficulty: z.number().int().optional(),
      results: z.array(z.number()),
      successes: z.number().int(),
      criticals: z.number().int().optional(),
      botches: z.number().int().optional(),
      type: z.enum(["5th", "20th", "cod"]),
    }),
  }),
});

export type DiscordDiceRollEvent = z.infer<typeof DiscordDiceRollEventSchema>;
```

---

## Channel Names

```typescript
// events/src/channels/index.ts

/**
 * Redis channel names for pub/sub
 * Organized by domain/feature
 */
export const Channels = {
  // Character events
  CHARACTER_CREATED: "realm:character:created",
  CHARACTER_UPDATED: "realm:character:updated",
  CHARACTER_DELETED: "realm:character:deleted",

  // Gateway/WebSocket events
  GATEWAY_BROADCAST: "realm:gateway:broadcast",

  // Discord events
  DISCORD_MESSAGE_REQUEST: "realm:discord:message:request",
  DISCORD_DICE_ROLL: "realm:discord:diceroll:post",

  // System events
  SYSTEM_HEALTH: "realm:system:health",
  SYSTEM_SHUTDOWN: "realm:system:shutdown",
} as const;

export type ChannelName = (typeof Channels)[keyof typeof Channels];
```

---

## Redis Event Client

```typescript
// events/src/client/RedisEventClient.ts

import Redis from "ioredis";
import { z } from "zod";
import { logger } from "@realm/logger";
import { RealmError } from "@realm/errors";
import type { ChannelName } from "../channels/index.js";
import { EventMetadataSchema } from "../types/event-metadata.js";

/**
 * Type-safe Redis pub/sub client for domain events
 */
export class RedisEventClient {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers = new Map<
    string,
    Array<(event: unknown) => void | Promise<void>>
  >();

  constructor(
    redisUrl: string,
    private appName: string
  ) {
    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    this.subscriber.on("message", this.handleMessage.bind(this));
  }

  /**
   * Publish an event to a channel
   *
   * @param channel - Redis channel name
   * @param schema - Zod schema for validation
   * @param event - Event data (metadata will be added automatically)
   */
  async publish<T extends z.ZodType>(
    channel: ChannelName,
    schema: T,
    event: Omit<z.infer<T>, "metadata"> & {
      metadata?: Partial<z.infer<typeof EventMetadataSchema>>;
    }
  ): Promise<void> {
    try {
      // Add metadata if not provided
      const fullEvent = {
        ...event,
        metadata: {
          eventId: crypto.randomUUID(),
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          source: this.appName,
          ...event.metadata,
        },
      };

      // Validate event against schema
      const validated = schema.parse(fullEvent);

      // Publish to Redis
      const serialized = JSON.stringify(validated);
      await this.publisher.publish(channel, serialized);

      logger.debug(`Event published to ${channel}`, {
        fields: {
          channel,
          eventType: (validated as any).type,
          eventId: fullEvent.metadata.eventId,
        },
      });
    } catch (error) {
      throw new RealmError("Failed to publish event", {
        fields: { channel },
        cause: error,
      });
    }
  }

  /**
   * Subscribe to a channel with type-safe event handling
   *
   * @param channel - Redis channel name
   * @param schema - Zod schema for validation
   * @param handler - Event handler function
   */
  async subscribe<T extends z.ZodType>(
    channel: ChannelName,
    schema: T,
    handler: (event: z.infer<T>) => void | Promise<void>
  ): Promise<void> {
    await this.subscriber.subscribe(channel);

    // Store handler with schema for validation
    const wrappedHandler = async (rawEvent: unknown) => {
      try {
        const validated = schema.parse(rawEvent);
        await handler(validated);
      } catch (error) {
        logger.error("Event handler failed", {
          fields: {
            channel,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    };

    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
    }
    this.handlers.get(channel)!.push(wrappedHandler);

    logger.info(`Subscribed to channel ${channel}`);
  }

  /**
   * Internal message handler for Redis subscriber
   */
  private async handleMessage(channel: string, message: string): Promise<void> {
    const handlers = this.handlers.get(channel);
    if (!handlers) return;

    try {
      const event = JSON.parse(message);

      // Execute all handlers for this channel
      await Promise.all(handlers.map((handler) => handler(event)));
    } catch (error) {
      logger.error("Failed to handle message", {
        fields: { channel },
        error: error,
      });
    }
  }

  /**
   * Gracefully disconnect from Redis
   */
  async disconnect(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
    logger.info("Redis client disconnected");
  }
}
```

---

## Usage Examples

### Example 1: Bot Updates Character

```typescript
// bot/src/commands/hunger.ts

import { RedisEventClient } from "events";
import { CharacterUpdatedEventSchema, Channels } from "events";
import { CharacterRepository } from "repositories";

const eventClient = new RedisEventClient(process.env.REDIS_URL!, "bot");
const charRepo = new CharacterRepository(db);

// User runs /hunger command
async function handleHungerCommand(interaction: CommandInteraction) {
  const character = await charRepo.findByUser(
    BigInt(interaction.user.id),
    interaction.options.getString("name")!
  );

  if (!character || !character.isVampire5th()) {
    throw new UserError("Vampire character not found");
  }

  // Update hunger
  character.increaseHunger(1);
  await charRepo.update(character);

  // Publish event so API can notify web clients
  await eventClient.publish(
    Channels.CHARACTER_UPDATED,
    CharacterUpdatedEventSchema,
    {
      type: "character:updated",
      data: {
        characterId: character.id!,
        userId: character.userId,
        guildId: character.guildId,
        name: character.name,
        splat: character.splat,
        changedFields: ["hunger"],
      },
    }
  );

  await interaction.reply(
    `${character.name}'s hunger increased to ${character.hunger}`
  );
}
```

### Example 2: API Listens for Character Updates

```typescript
// api/src/gateway/gateway.service.ts

import { Injectable, OnModuleInit } from "@nestjs/common";
import { RedisEventClient } from "events";
import { CharacterUpdatedEventSchema, Channels } from "events";
import { GatewayServer } from "./gateway.server.js";

@Injectable()
export class GatewayService implements OnModuleInit {
  private eventClient: RedisEventClient;

  constructor(private gatewayServer: GatewayServer) {
    this.eventClient = new RedisEventClient(process.env.REDIS_URL!, "api");
  }

  async onModuleInit() {
    // Subscribe to character updates
    await this.eventClient.subscribe(
      Channels.CHARACTER_UPDATED,
      CharacterUpdatedEventSchema,
      async (event) => {
        // Broadcast to relevant WebSocket clients
        await this.gatewayServer.broadcastToUser(event.data.userId, {
          type: "CHARACTER_UPDATED",
          payload: {
            characterId: event.data.characterId,
            name: event.data.name,
            changedFields: event.data.changedFields,
          },
        });

        // Also broadcast to guild if applicable
        if (event.data.guildId) {
          await this.gatewayServer.broadcastToGuild(event.data.guildId, {
            type: "CHARACTER_UPDATED",
            payload: {
              characterId: event.data.characterId,
              name: event.data.name,
              changedFields: event.data.changedFields,
            },
          });
        }
      }
    );
  }
}
```

### Example 3: API Requests Bot to Post Dice Roll

```typescript
// api/src/dice/dice.service.ts

import { Injectable } from "@nestjs/common";
import { RedisEventClient } from "events";
import { DiscordDiceRollEventSchema, Channels } from "events";
import { DiceRoller } from "domain/services/DiceRoller";

@Injectable()
export class DiceService {
  private eventClient: RedisEventClient;
  private diceRoller: DiceRoller;

  constructor() {
    this.eventClient = new RedisEventClient(process.env.REDIS_URL!, "api");
    this.diceRoller = new DiceRoller();
  }

  async rollForCharacter(
    userId: bigint,
    guildId: bigint,
    channelId: bigint,
    characterName: string,
    pool: number,
    difficulty?: number
  ) {
    // Perform roll using domain logic
    const result = this.diceRoller.rollV5(pool, difficulty);

    // Request bot to post result to Discord
    await this.eventClient.publish(
      Channels.DISCORD_DICE_ROLL,
      DiscordDiceRollEventSchema,
      {
        type: "discord:diceroll:post",
        data: {
          guildId,
          channelId,
          userId,
          characterName,
          roll: {
            pool,
            difficulty,
            results: result.dice,
            successes: result.successes,
            criticals: result.criticals,
            botches: result.botches,
            type: "5th",
          },
        },
      }
    );

    return result;
  }
}
```

### Example 4: Bot Listens for Discord Requests

```typescript
// bot/src/events/redis-listener.ts

import { RedisEventClient } from "events";
import { DiscordDiceRollEventSchema, Channels } from "events";
import { Client, EmbedBuilder } from "discord.js";

export function setupRedisListeners(
  client: Client,
  eventClient: RedisEventClient
) {
  // Listen for dice roll requests from API
  eventClient.subscribe(
    Channels.DISCORD_DICE_ROLL,
    DiscordDiceRollEventSchema,
    async (event) => {
      const guild = client.guilds.cache.get(event.data.guildId.toString());
      if (!guild) return;

      const channel = guild.channels.cache.get(event.data.channelId.toString());
      if (!channel?.isTextBased()) return;

      // Create embed for dice roll result
      const embed = new EmbedBuilder()
        .setTitle(
          `🎲 Dice Roll${event.data.characterName ? ` - ${event.data.characterName}` : ""}`
        )
        .addFields(
          {
            name: "Pool",
            value: event.data.roll.pool.toString(),
            inline: true,
          },
          {
            name: "Successes",
            value: event.data.roll.successes.toString(),
            inline: true,
          },
          { name: "Results", value: event.data.roll.results.join(", ") }
        )
        .setColor(event.data.roll.successes > 0 ? "Green" : "Red");

      await channel.send({ embeds: [embed] });
    }
  );
}
```

---

## Redis Configuration

### Environment Variables

```env
# .env file for all apps

# Redis connection
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password_here
REDIS_DB=0

# App-specific settings
APP_NAME=api  # or 'bot', 'migration', etc.
```

### Package Dependencies

```json
// events/package.json
{
  "name": "events",
  "dependencies": {
    "ioredis": "^5.3.2",
    "shared": "workspace:*"
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// events/test/contracts.test.ts

import { CharacterUpdatedEventSchema } from "@/contracts/character-events";

describe("CharacterUpdatedEventSchema", () => {
  it("should validate a correct event", () => {
    const event = {
      metadata: {
        eventId: crypto.randomUUID(),
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        source: "bot",
      },
      type: "character:updated",
      data: {
        characterId: 123,
        userId: 456789n,
        name: "Test Character",
        splat: "vampire5th",
      },
    };

    expect(() => CharacterUpdatedEventSchema.parse(event)).not.toThrow();
  });

  it("should reject invalid event", () => {
    const event = {
      metadata: {},
      type: "character:updated",
      data: {}, // Missing required fields
    };

    expect(() => CharacterUpdatedEventSchema.parse(event)).toThrow();
  });
});
```

### Integration Tests

```typescript
// events/test/client.test.ts

import { RedisEventClient } from "@/client/RedisEventClient";
import { CharacterUpdatedEventSchema, Channels } from "@/index";

describe("RedisEventClient", () => {
  let publisher: RedisEventClient;
  let subscriber: RedisEventClient;

  beforeAll(() => {
    publisher = new RedisEventClient(process.env.REDIS_URL!, "test-publisher");
    subscriber = new RedisEventClient(
      process.env.REDIS_URL!,
      "test-subscriber"
    );
  });

  afterAll(async () => {
    await publisher.disconnect();
    await subscriber.disconnect();
  });

  it("should publish and receive events", async () => {
    const received = new Promise((resolve) => {
      subscriber.subscribe(
        Channels.CHARACTER_UPDATED,
        CharacterUpdatedEventSchema,
        (event) => resolve(event)
      );
    });

    await publisher.publish(
      Channels.CHARACTER_UPDATED,
      CharacterUpdatedEventSchema,
      {
        type: "character:updated",
        data: {
          characterId: 123,
          userId: 456789n,
          name: "Test",
          splat: "vampire5th",
        },
      }
    );

    const event = await received;
    expect(event).toBeDefined();
  });
});
```

---

## Best Practices

### 1. Always Validate Events

```typescript
// ✅ DO: Validate with Zod schema
await eventClient.publish(
  Channels.CHARACTER_UPDATED,
  CharacterUpdatedEventSchema,
  event
);

// ❌ DON'T: Publish without validation
await redis.publish("some-channel", JSON.stringify(event));
```

### 2. Use Discriminated Unions

```typescript
// ✅ DO: Use discriminated unions for related events
export const CharacterEventSchema = z.discriminatedUnion("type", [
  CharacterCreatedEventSchema,
  CharacterUpdatedEventSchema,
  CharacterDeletedEventSchema,
]);
```

### 3. Include Correlation IDs

```typescript
// ✅ DO: Link related events
const correlationId = crypto.randomUUID();

await eventClient.publish(Channels.CHARACTER_UPDATED, schema, {
  metadata: { correlationId },
  // ...
});

await eventClient.publish(Channels.GATEWAY_BROADCAST, schema, {
  metadata: { correlationId }, // Same ID
  // ...
});
```

### 4. Handle Errors Gracefully

```typescript
// ✅ DO: Wrap handlers in try-catch
await eventClient.subscribe(
  Channels.CHARACTER_UPDATED,
  schema,
  async (event) => {
    try {
      await processEvent(event);
    } catch (error) {
      await logger.error("Event processing failed", {
        location: "event-handler",
        fields: { eventId: event.metadata.eventId },
        cause: error,
      });
      // Don't rethrow - other handlers should still run
    }
  }
);
```

### 5. Use Event Versioning

```typescript
// When event schema changes, create new version
export const CharacterUpdatedEventV2Schema = BaseEventSchema.extend({
  type: z.literal("character:updated"),
  // ... new fields
});

// Handle both versions
subscriber.subscribe(Channels.CHARACTER_UPDATED, schema, async (event) => {
  if (event.metadata.version.startsWith("1.")) {
    // Handle v1
  } else if (event.metadata.version.startsWith("2.")) {
    // Handle v2
  }
});
```

---

## Phase Integration

The `events` package should be created in **Phase 1** alongside the `domain` package, since:

- Events contracts depend on domain types
- Repositories will need to publish events
- API and Bot will subscribe to events

**Updated Phase 1 deliverables:**

- ✅ `domain/` package
- ✅ `events/` package ← **NEW**
- ✅ Repository interfaces (in domain)
- ✅ All tests passing

---

## Future Enhancements

### 1. Event Replay

Store events in persistent log for debugging and replay.

### 2. Event Sourcing

Use events as source of truth, rebuild state from event log.

### 3. Dead Letter Queue

Failed events moved to DLQ for manual intervention.

### 4. Metrics & Monitoring

Track event throughput, latency, error rates.

### 5. Event Schema Registry

Central registry of all event schemas with versioning.

---

## Conclusion

The Redis event system provides:

- ✅ **Type safety** through Zod schemas
- ✅ **Decoupling** between apps
- ✅ **Real-time updates** for web clients
- ✅ **Scalability** for multiple bot shards
- ✅ **Testability** with clear contracts
- ✅ **Observability** through structured logging

This architecture allows the API, bots, and frontend to communicate seamlessly while remaining independent and scalable.
