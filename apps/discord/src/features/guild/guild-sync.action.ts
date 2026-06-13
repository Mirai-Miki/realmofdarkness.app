import type { Guild, Collection } from "discord.js";
import type { UserData } from "@realm/common";
import { logger } from "@realm/logger";
import {
  DiscordGuildRepository,
  ChronicleMemberRepository,
  DiscordGuildChronicleRepository,
  UserRepository,
} from "@realm/repositories";
import { CreateGuildAction } from "./create-guild.action";

/**
 * Action to sync guild(s) and their members with the database.
 *
 * Coordinates between Discord data and the database repositories.
 * Handles bulk sync on startup.
 */
export class GuildSyncAction {
  private guildRepository: DiscordGuildRepository;
  private memberRepository: ChronicleMemberRepository;
  private userRepository: UserRepository;
  private linkRepository: DiscordGuildChronicleRepository;

  constructor() {
    this.guildRepository = new DiscordGuildRepository();
    this.memberRepository = new ChronicleMemberRepository();
    this.userRepository = new UserRepository();
    this.linkRepository = new DiscordGuildChronicleRepository();
  }

  /**
   * Syncs a collection of guilds with the database.
   *
   * Ensures that missing guilds are registered and performs member cleanup
   * for existing tracked guilds.
   *
   * @param guildsToSync - Collection of Guilds to sync
   */
  public async execute(guildsToSync: Collection<string, Guild>): Promise<void> {
    const createGuildAction = new CreateGuildAction();

    // Sync each guild
    for (const [guildId, guild] of guildsToSync) {
      try {
        logger.info(`Syncing guild: ${guild.name} (${guild.id})`);

        const isTracked = await this.guildRepository.exists(guild.id);
        if (!isTracked) {
          logger.info(
            `Guild ${guild.name} (${guild.id}) is not tracked. Creating it and its default Chronicle.`
          );
          await createGuildAction.execute(guild);
        } else {
          await this.cleanupMembers(guild);
        }
      } catch (error) {
        logger.exception(
          `Failed to sync guild ${guild.name} (${guildId})`,
          error
        );
      }
    }
  }

  /**
   * Cleans up members of a guild that are no longer present on Discord.
   *
   * @param guild - The Discord guild to perform member cleanup on.
   */
  private async cleanupMembers(guild: Guild): Promise<void> {
    // Retrieve all chronicles linked to this guild
    const links = await this.linkRepository.findByDiscordId(guild.id);
    const chronicleIds = links.map((link) => link.chronicleId);

    for (const chronicleId of chronicleIds) {
      // Evaluate if chronicle is tied to multiple guilds
      const chronicleGuildLinks =
        await this.linkRepository.findByChronicleId(chronicleId);

      // TODO: Check guild sync feature flag here when implemented.
      // For now, if the chronicle has > 1 guild, skip fetching members entirely.
      if (chronicleGuildLinks.length > 1) {
        logger.info(
          `Skipping member cleanup for chronicle ${chronicleId} as it is linked to multiple guilds.`
        );
        continue;
      }

      // Fetch DB members for this chronicle
      const dbMemberUserIds =
        await this.memberRepository.findIdsByChronicle(chronicleId);

      if (dbMemberUserIds.length === 0) {
        continue;
      }

      // Map internal user IDs to DB UserData to get their Discord IDs
      const identities =
        await this.userRepository.findManyByIds(dbMemberUserIds);
      const validUsers = identities.filter(
        (u): u is UserData => u !== null && u.discordId !== null
      );

      if (validUsers.length === 0) {
        continue;
      }

      // Map discordId -> userId to easily identify who to delete later
      const discordToUser = new Map<string, string>();
      for (const user of validUsers) {
        discordToUser.set(user.discordId as string, user.id);
      }

      const discordIdsToFetch = Array.from(discordToUser.keys());
      const activeDiscordIds = new Set<string>();

      // Batch fetch members from Discord (max 100 per chunk per gateway limit)
      const CHUNK_SIZE = 100;
      for (let i = 0; i < discordIdsToFetch.length; i += CHUNK_SIZE) {
        const chunk = discordIdsToFetch.slice(i, i + CHUNK_SIZE);
        try {
          const fetchedMembers = await guild.members.fetch({ user: chunk });
          for (const id of fetchedMembers.keys()) {
            activeDiscordIds.add(id);
          }
        } catch (fetchError) {
          logger.exception(
            `Failed to fetch batch chunk for guild ${guild.name} (${guild.id})`,
            fetchError
          );
        }
      }

      // Identify and remove leavers
      for (const discordId of discordIdsToFetch) {
        if (!activeDiscordIds.has(discordId)) {
          const userId = discordToUser.get(discordId);
          if (userId) {
            await this.memberRepository
              .delete(chronicleId, userId)
              .catch((err: Error) =>
                logger.exception(
                  `Failed to delete past member ${userId} from chronicle ${chronicleId}`,
                  err
                )
              );
          }
        }
      }
    }
  }
}
