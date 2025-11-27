# Character Entity Design Principles

**Scope:** Guidelines for all character-related domain entities and types  
**Applies to:** Character classes, disciplines, powers, clans, merits, flaws, etc.

---

## Core Principle: Domain vs Presentation Separation

**Domain entities should contain ONLY what's needed for game mechanics.**

Descriptions, flavor text, lore, and other presentation concerns do NOT belong in domain models. They should be fetched separately when needed for display.

---

## What Belongs in Domain Entities

### ✅ Include (Mechanics & Computation)

- **Identifiers**: `key`, `id`, `name` (for lookups and display in lists)
- **Numeric values**: ratings, costs, levels, durations (as numbers/enums)
- **Mechanical effects**: stat modifiers, dice pools, conditions
- **Validation data**: prerequisites, constraints, limits
- **Relationships**: parent/child references, amalgams, requirements

**Examples:**

```typescript
// ✅ GOOD - Mechanical data only
interface PowerDefinition5th {
  key: string; // Identifier
  name: string; // Display name (minimal)
  discipline: string; // Relationship
  level: 1 | 2 | 3 | 4 | 5; // Mechanical value
  cost: number; // Mechanical value
  duration: Duration5th; // Mechanical value (enum + number)
  amalgam?: Amalgam; // Prerequisite (mechanical)
  effects?: PowerEffect[]; // Stat modifiers (mechanical)
}

interface ClanDefinition5th {
  key: string;
  name: string;
  inClanDisciplines: string[]; // Mechanical advantage
  clanBane: BaneEffect; // Mechanical penalty
  compulsions: string[]; // Mechanical triggers
}
```

---

## What Does NOT Belong in Domain Entities

### ❌ Exclude (Presentation & Flavor)

- **Long descriptions**: Flavor text, lore, backstory
- **System text**: Multi-paragraph rules explanations
- **Formatted text**: HTML, markdown, rich text
- **Examples**: Usage examples, storytelling suggestions
- **Visual metadata**: Icons, images, colors (unless mechanically relevant)

**Examples:**

```typescript
// ❌ BAD - Presentation data mixed with domain
interface PowerDefinition5th {
  key: string;
  name: string;
  description: string; // ❌ Remove - presentation concern
  system: string; // ❌ Remove - presentation concern
  flavorText: string; // ❌ Remove - presentation concern
  exampleUsage: string; // ❌ Remove - presentation concern
  iconUrl: string; // ❌ Remove - presentation concern
  level: number; // ✅ Keep - mechanical
  cost: number; // ✅ Keep - mechanical
}
```

---

## How to Handle Presentation Data

### Separate Service/Repository Pattern

Create a **parallel structure** for presentation data that's fetched only when needed:

```typescript
// Domain layer (packages/core/src/domain/)
interface PowerDefinition5th {
  key: string;
  name: string;
  level: number;
  cost: number;
  // ... only mechanical fields
}

// Presentation layer (packages/core/src/presentation/ or apps/api/src/presentation/)
interface PowerPresentation {
  key: string; // Same key to match domain entity
  summary: string; // One-sentence description
  description: string; // Full description
  system: string; // Rules text
  flavorText?: string; // Optional lore
  examples?: string[]; // Optional usage examples
}
```

### Usage Pattern

```typescript
// Domain - always loaded, always available
const power = vampire.getPowerDefinition("celerity:fleetness");
// Returns: { key, name, level: 1, cost: 1, duration, effects }

// Can validate, compute costs, apply effects immediately
vampire.activatePower("celerity:fleetness");

// Presentation - fetch only when user requests details
const presentation =
  await presentationService.getPowerPresentation("celerity:fleetness");
// Returns: { summary, description, system, flavorText }

// Display in tooltip/modal/popover
showPowerDetails(power, presentation);
```

---

## Benefits of This Approach

### Performance

- **Smaller entity size**: Domain entities stay lean (KB vs MB)
- **Faster serialization**: Less data to marshal/unmarshal
- **Reduced memory**: Bot/API only loads what's needed for mechanics
- **Lazy loading**: Presentation data fetched on-demand

### Maintainability

- **Clear separation**: Domain = "what it does", Presentation = "what it says"
- **Independent updates**: Change descriptions without touching domain logic
- **Easier testing**: Test mechanics without worrying about text
- **Type safety**: Domain types focused on computation, not strings

### Scalability

