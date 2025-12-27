import type { ILogger, IMemberRepository, Snowflake } from "@realm/common";
import {
  RealmError,
  type CreateMemberInput,
  type SyncMemberInput,
  type AddBoostInput,
  type RemoveBoostInput,
  type DeleteMemberInput,
  type MemberExistsInput,
} from "@realm/common";
import { Member } from "../entities/member.entity";

/**
 * Pure application service for member operations.
 *
 * Handles guild membership logic including permissions and profile syncing.
 *
 * **Important**: This is a pure service. It does NOT call other services.
 * For coordination across multiple services (e.g., checking user registration
 * before creating a member), use an action in the `actions/` folder.
 *
 * **Date Handling**: This service does NOT manage date fields (createdAt, lastUpdated).
 * The repository is responsible for setting timestamps based on data changes.
 */
export class MemberService {
  constructor(
    private readonly logger: ILogger,
    private readonly memberRepository: IMemberRepository
  ) {}

  /**
   * Get a member by guild and user ID.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @returns Member entity if found, null otherwise
   */
  public async getByGuildAndUser(
    guildId: Snowflake,
    userId: Snowflake
  ): Promise<Member | null> {
    this.logger.debug("Getting member by guild and user", {
      fields: { guildId, userId },
    });

    const dto = await this.memberRepository.findByGuildAndUser(guildId, userId);
    if (!dto) {
      return null;
    }

    return new Member(dto);
  }

