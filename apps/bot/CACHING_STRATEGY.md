# Discord Bot Caching Strategy

**Last Updated:** November 30, 2025
**For:** Realm of Darkness Discord Bots (CoD, 5th, 20th)

---

## Overview

These bots serve **thousands of Discord guilds** with **minimal memory footprint** through aggressive cache management. The bots are primarily **interaction-based** (slash commands) and do not process message content, allowing us to disable most caching features.

## Cache Configuration

### What We Cache

| Entity            | Cache Size       | Sweeper Interval | Rationale                                     |
| ----------------- | ---------------- | ---------------- | --------------------------------------------- |
| **Guilds**        | Unlimited        | Never            | Lightweight metadata, needed for context      |
| **Guild Members** | 200 per guild    | 5 minutes        | Only for active users, cleared aggressively   |
| **Users**         | 500 global       | 10 minutes       | Minimal user data, mostly interaction authors |
| **Channels**      | 50 global        | 30 seconds       | Fetched on-demand when needed                 |
| **Emojis**        | 100 per category | Never            | Used in bot responses                         |
| **App Commands**  | 100 global       | Never            | Slash command definitions                     |

### What We DON'T Cache

| Entity              | Reason                                               |
| ------------------- | ---------------------------------------------------- |
| **Messages**        | We don't process message content (interaction-based) |
| **Voice States**    | Not used                                             |
| **Presences**       | Don't track user online/offline status               |
| **Threads**         | Not used in bot workflow                             |
| **Stage Instances** | Not used                                             |

## Memory Optimization Benefits

### Before Optimization (Default Caching)

- **Estimated memory per guild:** 5-10 MB
- **10,000 guilds:** 50-100 GB RAM required
- **Issues:** OOM crashes, slow performance, high costs

### After Optimization (Aggressive Caching)

- **Estimated memory per guild:** 0.5-1 MB
- **10,000 guilds:** 5-10 GB RAM required
- **Benefits:** Stable performance, predictable scaling, lower costs

## Sweeper Strategy

Sweepers run at intervals to remove stale cache entries:

```typescript
{
  guildMembers: { interval: 300 },  // Every 5 minutes
  users: { interval: 600 },         // Every 10 minutes
  channels: { interval: 30 },       // Every 30 seconds (very aggressive)
  threads: { interval: 60 },        // Every minute
}
```

### What Gets Swept

