# Realm of Darkness - Refactor Implementation Plan

**Branch:** `refactor/project-overhaul`  
**Date:** November 1, 2025  
**Status:** In Progress

---

## Executive Summary

This document outlines the comprehensive refactoring plan to migrate Realm of Darkness from a Django/MariaDB/JavaScript stack to a unified TypeScript monorepo using NestJS, PostgreSQL, and Drizzle ORM. The refactor aims to:

1. **Unify the codebase** under TypeScript for type safety and code sharing
2. **Decouple the database** from the web API using Drizzle ORM
3. **Enable direct database access** for Discord bots (eliminating the bot API layer)
4. **Introduce comprehensive testing** across all components
5. **Establish shared domain models** and validation schemas

---

## Current State Assessment

### ✅ Completed Work

#### 1. **Monorepo Infrastructure**
- ✅ pnpm workspace configured with 6 packages: `api`, `bot`, `database`, `shared`, `web`, `scripts`
- ✅ Turborepo setup for build orchestration
- ✅ Root-level TypeScript configuration with project references
- ✅ ESLint and Prettier configured for code quality

#### 2. **Shared Package** (`shared/`)
- ✅ Unified error handling system (`RealmError`, `ClientError`)
- ✅ Singleton logger with Discord integration
- ✅ Base type definitions (`Splats`, `SheetStatus`, `SupporterLevel`)
- ✅ Zod validation schemas for character data:
  - ✅ Base character validations
  - ✅ 5th Edition validations (Vampire5th, Hunter5th, Werewolf5th, Human5th, Ghoul5th)
  - ✅ 20th Anniversary validations (Vampire20th, Werewolf20th, Changeling20th, Mage20th, etc.)
- ✅ HTTP status code enums

#### 3. **Database Package** (`database/`)
- ✅ Drizzle ORM setup with PostgreSQL
- ✅ Core schema definitions:
  - ✅ `users` table with supporter levels
  - ✅ `guilds` table (renamed from chronicles)
  - ✅ `members` table (user-guild junction)
  - ✅ `characters` table with single-table inheritance (JSONB data field)
  - ✅ `initiative` and `stats` tables
- ✅ Type-safe character data mapping (`SplatDataMap`, `CharacterJsonbData`)
- ✅ Drizzle Kit configured for migrations

#### 4. **API Package** (`api/`)
- ✅ NestJS with Fastify platform configured
- ✅ Basic app structure (module, controller, service)
- ✅ Character module scaffolded (empty service/module)
- ✅ TypeScript compilation setup

#### 5. **Bot Package** (`bot/`)
- ✅ Package structure converted to TypeScript
- ✅ Existing JavaScript structures present (characters, realm_api)
- ⚠️ **NOT YET MIGRATED**: Still uses JavaScript files

#### 6. **Legacy Backend** (`backend-legacy/`)
- ✅ Preserved for reference during migration
- ✅ Contains Django models showing full character inheritance hierarchy

---

## ⚠️ Known Gaps & Issues

### 1. **Character Data Types Not Yet Defined**
The `database/src/types/index.ts` file has placeholder types:
```typescript
type Vampire5thData = Record<string, unknown>;
type Hunter5thData = Record<string, unknown>;
// ... etc
```
**Impact:** Cannot properly type-check character data in JSONB fields yet.

### 2. **No Domain/Service Layer**
- No rich domain models (only database types and Zod schemas)
- No repository pattern implemented
- No service layer for business logic

### 3. **Bot Package Not Migrated**
- Still uses JavaScript with `require()` statements
- `realm_api/` folder contains legacy API client code
- Character structures are JavaScript classes

### 4. **No Migration Tooling**
- No data migration scripts from Django/MariaDB to Drizzle/PostgreSQL
- No validation/integrity checking tools

### 5. **Web Package Empty**
- Only has a minimal Vite setup
- No React components or routes

### 6. **No Integration Tests**
- No end-to-end tests
- No integration tests between packages

---

## Architecture Design

### Package Responsibilities (Refined)

