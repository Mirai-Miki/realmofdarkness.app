import { DamageTracker5th } from "@/domain/value-objects";
import { RealmError } from "@realm/common";

describe("DamageTracker5th Value Object", () => {
  describe("Constructor and Validation", () => {
    it("should create a valid tracker with no damage", () => {
      const tracker = new DamageTracker5th(7, 0, 0);

      expect(tracker.total).toBe(7);
      expect(tracker.superficial).toBe(0);
      expect(tracker.aggravated).toBe(0);
      expect(tracker.current).toBe(7);
      expect(tracker.isUndamaged).toBe(true);
      expect(tracker.isImpaired).toBe(false);
    });

    it("should create a valid tracker with superficial damage", () => {
      const tracker = new DamageTracker5th(7, 3, 0);

      expect(tracker.total).toBe(7);
      expect(tracker.superficial).toBe(3);
      expect(tracker.aggravated).toBe(0);
      expect(tracker.current).toBe(4);
      expect(tracker.isUndamaged).toBe(false);
      expect(tracker.isImpaired).toBe(false);
    });

    it("should create a valid tracker with aggravated damage", () => {
      const tracker = new DamageTracker5th(7, 0, 3);

      expect(tracker.total).toBe(7);
      expect(tracker.superficial).toBe(0);
      expect(tracker.aggravated).toBe(3);
      expect(tracker.current).toBe(4);
      expect(tracker.isUndamaged).toBe(false);
      expect(tracker.isImpaired).toBe(false);
    });

    it("should create a valid tracker with both damage types", () => {
      const tracker = new DamageTracker5th(7, 3, 2);

      expect(tracker.total).toBe(7);
      expect(tracker.superficial).toBe(3);
      expect(tracker.aggravated).toBe(2);
      expect(tracker.current).toBe(2);
      expect(tracker.isUndamaged).toBe(false);
      expect(tracker.isImpaired).toBe(false);
    });

    it("should create a tracker at maximum damage (impaired)", () => {
      const tracker = new DamageTracker5th(7, 5, 2);

      expect(tracker.current).toBe(0);
      expect(tracker.isImpaired).toBe(true);
      expect(tracker.isUndamaged).toBe(false);
    });

    it("should throw error if total is negative", () => {
      expect(() => new DamageTracker5th(-1, 0, 0)).toThrow(RealmError);
      expect(() => new DamageTracker5th(-1, 0, 0)).toThrow(
        "Tracker total must be between 1 and 20"
      );
    });

    it("should throw error if superficial damage is negative", () => {
      expect(() => new DamageTracker5th(7, -1, 0)).toThrow(RealmError);
      expect(() => new DamageTracker5th(7, -1, 0)).toThrow(
        "Damage cannot be negative"
      );
    });

    it("should throw error if aggravated damage is negative", () => {
      expect(() => new DamageTracker5th(7, 0, -1)).toThrow(RealmError);
      expect(() => new DamageTracker5th(7, 0, -1)).toThrow(
        "Damage cannot be negative"
      );
    });

    it("should throw error if total damage exceeds total boxes", () => {
      expect(() => new DamageTracker5th(7, 5, 3)).toThrow(RealmError);
      expect(() => new DamageTracker5th(7, 5, 3)).toThrow(
        "Total damage cannot exceed tracker total"
      );
    });

    it("should throw error if superficial alone exceeds total", () => {
      expect(() => new DamageTracker5th(7, 8, 0)).toThrow(RealmError);
    });

    it("should throw error if aggravated alone exceeds total", () => {
      expect(() => new DamageTracker5th(7, 0, 8)).toThrow(RealmError);
    });

    it("should throw error if total is 0", () => {
      expect(() => new DamageTracker5th(0, 0, 0)).toThrow(RealmError);
      expect(() => new DamageTracker5th(0, 0, 0)).toThrow(
        "Tracker total must be between 1 and 20"
      );
    });

    it("should throw error if total exceeds 20", () => {
      expect(() => new DamageTracker5th(21, 0, 0)).toThrow(RealmError);
      expect(() => new DamageTracker5th(21, 0, 0)).toThrow(
        "Tracker total must be between 1 and 20"
      );
    });

    it("should accept total of 1 (minimum)", () => {
      const tracker = new DamageTracker5th(1, 0, 0);
      expect(tracker.total).toBe(1);
      expect(tracker.current).toBe(1);
    });

    it("should accept total of 20 (maximum)", () => {
      const tracker = new DamageTracker5th(20, 0, 0);
      expect(tracker.total).toBe(20);
      expect(tracker.current).toBe(20);
    });
  });

  describe("Taking Superficial Damage", () => {
    it("should apply superficial damage to empty tracker", () => {
      const tracker = new DamageTracker5th(7, 0, 0);
      const damaged = tracker.takeSuperficial(3);

      expect(damaged.superficial).toBe(3);
      expect(damaged.aggravated).toBe(0);
      expect(damaged.current).toBe(4);
    });

    it("should apply superficial damage when some boxes are already damaged", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const damaged = tracker.takeSuperficial(2);

      expect(damaged.superficial).toBe(4);
      expect(damaged.aggravated).toBe(1);
      expect(damaged.current).toBe(2);
    });

    it("should convert overflow superficial to aggravated when filling tracker", () => {
      const tracker = new DamageTracker5th(7, 2, 1); // 4 boxes available
      const damaged = tracker.takeSuperficial(10);

      // 4 boxes fill with superficial (6 total superficial)
      // 6 overflow converts all 6 superficial to aggravated
      expect(damaged.superficial).toBe(0);
      expect(damaged.aggravated).toBe(7);
      expect(damaged.current).toBe(0);
      expect(damaged.isImpaired).toBe(true);
      expect(damaged.isDead).toBe(true);
    });

    it("should convert superficial to aggravated when tracker is full (impaired state)", () => {
      const tracker = new DamageTracker5th(3, 1, 2); // Full: 1 superficial, 2 agg
      const damaged = tracker.takeSuperficial(1);

      // 1 overflow damage converts 1 superficial to aggravated
      expect(damaged.superficial).toBe(0);
      expect(damaged.aggravated).toBe(3);
      expect(damaged.current).toBe(0);
      expect(damaged.isImpaired).toBe(true);
      expect(damaged.isDead).toBe(true);
    });

    it("should handle the example from requirements: 3 total, 1 superficial, take 3 superficial", () => {
      const tracker = new DamageTracker5th(3, 1, 0); // 2 boxes empty
      const damaged = tracker.takeSuperficial(3);

      // 2 boxes fill with superficial (now impaired)
      // 1 overflow converts 1 superficial to aggravated
      expect(damaged.superficial).toBe(2);
      expect(damaged.aggravated).toBe(1);
      expect(damaged.current).toBe(0);
      expect(damaged.isImpaired).toBe(true);
      expect(damaged.isDead).toBe(false);
    });

    it("should convert multiple superficial to aggravated with large overflow", () => {
      const tracker = new DamageTracker5th(5, 3, 2); // Full
      const damaged = tracker.takeSuperficial(3);

      // All 3 superficial convert to aggravated
      expect(damaged.superficial).toBe(0);
      expect(damaged.aggravated).toBe(5);
      expect(damaged.current).toBe(0);
      expect(damaged.isImpaired).toBe(true);
    });

    it("should not convert superficial if tracker is full with all aggravated", () => {
      const tracker = new DamageTracker5th(5, 0, 5); // Full with aggravated
      const damaged = tracker.takeSuperficial(2);

      // No room, no superficial to convert
      expect(damaged.superficial).toBe(0);
      expect(damaged.aggravated).toBe(5);
      expect(damaged.current).toBe(0);
      expect(damaged.isImpaired).toBe(true);
      expect(damaged.isDead).toBe(true);
    });

    it("should handle taking 0 superficial damage", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const damaged = tracker.takeSuperficial(0);

      expect(damaged.superficial).toBe(2);
      expect(damaged.aggravated).toBe(1);
      expect(damaged.isImpaired).toBe(false);
      expect(damaged.isDead).toBe(false);
    });

    it("should throw error for negative superficial damage", () => {
      const tracker = new DamageTracker5th(7, 0, 0);
      expect(() => tracker.takeSuperficial(-1)).toThrow(RealmError);
      expect(() => tracker.takeSuperficial(-1)).toThrow(
        "Cannot take negative damage"
      );
    });

    it("should partial convert when overflow is less than superficial", () => {
      const tracker = new DamageTracker5th(5, 4, 1); // Full: 4 superficial, 1 agg
      const damaged = tracker.takeSuperficial(2);

      // 2 overflow converts 2 superficial to aggravated
      expect(damaged.superficial).toBe(2);
      expect(damaged.aggravated).toBe(3);
      expect(damaged.current).toBe(0);
      expect(damaged.isImpaired).toBe(true);
      expect(damaged.isDead).toBe(false);
    });
  });

  describe("Taking Aggravated Damage", () => {
    it("should apply aggravated damage to empty tracker", () => {
      const tracker = new DamageTracker5th(7, 0, 0);
      const damaged = tracker.takeAggravated(3);

      expect(damaged.superficial).toBe(0);
      expect(damaged.aggravated).toBe(3);
      expect(damaged.current).toBe(4);
      expect(damaged.isImpaired).toBe(false);
      expect(damaged.isDead).toBe(false);
    });

    it("should apply aggravated damage when boxes are available", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const damaged = tracker.takeAggravated(2);

      expect(damaged.superficial).toBe(2);
      expect(damaged.aggravated).toBe(3);
      expect(damaged.current).toBe(2);
      expect(damaged.isImpaired).toBe(false);
      expect(damaged.isDead).toBe(false);
    });

    it("should convert superficial to aggravated when not enough space", () => {
      const tracker = new DamageTracker5th(7, 3, 2); // 2 boxes available
      const damaged = tracker.takeAggravated(4);

      // 2 boxes filled with agg, 2 more converts superficial
      expect(damaged.superficial).toBe(1);
      expect(damaged.aggravated).toBe(6);
      expect(damaged.current).toBe(0);
      expect(damaged.isImpaired).toBe(true);
      expect(damaged.isDead).toBe(false);
    });

    it("should cap aggravated damage at total boxes", () => {
      const tracker = new DamageTracker5th(7, 3, 1);
      const damaged = tracker.takeAggravated(10);

      // 3 boxes available + 3 superficial converted = 6 agg total, capped at 7
      expect(damaged.superficial).toBe(0);
      expect(damaged.aggravated).toBe(7);
      expect(damaged.current).toBe(0);
    });

    it("should handle taking aggravated when tracker is full", () => {
      const tracker = new DamageTracker5th(5, 3, 2); // Full
      const damaged = tracker.takeAggravated(2);

      // Convert 2 superficial to aggravated
      expect(damaged.superficial).toBe(1);
      expect(damaged.aggravated).toBe(4);
      expect(damaged.current).toBe(0);
    });

    it("should prioritize aggravated over superficial (all superficial converts)", () => {
      const tracker = new DamageTracker5th(5, 5, 0);
      const damaged = tracker.takeAggravated(3);

      // No space, convert 3 superficial to aggravated
      expect(damaged.superficial).toBe(2);
      expect(damaged.aggravated).toBe(3);
      expect(damaged.current).toBe(0);
    });

    it("should handle taking 0 aggravated damage", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const damaged = tracker.takeAggravated(0);

      expect(damaged.superficial).toBe(2);
      expect(damaged.aggravated).toBe(1);
    });

    it("should throw error for negative aggravated damage", () => {
      const tracker = new DamageTracker5th(7, 0, 0);
      expect(() => tracker.takeAggravated(-1)).toThrow(RealmError);
      expect(() => tracker.takeAggravated(-1)).toThrow(
        "Cannot take negative damage"
      );
    });

    it("should result in all aggravated when taking massive damage", () => {
      const tracker = new DamageTracker5th(5, 2, 1);
      const damaged = tracker.takeAggravated(100);

      expect(damaged.superficial).toBe(0);
      expect(damaged.aggravated).toBe(5);
      expect(damaged.current).toBe(0);
    });
  });

  describe("Healing Superficial Damage", () => {
    it("should heal superficial damage", () => {
      const tracker = new DamageTracker5th(7, 4, 1);
      const healed = tracker.healSuperficial(2);

      expect(healed.superficial).toBe(2);
      expect(healed.aggravated).toBe(1);
      expect(healed.current).toBe(4);
    });

    it("should heal all superficial damage", () => {
      const tracker = new DamageTracker5th(7, 4, 1);
      const healed = tracker.healSuperficial(4);

      expect(healed.superficial).toBe(0);
      expect(healed.aggravated).toBe(1);
      expect(healed.current).toBe(6);
      expect(healed.isUndamaged).toBe(false); // Still has aggravated
    });

    it("should cap healing at current superficial damage", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const healed = tracker.healSuperficial(10);

      expect(healed.superficial).toBe(0);
      expect(healed.aggravated).toBe(1);
    });

    it("should not heal aggravated damage", () => {
      const tracker = new DamageTracker5th(7, 2, 3);
      const healed = tracker.healSuperficial(2);

      expect(healed.superficial).toBe(0);
      expect(healed.aggravated).toBe(3); // Unchanged
    });

    it("should handle healing 0 superficial damage", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const healed = tracker.healSuperficial(0);

      expect(healed.superficial).toBe(2);
      expect(healed.aggravated).toBe(1);
    });

    it("should throw error for negative healing", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      expect(() => tracker.healSuperficial(-1)).toThrow(RealmError);
      expect(() => tracker.healSuperficial(-1)).toThrow(
        "Cannot heal negative damage"
      );
    });
  });

  describe("Healing Aggravated Damage", () => {
    it("should heal aggravated damage", () => {
      const tracker = new DamageTracker5th(7, 2, 3);
      const healed = tracker.healAggravated(2);

      expect(healed.superficial).toBe(2);
      expect(healed.aggravated).toBe(1);
      expect(healed.current).toBe(4);
    });

    it("should heal all aggravated damage", () => {
      const tracker = new DamageTracker5th(7, 2, 3);
      const healed = tracker.healAggravated(3);

      expect(healed.superficial).toBe(2);
      expect(healed.aggravated).toBe(0);
      expect(healed.isUndamaged).toBe(false); // Still has superficial
    });

    it("should cap healing at current aggravated damage", () => {
      const tracker = new DamageTracker5th(7, 4, 3);
      const healed = tracker.healAggravated(10);

      expect(healed.superficial).toBe(4);
      expect(healed.aggravated).toBe(0);
      expect(healed.isUndamaged).toBe(false); // Still has superficial
      expect(healed.isImpaired).toBe(false);
      expect(healed.isDead).toBe(false);
    });

    it("should not heal superficial damage", () => {
      const tracker = new DamageTracker5th(7, 3, 2);
      const healed = tracker.healAggravated(2);

      expect(healed.superficial).toBe(3); // Unchanged
      expect(healed.aggravated).toBe(0);
    });

    it("should handle healing 0 aggravated damage", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const healed = tracker.healAggravated(0);

      expect(healed.superficial).toBe(2);
      expect(healed.aggravated).toBe(1);
    });

    it("should throw error for negative healing", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      expect(() => tracker.healAggravated(-1)).toThrow(RealmError);
      expect(() => tracker.healAggravated(-1)).toThrow(
        "Cannot heal negative damage"
      );
    });
  });

  describe("Full Healing", () => {
    it("should heal all damage", () => {
      const tracker = new DamageTracker5th(7, 3, 2);
      const healed = tracker.healAll();

      expect(healed.superficial).toBe(0);
      expect(healed.aggravated).toBe(0);
      expect(healed.current).toBe(7);
      expect(healed.isUndamaged).toBe(true);
      expect(healed.isImpaired).toBe(false);
      expect(healed.isDead).toBe(false);
    });

    it("should work on already undamaged tracker", () => {
      const tracker = new DamageTracker5th(7, 0, 0);
      const healed = tracker.healAll();

      expect(healed.superficial).toBe(0);
      expect(healed.aggravated).toBe(0);
      expect(healed.isUndamaged).toBe(true);
    });

    it("should heal impaired tracker", () => {
      const tracker = new DamageTracker5th(5, 3, 2); // Full
      const healed = tracker.healAll();

      expect(healed.current).toBe(5);
      expect(healed.isImpaired).toBe(false);
      expect(healed.isUndamaged).toBe(true);
      expect(healed.isDead).toBe(false);
    });
  });

  describe("Modifying Total", () => {
    it("should increase total without affecting damage", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const modified = tracker.setTotal(10);

      expect(modified.total).toBe(10);
      expect(modified.superficial).toBe(2);
      expect(modified.aggravated).toBe(1);
      expect(modified.current).toBe(7);
    });

    it("should decrease total when damage still fits", () => {
      const tracker = new DamageTracker5th(10, 2, 1);
      const modified = tracker.setTotal(7);

      expect(modified.total).toBe(7);
      expect(modified.superficial).toBe(2);
      expect(modified.aggravated).toBe(1);
      expect(modified.current).toBe(4);
    });

    it("should prioritize aggravated when total decreases below current damage", () => {
      const tracker = new DamageTracker5th(10, 4, 2); // 6 total damage
      const modified = tracker.setTotal(5);

      // Keep 2 agg, reduce superficial to 3
      expect(modified.total).toBe(5);
      expect(modified.superficial).toBe(3);
      expect(modified.aggravated).toBe(2);
      expect(modified.current).toBe(0);
    });

    it("should cap at aggravated when total is less than aggravated damage", () => {
      const tracker = new DamageTracker5th(10, 3, 5);
      const modified = tracker.setTotal(4);

      // Keep 4 agg (capped), remove all superficial
      expect(modified.total).toBe(4);
      expect(modified.superficial).toBe(0);
      expect(modified.aggravated).toBe(4);
      expect(modified.current).toBe(0);
    });

    it("should set total to 1 (minimum)", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const modified = tracker.setTotal(1);

      expect(modified.total).toBe(1);
      expect(modified.superficial).toBe(0);
      expect(modified.aggravated).toBe(1);
      expect(modified.current).toBe(0);
    });

    it("should throw error for total less than 1", () => {
      const tracker = new DamageTracker5th(7, 0, 0);
      expect(() => tracker.setTotal(0)).toThrow(RealmError);
      expect(() => tracker.setTotal(0)).toThrow(
        "Tracker total must be between 1 and 20"
      );
      expect(() => tracker.setTotal(-1)).toThrow(RealmError);
    });

    it("should throw error for total greater than 20", () => {
      const tracker = new DamageTracker5th(7, 0, 0);
      expect(() => tracker.setTotal(21)).toThrow(RealmError);
      expect(() => tracker.setTotal(21)).toThrow(
        "Tracker total must be between 1 and 20"
      );
    });
  });

  describe("Immutability", () => {
    it("should return new instance when taking damage", () => {
      const tracker = new DamageTracker5th(7, 0, 0);
      const damaged = tracker.takeSuperficial(2);

      expect(damaged).not.toBe(tracker);
      expect(tracker.superficial).toBe(0); // Original unchanged
      expect(damaged.superficial).toBe(2);
    });

    it("should return new instance when healing", () => {
      const tracker = new DamageTracker5th(7, 3, 2);
      const healed = tracker.healSuperficial(1);

      expect(healed).not.toBe(tracker);
      expect(tracker.superficial).toBe(3); // Original unchanged
      expect(healed.superficial).toBe(2);
    });

    it("should return new instance when modifying total", () => {
      const tracker = new DamageTracker5th(7, 2, 1);
      const modified = tracker.setTotal(10);

      expect(modified).not.toBe(tracker);
      expect(tracker.total).toBe(7); // Original unchanged
      expect(modified.total).toBe(10);
    });
  });

  describe("Serialization", () => {
    it("should serialize to JSON", () => {
      const tracker = new DamageTracker5th(7, 3, 2);
      const json = tracker.toJSON();

      expect(json).toEqual({
        total: 7,
        superficial: 3,
        aggravated: 2,
      });
    });

    it("should deserialize from JSON", () => {
      const json = { total: 7, superficial: 3, aggravated: 2 };
      const tracker = DamageTracker5th.fromJSON(json);

      expect(tracker.total).toBe(7);
      expect(tracker.superficial).toBe(3);
      expect(tracker.aggravated).toBe(2);
      expect(tracker.current).toBe(2);
    });

    it("should round-trip serialize and deserialize", () => {
      const original = new DamageTracker5th(7, 3, 2);
      const json = original.toJSON();
      const restored = DamageTracker5th.fromJSON(json);

      expect(restored.total).toBe(original.total);
      expect(restored.superficial).toBe(original.superficial);
      expect(restored.aggravated).toBe(original.aggravated);
      expect(restored.current).toBe(original.current);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle combat scenario: taking multiple hits", () => {
      let tracker = new DamageTracker5th(7, 0, 0);

      // Take 2 superficial
      tracker = tracker.takeSuperficial(2);
      expect(tracker.superficial).toBe(2);
      expect(tracker.current).toBe(5);

      // Take 1 aggravated
      tracker = tracker.takeAggravated(1);
      expect(tracker.aggravated).toBe(1);
      expect(tracker.current).toBe(4);

      // Take 3 more superficial
      tracker = tracker.takeSuperficial(3);
      expect(tracker.superficial).toBe(5);
      expect(tracker.current).toBe(1);

      // Take 2 aggravated (1 fits, 1 converts superficial)
      tracker = tracker.takeAggravated(2);
      expect(tracker.aggravated).toBe(3);
      expect(tracker.superficial).toBe(4);
      expect(tracker.current).toBe(0);
      expect(tracker.isImpaired).toBe(true);
    });

    it("should handle healing scenario: gradual recovery", () => {
      let tracker = new DamageTracker5th(7, 4, 3);

      // Heal superficial first
      tracker = tracker.healSuperficial(2);
      expect(tracker.superficial).toBe(2);
      expect(tracker.aggravated).toBe(3);
      expect(tracker.current).toBe(2);

      // Heal aggravated
      tracker = tracker.healAggravated(1);
      expect(tracker.aggravated).toBe(2);
      expect(tracker.current).toBe(3);

      // Full heal
      tracker = tracker.healAll();
      expect(tracker.isUndamaged).toBe(true);
      expect(tracker.current).toBe(7);
    });

    it("should handle increasing health mid-combat", () => {
      let tracker = new DamageTracker5th(5, 3, 2);

      // Character gains health (e.g., level up)
      tracker = tracker.setTotal(7);
      expect(tracker.total).toBe(7);
      expect(tracker.current).toBe(2);

      // Can now take more damage
      tracker = tracker.takeSuperficial(2);
      expect(tracker.current).toBe(0);
      expect(tracker.isImpaired).toBe(true);
    });

    it("should handle the deadly scenario: full aggravated (torpor/death)", () => {
      let tracker = new DamageTracker5th(5, 3, 2);

      // Take massive aggravated damage
      tracker = tracker.takeAggravated(10);

      expect(tracker.superficial).toBe(0);
      expect(tracker.aggravated).toBe(5);
      expect(tracker.current).toBe(0);
      expect(tracker.isImpaired).toBe(true);
    });
  });
});
