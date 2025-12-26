import type { IExperience, ExperienceData } from "@realm/common";
import { ExperienceDataSchema, UserError } from "@realm/common";

/**
 * Experience value object.
 * Immutable - all operations return new instances.
 *
 * @remarks
 * This is a value object, meaning it's defined by its values rather than
 * an identity. Two Experience objects with the same current/total are
 * considered equal.
 */
export class Experience implements IExperience {
  readonly current: number;
  readonly total: number;

  constructor(data: ExperienceData) {
    // Validate with Zod schema
    const validated = ExperienceDataSchema.parse(data);

    this.current = validated.current;
    this.total = validated.total;
  }

  canAfford(cost: number): boolean {
    return this.current >= cost;
  }

  spend(cost: number): IExperience {
    if (!this.canAfford(cost)) {
      throw new UserError(
        `Insufficient experience. Need ${cost}, have ${this.current}`,
        { fields: { cost: cost.toString(), current: this.current.toString() } }
      );
    }
    // Validate new values with Zod before creating new instance
    return new Experience(
      ExperienceDataSchema.parse({
        current: this.current - cost,
        total: this.total,
      })
    );
  }

  award(amount: number): IExperience {
    if (amount < 0) {
      throw new UserError("Cannot award negative experience", {
        fields: { amount: amount.toString() },
      });
    }
    // Validate new values with Zod before creating new instance
    return new Experience(
      ExperienceDataSchema.parse({
        current: this.current + amount,
        total: this.total + amount,
      })
    );
  }

  setTotal(total: number): IExperience {
    if (total < 0) {
      throw new UserError("Total experience cannot be negative", {
        fields: { total: total.toString() },
      });
    }
    // Validate new values with Zod before creating new instance
    return new Experience(
      ExperienceDataSchema.parse({
        current: Math.min(this.current, total), // Adjust current if needed
        total,
      })
    );
  }

  setCurrent(current: number): IExperience {
    if (current < 0) {
      throw new UserError("Current experience cannot be negative", {
        fields: { current: current.toString() },
      });
    }
    if (current > this.total) {
      throw new UserError("Current experience cannot exceed total experience", {
        fields: { current: current.toString(), total: this.total.toString() },
      });
    }
    // Validate new values with Zod before creating new instance
    return new Experience(
      ExperienceDataSchema.parse({
        current,
        total: this.total,
      })
    );
  }
}
