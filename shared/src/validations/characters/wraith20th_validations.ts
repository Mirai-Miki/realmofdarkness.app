import { z } from "zod";

import { Core20thDataSchema } from "./character20th_validations";

// Wraith20th specific schemas
export const Wraith20thDataSchema = Core20thDataSchema.extend({
  guild: z.string().max(50).nullable(),
  legion: z.string().max(50).nullable(),
  corpus: z.number().int().min(0).max(10),
  pathos: z.number().int().min(0).max(10),
  angst: z.number().int().min(0).max(10),
  arcanoi: z.record(
    z.string(),
    z.object({
      name: z.string().max(50),
      level: z.number().int().min(0).max(5),
      description: z.string().max(1000).optional(),
    })
  ),
});
