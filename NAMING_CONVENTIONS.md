# Naming Conventions

This document defines the naming conventions for the Realm of Darkness monorepo. All code must follow these conventions for consistency and maintainability.

## Core Principles

- **Type Safety First**: All code must use explicit types, interfaces, and type annotations
- **Documentation Required**: All functions, classes, and modules must include clear documentation
- **Consistency**: Follow established patterns across all packages and applications
- **Domain-Driven Organization**: Organize by domain rather than by type (in `@realm/common`)

---

## Architecture Overview

### Package Responsibilities

```
@realm/common     - Shared kernel (Data types, interfaces, contracts, Zod schemas)
@realm/core       - Business logic (entities, services, actions)
@realm/repositories - Data access implementations
@realm/database   - Database schema and connection
@realm/logger     - Logging singleton
@realm/events     - Event system (Redis pub/sub)
apps/api          - NestJS REST/WebSocket API
apps/bot          - Discord.js bot
apps/frontend     - React SPA
```

### Service Layer Architecture (`@realm/core`)

**Pure Services** (`src/services/`)

- Standalone operations (create character, update character, roll dice)
- **May** call repositories directly
- **Do NOT** call other services
- Return Data types

**Coordinator Services** (`src/actions/`)

- Complex workflows requiring multiple pure services
- Orchestrate between services
- Handle cross-cutting concerns
- Return Data types

**Apps (API, Bot)**

- Get data from endpoints/Discord
- Call coordinator services or pure services
- Handle presentation layer concerns

---

## File Naming Conventions

All files use **kebab-case** with descriptive suffixes to indicate their purpose.

### Common Package (`packages/common/src/`)

**Organization Principle**: Organize by **domain**, not by type.

**Small Domains** (single file):

```
user.definitions.ts          # All user-related: Data type, schemas, repository interface
guild.definitions.ts          # All guild-related: Data type, schemas, repository interface
member.definitions.ts         # All member-related: Data type, schemas, repository interface
supporter.definitions.ts      # All supporter-related: Data type, schemas, repository interface
```

**Large Domains** (folder with splits):

```
character/
├── character.definitions.ts           # Base character Data type, schemas, repository
├── v5.definitions.ts         # Vampire5th specific schemas
├── h5.definitions.ts          # Hunter5th specific schemas
├── w20.definitions.ts       # Werewolf20th specific schemas
└── index.ts                            # Barrel export
```

**Cross-Cutting Concerns** (folder split by type when it makes sense):

```
primitives/
├── snowflake.definitions.ts              # Snowflake type and schema
├── http-status.enum.ts       # HTTP status codes enum
├── environment.enum.ts       # Environment type
└── index.ts

logger/
├── logger.port.ts       # ILogger contract
├── logger.types.ts      # Logger types
└── index.ts

event-system.definitions.ts   # Event contracts and types
error.definitions.ts           # RealmError, UserError
repository.definitions.ts      # Base repository interfaces
```

### Core Package (`packages/core/src/`)

**Pure Services** (`services/`)

- Pattern: `{name}.service.ts`
- Examples: `character.service.ts`, `user.service.ts`, `guild.service.ts`
- Purpose: Standalone business operations
- May call repositories
- Do NOT call other services

**Coordinator Services** (`actions/`)

- Pattern: `{name}.action.ts`
- Examples: `create-character-sheet.action.ts`, `sync-member-profile.action.ts`
- Purpose: Complex workflows orchestrating multiple services
- Call pure services
- Handle transactions and multi-step operations

**Entities** (`entities/`)

- Pattern: `{name}.entity.ts`
- Examples: `user.entity.ts`, `member.entity.ts`, `guild.entity.ts`
- Purpose: Domain models wrapping Data types with business logic
- Expose `toData()` method for persistence

**Value Objects** (`value-objects/`)

- Pattern: `{name}.vo.ts`
- Examples: `dice-pool.vo.ts`, `damage-tracker.vo.ts`
- Purpose: Immutable objects defined by their values

**Utilities** (`utils/`)

- Pattern: `{name}.util.ts`
- Examples: `http.utility.ts`, `validation.utility.ts`

**Example Structure:**

```
core/
├── entities/
│   ├── user.entity.ts
│   ├── guild.entity.ts
│   ├── member.entity.ts
│   ├── supporter.entity.ts
│   └── characters/
│       ├── character.entity.ts
│       ├── vampire-5th.entity.ts
│       └── index.ts
├── services/
│   ├── user.service.ts
│   ├── guild.service.ts
│   ├── member.service.ts
│   └── index.ts
├── actions/
│   ├── create-character-sheet.action.ts
│   ├── sync-member-profile.action.ts
│   └── index.ts
├── value-objects/
│   ├── dice-pool.vo.ts
│   ├── damage-tracker.vo.ts
│   └── index.ts
└── utils/
    ├── http.utility.ts
    └── index.ts
```

