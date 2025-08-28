import { z } from "zod";

import { Core20thDataSchema } from "./character20th_validations";

// Ghoul20th specific schemas
export const Ghoul20thDataSchema = Core20thDataSchema.extend({
  morality_name: z.string().min(1).max(50).default("Humanity"),
  morality_value: z.number().int().min(0).max(10).default(7),
  bond_rating: z.number().int().min(0).max(5),
  domitor: z.string().max(100).optional(),
  // Limited disciplines for ghouls
  disciplines: z.record(
    z.string(),
    z.object({
      name: z.string().max(50),
      description: z.array(z.string()),
      level: z.number().int().min(0).max(3), // Ghouls limited to level 3
      powers: z.record(
        z.string(),
        z
          .object({
            name: z.string().max(50),
            description: z.string().max(1000),
            level: z.number().int().min(1).max(3),
            cost: z.string().max(50).optional(),
            dice_pool: z.string().max(200).optional(),
          })
          .nullable()
      ),
    })
  ),
});