```
┌─────────────────────────────────────────────────────────────┐
│                         BOUNDARY LAYER                      │
│  (Zod validation, DTOs, External interfaces)                │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │   API    │  │   Bot    │  │   Web    │                   │
│  │ (NestJS) │  │(Discord) │  │ (React)  │                   │
│  └────┬─────┘  └────┬─────┘  └─────┬────┘                   │
│       │             │              │                        │
└───────┼─────────────┼──────────────┼────────────────────────┘
        │             │              │
        └─────────────┼──────────────┘
                      │
        ┌─────────────▼─────────────┐
        │     DOMAIN LAYER          │
        │  (Business logic, rich    │
        │   models, invariants)     │
        │                           │
        │   - Character classes     │
        │   - Validation rules      │
        │   - Game mechanics        │
        │   - State management      │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │  PERSISTENCE LAYER        │
        │  (Repositories, Queries)  │
        │                           │
        │   - CharacterRepository   │
        │   - UserRepository        │
        │   - GuildRepository       │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    DATABASE PACKAGE       │
        │  (Drizzle schemas, DB)    │
        │                           │
        │   - Schema definitions    │
        │   - Migrations            │
        │   - Type exports          │
        └───────────────────────────┘
```

### Package Breakdown

#### **`shared/` - Cross-Cutting Concerns**
- **Purpose:** Code used by ALL other packages
- **Contents:**
  - Error handling (`RealmError`, `ClientError`)
  - Logger (singleton pattern)
  - Zod validation schemas (DTOs)
  - Type definitions (`Splats`, enums, constants)
  - Utilities (ID generation, date formatting, etc.)
- **Dependencies:** None (base package)
- **Exports:** Types, schemas, utilities, logger, errors

#### **`events/` - NEW PACKAGE - Redis Event System**
- **Purpose:** Real-time inter-process communication via Redis pub/sub
- **Contents:**
  - Redis client wrapper (`RedisEventClient`)
  - Event contracts (Zod schemas for all events)
  - Channel name constants
  - Event metadata types
  - Type-safe event emitter
- **Dependencies:** `shared` (for types, errors, logger)
- **Exports:** Event client, event schemas, channel names
- **Use Cases:**
  - Bot updates character → API notifies web clients
  - API requests dice roll → Bot posts to Discord
  - Real-time WebSocket broadcasts
  - Multi-shard coordination

#### **`database/` - Persistence Layer**
- **Purpose:** Database schema and direct DB access
- **Contents:**
  - Drizzle schema definitions
  - Database connection setup
  - Type exports from schemas (`UserDb`, `CharacterDb`, etc.)
  - Migration files
- **Dependencies:** `shared` (for types/enums)
- **Exports:** `db` instance, schema types, table definitions

#### **`domain/` - NEW PACKAGE - Business Logic**
- **Purpose:** Rich domain models and business rules (framework-agnostic)
- **Contents:**
  - **Character classes** (Vampire5th, Hunter5th, etc.) - rich models with behavior
  - **Domain services** (DiceRoller, ExperienceCalculator) - stateless business logic
  - **Game mechanics** (damage calculation, dice rolling, XP spending)
  - **Repository interfaces** - contracts for data access (no implementations)
  - **Domain events** - internal event emitter for domain actions
  - **Validators** - business rule validation
- **Dependencies:** `shared` (types only), `database` (types only, no DB access)
- **Exports:** Domain models, services, repository interfaces
- **Key Principle:** NO framework code (no NestJS, no Discord.js, no Drizzle queries)
- **Examples:**
  - `Vampire5th.increaseHunger()` - hunger system rules
  - `DiceRoller.rollV5()` - V5 dice mechanics
  - `Character.spendExperience()` - XP spending rules

#### **`repositories/` - NEW PACKAGE - Data Access**
- **Purpose:** Bridge between domain and database
- **Contents:**
  - Repository implementations (`CharacterRepository`, `UserRepository`)
  - Query builders
  - Transaction management
  - Data mapping (DB types ↔ Domain models)
- **Dependencies:** `shared`, `database`, `domain`
- **Exports:** Repository classes

#### **`api/` - HTTP/WebSocket API**
- **Purpose:** NestJS REST and WebSocket gateway for web frontend
- **Contents:**
  - Controllers (HTTP handlers)
  - Guards (authentication/authorization)
  - Modules (feature organization)
  - DTOs (request/response types using Zod from `shared`)
  - WebSocket gateway
- **Dependencies:** `shared`, `domain`, `repositories`
- **Exports:** None (entry point)

#### **`bot/` - Discord Bot**
- **Purpose:** Discord.js bot for slash commands and events
- **Contents:**
  - Command handlers
  - Event listeners
  - Discord-specific utilities
  - Emoji management
  - Bot structures (should use domain models)
- **Dependencies:** `shared`, `domain`, `repositories`
- **Exports:** None (entry point)

#### **`web/` - React Frontend**
- **Purpose:** User-facing web application
- **Contents:**
  - React components
  - Routes/pages
  - WebSocket client
  - State management
  - UI utilities
- **Dependencies:** `shared` (types, schemas for validation)
- **Exports:** None (entry point)

