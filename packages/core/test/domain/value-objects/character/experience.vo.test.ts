import { Experience } from "@/domain/value-objects";
import { RealmError } from "@realm/common";

describe("Experience Value Object", () => {
  describe("Constructor and Validation", () => {
    it("should create a valid experience with zero points", () => {
      const exp = new Experience(0, 0);

      expect(exp.total).toBe(0);
      expect(exp.current).toBe(0);
      expect(exp.spent).toBe(0);
      expect(exp.isExhausted).toBe(true);
      expect(exp.isUnspent).toBe(true);
    });

    it("should create a valid experience with unspent points", () => {
      const exp = new Experience(100, 100);

      expect(exp.total).toBe(100);
      expect(exp.current).toBe(100);
      expect(exp.spent).toBe(0);
      expect(exp.isUnspent).toBe(true);
      expect(exp.isExhausted).toBe(false);
    });

    it("should create a valid experience with partially spent points", () => {
      const exp = new Experience(100, 50);

      expect(exp.total).toBe(100);
      expect(exp.current).toBe(50);
      expect(exp.spent).toBe(50);
      expect(exp.isUnspent).toBe(false);
      expect(exp.isExhausted).toBe(false);
    });

    it("should create a valid experience with all points spent", () => {
      const exp = new Experience(100, 0);

      expect(exp.total).toBe(100);
      expect(exp.current).toBe(0);
      expect(exp.spent).toBe(100);
      expect(exp.isExhausted).toBe(true);
      expect(exp.isUnspent).toBe(false);
    });

    it("should throw error if total is negative", () => {
      expect(() => new Experience(-1, 0)).toThrow(RealmError);
      expect(() => new Experience(-1, 0)).toThrow(
        "Total experience cannot be negative"
      );
    });

    it("should throw error if current is negative", () => {
      expect(() => new Experience(100, -1)).toThrow(RealmError);
      expect(() => new Experience(100, -1)).toThrow(
        "Current experience cannot be negative"
      );
    });

    it("should throw error if current exceeds total", () => {
      expect(() => new Experience(100, 101)).toThrow(RealmError);
      expect(() => new Experience(100, 101)).toThrow(
        "Current experience cannot exceed total"
      );
    });
  });

  describe("Static Factory Methods", () => {
    it("should create zero experience", () => {
      const exp = Experience.zero();

      expect(exp.total).toBe(0);
      expect(exp.current).toBe(0);
      expect(exp.isExhausted).toBe(true);
      expect(exp.isUnspent).toBe(true);
    });

    it("should create experience from total (all unspent)", () => {
      const exp = Experience.fromTotal(150);

      expect(exp.total).toBe(150);
      expect(exp.current).toBe(150);
      expect(exp.spent).toBe(0);
      expect(exp.isUnspent).toBe(true);
    });
  });

  describe("Computed Properties", () => {
    it("should calculate spent correctly", () => {
      const exp = new Experience(200, 75);
      expect(exp.spent).toBe(125);
    });

    it("should identify exhausted experience", () => {
      const exhausted = new Experience(100, 0);
      const notExhausted = new Experience(100, 1);

      expect(exhausted.isExhausted).toBe(true);
      expect(notExhausted.isExhausted).toBe(false);
    });

    it("should identify unspent experience", () => {
      const unspent = new Experience(100, 100);
      const partiallySpent = new Experience(100, 99);

      expect(unspent.isUnspent).toBe(true);
      expect(partiallySpent.isUnspent).toBe(false);
    });

    it("should check affordability", () => {
      const exp = new Experience(100, 50);

      expect(exp.canAfford(25)).toBe(true);
      expect(exp.canAfford(50)).toBe(true);
      expect(exp.canAfford(51)).toBe(false);
      expect(exp.canAfford(100)).toBe(false);
    });

    it("should handle zero cost affordability", () => {
      const exp = new Experience(100, 0);
      expect(exp.canAfford(0)).toBe(true);
    });
  });

  describe("Awarding Experience", () => {
    it("should award experience points", () => {
      const exp = new Experience(100, 50);
      const awarded = exp.award(25);

      expect(awarded.total).toBe(125);
      expect(awarded.current).toBe(75);
      expect(awarded.spent).toBe(50);
    });

    it("should award to zero experience", () => {
      const exp = Experience.zero();
      const awarded = exp.award(100);

      expect(awarded.total).toBe(100);
      expect(awarded.current).toBe(100);
      expect(awarded.isUnspent).toBe(true);
    });

    it("should award zero experience (no change)", () => {
      const exp = new Experience(100, 50);
      const awarded = exp.award(0);

      expect(awarded.total).toBe(100);
      expect(awarded.current).toBe(50);
    });

    it("should throw error for negative award", () => {
      const exp = new Experience(100, 50);

      expect(() => exp.award(-10)).toThrow(RealmError);
      expect(() => exp.award(-10)).toThrow("Cannot award negative experience");
    });

    it("should return new instance (immutability)", () => {
      const exp = new Experience(100, 50);
      const awarded = exp.award(10);

      expect(awarded).not.toBe(exp);
      expect(exp.total).toBe(100);
      expect(exp.current).toBe(50);
    });
  });

  describe("Spending Experience", () => {
    it("should spend experience points", () => {
      const exp = new Experience(100, 50);
      const spent = exp.spend(25);

      expect(spent.total).toBe(100);
      expect(spent.current).toBe(25);
      expect(spent.spent).toBe(75);
    });

    it("should spend all remaining experience", () => {
      const exp = new Experience(100, 50);
      const spent = exp.spend(50);

      expect(spent.total).toBe(100);
      expect(spent.current).toBe(0);
      expect(spent.isExhausted).toBe(true);
    });

    it("should spend zero experience (no change)", () => {
      const exp = new Experience(100, 50);
      const spent = exp.spend(0);

      expect(spent.total).toBe(100);
      expect(spent.current).toBe(50);
    });

    it("should throw error for negative spend", () => {
      const exp = new Experience(100, 50);

      expect(() => exp.spend(-10)).toThrow(RealmError);
      expect(() => exp.spend(-10)).toThrow("Cannot spend negative experience");
    });

    it("should throw error for insufficient experience", () => {
      const exp = new Experience(100, 50);

      expect(() => exp.spend(51)).toThrow(RealmError);
      expect(() => exp.spend(51)).toThrow(
        "Insufficient experience. Required: 51, Available: 50"
      );
    });

    it("should throw error when trying to spend from exhausted pool", () => {
      const exp = new Experience(100, 0);

      expect(() => exp.spend(1)).toThrow(RealmError);
      expect(() => exp.spend(1)).toThrow("Insufficient experience");
    });

    it("should return new instance (immutability)", () => {
      const exp = new Experience(100, 50);
      const spent = exp.spend(10);

      expect(spent).not.toBe(exp);
      expect(exp.total).toBe(100);
      expect(exp.current).toBe(50);
    });
  });

  describe("Setting Total", () => {
    it("should increase total without affecting spent amount", () => {
      const exp = new Experience(100, 50);
      const modified = exp.setTotal(150);

      expect(modified.total).toBe(150);
      expect(modified.current).toBe(50);
      expect(modified.spent).toBe(100);
    });

    it("should decrease total and adjust current if needed", () => {
      const exp = new Experience(100, 75);
      const modified = exp.setTotal(50);

      // Current capped at new total
      expect(modified.total).toBe(50);
      expect(modified.current).toBe(50);
      expect(modified.spent).toBe(0);
    });

    it("should decrease total when current fits", () => {
      const exp = new Experience(100, 25);
      const modified = exp.setTotal(50);

      expect(modified.total).toBe(50);
      expect(modified.current).toBe(25);
      expect(modified.spent).toBe(25);
    });

    it("should set total to zero", () => {
      const exp = new Experience(100, 50);
      const modified = exp.setTotal(0);

      expect(modified.total).toBe(0);
      expect(modified.current).toBe(0);
      expect(modified.isExhausted).toBe(true);
    });

    it("should throw error for negative total", () => {
      const exp = new Experience(100, 50);

      expect(() => exp.setTotal(-1)).toThrow(RealmError);
      expect(() => exp.setTotal(-1)).toThrow(
        "Total experience cannot be negative"
      );
    });

    it("should return new instance (immutability)", () => {
      const exp = new Experience(100, 50);
      const modified = exp.setTotal(150);

      expect(modified).not.toBe(exp);
      expect(exp.total).toBe(100);
    });
  });

  describe("Setting Current", () => {
    it("should increase current experience", () => {
      const exp = new Experience(100, 25);
      const modified = exp.setCurrent(75);

      expect(modified.total).toBe(100);
      expect(modified.current).toBe(75);
      expect(modified.spent).toBe(25);
    });

    it("should decrease current experience", () => {
      const exp = new Experience(100, 75);
      const modified = exp.setCurrent(25);

      expect(modified.total).toBe(100);
      expect(modified.current).toBe(25);
      expect(modified.spent).toBe(75);
    });

    it("should set current to zero", () => {
      const exp = new Experience(100, 50);
      const modified = exp.setCurrent(0);

      expect(modified.total).toBe(100);
      expect(modified.current).toBe(0);
      expect(modified.isExhausted).toBe(true);
    });

    it("should set current to equal total", () => {
      const exp = new Experience(100, 50);
      const modified = exp.setCurrent(100);

      expect(modified.total).toBe(100);
      expect(modified.current).toBe(100);
      expect(modified.isUnspent).toBe(true);
    });

    it("should throw error for negative current", () => {
      const exp = new Experience(100, 50);

      expect(() => exp.setCurrent(-1)).toThrow(RealmError);
      expect(() => exp.setCurrent(-1)).toThrow(
        "Current experience cannot be negative"
      );
    });

    it("should throw error if current exceeds total", () => {
      const exp = new Experience(100, 50);

      expect(() => exp.setCurrent(101)).toThrow(RealmError);
      expect(() => exp.setCurrent(101)).toThrow(
        "Current experience cannot exceed total"
      );
    });

    it("should return new instance (immutability)", () => {
      const exp = new Experience(100, 50);
      const modified = exp.setCurrent(75);

      expect(modified).not.toBe(exp);
      expect(exp.current).toBe(50);
    });
  });

  describe("Serialization", () => {
    it("should serialize to JSON", () => {
      const exp = new Experience(100, 50);
      const json = exp.toJSON();

      expect(json).toEqual({
        total: 100,
        current: 50,
      });
    });

    it("should deserialize from JSON", () => {
      const data = { total: 100, current: 50 };
      const exp = Experience.fromJSON(data);

      expect(exp.total).toBe(100);
      expect(exp.current).toBe(50);
    });

    it("should round-trip serialize and deserialize", () => {
      const original = new Experience(150, 75);
      const json = original.toJSON();
      const deserialized = Experience.fromJSON(json);

      expect(deserialized.total).toBe(original.total);
      expect(deserialized.current).toBe(original.current);
      expect(deserialized.equals(original)).toBe(true);
    });

    it("should serialize zero experience", () => {
      const exp = Experience.zero();
      const json = exp.toJSON();

      expect(json).toEqual({
        total: 0,
        current: 0,
      });
    });
  });

  describe("Equality", () => {
    it("should identify equal experiences", () => {
      const exp1 = new Experience(100, 50);
      const exp2 = new Experience(100, 50);

      expect(exp1.equals(exp2)).toBe(true);
    });

    it("should identify unequal experiences (different total)", () => {
      const exp1 = new Experience(100, 50);
      const exp2 = new Experience(150, 50);

      expect(exp1.equals(exp2)).toBe(false);
    });

    it("should identify unequal experiences (different current)", () => {
      const exp1 = new Experience(100, 50);
      const exp2 = new Experience(100, 75);

      expect(exp1.equals(exp2)).toBe(false);
    });

    it("should identify zero experiences as equal", () => {
      const exp1 = Experience.zero();
      const exp2 = Experience.zero();

      expect(exp1.equals(exp2)).toBe(true);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle character progression: award and spend", () => {
      let exp = Experience.fromTotal(50); // Start with 50 XP

      // Award session XP
      exp = exp.award(10);
      expect(exp.total).toBe(60);
      expect(exp.current).toBe(60);

      // Spend on attribute
      exp = exp.spend(8);
      expect(exp.total).toBe(60);
      expect(exp.current).toBe(52);
      expect(exp.spent).toBe(8);

      // Spend on skill
      exp = exp.spend(3);
      expect(exp.total).toBe(60);
      expect(exp.current).toBe(49);
      expect(exp.spent).toBe(11);

      // Award more XP
      exp = exp.award(15);
      expect(exp.total).toBe(75);
      expect(exp.current).toBe(64);
      expect(exp.spent).toBe(11);
    });

    it("should handle loading saved character", () => {
      // Simulate loading from database
      const savedData = { total: 250, current: 50 };
      const exp = Experience.fromJSON(savedData);

      expect(exp.total).toBe(250);
      expect(exp.current).toBe(50);
      expect(exp.spent).toBe(200);
      expect(exp.canAfford(25)).toBe(true);
      expect(exp.canAfford(100)).toBe(false);
    });

    it("should handle character creation with starting XP", () => {
      // New character with 100 starting XP
      const exp = Experience.fromTotal(100);

      expect(exp.isUnspent).toBe(true);
      expect(exp.canAfford(100)).toBe(true);

      // Spend during character creation
      const spent = exp.spend(100);
      expect(spent.isExhausted).toBe(true);
      expect(spent.total).toBe(100);
      expect(spent.current).toBe(0);
    });

    it("should handle XP refund scenario (increasing current)", () => {
      const exp = new Experience(100, 25);

      // Refund 10 XP (e.g., ST reverses a spend)
      const refunded = exp.setCurrent(35);

      expect(refunded.total).toBe(100);
      expect(refunded.current).toBe(35);
      expect(refunded.spent).toBe(65);
    });
  });

  describe("Immutability", () => {
    it("should not mutate original when awarding", () => {
      const original = new Experience(100, 50);
      const awarded = original.award(10);

      expect(original.total).toBe(100);
      expect(original.current).toBe(50);
      expect(awarded.total).toBe(110);
      expect(awarded.current).toBe(60);
    });

    it("should not mutate original when spending", () => {
      const original = new Experience(100, 50);
      const spent = original.spend(10);

      expect(original.total).toBe(100);
      expect(original.current).toBe(50);
      expect(spent.total).toBe(100);
      expect(spent.current).toBe(40);
    });

    it("should not mutate original when setting total", () => {
      const original = new Experience(100, 50);
      const modified = original.setTotal(150);

      expect(original.total).toBe(100);
      expect(modified.total).toBe(150);
    });

    it("should not mutate original when setting current", () => {
      const original = new Experience(100, 50);
      const modified = original.setCurrent(25);

      expect(original.current).toBe(50);
      expect(modified.current).toBe(25);
    });
  });
});
