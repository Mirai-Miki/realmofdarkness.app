# HumanityTracker5th Value Object Design Plan

**Scope:** V5 humanity mechanic with stains system  
**Modularity Level:** 5th Edition (used by Vampire5th, Human5th, Ghoul5th)

---

## Overview

Humanity represents a character's connection to their mortal nature and ability to resist the Beast. The V5 system uses a stains mechanic where transgressions add stains, and when stains exceed capacity, the character must make a remorse roll or lose humanity.

**Key Principles:**

- Immutable value object (like DamageTracker5th, Skill, Experience)
- Encapsulates humanity + stains as cohesive unit
- Self-validates stains constraint (stains ≤ 10 - humanity)
- Provides clean API for all humanity operations

---

## Core Mechanics

### Humanity Range

- **Humanity:** 0-10
- **Default:** 7 (for vampires, humans, ghouls)
- **At 0:** Character lost to the Beast (vampire) or becomes monster (human)

### Stains Mechanics

- **Stains:** 0-10
- **Maximum stains:** 10 - current humanity
- **Example:** Humanity 7 → max 3 stains before overflow

### Stain Overflow

When stains exceed maximum:

1. Character must make **remorse roll**
2. Roll dice = humanity rating
3. Need successes >= humanity/3 (rounded down)
4. **Success:** Clear all stains, maintain humanity
5. **Failure:** Lose 1 humanity, clear all stains

---

## Value Object API

```typescript
export class HumanityTracker5th {
  private readonly _humanity: number;
  private readonly _stains: number;

  /**
   * Creates a new HumanityTracker5th instance.
   * Validates humanity and stains ranges.
   *
   * @param humanity - Current humanity (0-10)
   * @param stains - Current stains (0-10, must be <= 10 - humanity)
   * @throws Error if invalid ranges or stains exceed maximum
   */
  constructor(humanity: number, stains: number);

  // ==========================================
  // GETTERS (Readonly Properties)
  // ==========================================

  /** Current humanity rating (0-10) */
  get humanity(): number;

  /** Current stains (0-10) */
  get stains(): number;

  /** Maximum stains before overflow (10 - humanity) */
  get maxStains(): number;

  /** Whether stains exceed maximum (triggers remorse roll) */
  get hasOverflow(): boolean;

  /** Number of dice to roll for remorse (= humanity) */
  get remorseDicePool(): number;

  /** Number of successes needed to avoid losing humanity (humanity / 3, rounded down) */
  get remorseThreshold(): number;

  /** Whether character is lost (humanity 0) */
  get isLost(): boolean;

  /** Whether at maximum humanity (10) */
  get isMaxHumanity(): boolean;

  // ==========================================
  // IMMUTABLE OPERATIONS (Return New Instance)
  // ==========================================

  /**
   * Add stains to humanity.
   * If stains exceed maximum, hasOverflow will be true.
   *
   * @param amount - Number of stains to add (1-10)
   * @returns New HumanityTracker5th instance
   */
  addStain(amount: number): HumanityTracker5th;

  /**
   * Clear all stains.
   * Used after successful remorse roll or regaining humanity.
   *
   * @returns New HumanityTracker5th instance
   */
  clearStains(): HumanityTracker5th;

  /**
   * Lose humanity.
   * Automatically clears stains and adjusts max stains.
   *
   * @param amount - Humanity to lose (default 1)
   * @returns New HumanityTracker5th instance
   */
  loseHumanity(amount?: number): HumanityTracker5th;

  /**
   * Set humanity to a specific value.
   * Clears stains if losing humanity.
   * Adjusts stains if they exceed new maximum.
   *
   * @param value - New humanity value (0-10)
   * @returns New HumanityTracker5th instance
   */
  setHumanity(value: number): HumanityTracker5th;

  /**
   * Set stains to a specific value.
   * Validates against current maximum.
   *
   * @param value - New stains value (0-10)
   * @returns New HumanityTracker5th instance
   */
  setStains(value: number): HumanityTracker5th;

  /**
   * Perform remorse roll result.
   * Handles success/failure outcomes.
   *
   * @param successes - Number of successes rolled
   * @returns New HumanityTracker5th instance after remorse roll
   */
  performRemorseRoll(successes: number): HumanityTracker5th;

  // ==========================================
  // FACTORY METHODS
  // ==========================================

  /**
   * Create humanity tracker with default values.
   *
   * @param humanity - Initial humanity (default 7)
   * @returns New HumanityTracker5th instance
   */
  static create(humanity?: number): HumanityTracker5th;

  // ==========================================
  // SERIALIZATION
  // ==========================================

  /**
   * Serialize to JSON.
   *
   * @returns Plain object with humanity and stains
   */
  toJSON(): { humanity: number; stains: number };

  /**
   * Deserialize from JSON.
   *
   * @param data - Plain object with humanity and stains
   * @returns New HumanityTracker5th instance
   */
  static fromJSON(data: { humanity: number; stains: number }): HumanityTracker5th;

  // ==========================================
  // VALIDATION
  // ==========================================

  /**
   * Validate humanity and stains values.
   * Called internally by constructor.
   *
   * @param humanity - Humanity to validate
   * @param stains - Stains to validate
   * @throws Error if invalid
   */
  private static validate(humanity: number, stains: number): void;
}
```

