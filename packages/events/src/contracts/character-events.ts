import { z } from "zod";
import { Splat } from "@realm/common";
import { BaseEventSchema } from "./base-event";

/**
 * Published when a character is created.
 *
 * **Publishing Channels:**
 * - `realm:character:created:character:{characterId}` (specific character)
 * - `realm:character:created:guild:{guildId}` (if character is in a guild)
 * - `realm:character:created` (optional global broadcast)
 *
 * @example
 * ```typescript
 * import { buildCharacterChannel } from "@realm/events";
 *
 * // Publish to multiple channels for flexibility
 * const channels = [
 *   buildCharacterChannel("created", "character", "123"),
 *   buildCharacterChannel("created", "guild", "456"), // if guildId exists
 * ];
 *
 * for (const channel of channels) {
 *   await client.publish(channel, CharacterCreatedEventSchema, {
 *     type: "character:created",
 *     data: {
 *       characterId: 123,
 *       userId: "456789012345",
 *       guildId: "456",
 *       name: "Dracula",
 *       splat: Splats.Vampire5th,
 *     },
 *   });
 * }
 * ```
 */
export const CharacterCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal("character:created"),
  data: z.object({
    characterId: z.int().positive(),
    userId: z.string(), // Snowflake type
    guildId: z.string().optional(), // Snowflake type (null for guildless characters)
    name: z.string(),
    splat: Splat,
  }),
});

export type CharacterCreatedEvent = z.infer<typeof CharacterCreatedEventSchema>;

/**
 * Published when a character is updated.
 *
 * **Publishing Channels:**
 * - `realm:character:updated:character:{characterId}` (specific character)
 * - `realm:character:updated:guild:{guildId}` (if character is in a guild)
 * - `realm:character:updated` (optional global broadcast)
 *
 * @remarks
 * The `changedFields` array is optional but recommended for partial updates.
 * Subscribers can use it to optimize processing (e.g., only update specific UI components).
 *
 * @example
 * ```typescript
 * import { buildCharacterChannel } from "@realm/events";
 *
 * const channels = [
 *   buildCharacterChannel("updated", "character", "123"),
 *   buildCharacterChannel("updated", "guild", "456"),
 * ];
 *
 * for (const channel of channels) {
 *   await client.publish(channel, CharacterUpdatedEventSchema, {
 *     type: "character:updated",
 *     data: {
 *       characterId: 123,
 *       userId: "456789012345",
 *       guildId: "456",
 *       name: "Dracula",
 *       splat: Splats.Vampire5th,
 *       changedFields: ["hunger", "health"],
 *     },
 *   });
 * }
 * ```
 */
export const CharacterUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal("character:updated"),
  data: z.object({
    characterId: z.int().positive(),
    userId: z.string(),
    guildId: z.string().optional(),
    name: z.string(),
    splat: Splat,
    /** Optional: specific fields that changed (for partial updates) */
    changedFields: z.array(z.string()).optional(),
  }),
});

export type CharacterUpdatedEvent = z.infer<typeof CharacterUpdatedEventSchema>;

/**
 * Published when a character is deleted.
 *
 * **Publishing Channels:**
 * - `realm:character:deleted:character:{characterId}` (specific character)
 * - `realm:character:deleted:guild:{guildId}` (if character was in a guild)
 * - `realm:character:deleted` (optional global broadcast)
 *
 * @example
 * ```typescript
 * import { buildCharacterChannel } from "@realm/events";
 *
 * const channels = [
 *   buildCharacterChannel("deleted", "character", "123"),
 *   buildCharacterChannel("deleted", "guild", "456"),
 * ];
 *
 * for (const channel of channels) {
 *   await client.publish(channel, CharacterDeletedEventSchema, {
 *     type: "character:deleted",
 *     data: {
 *       characterId: 123,
 *       userId: "456789012345",
 *       guildId: "456",
 *       name: "Dracula",
 *     },
 *   });
 * }
 * ```
 */
export const CharacterDeletedEventSchema = BaseEventSchema.extend({
  type: z.literal("character:deleted"),
  data: z.object({
    characterId: z.int().positive(),
    userId: z.string(),
    guildId: z.string().optional(),
    name: z.string(),
  }),
});

export type CharacterDeletedEvent = z.infer<typeof CharacterDeletedEventSchema>;

/**
 * Published when a character changes guilds (joins, leaves, or transfers).
 *
 * **Publishing Channels:**
 * - `realm:character:guildChanged:character:{characterId}` (specific character)
 * - `realm:character:guildChanged:guild:{oldGuildId}` (if leaving a guild)
 * - `realm:character:guildChanged:guild:{newGuildId}` (if joining a guild)
 *
 * @remarks
 * Both `oldGuildId` and `newGuildId` can be undefined:
 * - `oldGuildId` undefined = character joining their first guild
 * - `newGuildId` undefined = character leaving a guild (becoming guildless)
 * - Both defined = character transferring between guilds
 *
 * @example
 * ```typescript
 * import { buildCharacterChannel } from "@realm/events";
 *
 * // Character leaving guild 456
 * await client.publish(
 *   buildCharacterChannel("guildChanged", "character", "123"),
 *   CharacterGuildChangedEventSchema,
 *   {
 *     type: "character:guildChanged",
 *     data: {
 *       characterId: 123,
 *       userId: "456789012345",
 *       name: "Dracula",
 *       oldGuildId: "456",
 *       newGuildId: undefined,
 *     },
 *   }
 * );
 *
 * // Publish to old guild's channel
 * await client.publish(
 *   buildCharacterChannel("guildChanged", "guild", "456"),
 *   CharacterGuildChangedEventSchema,
 *   { ... }
 * );
 * ```
 */
export const CharacterGuildChangedEventSchema = BaseEventSchema.extend({
  type: z.literal("character:guildChanged"),
  data: z.object({
    characterId: z.int().positive(),
    userId: z.string(),
    name: z.string(),
    oldGuildId: z.string().optional(),
    newGuildId: z.string().optional(),
  }),
});

export type CharacterGuildChangedEvent = z.infer<
  typeof CharacterGuildChangedEventSchema
>;

/**
 * Discriminated union of all character events.
 * Use this for pattern subscriptions (realm:character:*)
 *
 * @example
 * ```typescript
 * import { buildChannelPattern } from "@realm/events";
 *
 * // Subscribe to all character events in a specific guild
 * client.subscribePattern(
 *   buildChannelPattern("character", "*", "guild", "456"),
 *   CharacterEventSchema,
 *   (event) => {
 *     switch (event.type) {
 *       case "character:created":
 *         console.log("New character in guild:", event.data.name);
 *         break;
 *       case "character:updated":
 *         console.log("Character updated:", event.data.name);
 *         break;
 *       case "character:deleted":
 *         console.log("Character deleted:", event.data.name);
 *         break;
 *       case "character:guildChanged":
 *         console.log("Character guild changed:", event.data.name);
 *         break;
 *     }
 *   }
 * );
 * ```
 */
export const CharacterEventSchema = z.discriminatedUnion("type", [
  CharacterCreatedEventSchema,
  CharacterUpdatedEventSchema,
  CharacterDeletedEventSchema,
  CharacterGuildChangedEventSchema,
]);

export type CharacterEvent = z.infer<typeof CharacterEventSchema>;
