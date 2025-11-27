# Discipline & Power System Design Plan (5th Edition)

**Scope:** V5 Vampire discipline/power mechanics  
**Modularity Level:** Game-specific (Vampire5th)

---

## Overview

Disciplines are vampire powers organized into categories (Celerity, Auspex, Dominate, etc.). Each discipline contains multiple powers at levels 1-5. Characters learn specific powers in slots.

**Key Principles:**

- Static data (disciplines, powers) live in registry, loaded from MDX/JSON
- **Domain entities work with fully-resolved definitions** (repository handles resolution)
- **Database stores references** (keys or custom data objects)
- Powers are standalone entities, not nested in disciplines
- Character has 5 standard power slots + optional ingrained slots
- **All types namespaced as 5th edition** to avoid conflicts with V20/CoD

---

## Static Definitions (Registry)

### Discipline Definition

Minimal metadata about the discipline itself:

```typescript
interface DisciplineDefinition5th {
  name: string; // "Celerity", "Auspex", "Dominate"
  description: string; // Flavor text about the discipline
  characteristics: string; // How it manifests

  // Optional metadata (flavor, no mechanical effect)
  type?: string; // "Physical", "Mental", "Social"
  masqueradeThreat?: string; // Masquerade threat level
  bloodResonance?: string; // Associated resonance (Choleric, Melancholic, etc.)
}
```

**Location:** Loaded from `StaticDataRegistry`  
**Storage:** MDX/JSON files (location TBD)  
**Query:** `registry.get<DisciplineDefinition5th>('disciplines5th:celerity')`

---

### Power Definition

Powers are standalone, not nested in disciplines:

```typescript
interface PowerDefinition5th {
  name: string; // "Fleetness", "Rapid Reflexes", "Cat's Grace"
  discipline: string; // Which discipline ("Celerity")
  level: 1 | 2 | 3 | 4 | 5; // Power level

  // Description
  summary: string; // One-sentence summary
  description: string; // Full description
  system: string; // Mechanical rules (text)

  // Mechanics
  cost: number; // Number of rouse checks (0-5)
  duration: Duration5th; // How long it lasts
  amalgam?: Amalgam; // Prerequisite discipline requirement
  dicePools?: unknown[]; // TBD - defer to dice system design

  // Effects applied when activated
  effects?: PowerEffect[];
}

// V5-specific duration
interface Duration5th {
  type: "instant" | "turn" | "scene" | "night" | "permanent" | "special";
  value?: number; // For type='turn', how many turns
  text: string; // Human-readable
}

// Amalgam: requires another discipline at minimum level
interface Amalgam {
  discipline: string; // Required discipline name
  level: 1 | 2 | 3 | 4 | 5; // Minimum level needed
}

// Effect applied by power (uses standard ActiveEffect structure)
interface PowerEffect {
  target: "self" | "other"; // Who receives effect
  effect: {
    source: string; // Auto-set to power name
    target: string; // Property affected ("strength", "dexterity", etc.)
    value: number; // Effect magnitude
    type: "ADD" | "MULTIPLY" | "OVERRIDE";
    duration?: Duration5th; // How long (if different from power duration)
  };
}
```

**Location:** Loaded from `StaticDataRegistry`  
**Storage:** MDX/JSON files organized by discipline  
**Query:** `registry.get<PowerDefinition5th>('powers5th:celerity:fleetness')`

---

## Character Instance Data

### Character Discipline

What a character actually has:

```typescript
interface CharacterDiscipline5th {
  id: string; // Unique instance ID (Snowflake)

  // Resolved discipline definition (from static or custom)
  discipline: DisciplineDefinition5th;

  inClan: boolean; // Affects XP cost for learning

  // Power Slots - 5 standard slots
  // Slot N can hold any power of level <= N
  // Rating = highest filled slot number
  powerSlots: {
    slot1: PowerSlot5th | null; // Can hold level 1 power
    slot2: PowerSlot5th | null; // Can hold level 1-2 power
    slot3: PowerSlot5th | null; // Can hold level 1-3 power
    slot4: PowerSlot5th | null; // Can hold level 1-4 power
    slot5: PowerSlot5th | null; // Can hold level 1-5 power
  };

  // Ingrained Power Slots (from Ingrained Discipline Flaw)
  // Unlocked when character has Ingrained Discipline Flaw effect
  // Can hold 3 "ranks" worth of powers:
  //   - 3x level-1 powers (3 ranks)
  //   - 1x level-3 power (3 ranks)
  //   - 1x level-2 + 1x level-1 (3 ranks)
  // Does NOT increase discipline rating
  ingrainedSlots: PowerSlot5th[]; // Dynamic array
}

// One learned power in a slot
interface PowerSlot5th {
  slotId: string; // Unique slot ID (Snowflake)

  // Resolved power definition (from static or custom)
  power: PowerDefinition5th; };

  // Overrides for homebrew tweaks
  overrides?: Partial<PowerDefinition5th>;

  // Metadata
  acquiredDate?: Date; // When learned
  notes?: string; // Player notes
}
```