---

## Implementation Details

### Constructor Validation

```typescript
constructor(humanity: number, stains: number) {
  HumanityTracker5th.validate(humanity, stains);
  this._humanity = humanity;
  this._stains = stains;
}

private static validate(humanity: number, stains: number): void {
  if (!Number.isInteger(humanity) || humanity < 0 || humanity > 10) {
    throw new Error('Humanity must be an integer between 0 and 10');
  }

  if (!Number.isInteger(stains) || stains < 0 || stains > 10) {
    throw new Error('Stains must be an integer between 0 and 10');
  }

  const maxStains = 10 - humanity;
  if (stains > maxStains) {
    throw new Error(
      `Stains (${stains}) cannot exceed maximum (${maxStains}) for humanity ${humanity}`
    );
  }
}
```

### Add Stain Logic

```typescript
addStain(amount: number): HumanityTracker5th {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error('Stain amount must be a non-negative integer');
  }

  const newStains = Math.min(10, this._stains + amount);

  // Note: We allow stains to exceed maxStains here
  // hasOverflow will be true, signaling remorse roll needed
  // Validation only prevents construction with invalid state
  return new HumanityTracker5th(this._humanity, newStains);
}
```

### Remorse Roll Logic

```typescript
performRemorseRoll(successes: number): HumanityTracker5th {
  if (!Number.isInteger(successes) || successes < 0) {
    throw new Error('Successes must be a non-negative integer');
  }

  const threshold = this.remorseThreshold;

  if (successes >= threshold) {
    // Success: clear stains, keep humanity
    return new HumanityTracker5th(this._humanity, 0);
  } else {
    // Failure: lose 1 humanity, clear stains
    const newHumanity = Math.max(0, this._humanity - 1);
    return new HumanityTracker5th(newHumanity, 0);
  }
}
```

### Set Humanity Logic

```typescript
setHumanity(value: number): HumanityTracker5th {
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    throw new Error('Humanity must be an integer between 0 and 10');
  }

  // If losing humanity, clear stains
  if (value < this._humanity) {
    return new HumanityTracker5th(value, 0);
  }

  // If gaining humanity, keep stains but cap at new maximum
  const newMaxStains = 10 - value;
  const newStains = Math.min(this._stains, newMaxStains);
  return new HumanityTracker5th(value, newStains);
}
```

---

## Usage Examples

### Basic Operations

```typescript
// Create new tracker
const humanity = HumanityTracker5th.create(7); // 7 humanity, 0 stains

// Add stains
const afterStain = humanity.addStain(2); // 7 humanity, 2 stains

// Check overflow
if (afterStain.hasOverflow) {
  // Trigger remorse roll
  const dicePool = afterStain.remorseDicePool; // 7 dice
  const threshold = afterStain.remorseThreshold; // 2 successes needed (7/3 = 2.33 → 2)

  // After rolling (assume 3 successes)
  const afterRemorse = afterStain.performRemorseRoll(3); // Success: 7 humanity, 0 stains
}

// Lose humanity
const fallen = humanity.loseHumanity(); // 6 humanity, 0 stains

// Clear stains
const cleansed = afterStain.clearStains(); // 7 humanity, 0 stains
```

### Integration with Vampire5th

```typescript
export class Vampire5th extends Character5th {
  public humanity: HumanityTracker5th;

  /**
   * Add stains (from committing inhumane acts)
   */
  addStain(amount: number): void {
    this.humanity = this.humanity.addStain(amount);
    this.lastUpdated = new Date();

    // Check if remorse roll needed
    if (this.humanity.hasOverflow) {
      // Emit domain event or flag for remorse roll
      // (actual roll happens in service/command handler)
    }
  }

  /**
   * Perform remorse roll
   */
  remorseRoll(successes: number): {
    success: boolean;
    humanityLost: number;
    newHumanity: number;
  } {
    const oldHumanity = this.humanity.humanity;
    this.humanity = this.humanity.performRemorseRoll(successes);
    this.lastUpdated = new Date();

    const humanityLost = oldHumanity - this.humanity.humanity;

    return {
      success: humanityLost === 0,
      humanityLost,
      newHumanity: this.humanity.humanity,
    };
  }

  /**
   * Clear stains (from atonement, mercy, etc.)
   */
  clearStains(): void {
    this.humanity = this.humanity.clearStains();
    this.lastUpdated = new Date();
  }

  /**
   * Set humanity value
   */
  setHumanity(value: number): void {
    this.humanity = this.humanity.setHumanity(value);
    this.lastUpdated = new Date();
  }
}
```