### Repositories Package (`packages/repositories/src/`)

| Type           | Pattern                | Example                   |
| -------------- | ---------------------- | ------------------------- |
| **Repository** | `{name}.repository.ts` | `character.repository.ts` |
| **Mapper**     | `{name}.mapper.ts`     | `character.mapper.ts`     |

**Example Structure:**

```
repositories/
├── user.repository.ts
├── guild.repository.ts
├── member.repository.ts
└── mappers/
    ├── user.mapper.ts
    ├── guild.mapper.ts
    └── member.mapper.ts
```

### Database Package (`packages/database/src/`)

| Type       | Pattern     | Example                 |
| ---------- | ----------- | ----------------------- |
| **Schema** | `{name}.ts` | `users.ts`, `guilds.ts` |

**Example Structure:**

```
database/
├── schema/
│   ├── users.ts
│   ├── guilds.ts
│   ├── members.ts
│   ├── supporters.ts
│   └── characters.ts
├── schema_types.ts
└── index.ts
```

├── types/
│ ├── character.types.ts
│ ├── system.types.ts
│ ├── common.types.ts
│ └── index.ts
├── enums/
│ ├── splat.enum.ts
│ ├── game-system.enum.ts
│ └── index.ts
├── constants/
│ ├── experience.constants.ts
│ ├── validation.constants.ts
│ └── index.ts
├── utils/
│ ├── dice.util.ts
│ ├── validation.util.ts
│ └── index.ts
└── errors/
├── domain.error.ts
├── validation.error.ts
└── index.ts

````

### Application-Specific Files

#### Backend API (`apps/api/src/`)

| Type            | Pattern                 | Example                     |
| --------------- | ----------------------- | --------------------------- |
| **Controller**  | `{name}.controller.ts`  | `character.controller.ts`   |
| **Module**      | `{name}.module.ts`      | `character.module.ts`       |
| **Guard**       | `{name}.guard.ts`       | `auth.guard.ts`             |
| **Interceptor** | `{name}.interceptor.ts` | `logging.interceptor.ts`    |
| **Decorator**   | `{name}.decorator.ts`   | `current-user.decorator.ts` |
| **Pipe**        | `{name}.pipe.ts`        | `validation.pipe.ts`        |

**Note**: API uses services and actions from `@realm/core`, not its own service layer.

#### Discord Bot (`apps/bot/src/`)

| Type        | Pattern             | Example                                  |
| ----------- | ------------------- | ---------------------------------------- |
| **Command** | `{name}.command.ts` | `roll.command.ts`, `sheet.command.ts`    |
| **Event**   | `{name}.event.ts`   | `ready.event.ts`, `interaction.event.ts` |

**Note**: Bot uses services and actions from `@realm/core`, not its own service layer.

#### Frontend (`apps/frontend/src/`)

| Type          | Pattern             | Example                                 |
| ------------- | ------------------- | --------------------------------------- |
| **Component** | `{Name}.tsx`        | `CharacterSheet.tsx`, `DiceRoller.tsx`  |
| **Hook**      | `use{Name}.ts`      | `useCharacter.ts`, `useWebSocket.ts`    |
| **Context**   | `{Name}Context.tsx` | `AuthContext.tsx`, `ThemeContext.tsx`   |
| **Service**   | `{name}.service.ts` | `api.service.ts`, `gateway.service.ts`  |
| **Route**     | `{name}.route.tsx`  | `character.route.tsx`, `home.route.tsx` |

---

## Code Naming Conventions

### TypeScript

#### Classes and Interfaces

```typescript
// Classes: PascalCase
export class Character {}
export class CharacterCreationService {}
export class DicePool {}

// Interfaces: PascalCase with 'I' prefix
export interface ICharacterRepository {}
export interface IDiceRoller {}
export interface INotificationService {}

// Type aliases: PascalCase
export type CharacterId = string;
export type GameSystem = "V5" | "V20" | "CoD";
````

#### Functions and Variables

```typescript
// Functions: camelCase
function calculateExperience(level: number): number {}
function validateCharacterName(name: string): boolean {}

// Variables: camelCase
const characterName: string = "Dracula";
let experiencePoints: number = 0;
const isValid: boolean = true;

