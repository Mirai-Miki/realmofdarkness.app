# Value Objects Implementation - Summary

**Date:** January 2025  
**Status:** ✅ Complete - Phase 1a

---

## What We Implemented

Created three **Value Object** classes following Domain-Driven Design principles to encapsulate damage and willpower tracking logic for 5th and 20th edition character systems.

### Created Files

1. **`packages/core/src/domain/entities/value-objects/damage-tracker-5th.vo.ts`** (264 lines)
   - Immutable Value Object for 5th edition damage tracking
   - Properties: `total`, `superficial`, `aggravated`
   - Computed: `current`, `isFull`, `isEmpty`
   - Logic: Superficial damage converts to aggravated when track is full
   - Methods: `takeSuperficial()`, `takeAggravated()`, `healSuperficial()`, `healAggravated()`, `healAll()`, `setTotal()`
   - Serialization: `toJSON()`, `static fromJSON()`

2. **`packages/core/src/domain/entities/value-objects/damage-tracker-20th.vo.ts`** (340 lines)
   - Immutable Value Object for 20th edition damage tracking
   - Properties: `total`, `bashing`, `lethal`, `aggravated`
   - Computed: `current`, `isFull`, `isEmpty`
   - Logic: Damage type upgrades (bashing → lethal → aggravated) when track is full
   - Methods: `takeBashing()`, `takeLethal()`, `takeAggravated()`, `healBashing()`, `healLethal()`, `healAggravated()`, `healAll()`, `setTotal()`
   - Serialization: `toJSON()`, `static fromJSON()`

3. **`packages/core/src/domain/entities/value-objects/willpower-tracker.vo.ts`** (176 lines)
   - Immutable Value Object for 20th edition willpower tracking
   - Properties: `total`, `current`
   - Computed: `isFull`, `isEmpty`
   - Methods: `spend()`, `recover()`, `recoverAll()`, `setCurrent()`, `setTotal()`
   - Validation: Throws `ClientError` if trying to spend more than available
   - Serialization: `toJSON()`, `static fromJSON()`

4. **`packages/core/src/domain/entities/value-objects/index.ts`**
   - Barrel export file for all Value Objects

---

## Key Architectural Decisions

### 1. Value Object Pattern

**What are Value Objects?**

- Immutable objects defined by their **values**, not identity
- Self-validating: constructor enforces all invariants
- Encapsulation: all business logic for the tracker is contained within
- No external dependencies: pure TypeScript classes

**Why this pattern?**

- **Type Safety**: Cannot create invalid states (e.g., damage > total)
- **Immutability**: All modifications return new instances, preventing bugs
- **Testability**: Can test trackers in isolation from character entities
- **Reusability**: Same tracker class can be used for health, willpower, etc.
- **Encapsulation**: Character entities don't need to know damage upgrade rules

### 2. Immutability

```typescript
// ❌ OLD: Mutable interface
interface DamageTracker5th {
  total: number;
  superficial: number;
  aggravated: number;
}

// Character can violate rules
character.health.superficial = 999; // No validation!

// ✅ NEW: Immutable Value Object
class DamageTracker5th {
  constructor(
    public readonly total: number,
    public readonly superficial: number,
    public readonly aggravated: number
  ) {
    this.validate(); // Always valid
  }

  public takeSuperficial(amount: number): DamageTracker5th {
    // Returns new instance with rules enforced
    return new DamageTracker5th(...);
  }
}

// Cannot violate rules - properties are readonly
character.health.superficial = 999; // TypeScript error!

// Modifications return new instances
character.health = character.health.takeSuperficial(3);
```

### 3. Self-Validation

Every Value Object validates its invariants in the constructor:

```typescript
constructor(total: number, superficial: number, aggravated: number) {
  if (total < 0) {
    throw new ClientError("Tracker total cannot be negative");
  }
  if (superficial + aggravated > total) {
    throw new ClientError("Total damage cannot exceed tracker total");
  }
  // ... etc
}
```

This ensures it's **impossible to create an invalid Value Object**.

### 4. Encapsulated Logic

#### 5th Edition: Superficial → Aggravated Conversion

