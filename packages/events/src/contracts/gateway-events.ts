import { z } from "zod";
import { BaseEventSchema } from "./base-event";

/**
 * Broadcast data to specific WebSocket clients.
 * Channel: realm:gateway:broadcast
 *
 * @remarks
 * Published by: Any app that wants to push data to web clients
 * Consumed by: API WebSocket gateway
 *
 * The gateway routes messages based on the `channel` field:
 * - `"user:{userId}"` - Broadcast to all connections for a specific user
 * - `"guild:{guildId}"` - Broadcast to all connections in a guild
 * - `"character:{characterId}"` - Broadcast to subscribers of a character
 *
 * Optional `connectionIds` array targets specific WebSocket connections only.
 *
 * @example
 * ```typescript
 * // Broadcast to all connections for a user
 * await client.publish(Channels.GATEWAY_BROADCAST, GatewayBroadcastEventSchema, {
 *   type: "gateway:broadcast",
 *   data: {
 *     channel: "user:456789012345",
 *     message: {
 *       type: "CHARACTER_UPDATED",
 *       payload: {
 *         characterId: 123,
 *         name: "Dracula",
 *         hunger: 3,
 *       },
 *     },
 *   },
 * });
 *
 * // Broadcast to specific connection
 * await client.publish(Channels.GATEWAY_BROADCAST, GatewayBroadcastEventSchema, {
 *   type: "gateway:broadcast",
 *   data: {
 *     channel: "user:456789012345",
 *     message: {
 *       type: "ROLL_RESULT",
 *       payload: rollResult,
 *     },
 *     connectionIds: ["conn-abc-123"],
 *   },
 * });
 * ```
 */
export const GatewayBroadcastEventSchema = BaseEventSchema.extend({
  type: z.literal("gateway:broadcast"),
  data: z.object({
    /** Target channel/room (e.g., "user:123456", "guild:789012", "character:42") */
    channel: z.string(),

    /** The message payload to send to WebSocket clients */
    message: z.object({
      /** Event type for frontend (e.g., "CHARACTER_UPDATED") */
      type: z.string(),

      /** Event payload - validated by frontend based on type */
      payload: z.unknown(),
    }),

    /** Optional: Target specific connection IDs only */
    connectionIds: z.array(z.string()).optional(),
  }),
});

export type GatewayBroadcastEvent = z.infer<typeof GatewayBroadcastEventSchema>;
