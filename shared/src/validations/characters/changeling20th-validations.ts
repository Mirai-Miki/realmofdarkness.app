import { z } from "zod";
import { Core20thDataSchema } from "./character20th-validations";
// Changeling20th specific schemas
export const Changeling20thDataSchema = Core20thDataSchema.extend({
  court: z.string().max(50).nullable(),
  seeming: z.string().max(50).nullable(),
  kith: z.string().max(50).nullable(),
  glamour: z.number().int().min(0).max(10),
  banality: z.number().int().min(0).max(10),
  nightmare: z.number().int().min(0).max(10),
  arts: z.record(
    z.string(),
    z.object({
      name: z.string().max(50),
      description: z.string().max(1000),
      level: z.number().int().min(0).max(5),
      realms: z.array(z.string()),
    })
  ),
});