// Constants: UPPER_SNAKE_CASE
const MAX_ATTRIBUTE_VALUE = 5;
const DEFAULT_EXPERIENCE = 0;
const API_BASE_URL = "http://localhost:3000";
```

#### Enums

```typescript
// Enum name: PascalCase
// Enum values: PascalCase
export enum GameSystem {
  V5 = "V5",
  V20 = "V20",
  COD = "CoD",
}

export enum Splat {
  Vampire = "vampire",
  Werewolf = "werewolf",
  Mage = "mage",
}
```

#### Private Members

```typescript
export class Character {
  // Private fields: camelCase with underscore prefix
  private _id: string;
  private _name: string;

  // Public fields: camelCase
  public experience: number;

  // Readonly fields: camelCase
  public readonly createdAt: Date;
}
```

### React Components

```typescript
// Component files: PascalCase.tsx
// CharacterSheet.tsx
export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character }) => {
  return <div>{character.name}</div>;
};

// Props interface: {ComponentName}Props
interface CharacterSheetProps {
  character: Character;
  onUpdate?: (character: Character) => void;
}
```

### Git Branch Naming

Use the following prefixes for branch names:

- `feature/` - New features (e.g., `feature/character-creation`)
- `bugfix/` - Bug fixes (e.g., `bugfix/dice-roller-null-check`)
- `refactor/` - Code refactoring (e.g., `refactor/character-model`)
- `docs/` - Documentation updates (e.g., `docs/api-endpoints`)
- `test/` - Test additions/updates (e.g., `test/character-service`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)
- `deps/` - Dependency updates (e.g., `deps/upgrade-nestjs`)
- `config/` - Configuration changes (e.g., `config/eslint-rules`)
- `ci/` - CI/CD changes (e.g., `ci/github-actions`)
- `style/` - Code style changes (e.g., `style/prettier-format`)
- `perf/` - Performance improvements (e.g., `perf/optimize-queries`)
- `revert/` - Revert previous changes (e.g., `revert/feature-xyz`)

---

## Documentation Requirements

### JSDoc Comments

All public classes, interfaces, functions, and methods must include JSDoc documentation.

#### Class Documentation

````typescript
/**
 * Represents a playable character in the World of Darkness.
 * This is a pure domain entity with no external dependencies.
 *
 * @remarks
 * Characters are the core entity of the game system, representing
 * both player characters and non-player characters.
 *
 * @example
 * ```typescript
 * const character = new Character(
 *   '123',
 *   'Dracula',
 *   'player-456',
 *   Splat.Vampire,
 *   GameSystem.V5
 * );
 * ```
 */
export class Character {
  // ...
}
````

#### Function/Method Documentation

````typescript
/**
 * Calculates the experience cost for purchasing a trait.
 *
 * @param currentLevel - The current level of the trait (0-5)
 * @param targetLevel - The desired level of the trait (1-5)
 * @param traitType - The type of trait being purchased
 * @returns The total experience cost
 * @throws {ValidationError} If current level >= target level
 *
 * @example
 * ```typescript
 * const cost = calculateExperienceCost(2, 4, TraitType.Attribute);
 * // Returns experience cost to raise from 2 to 4
 * ```
 */
export function calculateExperienceCost(
  currentLevel: number,
  targetLevel: number,
  traitType: TraitType
): number {
  // Implementation
}
````

#### Interface Documentation

```typescript
/**
 * Repository contract for character persistence operations.
 *
 * @remarks
 * Implementations will handle actual data storage (REST API, WebSocket,
 * local cache, etc.). This interface defines the contract that all
 * implementations must follow.
 */
export interface ICharacterRepository {
  /**
   * Retrieves a character by their unique identifier.
   *
   * @param id - The character's unique identifier
   * @returns The character if found, null otherwise
   * @throws {RepositoryError} If the data source is unavailable
   */
  findById(id: CharacterId): Promise<Character | null>;
}
```

### Type Annotations

All function parameters, return types, and variables must have explicit type annotations.

```typescript
// ✅ Good - Explicit types
function rollDice(diceCount: number, difficulty: number): number[] {
  const results: number[] = [];
  return results;
}

// ❌ Bad - Implicit types
function rollDice(diceCount, difficulty) {
  const results = [];
  return results;
}

// ✅ Good - Type-only imports
import type { Character } from "@realm/core";
import type { CharacterId } from "@realm/common";

// ❌ Bad - Mixed imports when only types are needed
import { Character, CharacterId } from "@realm/core";
```

---

## Import Organization

Organize imports in the following order:

1. External dependencies (Node.js built-ins, npm packages)
2. Internal package imports (with path aliases)
3. Relative imports
4. Type-only imports at the end of each section

```typescript
// 1. External dependencies
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

