import { z } from "zod";

import { Core20thDataSchema } from "./character20th_validations.js";

// Demon20th specific schemas
export const Demon20thDataSchema = Core20thDataSchema.extend({
  house: z.string().max(50).nullable(),
  faction: z.string().max(50).nullable(),
  torment: z.number().int().min(0).max(10),
  faith: z.number().int().min(0).max(10),
  lores: z.record(
    z.string(),
    z.object({
      name: z.string().max(50),
      level: z.number().int().min(0).max(5),
      description: z.string().max(1000).optional(),
    })
  ),
});
