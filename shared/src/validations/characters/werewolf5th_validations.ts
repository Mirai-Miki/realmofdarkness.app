import { z } from "zod";

import { Core5thDataSchema } from "./character5th_validations";

// Werewolf5th specific schemas
export const Werewolf5thDataSchema = Core5thDataSchema.extend({
  rage: z.number().int().min(0).max(5),
  tribe: z.string().max(50).nullable(),
  auspice: z.string().max(50).nullable(),
  glory: z.number().int().min(0).max(5),
  honor: z.number().int().min(0).max(5),
  wisdom: z.number().int().min(0).max(5),
  gifts: z.record(
    z.string(),
    z.object({
      name: z.string().max(50),
      description: z.string().max(1000),
      level: z.number().int().min(1).max(5),
      cost: z.string().max(50).optional(),
      dice_pool: z.string().max(200).optional(),
    })
  ),
});
