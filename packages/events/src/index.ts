/**
 * @realm/events - Redis Event System
 *
 * Type-safe, app-agnostic event system for real-time communication between
 * API, Discord bot shards, web clients, and future apps.
 *
 * @example
 * ```typescript
 * import { RedisEventClient, Channels, CharacterUpdatedEventSchema } from "@realm/events";
 *
 * // Create client (uses REDIS_URL env var by default)
 * const client = new RedisEventClient();
 *
 * // Subscribe to events (automatically filters own events)
 * client.subscribe(
 *   Channels.CHARACTER_UPDATED,
 *   CharacterUpdatedEventSchema,
 *   async (event) => {
 *     console.log("Character updated:", event.data.name);
 *   }
 * );
 *
 * // Publish events
 * await client.publish(Channels.CHARACTER_UPDATED, CharacterUpdatedEventSchema, {
 *   type: "character:updated",
 *   data: {
 *     characterId: 123,
 *     userId: "456789012345",
 *     name: "Dracula",
 *     splat: Splats.Vampire5th,
 *   },
 * });
 * ```
 *
 * @packageDocumentation
 */

// Export client
export * from "./client/index";

// Export channels
export * from "./channels/index";

// Export contracts (includes event metadata)
export * from "./contracts/index";
