/**
 * Channel naming convention: realm:<domain>:<action>[:<scope>:<id>]
 *
 * **Hierarchical Structure:**
 * - Prefix: `realm:` (namespace for this project)
 * - Domain: `character`, `guild`, `member`, `user`, `dice`, `gateway`, `discord`, `system`
 * - Action: `created`, `updated`, `deleted`, `guildChanged`, etc.
 * - Scope: Optional qualifier (e.g., `character:123`, `guild:456`, `user:789`)
 *
 * **Publishing:**
 * Always use the base channel names from the `Channels` constant.
 * The system automatically publishes to all relevant hierarchical channels.
 *
 * @example
 * ```typescript
 * import { Channels, buildCharacterChannel } from "@realm/events";
 *
 * // PUBLISHING: Use base channels
 * await client.publish(
 *   Channels.CHARACTER_UPDATED,  // Base channel
 *   CharacterUpdatedEventSchema,
 *   event,
 *   { characterId: "123", guildId: "456" }  // Scope determines fan-out
 * );
 * // System publishes to:
 * // - realm:character:updated (global)
 * // - realm:character:updated:character:123 (specific)
 * // - realm:character:updated:guild:456 (guild-scoped)
 *
 * // SUBSCRIBING: Use builder functions for scoped channels
 * client.subscribe(
 *   buildCharacterChannel("updated", "character", "123"),  // Specific character
 *   CharacterUpdatedEventSchema,
 *   handler
 * );
 *
 * client.subscribe(
 *   buildCharacterChannel("updated", "guild", "456"),  // All in guild
 *   CharacterUpdatedEventSchema,
 *   handler
 * );
 *
 * // Or subscribe to base channel for all events
 * client.subscribe(Channels.CHARACTER_UPDATED, CharacterUpdatedEventSchema, handler);
 * ```
 */
export const Channels = {
  // Character events (base patterns, use builders for specific channels)
  CHARACTER_CREATED: "realm:character:created",
  CHARACTER_UPDATED: "realm:character:updated",
  CHARACTER_DELETED: "realm:character:deleted",
  CHARACTER_GUILD_CHANGED: "realm:character:guildChanged",

  // Guild events
  GUILD_CREATED: "realm:guild:created",
  GUILD_UPDATED: "realm:guild:updated",
  GUILD_DELETED: "realm:guild:deleted",

  // Member events (always guild-scoped)
  MEMBER_CREATED: "realm:member:created",
  MEMBER_UPDATED: "realm:member:updated",
  MEMBER_DELETED: "realm:member:deleted",

  // User events
  USER_UPDATED: "realm:user:updated",

  // Dice events (request-response pattern with rollId for matching)
  DICE_ROLL_REQUEST: "realm:dice:roll:request",
  DICE_ROLL_RESULT: "realm:dice:roll:result",

  // Gateway events (WebSocket broadcasting)
  GATEWAY_BROADCAST: "realm:gateway:broadcast",

  // Discord events (bot actions)
  DISCORD_MESSAGE_REQUEST: "realm:discord:message:request",

  // System events (health checks, coordination)
  SYSTEM_HEALTH_PING: "realm:system:health:ping",
  SYSTEM_HEALTH_PONG: "realm:system:health:pong",
  SYSTEM_SHUTDOWN: "realm:system:shutdown",
} as const;

export type ChannelName = (typeof Channels)[keyof typeof Channels];

/**
 * Channel scope qualifiers for hierarchical subscriptions.
 *
 * @example
 * ```typescript
 * buildCharacterChannel("updated", "character", "123456789")
 * // Returns: "realm:character:updated:character:123456789"
 * ```
 */
export type ChannelScope = "character" | "guild" | "user" | "member";

/**
 * Build a scoped character event channel name.
 *
 * @param action - The character action (created, updated, deleted, guildChanged)
 * @param scope - The scope qualifier (character, guild)
 * @param id - The ID for the scope (characterId or guildId as string)
 * @returns Fully qualified channel name
 *
 * @example
 * ```typescript
 * // Specific character updates
 * buildCharacterChannel("updated", "character", "123456789");
 * // Returns: "realm:character:updated:character:123456789"
 *
 * // All character updates in a guild
 * buildCharacterChannel("updated", "guild", "987654321");
 * // Returns: "realm:character:updated:guild:987654321"
 * ```
 */
export function buildCharacterChannel(
  action: "created" | "updated" | "deleted" | "guildChanged",
  scope: "character" | "guild",
  id: string
): string {
  return `realm:character:${action}:${scope}:${id}`;
}

/**
 * Build a scoped guild event channel name.
 *
 * @param action - The guild action (created, updated, deleted)
 * @param guildId - The guild ID as string
 * @returns Fully qualified channel name
 *
 * @example
 * ```typescript
 * buildGuildChannel("updated", "123456789");
 * // Returns: "realm:guild:updated:guild:123456789"
 * ```
 */
export function buildGuildChannel(
  action: "created" | "updated" | "deleted",
  guildId: string
): string {
  return `realm:guild:${action}:guild:${guildId}`;
}

/**
 * Build a scoped member event channel name.
 * Members are always scoped to a guild.
 *
 * @param action - The member action (created, updated, deleted)
 * @param guildId - The guild ID as string
 * @param memberId - Optional member ID for specific member events
 * @returns Fully qualified channel name
 *
 * @example
 * ```typescript
 * // All member updates in a guild
 * buildMemberChannel("updated", "123456789");
 * // Returns: "realm:member:updated:guild:123456789"
 *
 * // Specific member updates
 * buildMemberChannel("updated", "123456789", "987654321");
 * // Returns: "realm:member:updated:guild:123456789:member:987654321"
 * ```
 */
export function buildMemberChannel(
  action: "created" | "updated" | "deleted",
  guildId: string,
  memberId?: string
): string {
  const base = `realm:member:${action}:guild:${guildId}`;
  return memberId ? `${base}:member:${memberId}` : base;
}

/**
 * Build a scoped user event channel name.
 *
 * @param action - The user action (typically "updated")
 * @param userId - The user ID as string
 * @returns Fully qualified channel name
 *
 * @example
 * ```typescript
 * buildUserChannel("updated", "123456789");
 * // Returns: "realm:user:updated:user:123456789"
 * ```
 */
export function buildUserChannel(action: "updated", userId: string): string {
  return `realm:user:${action}:user:${userId}`;
}

/**
 * Build a pattern for subscribing to multiple related channels.
 *
 * @param domain - The event domain (character, guild, member, user)
 * @param action - The action (use "*" for all actions)
 * @param scope - The scope qualifier (character, guild, user, member)
 * @param id - The ID for the scope (use "*" for all IDs in scope)
 * @returns Channel pattern for psubscribe
 *
 * @example
 * ```typescript
 * // All character events in a specific guild
 * buildChannelPattern("character", "*", "guild", "123456789");
 * // Returns: "realm:character:*:guild:123456789"
 *
 * // All character updates across all guilds
 * buildChannelPattern("character", "updated", "guild", "*");
 * // Returns: "realm:character:updated:guild:*"
 *
 * // All events for a specific character
 * buildChannelPattern("character", "*", "character", "987654321");
 * // Returns: "realm:character:*:character:987654321"
 * ```
 */
export function buildChannelPattern(
  domain: "character" | "guild" | "member" | "user",
  action: string,
  scope: ChannelScope,
  id: string
): string {
  return `realm:${domain}:${action}:${scope}:${id}`;
}