  /**
   * Create a new member.
   *
   * Input data should already be validated at the API/Bot edge.
   *
   * @param input - Member creation input data (already validated)
   * @returns Created member entity
   * @throws {RealmError} If creation fails
   */
  public async create(input: CreateMemberInput): Promise<Member> {
    this.logger.info("Creating member", {
      fields: { guildId: input.guildId, userId: input.userId },
    });

    try {
      // Trust input - already validated at API/Bot edge

      // Check if member already exists (idempotency)
      const existing = await this.memberRepository.findByGuildAndUser(
        input.guildId,
        input.userId
      );
      if (existing) {
        this.logger.debug("Member already exists, returning existing", {
          fields: {
            guildId: input.guildId,
            userId: input.userId,
          },
        });
        return new Member(existing);
      }

      // Repository will add date fields
      const createdDto = await this.memberRepository.create({
        ...input,
        createdAt: new Date(), // Repository may override
        lastUpdated: new Date(), // Repository may override
      });

      this.logger.debug("Member created successfully", {
        fields: {
          guildId: createdDto.guildId,
          userId: createdDto.userId,
        },
      });

      return new Member(createdDto);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to create member", {
        cause: error,
        fields: { guildId: input.guildId, userId: input.userId },
      });
    }
  }

  /**
   * Sync member profile data from Discord.
   *
   * Updates admin status, role IDs, nickname, and avatar.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @param input - Profile data from Discord
   * @returns Updated member entity, or null if member not found
   */
  public async syncProfile(input: SyncMemberInput): Promise<Member | null> {
    try {
      // Trust input - already validated at API/Bot edge

      // Get existing member
      const dto = await this.memberRepository.findByGuildAndUser(
        input.guildId,
        input.userId
      );
      if (!dto) {
        this.logger.debug("Member not found for sync", {
          fields: {
            guildId: input.guildId,
            userId: input.userId,
          },
        });
        return null;
      }

      // Hydrate entity and apply changes
      const member = new Member(dto);

      // Update admin status
      if (input.admin) {
        member.grantAdmin();
      } else {
        member.revokeAdmin();
      }

      // Update profile fields
      member.setNickname(input.nickname);
      member.setAvatarUrl(input.avatarUrl);
      member.setRoleIds(input.roleIds);

      // Persist changes (repository handles lastUpdated)
      const updatedDto = await this.memberRepository.update(member.toData());

      this.logger.debug("Member profile synced", {
        fields: {
          guildId: input.guildId,
          userId: input.userId,
        },
      });

      return new Member(updatedDto);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to sync member profile", {
        cause: error,
        fields: {
          guildId: input.guildId,
          userId: input.userId,
        },
      });
    }
  }

  /**
   * Add a boost to a member.
   *
   * **Note**: Boost availability checking is NOT done here.
   * Use an action that coordinates with SupporterService for that.
   *
   * @param input - Complete input with guild ID and user ID
   * @returns Updated member entity
   * @throws {RealmError} If member not found
   */
  public async addBoost(input: AddBoostInput): Promise<Member> {
    this.logger.info("Adding boost to member", {
      fields: { guildId: input.guildId, userId: input.userId },
    });

    // Trust input - already validated at API/Bot edge

    const dto = await this.memberRepository.findByGuildAndUser(
      input.guildId,
      input.userId
    );
    if (!dto) {
      throw new RealmError("Member not found", {
        fields: {
          guildId: input.guildId,
          userId: input.userId,
        },
      });
    }

    const member = new Member(dto);
    member.addBoost();

    const updatedDto = await this.memberRepository.update(member.toData());

    this.logger.debug("Boost added to member", {
      fields: {
        guildId: input.guildId,
        userId: input.userId,
        boosted: String(member.boosted),
      },
    });

    return new Member(updatedDto);
  }

  /**
   * Remove a boost from a member.
   *
   * @param input - Complete input with guild ID and user ID
   * @returns Updated member entity
   * @throws {RealmError} If member not found or has no boosts
   */
  public async removeBoost(input: RemoveBoostInput): Promise<Member> {
    this.logger.info("Removing boost from member", {
      fields: { guildId: input.guildId, userId: input.userId },
    });

    // Trust input - already validated at API/Bot edge

    const dto = await this.memberRepository.findByGuildAndUser(
      input.guildId,
      input.userId
    );
    if (!dto) {
      throw new RealmError("Member not found", {
        fields: {
          guildId: input.guildId,
          userId: input.userId,
        },
      });
    }

    const member = new Member(dto);
    member.removeBoost(); // Throws if no boosts

    const updatedDto = await this.memberRepository.update(member.toData());

    this.logger.debug("Boost removed from member", {
      fields: {
        guildId: input.guildId,
        userId: input.userId,
        boosted: String(member.boosted),
      },
    });

    return new Member(updatedDto);
  }

  /**
   * Delete a member.
   *
   * @param input - Complete input with guild ID and user ID
   */
  public async delete(input: DeleteMemberInput): Promise<void> {
    this.logger.info("Deleting member", {
      fields: { guildId: input.guildId, userId: input.userId },
    });

    // Trust input - already validated at API/Bot edge

    await this.memberRepository.delete(input.guildId, input.userId);

    this.logger.debug("Member deleted", {
      fields: {
        guildId: input.guildId,
        userId: input.userId,
      },
    });
  }

  /**
   * Delete all members for a guild.
   *
   * @param guildId - Discord guild ID
   */
  public async deleteByGuild(guildId: Snowflake): Promise<void> {
    this.logger.info("Deleting all members from guild", {
      fields: { guildId },
    });

    await this.memberRepository.deleteByGuild(guildId);

    this.logger.debug("All members deleted from guild", {
      fields: { guildId },
    });
  }

  /**
   * Check if a member exists.
   *
   * @param input - Complete input with guild ID and user ID
   * @returns True if member exists
   */
  public async exists(input: MemberExistsInput): Promise<boolean> {
    // Trust input - already validated at API/Bot edge
    return this.memberRepository.exists(input.guildId, input.userId);
  }

  /**
   * Get all members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of member entities
   */
  public async getByGuild(guildId: Snowflake): Promise<Member[]> {
    const dtos = await this.memberRepository.findByGuild(guildId);
    return dtos.map((dto) => new Member(dto));
  }

  /**
   * Get all guilds a user is a member of.
   *
   * @param userId - Discord user ID
   * @returns Array of member entities
   */
  public async getByUser(userId: Snowflake): Promise<Member[]> {
    const dtos = await this.memberRepository.findByUser(userId);
    return dtos.map((dto) => new Member(dto));
  }

  /**
   * Get all staff members in a guild (admins + storytellers).
   *
   * @param guildId - Discord guild ID
   * @returns Array of staff member entities
   */
  public async getStaffMembers(guildId: Snowflake): Promise<Member[]> {
    const dtos = await this.memberRepository.findStaffMembers(guildId);
    return dtos.map((dto) => new Member(dto));
  }
}
