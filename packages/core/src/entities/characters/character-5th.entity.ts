import type {
  Character5thData,
  ICharacter5th,
  IDamageTracker5th,
  Wod5AttributesData,
  Wod5SkillsData,
} from "@realm/common";

import { Character5thDataSchema } from "@realm/common";
import { Character } from "./character.entity";
import { DamageTracker5th } from "./value-objects/damage-tracker-5th.vo";

/**
 * Base Character5th entity.
 * Contains shared 5th Edition mechanics (V5, H5, W5).
 *
 * @remarks
 * This class provides the foundation for all 5th Edition game systems:
 * - Vampire: The Masquerade 5th Edition
 * - Hunter: The Reckoning 5th Edition
 * - Werewolf: The Apocalypse 5th Edition
 *
 * Common 5th Edition mechanics:
 * - Superficial/Aggravated damage tracking
 * - 9 Attributes (Strength, Dexterity, Stamina, Charisma, Manipulation, Composure, Intelligence, Wits, Resolve)
 * - Skills with specialties
 */
export abstract class Character5th extends Character implements ICharacter5th {
  protected _health: IDamageTracker5th;
  protected _willpower: IDamageTracker5th;
  protected _attributes: Wod5AttributesData;
  protected _skills: Wod5SkillsData;

  constructor(data: Character5thData) {
    // Validate with Zod schema
    const validated = Character5thDataSchema.parse(data);
    super(validated);

    // Initialize from actual Data
    this._health = new DamageTracker5th(validated.health);
    this._willpower = new DamageTracker5th(validated.willpower);
    this._attributes = validated.attributes;
    this._skills = validated.skills;
  }

  // ============================================================================
  // 5th Edition Mechanics
  // ============================================================================

  get health(): IDamageTracker5th {
    return this._health;
  }

  get willpower(): IDamageTracker5th {
    return this._willpower;
  }

  get attributes(): Wod5AttributesData {
    return this._attributes;
  }

  get skills(): Wod5SkillsData {
    return this._skills;
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  override toData(): Character5thData {
    return {
      ...super.toData(),
      health: {
        total: this._health.total,
        superficial: this._health.superficial,
        aggravated: this._health.aggravated,
      },
      willpower: {
        total: this._willpower.total,
        superficial: this._willpower.superficial,
        aggravated: this._willpower.aggravated,
      },
      attributes: this._attributes,
      skills: this._skills,
    };
  }
}