#### **`migration/` - NEW PACKAGE - Data Migration**
- **Purpose:** One-time migration from Django to Drizzle
- **Contents:**
  - Legacy data export scripts
  - Data transformation pipelines
  - Validation/integrity checks
  - Migration CLI
  - Dry-run reports
- **Dependencies:** `shared`, `database`, `domain`, `repositories`
- **Exports:** Migration CLI

---

## Implementation Phases

### **Phase 1: Foundation & Domain Models** ⏱️ 2-3 weeks

**Goal:** Establish the domain layer, event system, and complete type definitions.

#### 1.1 Create `domain/` Package
```bash
# Directory structure
domain/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── models/
│   │   ├── base/
│   │   │   ├── Character.ts
│   │   │   ├── Trackable.ts
│   │   │   └── Experience.ts
│   │   ├── 5th/
│   │   │   ├── Character5th.ts
│   │   │   ├── Vampire5th.ts
│   │   │   ├── Hunter5th.ts
│   │   │   ├── Werewolf5th.ts
│   │   │   ├── Human5th.ts
│   │   │   └── Ghoul5th.ts
│   │   └── 20th/
│   │       ├── Character20th.ts
│   │       ├── Vampire20th.ts
│   │       ├── Werewolf20th.ts
│   │       ├── Changeling20th.ts
│   │       ├── Mage20th.ts
│   │       ├── Demon20th.ts
│   │       ├── Wraith20th.ts
│   │       ├── Human20th.ts
│   │       └── Ghoul20th.ts
│   ├── services/
│   │   ├── DiceRoller.ts         # V5, V20, CoD dice mechanics
│   │   ├── ExperienceService.ts  # XP calculation rules
│   │   └── DamageService.ts      # Damage/healing mechanics
│   ├── events/
│   │   ├── DomainEvents.ts       # Internal domain events
│   │   └── EventEmitter.ts       # Event emitter implementation
│   └── interfaces/
│       ├── ICharacterRepository.ts
│       ├── IUserRepository.ts
│       └── IGuildRepository.ts
└── test/
    ├── models/
    └── services/
```

**Tasks:**
- [ ] Create `domain/` package with proper `package.json` and `tsconfig.json`
- [ ] Port character model hierarchy from Django models to TypeScript classes
  - [ ] Base `Character` class with common properties
  - [ ] `Character5th` intermediate class
  - [ ] `Character20th` intermediate class
  - [ ] All splat-specific classes (Vampire5th, Hunter5th, etc.)
- [ ] Implement domain methods (validation, state changes, calculations)
- [ ] **Move dice rolling logic from bot to `services/DiceRoller.ts`**
- [ ] Define repository interfaces (no implementations yet)
- [ ] Add unit tests for domain logic

#### 1.1b Create `events/` Package
```bash
# Directory structure
events/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── client/
│   │   ├── RedisEventClient.ts   # Pub/sub wrapper
│   │   └── config.ts              # Redis connection
│   ├── contracts/
│   │   ├── index.ts
│   │   ├── character-events.ts    # Character CRUD events
│   │   ├── gateway-events.ts      # WebSocket broadcasts
│   │   ├── discord-events.ts      # Discord message requests
│   │   └── system-events.ts       # Health/monitoring
│   ├── channels/
│   │   └── index.ts               # Channel name constants
│   └── types/
│       └── event-metadata.ts      # Base event structure
└── test/
    ├── client.test.ts
    └── contracts.test.ts
```

**Tasks:**
- [ ] Create `events/` package structure
- [ ] Implement `RedisEventClient` with type-safe pub/sub
- [ ] Define all event contracts (character, gateway, Discord, system)
- [ ] Define channel name constants
- [ ] Add event metadata schema (Zod)
- [ ] Add integration tests with test Redis instance
- [ ] Document event flow patterns

#### 1.2 Complete Character Data Types in `shared/`
**Tasks:**
- [ ] Create proper TypeScript types for each splat's JSONB data:
  ```typescript
  // shared/src/types/character-data/vampire5th.ts
  export interface Vampire5thData {
    // Core vampire properties
    clan: string;
    generation: number;
    bloodPotency: number;
    hunger: number;
    humanity: HumanityData;
    disciplines: Record<string, DisciplineData>;
    // ... all other fields from Django model
  }
  ```
- [ ] Replace placeholder types in `database/src/types/index.ts`
- [ ] Ensure Zod schemas in `shared/src/validations` match the new types
- [ ] Add type tests to verify schema ↔ type alignment

