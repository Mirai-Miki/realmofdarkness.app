# Phase 1: Foundation & Domain Models - Task Checklist

**Duration:** 2-3 weeks  
**Status:** 🔄 In Progress  
**Start Date:** November 1, 2025

---

## Overview

This phase establishes the domain layer with rich character models and completes all type definitions. By the end of this phase, we will have:

- ✅ Complete `domain/` package with all character classes
- ✅ Fully typed character data structures (no more `Record<string, unknown>`)
- ✅ Repository interfaces defined
- ✅ Unit tests for domain logic
- ✅ Clear patterns for future development

---

## Task 1: Create Domain Package Structure

**Estimated Time:** 2-4 hours  
**Status:** ⏳ Not Started

### Subtasks

- [ ] Create `domain/` directory in project root
- [ ] Create `domain/package.json` with proper configuration
  ```json
  {
    "name": "domain",
    "private": true,
    "type": "module",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "scripts": {
      "build": "tsc -b",
      "lint": "eslint src --ext .ts",
      "test": "jest"
    },
    "dependencies": {
      "shared": "workspace:*",
      "database": "workspace:*"
    }
  }
  ```
- [ ] Create `domain/tsconfig.json` extending root config
- [ ] Create directory structure:
  ```
  domain/
  ├── src/
  │   ├── index.ts
  │   ├── models/
  │   │   ├── base/
  │   │   ├── 5th/
  │   │   └── 20th/
  │   ├── services/
  │   ├── events/
  │   └── interfaces/
  └── test/
      ├── models/
      ├── services/
      └── fixtures/
  ```
- [ ] Add to `pnpm-workspace.yaml`
- [ ] Add to root `tsconfig.json` references
- [ ] Add to `turbo.json` pipeline
- [ ] Test package builds: `pnpm --filter domain build`

**Acceptance Criteria:**
- ✅ Package builds successfully
- ✅ Can import from other packages via workspace protocol
- ✅ TypeScript compilation works with project references

---

## Task 2: Define Complete Character Data Types

**Estimated Time:** 8-12 hours  
**Status:** ⏳ Not Started

### 2.1: Create Character Data Type Directory Structure

- [ ] Create `shared/src/types/character-data/` directory
- [ ] Create index file: `shared/src/types/character-data/index.ts`

### 2.2: Define Common/Base Types

- [ ] Create `shared/src/types/character-data/common.ts`:
  - [ ] `ExperienceData` interface
  - [ ] `ExperienceSpend` interface
  - [ ] `TrackableData` interface
  - [ ] `AttributesData` interface (for 5th/20th editions)
  - [ ] `SkillsData` interface (for 5th/20th editions)
  - [ ] `HealthData` interface

### 2.3: Define 5th Edition Character Data Types

- [ ] Create `character5th.ts` with `Character5thData` interface:
  - [ ] Attributes (Physical, Social, Mental)
  - [ ] Skills (Physical, Social, Mental)
  - [ ] Health tracker
  - [ ] Willpower tracker
  - [ ] Custom traits/merits

- [ ] Create `vampire5th.ts` with `Vampire5thData` interface:
  - [ ] Clan
  - [ ] Generation
  - [ ] Blood Potency
  - [ ] Hunger
  - [ ] Humanity and Stains
  - [ ] Disciplines (with powers)
  - [ ] Predator Type
  - [ ] Resonance
  - [ ] Sire
  - [ ] Date of Death
  - [ ] Apparent Age

- [ ] Create `hunter5th.ts` with `Hunter5thData` interface
  - [ ] Creed
  - [ ] Drive
  - [ ] Edges
  - [ ] Desperation
  - [ ] Danger

- [ ] Create `werewolf5th.ts` with `Werewolf5thData` interface
  - [ ] Tribe
  - [ ] Auspice
  - [ ] Renown (Glory, Honor, Wisdom)
  - [ ] Rage
  - [ ] Gifts
  - [ ] Forms

- [ ] Create `ghoul5th.ts` with `Ghoul5thData` interface
- [ ] Create `human5th.ts` with `Human5thData` interface

### 2.4: Define 20th Anniversary Character Data Types

