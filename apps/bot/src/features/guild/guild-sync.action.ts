import type { Guild } from "discord.js";

import { Collection } from "discord.js";
import { logger } from "@realm/logger";
import {
  GuildRepository,
  MemberRepository,
  UserRepository,
} from "@realm/repositories";
import {
  GuildRepositoryInputSchema,
  MemberRepositoryInputSchema,
} from "@realm/common";

/**
 * Action to sync guild(s) and their members with the database.
 *
 * Coordinates between Discord data and the database repositories.
 * Handles both single guild sync (e.g. guild create event) and
 * bulk sync (e.g. ready event).
 */
export class GuildSyncAction {
  private guildRepository: GuildRepository;
  private memberRepository: MemberRepository;
  private userRepository: UserRepository;

  constructor() {
    this.guildRepository = new GuildRepository();
    this.memberRepository = new MemberRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Syncs one or more guilds with the database.
   *
   * Upserts the guild data, then fetches and syncs all members
   * who have a registered user account in our database.
   *
   * @param input - Single Guild or Collection of Guilds to sync
   */
  public async execute(
    input: Guild | Collection<string, Guild>
  ): Promise<void> {
    // If input is a Collection, we treat this as a full sync (e.g. ready event)
    const performCleanup = input instanceof Collection;

    // Normalize input to a Collection for unified processing
    const guildsToSync = performCleanup
      ? input
      : new Collection<string, Guild>([[input.id, input]]);

    // Perform full cleanup if it's a full sync
    // We do this BEFORE syncing new data to ensure we don't process deleted guilds?
    // Actually, usually cleanup happens after or separate.
    // But the requirement is: "if we get a Collection do the cleanup".
    // Let's stick to the previous order: Sync then Cleanup, or Cleanup then Sync?
    // User didn't specify order, but usually cleaner to sync valid ones then remove invalid ones.

    // Sync each guild
    for (const [guildId, guild] of guildsToSync) {
      try {
        await this.syncSingleGuild(guild, performCleanup);
      } catch (error) {
        logger.exception(
          `Failed to sync guild ${guild.name} (${guildId})`,
          error
        );
      }
    }
  }

  private async syncSingleGuild(
    guild: Guild,
    cleanupMembers: boolean
  ): Promise<void> {
    logger.info(`Syncing guild: ${guild.name} (${guild.id})`);

    // Validate at the edge
    const validatedGuildData = GuildRepositoryInputSchema.parse({
      id: guild.id,
      name: guild.name,
      iconUrl: guild.iconURL() === null ? undefined : guild.iconURL(),
    });
    await this.guildRepository.upsert(validatedGuildData);

    // 2. Sync Member Data
    try {
      // Fetch all members from Discord
      const discordMembers = await guild.members.fetch();
      const memberIds = Array.from(discordMembers.keys());

      // Cleanup: Remove members from DB that are no longer in Discord guild
      // Only perform if cleanupMembers is true (which comes from isFullSync)
      if (cleanupMembers) {
        const dbMemberIds = await this.memberRepository.findIdsByGuild(
          guild.id
        );
        const discordMemberSet = new Set(memberIds);

        for (const dbUserId of dbMemberIds) {
          if (!discordMemberSet.has(dbUserId)) {
            await this.memberRepository
              .delete(guild.id, dbUserId)
              .catch((err: Error) =>
                logger.exception(
                  `Failed to delete old member ${dbUserId} from guild ${guild.id}`,
                  err
                )
              );
          }
        }
      }

      // Use findManyByIds to check which members are registered users
      // This is efficient batch processing
      const registeredUsers =
        await this.userRepository.findManyByIds(memberIds);

      if (registeredUsers.length > 0) {
        logger.info(
          `Found ${registeredUsers.length} registered users in ${guild.name}`
        );

        // Process each registered user
        for (const user of registeredUsers) {
          const discordMember = discordMembers.get(user.id);
          if (!discordMember) continue;

          try {
            // Validate at the edge
            const validatedMemberData = MemberRepositoryInputSchema.parse({
              guildId: guild.id,
              userId: user.id,
              nickname: discordMember.nickname || "",
              avatarUrl: discordMember.displayAvatarURL(),
              admin: discordMember.permissions.has("Administrator"),
              roleIds: Array.from(discordMember.roles.cache.keys()),
            });

            await this.memberRepository.upsert(validatedMemberData);
          } catch (err) {
            logger.exception(
              `Failed to sync member ${user.username} in guild ${guild.name}`,
              err
            );
          }
        }
      }
    } catch (error) {
      logger.exception(`Failed to sync members for guild ${guild.name}`, error);
    }
  }
}