- **Cacheable**: Presentation data can be cached separately (CDN, Redis)
- **Localizable**: Presentation layer can support multiple languages
- **Versioning**: Different presentation for same mechanical definition

---

## Special Cases

### Name Field

The `name` field is a **gray area** - it's needed for mechanics (lookups, display in lists) but it's also presentation.

**Rule:** Include `name` in domain entities as a **short identifier string**.

```typescript
// ✅ GOOD - Name is minimal identifier
interface PowerDefinition5th {
  key: string; // 'celerity:fleetness'
  name: string; // 'Fleetness' (short, for display in lists)
}

// Presentation layer provides detailed title if needed
interface PowerPresentation {
  key: string;
  displayName: string; // 'Fleetness (Celerity ••)'
  subtitle?: string; // 'Move with supernatural speed'
}
```

### Duration Text

Duration has both mechanical and presentation aspects:

```typescript
// ✅ GOOD - Domain has structured duration
interface Duration5th {
  type: "instant" | "turn" | "scene" | "night" | "permanent" | "special";
  value?: number; // For type='turn', how many turns
}

// Presentation layer provides human-readable text
interface PowerPresentation {
  durationText: string; // "One turn" or "Until next sunset"
}
```

### Custom Homebrewed Content

Custom content created by users **may include presentation data** since it's rare and user-specific:

```typescript
// Custom powers can include descriptions (user-created)
const customPower: PowerDefinition5th = {
  key: "custom:blood-vision",
  name: "Blood Vision",
  description: "...", // ✅ OK for custom content
  // ... mechanical fields
};

// Static registry powers should NOT include descriptions
const staticPower: PowerDefinition5th = {
  key: "celerity:fleetness",
  name: "Fleetness",
  // description: '...', // ❌ Remove - fetch from presentation service
  // ... mechanical fields
};
```

---

## Implementation Checklist

When designing a new character-related type:

- [ ] Identify what's **mechanical** vs **presentational**
- [ ] Keep only mechanical fields in domain entity
- [ ] Create separate presentation interface if needed
- [ ] Document where presentation data lives (MDX files, database, etc.)
- [ ] Plan lazy-loading strategy for presentation data
- [ ] Consider custom/homebrew content edge cases

---

## Examples

### Discipline Definition

```typescript
// Domain (packages/core/src/domain/types/disciplines-5th.types.ts)
interface DisciplineDefinition5th {
  key: string; // ✅ Identifier
  name: string; // ✅ Short name
  type?: "Physical" | "Mental" | "Social"; // ✅ Mechanical category
  bloodResonance?: string; // ✅ Mechanical relationship
}

// Presentation (packages/core/src/presentation/disciplines-5th.presentation.ts)
interface DisciplinePresentation {
  key: string;
  description: string; // ❌ Not in domain
  characteristics: string; // ❌ Not in domain
  lore: string; // ❌ Not in domain
  masqueradeThreat: string; // ❌ Not in domain (unless it affects mechanics)
}
```

### Clan Definition

```typescript
// Domain
interface ClanDefinition5th {
  key: string; // ✅ Identifier
  name: string; // ✅ Short name
  inClanDisciplines: string[]; // ✅ Mechanical advantage
  clanBane: BaneEffect; // ✅ Mechanical penalty
  compulsions: string[]; // ✅ Mechanical triggers
}

// Presentation
interface ClanPresentation {
  key: string;
  nickname: string; // "Warlords", "Degenerates"
  description: string; // Full clan lore
  quote: string; // Flavor quote
  baneDescription: string; // Human-readable bane explanation
  history: string; // Clan history
  culture: string; // Cultural notes
}
```

### Predator Type

```typescript
// Domain
interface PredatorTypeDefinition5th {
  key: string; // ✅ Identifier
  name: string; // ✅ Short name
  skillBonuses: { skill: string; bonus: number }[]; // ✅ Mechanical
  disciplineChoice?: string[]; // ✅ Mechanical choice
}

// Presentation
interface PredatorTypePresentation {
  key: string;
  description: string; // How this predator type hunts
  examples: string[]; // Example characters
  huntingStyle: string; // Narrative hunting style
}
```

---

## Summary

**Domain entities = Game mechanics** (numbers, enums, effects, relationships)  
**Presentation data = Everything else** (text, descriptions, lore, formatting)

**When in doubt:** Ask "Does this affect game rules or computation?" If no, it's presentation.