- [ ] Create `character20th.ts` with `Character20thData` interface
- [ ] Create `vampire20th.ts` with `Vampire20thData` interface
- [ ] Create `werewolf20th.ts` with `Werewolf20thData` interface
- [ ] Create `changeling20th.ts` with `Changeling20thData` interface
- [ ] Create `mage20th.ts` with `Mage20thData` interface
- [ ] Create `demon20th.ts` with `Demon20thData` interface
- [ ] Create `wraith20th.ts` with `Wraith20thData` interface
- [ ] Create `ghoul20th.ts` with `Ghoul20thData` interface
- [ ] Create `human20th.ts` with `Human20thData` interface

### 2.5: Update Database Types

- [ ] Update `database/src/types/index.ts` to use real types:
  ```typescript
  import type {
    Vampire5thData,
    Hunter5thData,
    // ... all other types
  } from 'shared/types/character-data';
  
  export type SplatDataMap = {
    [Splats.Vampire5th]: Vampire5thData;
    [Splats.Hunter5th]: Hunter5thData;
    // ... etc
  };
  ```

### 2.6: Validate Types Match Zod Schemas

- [ ] Write type tests to ensure Zod schemas match TypeScript interfaces:
  ```typescript
  // shared/test/schema-type-alignment.test.ts
  import { Vampire5thDataSchema } from '@/validations';
  import type { Vampire5thData } from '@/types/character-data';
  
  type InferredFromSchema = z.infer<typeof Vampire5thDataSchema>;
  
  // This test will fail to compile if types don't match
  const assertTypesMatch: InferredFromSchema = {} as Vampire5thData;
  ```

**Acceptance Criteria:**
- ✅ All character data types fully defined with proper TypeScript interfaces
- ✅ No `Record<string, unknown>` or `any` types
- ✅ Types match existing Zod schemas
- ✅ Database package uses real types
- ✅ All types properly exported from shared package

---

## Task 3: Implement Base Character Class

**Estimated Time:** 8-10 hours  
**Status:** ⏳ Not Started

### 3.1: Create Base Character Class

- [ ] Create `domain/src/models/base/Character.ts`
- [ ] Define constructor with common properties:
  - [ ] `id?: number` (optional for new characters)
  - [ ] `name: string`
  - [ ] `userId: bigint`
  - [ ] `guildId?: bigint`
  - [ ] `splat: Splats`
  - [ ] `isSheet: boolean`
  - [ ] `createdAt?: Date`
  - [ ] `lastUpdated?: Date`

### 3.2: Implement Experience System

- [ ] Add experience properties:
  - [ ] `expCurrent: number`
  - [ ] `expTotal: number`
  - [ ] `expSpends: Record<string, ExperienceSpend>`
- [ ] Implement methods:
  - [ ] `addExperience(amount: number): void`
  - [ ] `spendExperience(spend: ExperienceSpend): void`
  - [ ] `removeExpSpend(spendId: string): void`
  - [ ] `getAvailableExperience(): number`

### 3.3: Implement Profile System

- [ ] Add profile properties:
  - [ ] `dateOfBirth?: string`
  - [ ] `age?: string`
  - [ ] `history?: string`
  - [ ] `appearanceDescription?: string`
  - [ ] `notes?: string`
  - [ ] `notes2?: string`
  - [ ] `avatar?: string`
  - [ ] `embedColor: string` (hex color)
  - [ ] `storytellerLock: boolean`

### 3.4: Implement Core Methods

- [ ] `serialize(): CharacterJsonbData`
  - Abstract method to be implemented by subclasses
  - Converts domain model to JSONB data
- [ ] `validate(): ValidationResult`
  - Abstract method to validate business rules
- [ ] `clone(): Character`
  - Create a copy of the character
- [ ] `toJSON(): object`
  - For API responses

### 3.5: Add Type Guards

- [ ] `isVampire5th(): this is Vampire5th`
- [ ] `isHunter5th(): this is Hunter5th`
- [ ] Add for all splats

### 3.6: Write Unit Tests

- [ ] Test experience tracking
- [ ] Test profile management
- [ ] Test validation
- [ ] Test serialization
- [ ] Test type guards

