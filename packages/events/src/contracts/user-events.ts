import { z } from "zod";
import { BaseEventSchema } from "./base-event.js";

/**
 * Published when a user's profile is updated.
 *
 * **Publishing Channels:**
 * - `realm:user:updated:user:{userId}` (specific user)
 * - `realm:user:updated` (optional global broadcast)
 *
 * @remarks
 * User events represent changes to the Discord user's global profile
 * (username, avatar, etc.) or application-specific data (supporter tier, settings).
 *
 * @example
 * ```typescript
 * import { buildUserChannel } from "@realm/events";
 *
 * await client.publish(
 *   buildUserChannel("updated", "123456789"),
 *   UserUpdatedEventSchema,
 *   {
 *     type: "user:updated",
 *     data: {
 *       userId: "123456789",
 *       username: "NewUsername",
 *       changedFields: ["username"],
 *     },
 *   }
 * );
 * ```
 */
export const UserUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal("user:updated"),
  data: z.object({
    userId: z.string(), // Discord snowflake
    username: z.string(),
    /** Optional: specific fields that changed (for partial updates) */
    changedFields: z.array(z.string()).optional(),
  }),
});

export type UserUpdatedEvent = z.infer<typeof UserUpdatedEventSchema>;

/**
 * Discriminated union of all user events (currently only "updated").
 * Use this for pattern subscriptions.
 *
 * @example
 * ```typescript
 * import { buildUserChannel } from "@realm/events";
 *
 * // Subscribe to updates for a specific user
 * client.subscribe(
 *   buildUserChannel("updated", "123456789"),
 *   UserUpdatedEventSchema,
 *   (event) => {
 *     console.log("User profile updated:", event.data.username);
 *   }
 * );
 * ```
 */
export const UserEventSchema = z.discriminatedUnion("type", [
  UserUpdatedEventSchema,
]);

export type UserEvent = z.infer<typeof UserEventSchema>;
