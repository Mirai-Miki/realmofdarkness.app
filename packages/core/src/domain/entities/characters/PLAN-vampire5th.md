# Vampire5th Entity Design Plan

**Scope:** V5 Vampire character entity  
**Modularity Level:** Game-specific (Vampire5th)

---

## Overview

`Vampire5th` extends `Character5th` with vampire-specific mechanics: clan, generation, hunger, blood potency, humanity, disciplines, and associated powers.

**Inheritance Chain:**

```
Character (base)
  → Character5th (5th edition mechanics)
    → Vampire5th (vampire-specific)
```

---

## Type Definitions

### Clan5th

```typescript
interface ClanDefinition5th {
  /** Unique identifier (typed key from static registry or 'custom') */
  key: ClanKey5th | "custom";

  /** Display name */
  name: string;

  /** In-clan disciplines (keys) */
  inClanDisciplines: DisciplineKey5th[];

  /** Clan bane */
  bane: Bane5th;

  /** Clan compulsion */
  compulsion: string;
}

// Typed clan keys (prevents typos)
type ClanKey5th =
  | "brujah"
  | "gangrel"
  | "malkavian"
  | "nosferatu"
  | "toreador"
  | "tremere"
  | "ventrue"
  | "banuHaqim"
  | "hecata"
  | "lasombra"
  | "ministryOfSet"
  | "ravnos"
  | "salubri"
  | "tzimisce"
  | "caitiff"
  | "thinblood";

interface Bane5th {
  /** Unique identifier for this bane */
  key: string;

  /** Display name */
  name: string;

  /** Description of the bane */
  description: string;

  /** Mechanical effects applied by this bane */
  effect?: ActiveEffect[];
}
```

### PredatorType5th

```typescript
interface PredatorType5th {
  /** Unique identifier (typed key from static registry or 'custom') */
  key: PredatorTypeKey5th | 'custom';

  /** Display name */
  name: string;
}

type PredatorTypeKey5th =
  | 'alleycat'
  | 'bagger'
  | 'bloodLeech'
  | 'cleaver'
  | 'consensualist'
  | 'farmer'
  | 'osiris'
  | 'sandman'
  | 'scene-queen'
  | 'siren'
  | 'extortionist'
  | 'graverobber'
  | 'grim-reaper'
  | 'montero'
  | 'pursuer'
  | 'trapdoor'
  | 'tithe-collector;
```

### BloodPotency5th

```typescript
interface BloodPotency5th {
  /** Blood potency rating (0-10) */
  value: number;

  /** Blood surge bonus dice */
  surgeDice: number;

  /** Superficial health healed per rouse check */
  mendAmount: number;

  /** Discipline power bonus dice */
  powerBonus: number;

  /** Can reroll one die on rouse checks at this BP */
  rouseReroll: boolean;

  /** Bane severity */
  severity: number;

  /** Feeding penalty details */
  feedingPenalty: {
    /** Animal blood is useless at this BP */
    animalBloodUseless: boolean;

    /** Penalty to slake hunger when feeding */
    slakePenalty: number;

    /** Must kill to reduce hunger below this threshold (null if no requirement) */
    mustKillThreshold: number | null;
  };
}
```

### BloodResonance5th

```typescript
interface BloodResonance5th {
  /** Unique identifier (typed key or 'custom') */
  key: BloodResonanceKey5th | "custom";

  /** Display name */
  name: string;

  /** Disciplines that benefit from this resonance */
  disciplineBonus: DisciplineKey5th[];
}

type BloodResonanceKey5th =
  | "choleric" // Anger (Celerity, Potence)
  | "melancholic" // Sadness (Fortitude, Obfuscate)
  | "phlegmatic" // Calm (Auspex, Dominate)
  | "sanguine"; // Pleasure (Blood Sorcery, Presence)

type DisciplineKey5th =
  | "animalism"
  | "auspex"
  | "bloodSorcery"
  | "celerity"
  | "dominate"
  | "fortitude"
  | "obfuscate"
  | "potence"
  | "presence"
  | "protean"
  | "thinbloodAlchemy"
  | "oblivion";
```

