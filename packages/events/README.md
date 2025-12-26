# Redis Event System

Real-time, type-safe event communication for API, Discord bots, and web clients.

---

## Quick Start

```typescript
import { RedisEventClient, Channels, CharacterUpdatedEventSchema, buildCharacterChannel } from "@realm/events";

// Create client (uses REDIS_URL env var)
const client = new RedisEventClient();
await client.connect();

// Subscribe to events (auto-filters own events)
client.subscribe(
  buildCharacterChannel("updated", "character", "123"),
  CharacterUpdatedEventSchema,
  (event) => console.log(event.data.name)
);

// Publish events
await client.publish(
  Channels.CHARACTER_UPDATED,
  CharacterUpdatedEventSchema,
  { type: "character:updated", data: { ... } },
  { characterId: "123", guildId: "456" }
);
```

---

## Architecture

### Core Concept: Hierarchical Channels

**Problem:** Flat channels (`realm:character:updated`) broadcast to everyone, wasting bandwidth.

**Solution:** Automatic fan-out to scoped channels based on context.

```typescript
// Publisher uses base channel
await client.publish(Channels.CHARACTER_UPDATED, schema, event, {
  characterId: "123",
  guildId: "456",
});

// System publishes to 3 channels:
// - realm:character:updated:character:123  (specific character)
// - realm:character:updated:guild:456      (guild-scoped)
// - realm:character:updated                (global)
```

**Subscribers choose granularity:**

```typescript
// WebSocket viewing character sheet (specific)
client.subscribe(
  buildCharacterChannel("updated", "character", "123"),
  schema,
  handler
);

// Guild admin page (all characters in guild)
client.subscribe(
  buildCharacterChannel("updated", "guild", "456"),
  schema,
  handler
);
```

### Self-Filtering

Each `RedisEventClient` instance gets unique `publisherId` (UUID v4). Events are automatically filtered so clients don't receive their own publications.

```typescript
// Client A publishes
await clientA.publish(...);

// Client A doesn't receive (filtered)
// Client B receives ✓
// Client C receives ✓
```

### Deduplication

If subscribed to overlapping channels (e.g., specific character + guild), events are deduplicated via `eventId` (UUID v7) with 60s TTL.

---

## Event Contracts

All events extend `BaseEventSchema` with standard metadata:

```typescript
export const CharacterUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal("character:updated"),
  data: z.object({
    characterId: SnowflakeSchema,
    userId: SnowflakeSchema,
    guildId: SnowflakeSchema.optional(),
    name: z.string(),
    splat: SplatsSchema,
    changedFields: z.array(z.string()).optional(),
  }),
});
```

**Event Categories:**

- **Character:** created, updated, deleted, guildChanged
- **Guild:** created, updated, deleted
- **Member:** created, updated, deleted (always guild-scoped)
- **User:** updated
- **Dice:** roll:request, roll:result
- **Gateway:** broadcast (WebSocket targeting)
- **Discord:** message:request (bot actions)
- **System:** health:ping/pong, shutdown

---

## Repository Pattern: Metadata Injection

**Problem:** Repositories should publish events, but how to prevent loopback to the initiating client?

**Solution:** Pass `SaveOptions` with `sourceId` to masquerade as original source.

### SaveOptions Contract

```typescript
// packages/core/src/types/repository.types.ts
export interface SaveOptions {
  sourceId?: string; // publisherId to masquerade as
  correlationId?: string; // Tracing ID
  suppressEvents?: boolean; // Skip events (migrations/seeds)
}
```

### Repository Implementation

```typescript
import { RedisEventClient, Channels } from "@realm/events";
import type { SaveOptions } from "@realm/core";

export class CharacterRepository {
  private eventClient: RedisEventClient;

  constructor() {
    // Use singleton pattern (like logger)
    this.eventClient = new RedisEventClient();
  }

  async save(entity: Character, options: SaveOptions = {}): Promise<void> {
    // 1. Calculate diff
    const existing = await this.findById(entity.id);
    const changes = this.diff(existing, entity);

    if (changes.length === 0) return; // No changes

    // 2. Persist
    await this.db.update(characters)
      .set(this.mapper.toDomain(entity))
      .where(eq(characters.id, entity.id));

    // 3. Publish event (masquerade as sourceId)
    if (!options.suppressEvents) {
      await this.eventClient.publish(
        Channels.CHARACTER_UPDATED,
        CharacterUpdatedEventSchema,
        {
          type: "character:updated",
          data: { characterId: entity.id, changedFields: changes, ... },
        },
        { characterId: entity.id.toString(), guildId: entity.guildId?.toString() },
        { publisherId: options.sourceId } // 🔑 Masquerade!
      );
    }
  }
}
```

