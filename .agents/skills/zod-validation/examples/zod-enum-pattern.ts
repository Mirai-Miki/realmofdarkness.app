import { z } from "zod";

// 1. Define the const object FIRST using `as const`
// NEVER use the `enum` keyword.
export const SupporterLevel = {
  Base: "base",
  Mortal: "mortal",
  Fledgling: "fledgling",
  Neonate: "neonate",
} as const;

// 2. Pass the object directly to z.enum()
// DO NOT use z.nativeEnum()
// DO NOT pass an array like ["base", "mortal"]
export const SupporterLevelSchema = z.enum(SupporterLevel);

// 3. Infer the TypeScript type
export type SupporterLevel = z.infer<typeof SupporterLevelSchema>;

// 4. Use the schema in a larger object
export const SupporterDataSchema = z.object({
  userId: z.string(),
  level: SupporterLevelSchema,
});
export type SupporterData = z.infer<typeof SupporterDataSchema>;