- **Guild Members:** All except bot's own member and registered users (TODO)
- **Users:** All except bot user and registered users (TODO)
- **Channels:** All except guild default channels
- **Threads:** All threads (we don't use them)

## ✅ User-Specific Caching - IMPLEMENTED

### The Solution

We've implemented database-backed user filtering to **only cache registered users**.

**Implementation:**

- Created `registeredUserIds` Set for O(1) registration checks
- Created `isRegisteredUser()` helper function
- Updated `GuildMemberManager` and `UserManager` to use `keepOverLimit` with database checks
- Updated sweepers to only remove unregistered users
- Currently a **placeholder** - needs database integration

**Current Behavior:**

- `maxSize` set to 5 (very low base limit)
- `keepOverLimit` checks: bot user OR registered user
- Sweepers preserve bot user + registered users, remove all others

### Remaining Work

### Remaining Work

#### Step 1: Populate `registeredUserIds` on Startup

```typescript
// In ready.js event or main bot initialization
async function loadRegisteredUsers() {
  const userRepo = new UserRepository(db);
  const users = await userRepo.getAllRegisteredUserIds();

  users.forEach((id) => registeredUserIds.add(id));

  logger.info(`Loaded ${users.length} registered users into cache`, {
    location: "bot.startup",
  });
}

// Call on bot startup
await loadRegisteredUsers();
```

#### Step 2: Subscribe to User Registration Events

#### Step 2: Subscribe to User Registration Events

```typescript
// Add user when they register
eventEmitter.on("user:registered", (userId: string) => {
  registeredUserIds.add(userId);
  logger.info(`Added user ${userId} to cache whitelist`, {
    location: "bot.event-handler",
  });
});

// Remove user when they delete account
eventEmitter.on("user:deleted", (userId: string) => {
  registeredUserIds.delete(userId);

  // Also remove from Discord cache
  client.users.cache.delete(userId);
  for (const guild of client.guilds.cache.values()) {
    guild.members.cache.delete(userId);
  }

  logger.info(`Removed user ${userId} from cache`, {
    location: "bot.event-handler",
  });
});
```

#### Step 3: Consider Redis for Multi-Shard State

Current implementation uses a local Set per bot shard. For consistent state across all shards:

```typescript
// Use Redis Set for shared state
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

async function isRegisteredUser(userId: string): Promise<boolean> {
  // Check Redis instead of local Set
  return await redis.sIsMember("registered_users", userId);
}

// Update on registration
await redis.sAdd("registered_users", userId);

// Update on deletion
await redis.sRem("registered_users", userId);
```

**Trade-off:** Redis adds latency but ensures consistency across shards.

### Implementation Summary

**What we implemented in bot.ts:**

```typescript
// In-memory cache of registered user IDs (O(1) lookups)
const registeredUserIds = new Set<string>();

function isRegisteredUser(userId: string): boolean {
  // TODO: Populate from database on startup
  return registeredUserIds.has(userId);
}

// Cache settings with keepOverLimit filtering
GuildMemberManager: {
  maxSize: 5,
  keepOverLimit: (member) =>
    member.id === member.client.user?.id || isRegisteredUser(member.id)
}

UserManager: {
  maxSize: 5,
  keepOverLimit: (user) =>
    user.id === user.client.user?.id || isRegisteredUser(user.id)
}

// Sweepers that preserve registered users
guildMembers: {
  filter: () => (member) =>
    member.id !== member.client.user?.id && !isRegisteredUser(member.id)
}

users: {
  filter: () => (user) =>
    user.id !== user.client.user?.id && !isRegisteredUser(user.id)
}
```

**What we removed from original plan:**

- ❌ Separate `shouldCacheGuildMember()` / `shouldCacheUser()` functions - using `keepOverLimit` directly
- ❌ Complex `RegisteredUsersCache` class - using simple `Set<string>` instead
- ❌ Custom `LimitedCollection` subclasses - Discord.js built-in features are sufficient
- ❌ Database queries on every cache decision - using in-memory Set for O(1) lookups

**Why our approach is better:**

- ✅ Simpler implementation leveraging Discord.js built-in features
- ✅ Better performance with synchronous Set lookups
- ✅ Less code to maintain
- ✅ Direct integration into cache/sweeper configuration

### What We Removed (Unnecessary Steps)

The following steps from the original plan are **NOT needed** with our implementation:

## Monitoring & Metrics

### Track Cache Performance

Add logging to monitor cache efficiency:

```typescript
// Log cache stats every hour
setInterval(() => {
  logger.info("Cache Statistics", {
    location: "bot.cache-monitor",
    fields: {
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
      channels: client.channels.cache.size,
      guildMembers: Array.from(client.guilds.cache.values()).reduce(
        (sum, guild) => sum + guild.members.cache.size,
        0
      ),
      emojis: client.application?.emojis.cache.size ?? 0,
    },
  });
}, 3600000); // Every hour
```

### Expected Metrics (10,000 guilds)

- **Guilds cached:** 10,000
- **Users cached:** ~500 (registered users only)
- **Channels cached:** ~50 (recently accessed)
- **Guild members cached:** ~1,000-2,000 (registered users across guilds)
- **Total memory:** 5-10 GB

## Testing

### Test Cache Behavior

```typescript
// apps/bot/test/cache.test.ts

describe("Cache Management", () => {
  it("should not cache unregistered users", async () => {
    const unregisteredUser = createMockUser("999999999999999999");

    // User should not be added to cache
    const shouldCache = await shouldCacheUser(unregisteredUser);
    expect(shouldCache).toBe(false);
  });

  it("should cache registered users", async () => {
    const registeredUser = createMockUser("123456789012345678");
    await AppUser.from(registeredUser).create();

    const shouldCache = await shouldCacheUser(registeredUser);
    expect(shouldCache).toBe(true);
  });

  it("should sweep unregistered members", async () => {
    const member = createMockGuildMember("999999999999999999");

    // Should be swept (return true from filter)
    const sweeper = sweeperOptions.guildMembers.filter();
    const shouldSweep = await sweeper(member);
    expect(shouldSweep).toBe(true);
  });
});
```

## Migration Path

1. **Phase 1 (Current):** Use simple size limits and aggressive sweeping
2. **Phase 2:** Implement `RegisteredUsersCache` and sync on startup
3. **Phase 3:** Add cache filters using `RegisteredUsersCache`
4. **Phase 4:** Add event-based cache management (on registration/deletion)
5. **Phase 5:** Monitor and tune based on production metrics

## References

- [Discord.js Caching Guide](https://discordjs.guide/additional-info/caching.html)
- [Discord.js Client Options](https://discord.js.org/docs/packages/discord.js/14.25.1/Client:Class#options)
- [Discord.js Sweepers](https://discord.js.org/docs/packages/discord.js/14.25.1/SweeperOptions:Interface)
- [Discord.js Make Cache Settings](https://discord.js.org/docs/packages/discord.js/14.25.1/MakeCacheSettings:TypeAlias)

---

**Questions or Issues?** Check the QUICKSTART.md or ask in the development Discord channel.