---

## Entity Fields

```typescript
export class Vampire5th extends Character5th {
  // ==========================================
  // CLAN & LINEAGE
  // ==========================================

  /** Vampire clan (fully resolved from repository) */
  public clan: ClanDefinition5th;

  /** Name of vampire's sire */
  public sire?: string;

  /** Generation (1-18) */
  public generation: number;

  // ==========================================
  // PREDATOR TYPE
  // ==========================================

  /** Predator type (fully resolved from repository) */
  public predatorType: PredatorTypeDefinition5th;

  // ==========================================
  // HUMANITY & BEAST
  // ==========================================

  /** Humanity tracker (immutable VO) */
  public humanity: HumanityTracker5th;

  /** Current hunger level (0-5) */
  public hunger: number;

  // ==========================================
  // BLOOD POTENCY
  // ==========================================

  /** Blood potency (immutable VO with calculated values) */
  public bloodPotency: BloodPotency5th;

  // ==========================================
  // DISCIPLINES
  // ==========================================

  /** Disciplines (map: id → CharacterDiscipline5th) */
  public disciplines: Map<string, CharacterDiscipline5th>; // ==========================================
  // FLAVOR & METADATA
  // ==========================================

  /** Current blood resonance */
  public resonance?: BloodResonance5th;

  /** Date of death/embrace */
  public dateOfDeath?: string;

  /** Apparent age */
  public apparentAge?: string;
}
```

---

## Constructor

```typescript
constructor(data: {
  // Base Character fields
  name: string;
  userId: Snowflake;
  id: Snowflake;
  guildId?: Snowflake | null;
  isSheet?: boolean;
  experience?: Experience;
  status?: SheetStatus;
  color?: string;
  thumbnail?: string | null;
  createdAt?: Date;
  lastUpdated?: Date;

  // Character5th fields
  health?: DamageTracker5th;
  willpower?: DamageTracker5th;
  attributes?: Partial<Character5th['attributes']>;
  skills?: Partial<Character5th['skills']>;

  // Vampire5th fields
  clan?: ClanDefinition5th;
  sire?: string;
  generation?: number | null;
  predatorType?: PredatorTypeDefinition5th;
  humanity?: HumanityTracker5th;
  hunger?: number;
  bloodPotency?: BloodPotency5th;
  resonance?: BloodResonance5th;
  disciplines?: Map<string, CharacterDiscipline5th>;
  dateOfDeath?: string;
  apparentAge?: string;
}) {
  super({
    // Pass Character5th fields to super
    // ...
  });

  // Initialize vampire-specific fields
  // Note: clan and predatorType should be provided (resolved by repository)
  // Defaults shown here are fallbacks only
  this.clan = data.clan ?? { key: 'caitiff', name: 'Caitiff' /* ... */ };
  this.sire = data.sire;
  this.generation = data.generation ?? 13;
  this.predatorType = data.predatorType ?? { key: 'alleycat', name: 'Alleycat' /* ... */ };
  this.humanity = data.humanity ?? HumanityTracker5th.create(7);
  this.hunger = data.hunger ?? 1;
  this.bloodPotency = data.bloodPotency ?? BloodPotency5th.create(0);
  this.resonance = data.resonance;
  this.disciplines = data.disciplines ?? new Map();
  this.dateOfDeath = data.dateOfDeath;
  this.apparentAge = data.apparentAge;
}
```

---

## Methods Overview

### Humanity System

(See `PLAN-humanity-tracker.md` for details)

```typescript
addStain(amount: number): void;
clearStains(): void;
remorseRoll(successes: number): { success: boolean; humanityLost: number; newHumanity: number };
setHumanity(value: number): void;
getHumanity(): number;
getStains(): number;
hasStainOverflow(): boolean;
```

