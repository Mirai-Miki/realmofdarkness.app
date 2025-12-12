/**
 * Core enumerations for the Realm of Darkness application.
 * These enums are used across all packages and define shared constants.
 *
 * @packageDocumentation
 */

export { HttpStatus } from "../primitives/http-status.enum.js";

/**
 * Character sheet status.
 * Represents the lifecycle state of a character sheet.
 */
export enum SheetStatus {
  /** Draft character, not yet ready for play */
  Draft = "Draft",
  /** Character under review by Storyteller */
  Review = "Review",
  /** Active character in play */
  Active = "Active",
  /** Character has died */
  Dead = "Dead",
  /** Archived character (inactive) */
  Archive = "Archive",
}

/**
 * Character splats (types).
 * Defines all supported character types across V5, V20, and Chronicles of Darkness.
 */
export enum Splats {
  // 5th Edition
  Vampire5th = "vampire5th",
  Hunter5th = "hunter5th",
  Werewolf5th = "werewolf5th",
  Human5th = "human5th",
  Ghoul5th = "ghoul5th",

  // 20th Anniversary Edition
  Vampire20th = "vampire20th",
  Werewolf20th = "werewolf20th",
  Changeling20th = "changeling20th",
  Mage20th = "mage20th",
  Demon20th = "demon20th",
  Wraith20th = "wraith20th",
  Human20th = "human20th",
  Ghoul20th = "ghoul20th",
}
