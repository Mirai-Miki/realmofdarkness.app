import { DamageTracker20th } from "../../../../src/domain";
import { RealmError } from "@realm/errors";

describe("DamageTracker20th Value Object", () => {
  describe("Constructor and Validation", () => {
    it("should create a valid tracker with no damage", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);

      expect(tracker.total).toBe(7);
      expect(tracker.bashing).toBe(0);
      expect(tracker.lethal).toBe(0);
      expect(tracker.aggravated).toBe(0);
      expect(tracker.current).toBe(7);
      expect(tracker.isEmpty).toBe(true);
      expect(tracker.isFull).toBe(false);
    });

    it("should create a valid tracker with bashing damage", () => {
      const tracker = new DamageTracker20th(7, 3, 0, 0);

      expect(tracker.bashing).toBe(3);
      expect(tracker.current).toBe(4);
    });

    it("should create a valid tracker with lethal damage", () => {
      const tracker = new DamageTracker20th(7, 0, 2, 0);

      expect(tracker.lethal).toBe(2);
      expect(tracker.current).toBe(5);
    });

    it("should create a valid tracker with aggravated damage", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 3);

      expect(tracker.aggravated).toBe(3);
      expect(tracker.current).toBe(4);
    });

    it("should create a valid tracker with all damage types", () => {
      const tracker = new DamageTracker20th(10, 2, 3, 1);

      expect(tracker.bashing).toBe(2);
      expect(tracker.lethal).toBe(3);
      expect(tracker.aggravated).toBe(1);
      expect(tracker.current).toBe(4);
    });

    it("should create a tracker at maximum damage (incapacitated)", () => {
      const tracker = new DamageTracker20th(7, 2, 3, 2);

      expect(tracker.current).toBe(0);
      expect(tracker.isFull).toBe(true);
      expect(tracker.isEmpty).toBe(false);
    });

    it("should throw error if total is less than 7", () => {
      expect(() => new DamageTracker20th(6, 0, 0, 0)).toThrow(RealmError);
      expect(() => new DamageTracker20th(6, 0, 0, 0)).toThrow(
        "Tracker total must be between 7 and 15"
      );
    });

    it("should throw error if total is negative", () => {
      expect(() => new DamageTracker20th(-1, 0, 0, 0)).toThrow(RealmError);
    });

    it("should throw error if total exceeds 15", () => {
      expect(() => new DamageTracker20th(16, 0, 0, 0)).toThrow(RealmError);
      expect(() => new DamageTracker20th(16, 0, 0, 0)).toThrow(
        "Tracker total must be between 7 and 15"
      );
    });

    it("should throw error if bashing damage is negative", () => {
      expect(() => new DamageTracker20th(7, -1, 0, 0)).toThrow(RealmError);
      expect(() => new DamageTracker20th(7, -1, 0, 0)).toThrow(
        "Damage cannot be negative"
      );
    });

    it("should throw error if lethal damage is negative", () => {
      expect(() => new DamageTracker20th(7, 0, -1, 0)).toThrow(RealmError);
      expect(() => new DamageTracker20th(7, 0, -1, 0)).toThrow(
        "Damage cannot be negative"
      );
    });

    it("should throw error if aggravated damage is negative", () => {
      expect(() => new DamageTracker20th(7, 0, 0, -1)).toThrow(RealmError);
      expect(() => new DamageTracker20th(7, 0, 0, -1)).toThrow(
        "Damage cannot be negative"
      );
    });

    it("should throw error if total damage exceeds total boxes", () => {
      expect(() => new DamageTracker20th(7, 3, 3, 3)).toThrow(RealmError);
      expect(() => new DamageTracker20th(7, 3, 3, 3)).toThrow(
        "Total damage cannot exceed tracker total"
      );
    });

    it("should throw error if bashing alone exceeds total", () => {
      expect(() => new DamageTracker20th(7, 8, 0, 0)).toThrow(RealmError);
    });

    it("should throw error if lethal alone exceeds total", () => {
      expect(() => new DamageTracker20th(7, 0, 8, 0)).toThrow(RealmError);
    });

    it("should throw error if aggravated alone exceeds total", () => {
      expect(() => new DamageTracker20th(7, 0, 0, 8)).toThrow(RealmError);
    });

    it("should accept total of 7 (minimum)", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      expect(tracker.total).toBe(7);
      expect(tracker.current).toBe(7);
    });

    it("should accept total of 15 (maximum)", () => {
      const tracker = new DamageTracker20th(15, 0, 0, 0);
      expect(tracker.total).toBe(15);
      expect(tracker.current).toBe(15);
    });
  });

  describe("Taking Bashing Damage", () => {
    it("should apply bashing damage to empty tracker", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      const damaged = tracker.takeBashing(3);

      expect(damaged.bashing).toBe(3);
      expect(damaged.lethal).toBe(0);
      expect(damaged.aggravated).toBe(0);
      expect(damaged.current).toBe(4);
    });

    it("should apply bashing damage when some boxes are already damaged", () => {
      const tracker = new DamageTracker20th(7, 2, 1, 0); // 4 boxes available
      const damaged = tracker.takeBashing(2);

      expect(damaged.bashing).toBe(4);
      expect(damaged.lethal).toBe(1);
      expect(damaged.aggravated).toBe(0);
      expect(damaged.current).toBe(2);
    });

    it("should cap bashing damage at available boxes", () => {
      const tracker = new DamageTracker20th(7, 2, 1, 0); // 4 boxes available
      const damaged = tracker.takeBashing(10);

      // Only 4 boxes available, cap bashing at 4 more (6 total)
      expect(damaged.bashing).toBe(6);
      expect(damaged.lethal).toBe(1);
      expect(damaged.aggravated).toBe(0);
      expect(damaged.current).toBe(0);
      expect(damaged.isFull).toBe(true);
    });

    it("should not add bashing damage when tracker is full", () => {
      const tracker = new DamageTracker20th(7, 2, 3, 2); // Full
      const damaged = tracker.takeBashing(2);

      // No change - tracker is full
      expect(damaged.bashing).toBe(2);
      expect(damaged.lethal).toBe(3);
      expect(damaged.aggravated).toBe(2);
      expect(damaged.current).toBe(0);
    });

    it("should handle taking 0 bashing damage", () => {
      const tracker = new DamageTracker20th(7, 2, 0, 0);
      const damaged = tracker.takeBashing(0);

      expect(damaged.bashing).toBe(2);
      expect(damaged.current).toBe(5);
    });

    it("should throw error for negative bashing damage", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      expect(() => tracker.takeBashing(-1)).toThrow(RealmError);
      expect(() => tracker.takeBashing(-1)).toThrow(
        "Cannot take negative damage"
      );
    });
  });

  describe("Taking Lethal Damage", () => {
    it("should apply lethal damage to empty tracker", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      const damaged = tracker.takeLethal(3);

      expect(damaged.bashing).toBe(0);
      expect(damaged.lethal).toBe(3);
      expect(damaged.aggravated).toBe(0);
      expect(damaged.current).toBe(4);
    });

    it("should apply lethal damage when boxes are available", () => {
      const tracker = new DamageTracker20th(7, 2, 1, 0); // 4 boxes available
      const damaged = tracker.takeLethal(2);

      expect(damaged.bashing).toBe(2);
      expect(damaged.lethal).toBe(3);
      expect(damaged.aggravated).toBe(0);
      expect(damaged.current).toBe(2);
    });

    it("should cap lethal damage at available boxes", () => {
      const tracker = new DamageTracker20th(10, 3, 2, 1); // 4 boxes available
      const damaged = tracker.takeLethal(10);

      // Only 4 boxes available
      expect(damaged.bashing).toBe(3);
      expect(damaged.lethal).toBe(6);
      expect(damaged.aggravated).toBe(1);
      expect(damaged.current).toBe(0);
    });

    it("should not add lethal damage when tracker is full", () => {
      const tracker = new DamageTracker20th(7, 2, 3, 2); // Full
      const damaged = tracker.takeLethal(3);

      expect(damaged.bashing).toBe(2);
      expect(damaged.lethal).toBe(3);
      expect(damaged.aggravated).toBe(2);
      expect(damaged.current).toBe(0);
    });

    it("should handle taking 0 lethal damage", () => {
      const tracker = new DamageTracker20th(7, 0, 2, 0);
      const damaged = tracker.takeLethal(0);

      expect(damaged.lethal).toBe(2);
      expect(damaged.current).toBe(5);
    });

    it("should throw error for negative lethal damage", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      expect(() => tracker.takeLethal(-1)).toThrow(RealmError);
      expect(() => tracker.takeLethal(-1)).toThrow(
        "Cannot take negative damage"
      );
    });
  });

  describe("Taking Aggravated Damage", () => {
    it("should apply aggravated damage to empty tracker", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      const damaged = tracker.takeAggravated(3);

      expect(damaged.bashing).toBe(0);
      expect(damaged.lethal).toBe(0);
      expect(damaged.aggravated).toBe(3);
      expect(damaged.current).toBe(4);
    });

    it("should apply aggravated damage when boxes are available", () => {
      const tracker = new DamageTracker20th(10, 2, 3, 1); // 4 boxes available
      const damaged = tracker.takeAggravated(2);

      expect(damaged.bashing).toBe(2);
      expect(damaged.lethal).toBe(3);
      expect(damaged.aggravated).toBe(3);
      expect(damaged.current).toBe(2);
    });

    it("should cap aggravated damage at available boxes", () => {
      const tracker = new DamageTracker20th(7, 1, 2, 1); // 3 boxes available
      const damaged = tracker.takeAggravated(10);

      // Only 3 boxes available
      expect(damaged.bashing).toBe(1);
      expect(damaged.lethal).toBe(2);
      expect(damaged.aggravated).toBe(4);
      expect(damaged.current).toBe(0);
    });

    it("should not add aggravated when tracker is full", () => {
      const tracker = new DamageTracker20th(7, 2, 3, 2); // Full
      const damaged = tracker.takeAggravated(2);

      expect(damaged.bashing).toBe(2);
      expect(damaged.lethal).toBe(3);
      expect(damaged.aggravated).toBe(2);
      expect(damaged.current).toBe(0);
    });

    it("should handle taking 0 aggravated damage", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 2);
      const damaged = tracker.takeAggravated(0);

      expect(damaged.aggravated).toBe(2);
      expect(damaged.current).toBe(5);
    });

    it("should throw error for negative aggravated damage", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      expect(() => tracker.takeAggravated(-1)).toThrow(RealmError);
      expect(() => tracker.takeAggravated(-1)).toThrow(
        "Cannot take negative damage"
      );
    });

    it("should result in all aggravated when taking massive damage on empty tracker", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      const damaged = tracker.takeAggravated(100);

      expect(damaged.aggravated).toBe(7);
      expect(damaged.bashing).toBe(0);
      expect(damaged.lethal).toBe(0);
      expect(damaged.current).toBe(0);
    });
  });

  describe("Healing Bashing Damage", () => {
    it("should heal bashing damage", () => {
      const tracker = new DamageTracker20th(7, 3, 0, 0);
      const healed = tracker.healBashing(2);

      expect(healed.bashing).toBe(1);
      expect(healed.current).toBe(6);
    });

    it("should heal all bashing damage", () => {
      const tracker = new DamageTracker20th(7, 3, 1, 0);
      const healed = tracker.healBashing(3);

      expect(healed.bashing).toBe(0);
      expect(healed.lethal).toBe(1);
      expect(healed.current).toBe(6);
    });

    it("should cap healing at current bashing damage", () => {
      const tracker = new DamageTracker20th(7, 2, 1, 0);
      const healed = tracker.healBashing(10);

      // Only 2 bashing to heal
      expect(healed.bashing).toBe(0);
      expect(healed.lethal).toBe(1);
      expect(healed.current).toBe(6);
    });

    it("should not heal other damage types", () => {
      const tracker = new DamageTracker20th(7, 2, 2, 1);
      const healed = tracker.healBashing(2);

      expect(healed.bashing).toBe(0);
      expect(healed.lethal).toBe(2); // Unchanged
      expect(healed.aggravated).toBe(1); // Unchanged
    });

    it("should handle healing 0 bashing damage", () => {
      const tracker = new DamageTracker20th(7, 2, 0, 0);
      const healed = tracker.healBashing(0);

      expect(healed.bashing).toBe(2);
    });

    it("should throw error for negative healing", () => {
      const tracker = new DamageTracker20th(7, 2, 0, 0);
      expect(() => tracker.healBashing(-1)).toThrow(RealmError);
      expect(() => tracker.healBashing(-1)).toThrow("Cannot heal negative");
    });
  });

  describe("Healing Lethal Damage", () => {
    it("should heal lethal damage", () => {
      const tracker = new DamageTracker20th(7, 0, 3, 0);
      const healed = tracker.healLethal(2);

      expect(healed.lethal).toBe(1);
      expect(healed.current).toBe(6);
    });

    it("should heal all lethal damage", () => {
      const tracker = new DamageTracker20th(7, 1, 3, 0);
      const healed = tracker.healLethal(3);

      expect(healed.lethal).toBe(0);
      expect(healed.bashing).toBe(1);
      expect(healed.current).toBe(6);
    });

    it("should cap healing at current lethal damage", () => {
      const tracker = new DamageTracker20th(7, 0, 2, 1);
      const healed = tracker.healLethal(10);

      expect(healed.lethal).toBe(0);
      expect(healed.aggravated).toBe(1);
      expect(healed.current).toBe(6);
    });

    it("should not heal other damage types", () => {
      const tracker = new DamageTracker20th(7, 2, 2, 1);
      const healed = tracker.healLethal(2);

      expect(healed.lethal).toBe(0);
      expect(healed.bashing).toBe(2); // Unchanged
      expect(healed.aggravated).toBe(1); // Unchanged
    });

    it("should handle healing 0 lethal damage", () => {
      const tracker = new DamageTracker20th(7, 0, 2, 0);
      const healed = tracker.healLethal(0);

      expect(healed.lethal).toBe(2);
    });

    it("should throw error for negative healing", () => {
      const tracker = new DamageTracker20th(7, 0, 2, 0);
      expect(() => tracker.healLethal(-1)).toThrow(RealmError);
    });
  });

  describe("Healing Aggravated Damage", () => {
    it("should heal aggravated damage", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 3);
      const healed = tracker.healAggravated(2);

      expect(healed.aggravated).toBe(1);
      expect(healed.current).toBe(6);
    });

    it("should heal all aggravated damage", () => {
      const tracker = new DamageTracker20th(7, 1, 0, 3);
      const healed = tracker.healAggravated(3);

      expect(healed.aggravated).toBe(0);
      expect(healed.bashing).toBe(1);
      expect(healed.current).toBe(6);
    });

    it("should cap healing at current aggravated damage", () => {
      const tracker = new DamageTracker20th(7, 0, 1, 2);
      const healed = tracker.healAggravated(10);

      expect(healed.aggravated).toBe(0);
      expect(healed.lethal).toBe(1);
      expect(healed.current).toBe(6);
    });

    it("should not heal other damage types", () => {
      const tracker = new DamageTracker20th(7, 2, 2, 2);
      const healed = tracker.healAggravated(2);

      expect(healed.aggravated).toBe(0);
      expect(healed.bashing).toBe(2); // Unchanged
      expect(healed.lethal).toBe(2); // Unchanged
    });

    it("should handle healing 0 aggravated damage", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 2);
      const healed = tracker.healAggravated(0);

      expect(healed.aggravated).toBe(2);
    });

    it("should throw error for negative healing", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 2);
      expect(() => tracker.healAggravated(-1)).toThrow(RealmError);
    });
  });

  describe("Full Healing", () => {
    it("should heal all damage", () => {
      const tracker = new DamageTracker20th(7, 2, 3, 1);
      const healed = tracker.healAll();

      expect(healed.bashing).toBe(0);
      expect(healed.lethal).toBe(0);
      expect(healed.aggravated).toBe(0);
      expect(healed.current).toBe(7);
      expect(healed.isEmpty).toBe(true);
    });

    it("should work on already undamaged tracker", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      const healed = tracker.healAll();

      expect(healed.isEmpty).toBe(true);
      expect(healed.current).toBe(7);
    });

    it("should heal full tracker (incapacitated)", () => {
      const tracker = new DamageTracker20th(7, 2, 3, 2);
      const healed = tracker.healAll();

      expect(healed.isEmpty).toBe(true);
      expect(healed.isFull).toBe(false);
      expect(healed.current).toBe(7);
    });
  });

  describe("Modifying Total", () => {
    it("should increase total without affecting damage", () => {
      const tracker = new DamageTracker20th(7, 2, 1, 0);
      const modified = tracker.setTotal(10);

      expect(modified.total).toBe(10);
      expect(modified.bashing).toBe(2);
      expect(modified.lethal).toBe(1);
      expect(modified.aggravated).toBe(0);
      expect(modified.current).toBe(7);
    });

    it("should decrease total when damage still fits", () => {
      const tracker = new DamageTracker20th(10, 2, 1, 0);
      const modified = tracker.setTotal(7);

      expect(modified.total).toBe(7);
      expect(modified.bashing).toBe(2);
      expect(modified.lethal).toBe(1);
      expect(modified.current).toBe(4);
    });

    it("should prioritize aggravated when total decreases below current damage", () => {
      const tracker = new DamageTracker20th(10, 2, 3, 2); // 7 damage
      const modified = tracker.setTotal(7);

      expect(modified.total).toBe(7);
      expect(modified.bashing).toBe(2);
      expect(modified.lethal).toBe(3);
      expect(modified.aggravated).toBe(2);
      expect(modified.current).toBe(0);
    });

    it("should reduce bashing when total is less than aggravated + lethal", () => {
      const tracker = new DamageTracker20th(10, 3, 3, 2); // 8 damage
      const modified = tracker.setTotal(7);

      // Keep all aggravated (2) and lethal (3), reduce bashing to 2
      expect(modified.total).toBe(7);
      expect(modified.bashing).toBe(2);
      expect(modified.lethal).toBe(3);
      expect(modified.aggravated).toBe(2);
      expect(modified.current).toBe(0);
    });

    it("should reduce lethal when total is less than aggravated + lethal", () => {
      const tracker = new DamageTracker20th(10, 0, 5, 3); // 8 damage
      const modified = tracker.setTotal(7);

      // Keep all aggravated (3), reduce lethal to 4
      expect(modified.total).toBe(7);
      expect(modified.bashing).toBe(0);
      expect(modified.lethal).toBe(4);
      expect(modified.aggravated).toBe(3);
      expect(modified.current).toBe(0);
    });

    it("should cap at aggravated when total is less than aggravated damage", () => {
      const tracker = new DamageTracker20th(10, 0, 0, 5);
      const modified = tracker.setTotal(7);

      // Only aggravated remains, capped at new total
      expect(modified.total).toBe(7);
      expect(modified.bashing).toBe(0);
      expect(modified.lethal).toBe(0);
      expect(modified.aggravated).toBe(5);
      expect(modified.current).toBe(2);
    });

    it("should set total to 7 (minimum)", () => {
      const tracker = new DamageTracker20th(10, 2, 1, 0);
      const modified = tracker.setTotal(7);

      expect(modified.total).toBe(7);
      expect(modified.bashing).toBe(2);
      expect(modified.lethal).toBe(1);
      expect(modified.current).toBe(4);
    });

    it("should throw error for total less than 7", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      expect(() => tracker.setTotal(6)).toThrow(RealmError);
      expect(() => tracker.setTotal(6)).toThrow(
        "Tracker total must be between 7 and 15"
      );
    });

    it("should throw error for total greater than 15", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      expect(() => tracker.setTotal(16)).toThrow(RealmError);
      expect(() => tracker.setTotal(16)).toThrow(
        "Tracker total must be between 7 and 15"
      );
    });
  });

  describe("Immutability", () => {
    it("should return new instance when taking damage", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      const damaged = tracker.takeBashing(2);

      expect(damaged).not.toBe(tracker);
      expect(tracker.bashing).toBe(0);
      expect(damaged.bashing).toBe(2);
    });

    it("should return new instance when healing", () => {
      const tracker = new DamageTracker20th(7, 3, 0, 0);
      const healed = tracker.healBashing(2);

      expect(healed).not.toBe(tracker);
      expect(tracker.bashing).toBe(3);
      expect(healed.bashing).toBe(1);
    });

    it("should return new instance when modifying total", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      const modified = tracker.setTotal(10);

      expect(modified).not.toBe(tracker);
      expect(tracker.total).toBe(7);
      expect(modified.total).toBe(10);
    });
  });

  describe("Serialization", () => {
    it("should serialize to JSON", () => {
      const tracker = new DamageTracker20th(7, 2, 3, 1);
      const json = tracker.toJSON();

      expect(json).toEqual({
        total: 7,
        bashing: 2,
        lethal: 3,
        aggravated: 1,
      });
    });

    it("should deserialize from JSON", () => {
      const json = { total: 10, bashing: 3, lethal: 2, aggravated: 1 };
      const tracker = DamageTracker20th.fromJSON(json);

      expect(tracker.total).toBe(10);
      expect(tracker.bashing).toBe(3);
      expect(tracker.lethal).toBe(2);
      expect(tracker.aggravated).toBe(1);
      expect(tracker.current).toBe(4);
    });

    it("should round-trip serialize and deserialize", () => {
      const original = new DamageTracker20th(7, 2, 3, 1);
      const json = original.toJSON();
      const restored = DamageTracker20th.fromJSON(json);

      expect(restored.total).toBe(original.total);
      expect(restored.bashing).toBe(original.bashing);
      expect(restored.lethal).toBe(original.lethal);
      expect(restored.aggravated).toBe(original.aggravated);
      expect(restored.current).toBe(original.current);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle combat scenario: taking multiple hits", () => {
      let tracker = new DamageTracker20th(7, 0, 0, 0);

      // First hit: 2 bashing
      tracker = tracker.takeBashing(2);
      expect(tracker.bashing).toBe(2);
      expect(tracker.current).toBe(5);

      // Second hit: 3 lethal
      tracker = tracker.takeLethal(3);
      expect(tracker.lethal).toBe(3);
      expect(tracker.current).toBe(2);

      // Third hit: 1 aggravated
      tracker = tracker.takeAggravated(1);
      expect(tracker.aggravated).toBe(1);
      expect(tracker.current).toBe(1);

      // Fourth hit: 2 bashing (only 1 box available, caps at 1)
      tracker = tracker.takeBashing(2);
      expect(tracker.bashing).toBe(3);
      expect(tracker.current).toBe(0);
      expect(tracker.isFull).toBe(true);
    });

    it("should handle healing scenario: gradual recovery", () => {
      let tracker = new DamageTracker20th(7, 2, 3, 1);

      // Heal bashing first (easiest)
      tracker = tracker.healBashing(2);
      expect(tracker.bashing).toBe(0);
      expect(tracker.current).toBe(3);

      // Heal some lethal
      tracker = tracker.healLethal(2);
      expect(tracker.lethal).toBe(1);
      expect(tracker.current).toBe(5);

      // Heal aggravated (hardest)
      tracker = tracker.healAggravated(1);
      expect(tracker.aggravated).toBe(0);
      expect(tracker.current).toBe(6);

      // Heal remaining lethal
      tracker = tracker.healLethal(1);
      expect(tracker.isEmpty).toBe(true);
      expect(tracker.current).toBe(7);
    });

    it("should handle increasing health mid-combat", () => {
      let tracker = new DamageTracker20th(7, 2, 3, 1);
      expect(tracker.current).toBe(1);

      // Character gains fortitude or increases stamina
      tracker = tracker.setTotal(10);
      expect(tracker.current).toBe(4);

      // Can now take more damage
      tracker = tracker.takeLethal(3);
      expect(tracker.lethal).toBe(6);
      expect(tracker.current).toBe(1);
    });

    it("should handle the deadly scenario: full aggravated (torpor/death)", () => {
      const tracker = new DamageTracker20th(7, 0, 0, 0);
      const dead = tracker.takeAggravated(7);

      expect(dead.aggravated).toBe(7);
      expect(dead.current).toBe(0);
      expect(dead.isFull).toBe(true);
      // In V20, full aggravated means torpor for vampires, death for mortals
    });

    it("should handle damage types filling independently", () => {
      let tracker = new DamageTracker20th(10, 0, 0, 0);

      // Fill with mix of damage
      tracker = tracker.takeBashing(4);
      tracker = tracker.takeLethal(3);
      tracker = tracker.takeAggravated(2);

      expect(tracker.bashing).toBe(4);
      expect(tracker.lethal).toBe(3);
      expect(tracker.aggravated).toBe(2);
      expect(tracker.current).toBe(1);

      // Taking more damage caps at 1 remaining box
      tracker = tracker.takeBashing(5);
      expect(tracker.bashing).toBe(5); // Only 1 more added
      expect(tracker.current).toBe(0);
    });
  });
});