**Acceptance Criteria:**
- ✅ Base `Character` class compiles without errors
- ✅ All common functionality implemented
- ✅ Tests pass with >80% coverage
- ✅ Documentation (JSDoc) complete

---

## Task 4: Implement Character5th Intermediate Class

**Estimated Time:** 10-12 hours  
**Status:** ⏳ Not Started

### 4.1: Create Character5th Class

- [ ] Create `domain/src/models/5th/Character5th.ts`
- [ ] Extend `Character` base class
- [ ] Import `Character5thData` type from shared

### 4.2: Implement Attributes System

- [ ] Add attributes:
  ```typescript
  attributes: {
    physical: { strength: number; dexterity: number; stamina: number };
    social: { charisma: number; manipulation: number; composure: number };
    mental: { intelligence: number; wits: number; resolve: number };
  }
  ```
- [ ] Implement methods:
  - [ ] `getAttribute(category: string, name: string): number`
  - [ ] `setAttribute(category: string, name: string, value: number): void`
  - [ ] `getAttributeTotal(category: string): number`

### 4.3: Implement Skills System

- [ ] Add skills (Physical, Social, Mental skills)
- [ ] Implement methods:
  - [ ] `getSkill(category: string, name: string): number`
  - [ ] `setSkill(category: string, name: string, value: number): void`
  - [ ] `getSkillTotal(category: string): number`

### 4.4: Implement Health System

- [ ] Add health tracking:
  - [ ] `healthMax: number`
  - [ ] `healthSuperficial: number`
  - [ ] `healthAggravated: number`
- [ ] Implement methods:
  - [ ] `takeDamage(type: 'superficial' | 'aggravated', amount: number): void`
  - [ ] `heal(type: 'superficial' | 'aggravated', amount: number): void`
  - [ ] `getCurrentHealth(): number`
  - [ ] `isIncapacitated(): boolean`

### 4.5: Implement Willpower System

- [ ] Add willpower tracking:
  - [ ] `willpowerMax: number`
  - [ ] `willpowerSuperficial: number`
  - [ ] `willpowerAggravated: number`
- [ ] Implement methods similar to health

### 4.6: Implement Traits/Merits System

- [ ] Add custom traits:
  - [ ] `traits: Record<string, CustomTrait>`
- [ ] Implement methods:
  - [ ] `addTrait(trait: CustomTrait): void`
  - [ ] `removeTrait(traitId: string): void`
  - [ ] `getTrait(traitId: string): CustomTrait | undefined`

### 4.7: Override Abstract Methods

- [ ] Implement `serialize(): Character5thData`
- [ ] Implement `validate(): ValidationResult`

### 4.8: Write Unit Tests

- [ ] Test attribute system
- [ ] Test skills system
- [ ] Test health tracking
- [ ] Test willpower tracking
- [ ] Test traits/merits
- [ ] Test serialization
- [ ] Test validation

**Acceptance Criteria:**
- ✅ `Character5th` class compiles and extends `Character`
- ✅ All 5th edition mechanics implemented
- ✅ Tests pass with >80% coverage
- ✅ Documentation complete

---

## Task 5: Implement Vampire5th Class

**Estimated Time:** 12-16 hours  
**Status:** ⏳ Not Started

### 5.1: Create Vampire5th Class

- [ ] Create `domain/src/models/5th/Vampire5th.ts`
- [ ] Extend `Character5th` class
- [ ] Import `Vampire5thData` type from shared

### 5.2: Implement Core Vampire Properties

- [ ] Add vampire-specific properties:
  - [ ] `clan: string`
  - [ ] `generation: number`
  - [ ] `bloodPotency: number`
  - [ ] `hunger: number`
  - [ ] `predatorType: string`
  - [ ] `sire: string`
  - [ ] `dateOfDeath?: string`
  - [ ] `apparentAge?: string`
  - [ ] `resonance?: string`
  - [ ] `huntingRoll?: string`

### 5.3: Implement Humanity System

- [ ] Add humanity tracking:
  - [ ] `humanity: number` (0-10)
  - [ ] `stains: number` (0-10)
