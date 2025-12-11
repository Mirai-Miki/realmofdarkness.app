import { z } from "zod";
import { BaseEventSchema } from "./base-event.js";

/**
 * Request bot to post a message to Discord.
 * Channel: realm:discord:message:request
 *
 * @remarks
 * Published by: API (or any app that wants to post to Discord)
 * Consumed by: Discord bot
 *
 * The bot receives this event and posts the message to the specified channel.
 * Content follows discord.js format (text, embeds, components).
 *
 * @example
 * ```typescript
 * await client.publish(Channels.DISCORD_MESSAGE_REQUEST, DiscordMessageRequestSchema, {
 *   type: "discord:message:request",
 *   data: {
 *     guildId: "123456789012345678",
 *     channelId: "987654321098765432",
 *     content: {
 *       text: "🎲 Roll result: 4 successes",
 *       embeds: [{
 *         title: "Dice Roll",
 *         description: "Rolled 6 dice",
 *         color: 0x00ff00,
 *       }],
 *     },
 *   },
 * });
 * ```
 */
export const DiscordMessageRequestSchema = BaseEventSchema.extend({
  type: z.literal("discord:message:request"),
  data: z.object({
    /** Guild (server) snowflake ID */
    guildId: z.string(),

    /** Channel snowflake ID */
    channelId: z.string(),

    /** Message content (discord.js format) */
    content: z.object({
      /** Plain text message */
      text: z.string().optional(),

      /** Discord embeds (rich formatted messages) */
      embeds: z.array(z.unknown()).optional(),

      /** Discord components (buttons, select menus, etc.) */
      components: z.array(z.unknown()).optional(),
    }),

    /** Optional: Reply to a specific message */
    replyToMessageId: z.string().optional(),
  }),
});

export type DiscordMessageRequest = z.infer<typeof DiscordMessageRequestSchema>;
