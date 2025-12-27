import type { IExperience, ExperienceData } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Experience value object.
 * Immutable - all operations return new instances.
 *
 * @remarks
 * This is a value object, meaning it's defined by its values rather than
 * an identity. Two Experience objects with the same current/total are
 * considered equal.
 *
 * This VO trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export class Experience implements IExperience {
  readonly current: number;
  readonly total: number;

  constructor(data: ExperienceData) {
    this.current = data.current;
    this.total = data.total;
  }

  canAfford(cost: number): boolean {
    return this.current >= cost;
  }

  spend(cost: number): IExperience {
    if (!this.canAfford(cost)) {
      // This should never happen if caller checks canAfford first
      throw new RealmError(
        "Attempted to spend more experience than available",
        {
          fields: {
            cost: cost.toString(),
            current: this.current.toString(),
          },
        }
      );
    }

    return new Experience({
      current: this.current - cost,
      total: this.total,
    });
  }

  award(amount: number): IExperience {
    if (amount < 0) {
      throw new RealmError("Attempted to award negative experience", {
        fields: { amount: amount.toString() },
      });
    }

    return new Experience({
      current: this.current + amount,
      total: this.total + amount,
    });
  }

  setTotal(total: number): IExperience {
    if (total < 0) {
      throw new RealmError("Attempted to set negative total experience", {
        fields: { total: total.toString() },
      });
    }

    return new Experience({
      current: Math.min(this.current, total),
      total,
    });
  }

  setCurrent(current: number): IExperience {
    if (current < 0 || current > this.total) {
      throw new RealmError(
        "Attempted to set current experience to invalid value",
        {
          fields: {
            current: current.toString(),
            total: this.total.toString(),
          },
        }
      );
    }

    return new Experience({
      current,
      total: this.total,
    });
  }

  toData(): ExperienceData {
    return {
      current: this.current,
      total: this.total,
    };
  }
}
