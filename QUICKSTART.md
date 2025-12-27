# Refactor Quick Start Guide

**For Developers Working on the Realm of Darkness Refactor**

---

## 📚 Essential Reading (Priority Order)

1. **[REFACTOR_STATUS.md](./REFACTOR_STATUS.md)** ← **Start here!**
   - Current progress snapshot
   - What's done, what's next
   - Known issues and blockers
2. **[PHASE_1_CHECKLIST.md](./PHASE_1_CHECKLIST.md)** ← **Working tasks**
   - Detailed task breakdown for current phase
   - Acceptance criteria for each task
   - Design decisions and patterns

3. **[DOMAIN_REPOSITORY_EXPLAINED.md](./DOMAIN_REPOSITORY_EXPLAINED.md)** ← **Architecture patterns**
   - What are domain models and repositories?
   - Why this pattern?
   - Detailed examples with code

4. **[EVENTS_SYSTEM.md](./EVENTS_SYSTEM.md)** ← **Redis pub/sub system**
   - How apps communicate in real-time
   - Event contracts and schemas
   - Usage examples

5. **[REFACTOR_PLAN.md](./REFACTOR_PLAN.md)** ← **Full context**
   - Complete architectural plan
   - All 9 phases explained
   - Technical decisions and rationale

6. **[shared/README.md](./shared/README.md)** ← **How to use shared code**
   - Logger usage
   - Error handling
   - Validation with Zod

---

## 🚀 Getting Started

### Prerequisites

```bash
# Node.js 18+ required
node --version

# pnpm required (not npm)
npm install -g pnpm@9

# PostgreSQL required
psql --version
```

### Initial Setup

```bash
# Clone and install
git clone <repo-url>
cd realm-of-darkness
git checkout refactor/project-overhaul

# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run tests (once they exist)
pnpm test
```

### Environment Setup

```bash
# Create .env files for each app
cp api/.env.example api/.env
cp bot/.env.example bot/.env
cp database/.env.example database/.env

# Edit .env files with your credentials
# - DATABASE_URL for PostgreSQL
# - Discord tokens for bot
# - API keys, etc.
```

---

## 📦 Package Overview

### Current Packages

```
realm-of-darkness/
├── packages/common/        ✅ COMPLETE - DTOs, contracts, Zod schemas
├── packages/core/          🔄 IN PROGRESS - Entities, services, actions
├── packages/database/      ✅ COMPLETE - Drizzle schemas
├── packages/repositories/  ⏳ NOT STARTED - Data access
├── packages/logger/        ✅ COMPLETE - Logging
├── packages/events/        ⏳ NOT STARTED - Redis pub/sub
├── apps/api/               ⏳ NOT STARTED - NestJS API
├── apps/bot/               ⏳ NOT STARTED - Discord bots
└── backend-legacy/         ⚠️  Frozen Django code
```

### Planned Packages

```
├── repositories/    ❌ TODO - Phase 2 - Data access layer
└── migration/       ❌ TODO - Phase 5 - Django → Drizzle migration tools
```

**Note:** `events/` package enables real-time communication between API, bot shards, and web clients via Redis.

---

## 🎯 Current Focus: Phase 1

**Goal:** Build the domain layer with all character models.

### What You Can Work On Now

#### Option 1: Create Domain Package Structure