### Hunger System

```typescript
/**
 * Increase hunger (from failed rouse checks, time)
 * Caps at 5
 */
increaseHunger(amount: number): void;

/**
 * Decrease hunger (from feeding)
 * Accounts for blood potency feeding penalties
 */
slakeHunger(amount: number, resonance?: string): void;

/**
 * Check if can rouse blood (hunger < 5)
 */
canRouseBlood(): boolean;

/**
 * Check if at maximum hunger (5)
 */
isHungryBeast(): boolean;

/**
 * Get current hunger
 */
getHunger(): number;
```

### Blood Potency System

```typescript
/**
 * Get blood surge bonus dice
 * BP 0-2: +2, BP 3-4: +3, BP 5-6: +4, BP 7-9: +5, BP 10: +6
 */
getBloodSurge(): number;

/**
 * Get superficial health healed per blood spent
 * BP 0: 1, BP 1-2: 2, BP 3-6: 3, BP 7-9: 4, BP 10: 5
 */
getMendAmount(): number;

/**
 * Get discipline power bonus dice
 * BP 0-1: 0, BP 2-4: +1, BP 5: +2, BP 6-7: +3, BP 8-9: +4, BP 10: +5
 */
getPowerBonus(): number;

/**
 * Get bane severity
 * BP 0: 0, BP 1-2: 2, BP 3-4: 3, BP 5-6: 4, BP 7-10: 5
 */
getBaneStrength(): number;

/**
 * Get feeding restrictions
 */
getFeedingPenalty(): {
  animalBloodUseless: boolean;
  slakePenalty: number;
  mustKillThreshold: number | null;
};
```

### Discipline Management

(See `PLAN-disciplines.md` for details)

```typescript
addDiscipline(disciplineName: string | { custom: DisciplineDefinition }, inClan: boolean): void;
removeDiscipline(disciplineId: string): void;
getDiscipline(disciplineId: string): CharacterDiscipline | undefined;
getDisciplineDefinition(disciplineId: string): DisciplineDefinition | undefined;
getDisciplineRating(disciplineId: string): number;
getEffectiveDisciplineRating(disciplineId: string): number;
setDisciplineInClan(disciplineId: string, inClan: boolean): void;
```

### Power Management

(See `PLAN-disciplines.md` for details)

```typescript
learnPower(disciplineId: string, slotNumber: 1|2|3|4|5, powerName: string | { custom: PowerDefinition }): void;
forgetPower(disciplineId: string, slotId: string): void;
learnIngrainedPower(disciplineId: string, powerName: string | { custom: PowerDefinition }): void;
forgetIngrainedPower(disciplineId: string, slotId: string): void;
getAllLearnedPowers(): Array<{...}>;
getAvailablePowers(disciplineId: string): Array<{...}>;
canLearnPower(disciplineId: string, powerName: string, slotType: 'standard'|'ingrained'): {...};
getPowerDefinition(powerName: string): PowerDefinition | undefined;
hasPower(powerName: string): boolean;
canActivatePower(powerName: string): {...};
activatePower(powerName: string, target?: Character): {...};
```

### Utility Methods

```typescript
/**
 * Mend superficial health damage
 * Heals amount = getMendAmount()
 * Caller must handle rouse check before calling
 */
mendDamage(): void;

/**
 * Check if can use blood surge
 */
canUseBloodSurge(): boolean;
```

### Overrides

```typescript
/**
 * Get character version
 * @returns "vampire5th"
 */
override getVersion(): string;

/**
 * Validate character data
 * Checks vampire-specific constraints
 */
override validate(): { isValid: boolean; errors: string[] };

/**
 * Serialize to JSON for database
 * Note: Converts resolved definitions back to references
 */
toJSON(): Vampire5thData;

/**
 * Factory method to reconstruct from database
 */
static fromData(
  data: Vampire5thData,
  resolvedClan: ClanDefinition5th,
  resolvedPredatorType: PredatorTypeDefinition5th,
  resolvedResonance: BloodResonance5th | undefined,
  id: Snowflake,
  userId: Snowflake,
  guildId?: Snowflake | null,
  isSheet?: boolean,
  createdAt?: Date,
  lastUpdated?: Date
): Vampire5th;
```

