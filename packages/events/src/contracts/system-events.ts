import { z } from "zod";
import { BaseEventSchema } from "./base-event";

/**
 * Health check ping.
 * Channel: realm:system:health:ping
 *
 * @remarks
 * Published by monitoring/health check systems to verify app availability.
 * Apps subscribe and respond with a pong event.
 *
 * @example
 * ```typescript
 * const requestId = uuidv4();
 *
 * await client.publish(Channels.SYSTEM_HEALTH_PING, HealthCheckPingSchema, {
 *   type: "system:health:ping",
 *   data: { requestId },
 * });
 * ```
 */
export const HealthCheckPingSchema = BaseEventSchema.extend({
  type: z.literal("system:health:ping"),
  data: z.object({
    /** Unique request ID to match with pong response */
    requestId: z.string().uuid(),
  }),
});

export type HealthCheckPing = z.infer<typeof HealthCheckPingSchema>;

/**
 * Health check pong response.
 * Channel: realm:system:health:pong
 *
 * @remarks
 * Apps publish this in response to health:ping events.
 * The `requestId` field matches the corresponding ping event.
 *
 * Apps can identify themselves with the `appName` field (optional but recommended).
 *
 * @example
 * ```typescript
 * client.subscribe(Channels.SYSTEM_HEALTH_PING, HealthCheckPingSchema, async (event) => {
 *   await client.publish(Channels.SYSTEM_HEALTH_PONG, HealthCheckPongSchema, {
 *     type: "system:health:pong",
 *     data: {
 *       requestId: event.data.requestId,
 *       appName: "api",
 *       uptime: process.uptime(),
 *     },
 *   });
 * });
 * ```
 */
export const HealthCheckPongSchema = BaseEventSchema.extend({
  type: z.literal("system:health:pong"),
  data: z.object({
    /** Matches ping requestId */
    requestId: z.string().uuid(),

    /** App/service name (optional but recommended) */
    appName: z.string(),

    /** Uptime in seconds */
    uptime: z.int(),
  }),
});

export type HealthCheckPong = z.infer<typeof HealthCheckPongSchema>;

/**
 * Graceful shutdown signal.
 * Channel: realm:system:shutdown
 *
 * @remarks
 * Published by orchestration systems (Kubernetes, Docker, process managers)
 * to signal apps to gracefully shut down.
 *
 * Apps should:
 * 1. Stop accepting new requests
 * 2. Finish processing current requests
 * 3. Disconnect from Redis
 * 4. Exit within the grace period
 *
 * @example
 * ```typescript
 * client.subscribe(Channels.SYSTEM_SHUTDOWN, ShutdownEventSchema, async (event) => {
 *   logger.info("Shutdown signal received", {
 *     fields: {
 *       reason: event.data.reason,
 *       gracePeriod: event.data.gracePeriodSeconds.toString(),
 *     },
 *   });
 *
 *   // Gracefully shut down
 *   await server.close();
 *   await client.disconnect();
 *   process.exit(0);
 * });
 * ```
 */
export const ShutdownEventSchema = BaseEventSchema.extend({
  type: z.literal("system:shutdown"),
  data: z.object({
    /** Reason for shutdown */
    reason: z.string(),

    /** Grace period in seconds before forced shutdown */
    gracePeriodSeconds: z.int(),
  }),
});

export type ShutdownEvent = z.infer<typeof ShutdownEventSchema>;

/**
 * Discriminated union of all system events.
 * Use this for pattern subscriptions (realm:system:*)
 */
export const SystemEventSchema = z.discriminatedUnion("type", [
  HealthCheckPingSchema,
  HealthCheckPongSchema,
  ShutdownEventSchema,
]);

export type SystemEvent = z.infer<typeof SystemEventSchema>;