- [ ] Implement methods:
  - [ ] `addStain(amount: number): void`
  - [ ] `clearStains(): void`
  - [ ] `remorseRoll(): { success: boolean, humanityLost: number }`
  - [ ] `isHumanityDepleted(): boolean`

### 5.4: Implement Hunger System

- [ ] Implement methods:
  - [ ] `increaseHunger(amount: number): void`
  - [ ] `decreaseHunger(amount: number): void`
  - [ ] `slakeHunger(amount: number): void`
  - [ ] `isHungryBeast(): boolean` (hunger >= 5)
  - [ ] `getHungerPenalty(): number`

### 5.5: Implement Blood Potency System

- [ ] Implement methods:
  - [ ] `getBloodSurge(): number` (bonus dice from blood potency)
  - [ ] `getMendAmount(): number` (healing from blood)
  - [ ] `getPowerBonus(): number` (discipline bonus)
  - [ ] `getFeedingPenalty(): number` (difficulty feeding)
  - [ ] `getBaneStrength(): number`

### 5.6: Implement Disciplines System

- [ ] Add disciplines:
  - [ ] `disciplines: Record<string, Discipline>`
  - [ ] Each discipline has: name, rating, powers[]
  - [ ] Each power has: name, level, description, system, cost, etc.
- [ ] Implement methods:
  - [ ] `addDiscipline(discipline: Discipline): void`
  - [ ] `removeDiscipline(disciplineId: string): void`
  - [ ] `updateDisciplineRating(disciplineId: string, rating: number): void`
  - [ ] `addPower(disciplineId: string, power: DisciplinePower): void`
  - [ ] `removePower(disciplineId: string, powerId: string): void`
  - [ ] `getDiscipline(disciplineId: string): Discipline | undefined`
  - [ ] `getAllPowers(): DisciplinePower[]`

### 5.7: Override Abstract Methods

- [ ] Implement `serialize(): Vampire5thData`
  - Must include all Character5th data + vampire-specific data
- [ ] Implement `validate(): ValidationResult`
  - Check hunger range (0-5)
  - Check blood potency range (0-10)
  - Check humanity range (0-10)
  - Check stains don't exceed humanity
  - Validate disciplines have valid ratings

### 5.8: Add Vampire-Specific Utility Methods

- [ ] `canUseBloodSurge(): boolean`
- [ ] `canActivateDiscipline(power: DisciplinePower): boolean`
- [ ] `spendBlood(amount: number): void`
- [ ] `mendDamage(): void`

### 5.9: Write Comprehensive Unit Tests

- [ ] Test construction and initialization
- [ ] Test humanity and stains
- [ ] Test hunger mechanics
- [ ] Test blood potency calculations
- [ ] Test disciplines CRUD
- [ ] Test powers CRUD
- [ ] Test validation rules
- [ ] Test serialization (to/from JSONB)
- [ ] Test edge cases (max hunger, zero humanity, etc.)
- [ ] Test blood surge mechanics
- [ ] Test mending

**Acceptance Criteria:**
- ✅ `Vampire5th` class compiles and extends `Character5th`
- ✅ All vampire mechanics implemented per V5 rules
- ✅ Tests pass with >85% coverage
- ✅ Business logic matches Django implementation
- ✅ Documentation complete with examples

---

## Task 6: Define Repository Interfaces

**Estimated Time:** 4-6 hours  
**Status:** ⏳ Not Started

### 6.1: Create Repository Interface Directory

- [ ] Create `domain/src/interfaces/` directory
- [ ] Create `domain/src/interfaces/index.ts`

### 6.2: Define IBaseRepository

- [ ] Create `domain/src/interfaces/IBaseRepository.ts`:
  ```typescript
  export interface IBaseRepository<T> {
    findById(id: number): Promise<T | null>;
    create(entity: T): Promise<T>;
    update(entity: T): Promise<T>;
    delete(id: number): Promise<void>;
  }
  ```

### 6.3: Define ICharacterRepository