---

## Blood Potency Tables

### Blood Surge Table

| Blood Potency | Bonus Dice |
| ------------- | ---------- |
| 0-2           | +2         |
| 3-4           | +3         |
| 5-6           | +4         |
| 7-9           | +5         |
| 10            | +6         |

### Mend Amount Table

| Blood Potency | Superficial Healed |
| ------------- | ------------------ |
| 0             | 1                  |
| 1-2           | 2                  |
| 3-6           | 3                  |
| 7-9           | 4                  |
| 10            | 5                  |

### Power Bonus Table

| Blood Potency | Discipline Bonus |
| ------------- | ---------------- |
| 0-1           | 0                |
| 2-4           | +1               |
| 5             | +2               |
| 6-7           | +3               |
| 8-9           | +4               |
| 10            | +5               |

### Bane Strength Table

| Blood Potency | Bane Severity |
| ------------- | ------------- |
| 0             | 0             |
| 1-2           | 2             |
| 3-4           | 3             |
| 5-6           | 4             |
| 7-10          | 5             |

### Feeding Penalty Table

| BP  | Animal Blood | Slake Penalty | Must Kill Threshold |
| --- | ------------ | ------------- | ------------------- |
| 0   | Usable       | 0             | N/A                 |
| 1   | Usable       | 0             | N/A                 |
| 2   | Usable       | -1            | N/A                 |
| 3   | Usable       | -1            | N/A                 |
| 4   | Usable       | -1            | N/A                 |
| 5   | Useless      | -1            | 2                   |
| 6   | Useless      | -1            | 2                   |
| 7   | Useless      | -2            | 2                   |
| 8   | Useless      | -2            | 3                   |
| 9   | Useless      | -3            | 3                   |
| 10  | Useless      | -3            | 3                   |

---

## Validation Rules

```typescript
validate(): { isValid: boolean; errors: string[] } {
  const errors = [...super.validate().errors];

  // Hunger validation
  if (this.hunger < 0 || this.hunger > 5) {
    errors.push('Hunger must be between 0 and 5');
  }

  // Blood potency validation
  if (this.bloodPotency.value < 0 || this.bloodPotency.value > 10) {
    errors.push('Blood Potency must be between 0 and 10');
  }

  // Generation validation (null is valid for thin-bloods)
  if (this.generation !== null && (this.generation < 1 || this.generation > 18)) {
    errors.push('Generation must be between 1 and 18, or null');
  }

  // Humanity is self-validating via HumanityTracker VO

  // Discipline validation
  for (const [id, discipline] of this.disciplines) {
    const rating = this.getDisciplineRating(id);
    if (rating < 0 || rating > 5) {
      errors.push(`Discipline ${id} has invalid rating ${rating}`);
    }

    // Validate power levels match slot constraints
    // (detailed validation in discipline methods)
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

## Serialization

### JSONB Structure

**Note:** Database stores references (strings or custom data objects). Repository resolves these to full definitions before passing to domain entity.

```typescript
interface Vampire5thData {
  // Character5th fields
  health: { total: number; superficial: number; aggravated: number };
  willpower: { total: number; superficial: number; aggravated: number };
  attributes: {
    strength: number;
    dexterity: number;
    stamina: number;
    charisma: number;
    manipulation: number;
    composure: number;
    intelligence: number;
    wits: number;
    resolve: number;
  };
  skills: {
    athletics: { rating: number; specialties: string[] };
    // ... all 27 skills
  };

