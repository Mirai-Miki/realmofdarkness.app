/**
 * Emoji Asset Contracts
 *
 * Zod schemas and type definitions for emoji asset structures.
 * These contracts define the required structure for themed emoji sets.
 *
 * @module emoji-assets
 */

import { z } from "zod";

// ============================================================================
// Dice - V5 (Vampire 5th Edition)
// ============================================================================

/**
 * V5 Primary dice results (standard d10)
 * - crit: 10 (critical success)
 * - pass: 6-9 (success)
 * - fail: 1-5 (failure)
 */
export const V5PrimaryDiceSchema = z.object({
  crit: z.string(),
  pass: z.string(),
  fail: z.string(),
});
export type V5PrimaryDice = z.infer<typeof V5PrimaryDiceSchema>;

/**
 * V5 Secondary dice results (hunger dice)
 * - bestial: 1 on hunger die (bestial failure risk)
 * - crit: 10 on hunger die (messy critical risk)
 * - pass: 6-9 (success)
 * - fail: 2-5 (failure)
 */
export const V5SecondaryDiceSchema = z.object({
  bestial: z.string(),
  crit: z.string(),
  pass: z.string(),
  fail: z.string(),
});
export type V5SecondaryDice = z.infer<typeof V5SecondaryDiceSchema>;

/**
 * Complete V5 dice set (primary + secondary)
 */
export const V5DiceSetSchema = z.object({
  primary: V5PrimaryDiceSchema,
  secondary: V5SecondaryDiceSchema,
});
export type V5DiceSet = z.infer<typeof V5DiceSetSchema>;

/**
 * V5 themed variants (default, wod)
 */
export const V5DiceThemesSchema = z.object({
  default: V5DiceSetSchema,
  wod: V5DiceSetSchema,
});
export type V5DiceThemes = z.infer<typeof V5DiceThemesSchema>;

// ============================================================================
// Dice - W5 (Werewolf 5th Edition)
// ============================================================================

/**
 * W5 Secondary dice results (rage dice)
 * - brutal: 1 on rage die (brutal outcome risk)
 * - crit: 10 on rage die (critical)
 * - pass: 6-9 (success)
 * - fail: 2-5 (failure)
 */
export const W5SecondaryDiceSchema = z.object({
  brutal: z.string(),
  crit: z.string(),
  pass: z.string(),
  fail: z.string(),
});
export type W5SecondaryDice = z.infer<typeof W5SecondaryDiceSchema>;

/**
 * Complete W5 dice set (primary + secondary)
 * Primary uses same structure as V5
 */
export const W5DiceSetSchema = z.object({
  primary: V5PrimaryDiceSchema,
  secondary: W5SecondaryDiceSchema,
});
export type W5DiceSet = z.infer<typeof W5DiceSetSchema>;

/**
 * W5 themed variants (default, wod)
 */
export const W5DiceThemesSchema = z.object({
  default: W5DiceSetSchema,
  wod: W5DiceSetSchema,
});
export type W5DiceThemes = z.infer<typeof W5DiceThemesSchema>;

// ============================================================================
// Dice - H5 (Hunter 5th Edition)
// ============================================================================

/**
 * H5 Secondary dice results (desperation dice)
 * - choice: 1 on desperation die (devil's bargain)
 * - crit: 10 on desperation die (critical)
 * - pass: 6-9 (success)
 * - fail: 2-5 (failure)
 */
export const H5SecondaryDiceSchema = z.object({
  choice: z.string(),
  crit: z.string(),
  pass: z.string(),
  fail: z.string(),
});
export type H5SecondaryDice = z.infer<typeof H5SecondaryDiceSchema>;

/**
 * Complete H5 dice set (primary + secondary)
 * Primary uses same structure as V5
 */
export const H5DiceSetSchema = z.object({
  primary: V5PrimaryDiceSchema,
  secondary: H5SecondaryDiceSchema,
});
export type H5DiceSet = z.infer<typeof H5DiceSetSchema>;