### Gateway Usage

```typescript
// WebSocket handler
socket.on("updateCharacter", async (data) => {
  const character = await repo.findById(data.id);
  character.update(data);

  // Pass socket ID - repository masquerades as this socket
  await repo.save(character, { sourceId: socket.id });

  // Event publishes to:
  // - Other WebSocket connections ✓
  // - Bot instances ✓
  // - This socket ✗ (filtered by publisherId)
});
```

### Bot Usage

```typescript
// Discord slash command
await interaction.deferReply();

const character = await repo.findById(characterId);
character.increaseHunger(1);

// Pass interaction ID
await repo.save(character, { sourceId: interaction.id });

// Reply to user (event notifies API/web clients)
await interaction.editReply(`Hunger increased to ${character.hunger}`);
```

---

## Channel Builders

**Publishing:** Use base channels from `Channels` constant.

**Subscribing:** Use builder functions for scoped channels.

```typescript
import {
  Channels,
  buildCharacterChannel,
  buildGuildChannel,
  buildMemberChannel,
  buildUserChannel,
  buildChannelPattern,
} from "@realm/events";

// Base channels (publishing)
Channels.CHARACTER_UPDATED;
Channels.GUILD_CREATED;
Channels.MEMBER_DELETED;

// Scoped channels (subscribing)
buildCharacterChannel("updated", "character", "123");
buildCharacterChannel("updated", "guild", "456");
buildGuildChannel("updated", "789");
buildMemberChannel("created", "456", "789");
buildUserChannel("updated", "123");

// Patterns (wildcards)
buildChannelPattern("character", "*", "guild", "456"); // All char events in guild
buildChannelPattern("character", "updated", "guild", "*"); // All updates, any guild
```

---

## API Reference

### RedisEventClient

```typescript
class RedisEventClient {
  constructor(options?: string | Redis.RedisOptions);

  // Connect to Redis
  async connect(): Promise<void>;

  // Publish to base channel (auto fan-out)
  async publish<T>(
    baseChannel: ChannelName,
    schema: z.ZodSchema<T>,
    event: Omit<T, "metadata">,
    scope: PublishScope,
    metadataOverrides?: MetadataOverrides
  ): Promise<string[]>;

  // Subscribe to specific channel
  subscribe<T>(
    channel: string,
    schema: z.ZodSchema<T>,
    handler: (event: T) => void | Promise<void>
  ): void;

  // Subscribe to pattern (wildcards)
  subscribePattern<T>(
    pattern: string,
    schema: z.ZodSchema<T>,
    handler: (event: T) => void | Promise<void>
  ): void;

  // Unsubscribe
  async unsubscribe(channelOrPattern: string): Promise<void>;

  // Disconnect
  async disconnect(): Promise<void>;
}
```

### Types

```typescript
interface PublishScope {
  characterId?: string;
  guildId?: string;
  userId?: string;
  memberId?: string;
}

interface MetadataOverrides {
  publisherId?: string; // For loopback prevention
  actorId?: string; // User who triggered action
  correlationId?: string; // Tracing ID
}

interface EventMetadata {
  eventId: string; // UUID v7 (time-ordered)
  publisherId: string; // UUID v4 (client instance)
  timestamp: string; // ISO 8601
  actorId?: string; // Optional actor (Snowflake)
}
```

---

## Use Cases

### Character Sheet WebSocket

```typescript
// Client connects and subscribes to their character
socket.on("subscribe:character", (characterId) => {
  eventClient.subscribe(
    buildCharacterChannel("updated", "character", characterId),
    CharacterUpdatedEventSchema,
    (event) => socket.emit("characterUpdate", event.data)
  );
});

// Cleanup on disconnect
socket.on("disconnect", () => {
  eventClient.unsubscribe(
    buildCharacterChannel("updated", "character", characterId)
  );
});
```

