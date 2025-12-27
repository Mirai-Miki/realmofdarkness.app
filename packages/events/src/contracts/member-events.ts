import { z } from "zod";
import { BaseEventSchema } from "./base-event";

/**
 * Published when a member joins a guild (user-guild relationship created).
 *
 * **Publishing Channels:**
 * - `realm:member:created:guild:{guildId}` (all members in guild)
 * - `realm:member:created:guild:{guildId}:member:{userId}` (specific member)
 *
 * @remarks
 * Members represent the many-to-many relationship between users and guilds.
 * A user can be a member of multiple guilds.
 *
 * @example
 * ```typescript
 * import { buildMemberChannel } from "@realm/events";
 *
 * // Publish to guild channel (staff viewing guild page)
 * await client.publish(
 *   buildMemberChannel("created", "123456789"),
 *   MemberCreatedEventSchema,
 *   {
 *     type: "member:created",
 *     data: {
 *       userId: "987654321",
 *       guildId: "123456789",
 *       nickname: "DraculaPlayer",
 *     },
 *   }
 * );
 *
 * // Also publish to specific member channel
 * await client.publish(
 *   buildMemberChannel("created", "123456789", "987654321"),
 *   MemberCreatedEventSchema,
 *   { ... }
 * );
 * ```
 */
export const MemberCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal("member:created"),
  data: z.object({
    userId: z.string(), // Discord snowflake
    guildId: z.string(), // Discord snowflake
    nickname: z.string().optional(),
  }),
});

export type MemberCreatedEvent = z.infer<typeof MemberCreatedEventSchema>;

/**
 * Published when a member is updated (nickname change, role change, etc.).
 *
 * **Publishing Channels:**
 * - `realm:member:updated:guild:{guildId}` (all members in guild)
 * - `realm:member:updated:guild:{guildId}:member:{userId}` (specific member)
 *
 * @example
 * ```typescript
 * import { buildMemberChannel } from "@realm/events";
 *
 * await client.publish(
 *   buildMemberChannel("updated", "123456789", "987654321"),
 *   MemberUpdatedEventSchema,
 *   {
 *     type: "member:updated",
 *     data: {
 *       userId: "987654321",
 *       guildId: "123456789",
 *       nickname: "NewNickname",
 *       changedFields: ["nickname"],
 *     },
 *   }
 * );
 * ```
 */
export const MemberUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal("member:updated"),
  data: z.object({
    userId: z.string(),
    guildId: z.string(),
    nickname: z.string().optional(),
    /** Optional: specific fields that changed (for partial updates) */
    changedFields: z.array(z.string()).optional(),
  }),
});

export type MemberUpdatedEvent = z.infer<typeof MemberUpdatedEventSchema>;

/**
 * Published when a member leaves a guild (user-guild relationship deleted).
 *
 * **Publishing Channels:**
 * - `realm:member:deleted:guild:{guildId}` (all members in guild)
 * - `realm:member:deleted:guild:{guildId}:member:{userId}` (specific member)
 *
 * @example
 * ```typescript
 * import { buildMemberChannel } from "@realm/events";
 *
 * await client.publish(
 *   buildMemberChannel("deleted", "123456789"),
 *   MemberDeletedEventSchema,
 *   {
 *     type: "member:deleted",
 *     data: {
 *       userId: "987654321",
 *       guildId: "123456789",
 *     },
 *   }
 * );
 * ```
 */
export const MemberDeletedEventSchema = BaseEventSchema.extend({
  type: z.literal("member:deleted"),
  data: z.object({
    userId: z.string(),
    guildId: z.string(),
  }),
});

export type MemberDeletedEvent = z.infer<typeof MemberDeletedEventSchema>;

/**
 * Discriminated union of all member events.
 * Use this for pattern subscriptions.
 *
 * @example
 * ```typescript
 * import { buildChannelPattern } from "@realm/events";
 *
 * // Subscribe to all member events in a specific guild
 * client.subscribePattern(
 *   buildChannelPattern("member", "*", "guild", "123456789"),
 *   MemberEventSchema,
 *   (event) => {
 *     switch (event.type) {
 *       case "member:created":
 *         console.log("Member joined guild:", event.data.userId);
 *         break;
 *       case "member:updated":
 *         console.log("Member updated:", event.data.userId);
 *         break;
 *       case "member:deleted":
 *         console.log("Member left guild:", event.data.userId);
 *         break;
 *     }
 *   }
 * );
 * ```
 */
export const MemberEventSchema = z.discriminatedUnion("type", [
  MemberCreatedEventSchema,
  MemberUpdatedEventSchema,
  MemberDeletedEventSchema,
]);

export type MemberEvent = z.infer<typeof MemberEventSchema>;