#### 1.3 Update `database/` Package
**Tasks:**
- [ ] Review and refine existing schema definitions
- [ ] Add any missing tables (audit logs, etc.)
- [ ] Create initial migration files
- [ ] Document schema design decisions

**Deliverables:**
- ✅ `domain/` package with all character models
- ✅ `events/` package with Redis pub/sub system
- ✅ Complete TypeScript types for all character data
- ✅ Dice rolling logic moved to domain (from bot)
- ✅ Unit tests for domain logic
- ✅ Integration tests for event system
- ✅ Repository interfaces defined

---

### **Phase 2: Repository Layer** ⏱️ 1-2 weeks

**Goal:** Implement data access layer bridging domain and database.

#### 2.1 Create `repositories/` Package
```bash
repositories/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── CharacterRepository.ts
│   ├── UserRepository.ts
│   ├── GuildRepository.ts
│   ├── MemberRepository.ts
│   ├── BaseRepository.ts
│   └── mappers/
│       ├── CharacterMapper.ts
│       ├── UserMapper.ts
│       └── GuildMapper.ts
└── test/
    └── integration/
```

**Tasks:**
- [ ] Create repository package structure
- [ ] Implement `BaseRepository` with common CRUD operations
- [ ] Implement `CharacterRepository`:
  - [ ] `findById(id: number): Promise<Character | null>`
  - [ ] `findByUser(userId: bigint, name: string): Promise<Character | null>`
  - [ ] `findByGuild(guildId: bigint): Promise<Character[]>`
  - [ ] `create(char: Character): Promise<Character>`
  - [ ] `update(char: Character): Promise<Character>`
  - [ ] `delete(id: number): Promise<void>`
- [ ] Implement mappers to convert:
  - `CharacterDb` → Domain `Character` (with correct splat subclass)
  - Domain `Character` → `CharacterDb` (serialize to JSONB)
- [ ] Implement `UserRepository`, `GuildRepository`, `MemberRepository`
- [ ] Add integration tests with test database

**Key Design Decision:**
```typescript
// CharacterMapper handles polymorphic deserialization
class CharacterMapper {
  static toDomain(db: CharacterDb): Character {
    const baseData = { /* map common fields */ };
    
    switch (db.splat) {
      case Splats.Vampire5th:
        const v5Data = db.data as Vampire5thData;
        return new Vampire5th(baseData, v5Data);
      case Splats.Hunter5th:
        const h5Data = db.data as Hunter5thData;
        return new Hunter5th(baseData, h5Data);
      // ... etc
    }
  }
  
  static fromDomain(char: Character): Omit<CharacterDb, 'id' | 'createdAt' | 'lastUpdated'> {
    return {
      name: char.name,
      userId: char.userId,
      guildId: char.guildId,
      splat: char.splat,
      isSheet: char.isSheet,
      data: char.serialize(), // Each class implements serialize()
    };
  }
}
```

**Deliverables:**
- ✅ `repositories/` package with all repository implementations
- ✅ Data mappers for DB ↔ Domain conversion
- ✅ Integration tests with test database

---

### **Phase 3: API Implementation** ⏱️ 2-3 weeks

**Goal:** Build NestJS API using domain/repository layers.

#### 3.1 Character Module
**Tasks:**
- [ ] Implement `CharacterController`:
  - `GET /characters` - List user's characters
  - `GET /characters/:id` - Get character by ID
  - `POST /characters` - Create character
  - `PUT /characters/:id` - Update character
  - `DELETE /characters/:id` - Delete character
  - `PATCH /characters/:id/tracker` - Update tracker (health, hunger, etc.)
- [ ] Implement `CharacterService`:
  - Use `CharacterRepository` for data access
  - Use domain models for business logic
  - Validate with Zod schemas from `shared`
- [ ] Add authentication guard (Discord OAuth)
- [ ] Add authorization checks (user owns character, ST access, etc.)

#### 3.2 User Module
**Tasks:**
- [ ] Implement `UserController` and `UserService`
- [ ] Discord OAuth integration
- [ ] JWT/session management

#### 3.3 Guild Module
**Tasks:**
- [ ] Implement `GuildController` and `GuildService`
- [ ] Guild-specific character queries
- [ ] Storyteller role management

#### 3.4 WebSocket Gateway
**Tasks:**
- [ ] Implement WebSocket gateway for real-time updates
- [ ] Character update events
- [ ] Initiative tracker sync
- [ ] Presence tracking

#### 3.5 Error Handling & Logging
**Tasks:**
- [ ] Global exception filter using `ClientError` for 4xx responses
- [ ] Log all errors with `RealmLogger` from `shared`
- [ ] Request logging middleware