// 2. Internal package imports (path aliases)
import { Character } from "@realm/core";
import { GameSystem } from "@realm/common";

// 3. Relative imports
import { CharacterMapper } from "./character.mapper";

// 4. Type-only imports
import type { ICharacterRepository } from "@realm/common";
import type { CharacterId } from "@realm/common";
```

---

## Barrel Exports

Every directory should include an `index.ts` file that exports all public members for clean imports.

```typescript
// domain/entities/index.ts
export * from "./character.entity";
export * from "./chronicle.entity";
export * from "./vampire.entity";

// Usage elsewhere
import { Character, Chronicle, Vampire } from "@realm/core";
```

---

## Module Path Aliases

The monorepo uses package references instead of path aliases. Import packages directly:

```typescript
// Import from packages using their names
import { Character, User, Guild } from "@realm/core";
import { UserDto, GuildDto, Splat } from "@realm/common";
import { db } from "@realm/database";
import { UserRepository } from "@realm/repositories";
import { logger } from "@realm/logger";
```

**No need for path aliases** - pnpm workspace and TypeScript project references handle this automatically.

---

## Examples

### Complete Entity Example

```typescript
import type { CharacterId, PlayerId } from "@realm/common";
import type { Splat } from "@realm/common";
import type { GameSystem } from "@realm/common";

/**
 * Base character entity representing a playable character in the World of Darkness.
 * This is a pure domain entity with no external dependencies.
 */
export class Character {
  /**
   * Creates a new Character instance.
   *
   * @param id - Unique identifier for the character
   * @param name - Display name of the character
   * @param playerId - Unique identifier of the player who owns this character
   * @param splat - Character type (Vampire, Werewolf, etc.)
   * @param system - Game system (V5, V20, CoD)
   * @param experience - Current experience points (default: 0)
   */
  constructor(
    public readonly id: CharacterId,
    public name: string,
    public readonly playerId: PlayerId,
    public splat: Splat,
    public readonly system: GameSystem,
    public experience: number = 0
  ) {
    this.validateName(name);
  }

  /**
   * Checks if the character has enough experience to purchase a trait.
   *
   * @param cost - The experience cost of the trait
   * @returns True if the character can afford the trait
   */
  public canAfford(cost: number): boolean {
    return this.experience >= cost;
  }

  /**
   * Spends experience points to purchase a trait.
   *
   * @param cost - The experience cost of the trait
   * @throws {Error} If the character doesn't have enough experience
   */
  public spendExperience(cost: number): void {
    if (!this.canAfford(cost)) {
      throw new Error(
        `Insufficient experience. Required: ${cost}, Available: ${this.experience}`
      );
    }
    this.experience -= cost;
  }

  /**
   * Validates the character name.
   *
   * @param name - The name to validate
   * @throws {Error} If the name is invalid
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Character name cannot be empty");
    }
    if (name.length > 50) {
      throw new Error("Character name cannot exceed 50 characters");
    }
  }
}
```

### Complete Repository Interface Example

```typescript
import type { Character } from "@realm/core";
import type { CharacterId, PlayerId } from "@realm/common";

/**
 * Repository contract for character persistence operations.
 * Implementations will handle actual data storage (REST API, WebSocket, local cache, etc.).
 */
export interface ICharacterRepository {
  /**
   * Retrieves a character by their unique identifier.
   *
   * @param id - The character's unique identifier
   * @returns The character if found, null otherwise
   * @throws {RepositoryError} If the data source is unavailable
   */
  findById(id: CharacterId): Promise<Character | null>;

  /**
   * Retrieves all characters for a specific player.
   *
   * @param playerId - The player's unique identifier
   * @returns Array of characters owned by the player
   * @throws {RepositoryError} If the data source is unavailable
   */
  findByPlayer(playerId: PlayerId): Promise<Character[]>;

  /**
   * Persists a character to the data store.
   *
   * @param character - The character to save
   * @returns The saved character with updated metadata
   * @throws {RepositoryError} If the save operation fails
   */
  save(character: Character): Promise<Character>;

  /**
   * Removes a character from the data store.
   *
   * @param id - The character's unique identifier
   * @throws {RepositoryError} If the delete operation fails
   */
  delete(id: CharacterId): Promise<void>;
}
```

---

## Enforcement

- **Linting**: ESLint and Prettier configurations enforce these conventions
- **Pre-commit hooks**: Husky validates naming conventions before commits
- **Code reviews**: All PRs must follow these conventions
- **CI/CD**: Build pipeline checks for convention violations

---

## Questions or Suggestions?

If you have questions about these conventions or suggestions for improvements, please open an issue or discussion in the repository.
