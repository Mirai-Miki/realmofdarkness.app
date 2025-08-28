import {
  Core5thDataSchema,
  Humanity5thSchema,
} from "./character5th-validations";

// Human5th specific schemas
export const Human5thDataSchema = Core5thDataSchema.extend({
  humanity: Humanity5thSchema,
});
