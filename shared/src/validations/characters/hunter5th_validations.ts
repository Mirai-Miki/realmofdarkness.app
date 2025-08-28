import { z } from "zod";

import { Core5thDataSchema } from "./character5th_validations.js";

// Hunter5th specific schemas
export const Hunter5thDataSchema = Core5thDataSchema.extend({
  desperation: z.number().int().min(0).max(10),
  danger: z.number().int().min(0).max(10),
  despair: z.number().int().min(0).max(10),
});
