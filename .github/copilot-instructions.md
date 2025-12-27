# Copilot Instructions for Realm of Darkness

## Project Overview

**Monorepo** for World of Darkness tabletop RPG platform using TypeScript, NestJS, PostgreSQL, and Discord.js.

- **Current Status**: Major refactor in progress (~35% complete) - migrating from Django/MariaDB to TypeScript/NestJS/PostgreSQL
- **Branch**: `refactor/project-overhaul`
- **Key Features**: Character sheets, Discord bot integration, real-time collaboration, chronicle/campaign management
- **Game Systems**: Vampire: The Masquerade V5/V20, Werewolf, Hunter, Changeling, Mage, Chronicles of Darkness

---

## 🎯 Quick Reference: Core Principles

1. **Type Safety First**: Explicit types everywhere, NEVER use `any`, use `import type` for types
2. **Package Dependencies**: All packages depend ONLY on `@realm/common` (never on each other)
3. **Service Layer**: Pure services (services/) don't call other services; coordinator actions (actions/) orchestrate
4. **Repository Access**: ONLY services call repositories (never entities, never actions directly)
5. **Domain Purity**: Entities are pure logic - NO database code, NO framework code, NO repository calls
6. **Timestamp Ownership**: Repositories manage `createdAt`/`updatedAt`, NOT entities
7. **Zod-First Design**: Define Zod schema, infer TypeScript type (in `@realm/common`)
8. **No TypeScript Enums**: Use `as const` objects instead
9. **Error Hierarchy**: `RealmError` (system) vs `UserError` (client) - NEVER generic `Error`
10. **Documentation Required**: JSDoc on all public functions, classes, interfaces
11. **Edition Naming Convention**:
    - **Standalone/at start**: wod20, wod5, cod (e.g., `wod20-roll.action.ts`, `Wod20RollAction`)
    - **Game-specific**: v5, v20, h5, w20 (e.g., `Vampire5thData`)
    - **Edition in middle/end**: 20th, 5th, cod (e.g., `Vampire20th`, `Hunter5th`, not `VampireWod20`)

---

## ⚠️ CRITICAL: Development Rules & Standards

**All code must adhere to strict standards. These are NON-NEGOTIABLE.**

---

## 1️⃣ Type Safety (MANDATORY)

### TypeScript Rules

- **NEVER** use `any` or `unknown` (almost no exceptions)
- Always use explicit types for function parameters, return types, and variables
- Use type-only imports: `import type { ... }` when importing only types
- **Discord IDs**: Always use the `Snowflake` type (from `@realm/common`)

### Enum Pattern (NEVER use TypeScript `enum`)

**For purely internal constants (no validation needed):**

```typescript
export const LogLevel = {
  Debug: "debug",
  Info: "info",
  Warning: "warning",
  Error: "error",
  Fatal: "fatal",
} as const;
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
```

**For values that need Zod validation:**

```typescript
export const SheetStatus = {
  Draft: "Draft",
  Review: "Review",
  Active: "Active",
  Dead: "Dead",
  Archive: "Archive",
} as const;
export const SheetStatusSchema = z.enum(SheetStatus);
export type SheetStatus = z.infer<typeof SheetStatusSchema>;
```

**Note:** Zod 4 supports passing objects directly to `z.enum()` - no Zod 3 workarounds needed.

---

## 2️⃣ Package Architecture & Dependencies

### Package Dependency Rules

```
@realm/common  ← Base package (ZERO internal dependencies)
     ↑
     ├─ @realm/core (depends ONLY on common)
     ├─ @realm/repositories (depends ONLY on common)
     ├─ @realm/database (depends ONLY on common)
     ├─ @realm/logger (depends ONLY on common)
     └─ @realm/events (depends ONLY on common)
```

**CRITICAL RULES:**

1. **Packages ONLY depend on `@realm/common`** - never on each other
2. **`@realm/common` has ZERO dependencies** on other internal packages (only external deps like `zod`)
3. Apps (api, bot) can depend on any package

### What Goes Where

**@realm/common** (Shared Kernel):

- Data types with Zod validation schemas (all use 'Data' suffix)
- Repository interfaces (contracts)
- Type definitions and enums
- Error classes (RealmError, UserError)
- Utilities used across packages

**@realm/core** (Pure Business Logic):

