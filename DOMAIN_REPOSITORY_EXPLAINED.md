# Domain & Repository Pattern - Explained

**For developers new to Domain-Driven Design (DDD) concepts**

---

## The Problem: Where Does Business Logic Live?

In traditional applications, you often see one of these problematic patterns:

### ❌ Anti-Pattern 1: Fat Controllers

```typescript
// api/src/character/character.controller.ts

@Post()
async createCharacter(@Body() dto: CreateCharacterDto) {
  // Controller has ALL the logic!
  const character = {
    name: dto.name,
    userId: dto.userId,
    health: 10,
    willpower: 5,
    // ... 100 lines of initialization logic
  };

  // Validation mixed with database code
  if (character.health < 0 || character.health > 10) {
    throw new Error('Invalid health');
  }

  // Direct database manipulation
  const result = await db.insert(characters).values(character);

  return result;
}
```

**Problems:**

- Business logic in controllers (hard to test)
- Database details leak everywhere
- Can't reuse logic (bots need same logic!)
- No place for domain rules

### ❌ Anti-Pattern 2: Anemic Models

```typescript
// Just data, no behavior
interface Character {
  name: string;
  health: number;
  willpower: number;
}

// All logic in service methods
class CharacterService {
  updateHealth(char: Character, damage: number) {
    char.health -= damage;
    if (char.health < 0) char.health = 0;
    return char;
  }

  updateWillpower(char: Character, amount: number) {
    char.willpower += amount;
    if (char.willpower > 10) char.willpower = 10;
    return char;
  }

  // 50 more methods manipulating Character data...
}
```

**Problems:**

- Data and behavior separated
- Easy to bypass rules (just modify `char.health` directly)
- Difficult to understand what a Character "is"
- Logic scattered across multiple services

---

## The Solution: Domain & Repository Pattern

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Controllers, Command Handlers) │
│  - Receives requests                                │
│  - Validates input (Zod schemas)                    │
│  - Calls application services                       │
│  - Returns responses                                │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│  APPLICATION LAYER (Services)                       │
│  - Orchestrates workflows                           │
│  - Uses repositories to load/save entities          │
│  - Uses domain models for business logic            │
│  - Handles transactions                             │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│  DOMAIN LAYER (Rich Models, Business Logic)         │
│  - Character, Vampire5th, Hunter5th classes         │
│  - Business rules (hunger system, damage, XP)       │
│  - Domain events                                    │
│  - NO DATABASE CODE                                 │
│  - NO FRAMEWORK CODE                                │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│  REPOSITORY LAYER (Data Access)                     │
│  - Loads domain entities from DB                    │
│  - Saves domain entities to DB                      │
│  - Translates DB records ↔ Domain models            │
│  - Hides database implementation details            │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│  PERSISTENCE LAYER (Database)                       │
│  - Drizzle ORM                                      │
│  - PostgreSQL                                       │
│  - Raw data (tables, columns, rows)                │
└─────────────────────────────────────────────────────┘
```

---

## Domain Models: Rich Objects with Behavior

### What is a Domain Model?

A domain model is a class that represents a real-world concept **with both data and behavior**.

### Example: Vampire5th Domain Model

```typescript
// domain/src/models/5th/Vampire5th.ts

/**
 * Vampire5th is a rich domain model representing a V5 vampire character.
 * It contains both data (hunger, humanity) and behavior (feed, frenzy).
 */
export class Vampire5th extends Character5th {
  // Properties (state)
  private _hunger: number = 1;
  private _humanity: number = 7;
  private _stains: number = 0;
  private _bloodPotency: number = 0;
  private _disciplines: Map<string, Discipline> = new Map();

  // Getters provide controlled access
  get hunger(): number {
    return this._hunger;
  }
  get humanity(): number {
    return this._humanity;
  }
  get stains(): number {
    return this._stains;
  }
  get bloodPotency(): number {
    return this._bloodPotency;
  }

