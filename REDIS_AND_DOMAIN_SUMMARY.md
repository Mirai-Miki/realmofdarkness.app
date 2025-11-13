# Redis Events & Domain Logic - Summary of Changes

**Date:** November 5, 2025  
**Context:** Updates to refactor plan based on Redis event system and business logic placement

---

## 🎯 Your Questions Answered

### 1. Redis Event System for Real-Time Communication

**✅ ADDRESSED** - Created comprehensive `EVENTS_SYSTEM.md` document and added `events/` package to Phase 1.

#### The Problem You Identified

Multiple independent processes (NestJS API, Discord bot shards, React web) need to communicate:
- Bot updates character → Web clients need to know
- API initiates dice roll → Bot needs to post to Discord
- Future: API interacts with Discord REST API directly

#### The Solution

**New Package: `events/`**
- Redis pub/sub with typed event contracts (Zod schemas)
- Type-safe event client (`RedisEventClient`)
- Channels for different event types
- Metadata tracking (correlation IDs, timestamps, sources)

#### Key Features

1. **Character Events**
   - `character:created`, `character:updated`, `character:deleted`
   - Bot publishes → API subscribes → WebSocket broadcast

2. **Gateway Events**
   - `gateway:broadcast` - push messages to web clients
   - Targeted by user, guild, or connection ID

3. **Discord Events**
   - `discord:message:request` - API requests bot to post
   - `discord:diceroll:post` - send dice results to Discord
   - Bot listens and executes

4. **System Events**
   - Health checks, graceful shutdowns
   - Monitoring and observability

#### Example Flow: Bot Updates Character

```typescript
// 1. Bot command handler
async function handleHungerCommand(interaction) {
  // Load from database
  const char = await charRepo.findByUser(userId, name);
  
  // Use domain logic
  char.increaseHunger(1);
  
  // Save to database
  await charRepo.update(char);
  
  // Publish Redis event
  await eventClient.publish(Channels.CHARACTER_UPDATED, schema, {
    type: 'character:updated',
    data: { characterId, userId, guildId, name, changedFields: ['hunger'] },
  });
}

// 2. API subscribes to events
eventClient.subscribe(Channels.CHARACTER_UPDATED, schema, async (event) => {
  // Broadcast to WebSocket clients
  await gateway.broadcastToUser(event.data.userId, {
    type: 'CHARACTER_UPDATED',
    payload: event.data,
  });
});

// 3. React receives via WebSocket and updates UI
```

#### Discord REST API Usage

For future Discord interactions (like dice rolls initiated by API):

```typescript
// api/src/dice/dice.service.ts

async rollForCharacter(userId, guildId, channelId, pool) {
  // Roll using domain logic
  const result = this.diceRoller.rollV5(pool);
  
  // Publish event for bot to post to Discord
  await eventClient.publish(Channels.DISCORD_DICE_ROLL, schema, {
    type: 'discord:diceroll:post',
    data: { guildId, channelId, userId, roll: result },
  });
}

// bot/src/events/redis-listener.ts
eventClient.subscribe(Channels.DISCORD_DICE_ROLL, schema, async (event) => {
  // Bot uses Discord.js to post the result
  const channel = client.channels.cache.get(event.data.channelId);
  await channel.send({ embeds: [createRollEmbed(event.data.roll)] });
});
```

