/**
 * Supporter tier names.
 * Defines Patreon supporter levels.
 */

import { z } from "zod";

export const SupporterName = {
  Base: "Base",
  Mortal: "Mortal",
  Fledgling: "Fledgling",
  Neonate: "Neonate",
  Ancilla: "Ancilla",
  Elder: "Elder",
  Methuselah: "Methuselah",
  Antediluvian: "Antediluvian",
} as const;

export const SupporterNameSchema = z.enum(
  Object.values(SupporterName) as [string, ...string[]]
);

export type SupporterName = (typeof SupporterName)[keyof typeof SupporterName];