**Deliverables:**
- ✅ Complete NestJS API with character, user, and guild endpoints
- ✅ WebSocket gateway for real-time features
- ✅ Authentication and authorization
- ✅ API tests (unit + e2e)

---

### **Phase 4: Bot Migration** ⏱️ 3-4 weeks

**Goal:** Convert bot to TypeScript and use domain/repository layers directly.

#### 4.1 Bot Structure Refactor
**Tasks:**
- [ ] Migrate all JavaScript files to TypeScript:
  - [ ] `src/structures/characters/*.js` → **Delete and use domain models**
  - [ ] `src/commands/` - Type all command handlers
  - [ ] `src/events/` - Type all event handlers
  - [ ] `src/modules/` - **DELETE dice rolling (moved to domain), keep Discord-specific utilities**
- [ ] Remove `src/realm_api/` folder entirely
  - Bot will use repositories directly instead of HTTP API
- [ ] Update imports to use domain models from `domain/`
- [ ] Use repositories for data access
- [ ] **Set up Redis event listeners for Discord message requests**
- [ ] **Publish character update events when bot modifies characters**

#### 4.2 Command Handlers
**Tasks:**
- [ ] Refactor command handlers to use typed domain models
- [ ] Add Zod validation for command inputs
- [ ] Use `RealmLogger` for logging
- [ ] Use `ClientError` for user-facing errors

**Example:**
```typescript
// Before (JavaScript with API calls)
const char = await getCharacter({ client, name, user, guild });

// After (TypeScript with repository)
import { CharacterRepository } from 'repositories';
const charRepo = new CharacterRepository(db);
const char = await charRepo.findByUser(BigInt(user.id), name);
if (!char) {
  throw ClientError.notFound('Character not found');
}
```

#### 4.3 Testing
**Tasks:**
- [ ] Add unit tests for command logic
- [ ] Add integration tests with test database
- [ ] Mock Discord client for testing

**Deliverables:**
- ✅ Fully TypeScript bot package
- ✅ Direct database access via repositories
- ✅ No dependency on HTTP API
- ✅ Comprehensive test coverage

---

### **Phase 5: Migration Tooling** ⏱️ 2-3 weeks

**Goal:** Build tools to migrate data from Django/MariaDB to Drizzle/PostgreSQL.

#### 5.1 Create `migration/` Package
```bash
migration/
├── package.json
├── tsconfig.json
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── export/
│   │   ├── DjangoExporter.ts
│   │   └── schemas.ts      # Zod schemas for legacy data
│   ├── transform/
│   │   ├── CharacterTransformer.ts
│   │   ├── UserTransformer.ts
│   │   └── GuildTransformer.ts
│   ├── load/
│   │   ├── DataLoader.ts
│   │   └── BatchLoader.ts
│   ├── validate/
│   │   ├── IntegrityChecker.ts
│   │   ├── HashValidator.ts
│   │   └── ForeignKeyValidator.ts
│   └── reports/
│       ├── DryRunReport.ts
│       └── MigrationReport.ts
└── data/                   # Export/import data files
    ├── users.ndjson
    ├── guilds.ndjson
    └── characters.ndjson
```

#### 5.2 Export Phase
**Tasks:**
- [ ] Create script to export Django data to NDJSON:
  ```bash
  python manage.py dumpdata --natural-foreign --natural-primary \
    haven.Character haven.User chronicle.Chronicle > data/legacy.json
  ```
- [ ] Transform Django JSON to typed NDJSON files
- [ ] Generate checksums for validation

#### 5.3 Transform & Validate Phase
**Tasks:**
- [ ] Create transformer classes:
  - Map Django model fields → Domain model fields
  - Handle renamed fields (e.g., `chronicle` → `guild`)
  - Handle data structure changes
- [ ] Validate with Zod schemas
- [ ] Log rejected records for manual review

#### 5.4 Load Phase
**Tasks:**
- [ ] Implement batch loader (1000 records per transaction)
- [ ] Load in correct order (users → guilds → members → characters)
- [ ] Handle foreign key relationships
- [ ] Rollback on error

#### 5.5 Integrity Checks
**Tasks:**
- [ ] Row count validation
- [ ] Foreign key integrity checks
- [ ] Data hash comparison
- [ ] Query spot checks (compare old vs new DB results)

#### 5.6 Dry Run & Reporting
**Tasks:**
- [ ] Implement dry-run mode (validation only, no writes)
- [ ] Generate report:
  - Total records processed
  - Success count
  - Rejection count with reasons
  - Data quality issues
- [ ] Fix transformers until zero rejections