  /**
   * Business logic: Increase hunger (V5 rules)
   * - Hunger ranges from 0-5
   * - At 5, vampire is in Hunger Frenzy
   */
  increaseHunger(amount: number = 1): void {
    this._hunger = Math.min(5, this._hunger + amount);

    if (this._hunger >= 5) {
      this.triggerHungerFrenzy();
    }
  }

  /**
   * Business logic: Feed to reduce hunger
   * - Amount depends on blood potency
   * - Can't reduce below 1 (vampires are always hungry)
   */
  feed(resonance?: string): void {
    const reduction = this.calculateHungerReduction(resonance);
    this._hunger = Math.max(1, this._hunger - reduction);
  }

  /**
   * Business logic: Add stain to humanity
   * - Stains track path to damnation
   * - When stains >= humanity, must make remorse roll
   */
  addStain(amount: number = 1): void {
    this._stains = Math.min(10, this._stains + amount);

    if (this._stains >= this._humanity) {
      // Domain event: trigger remorse roll
      this.emit("remorseRequired", { character: this });
    }
  }

  /**
   * Business logic: Remorse roll (V5 rules)
   * - Roll dice equal to humanity
   * - Each success removes one stain
   * - If stains remain, lose 1 humanity
   */
  performRemorseRoll(): RemorseResult {
    const dicePool = this._humanity;
    const successes = this.rollDice(dicePool);

    const stainsRemoved = Math.min(successes, this._stains);
    this._stains -= stainsRemoved;

    if (this._stains > 0) {
      this._humanity = Math.max(0, this._humanity - 1);
      this._stains = 0;

      if (this._humanity === 0) {
        // Domain event: character lost to beast
        this.emit("lostToTheBeast", { character: this });
      }
    }

    return {
      diceRolled: dicePool,
      successes,
      stainsRemoved,
      humanityLost: this._stains > 0 ? 1 : 0,
    };
  }

  /**
   * Business logic: Check if can use discipline
   */
  canActivateDiscipline(disciplineId: string, powerLevel: number): boolean {
    const discipline = this._disciplines.get(disciplineId);
    if (!discipline) return false;

    // Must have discipline rating >= power level
    if (discipline.rating < powerLevel) return false;

    // Can't use disciplines at hunger 5 (beastial failure risk)
    if (this._hunger >= 5) return false;

    return true;
  }