- Entities (rich domain models with behavior)
- Pure services (standalone operations)
- Coordinator actions (orchestrate multiple services)
- Value objects
- **NO** database code, **NO** repository implementations, **NO** external service calls

**@realm/repositories** (Data Access):

- Repository implementations
- Data mappers (DTO ↔ Entity)
- Query builders

**@realm/database** (Schema):

- Drizzle ORM schemas
- Database connection
- Type exports

---

## 3️⃣ Service Layer Architecture

### Pure Services (`core/services/`)

**Rules:**

- Standalone business operations
- **MAY** call repositories directly
- **NEVER** call other services
- Return Data types (not entities)
- Validate inputs with Zod schemas from `@realm/common`

**Example:**

```typescript
import type { IUserRepository, UserData, CreateUserInput } from "@realm/common";
import { User } from "../entities/user.entity";

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async create(input: CreateUserInput): Promise<UserData> {
    // Trust input - already validated at API edge
    // NO Zod validation here

    // Create entity
    const user = new User({
      ...input,
      createdAt: new Date(),
      lastUpdated: new Date(),
    });

    // Save via repository (repository validates at DB edge)
    return await this.userRepo.create(user.toData());
  }
}
```

### Coordinator Actions (`core/actions/`)

**Rules:**

- Complex workflows requiring multiple services
- Orchestrate between services
- Handle cross-cutting concerns (transactions, events)
- Return Data types

**Example:**

```typescript
import { UserService } from "../services/user.service";
import { MemberService } from "../services/member.service";

export class SyncMemberProfileAction {
  constructor(
    private userService: UserService,
    private memberService: MemberService
  ) {}

  async execute(userId: Snowflake, guildId: Snowflake): Promise<void> {
    // Coordinate multiple services
    const user = await this.userService.getById(userId);
    await this.memberService.syncProfile({
      /* ... */
    });
  }
}
```

---

## 4️⃣ Domain Models (Entities)

### Entity Rules

