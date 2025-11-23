import { RealmError } from "@realm/errors";

/**
 * Value Object representing a character skill with rating and specialties.
 * Skills are rated 0-5, with optional specialties that provide bonuses.
 *
 * @remarks
 * This is an immutable value object - all modifications return a new instance.
 * Specialties are specific areas of expertise within a skill (e.g., "Firearms: Pistols").
 *
 * @example
 * ```typescript
 * const firearms = new Skill(3, ["Pistols", "Rifles"]);
 * const improved = firearms.setRating(4); // New instance with rating 4
 * const withSpec = firearms.addSpecialty("Shotguns"); // New instance with added specialty
 * ```
 */
export class Skill {
  /**
   * Creates a new Skill instance.
   *
   * @param rating - Skill rating (0-5)
   * @param specialties - Array of specialty names (default: empty array)
   * @throws {RealmError} If rating is invalid
   */
  constructor(
    public readonly rating: number,
    public readonly specialties: readonly string[] = []
  ) {
    this.validate();
  }

  /**
   * Creates a new Skill with rating 0 and no specialties.
   *
   * @returns New Skill instance
   */
  public static zero(): Skill {
    return new Skill(0, []);
  }

  /**
   * Creates a new Skill from a rating (no specialties).
   *
   * @param rating - Skill rating (0-5)
   * @returns New Skill instance
   */
  public static fromRating(rating: number): Skill {
    return new Skill(rating, []);
  }

  /**
   * Validates skill values.
   *
   * @throws {RealmError} If values are invalid
   * @private
   */
  private validate(): void {
    if (this.rating < 0 || this.rating > 5) {
      throw new RealmError("Skill rating must be between 0 and 5", {
        fields: { rating: this.rating.toString() },
      });
    }

    // Validate specialties are non-empty strings
    for (const spec of this.specialties) {
      if (!spec || spec.trim().length === 0) {
        throw new RealmError("Specialty cannot be empty");
      }
    }
  }

  /**
   * Checks if skill has any dots.
   *
   * @returns True if rating > 0
   */
  public get hasDots(): boolean {
    return this.rating > 0;
  }

  /**
   * Checks if skill has any specialties.
   *
   * @returns True if at least one specialty exists
   */
  public get hasSpecialties(): boolean {
    return this.specialties.length > 0;
  }

  /**
   * Checks if a specific specialty exists.
   *
   * @param specialty - Specialty name to check
   * @returns True if specialty exists (case-insensitive)
   */
  public hasSpecialty(specialty: string): boolean {
    return this.specialties.some(
      (s) => s.toLowerCase() === specialty.toLowerCase()
    );
  }

  /**
   * Creates a new Skill with a different rating.
   *
   * @param newRating - New skill rating (0-5)
   * @returns New Skill instance
   */
  public setRating(newRating: number): Skill {
    return new Skill(newRating, this.specialties);
  }

  /**
   * Creates a new Skill with an added specialty.
   *
   * @param specialty - Specialty name to add
   * @returns New Skill instance
   * @throws {RealmError} If specialty already exists
   */
  public addSpecialty(specialty: string): Skill {
    if (this.hasSpecialty(specialty)) {
      throw new RealmError("Specialty already exists", {
        fields: { specialty },
      });
    }

    return new Skill(this.rating, [...this.specialties, specialty]);
  }

  /**
   * Creates a new Skill with a removed specialty.
   *
   * @param specialty - Specialty name to remove
   * @returns New Skill instance
   * @throws {RealmError} If specialty doesn't exist
   */
  public removeSpecialty(specialty: string): Skill {
    const index = this.specialties.findIndex(
      (s) => s.toLowerCase() === specialty.toLowerCase()
    );

    if (index === -1) {
      throw new RealmError("Specialty not found", {
        fields: { specialty },
      });
    }

    const newSpecialties = [...this.specialties];
    newSpecialties.splice(index, 1);

    return new Skill(this.rating, newSpecialties);
  }

  /**
   * Creates a new Skill with replaced specialties.
   *
   * @param specialties - New array of specialties
   * @returns New Skill instance
   */
  public setSpecialties(specialties: string[]): Skill {
    return new Skill(this.rating, specialties);
  }

  /**
   * Serializes to plain object for storage.
   *
   * @returns Object with rating and specialties
   */
  public toJSON(): { rating: number; specialties: string[] } {
    return {
      rating: this.rating,
      specialties: [...this.specialties],
    };
  }

  /**
   * Creates Skill from serialized data.
   *
   * @param data - Serialized skill data
   * @returns New Skill instance
   */
  public static fromJSON(data: {
    rating: number;
    specialties?: string[];
  }): Skill {
    return new Skill(data.rating, data.specialties ?? []);
  }

  /**
   * Checks equality with another Skill instance.
   *
   * @param other - Another Skill instance
   * @returns True if rating and specialties match
   */
  public equals(other: Skill): boolean {
    if (this.rating !== other.rating) return false;
    if (this.specialties.length !== other.specialties.length) return false;

    // Check all specialties match (order-independent)
    return this.specialties.every((s) => other.hasSpecialty(s));
  }
}