  // Vampire5th fields
  clanRef: string; // Repository stores reference, domain uses resolved
  sire?: string;
  generation: number | null;
  predatorTypeRef: string; // Repository stores reference, domain uses resolved
  humanity: { humanity: number; stains: number };
  hunger: number;
  bloodPotency: number; // Just the value, VO recalculates derived values
  resonanceRef?: string; // Key or null
  disciplines: Array<{
    id: string;
    disciplineRef: string | { custom: DisciplineDefinition5th };
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
  dateOfDeath?: string;
  apparentAge?: string;
}

interface PowerSlotData5th {
  slotId: string;
  powerRef: string | { custom: PowerDefinition5th };
  overrides?: Partial<PowerDefinition5th>;
  acquiredDate?: string;
  notes?: string;
}
```

---

### Factory Method

**Note:** This is typically called by repository after resolving all references.

```typescript
static fromData(
  data: Vampire5thData,
  resolvedClan: ClanDefinition5th,
  resolvedPredatorType: PredatorTypeDefinition5th,
  resolvedResonance: BloodResonance5th | undefined,
  id: Snowflake,
  userId: Snowflake,
  guildId?: Snowflake | null,
  isSheet?: boolean,
  createdAt?: Date,
  lastUpdated?: Date
): Vampire5th {
  // Reconstruct disciplines map
  const disciplines = new Map<string, CharacterDiscipline5th>();
  for (const discData of data.disciplines) {
    disciplines.set(discData.id, {
      id: discData.id,
      disciplineRef: discData.disciplineRef,
      inClan: discData.inClan,
      powerSlots: {
        slot1: discData.powerSlots.slot1,
        slot2: discData.powerSlots.slot2,
        slot3: discData.powerSlots.slot3,
        slot4: discData.powerSlots.slot4,
        slot5: discData.powerSlots.slot5,
      },
      ingrainedSlots: discData.ingrainedSlots,
    });
  }

  return new Vampire5th({
    // Base fields
    id,
    userId,
    guildId,
    name: '', // From character table, not JSONB
    isSheet,
    createdAt,
    lastUpdated,

    // Character5th fields
    health: DamageTracker5th.fromJSON(data.health),
    willpower: DamageTracker5th.fromJSON(data.willpower),
    attributes: data.attributes,
    skills: {
      athletics: Skill.fromJSON(data.skills.athletics),
      // ... all 27 skills
    },

    // Vampire5th fields
    clan: resolvedClan,
    sire: data.sire,
    generation: data.generation,
    predatorType: resolvedPredatorType,
    humanity: HumanityTracker5th.fromJSON(data.humanity),
    hunger: data.hunger,
    bloodPotency: BloodPotency5th.create(data.bloodPotency),
    resonance: resolvedResonance,
    disciplines,
    dateOfDeath: data.dateOfDeath,
    apparentAge: data.apparentAge,
  });
}
```

---

## Open Questions

1. **Clan/Predator Type Defaults:**
   - Should constructor require clan and predatorType?
   - Or allow defaults (Caitiff/Alleycat)?

2. **Thin-Blood Mechanics:**
   - Do thin-bloods have different blood potency ranges?
   - Different hunger mechanics?
   - Should there be a `Thinblood` subclass?

3. **Diablerie:**
   - Is there a method to handle lowering generation?
   - Should it affect blood potency automatically?

4. **Clan Compulsions:**
   - Should clan provide a `getCompulsion()` method?
   - Or is this handled by static clan definition only?

5. **Blood Potency Progression:**
   - Should there be `increaseBloodPotency()` / `decreaseBloodPotency()` methods?
   - Or just `setBloodPotency()`?

---

## Implementation Order

1. Implement HumanityTracker5th VO
2. Create Vampire5th entity class
3. Implement constructor with defaults
4. Implement humanity system methods
5. Implement hunger system methods
6. Implement blood potency calculation methods
7. Implement discipline management (from PLAN-disciplines.md)
8. Implement power management
9. Implement validation
10. Implement serialization
11. Write comprehensive unit tests
12. Integration with StaticDataRegistry