---

## Discipline Rating Calculation

```typescript
// Rating = highest filled standard slot
// Examples:
//   slot1 filled → rating 1
//   slot1, slot2, slot4 filled → rating 4 (slot3 empty doesn't matter)
//   slot1, slot2, slot3, slot4, slot5 filled → rating 5
//   ingrained slots → DO NOT affect rating

function getDisciplineRating(discipline: CharacterDiscipline5th): number {
  if (discipline.powerSlots.slot5) return 5;
  if (discipline.powerSlots.slot4) return 4;
  if (discipline.powerSlots.slot3) return 3;
  if (discipline.powerSlots.slot2) return 2;
  if (discipline.powerSlots.slot1) return 1;
  return 0;
}
```

---

## Ingrained Discipline Flaw Mechanics

**Rule:** When character has "Ingrained Discipline Flaw" effect for a discipline, 3 ranks' worth of new powers become available.

**Rank Cost:**

- Level 1 power = 1 rank
- Level 2 power = 2 ranks
- Level 3 power = 3 ranks
- Level 4 power = 4 ranks (exceeds limit, not allowed)
- Level 5 power = 5 ranks (exceeds limit, not allowed)

**Valid Combinations:**

- 3x level-1 powers (1+1+1 = 3 ranks) ✓
- 1x level-1 + 1x level-2 (1+2 = 3 ranks) ✓
- 1x level-3 power (3 ranks) ✓

**Tracking:**

```typescript
function getIngrainedRanksUsed(slots: PowerSlot5th[]): number {
  return slots.reduce((total, slot) => {
    const power = resolvePowerDefinition(slot.powerRef);
    return total + power.level;
  }, 0);
}

function canAddIngrainedPower(
  discipline: CharacterDiscipline5th,
  powerLevel: number
): boolean {
  const currentRanks = getIngrainedRanksUsed(discipline.ingrainedSlots);
  return currentRanks + powerLevel <= 3;
}
```

---

## Vampire5th Methods (Discipline Management)

```typescript
export class Vampire5th extends Character5th {
  public disciplines: Map<string, CharacterDiscipline5th>;

  /**
   * Add a discipline to character
   * @param discipline - Resolved discipline definition (static or custom)
   */
  addDiscipline(discipline: DisciplineDefinition5th, inClan: boolean): void;

  /**
   * Remove a discipline (clears all power slots)
   */
  removeDiscipline(disciplineId: string): void;

  /**
   * Get discipline instance
   */
  getDiscipline(disciplineId: string): CharacterDiscipline5th | undefined;

  /**
   * Get discipline definition (resolves reference)
   */
  getDisciplineDefinition(
    disciplineId: string
  ): DisciplineDefinition5th | undefined;

  /**
   * Get discipline rating (highest filled standard slot)
   */
  getDisciplineRating(disciplineId: string): number;

  /**
   * Get effective rating (with blood potency bonus via effects)
   */
  getEffectiveDisciplineRating(disciplineId: string): number;

  /**
   * Set whether discipline is in-clan
   */
  setDisciplineInClan(disciplineId: string, inClan: boolean): void;
}
```

---

## Vampire5th Methods (Power Management)

```typescript
/**
 * Learn a power in a standard slot
 * @param power - Resolved power definition (static or custom)
 * Validates: slot empty, power level <= slot number, amalgam met
 */
learnPower(
  disciplineId: string,
  slotNumber: 1 | 2 | 3 | 4 | 5,
  power: PowerDefinition5th
): void;

/**
 * Forget a power (clear the slot)
 */
forgetPower(disciplineId: string, slotId: string): void;

/**
 * Learn ingrained power (requires Ingrained Discipline Flaw effect)
 * @param power - Resolved power definition (static or custom)
 * Validates: total ranks <= 3
 */
learnIngrainedPower(
  disciplineId: string,
  power: PowerDefinition5th
): void;

/**
 * Forget ingrained power
 */
forgetIngrainedPower(disciplineId: string, slotId: string): void;

/**
 * Get all learned powers across all disciplines
 */
getAllLearnedPowers(): Array<{
  disciplineId: string;
  disciplineName: string;
  slotNumber: number | 'ingrained';
  slot: PowerSlot5th;
  power: PowerDefinition5th;
}>;

/**
 * Get available powers to learn for a discipline
 * Filters by: level (based on available slots), amalgam requirements
 */
getAvailablePowers(disciplineId: string): Array<{
  power: PowerDefinition5th;
  canLearnInSlots: number[];      // Which standard slots can hold this
  canLearnIngrained: boolean;     // Can learn in ingrained slot
  missingAmalgam?: Amalgam;       // If amalgam not met
}>;

/**
 * Check if can learn a specific power
 */
canLearnPower(
  disciplineId: string,
  powerName: string,
  slotType: 'standard' | 'ingrained'
): {
  canLearn: boolean;
  reason?: string;
  availableSlots?: number[];
};

/**
 * Get power definition (resolves reference)
 */
getPowerDefinition(powerName: string): PowerDefinition5th | undefined;

/**
 * Check if has learned a specific power
 */
hasPower(powerName: string): boolean;
```