- Pure TypeScript classes with business logic
- Wrap Data types from `@realm/common`
- **NO** framework code (no NestJS, no Discord.js, no Drizzle)
- **NO** repository calls (entities don't know about persistence)
- **NO** service calls
- Expose `toData()` method to export back to Data type

### Timestamp Management

**CRITICAL:** Timestamps (`createdAt`, `updatedAt`) are **repository responsibility**, not domain responsibility.

- **Repositories** set timestamps when saving to database
- **Entities** can accept timestamp overrides (useful for migrations) but should NOT manage them
- **Entities** should NOT try to detect if data has changed - that's repository logic

**Example:**

```typescript
export class User {
  constructor(private data: UserData) {}

  updateProfile(username: string, avatarUrl: string): void {
    // Domain logic - NO timestamp management
    this.data.username = username;
    this.data.avatarUrl = avatarUrl;
    // Repository will set updatedAt when saving
  }

  toData(): UserData {
    return this.data; // Repository handles timestamps
  }
}
```

---

## 5️⃣ Repository Pattern

### Repository Rules

- **Only called from services** (never from entities or actions)
- Implement interfaces from `@realm/common`
- Handle data mapping (Data types ↔ Database records)
- Manage timestamps (`createdAt`, `updatedAt`)
- Return Data types (not entities)

**Example:**

```typescript
export class UserRepository implements IUserRepository {
  async create(data: UserData): Promise<UserData> {
    const now = new Date();
    const result = await db.insert(users).values({
      ...data,
      createdAt: now,
      lastUpdated: now, // Repository sets timestamps
    });
    return result;
  }

  async update(data: UserData): Promise<UserData> {
    const result = await db
      .update(users)
      .set({
        ...data,
        lastUpdated: new Date(), // Repository updates timestamp
      })
      .where(eq(users.id, data.id));
    return result;
  }
}
```

---

## 6️⃣ Validation Strategy

### Validate at Boundaries Only

**Validation happens at two edges:**

1. **External → Internal (API/Bot)**: Validate with Zod, throw `UserError`
2. **Internal → External (Repository → DB)**: Validate with Zod, throw `RealmError`
3. **Internal Logic (Core)**: Trust TypeScript, throw `RealmError` for impossible states

**Single Source of Truth**: All constraints defined once in Zod schemas (`@realm/common`).

**Error Types:**

- **`UserError`**: User provided invalid data (edge validation failure)
- **`RealmError`**: Internal logic error or impossible state (our bug)

**Example Flow:**

```typescript
// 1. API Edge - Validate with Zod, throw UserError
const result = CreateCharacterInputSchema.safeParse(body);
if (!result.success) {
  throw new UserError("Invalid character data", {
    fields: { errors: result.error.message },
  });
}

// 2. Service - Trust the data, use RealmError for logic errors
const entity = new Character(result.data);
if (!entity) {
  throw new RealmError("Failed to create entity"); // Our bug
}

// 3. Repository - Validate at DB edge, throw RealmError if invalid
const validated = CharacterDataSchema.safeParse(data);
if (!validated.success) {
  throw new RealmError("Invalid data reached repository"); // Our bug
}
```

**Rules:**

- ✅ Services: NO Zod validation (trust input)
- ✅ Actions: NO Zod validation (trust input)
- ✅ Entities: NO Zod validation (trust input)
- ✅ Value Objects: NO Zod validation (trust input)
- ✅ Entities/VOs: Use `RealmError` to prevent invalid internal mutations
- ✅ API/Bot: Validate with Zod, throw `UserError`
- ✅ Repositories: Validate with Zod before DB save, throw `RealmError`

---

## 7️⃣ Zod Validation Pattern

### Schema-First Design (in `@realm/common`)

**Pattern:**

1. Define Zod schema first
2. Infer TypeScript type from schema
3. Export both schema and type
4. **All schemas use 'DataSchema' suffix, all types use 'Data' suffix**

**Reusable Data Schemas:**

```typescript
export const UsernameSchema = z.string().min(1).max(50);
export const AvatarUrlSchema = z.string().url().nullable();
```

**Complete Data Schemas:**

```typescript
export const UserDataSchema = z.object({
  id: SnowflakeSchema,
  username: UsernameSchema,
  avatarUrl: AvatarUrlSchema,
  createdAt: z.date(),
  lastUpdated: z.date(),
});
export type UserData = z.infer<typeof UserDataSchema>;
```

**Input Schemas (no timestamps):**

```typescript
export const CreateUserInputSchema = z.object({
  id: SnowflakeSchema,
  username: UsernameSchema,
  avatarUrl: AvatarUrlSchema,
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
```

---

## 8️⃣ Error Handling (MANDATORY)

### Two-Tier Error System

**RealmError** (System Errors - Logged):

- Database failures
- Unexpected states
- Internal logic errors (our bugs)
- Infrastructure issues
- **Used in**: Services, Actions, Entities, Repositories

**UserError** (Client Errors - NOT Logged):

- Invalid input at API/Bot edge
- Validation failures from user data
- **Used in**: API controllers, Bot command handlers

**Golden Rule**: If data came from a user and failed validation → `UserError`. If data came from our code and is wrong → `RealmError`.

**Examples:**

```typescript
import { RealmError, UserError } from "@realm/common";

// API Edge - User provided invalid input
const result = CharacterNameSchema.safeParse(body.name);
if (!result.success) {
  throw new UserError("Invalid character name", {
    fields: { errors: result.error.message },
  });
}

// Entity - Prevent invalid internal mutation
if (current > this.total) {
  throw new RealmError("Internal error: current XP exceeds total", {
    fields: { current: current.toString(), total: this.total.toString() },
  });
}

// Repository - Data integrity check failed
if (!validated.success) {
  throw new RealmError("Invalid data reached repository", {
    fields: { errors: validated.error.message },
  });
}
```

---

## 9️⃣ File Naming Conventions

**Pattern:** `{name}.{suffix}.ts`

| Type          | Suffix            | Example                  |
| ------------- | ----------------- | ------------------------ |
| Entity        | `.entity.ts`      | `user.entity.ts`         |
| Service       | `.service.ts`     | `user.service.ts`        |
| Action        | `.action.ts`      | `sync-profile.action.ts` |
| Repository    | `.repository.ts`  | `user.repository.ts`     |
| Mapper        | `.mapper.ts`      | `user.mapper.ts`         |
| DTO/Contracts | `.definitions.ts` | `user.definitions.ts`    |
| Value Object  | `.vo.ts`          | `dice-pool.vo.ts`        |
| Utility       | `.util.ts`        | `http.util.ts`           |

---

## 1️⃣1️⃣ Documentation (MANDATORY)

### JSDoc Requirements

**Every** public function, class, interface must have:

````typescript
/**
 * Brief description of what this does.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws {ErrorType} When this error occurs
 *
 * @example
 * ```typescript
 * const result = myFunction(input);
 * ```
 */
````

---

## 1️⃣1️⃣ Import Organization

**Order:**

1. External dependencies
2. Internal package imports (`@realm/*`)
3. Relative imports
4. Type-only imports

**Example:**

```typescript
// 1. External dependencies
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

// 2. Internal package imports
import { Character } from "@realm/core";
import { GameSystem } from "@realm/common";

// 3. Relative imports
import { CharacterMapper } from "./character.mapper";

// 4. Type-only imports
import type { ICharacterRepository } from "@realm/common";
import type { CharacterId } from "@realm/common";
```

## Architecture & Package Structure

This is a **pnpm monorepo** using **Turborepo** for build orchestration with TypeScript project references.

### Package Dependency Model

**CRITICAL RULE:** All packages depend ONLY on `@realm/common`. Packages DO NOT depend on each other.

```
        ┌─────────────────────────────────┐
        │     @realm/common               │
        │  (Shared Kernel - Base Package) │
        │  - DTOs & Zod schemas           │
        │  - Repository interfaces        │
        │  - Type definitions             │
        │  - Error classes                │
        │  ZERO internal dependencies     │
        └─────────────────────────────────┘
                     ↑
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌───▼────┐  ┌───▼────────┐
   │  core   │  │database│  │repositories│
   └─────────┘  └────────┘  └────────────┘
        ↑            ↑            ↑
        └────────────┴────────────┘
                     │
              ┌──────▼──────┐
              │  apps (api, │
              │   bot, web) │
              └─────────────┘
```

### Current Package Structure

```
realm-of-darkness/
├── apps/                           # Applications
│   ├── api/                       ⚠️  NestJS REST/WebSocket API (scaffolded)
│   ├── bot/                       ⚠️  Discord.js bots (needs TS migration)
│   └── frontend/                  ⏳ React SPA (not started)
│
├── packages/                       # Shared libraries
│   ├── common/                    ✅ Shared kernel (DTOs, contracts, Zod schemas)
│   │   ├── primitives/           # Core types (Snowflake, HttpStatus)
│   │   ├── error.definitions.ts  # RealmError, UserError
│   │   ├── user.definitions.ts   # User DTOs & repository interface
│   │   ├── guild.definitions.ts  # Guild DTOs & repository interface
│   │   ├── member.definitions.ts # Member DTOs & repository interface
│   │   ├── supporter.definitions.ts # Supporter DTOs & repository interface
│   │   └── character/            # Character DTOs & Zod schemas
│   │
│   ├── core/                      🔄 Business logic (entities, services, actions)
│   │   ├── entities/             # Domain entities (User, Guild, Character, etc.)
│   │   ├── services/             # Pure services (standalone operations)
│   │   ├── actions/              # Coordinator services (orchestration)
│   │   └── value-objects/        # Immutable value objects
│   │
│   ├── database/                  ✅ Drizzle ORM schemas (PostgreSQL)
│   │   ├── schema/               # Table definitions (users, guilds, characters)
│   │   └── index.ts              # DB connection & type exports
│   │
│   ├── repositories/              🔄 Data access implementations
│   │   ├── user.repository.ts
│   │   ├── guild.repository.ts
│   │   ├── member.repository.ts
│   │   └── mappers/              # DTO ↔ DB mappers
│   │
│   ├── logger/                    ✅ Logging singleton
│   └── events/                    ⏳ Redis pub/sub (planned)
│
└── backend-legacy/                 ⚠️  Old Django code (frozen, reference only)
```

### Architecture Layers & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (apps/api, apps/bot)                    │
│  - Gather endpoint/event data (HTTP requests, Discord events)│
│  - Inject dependencies into services/actions                 │
│  - Call services/actions from @realm/core                    │
│  - Format responses (JSON for API, embeds for Discord)       │
│  - NO validation (that's in services via Zod)                │
└──────────────────┬──────────────────────────────────────────┘
                   │ calls
┌──────────────────▼──────────────────────────────────────────┐
│  COORDINATION LAYER (core/actions/)                          │
│  - Orchestrate multiple pure services                        │
│  - Handle cross-cutting concerns (transactions, events)      │
│  - Return DTOs                                               │
└──────────────────┬──────────────────────────────────────────┘
                   │ calls
┌──────────────────▼──────────────────────────────────────────┐
│  SERVICE LAYER (core/services/)                              │
│  - Standalone business operations                            │
│  - Validate inputs (Zod schemas from @realm/common)          │
│  - Use entities for business logic                           │
│  - Call repositories for data access                         │
│  - Return DTOs (not entities)                                │
└──────────────────┬──────────────────────────────────────────┘
                   │ calls
┌──────────────────▼──────────────────────────────────────────┐
│  INFRASTRUCTURE LAYER (repositories/)                        │
│  - Implement repository interfaces from @realm/common        │
│  - Map DTOs ↔ Database records                               │
│  - Manage timestamps (createdAt, updatedAt)                  │
│  - Return DTOs                                               │
└──────────────────┬──────────────────────────────────────────┘
                   │ uses
┌──────────────────▼──────────────────────────────────────────┐
│  DATABASE LAYER (database/)                                  │
│  - Drizzle ORM schemas                                       │
│  - Database connection                                       │
│  - Type exports                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Architectural Rules:**

- **Apps** get raw data, inject dependencies, call services/actions, format responses
- **Actions** orchestrate multiple services for complex workflows
- **Services** validate inputs, execute business logic, call repositories, return DTOs
- **Repositories** handle data persistence, manage timestamps, return DTOs
- **Entities** contain business logic, wrap DTOs from `@realm/common`
- **Bot presentation**: Services return DTOs → Bot formats DTOs into Discord embeds

## Developer Workflows

### Quick Start (New Developers)

1. **Read documentation in this order:**
   - [QUICKSTART.md](../QUICKSTART.md) - Start here
   - [NAMING_CONVENTIONS.md](../NAMING_CONVENTIONS.md) - File/code naming standards
   - [DOMAIN_REPOSITORY_EXPLAINED.md](../DOMAIN_REPOSITORY_EXPLAINED.md) - Architecture patterns
   - [ENV_SETUP.md](../ENV_SETUP.md) - Environment variables

2. **Setup environment:**

   ```bash
   git checkout refactor/project-overhaul
   pnpm install
   pnpm build
   ```

3. **Environment variables**: See [ENV_SETUP.md](../ENV_SETUP.md)
   - Root `.env` for shared variables (DATABASE_URL, logging config)
   - App-specific `.env` files for app secrets (Discord tokens, API keys)

### Development Commands

```bash
# Install all dependencies
pnpm install

# Build all packages (respects dependencies)
pnpm build

# Run all apps in development mode
pnpm dev

# Lint all packages
pnpm lint

# Run tests
pnpm test

# Database migrations
pnpm db:generate     # Generate migration from schema changes
pnpm migrate         # Run pending migrations
pnpm db:studio       # Open Drizzle Studio (DB GUI)

# Format code
pnpm format          # Format all files
pnpm format:check    # Check formatting
```

### Package-Specific Commands

```bash
# Run specific package
pnpm --filter @realm/api dev
pnpm --filter @realm/bot dev

# Build specific package
pnpm --filter @realm/core build

# Test specific package
pnpm --filter @realm/database test
```

## Key Patterns & Conventions

### Domain-Driven Design (DDD)

This project follows **Domain-Driven Design** principles:

- **Entities**: Rich domain models with behavior (in `packages/core/domain/entities/`)
- **Value Objects**: Immutable objects defined by their values (in `packages/core/domain/value-objects/`)
- **Domain Services**: Pure business logic services (in `packages/core/domain/services/`)
- **Application Services**: Orchestration and use cases (in `packages/core/application/`)
- **Repository Pattern**: Abstract data access behind interfaces (in `packages/core/ports/`)

See [DOMAIN_REPOSITORY_EXPLAINED.md](../DOMAIN_REPOSITORY_EXPLAINED.md) for detailed explanation with examples.

### Character Models

- **Single-table inheritance** using PostgreSQL JSONB for type-specific data
- **Splat field** determines character type (Vampire5th, Hunter5th, Werewolf20th, etc.)
- **Entities** in `packages/core/entities/characters/`
- **Database schemas** in `packages/database/schema/`
- **Zod validation schemas** in `packages/common/character/`

Example hierarchy:

```
Character (base)
├── Character5th (V5 system)
│   ├── Vampire5th
│   ├── Hunter5th
│   └── Werewolf5th
└── Character20th (V20 system)
    ├── Vampire20th
    ├── Werewolf20th
    └── Changeling20th
```

### File Naming Conventions

**See [NAMING_CONVENTIONS.md](../NAMING_CONVENTIONS.md) for complete standards**

Quick reference:

- **Entities**: `{name}.entity.ts` (e.g., `character.entity.ts`)
- **Services**: `{name}.service.ts` (e.g., `character-creation.service.ts`)
- **Repositories**: `{name}.repository.ts` (e.g., `character.repository.ts`)
- **Types**: `{scope}.types.ts` (e.g., `character.types.ts`)
- **Enums**: `{name}.enum.ts` (e.g., `splat.enum.ts`)
- **Constants**: `{scope}.constants.ts` (e.g., `experience.constants.ts`)

### Import Organization

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

### Branch Naming

Use these prefixes:

- `feature/` - New features
- `bugfix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions
- `chore/` - Maintenance tasks
- `deps/` - Dependency updates
- `config/` - Configuration changes

## Integration Points

### Database (PostgreSQL + Drizzle ORM)

- **Connection**: Configured in `packages/database/src/client.ts`
- **Schema**: Defined in `packages/database/src/schema/`
- **Migrations**: Generated with `pnpm db:generate`, run with `pnpm migrate`
- **Type Safety**: Drizzle provides full TypeScript types for all queries

### Real-Time Events (Redis Pub/Sub)

**Planned for Phase 1** - See [EVENTS_SYSTEM.md](../EVENTS_SYSTEM.md)

- Redis pub/sub for real-time communication between API, bot shards, and web clients
- Typed event contracts with Zod validation
- Channels for character updates, dice rolls, gateway events

### Discord Bots

**Status**: Not yet migrated to TypeScript

- Three bots: 5th, 20th, Chronicles of Darkness
- Slash commands for dice rolling and character management
- Will use `packages/core` for shared logic and `packages/database` for direct DB access
- See [apps/bot/README.md](../apps/bot/README.md)

### API (NestJS)

**Status**: 5% complete - scaffolded but empty

- REST API for web frontend
- WebSocket gateway for real-time updates
- Uses `packages/core` domain models and services
- Uses `packages/repositories` for data access
- See [apps/api/README.md](../apps/api/README.md)

## Legacy Code (DO NOT MODIFY)

The following directories contain **frozen legacy code** for reference only:

- `backend-legacy/` - Old Django REST API (DO NOT MODIFY)
- `apps/frontend/` - Old React frontend (will be replaced)
- Legacy Django models in `backend-legacy/haven/models/` can be referenced for business logic

**When porting features:**

1. Read the Django model to understand business logic
2. Port the logic to TypeScript entities in `packages/core/entities/`
3. Create DTOs and Zod schemas in `packages/common/`
4. Never modify or depend on legacy code

## Troubleshooting

- **Build errors**: Run `pnpm clean` then `pnpm install` and `pnpm build`
- **Database errors**: Check `DATABASE_URL` in root `.env`, ensure PostgreSQL is running
- **Type errors**: Run `pnpm build:types` to rebuild TypeScript references
- **Package not found**: Check `pnpm-workspace.yaml` and package.json `name` field
- **Import errors**: Check path aliases in `tsconfig.json`

---

## Quick Reference: Essential Documentation

1. **[QUICKSTART.md](../QUICKSTART.md)** - Developer onboarding guide
2. **[NAMING_CONVENTIONS.md](../NAMING_CONVENTIONS.md)** - File/code naming standards
3. **[DOMAIN_REPOSITORY_EXPLAINED.md](../DOMAIN_REPOSITORY_EXPLAINED.md)** - Architecture patterns explained
4. **[ENV_SETUP.md](../ENV_SETUP.md)** - Environment variable configuration

For questions or clarifications, check these docs first. If still unclear, consult the copilot instructions or ask for specific details.