  /**
   * Validation: Ensure vampire is in valid state
   */
  validate(): ValidationResult {
    const errors: string[] = [];

    if (this._hunger < 0 || this._hunger > 5) {
      errors.push("Hunger must be between 0 and 5");
    }

    if (this._humanity < 0 || this._humanity > 10) {
      errors.push("Humanity must be between 0 and 10");
    }

    if (this._stains > this._humanity) {
      errors.push("Stains cannot exceed humanity");
    }

    if (this._bloodPotency < 0 || this._bloodPotency > 10) {
      errors.push("Blood Potency must be between 0 and 10");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Serialization: Convert to plain object for storage
   */
  serialize(): Vampire5thData {
    return {
      hunger: this._hunger,
      humanity: this._humanity,
      stains: this._stains,
      bloodPotency: this._bloodPotency,
      disciplines: Array.from(this._disciplines.values()).map((d) =>
        d.serialize()
      ),
      // ... all other vampire data
    };
  }

  // Private helper methods
  private calculateHungerReduction(resonance?: string): number {
    // V5 rules: feeding reduction depends on blood potency
    const baseReduction = 2;
    const resonanceBonus = resonance ? 1 : 0;
    return baseReduction + resonanceBonus;
  }

  private triggerHungerFrenzy(): void {
    // Domain event: character in hunger frenzy
    this.emit("hungerFrenzy", { character: this });
  }
}
```

### Key Principles of Domain Models

1. **Encapsulation**: Internal state is private, accessed via methods
2. **Business Logic**: Rules live in the model (not scattered in services)
3. **Validation**: Model ensures it's always in a valid state
4. **Framework-Agnostic**: No imports from NestJS, Drizzle, Discord.js, etc.
5. **Testable**: Easy to test in isolation (just instantiate the class)

---

## Repositories: Bridge Between Domain and Database

### What is a Repository?

A repository is a class that:

- Loads domain entities from the database
- Saves domain entities to the database
- Translates between database records and domain models
- Hides all database implementation details

### Example: CharacterRepository

```typescript
// repositories/src/CharacterRepository.ts

import { db } from "database";
import { characters, type CharacterDb } from "database";
import { Vampire5th, Hunter5th, Character } from "domain";
import { CharacterMapper } from "./mappers/CharacterMapper";
import { ICharacterRepository } from "domain/interfaces";

/**
 * Repository for Character entities.
 * Handles all database operations for characters.
 */
export class CharacterRepository implements ICharacterRepository {
  /**
   * Find a character by ID
   * Returns null if not found
   */
  async findById(id: number): Promise<Character | null> {
    const result = await db
      .select()
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);

    if (result.length === 0) return null;

    // Map database record to domain model
    return CharacterMapper.toDomain(result[0]);
  }

  /**
   * Find a character by user and name
   */
  async findByUser(userId: bigint, name: string): Promise<Character | null> {
    const result = await db
      .select()
      .from(characters)
      .where(and(eq(characters.userId, userId), eq(characters.name, name)))
      .limit(1);

    if (result.length === 0) return null;

    return CharacterMapper.toDomain(result[0]);
  }

  /**
   * Find all characters for a user
   */
  async findAllByUser(userId: bigint): Promise<Character[]> {
    const results = await db
      .select()
      .from(characters)
      .where(eq(characters.userId, userId));

    return results.map((r) => CharacterMapper.toDomain(r));
  }

  /**
   * Create a new character
   */
  async create(character: Character): Promise<Character> {
    // Validate before saving
    const validation = character.validate();
    if (!validation.isValid) {
      throw new RealmError("Cannot save invalid character", {
        location: "CharacterRepository.create",
        fields: { errors: validation.errors.join(", ") },
      });
    }

    // Map domain model to database record
    const dbRecord = CharacterMapper.fromDomain(character);

    // Insert into database
    const result = await db.insert(characters).values(dbRecord).returning();

    // Return updated domain model with ID
    return CharacterMapper.toDomain(result[0]);
  }

  /**
   * Update an existing character
   */
  async update(character: Character): Promise<Character> {
    if (!character.id) {
      throw new RealmError("Cannot update character without ID", {
        location: "CharacterRepository.update",
      });
    }

    // Validate before saving
    const validation = character.validate();
    if (!validation.isValid) {
      throw new RealmError("Cannot save invalid character", {
        location: "CharacterRepository.update",
        fields: { errors: validation.errors.join(", ") },
      });
    }

    // Map domain model to database record
    const dbRecord = CharacterMapper.fromDomain(character);

    // Update in database
    const result = await db
      .update(characters)
      .set({
        ...dbRecord,
        lastUpdated: new Date(),
      })
      .where(eq(characters.id, character.id))
      .returning();

    return CharacterMapper.toDomain(result[0]);
  }

  /**
   * Delete a character
   */
  async delete(id: number): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
  }

  /**
   * Get the active sheet for a user (optionally in a guild)
   */
  async getActiveSheet(
    userId: bigint,
    guildId?: bigint
  ): Promise<Character | null> {
    let query = db
      .select()
      .from(characters)
      .where(and(eq(characters.userId, userId), eq(characters.isSheet, true)));

    if (guildId) {
      query = query.where(eq(characters.guildId, guildId));
    }

    const result = await query.limit(1);

    if (result.length === 0) return null;

    return CharacterMapper.toDomain(result[0]);
  }
}
```

### Character Mapper: Translation Layer

```typescript
// repositories/src/mappers/CharacterMapper.ts

import type { CharacterDb } from "database";
import {
  Character,
  Vampire5th,
  Hunter5th,
  Werewolf5th,
  // ... all character types
} from "domain";
import { Splats } from "shared";

/**
 * Mapper between database records and domain models.
 * Handles polymorphic deserialization based on splat.
 */