```typescript
public takeSuperficial(amount: number): DamageTracker5th {
  const available = this.current;
  const actualSuperficial = Math.min(amount, available);

  // Overflow logic: if taking more damage than available boxes,
  // convert existing superficial to aggravated
  const overflow = amount - actualSuperficial;
  if (overflow > 0 && this.superficial > 0) {
    const converted = Math.min(overflow, this.superficial);
    return new DamageTracker5th(
      this.total,
      this.superficial + actualSuperficial - converted,
      this.aggravated + converted
    );
  }

  return new DamageTracker5th(
    this.total,
    this.superficial + actualSuperficial,
    this.aggravated
  );
}
```

#### 20th Edition: Bashing → Lethal → Aggravated Upgrades

```typescript
public takeBashing(amount: number): DamageTracker20th {
  const available = this.current;
  const actualBashing = Math.min(amount, available);
  const newBashing = this.bashing + actualBashing;

  // If overflow and we have bashing, upgrade it to lethal
  const overflow = amount - actualBashing;
  if (overflow > 0 && this.bashing > 0) {
    const upgraded = Math.min(overflow, this.bashing);
    return new DamageTracker20th(
      this.total,
      newBashing - upgraded,
      this.lethal + upgraded,
      this.aggravated
    );
  }

  return new DamageTracker20th(
    this.total,
    newBashing,
    this.lethal,
    this.aggravated
  );
}
```

### 5. Snowflake Type for Discord IDs

Fixed all character entity constructors to use `Snowflake` instead of `bigint`:

```typescript
// ❌ OLD
protected constructor(data: {
  userId: bigint;
  guildId?: bigint | null;
}) { }

// ✅ NEW
protected constructor(data: {
  userId: Snowflake;
  guildId?: Snowflake | null;
}) { }
```

**Why Snowflake?**

- Semantic clarity: `Snowflake` indicates it's a Discord ID
- Type alias: `type Snowflake = string`
- Discord.js uses strings for IDs, not numbers
- Prevents accidental arithmetic on IDs

---

## TypeScript Build Status

✅ **All builds passing**

```bash
pnpm build
# ✅ No errors
```

Fixed 3 TypeScript errors:

1. ✅ Character20th constructor: `bigint` → `Snowflake`
2. ✅ CharacterCoD constructor: `bigint` → `Snowflake`
3. ✅ Character5th: Removed unused `ClientError` import

---

## Code Quality

✅ **All files formatted with Prettier**

```bash
pnpm format
# ✅ All files properly formatted (LF line endings)
```

✅ **All files use absolute imports**

```typescript
// ✅ Correct
import { ClientError } from "errors";
import type { Snowflake } from "types";

// ❌ Wrong (relative paths)
import { ClientError } from "../../../errors";
```

✅ **All files documented with JSDoc**

Every class, method, and property has comprehensive documentation:

- Purpose and behavior
- Parameter descriptions
- Return value descriptions
- Throws clauses
- Usage examples

---

## Next Steps

### Immediate (Phase 1b)

1. **Refactor Character5th** to use `DamageTracker5th` Value Object
   - Replace `DamageTracker5th` interface with Value Object class
   - Remove `takeSuperficialDamage()` private methods
   - Update methods to use Value Object API:

     ```typescript
     // OLD
     this.health = {
       ...this.health,
       superficial: this.health.superficial + amount,
     };

     // NEW
     this.health = this.health.takeSuperficial(amount);
     ```

2. **Refactor Character20th** to use `WillpowerTracker` and `DamageTracker20th` Value Objects
   - Replace interfaces with Value Object classes
   - Remove manual tracker manipulation methods
   - Update to use Value Object API

3. **Move character types** to `character.types.ts`
   - Create `domain/entities/characters/character.types.ts`
   - Move `SheetStatus` and `Splats` enums from `types/character.ts`
   - Update all imports

4. **Test build and functionality**
   - Run `pnpm build` to verify no errors
   - Add unit tests for Value Objects
   - Add integration tests for character entities using Value Objects

### Phase 2: Repository Implementation

Once character entities are refactored to use Value Objects, implement:

1. **CharacterMapper** - Translate between DB records and domain models
   - Map JSONB data to Value Objects
   - Handle polymorphic deserialization (Vampire5th, Hunter5th, etc.)