- [ ] Create `domain/src/interfaces/ICharacterRepository.ts`:
  ```typescript
  export interface ICharacterRepository extends IBaseRepository<Character> {
    findByUser(userId: bigint, name: string): Promise<Character | null>;
    findAllByUser(userId: bigint): Promise<Character[]>;
    findByGuild(guildId: bigint): Promise<Character[]>;
    findByUserAndGuild(userId: bigint, guildId: bigint): Promise<Character[]>;
    setAsSheet(characterId: number, userId: bigint): Promise<void>;
    getActiveSheet(userId: bigint, guildId?: bigint): Promise<Character | null>;
  }
  ```

### 6.4: Define IUserRepository

- [ ] Create `domain/src/interfaces/IUserRepository.ts`

### 6.5: Define IGuildRepository

- [ ] Create `domain/src/interfaces/IGuildRepository.ts`

### 6.6: Define IMemberRepository

- [ ] Create `domain/src/interfaces/IMemberRepository.ts`

**Acceptance Criteria:**
- ✅ All repository interfaces defined
- ✅ Interfaces are generic and domain-focused
- ✅ No implementation details (no Drizzle/SQL references)
- ✅ Well documented with JSDoc

---

## Task 7: Port Remaining 5th Edition Character Classes

**Estimated Time:** 20-24 hours  
**Status:** ⏳ Not Started

### 7.1: Implement Hunter5th

- [ ] Create `domain/src/models/5th/Hunter5th.ts`
- [ ] Implement hunter-specific properties (creed, drive, edges, desperation, danger)
- [ ] Implement hunter mechanics
- [ ] Write unit tests

### 7.2: Implement Werewolf5th

- [ ] Create `domain/src/models/5th/Werewolf5th.ts`
- [ ] Implement werewolf properties (tribe, auspice, renown, rage, gifts, forms)
- [ ] Implement rage and transformation mechanics
- [ ] Write unit tests

### 7.3: Implement Human5th

- [ ] Create `domain/src/models/5th/Human5th.ts`
- [ ] Implement human-specific traits
- [ ] Write unit tests

### 7.4: Implement Ghoul5th

- [ ] Create `domain/src/models/5th/Ghoul5th.ts`
- [ ] Implement ghoul properties (blood bond, disciplines)
- [ ] Write unit tests

**Acceptance Criteria:**
- ✅ All 5th edition character classes implemented
- ✅ All classes extend Character5th
- ✅ Tests pass with >80% coverage
- ✅ Pattern consistent with Vampire5th

---

## Task 8: Implement Character20th Intermediate Class

**Estimated Time:** 10-12 hours  
**Status:** ⏳ Not Started

### 8.1: Create Character20th Class

- [ ] Create `domain/src/models/20th/Character20th.ts`
- [ ] Extend `Character` base class
- [ ] Implement 20th anniversary attributes (Strength, Dexterity, Stamina, etc. - 0-5 dots)
- [ ] Implement 20th anniversary abilities
- [ ] Implement health (Bruised, Hurt, Injured, Wounded, Mauled, Crippled, Incapacitated)
- [ ] Implement willpower
- [ ] Override abstract methods
- [ ] Write unit tests

**Acceptance Criteria:**
- ✅ `Character20th` class compiles and extends `Character`
- ✅ 20th anniversary mechanics implemented
- ✅ Tests pass
- ✅ Documentation complete

---

## Task 9: Port 20th Anniversary Character Classes

**Estimated Time:** 30-36 hours  
**Status:** ⏳ Not Started

### 9.1: Implement Vampire20th

- [ ] Create `domain/src/models/20th/Vampire20th.ts`
- [ ] Implement vampire properties (clan, generation, blood pool, disciplines)
- [ ] Implement humanity/path system
- [ ] Implement blood magic (if applicable)
- [ ] Write unit tests

### 9.2: Implement Werewolf20th

- [ ] Create `domain/src/models/20th/Werewolf20th.ts`
- [ ] Implement werewolf properties (breed, auspice, tribe, gifts, rage, gnosis)
- [ ] Write unit tests

### 9.3: Implement Mage20th

- [ ] Create `domain/src/models/20th/Mage20th.ts`
- [ ] Implement mage properties (tradition, essence, arete, spheres, paradox, quintessence)
- [ ] Write unit tests

### 9.4: Implement Changeling20th

- [ ] Create `domain/src/models/20th/Changeling20th.ts`
- [ ] Implement changeling properties (kith, court, seeming, arts, realms, glamour, banality)
- [ ] Write unit tests