export class CharacterMapper {
  /**
   * Convert database record to domain model
   * Returns the correct subclass based on splat field
   */
  static toDomain(db: CharacterDb): Character {
    // Common base data
    const baseData = {
      id: db.id,
      name: db.name,
      userId: db.userId,
      guildId: db.guildId ?? undefined,
      splat: db.splat,
      isSheet: db.isSheet,
      createdAt: db.createdAt,
      lastUpdated: db.lastUpdated,
    };

    // Deserialize JSONB data and create appropriate subclass
    switch (db.splat) {
      case Splats.Vampire5th:
        return new Vampire5th(baseData, db.data as Vampire5thData);

      case Splats.Hunter5th:
        return new Hunter5th(baseData, db.data as Hunter5thData);

      case Splats.Werewolf5th:
        return new Werewolf5th(baseData, db.data as Werewolf5thData);

      // ... all other splats

      default:
        throw new RealmError("Unknown character splat", {
          location: "CharacterMapper.toDomain",
          fields: { splat: db.splat },
        });
    }
  }

  /**
   * Convert domain model to database record
   */
  static fromDomain(
    character: Character
  ): Omit<CharacterDb, "id" | "createdAt" | "lastUpdated"> {
    return {
      name: character.name,
      userId: character.userId,
      guildId: character.guildId ?? null,
      splat: character.splat,
      isSheet: character.isSheet,
      data: character.serialize(), // Call serialize() on domain model
    };
  }
}
```

---

## How It All Works Together

### Scenario: User Updates Hunger via Discord Bot

```typescript
// bot/src/commands/hunger.ts

import { CommandInteraction } from "discord.js";
import { CharacterRepository } from "repositories";
import { db } from "database";
import { UserError } from "shared";

export async function handleHungerCommand(interaction: CommandInteraction) {
  const characterName = interaction.options.getString("character", true);
  const userId = BigInt(interaction.user.id);

  // 1. REPOSITORY: Load character from database
  const repo = new CharacterRepository(db);
  const character = await repo.findByUser(userId, characterName);

  if (!character) {
    throw new UserError("Character not found");
  }

  // 2. TYPE GUARD: Ensure it's a vampire
  if (!char.isVampire5th()) {
    throw new UserError("Character must be a vampire");
  }

  // 3. DOMAIN: Use business logic
  character.increaseHunger(1);

  // Optional: Listen for domain events
  character.on("hungerFrenzy", () => {
    interaction.followUp("⚠️ Your character is in Hunger Frenzy!");
  });

  // 4. REPOSITORY: Save changes
  await repo.update(character);

  // 5. RESPOND
  await interaction.reply({
    content: `${character.name}'s hunger is now ${character.hunger}`,
  });
}
```

**What just happened?**

1. **Repository loaded** the character from the database
2. **Mapper transformed** database record → Vampire5th domain model
3. **Domain model** applied business rules (hunger 0-5, trigger frenzy at 5)
4. **Repository saved** the character back to database
5. **Mapper transformed** Vampire5th → database record

**Key benefits:**

- ✅ Business logic is in `Vampire5th` class (testable, reusable)
- ✅ Database details hidden in repository
- ✅ Bot code is simple and readable
- ✅ Same code works in API, bots, migration tools

---

## Moving Dice Rolling to Domain

### Current State: Dice Logic in Bot

```typescript
// bot/src/modules/diceRoller.js (current JavaScript)

function rollV5(pool, difficulty) {
  const dice = [];
  let successes = 0;
  let criticals = 0;

  for (let i = 0; i < pool; i++) {
    const die = Math.floor(Math.random() * 10) + 1;
    dice.push(die);

    if (die >= 6) successes++;
    if (die === 10) criticals++;
  }

  // Pairs of 10s create critical successes
  const critPairs = Math.floor(criticals / 2);
  successes += critPairs * 2;

  return { dice, successes, criticals, critPairs };
}
```

### Future State: Dice Logic in Domain

```typescript
// domain/src/services/DiceRoller.ts

/**
 * Domain service for dice rolling mechanics.
 * Implements rules for V5, V20, and CoD systems.
 */