**CLI Usage:**
```bash
# Dry run
pnpm migration dry-run --source=./data --target=postgresql://...

# Full migration
pnpm migration run --source=./data --target=postgresql://...

# Validate after migration
pnpm migration validate --source=mariadb://... --target=postgresql://...
```

**Deliverables:**
- ✅ `migration/` package with complete tooling
- ✅ Successful dry-run with zero rejections
- ✅ Migration scripts ready for production cutover

---

### **Phase 6: Web Frontend** ⏱️ 3-4 weeks

**Goal:** Rebuild React frontend to use new API.

#### 6.1 Project Setup
**Tasks:**
- [ ] Set up React 19 with Vite
- [ ] Configure routing (React Router)
- [ ] Set up Material-UI or new design system
- [ ] Configure WebSocket client

#### 6.2 Core Features
**Tasks:**
- [ ] Authentication flow (Discord OAuth)
- [ ] Character list page
- [ ] Character sheet pages (by splat)
- [ ] Character creation/edit forms
- [ ] Real-time updates via WebSocket

#### 6.3 Validation
**Tasks:**
- [ ] Use Zod schemas from `shared` for client-side validation
- [ ] Form validation
- [ ] Type-safe API client

**Deliverables:**
- ✅ Functional React frontend
- ✅ Feature parity with legacy frontend
- ✅ Real-time WebSocket integration

---

### **Phase 7: Testing & Quality Assurance** ⏱️ 2 weeks

**Goal:** Comprehensive testing across all packages.

#### 7.1 Unit Tests
**Tasks:**
- [ ] Domain models (business logic)
- [ ] Validators (Zod schemas)
- [ ] Utilities
- [ ] Target: 80%+ coverage

#### 7.2 Integration Tests
**Tasks:**
- [ ] Repository tests with test database
- [ ] API endpoint tests
- [ ] Bot command tests
- [ ] Target: All critical paths covered

#### 7.3 End-to-End Tests
**Tasks:**
- [ ] Full user flows (signup → create character → use bot → update sheet)
- [ ] Cross-package integration
- [ ] WebSocket synchronization

#### 7.4 Load Testing
**Tasks:**
- [ ] API endpoint performance
- [ ] Database query performance
- [ ] Concurrent user simulation

**Deliverables:**
- ✅ Comprehensive test suite
- ✅ Performance benchmarks
- ✅ Test coverage reports

---

### **Phase 8: Cutover & Deployment** ⏱️ 1 week

**Goal:** Switch from legacy to new stack.

#### 8.1 Pre-Cutover Checklist
- [ ] All tests passing
- [ ] Migration dry-run successful
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] Rollback plan documented

#### 8.2 Cutover Steps
1. [ ] Announce maintenance window
2. [ ] Set legacy backend to read-only mode
3. [ ] Run final data export
4. [ ] Execute migration
5. [ ] Validate data integrity
6. [ ] Start new services
7. [ ] Run smoke tests
8. [ ] Switch DNS/load balancer
9. [ ] Monitor logs and metrics
10. [ ] Announce service restoration

#### 8.3 Post-Cutover
- [ ] Monitor for 48 hours
- [ ] Fix any critical issues
- [ ] Gather user feedback
- [ ] Document lessons learned

**Deliverables:**
- ✅ Successful production deployment
- ✅ Zero data loss
- ✅ Minimal downtime

---

### **Phase 9: Cleanup & Documentation** ⏱️ 1 week

**Goal:** Polish and document the new system.

#### 9.1 Code Cleanup
**Tasks:**
- [ ] Remove `backend-legacy/` directory
- [ ] Remove unused dependencies
- [ ] Update all README files
- [ ] Add inline documentation (JSDoc)

#### 9.2 Documentation
**Tasks:**
- [ ] Architecture overview
- [ ] Package responsibilities
- [ ] Development workflow guide
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide
- [ ] Troubleshooting guide

#### 9.3 Developer Experience
**Tasks:**
- [ ] Improve dev scripts
- [ ] Add pre-commit hooks
- [ ] CI/CD pipeline
- [ ] Dependabot configuration

**Deliverables:**
- ✅ Clean, well-documented codebase
- ✅ Developer onboarding guide
- ✅ Automated workflows

---

## Technical Decisions & Best Practices

### 1. **Single-Table Inheritance for Characters**
**Decision:** Use JSONB column for splat-specific data instead of separate tables.

**Rationale:**
- Simpler schema (no joins across 13 tables)
- Easier migrations
- Flexible schema evolution
- PostgreSQL JSONB is performant and indexable

**Trade-offs:**
- Loss of strict DB-level validation for splat-specific fields
- Rely on Zod schemas and domain models for validation

