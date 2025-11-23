# Copilot Instructions for Realm of Darkness

## Project Overview

**Monorepo** for World of Darkness tabletop RPG platform using TypeScript, NestJS, PostgreSQL, and Discord.js.

- **Current Status**: Major refactor in progress (~35% complete) - migrating from Django/MariaDB to TypeScript/NestJS/PostgreSQL
- **Branch**: `refactor/project-overhaul`
- **Key Features**: Character sheets, Discord bot integration, real-time collaboration, chronicle/campaign management
- **Game Systems**: Vampire: The Masquerade V5/V20, Werewolf, Hunter, Changeling, Mage, Chronicles of Darkness

## ⚠️ CRITICAL: Type Safety & Documentation Requirements

**All code must adhere to strict standards:**

### Type Safety (MANDATORY)

- **TypeScript**: Always use explicit types, interfaces, and enums. **NEVER** use `any` or `unknown` unless absolutely necessary (which should be almost never).
- Use type-only imports: `import type { ... }` when importing only types
- Define all function parameters, return types, and variables explicitly
- **Discord IDs**: Always use the `Snowflake` type (from `core/types`) for Discord user IDs, guild IDs, channel IDs, etc. The `Snowflake` type is a string alias that provides semantic clarity.
- See [NAMING_CONVENTIONS.md](../NAMING_CONVENTIONS.md) for complete type safety guidelines

### Error Handling (MANDATORY)

- **All errors** must be either `RealmError` or `ClientError` (from `core/errors`)
- **RealmError**: For application/system errors - things that break in our code (database failures, unexpected states, logic errors). These are logged and monitored.
- **ClientError**: For user/client errors - invalid input, validation failures, illegal characters, etc. These are returned to the client but generally not logged as they're expected user mistakes.
- **NEVER** throw generic `Error` objects
- Example:

  ```typescript
  import { RealmError, ClientError } from "@realm/core/errors";

  // User provided invalid input
  if (name.includes("~")) {
    throw ClientError("Character name cannot contain ~ character");
  }

  // System error
  if (!dbConnection) {
    throw new RealmError("Database connection failed");
  }
  ```

### Documentation (MANDATORY)

- **Every** function, class, interface, and module **must** include JSDoc documentation
- Document all parameters with `@param`, return types with `@returns`, and exceptions with `@throws`
- Include usage examples with `@example` for complex functions
- See [NAMING_CONVENTIONS.md](../NAMING_CONVENTIONS.md) for documentation standards

### Naming Conventions (MANDATORY)

- **Files**: kebab-case with descriptive suffixes (`.entity.ts`, `.service.ts`, `.repository.ts`, etc.)
- **Classes/Interfaces**: PascalCase (prefix interfaces with `I`)
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- See [NAMING_CONVENTIONS.md](../NAMING_CONVENTIONS.md) for complete file and code naming standards

## Architecture & Package Structure

This is a **pnpm monorepo** using **Turborepo** for build orchestration with TypeScript project references.

### Current Package Structure

```
realm-of-darkness/
├── apps/                           # Applications
│   ├── api/                       ⚠️  NestJS REST/WebSocket API (5% complete)
│   ├── bot/                       ⚠️  Discord.js bots (not migrated to TS yet)
│   └── frontend/                  ⏳ React SPA (not started)
│
├── packages/                       # Shared libraries
│   ├── core/                      🔄 Domain models, services, contracts, shared code
│   │   ├── domain/               # Pure domain entities and domain services
│   │   ├── application/          # Application services (use cases, orchestration)
│   │   ├── ports/                # Repository interfaces and service contracts
│   │   ├── types/                # Shared type definitions
│   │   ├── validations/          # Zod schemas for all character types
│   │   ├── errors/               # Error classes (RealmError, ClientError)
│   │   ├── logger/               # Singleton logger with Discord integration
│   │   └── utils/                # Shared utilities
│   │
│   ├── database/                  ✅ Drizzle ORM + PostgreSQL schemas (95% complete)
│   │   ├── schema/               # Database table definitions
│   │   ├── types/                # Database type exports
│   │   └── client.ts             # Database connection
│   │
│   └── repositories/              ⏳ Repository implementations (not started)
│
└── backend-legacy/                 ⚠️  Old Django code (frozen, for reference only)
```

### Package Dependencies & Architecture Layers