export class DiceRoller {
  /**
   * Roll dice using V5 rules
   *
   * @param pool - Number of dice to roll
   * @param difficulty - Optional difficulty (default: 6)
   * @param hungerDice - Number of hunger dice (different rules)
   * @returns Roll result with successes, criticals, etc.
   */
  rollV5(
    pool: number,
    difficulty: number = 6,
    hungerDice: number = 0
  ): V5RollResult {
    if (pool < 0) {
      throw new RealmError("Dice pool cannot be negative", {
        location: "DiceRoller.rollV5",
        fields: { pool: pool.toString() },
      });
    }

    const normalPool = pool - hungerDice;
    if (normalPool < 0) {
      throw new RealmError("Hunger dice cannot exceed pool", {
        location: "DiceRoller.rollV5",
        fields: { pool: pool.toString(), hungerDice: hungerDice.toString() },
      });
    }

    // Roll normal dice
    const normalDice = this.rollDice(normalPool);
    const hungerDiceResults = this.rollDice(hungerDice);

    // Count successes (6+ on normal dice, 6+ on hunger dice)
    let successes = 0;
    let criticals = 0;
    let messyCritical = false;
    let bestialFailure = false;

    for (const die of normalDice) {
      if (die >= difficulty) successes++;
      if (die === 10) criticals++;
    }

    let hungerCriticals = 0;
    let hungerOnes = 0;
    for (const die of hungerDiceResults) {
      if (die >= difficulty) successes++;
      if (die === 10) {
        criticals++;
        hungerCriticals++;
      }
      if (die === 1) hungerOnes++;
    }

    // V5 special rules
    if (criticals >= 2) {
      // Pairs of 10s create critical success
      const critPairs = Math.floor(criticals / 2);
      successes += critPairs * 2; // Each pair adds 2 extra successes

      // If any hunger dice in the crits, it's a Messy Critical
      if (hungerCriticals > 0) {
        messyCritical = true;
      }
    }

    // Bestial Failure: no successes but at least one hunger 1
    if (successes === 0 && hungerOnes > 0) {
      bestialFailure = true;
    }

    return {
      normalDice,
      hungerDice: hungerDiceResults,
      allDice: [...normalDice, ...hungerDiceResults],
      successes,
      criticals,
      messyCritical,
      bestialFailure,
      difficulty,
      pool,
    };
  }

  /**
   * Roll dice using V20 rules
   *
   * @param pool - Number of dice to roll
   * @param difficulty - Target number (default: 6)
   * @returns Roll result with successes, botches
   */
  rollV20(pool: number, difficulty: number = 6): V20RollResult {
    const dice = this.rollDice(pool);

    let successes = 0;
    let ones = 0;

    for (const die of dice) {
      if (die >= difficulty) {
        successes++;
        // 10s count as 2 successes in V20
        if (die === 10) successes++;
      }
      if (die === 1) ones++;
    }

    // Botch: no successes and at least one 1
    const botch = successes === 0 && ones > 0;

    return {
      dice,
      successes,
      ones,
      botch,
      difficulty,
      pool,
    };
  }

  /**
   * Roll dice using Chronicles of Darkness rules
   */
  rollCoD(pool: number): CoDRollResult {
    const dice = this.rollDice(pool);

    let successes = 0;
    let tens = 0;

    for (const die of dice) {
      if (die >= 8) successes++; // 8, 9, 10 are successes in CoD
      if (die === 10) tens++;
    }

    // 10-again rule: reroll 10s
    if (tens > 0) {
      const rerollDice = this.rollDice(tens);
      for (const die of rerollDice) {
        if (die >= 8) successes++;
      }
    }

    return {
      dice,
      successes,
      tens,
      pool,
    };
  }

  /**
   * Generate random dice rolls
   */
  private rollDice(count: number): number[] {
    const dice: number[] = [];
    for (let i = 0; i < count; i++) {
      dice.push(Math.floor(Math.random() * 10) + 1);
    }
    return dice;
  }
}
```

### Usage in Bot

```typescript
// bot/src/commands/roll.ts

import { DiceRoller } from "domain/services/DiceRoller";

