import { z } from "zod";

import { Core20thDataSchema } from "./character20th_validations.js";

// Vampire20th specific schemas
export const Vampire20thDataSchema = Core20thDataSchema.extend({
  clan: z.string().max(50).nullable(),
  clan_description: z.string().max(1000).optional(),
  sire: z.string().max(100).optional(),
  morality_name: z.string().min(1).max(50),
  morality_description: z.string().max(1000).optional(),
  morality_value: z.number().int().min(0).max(10),
  blood_total: z.number().int().min(0).max(50),
  blood_current: z.number().int().min(0).max(50),
  date_of_death: z.string().optional(),
  apparent_age: z.string().max(50).optional(),
  generation: z.number().int().min(1).max(15).optional(),
  // Disciplines for 20th edition
  disciplines: z.record(
    z.string(),
    z.object({
      name: z.string().max(50),
      description: z.array(z.string()),
      level: z.number().int().min(0).max(10),
      powers: z.record(
        z.string(),
        z
          .object({
            name: z.string().max(50),
            description: z.string().max(1000),
            level: z.number().int().min(1).max(10),
            cost: z.string().max(50).optional(),
            dice_pool: z.string().max(200).optional(),
            system: z.string().max(1000).optional(),
            duration: z.string().max(50).optional(),
          })
          .nullable()
      ),
    })
  ),
}).refine((data) => data.blood_current <= data.blood_total, {
  message: "Current blood pool cannot exceed total blood pool",
  path: ["blood_current"],
});
