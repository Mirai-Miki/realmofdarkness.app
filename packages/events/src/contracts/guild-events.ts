import { z } from "zod";
import { BaseEventSchema } from "./base-event.js";

/**
 * Published when a guild is created (bot joins a new Discord server).
 *
 * **Publishing Channels:**
 * - `realm:guild:created:guild:{guildId}` (specific guild)
 * - `realm:guild:created` (optional global broadcast)
 *
 * @example
 * ```typescript
 * import { buildGuildChannel } from "@realm/events";
 *
 * await client.publish(
 *   buildGuildChannel("created", "123456789"),
 *   GuildCreatedEventSchema,
 *   {
 *     type: "guild:created",
 *     data: {
 *       guildId: "123456789",
 *       name: "My Server",
 *       ownerId: "987654321",
 *     },
 *   }
 * );
 * ```
 */
export const GuildCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal("guild:created"),
  data: z.object({
    guildId: z.string(), // Discord snowflake
    name: z.string(),
    ownerId: z.string(), // Discord snowflake
  }),
});

export type GuildCreatedEvent = z.infer<typeof GuildCreatedEventSchema>;

/**
 * Published when a guild is updated (name change, settings change, etc.).
 *
 * **Publishing Channels:**
 * - `realm:guild:updated:guild:{guildId}` (specific guild)
 * - `realm:guild:updated` (optional global broadcast)
 *
 * @example
 * ```typescript
 * import { buildGuildChannel } from "@realm/events";
 *
 * await client.publish(
 *   buildGuildChannel("updated", "123456789"),
 *   GuildUpdatedEventSchema,
 *   {
 *     type: "guild:updated",
 *     data: {
 *       guildId: "123456789",
 *       name: "My Renamed Server",
 *       changedFields: ["name"],
 *     },
 *   }
 * );
 * ```
 */
export const GuildUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal("guild:updated"),
  data: z.object({
    guildId: z.string(),
    name: z.string(),
    /** Optional: specific fields that changed (for partial updates) */
    changedFields: z.array(z.string()).optional(),
  }),
});

export type GuildUpdatedEvent = z.infer<typeof GuildUpdatedEventSchema>;

/**
 * Published when a guild is deleted (bot leaves/removed from Discord server).
 *
 * **Publishing Channels:**
 * - `realm:guild:deleted:guild:{guildId}` (specific guild)
 * - `realm:guild:deleted` (optional global broadcast)
 *
 * @example
 * ```typescript
 * import { buildGuildChannel } from "@realm/events";
 *
 * await client.publish(
 *   buildGuildChannel("deleted", "123456789"),
 *   GuildDeletedEventSchema,
 *   {
 *     type: "guild:deleted",
 *     data: {
 *       guildId: "123456789",
 *       name: "My Server",
 *     },
 *   }
 * );
 * ```
 */
export const GuildDeletedEventSchema = BaseEventSchema.extend({
  type: z.literal("guild:deleted"),
  data: z.object({
    guildId: z.string(),
    name: z.string(),
  }),
});

export type GuildDeletedEvent = z.infer<typeof GuildDeletedEventSchema>;

/**
 * Discriminated union of all guild events.
 * Use this for pattern subscriptions.
 *
 * @example
 * ```typescript
 * import { buildChannelPattern } from "@realm/events";
 *
 * // Subscribe to all events for a specific guild
 * client.subscribePattern(
 *   buildChannelPattern("guild", "*", "guild", "123456789"),
 *   GuildEventSchema,
 *   (event) => {
 *     switch (event.type) {
 *       case "guild:created":
 *         console.log("Guild created:", event.data.name);
 *         break;
 *       case "guild:updated":
 *         console.log("Guild updated:", event.data.name);
 *         break;
 *       case "guild:deleted":
 *         console.log("Guild deleted:", event.data.name);
 *         break;
 *     }
 *   }
 * );
 * ```
 */
export const GuildEventSchema = z.discriminatedUnion("type", [
  GuildCreatedEventSchema,
  GuildUpdatedEventSchema,
  GuildDeletedEventSchema,
]);

export type GuildEvent = z.infer<typeof GuildEventSchema>;
