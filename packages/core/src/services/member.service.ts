import type {
  ILogger,
  IMemberRepository,
  ISupporterRepository,
  IUserRepository,
  Snowflake,
} from "@realm/common";

import { RealmError, UserError, HttpStatus } from "@realm/common";
import { Member } from "../entities/member.entity.js";

/**
 * Application service for member operations.
 *
 * Handles guild membership logic including boosts, permissions, and profile syncing.
 */
export class MemberService {
  private readonly logger: ILogger;

  constructor(
    logger: ILogger,
    private readonly memberRepository: IMemberRepository,
    private readonly supporterRepository: ISupporterRepository,
    private readonly userRepository: IUserRepository
  ) {
    this.logger = logger;
  }

  /**
   * Add a new member to a guild if they are a registered user.
   * Handles check for existing user and existing member.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @param profile - Initial profile data
   */
  async create(
    guildId: Snowflake,
    userId: Snowflake,
    profile: { nickname: string; avatarUrl: string; admin: boolean }
  ): Promise<Member | null> {
    // 1. Check if user is registered in our system
    const userExists = await this.userRepository.exists(userId);
    if (!userExists) {
      this.logger.debug(`Skipping member add: User ${userId} not registered`);
      return null;
    }

    // 2. Check if member record already exists (idempotency)
    const existingMember = await this.memberRepository.findByGuildAndUser(
      guildId,
      userId
    );
    if (existingMember) {
      this.logger.debug(
        `Skipping member add: Member already exists in guild ${guildId}`,
        {
          fields: { userId, guildId },
        }
      );
      return existingMember;
    }

    // 3. Create new member entity
    const now = new Date();
    const newMember = new Member({
      guildId,
      userId,
      admin: profile.admin,
      storyteller: false, // TODO: Check against configured storyteller roles in DB
      boosted: 0,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl,
      createdAt: now,
      lastUpdated: now,
    });

    // 4. Persist
    const created = await this.memberRepository.create(newMember);
    this.logger.info(`Created member record`, {
      fields: { userId, guildId },
    });

    return created;
  }

  /**
   * Sync member data from Discord (nickname, avatar, admin status).
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @param data - Current data from Discord
   */
  async update(
    guildId: Snowflake,
    userId: Snowflake,
    data: { nickname: string; avatarUrl: string; admin: boolean }
  ): Promise<void> {
    const member = await this.memberRepository.findByGuildAndUser(
      guildId,
      userId
    );

    if (!member) {
      return;
    }

    // Sync Admin
    if (data.admin) {
      member.grantAdmin();
    } else {
      member.revokeAdmin();
    }

    // Sync other fields
    member.setNickname(data.nickname);
    member.setAvatarUrl(data.avatarUrl);

    // Always call update, let repository handle "lastUpdated" and persistence
    await this.memberRepository.update(member);
    this.logger.debug(`Synced member data`, { fields: { userId, guildId } });
  }

  /**
   * Delete a member.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   */
  async delete(guildId: Snowflake, userId: Snowflake): Promise<void> {
    this.logger.info(`Deleting member from guild ${guildId}`, {
      fields: { userId, guildId },
    });
    return this.memberRepository.delete(guildId, userId);
  }

  /**
   * Delete all members for a guild.
   *
   * @param guildId - Discord guild ID
   */
  async deleteByGuild(guildId: Snowflake): Promise<void> {
    this.logger.info(`Deleting all members from guild ${guildId}`, {
      fields: { guildId },
    });
    return this.memberRepository.deleteByGuild(guildId);
  }

  /**
   * Add a boost to a member (assigns a user's boost to this guild).
   *
   * Checks if the user has available boosts from their supporter subscription.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @throws {UserError} If user has no boosts available
   * @throws {RealmError} If member not found or other system error
   */
  async addBoost(guildId: Snowflake, userId: Snowflake): Promise<void> {
    try {
      // 1. Get Supporter details
      const supporter = await this.supporterRepository.findByUserId(userId);

      // 2. Calculate currently used boosts
      // Boosted is a number count, not a boolean
      const usedBoosts =
        await this.memberRepository.countTotalBoostsByUser(userId);

      this.logger.debug(`Checking boost availability for user ${userId}`, {
        fields: {
          total: String(supporter.totalBoosts),
          used: String(usedBoosts),
          guildId,
        },
      });

      // 3. Check availability
      if (usedBoosts >= supporter.totalBoosts) {
        throw new UserError("You have no boosts available to assign.", {
          statusCode: HttpStatus.FORBIDDEN,
          fields: {
            totalBoosts: String(supporter.totalBoosts),
            usedBoosts: String(usedBoosts),
          },
        });
      }

      // 4. Find the member to boost
      // We look for the specific member record to update
      const member = await this.memberRepository.findByGuildAndUser(
        guildId,
        userId
      );

      if (!member) {
        // Should usually exist if we are calling this, but handle case
        throw new RealmError("Member not found in guild", {
          fields: { guildId, userId },
        });
      }

      // 5. Apply boost (increment)
      member.addBoost();
      await this.memberRepository.update(member);

      this.logger.info(`Boost added for user ${userId} in guild ${guildId}`);
    } catch (error) {
      if (error instanceof UserError) throw error;
      throw new RealmError("Failed to add boost to member", {
        cause: error,
        fields: { guildId, userId },
      });
    }
  }

  /**
   * Remove a boost from a member.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   */
  async removeBoost(guildId: Snowflake, userId: Snowflake): Promise<void> {
    try {
      const member = await this.memberRepository.findByGuildAndUser(
        guildId,
        userId
      );

      if (!member) {
        throw new RealmError("Member not found in guild", {
          fields: { guildId, userId },
        });
      }

      if (member.boosted <= 0) {
        return;
      }

      member.removeBoost();
      await this.memberRepository.update(member);

      this.logger.info(`Boost removed for user ${userId} in guild ${guildId}`);
    } catch (error) {
      throw new RealmError("Failed to remove boost from member", {
        cause: error,
        fields: { guildId, userId },
      });
    }
  }
}
