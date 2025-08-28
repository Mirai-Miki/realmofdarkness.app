import { z } from "zod";

import { Core20thDataSchema } from "./character20th_validations";
// Human20th specific schemas
export const Human20thDataSchema = Core20thDataSchema.extend({
  morality_name: z.string().min(1).max(50).default("Humanity"),
  morality_value: z.number().int().min(0).max(10).default(7),
});