/**
 * H5 themed variants (default, wod)
 */
export const H5DiceThemesSchema = z.object({
  default: H5DiceSetSchema,
  wod: H5DiceSetSchema,
});
export type H5DiceThemes = z.infer<typeof H5DiceThemesSchema>;

// ============================================================================
// Dice - WoD20 (World of Darkness 20th Anniversary)
// ============================================================================

/**
 * WoD20 pass dice (numbered 1-10)
 */
export const Wod20PassDiceSchema = z.object({
  "1": z.string(),
  "2": z.string(),
  "3": z.string(),
  "4": z.string(),
  "5": z.string(),
  "6": z.string(),
  "7": z.string(),
  "8": z.string(),
  "9": z.string(),
  "10": z.string(),
});
export type Wod20PassDice = z.infer<typeof Wod20PassDiceSchema>;

/**
 * WoD20 fail dice (numbered 1-10)
 */
export const Wod20FailDiceSchema = z.object({
  "1": z.string(),
  "2": z.string(),
  "3": z.string(),
  "4": z.string(),
  "5": z.string(),
  "6": z.string(),
  "7": z.string(),
  "8": z.string(),
  "9": z.string(),
  "10": z.string(),
});
export type Wod20FailDice = z.infer<typeof Wod20FailDiceSchema>;

/**
 * Complete WoD20 dice set (flat structure with numbered dice + nightmare)
 */
export const Wod20DiceSetSchema = z.object({
  pass: Wod20PassDiceSchema,
  fail: Wod20FailDiceSchema,
  nightmare: z.string(),
});
export type Wod20DiceSet = z.infer<typeof Wod20DiceSetSchema>;

/**
 * WoD20 themed variants (only default theme)
 */
export const Wod20DiceThemesSchema = z.object({
  default: Wod20DiceSetSchema,
});
export type Wod20DiceThemes = z.infer<typeof Wod20DiceThemesSchema>;

// ============================================================================
// Progress Bars
// ============================================================================

/**
 * Progress bar segment (left, middle, right)
 */
export const ProgressBarSegmentSchema = z.object({
  left: z.string(),
  middle: z.string(),
  right: z.string(),
});
export type ProgressBarSegment = z.infer<typeof ProgressBarSegmentSchema>;

/**
 * Progress bar set (filled and empty segments)
 */
export const ProgressBarSetSchema = z.object({
  filled: ProgressBarSegmentSchema,
  empty: ProgressBarSegmentSchema,
});
export type ProgressBarSet = z.infer<typeof ProgressBarSetSchema>;

/**
 * Progress bar color themes (green, red, yellow)
 */
export const ProgressBarThemesSchema = z.object({
  green: ProgressBarSetSchema,
  red: ProgressBarSetSchema,
  yellow: ProgressBarSetSchema,
});
export type ProgressBarThemes = z.infer<typeof ProgressBarThemesSchema>;

// ============================================================================
// Master Emojis Object Structure
// ============================================================================

/**
 * Complete dice collection structure
 */
export const DiceCollectionSchema = z.object({
  v5: V5DiceThemesSchema,
  w5: W5DiceThemesSchema,
  h5: H5DiceThemesSchema,
  wod20: Wod20DiceThemesSchema,
});
export type DiceCollection = z.infer<typeof DiceCollectionSchema>;

/**
 * Master Emojis object structure
 * This defines the complete shape of the auto-generated Emojis constant
 */
export const EmojisObjectSchema = z.object({
  dice: DiceCollectionSchema,
  progressBar: ProgressBarThemesSchema,
  // Additional categories can be added here as needed
  // tracker: TrackerSchema,
  // supporter: SupporterSchema,
  // logo: LogoSchema,
  // misc: MiscSchema,
});
export type EmojisObject = z.infer<typeof EmojisObjectSchema>;