- **File:** Start `domain/package.json` and `domain/tsconfig.json`
- **Time:** 2-4 hours
- **Checklist:** [PHASE_1_CHECKLIST.md - Task 1](./PHASE_1_CHECKLIST.md#task-1-create-domain-package-structure)
- **Pre-requisites:** None
- **Impact:** Unblocks all domain development

#### Option 2: Define Character Data Types

- **File:** Start `shared/src/types/character-data/vampire5th.ts`
- **Time:** 8-12 hours
- **Checklist:** [PHASE_1_CHECKLIST.md - Task 2](./PHASE_1_CHECKLIST.md#task-2-define-complete-character-data-types)
- **Pre-requisites:** None (can work in parallel with Option 1)
- **Impact:** Enables proper type checking for character data

#### Option 3: Review Django Models

- **File:** Read `backend-legacy/haven/models/Vampire5th.py`
- **Time:** 2-4 hours
- **Purpose:** Understand existing business logic before porting
- **Output:** Notes on what needs to be ported

---

## 🛠️ Development Workflow

### Working on a New Task

```bash
# 1. Create a feature branch
git checkout -b feature/domain-vampire5th-model

# 2. Work in the relevant package
cd domain/  # or shared/, database/, etc.

# 3. Make changes, write tests

# 4. Build and test locally
pnpm build
pnpm test

# 5. Run lint and format
pnpm lint
pnpm format

# 6. Commit with descriptive message
git add .
git commit -m "feat(domain): implement Vampire5th character model"

# 7. Push and create PR
git push origin feature/domain-vampire5th-model
```

### Branch Naming Convention

Follow the existing pattern:

- `feature/description` - New functionality
- `refactor/description` - Code improvements
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `test/description` - Test additions

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`

**Examples:**

```
feat(domain): add Vampire5th character model
refactor(shared): improve error handling types
docs(readme): update refactor status
test(domain): add unit tests for Character class
```

---

## 📝 Code Standards

### TypeScript Rules

```typescript
// ✅ DO: Use explicit types
function createCharacter(name: string, userId: bigint): Character {
  return new Character({ name, userId });
}

// ❌ DON'T: Use any
function createCharacter(name: any, userId: any) {
  // Bad!
  return new Character({ name, userId });
}

// ✅ DO: Use strict null checks
function findCharacter(id: number): Character | null {
  // ...
}

// ❌ DON'T: Assume values exist
function findCharacter(id: number): Character {
  // Bad!
  // What if not found?
}

// ✅ DO: Document public APIs
/**
 * Creates a new Vampire5th character.
 *
 * @param name - Character name (1-50 characters)
 * @param userId - Discord user ID (snowflake)
 * @returns Newly created character instance
 * @throws {UserError} If validation fails
 */
function createVampire(name: string, userId: bigint): Vampire5th {
  // ...
}
```

### Error Handling

```typescript
import { RealmError, UserError } from "@realm/errors";

// ✅ DO: Use UserError for user mistakes (not logged)
if (!name || name.length > 50) {
  throw new UserError("Character name must be 1-50 characters", {
    fields: { name },
  });
}

// ✅ DO: Use RealmError for system errors
try {
  await db.insert(characters).values(data);
} catch (error) {
  throw new RealmError("Failed to save character", {
    cause: error,
    fields: { characterId: data.id.toString() },
  });
}

// ❌ DON'T: Throw generic errors
throw new Error("something went wrong"); // Bad!
```

### Logging

```typescript
import { logger } from "@realm/logger";

// ✅ DO: Set app name at startup (in main entry point)
logger.setAppName("domain");

// ✅ DO: Use logger directly (it's a singleton)
logger.info("Character created", {
  fields: { characterId: char.id.toString(), userId: char.userId.toString() },
});

// ✅ DO: Log errors with context
logger.error("Database query failed", {
  fields: { characterId: id.toString() },
});

// ❌ DON'T: Use console.log
console.log("something happened"); // Bad!
```

### Validation

```typescript
import { Vampire5thDataSchema, UserError, RealmError } from "@realm/common";

// ✅ DO: Validate at API/Bot edge with Zod (throw UserError)
const result = Vampire5thDataSchema.safeParse(inputData);
if (!result.success) {
  throw new UserError("Invalid character data", {
    fields: { errors: result.error.message },
  }); // User provided bad data
}

// ✅ DO: Trust types in services/entities (NO Zod validation)
function updateHunger(char: Vampire5th, amount: number): void {
  // Trust TypeScript types - no Zod validation needed
  const newHunger = char.hunger + amount;

  // Only check for impossible internal states
  if (newHunger < 0 || newHunger > 5) {
    throw new RealmError("Internal error: hunger out of range", {
      fields: { hunger: newHunger.toString() },
    }); // Our bug
  }

  char.hunger = newHunger;
}

// ✅ DO: Validate at repository/DB edge (throw RealmError)
async function saveCharacter(data: CharacterData): Promise<void> {
  const validated = CharacterDataSchema.safeParse(data);
  if (!validated.success) {
    throw new RealmError("Invalid data reached repository", {
      fields: { errors: validated.error.message },
    }); // Our bug
  }

  await db.insert(characters).values(validated.data);
}
```

---

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Test file: domain/test/models/Vampire5th.test.ts

import { Vampire5th } from "@/models/5th/Vampire5th";

describe("Vampire5th", () => {
  describe("constructor", () => {
    it("should create a vampire with valid data", () => {
      const vampire = new Vampire5th({
        name: "Test Vampire",
        userId: 123456789n,
        clan: "Ventrue",
        generation: 10,
        bloodPotency: 1,
      });

      expect(vampire.name).toBe("Test Vampire");
      expect(vampire.clan).toBe("Ventrue");
    });
  });

  describe("hunger system", () => {
    it("should increase hunger correctly", () => {
      const vampire = new Vampire5th({
        /* ... */
      });
      vampire.increaseHunger(2);
      expect(vampire.hunger).toBe(2);
    });

    it("should not exceed max hunger of 5", () => {
      const vampire = new Vampire5th({ hunger: 4 /* ... */ });
      vampire.increaseHunger(5);
      expect(vampire.hunger).toBe(5);
    });
  });
});
```

### Integration Tests

```typescript
// Test file: repositories/test/CharacterRepository.test.ts

import { CharacterRepository } from "@/CharacterRepository";
import { db } from "database";

describe("CharacterRepository", () => {
  let repo: CharacterRepository;

  beforeAll(async () => {
    // Set up test database
    repo = new CharacterRepository(db);
  });

  it("should save and retrieve a character", async () => {
    const vampire = new Vampire5th({
      /* ... */
    });
    const saved = await repo.create(vampire);

    const retrieved = await repo.findById(saved.id!);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe(vampire.name);
  });
});
```

---

## 🔍 Debugging Tips

### TypeScript Errors

```bash
# Build a specific package to see errors
pnpm --filter domain build

# Check types without building
pnpm --filter domain typecheck
```

### Finding References

```bash
# Search for usages across entire monorepo
git grep -n "Vampire5th"

# Search in specific package
git grep -n "Vampire5th" domain/
```

### Database Debugging

```bash
# Access Drizzle Studio (DB GUI)
pnpm --filter database studio

# Run migrations
pnpm migrate

# Check schema
psql $DATABASE_URL -c "\d characters"
```

---

## 📚 Reference Materials

### Internal Docs

- **Architecture:** [REFACTOR_PLAN.md](./REFACTOR_PLAN.md)
- **Current Status:** [REFACTOR_STATUS.md](./REFACTOR_STATUS.md)
- **Current Tasks:** [PHASE_1_CHECKLIST.md](./PHASE_1_CHECKLIST.md)
- **Common Package:** [packages/common/README.md](./packages/common/README.md)

### Legacy Code Reference

- **Django Models:** `backend-legacy/haven/models/`
- **Django Serializers:** `backend-legacy/haven/serializers/`
- **Old Bot Code:** `discord_bots/src/structures/characters/`

### External Resources

- **TypeScript:** https://www.typescriptlang.org/docs/
- **Drizzle ORM:** https://orm.drizzle.team/docs/overview
- **NestJS:** https://docs.nestjs.com/
- **Zod:** https://zod.dev/
- **Discord.js:** https://discord.js.org/

---

## ❓ FAQ

### Q: Can I work on bot migration now?

**A:** Not yet. Bot migration is Phase 4. We need domain models (Phase 1) and repositories (Phase 2) first, so the bot has something to use.

### Q: Should I update the legacy code?

**A:** No. `backend-legacy/`, `frontend/`, and `discord_bots/` are frozen. All new work goes in the new packages.

### Q: I found a bug in the common package. Can I fix it?

**A:** Yes! The common package is used by everything, so fixes are welcome. Just make sure to test thoroughly.

### Q: How do I add a new character type?

**A:** Wait until Phase 1 is complete and patterns are established. Then follow the Vampire5th pattern as a template.

### Q: What if I have a better architecture idea?

**A:** Great! Document it and discuss before implementing. We want to be flexible but also avoid major rewrites mid-phase.

### Q: Can I use a different library/framework?

**A:** Probably not. We've standardized on TypeScript, Drizzle, NestJS, etc. Introducing new tech increases complexity.

### Q: I'm stuck. Who can I ask?

**A:** Check the docs first, then:

1. Search closed issues/PRs for similar problems
2. Ask in the Discord development channel
3. Create a GitHub discussion

---

## 🎉 You're Ready!

Pick a task from [PHASE_1_CHECKLIST.md](./PHASE_1_CHECKLIST.md) and get started!

**Remember:**

- ✅ Write tests
- ✅ Document your code
- ✅ Use strict types
- ✅ Handle errors properly
- ✅ Log with context
- ✅ Commit often

**Good luck! 🚀**