### 2. **Domain Models vs. ORMs**
**Decision:** Rich domain models separate from database types.

**Rationale:**
- Business logic stays in domain layer (portable, testable)
- Database types are pure data structures
- Repositories handle mapping between layers

**Pattern:**
```typescript
// Database layer (simple type)
interface CharacterDb {
  id: number;
  name: string;
  data: CharacterJsonbData;
}

// Domain layer (rich model)
class Vampire5th extends Character5th {
  constructor(data) { /* ... */ }
  
  // Domain methods
  feedHunger(amount: number): void { /* business logic */ }
  spendBloodPotency(cost: number): void { /* business logic */ }
  validate(): ValidationResult { /* validation logic */ }
}
```

### 3. **Validation Strategy**
**Decision:** Zod at boundaries, TypeScript types internally.

**Where to validate:**
- ✅ API request bodies (before domain layer)
- ✅ WebSocket messages
- ✅ Bot command inputs
- ✅ Migration data imports
- ❌ Internal function calls (trust types)

### 4. **Error Handling**
**Decision:** Two-tier error system.

**Usage:**
```typescript
// System errors (logged)
throw new RealmError('Database connection failed', {
  location: 'CharacterRepository.findById',
  fields: { characterId: id.toString() },
  cause: originalError,
});

// User errors (not logged)
throw ClientError.notFound('Character not found', {
  errorCode: 'CHARACTER_NOT_FOUND',
  fields: { name, userId },
});
```

### 5. **Logging Strategy**
**Decision:** Structured logging with singleton logger.

**Best practices:**
- Set app name at startup: `logger.setAppName('api')`
- Include location for all logs: `logger.info('msg', { location: 'Class.method' })`
- Add contextual fields: `{ fields: { userId, characterId } }`
- Use appropriate levels (debug/info/warning/error/fatal)
- Don't log `ClientError` (user mistakes)

### 6. **Testing Strategy**
**Layers:**
- **Unit tests**: Domain models, utilities (no external dependencies)
- **Integration tests**: Repositories, services (test database)
- **E2E tests**: Full user flows (test database + mock Discord)

**Tools:**
- Jest for all testing
- Supertest for API tests
- Test database with Docker

### 7. **Database Connection Management**
**Decision:** Singleton DB connection exported from `database/`.

**Usage:**
```typescript
// In database package
export const db = drizzle({ connection: process.env.DATABASE_URL });

// In other packages
import { db } from 'database';
const users = await db.select().from(usersTable);
```

**Why:** Ensures single connection pool across all packages.

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Data loss during migration** | Critical | Multiple backups, dry-run validation, checksums |
| **Downtime during cutover** | High | Maintenance window, fast rollback plan, monitoring |
| **Type mismatches at runtime** | Medium | Zod validation at boundaries, comprehensive tests |
| **Performance regression** | Medium | Load testing, query optimization, caching strategy |
| **Bot-database coupling issues** | Medium | Repository abstraction, integration tests |
| **Character data schema drift** | Low | Type-safe mappers, schema version tracking |

---

## Success Metrics

### Technical Metrics
- ✅ 100% TypeScript (no JavaScript files)
- ✅ 80%+ test coverage
- ✅ Zero data loss during migration
- ✅ API response time < 200ms (p95)
- ✅ Bot command response time < 500ms (p95)
- ✅ Zero untyped `any` in production code

### Operational Metrics
- ✅ Deployment time < 30 minutes
- ✅ Rollback time < 5 minutes
- ✅ Zero critical bugs in first week
- ✅ < 2 hours downtime during cutover

### User Experience Metrics
- ✅ Feature parity with legacy system
- ✅ No user-facing breaking changes
- ✅ Improved error messages
- ✅ Positive user feedback

---

## Timeline Summary

| Phase | Duration | Description |
|-------|----------|-------------|
| **Phase 1** | 2-3 weeks | Foundation & Domain Models |
| **Phase 2** | 1-2 weeks | Repository Layer |
| **Phase 3** | 2-3 weeks | API Implementation |
| **Phase 4** | 3-4 weeks | Bot Migration |
| **Phase 5** | 2-3 weeks | Migration Tooling |
| **Phase 6** | 3-4 weeks | Web Frontend |
| **Phase 7** | 2 weeks | Testing & QA |
| **Phase 8** | 1 week | Cutover & Deployment |
| **Phase 9** | 1 week | Cleanup & Documentation |
| **TOTAL** | **17-24 weeks** | **~4-6 months** |

---

## Immediate Next Steps

