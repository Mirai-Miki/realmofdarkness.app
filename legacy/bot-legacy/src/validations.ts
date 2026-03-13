import { z } from "zod";

// Zod schemas for runtime validation
export const BotCommandSchema = z.object({
  data: z.object({
    name: z.string(),
    description: z.string().optional(),
  }),
  execute: z.function(),
});

export const BotComponentSchema = z.object({
  name: z.string(),
  execute: z.function(),
});

export const BotEventSchema = z.object({
  name: z.string(),
  execute: z.function(),
  once: z.boolean().optional(),
});