export async function handleRollCommand(interaction: CommandInteraction) {
  const pool = interaction.options.getInteger("pool", true);
  const difficulty = interaction.options.getInteger("difficulty") ?? 6;

  // Use domain service
  const roller = new DiceRoller();
  const result = roller.rollV5(pool, difficulty);

  // Format and send response
  await interaction.reply({
    content: formatRollResult(result),
  });
}
```

### Usage in API

```typescript
// api/src/dice/dice.service.ts

import { DiceRoller } from "domain/services/DiceRoller";
import { RedisEventClient, Channels } from "events";

@Injectable()
export class DiceService {
  private roller = new DiceRoller();
  private eventClient: RedisEventClient;

  async rollForCharacter(
    userId: bigint,
    guildId: bigint,
    channelId: bigint,
    pool: number
  ) {
    // Same dice logic as bot!
    const result = this.roller.rollV5(pool);

    // Request bot to post to Discord
    await this.eventClient.publish(
      Channels.DISCORD_DICE_ROLL,
      DiscordDiceRollEventSchema,
      {
        type: "discord:diceroll:post",
        data: { guildId, channelId, userId, roll: result },
      }
    );

    return result;
  }
}
```

**Benefits of moving dice to domain:**

- ✅ Both API and bot use **exact same** dice logic
- ✅ Easy to test (just instantiate `DiceRoller`)
- ✅ Rules changes in one place
- ✅ Can extend with new systems (Exalted, Mage, etc.)
- ✅ No Discord.js or NestJS dependencies in dice logic

---

## Summary: Why This Pattern?

### Domain Layer Benefits

1. **Business Logic Centralized**: All rules in one place
2. **Testable**: No database, no framework, just logic
3. **Reusable**: Same code in API, bots, migration tools
4. **Understandable**: Reading a domain model tells you what the app does
5. **Protected**: Encapsulation prevents invalid states

### Repository Layer Benefits

1. **Decoupling**: Domain doesn't know about database
2. **Swappable**: Could change from Drizzle to Prisma without touching domain
3. **Testable**: Easy to mock for testing services
4. **Performance**: Optimize queries without changing domain
5. **Clear Contract**: Interface defines what persistence can do

### Overall Architecture Benefits

1. **Maintainable**: Change one layer without affecting others
2. **Scalable**: Add new character types by extending patterns
3. **Portable**: Domain layer could work in Deno, Bun, browser
4. **Team-Friendly**: Clear boundaries for different developers
5. **Future-Proof**: Easy to evolve over time

---

## Questions & Answers

### Q: Where does validation happen?

**A:** In two places:

- **Zod schemas** (shared package) - validate data at boundaries (API requests, WebSocket messages)
- **Domain models** - validate business rules (hunger 0-5, humanity 0-10, etc.)

### Q: Can I query the database directly?

**A:** No (in application code). Always use repositories. This keeps database details hidden.

**Exception:** For read-only analytics or admin tools, direct queries are fine.

### Q: What if I need a complex query?

**A:** Add a method to the repository:

```typescript
async findVampiresWithHighHunger(minHunger: number): Promise<Vampire5th[]> {
  // Complex query here
  const results = await db
    .select()
    .from(characters)
    .where(
      and(
        eq(characters.splat, 'vampire5th'),
        sql`data->>'hunger' >= ${minHunger}`
      )
    );

  return results.map(r => CharacterMapper.toDomain(r) as Vampire5th);
}
```

### Q: Should services be in the domain package?

**A:** Yes, if they contain business logic (like `DiceRoller`).

**No**, if they orchestrate (like `CharacterCreationService` that uses multiple repositories).

### Q: Can domain models call repositories?

**A:** No. Domain models should not know repositories exist. Services orchestrate domain models + repositories.

---

## Next Steps

With this understanding, you can:

1. ✅ Review the `Vampire5th` example in the plan
2. ✅ Start implementing base `Character` class
3. ✅ Create `CharacterRepository` interface
4. ✅ Move dice rolling logic to `domain/services/DiceRoller`
5. ✅ Use this pattern for all new features

This architecture will serve you well as the project grows! 🚀