### Week 1-2: Domain Foundation
1. [ ] Create `domain/` package structure
2. [ ] Port `Character` base class from Django
3. [ ] Port `Character5th` intermediate class
4. [ ] Port `Vampire5th` class with all fields and methods
5. [ ] Add unit tests for Vampire5th

### Week 3: Character Data Types
1. [ ] Define `Vampire5thData` interface in `shared/`
2. [ ] Update `database/src/types/index.ts`
3. [ ] Verify Zod schema matches type
4. [ ] Test serialization/deserialization

### Week 4: Repository Pattern
1. [ ] Create `repositories/` package
2. [ ] Implement `BaseRepository`
3. [ ] Implement `CharacterMapper`
4. [ ] Implement `CharacterRepository`
5. [ ] Add integration tests

---

## Questions to Resolve

1. **ID Strategy**: Continue with bigint (Discord snowflakes) or move to UUIDs?
   - **Recommendation**: Keep bigint for users/guilds (Discord IDs), use serial for characters
   
2. **Soft Deletes**: Implement globally or per-entity?
   - **Recommendation**: Add `deletedAt` to users/guilds, hard delete characters

3. **Caching Strategy**: Redis for API responses?
   - **Recommendation**: Add later (Phase 10+), not critical for MVP

4. **Event Sourcing**: Track character changes for audit log?
   - **Recommendation**: Add later (Phase 10+), use simple audit table for now

5. **WebSocket Protocol**: Keep legacy format or redesign?
   - **Recommendation**: Keep compatible format, improve later

---

## Appendix: Folder Structure (Complete)

```
realm-of-darkness/
├── package.json              # Root package
├── pnpm-workspace.yaml       # Workspace config
├── turbo.json               # Turborepo config
├── tsconfig.json            # Root TypeScript config
├── .eslintrc.js             # ESLint config
├── .prettierrc              # Prettier config
├── .env.example             # Example env vars
├── README.md                # Main README
├── REFACTOR_PLAN.md         # This file
├── PACKAGE_RESTRUCTURE.md   # Old planning doc
├── Project_Refactor.md      # Old planning doc
│
├── packages/
│   ├── shared/              # ✅ COMPLETE
│   │   ├── src/
│   │   │   ├── errors/
│   │   │   ├── logger/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── validations/
│   │   └── test/
│   │
│   ├── database/            # ✅ MOSTLY COMPLETE
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── drizzle/         # Migrations
│   │
│   ├── domain/              # ❌ TODO: Phase 1
│   │   ├── src/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── events/
│   │   │   └── interfaces/
│   │   └── test/
│   │
│   ├── repositories/        # ❌ TODO: Phase 2
│   │   ├── src/
│   │   │   ├── CharacterRepository.ts
│   │   │   ├── UserRepository.ts
│   │   │   └── mappers/
│   │   └── test/
│   │
│   ├── migration/           # ❌ TODO: Phase 5
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   ├── export/
│   │   │   ├── transform/
│   │   │   ├── load/
│   │   │   └── validate/
│   │   └── data/
│   │
│   └── scripts/             # Utility scripts
│
├── apps/
│   ├── api/                 # ⚠️ IN PROGRESS
│   │   ├── src/
│   │   │   ├── character/
│   │   │   ├── user/
│   │   │   ├── guild/
│   │   │   ├── gateway/
│   │   │   └── main.ts
│   │   └── test/
│   │
│   ├── bot/                 # ⚠️ NEEDS MIGRATION
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   ├── events/
│   │   │   ├── modules/
│   │   │   └── main/
│   │   └── scripts/
│   │
│   └── web/                 # ❌ TODO: Phase 6
│       ├── src/
│       │   ├── components/
│       │   ├── routes/
│       │   └── main.tsx
│       └── public/
│
├── backend-legacy/          # Django legacy code (will be removed)
├── frontend/                # React legacy code (will be removed)
└── discord_bots/            # Old bot code (will be removed)
```

---

## Conclusion

This refactor is a significant undertaking that will modernize the entire Realm of Darkness platform. By following this phased approach:

1. **We minimize risk** through incremental changes and comprehensive testing
2. **We maintain quality** through strong typing and validation at every layer
3. **We enable future growth** with a clean, modular architecture
4. **We reduce complexity** by eliminating redundant API layers

The estimated timeline of 4-6 months is realistic given the scope, and can be parallelized in some areas (e.g., API and bot development can happen simultaneously after Phase 2).

**Success depends on:**
- Strict adherence to type safety (no `any` types)
- Comprehensive testing at each phase
- Careful data migration with validation
- Regular communication about progress and blockers

Let's build something amazing! 🚀