2. **CharacterRepository** - Data access layer
   - `findById()`, `findByUser()`, `create()`, `update()`, `delete()`
   - Use CharacterMapper for translation

---

## Benefits Achieved

### Before (Interfaces)

```typescript
// Mutable interfaces - no protection
interface DamageTracker5th {
  total: number;
  superficial: number;
  aggravated: number;
}

class Character5th {
  public health: DamageTracker5th;

  // Character class must know damage rules
  private takeSuperficialDamage(
    tracker: DamageTracker5th,
    amount: number,
    trackerName: string
  ): void {
    // Complex logic scattered in character class
    const available = tracker.total - tracker.superficial - tracker.aggravated;
    const actualDamage = Math.min(amount, available);
    const overflow = amount - actualDamage;

    tracker.superficial += actualDamage;

    // More logic...
    if (overflow > 0 && tracker.superficial > 0) {
      // Conversion logic duplicated
    }

    this.markChanged(trackerName);
  }

  // Can be violated directly
  someMethod() {
    this.health.superficial = 999; // No validation!
  }
}
```

### After (Value Objects)

```typescript
// Immutable Value Object - self-validating
class DamageTracker5th {
  constructor(
    public readonly total: number,
    public readonly superficial: number,
    public readonly aggravated: number
  ) {
    this.validate(); // Always enforced
  }

  // All damage logic encapsulated
  public takeSuperficial(amount: number): DamageTracker5th {
    // Returns new instance with rules enforced
  }
}

class Character5th {
  public health: DamageTracker5th;

  // Character class is simpler
  public takeHealthDamage(amount: number): void {
    this.health = this.health.takeSuperficial(amount);
    this.markChanged("health");
  }

  // Cannot violate rules
  someMethod() {
    this.health.superficial = 999; // TypeScript compile error!
    this.health = new DamageTracker5th(7, 999, 0); // ClientError thrown!
  }
}
```

### Improvements

✅ **Type Safety**: Impossible to create invalid state  
✅ **Immutability**: Prevents accidental mutations  
✅ **Encapsulation**: Logic lives with the data  
✅ **Testability**: Can test trackers independently  
✅ **Reusability**: Same class for health and willpower  
✅ **Maintainability**: Change rules in one place  
✅ **Clarity**: Intent is obvious from the API

---

## Testing Strategy

### Unit Tests for Value Objects

```typescript
// damage-tracker-5th.test.ts
describe("DamageTracker5th", () => {
  describe("takeSuperficial", () => {
    it("should take superficial damage within available boxes", () => {
      const tracker = new DamageTracker5th(7, 0, 0);
      const damaged = tracker.takeSuperficial(3);

      expect(damaged.superficial).toBe(3);
      expect(damaged.aggravated).toBe(0);
      expect(damaged.current).toBe(4);
    });

    it("should convert superficial to aggravated on overflow", () => {
      const tracker = new DamageTracker5th(7, 5, 0); // 2 boxes left
      const damaged = tracker.takeSuperficial(4); // Try to take 4

      expect(damaged.superficial).toBe(5); // 2 new + 3 old
      expect(damaged.aggravated).toBe(2); // 2 converted
      expect(damaged.current).toBe(0);
    });
  });

  describe("validation", () => {
    it("should throw on negative total", () => {
      expect(() => new DamageTracker5th(-1, 0, 0)).toThrow(ClientError);
    });

    it("should throw on damage exceeding total", () => {
      expect(() => new DamageTracker5th(7, 5, 3)).toThrow(ClientError);
    });
  });
});
```

---

## Conclusion

We successfully implemented three Value Objects that:

1. ✅ Encapsulate complex damage/willpower tracking logic
2. ✅ Ensure invariants are always maintained
3. ✅ Provide immutable, type-safe APIs
4. ✅ Follow Domain-Driven Design principles
5. ✅ Are independently testable and reusable
6. ✅ Use Snowflake type for Discord IDs
7. ✅ Use proper error types (ClientError/RealmError)
8. ✅ Have comprehensive JSDoc documentation
9. ✅ Use absolute imports with path aliases
10. ✅ Pass TypeScript compilation

The next step is to refactor the character entities (Character5th and Character20th) to **use** these Value Objects instead of the interface definitions.