---

## Serialization

### To/From JSON

```typescript
// Serialize
const json = humanity.toJSON();
// { humanity: 7, stains: 2 }

// Deserialize
const restored = HumanityTracker5th.fromJSON(json);
```

### In Vampire5th JSONB

```typescript
interface Vampire5thData {
  // ... other fields

  humanity: {
    humanity: number;
    stains: number;
  };
}

// Serialize
toJSON(): Vampire5thData {
  return {
    // ... other fields
    humanity: this.humanity.toJSON(),
  };
}

// Deserialize
static fromData(data: Vampire5thData, ...): Vampire5th {
  return new Vampire5th({
    // ... other fields
    humanity: HumanityTracker5th.fromJSON(data.humanity),
  });
}
```

---

## Validation in Vampire5th

```typescript
validate(): { isValid: boolean; errors: string[] } {
  const baseValidation = super.validate();
  const errors = [...baseValidation.errors];

  // HumanityTracker5th self-validates in constructor
  // But we can add domain-specific checks

  if (this.humanity.isLost && this.status !== SheetStatus.Dead) {
    errors.push('Character with 0 humanity should be marked as Dead/Lost');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

## Unit Tests

### Test Cases

```typescript
describe("HumanityTracker5th", () => {
  describe("constructor", () => {
    it("should create with valid values", () => {
      const h = new HumanityTracker5th(7, 2);
      expect(h.humanity).toBe(7);
      expect(h.stains).toBe(2);
    });

    it("should throw if humanity out of range", () => {
      expect(() => new HumanityTracker5th(-1, 0)).toThrow();
      expect(() => new HumanityTracker5th(11, 0)).toThrow();
    });

    it("should throw if stains exceed maximum", () => {
      expect(() => new HumanityTracker5th(7, 4)).toThrow(); // max 3 stains
    });
  });

  describe("addStain", () => {
    it("should add stains correctly", () => {
      const h = new HumanityTracker5th(7, 1);
      const updated = h.addStain(2);
      expect(updated.stains).toBe(3);
      expect(updated.hasOverflow).toBe(false);
    });

    it("should allow stains to exceed maximum", () => {
      const h = new HumanityTracker5th(7, 2);
      const updated = h.addStain(3); // 5 stains, max is 3
      expect(updated.stains).toBe(5);
      expect(updated.hasOverflow).toBe(true);
    });

    it("should cap stains at 10", () => {
      const h = new HumanityTracker5th(0, 0);
      const updated = h.addStain(15);
      expect(updated.stains).toBe(10);
    });
  });

  describe("performRemorseRoll", () => {
    it("should clear stains on success", () => {
      const h = new HumanityTracker5th(6, 5); // threshold = 2
      const updated = h.performRemorseRoll(3);
      expect(updated.humanity).toBe(6);
      expect(updated.stains).toBe(0);
    });

    it("should lose humanity on failure", () => {
      const h = new HumanityTracker5th(6, 5); // threshold = 2
      const updated = h.performRemorseRoll(1);
      expect(updated.humanity).toBe(5);
      expect(updated.stains).toBe(0);
    });

    it("should not go below 0 humanity", () => {
      const h = new HumanityTracker5th(0, 0);
      const updated = h.performRemorseRoll(0);
      expect(updated.humanity).toBe(0);
    });
  });

  describe("serialization", () => {
    it("should serialize and deserialize correctly", () => {
      const h = new HumanityTracker5th(7, 2);
      const json = h.toJSON();
      const restored = HumanityTracker5th.fromJSON(json);
      expect(restored.humanity).toBe(7);
      expect(restored.stains).toBe(2);
    });
  });
});
```

---

## Open Questions

1. **Humanity Gain:**
   - Should there be a `gainHumanity()` method?
   - Or is `setHumanity()` sufficient?
   - Are there mechanics for regaining humanity in V5?

2. **Stain Sources:**
   - Should HumanityTracker5th track what caused stains?
   - Or is that handled elsewhere (character notes, events)?

3. **Remorse Roll Automation:**
   - Should `performRemorseRoll()` be on the VO or Vampire5th?
   - Current design: VO has it for immutability
   - Alternative: Vampire5th.remorseRoll() calls humanity.clearStains() or humanity.loseHumanity()

4. **Human/Ghoul Differences:**
   - Do humans and ghouls use identical humanity mechanics?
   - Or are there differences in stain effects?

---

## Implementation Order

1. Create `HumanityTracker5th` class
2. Implement constructor + validation
3. Implement getters
4. Implement immutable operations
5. Implement factory methods
6. Implement serialization
7. Write comprehensive unit tests
8. Integrate with Vampire5th
9. Document usage examples
