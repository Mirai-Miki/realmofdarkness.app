import { z } from "zod";

/**
 * Standard metadata included in ALL events.
 * Automatically added by RedisEventClient.publish()
 *
 * @remarks
 * - `eventId`: UUID v7 for time-ordered events
 * - `publisherId`: UUID v4 unique to each client instance (enables self-filtering)
 * - `timestamp`: ISO 8601 timestamp when event was created
 * - `actorId`: Optional Snowflake ID of the user who triggered the event
 */
export const EventMetadataSchema = z.object({
  /** Unique event ID (UUID v7 for time-ordering) */
  eventId: z.uuid(),

  /** Unique publisher ID (UUID v4 per client instance) */
  publisherId: z.uuid(),

  /** ISO 8601 timestamp when event was created */
  timestamp: z.iso.datetime(),

  /** Optional: User/actor who triggered the event (Snowflake) */
  actorId: z.string().optional(),
});

export type EventMetadata = z.infer<typeof EventMetadataSchema>;

/**
 * Base schema all events must extend.
 *
 * @example
 * ```typescript
 * export const MyEventSchema = BaseEventSchema.extend({
 *   type: z.literal("my:event"),
 *   data: z.object({
 *     // event-specific data
 *   }),
 * });
 * ```
 */
export const BaseEventSchema = z.object({
  metadata: EventMetadataSchema,
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;