```
┌─────────────────────────────────────────────────┐
│  PRESENTATION LAYER                             │
│  apps/api (NestJS), apps/bot (Discord.js)       │
└──────────────────┬──────────────────────────────┘
                   │ depends on
┌──────────────────▼──────────────────────────────┐
│  APPLICATION LAYER                              │
│  packages/core/application (services/use-cases) │
└──────────────────┬──────────────────────────────┘
                   │ depends on
┌──────────────────▼──────────────────────────────┐
│  DOMAIN LAYER (pure TypeScript, no deps)       │
│  packages/core/domain (entities, value objects) │
└──────────────────┬──────────────────────────────┘
                   │ depends on
┌──────────────────▼──────────────────────────────┐
│  INFRASTRUCTURE LAYER                           │
│  packages/repositories, packages/database       │
└─────────────────────────────────────────────────┘
```

**Key Architectural Rules:**

- **Domain layer** must have ZERO external dependencies (pure TypeScript)
- **Application layer** orchestrates domain logic, uses repository interfaces from `core/ports`
- **Infrastructure layer** implements repository interfaces and handles database access
- **Presentation layer** handles HTTP/WebSocket/Discord events, calls application services

## Developer Workflows

### Quick Start (New Developers)

1. **Read documentation in this order:**
   - [QUICKSTART.md](../QUICKSTART.md) - Start here
   - [REFACTOR_STATUS.md](../REFACTOR_STATUS.md) - Current progress
   - [NAMING_CONVENTIONS.md](../NAMING_CONVENTIONS.md) - File/code naming standards
   - [DOMAIN_REPOSITORY_EXPLAINED.md](../DOMAIN_REPOSITORY_EXPLAINED.md) - Architecture patterns
   - [REFACTOR_PLAN.md](../REFACTOR_PLAN.md) - Complete plan

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
- **Rich domain models** in `packages/core/domain/entities/characters/`
- **Database schemas** in `packages/database/schema/`
- **Zod validation** in `packages/core/validations/`

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
import { Character } from "@core/domain/entities/character.entity";
import { GameSystem } from "@core/types";

// 3. Relative imports
import { CharacterMapper } from "./character.mapper";

// 4. Type-only imports
import type { ICharacterRepository } from "@core/ports/character.repository";
import type { CharacterId } from "@core/types";
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

- Three bots: V5, V20, Chronicles of Darkness
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
2. Port the logic to TypeScript domain models in `packages/core/domain/`
3. Never modify or depend on legacy code

## Troubleshooting

- **Build errors**: Run `pnpm clean` then `pnpm install` and `pnpm build`
- **Database errors**: Check `DATABASE_URL` in root `.env`, ensure PostgreSQL is running
- **Type errors**: Run `pnpm build:types` to rebuild TypeScript references
- **Package not found**: Check `pnpm-workspace.yaml` and package.json `name` field
- **Import errors**: Check path aliases in `tsconfig.json`

## Current Phase: Phase 1 - Domain Models

**Priority**: Building rich domain models and event system

**Active tasks** (see [REFACTOR_STATUS.md](../REFACTOR_STATUS.md)):

- Creating domain entities in `packages/core/domain/entities/`
- Implementing domain services in `packages/core/domain/services/`
- Setting up Redis event system in `packages/core/events/` (planned)

**Next phase**: Repository implementations in `packages/repositories/`

---

## Quick Reference: Essential Documentation

1. **[QUICKSTART.md](../QUICKSTART.md)** - Developer onboarding guide
2. **[REFACTOR_STATUS.md](../REFACTOR_STATUS.md)** - Current progress and blockers
3. **[NAMING_CONVENTIONS.md](../NAMING_CONVENTIONS.md)** - File/code naming standards
4. **[DOMAIN_REPOSITORY_EXPLAINED.md](../DOMAIN_REPOSITORY_EXPLAINED.md)** - DDD architecture explained
5. **[EVENTS_SYSTEM.md](../EVENTS_SYSTEM.md)** - Redis pub/sub system design
6. **[REFACTOR_PLAN.md](../REFACTOR_PLAN.md)** - Complete 9-phase refactor plan
7. **[ENV_SETUP.md](../ENV_SETUP.md)** - Environment variable configuration

For questions or clarifications, check these docs first. If still unclear, ask for specific details about workflows, conventions, or integration points.
