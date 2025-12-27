import type {
  Character20thData,
  ICharacter20th,
  IHealthTracker20th,
  IWillpowerTracker20th,
  Wod20AttributesData,
  Wod20SkillsData,
} from "@realm/common";

import { Character } from "./character.entity";
import { HealthTracker20th } from "./value-objects/health-tracker-20th.vo";
import { WillpowerTracker20th } from "./value-objects/willpower-tracker-20th.vo";

/**
 * Base Character20th entity.
 * Contains shared 20th Anniversary Edition mechanics.
 *
 * @remarks
 * This class provides the foundation for all 20th Anniversary game systems:
 * - Vampire: The Masquerade 20th Anniversary
 * - Werewolf: The Apocalypse 20th Anniversary
 * - Mage: The Ascension 20th Anniversary
 * - Changeling: The Dreaming 20th Anniversary
 * - Wraith: The Oblivion 20th Anniversary
 *
 * Common 20th Anniversary mechanics:
 * - Bashing/Lethal/Aggravated damage tracking
 * - 9 Attributes with specialties
 * - Skills (Talents/Skills/Knowledges) with specialties
 * - Willpower (current/total)
 *
 * This entity trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export abstract class Character20th
  extends Character
  implements ICharacter20th
{
  protected _health: IHealthTracker20th;
  protected _willpower: IWillpowerTracker20th;
  protected _attributes: Wod20AttributesData;
  protected _skills: Wod20SkillsData;

  constructor(data: Character20thData) {
    // Trust the data - already validated at boundary
    super(data);

    // Initialize from actual Data
    this._health = new HealthTracker20th(data.health);
    this._willpower = new WillpowerTracker20th(data.willpower);
    this._attributes = data.attributes;
    this._skills = data.skills;
  }

  // ============================================================================
  // 20th Anniversary Mechanics
  // ============================================================================

  get health(): IHealthTracker20th {
    return this._health;
  }

  get willpower(): IWillpowerTracker20th {
    return this._willpower;
  }

  get attributes(): Wod20AttributesData {
    return this._attributes;
  }

  get skills(): Wod20SkillsData {
    return this._skills;
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  override toData(): Character20thData {
    return {
      ...super.toData(),
      health: {
        total: this._health.total,
        bashing: this._health.bashing,
        lethal: this._health.lethal,
        aggravated: this._health.aggravated,
      },
      willpower: {
        total: this._willpower.total,
        current: this._willpower.current,
      },
      attributes: this._attributes,
      skills: this._skills,
    };
  }
}
