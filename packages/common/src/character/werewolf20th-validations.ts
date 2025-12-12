import { z } from "zod";

import { Core20thDataSchema } from "./character20th-validations";

// Werewolf20th specific schemas
export const Werewolf20thDataSchema = Core20thDataSchema.extend({
  tribe: z.string().max(50).nullable(),
  auspice: z.string().max(50).nullable(),
  breed: z.string().max(50).nullable(),
  rage: z.number().int().min(0).max(10),
  gnosis: z.number().int().min(0).max(10),
  glory: z.number().int().min(0).max(10),
  honor: z.number().int().min(0).max(10),
  wisdom: z.number().int().min(0).max(10),
  gifts: z.record(
    z.string(),
    z.object({
      name: z.string().max(50),
      description: z.string().max(1000),
      level: z.number().int().min(1).max(6),
      cost: z.string().max(50).optional(),
    })
  ),
});
