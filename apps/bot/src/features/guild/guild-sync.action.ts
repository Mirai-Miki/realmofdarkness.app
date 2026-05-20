import type { Guild } from "discord.js";
import type { DiscordIdentityData } from "@realm/common";

import { Collection } from "discord.js";
import { logger } from "@realm/logger";
import {
  DiscordGuildRepository,
  ChronicleMemberRepository,
  DiscordIdentityRepository,
  DiscordGuildChronicleRepository,
} from "@realm/repositories";

/**
 * Action to sync guild(s) and their members with the database.
 *
 * Coordinates between Discord data and the database repositories.
 * Handles both single guild sync (e.g. guild create event) and
 * bulk sync (e.g. ready event).
 */
export class GuildSyncAction {
  private guildRepository: DiscordGuildRepository;
  private memberRepository: ChronicleMemberRepository;
  private identityRepository: DiscordIdentityRepository;
  private linkRepository: DiscordGuildChronicleRepository;

  constructor() {
    this.guildRepository = new DiscordGuildRepository();
    this.memberRepository = new ChronicleMemberRepository();
    this.identityRepository = new DiscordIdentityRepository();
    this.linkRepository = new DiscordGuildChronicleRepository();
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

    const existingGuild = await this.guildRepository.findById(guild.id);
    if (!existingGuild) {
      return; // Not tracked, so skip
    }

    // Only update tracked guilds
    const trackedGuild = await this.guildRepository.update(
      {
        discordId: guild.id,
        name: guild.name,
        iconUrl: guild.iconURL() || "",
      },
      { ignoreNotFound: true }
    );

    if (!trackedGuild) {
      return; // Not tracked, so skip
    }

    const links = await this.linkRepository.findByDiscordId(
      trackedGuild.discordId
    );
    const chronicleIds = links.map((l) => l.chronicleId);

    if (chronicleIds.length === 0) {
      return; // No chronicles linked, nothing to sync members to
    }

    try {
      const discordMembers = await guild.members.fetch();
      const memberIds = Array.from(discordMembers.keys());

      const identities = await Promise.all(
        memberIds.map((id) => this.identityRepository.findByDiscordId(id))
      );

      const validIdentities = identities.filter(
        (id): id is DiscordIdentityData => id !== null
      );

      if (cleanupMembers) {
        const discordMemberUserIdSet = new Set(
          validIdentities.map((i) => i.userId)
        );

        for (const chronicleId of chronicleIds) {
          // Find existing members in DB for this chronicle
          const dbMemberUserIds =
            await this.memberRepository.findIdsByChronicle(chronicleId);

          for (const dbUserId of dbMemberUserIds) {
            if (!discordMemberUserIdSet.has(dbUserId)) {
              await this.memberRepository
                .delete(chronicleId, dbUserId)
                .catch((err: Error) =>
                  logger.exception(
                    `Failed to delete old member ${dbUserId} from chronicle ${chronicleId}`,
                    err
                  )
                );
            }
          }
        }
      }

      if (validIdentities.length > 0) {
        logger.info(
          `Found ${validIdentities.length} registered users in ${guild.name}`
        );

        for (const identity of validIdentities) {
          const discordMember = discordMembers.get(identity.discordId);
          if (!discordMember) continue;

          for (const chronicleId of chronicleIds) {
            try {
              // TODO: Syncing member display names across multiple chronicles linked to different guilds might create a loop or conflict.
              // We will need a more robust solution in the future to handle name overrides depending on the context.
              await this.memberRepository.upsert({
                chronicleId: chronicleId,
                userId: identity.userId,
                nickname: discordMember.displayName,
                avatarUrl: discordMember.displayAvatarURL(),
                boosted: discordMember.premiumSince ? 1 : 0,
              });
            } catch (err) {
              logger.exception(
                `Failed to sync member ${identity.userId} in guild ${guild.name} for chronicle ${chronicleId}`,
                err
              );
            }
          }
        }
      }
    } catch (error) {
      logger.exception(`Failed to sync members for guild ${guild.name}`, error);
    }
  }
}