**Note:** You're right that for simple Discord REST operations, you could use `@discordjs/rest` directly in the API without needing Redis events. However, Redis events provide:
- ✅ Consistent pattern across all cross-app communication
- ✅ Bot shards can route messages to correct guild
- ✅ Decoupling (API doesn't need Discord tokens)
- ✅ Future flexibility (different bots, Discord.js client caching benefits)

Choose the approach that fits each use case!

---

### 2. Domain & Repository Pattern Explained

**✅ ADDRESSED** - Created comprehensive `DOMAIN_REPOSITORY_EXPLAINED.md` document.

#### The Short Answer

**Domain Layer:**
- Rich objects with **data + behavior** (methods)
- Business rules live here
- Framework-agnostic (no NestJS, no Drizzle, no Discord.js imports)
- Easy to test, reusable everywhere

**Repository Layer:**
- Bridges domain models and database
- Loads/saves domain entities
- Hides database implementation
- Provides clean query interface

#### Visual Summary

```
┌────────────────────┐
│   Controllers      │  "I need a character"
└────────┬───────────┘
         │
┌────────▼───────────┐
│   Services         │  "Load it, modify it, save it"
└────────┬───────────┘
         │
┌────────▼───────────┐
│  Repositories      │  "Here's the domain model"
└────────┬───────────┘
         │
┌────────▼───────────┐
│  Domain Models     │  "I know how to update hunger"
│  (Vampire5th)      │
└────────────────────┘
```

#### Example: Vampire5th Domain Model

```typescript
export class Vampire5th extends Character5th {
  private _hunger: number = 1;
  
  // Business logic method
  increaseHunger(amount: number = 1): void {
    this._hunger = Math.min(5, this._hunger + amount);
    
    if (this._hunger >= 5) {
      this.triggerHungerFrenzy(); // Domain event
    }
  }
  
  // Validation
  validate(): ValidationResult {
    if (this._hunger < 0 || this._hunger > 5) {
      return { isValid: false, errors: ['Hunger must be 0-5'] };
    }
    return { isValid: true, errors: [] };
  }
  
  // Serialization for database
  serialize(): Vampire5thData {
    return { hunger: this._hunger, /* ... */ };
  }
}
```

#### Example: Repository

```typescript
export class CharacterRepository {
  async findById(id: number): Promise<Character | null> {
    // Query database
    const row = await db.select().from(characters).where(eq(characters.id, id));
    
    if (!row) return null;
    
    // Map to domain model (polymorphic based on splat)
    return CharacterMapper.toDomain(row);
  }
  
  async update(character: Character): Promise<Character> {
    // Validate domain model
    const validation = character.validate();
    if (!validation.isValid) throw new Error('Invalid character');
    
    // Serialize domain model to database format
    const data = CharacterMapper.fromDomain(character);
    
    // Update database
    const result = await db.update(characters).set(data).where(eq(characters.id, character.id));
    
    return CharacterMapper.toDomain(result);
  }
}
```

#### Why This Pattern?

1. **Testability**: Domain models have no dependencies
2. **Reusability**: Same models work in API, bots, migration tools
3. **Maintainability**: Business logic in one clear place
4. **Flexibility**: Can swap database without changing domain
5. **Team-Friendly**: Clear boundaries for different developers

---

### 3. Moving Dice Rolling to Domain

**✅ ADDRESSED** - Yes, dice rolling is business logic and belongs in `domain/services/`.

#### Current State (Problem)

```
bot/src/modules/diceRoller.js  ← Dice logic here (only bot can use)
```

#### Future State (Solution)

```
domain/src/services/DiceRoller.ts  ← Dice logic here (everyone can use)
```

#### Why Move It?

1. **Business Logic**: Dice rolling is a game mechanic (V5, V20, CoD rules)
2. **Reusability**: API will need dice rolling for web-initiated rolls
3. **Testability**: Easier to test without Discord.js dependencies
4. **Consistency**: Same dice logic everywhere (no drift between API/bot)
5. **Framework-Agnostic**: Dice rules don't care about Discord or NestJS

#### Example: DiceRoller Service

```typescript
// domain/src/services/DiceRoller.ts

export class DiceRoller {
  /**
   * Roll V5 dice (6+ success, 10s are crits, hunger dice)
   */
  rollV5(pool: number, difficulty: number = 6, hungerDice: number = 0): V5RollResult {
    const normalDice = this.rollDice(pool - hungerDice);
    const hungerDiceResults = this.rollDice(hungerDice);
    
    let successes = 0;
    let criticals = 0;
    
    // Count successes and crits
    for (const die of normalDice) {
      if (die >= difficulty) successes++;
      if (die === 10) criticals++;
    }
    
    // Hunger dice special rules
    let messyCritical = false;
    for (const die of hungerDiceResults) {
      if (die >= difficulty) successes++;
      if (die === 10) {
        criticals++;
        messyCritical = true; // Hunger die in crits = messy
      }
    }
    
    // Pairs of 10s = critical success
    if (criticals >= 2) {
      successes += Math.floor(criticals / 2) * 2;
    }
    
    return {
      normalDice,
      hungerDice: hungerDiceResults,
      successes,
      criticals,
      messyCritical,
    };
  }
  
  rollV20(pool: number, difficulty: number = 6): V20RollResult {
    // V20 rules: 10s count double, 1s cancel successes
    // ...
  }
  
  rollCoD(pool: number): CoDRollResult {
    // Chronicles rules: 8+ success, 10-again
    // ...
  }
  
  private rollDice(count: number): number[] {
    return Array.from({ length: count }, () => 
      Math.floor(Math.random() * 10) + 1
    );
  }
}
```

#### Usage in Bot

```typescript
// bot/src/commands/roll.ts

import { DiceRoller } from 'domain/services/DiceRoller';

export async function handleRollCommand(interaction: CommandInteraction) {
  const pool = interaction.options.getInteger('pool', true);
  
  // Use domain service
  const roller = new DiceRoller();
  const result = roller.rollV5(pool);
  
  // Format for Discord
  await interaction.reply(formatRollResult(result));
}
```

#### Usage in API

```typescript
// api/src/dice/dice.service.ts

import { DiceRoller } from 'domain/services/DiceRoller';

@Injectable()
export class DiceService {
  private roller = new DiceRoller();
  
  async rollForWeb(pool: number) {
    // Same logic as bot!
    return this.roller.rollV5(pool);
  }
}
```

#### What Stays in Bot?

Only **Discord-specific** code:
- Command registration
- Interaction handling
- Embed formatting
- Discord.js client management
- Discord REST API wrappers

#### What Moves to Domain?

All **game mechanics**:
- Dice rolling (V5, V20, CoD)
- Damage calculation
- Experience spending
- Character creation rules
- Initiative ordering

---

## 📦 Updated Package Structure

```
realm-of-darkness/
├── shared/              ✅ Types, errors, logger, validation
├── database/            ✅ Drizzle schemas
├── events/              ❌ NEW - Redis pub/sub system
│   ├── client/          RedisEventClient
│   ├── contracts/       Event schemas (Zod)
│   ├── channels/        Channel names
│   └── types/           Event metadata
├── domain/              ❌ NEW - Business logic
│   ├── models/          Character classes
│   ├── services/        DiceRoller, ExperienceService
│   ├── events/          Domain events
│   └── interfaces/      Repository interfaces
├── repositories/        🔜 Phase 2 - Data access
├── api/                 ⚠️ NestJS API
├── bot/                 ⚠️ Discord bots (needs migration)
└── web/                 ⏳ React frontend
```

---

## 🎯 Phase 1 Updated Goals

**Original:**
- ✅ Create `domain/` package
- ✅ Port character models
- ✅ Define repository interfaces

**Updated:**
- ✅ Create `domain/` package
- ✅ Create `events/` package ← **NEW**
- ✅ Port character models
- ✅ Move dice rolling to `domain/services/DiceRoller` ← **NEW**
- ✅ Define repository interfaces
- ✅ Define event contracts for Redis pub/sub ← **NEW**

---

## 📚 New Documentation

1. **[EVENTS_SYSTEM.md](./EVENTS_SYSTEM.md)**
   - Complete Redis event system design
   - Event contracts and schemas
   - Usage examples for all scenarios
   - Testing strategies

2. **[DOMAIN_REPOSITORY_EXPLAINED.md](./DOMAIN_REPOSITORY_EXPLAINED.md)**
   - Domain-Driven Design concepts
   - Why rich models vs anemic models
   - Repository pattern explained
   - Detailed code examples
   - FAQ for common questions

3. **Updated [REFACTOR_PLAN.md](./REFACTOR_PLAN.md)**
   - Added `events/` package description
   - Updated Phase 1 to include event system
   - Clarified business logic placement
   - Updated bot migration phase

---

## 🚀 Immediate Next Steps

### Week 1-2 Tasks (Updated)

1. **Create `events/` package**
   - Set up structure
   - Implement `RedisEventClient`
   - Define character, gateway, Discord event contracts

2. **Create `domain/` package**
   - Set up structure
   - Start base `Character` class

3. **Move dice rolling**
   - Extract logic from `bot/src/modules/diceRoller.js`
   - Create `domain/src/services/DiceRoller.ts`
   - Add unit tests

4. **Define event flow**
   - Document which events each app publishes/subscribes to
   - Test Redis connection

---

## ✅ Summary

Your insights were spot-on! The refactor plan now includes:

1. **✅ Redis Event System**
   - New `events/` package for real-time communication
   - Type-safe pub/sub with Zod schemas
   - Supports all cross-app communication needs

2. **✅ Domain/Repository Pattern**
   - Comprehensive explanation document
   - Clear separation of concerns
   - Business logic lives in domain layer

3. **✅ Dice Logic Migration**
   - Move from bot to `domain/services/`
   - Reusable across API, bots, and future tools
   - Framework-agnostic design

The architecture now supports:
- Real-time updates from bot → web
- API-initiated Discord messages
- Shared game mechanics (dice, damage, XP)
- Scalable multi-shard bot architecture
- Future extensibility

All documentation is updated and ready for implementation! 🎉