---

## Vampire5th Methods (Power Activation)

```typescript
/**
 * Check if can activate a power
 * Validates: power is learned, hunger < 5 (for rouse checks)
 */
canActivatePower(powerName: string): {
  canActivate: boolean;
  reason?: string;
  rouseChecksRequired: number;
};

/**
 * Activate a power
 * Caller must handle rouse checks BEFORE calling
 * Applies power's effects to self or target
 *
 * @returns Effects applied and any dice pools to roll
 */
activatePower(
  powerName: string,
  target?: Character
): {
  effectsApplied: ActiveEffect[];
  dicePools?: unknown[];  // TBD - dice system design
};
```

---

## Validation Rules

### Learning Powers

1. **Standard Slots:**
   - Slot must be empty
   - Power level must be <= slot number
   - Amalgam requirement must be met
   - Must not already have this power in another slot

2. **Ingrained Slots:**
   - Must have "Ingrained Discipline Flaw" effect active for this discipline
   - Total ingrained ranks must be <= 3
   - Power level must be <= 3 (cannot learn level 4-5 as ingrained)
   - Amalgam requirement must be met
   - Must not already have this power in another slot

### Amalgam Requirements

```typescript
function hasAmalgamRequirement(
  character: Vampire5th,
  amalgam: Amalgam
): boolean {
  const requiredDiscipline = character.disciplines
    .values()
    .find((d) => getDisciplineName(d) === amalgam.discipline);

  if (!requiredDiscipline) return false;

  const rating = character.getDisciplineRating(requiredDiscipline.id);
  return rating >= amalgam.level;
}
```

---

## Serialization

### To JSONB

**Note:** Repository stores references (keys or custom data). Domain works with resolved definitions.

```typescript
interface Vampire5thData {
  // ... other vampire fields

  disciplines: Array<{
    id: string;
    disciplineRef: string; // Repository stores reference (key or custom data)
    inClan: boolean;
    powerSlots: {
      slot1: PowerSlotData5th | null;
      slot2: PowerSlotData5th | null;
      slot3: PowerSlotData5th | null;
      slot4: PowerSlotData5th | null;
      slot5: PowerSlotData5th | null;
    };
    ingrainedSlots: PowerSlotData5th[];
  }>;
}

interface PowerSlotData5th {
  slotId: string;
  powerRef: string; // Repository stores reference (key or custom data)
  overrides?: Partial<PowerDefinition5th>;
  acquiredDate?: string; // ISO date
  notes?: string;
}
```

---

## Open Questions

1. **Static Data Storage:**
   - Where do MDX/JSON files live? (e.g., `packages/core/data/disciplines/`, `apps/api/public/data/`)
   - File structure: one file per discipline or all in one?
   - How to version static data?

2. **Registry Query Format:**
   - `registry.get('disciplines:celerity')` vs `registry.getDiscipline('celerity')`
   - Should registry have typed methods or generic get?

3. **Custom Disciplines/Powers:**
   - Should custom data be validated against schema on add?
   - How to migrate custom data if schema changes?

4. **Multiple Powers Per Slot (Future):**
   - User mentioned "new mechanics can have more than one power in that slot"
   - Is this different from ingrained slots?
   - Should PowerSlot5th be `PowerSlot5th | PowerSlot5th[]`?

5. **Power Prerequisites Beyond Amalgam:**
   - Are there blood potency requirements? (e.g., "Must have BP 3+")
   - Generation requirements?
   - Should we add `prerequisites?: Prerequisite[]` to PowerDefinition5th?

---

## Implementation Order

1. Create type definitions (interfaces above)
2. Implement CharacterDiscipline methods on Vampire5th
3. Implement power slot management
4. Implement ingrained slot mechanics
5. Add validation rules
6. Add serialization
7. Write unit tests
8. Integrate with StaticDataRegistry (once data files exist)