### Guild Admin Dashboard

```typescript
// Subscribe to all character events in guild (one subscription)
eventClient.subscribePattern(
  buildChannelPattern("character", "*", "guild", guildId),
  CharacterEventSchema,
  (event) => {
    switch (event.type) {
      case "character:created":
        socket.emit("newCharacter", event.data);
        break;
      case "character:updated":
        socket.emit("characterUpdate", event.data);
        break;
      case "character:deleted":
        socket.emit("characterDeleted", event.data);
        break;
    }
  }
);
```

### Dice Roll Request/Result

```typescript
// API requests dice roll from bot
const rollId = uuidv4();

// Subscribe to result
eventClient.subscribe(
  `realm:dice:roll:result:${rollId}`,
  DiceRollResultSchema,
  (event) => {
    // Broadcast result to requesting WebSocket
    socket.emit("diceRollResult", event.data);
  }
);

// Publish request
await eventClient.publish(
  Channels.DICE_ROLL_REQUEST,
  DiceRollRequestSchema,
  {
    type: "dice:roll:request",
    data: { rollId, system: "V5", pool: 6, hungerDice: 2 },
  },
  {}
);

// Bot receives request, rolls dice, publishes result
await eventClient.publish(
  Channels.DICE_ROLL_RESULT,
  DiceRollResultSchema,
  {
    type: "dice:roll:result",
    data: { rollId, results: [8, 10, 3, 6, 2, 1], successes: 3, ... },
  },
  {}
);
```

---

## Environment Setup

```bash
# .env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=secret  # optional
REDIS_DB=0             # optional
```

**Docker Compose (Development):**

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## Testing

```typescript
// Use test Redis instance
const testClient = new RedisEventClient("redis://localhost:6380");

// Suppress events in migrations/seeds
await repo.save(character, { suppressEvents: true });
```

---

## Design Decisions

| Decision                         | Rationale                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| **No versioning**                | Single developer, monorepo coordination easier without version negotiation            |
| **publisherId per instance**     | Fine-grained self-filtering (WebSocket connections, bot shards, API instances)        |
| **Hierarchical fan-out**         | Efficiency - subscribers only receive relevant events                                 |
| **Base channels for publishing** | Type-safe - prevent accidental scoped channel publishing                              |
| **Metadata injection**           | Repositories publish events but masquerade as original source for loopback prevention |
| **Event deduplication**          | Prevent duplicate processing when subscribed to overlapping channels                  |
| **Singleton pattern**            | One Redis connection pool per app (like logger), optional injection for testing       |

---

## Performance

- Redis handles **millions of messages/sec**
- Event fan-out: 1-3 publishes per event (negligible overhead)
- Deduplication cache: ~100 bytes per event, 60s TTL
- WebSocket efficiency: Guild admin page = **1 subscription** (not 50+)

---

## Migration Notes

When migrating data, suppress events:

```typescript
for (const legacyCharacter of legacyData) {
  const character = mapper.fromLegacy(legacyCharacter);
  await repo.save(character, { suppressEvents: true });
}
```

---

## Troubleshooting

**Events not received?**

- Check `REDIS_URL` environment variable
- Ensure Redis is running (`docker compose up redis`)
- Verify subscription channel matches published scope

**Receiving own events?**

- Repository should pass `sourceId` via `SaveOptions`
- Check `metadataOverrides.publisherId` is set correctly

**Duplicate events?**

- Deduplication is automatic via `eventId`
- Check if same event fires multiple times (logic issue)

**Connection issues?**

- Redis connection errors logged with `RealmError`
- Check network connectivity and credentials

---

## Further Reading

- [DOMAIN_REPOSITORY_EXPLAINED.md](../../DOMAIN_REPOSITORY_EXPLAINED.md) - Repository pattern
- [NAMING_CONVENTIONS.md](../../NAMING_CONVENTIONS.md) - Code standards
- [ENV_SETUP.md](../../ENV_SETUP.md) - Environment configuration
