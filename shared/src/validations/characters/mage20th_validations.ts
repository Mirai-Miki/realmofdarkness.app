import { z } from "zod";

import { Core20thDataSchema } from "./character20th_validations.js";
// Mage20th specific schemas
export const Mage20thDataSchema = Core20thDataSchema.extend({
  tradition: z.string().max(50).nullable(),
  essence: z.string().max(50).nullable(),
  arete: z.number().int().min(0).max(10),
  avatar: z.number().int().min(0).max(10),
  quintessence: z.number().int().min(0).max(20),
  paradox: z.number().int().min(0).max(20),
  spheres: z.record(
    z.string(),
    z.object({
      name: z.string().max(50),
      level: z.number().int().min(0).max(5),
    })
  ),
});