### 9.5: Implement Demon20th (Demon: The Fallen)

- [ ] Create `domain/src/models/20th/Demon20th.ts`
- [ ] Implement demon properties (house, faction, torment, faith, lore)
- [ ] Write unit tests

### 9.6: Implement Wraith20th

- [ ] Create `domain/src/models/20th/Wraith20th.ts`
- [ ] Implement wraith properties (guild, passions, fetters, arcanoi, pathos, corpus)
- [ ] Write unit tests

### 9.7: Implement Human20th

- [ ] Create `domain/src/models/20th/Human20th.ts`
- [ ] Write unit tests

### 9.8: Implement Ghoul20th

- [ ] Create `domain/src/models/20th/Ghoul20th.ts`
- [ ] Write unit tests

**Acceptance Criteria:**
- ✅ All 20th anniversary character classes implemented
- ✅ All classes extend Character20th
- ✅ Tests pass with >80% coverage
- ✅ Pattern consistent across all 20th edition classes

---

## Task 10: Documentation & Examples

**Estimated Time:** 4-6 hours  
**Status:** ⏳ Not Started

### 10.1: Create Domain Package README

- [ ] Document package purpose
- [ ] Document architecture patterns
- [ ] Provide usage examples
- [ ] Document how to extend with new character types

### 10.2: Add Inline Documentation

- [ ] Ensure all classes have JSDoc comments
- [ ] Document all public methods
- [ ] Add examples for complex methods

### 10.3: Create Migration Guide

- [ ] Document differences from Django models
- [ ] Provide mapping guide (Django field → Domain property)
- [ ] Explain design decisions

**Acceptance Criteria:**
- ✅ README.md complete and clear
- ✅ All public APIs documented
- ✅ Examples provided

---

## Phase 1 Completion Checklist

Before moving to Phase 2, verify:

- [ ] All character data types defined (no placeholders)
- [ ] Domain package builds successfully
- [ ] All character classes implemented (5th + 20th editions)
- [ ] Repository interfaces defined
- [ ] All tests pass
- [ ] Test coverage >80%
- [ ] Documentation complete
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code reviewed
- [ ] Merged to main branch

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| TypeScript Errors | 0 | ⏳ |
| ESLint Errors | 0 | ⏳ |
| Test Coverage | >80% | ⏳ |
| Documentation | 100% of public APIs | ⏳ |
| Character Classes | 13/13 | 0/13 |
| Data Types Defined | 13/13 | 0/13 |
| Repository Interfaces | 4/4 | 0/4 |

---

## Notes & Decisions

### Design Decisions Made

1. **Inheritance Hierarchy:**
   - `Character` → `Character5th` → specific splats (Vampire5th, etc.)
   - `Character` → `Character20th` → specific splats (Vampire20th, etc.)
   - Justification: Matches Django model structure, clear separation between editions

2. **Serialization Pattern:**
   - Each class implements `serialize()` to convert to JSONB-compatible object
   - Each class constructor accepts data object for deserialization
   - Justification: Clean separation, testable, no framework coupling

3. **Validation Pattern:**
   - Each class implements `validate()` returning `ValidationResult`
   - Business rule validation in domain models
   - Zod schemas for data structure validation at boundaries
   - Justification: Domain models own business logic, Zod for I/O validation

### Open Questions

1. **Should we use class inheritance or composition for shared mechanics?**
   - Current: Using inheritance (Character5th extends Character)
   - Alternative: Composition with mixins or traits
   - Decision: Stay with inheritance for Phase 1, revisit if needed

2. **How to handle version migration of character data?**
   - Need strategy for when character data structure changes
   - Options: Version field, migration scripts, transform on load
   - Decision: Defer to Phase 5 (migration tooling)

---

## Resources

- Django Models Reference: `backend-legacy/haven/models/`
- Zod Schemas: `shared/src/validations/characters/`
- Type Definitions: `shared/src/types/character-data/`
- Database Schema: `database/src/schema/characters.ts`

---

**Next:** After completing Phase 1, proceed to [Phase 2: Repository Layer](./PHASE_2_CHECKLIST.md)
