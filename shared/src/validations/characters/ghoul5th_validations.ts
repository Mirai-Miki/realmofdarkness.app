import { z } from "zod";

import {
  Core5thDataSchema,
  Humanity5thSchema,
} from "./character5th_validations.js";

// Ghoul5th specific schemas
export const Ghoul5thDataSchema = Core5thDataSchema.extend({
  humanity: Humanity5thSchema,
  bond_rating: z.number().int().min(0).max(5),
  domitor: z.string().max(100).optional(),
});
