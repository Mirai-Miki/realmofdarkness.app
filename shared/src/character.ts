export const enum Splats {
  Vampire5th = "vampire5th",
  Hunter5th = "hunter5th",
  Werewolf5th = "werewolf5th",
  Human5th = "human5th",
  Ghoul5th = "ghoul5th",
  Vampire20th = "vampire20th",
  Werewolf20th = "werewolf20th",
  Changeling20th = "changeling20th",
  Mage20th = "mage20th",
  Demon20th = "demon20th",
  Wraith20th = "wraith20th",
  Human20th = "human20th",
  Ghoul20th = "ghoul20th",
}

export interface Experiance {
  current: number;
  total: number;
}

export interface ExperianceSpend {
  name: string;
  cost: number;
}

export type ExperianceSpends = Array<ExperianceSpend>;

/**
 * 20th edition Attribute with optional specialties
 */
export interface Attribute20th {
  value: number; // 0-10
  specialties?: string[];
}

/**
 * 5th edition Attribute (no specialties)
 */
export interface Attribute5th {
  value: number; // 1-5
}

/**
 * 20th edition Skill with optional specialties
 */
export interface Skill20th {
  value: number; // 0-10
  specialties?: string[];
}

/**
 * 5th edition Skill with optional specialties
 */
export interface Skill5th {
  value: number; // 0-5
  specialties?: string[];
}

/**
 * 20th edition Attributes structure
 */
export interface Attributes20th {
  // Physical
  strength: Attribute20th;
  dexterity: Attribute20th;
  stamina: Attribute20th;
  // Social
  charisma: Attribute20th;
  manipulation: Attribute20th;
  appearance: Attribute20th;
  // Mental
  perception: Attribute20th;
  intelligence: Attribute20th;
  wits: Attribute20th;
}

/**
 * 5th edition Attributes structure
 */
export interface Attributes5th {
  // Physical
  strength: Attribute5th;
  dexterity: Attribute5th;
  stamina: Attribute5th;
  // Social
  charisma: Attribute5th;
  manipulation: Attribute5th;
  composure: Attribute5th;
  // Mental
  intelligence: Attribute5th;
  wits: Attribute5th;
  resolve: Attribute5th;
}

/**
 * 20th edition Skills structure
 */
export interface Skills20th {
  // Talents
  alertness: Skill20th;
  athletics: Skill20th;
  awareness: Skill20th;
  brawl: Skill20th;
  empathy: Skill20th;
  expression: Skill20th;
  intimidation: Skill20th;
  leadership: Skill20th;
  streetwise: Skill20th;
  subterfuge: Skill20th;
  // Skills
  animal_ken: Skill20th;
  crafts: Skill20th;
  drive: Skill20th;
  etiquette: Skill20th;
  firearms: Skill20th;
  larceny: Skill20th;
  melee: Skill20th;
  performance: Skill20th;
  stealth: Skill20th;
  survival: Skill20th;
  // Knowledges
  academics: Skill20th;
  computer: Skill20th;
  finance: Skill20th;
  investigation: Skill20th;
  law: Skill20th;
  medicine: Skill20th;
  occult: Skill20th;
  politics: Skill20th;
  science: Skill20th;
  technology: Skill20th;
}

/**
 * 5th edition Skills structure
 */
export interface Skills5th {
  // Physical
  athletics: Skill5th;
  brawl: Skill5th;
  craft: Skill5th;
  drive: Skill5th;
  firearms: Skill5th;
  larceny: Skill5th;
  melee: Skill5th;
  stealth: Skill5th;
  survival: Skill5th;
  // Social
  animal_ken: Skill5th;
  etiquette: Skill5th;
  insight: Skill5th;
  intimidation: Skill5th;
  leadership: Skill5th;
  performance: Skill5th;
  persuasion: Skill5th;
  streetwise: Skill5th;
  subterfuge: Skill5th;
  // Mental
  academics: Skill5th;
  awareness: Skill5th;
  finance: Skill5th;
  investigation: Skill5th;
  medicine: Skill5th;
  occult: Skill5th;
  politics: Skill5th;
  science: Skill5th;
  technology: Skill5th;
}

export interface DamageTracker5th {
  total: number; // 2-20
  superficial: number;
  aggravated: number;
  // Superficial + aggravated <= total
}

export interface DamageTracker20th {
  total: number; // 7-15
  bashing: number;
  lethal: number;
  aggravated: number;
  // bashing + lethal + aggravated <= total
}

export interface Willpower20th {
  total: number; // 0-10
  current: number; // current <= total
}

export interface Humanity5th {
  current: number; // 0-10
  stains: number; // 0-10 cannot be more then (10 - current)
}

export type AdvantageTypes =
  | "Merit"
  | "Background"
  | "Flaw"
  | "Haven"
  | "Loresheet";

export interface Advantage {
  name: string;
  type: AdvantageTypes;
  description: string;
  level: number; // 0-5
  flaw: boolean;
}

export type Advantages = Record<string, Advantage>;

export interface HavenDetails {
  name: string;
  location: string;
  description: string;
}

export type HexColor = `#${string}`;

export interface CoreData {
  avatar: string;
  embedColor: HexColor;
  experiance: Experiance;
  expSpends: ExperianceSpends;
  storytellerLock: boolean;

  dataOfBirth: string;
  age: string;
  history: string;
  appearanceDescription: string;
  notes: string;
  notes2: string;
}

export interface Core5thData extends CoreData {
  willpower: DamageTracker5th;
  health: DamageTracker5th;
  attributes: Attributes5th;
  skills: Skills5th;
  ambition: string;
  desire: string;
  convictions: string;
  touchstones: string;
  tenets: string;
  havens: HavenDetails[];
  advantages: Advantages;
}

export interface Vampire5thData extends Core5thData {
  humanity: Humanity5th;
  hunger: number; // 0-5
  bloodPotency: number; // 0-5
  predatorType: string | null;
  clan: string | null;
  sire: string | null;
  generation: number | null;
  huntingRoll: string | null;
  data_of_death: string | null;
  apparent_age: string | null;
}
