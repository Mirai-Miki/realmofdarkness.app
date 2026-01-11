import type {
  GuildMember,
  User,
  CacheWithLimitsOptions,
  SweeperOptions,
} from "discord.js";

/**
 * Cache limit settings for Discord.js managers
 *
 * @remarks
 * These settings are passed to Options.cacheWithLimits() to create a cache factory.
 * This minimizes memory usage for bots serving thousands of guilds by aggressively
 * limiting what gets cached.
 *
 * Cache Strategy:
 * - Only cache users who are registered in our database
 * - Keep bot's own user/member always cached
 * - Use keepOverLimit to filter based on registration status
 * - Rely on sweepers to periodically clean up unregistered users
 *
 * @see {@link https://discord.js.org/docs/packages/discord.js/14.25.1/SweeperOptions:Interface | Sweeper Options}
 * @see {@link https://discordjs.guide/legacy/miscellaneous/cache-customization | Cache Customization Guide}
 */
export const cacheSettings: CacheWithLimitsOptions = {
  // ===== Application Commands (keep small cache for quick lookups) =====
  ApplicationCommandManager: 10,

  // ===== Emojis (keep limited for command responses) =====
  ApplicationEmojiManager: 500,
  BaseGuildEmojiManager: 0, // Don't cache guild emojis separately
  GuildEmojiManager: 0, // Don't cache guild emojis separately

  // ===== Auto Moderation (not used by bot) =====
  AutoModerationRuleManager: 0,

  // ===== Messages (not needed - interaction-based only) =====
  MessageManager: 0,
  GuildMessageManager: 0,
  DMMessageManager: 0,

  // ===== Threads (not needed - slash commands don't use threads) =====
  ThreadManager: 0,
  GuildTextThreadManager: 0,
  GuildForumThreadManager: 0,
  ThreadMemberManager: 0,

  // ===== Reactions (not used) =====
  ReactionManager: 0,
  ReactionUserManager: 0,

  // ===== Voice & Presence (not needed) =====
  VoiceStateManager: 0,
  PresenceManager: 0,

  // ===== Stage Instances (not used) =====
  StageInstanceManager: 0,

  // ===== Bans (not needed - bot doesn't manage bans) =====
  GuildBanManager: 0,

  // ===== Invites (not needed) =====
  GuildInviteManager: 0,

  // ===== Scheduled Events (not needed) =====
  GuildScheduledEventManager: 0,

  // ===== Stickers (keep small cache for command responses) =====
  GuildStickerManager: 20,

  // ===== Entitlements (not used - no premium features via Discord) =====
  EntitlementManager: 0,

  // ===== Guild Members (minimal caching) =====
  // TODO: Implement registered user check in keepOverLimit
  GuildMemberManager: {
    maxSize: 1,
    keepOverLimit: (member: GuildMember) =>
      member.id === member.client.user?.id,
  },

  // ===== Users (minimal caching) =====
  // TODO: Implement registered user check in keepOverLimit
  UserManager: {
    maxSize: 1,
    keepOverLimit: (user: User) => user.id === user.client.user?.id,
  },

  // NOTE: The following managers CANNOT be customized (Discord.js limitation):
  // - GuildManager, ChannelManager, GuildChannelManager
  // - RoleManager, PermissionOverwriteManager
  // Attempting to customize these will break core functionality!
};

/**
 * Sweeper options to periodically clear caches
 *
 * @remarks
 * Sweepers run at intervals to remove stale cache entries, keeping memory usage low.
 * More aggressive sweeping = lower memory usage but more API calls.
 */
export const sweeperOptions: SweeperOptions = {
  // Sweep guild members every 5 minutes - remove everything except bot
  // TODO: Implement registered user check in filter
  guildMembers: {
    interval: 300,
    filter: () => (member: GuildMember) => member.id !== member.client.user?.id,
  },
  // Sweep users every 10 minutes - remove everything except bot
  // TODO: Implement registered user check in filter
  users: {
    interval: 600,
    filter: () => (user: User) => user.id !== user.client.user?.id,
  },
  // Sweep threads every hour (default behavior, can be customized)
  threads: {
    interval: 3600, // Every hour
    lifetime: 14400, // Remove threads archived more than 4 hours ago
  },
};
