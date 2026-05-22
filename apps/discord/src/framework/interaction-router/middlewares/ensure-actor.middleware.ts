import type { Snowflake, UserData } from "@realm/common";
import { logger } from "@realm/logger";
import { generateSnowflake } from "@realm/core";
import { DiscordIdentityRepository, UserRepository } from "@realm/repositories";

import type { BaseInteraction } from "discord.js";

import type {
  BaseInteractionContext,
  DiscordActor,
} from "../interaction-context";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringProp(
  obj: Record<string, unknown>,
  key: string
): string | null {
  const value = obj[key];
  return typeof value === "string" ? value : null;
}

function isPostgresUniqueViolation(error: unknown): boolean {
  if (!isRecord(error)) return false;
  const code = getStringProp(error, "code");
  return code === "23505";
}

/**
 * Ensure the interacting Discord user has a corresponding RoD User + DiscordIdentity mapping.
 *
 * If no mapping exists, this creates a new RoD user ID and inserts both records.
 * The resolved aggregate is attached to `ctx.actor`.
 */
export async function ensureActor<TInteraction extends BaseInteraction>(
  ctx: BaseInteractionContext<TInteraction>
): Promise<DiscordActor> {
  const discordUserId = ctx.interaction.user.id;

  const identityRepo = new DiscordIdentityRepository();
  const userRepo = new UserRepository();

  const existingIdentity = await identityRepo.findByDiscordId(discordUserId);

  if (existingIdentity) {
    const user = await userRepo.findById(existingIdentity.userId);

    if (!user) {
      const created = await userRepo.upsert({
        id: existingIdentity.userId,
        displayName: ctx.interaction.user.displayName,
        avatarUrl: ctx.interaction.user.displayAvatarURL(),
        admin: false,
      });

      return {
        rodUserId: created.id,
        discordUserId,
        user: created,
        discordIdentity: existingIdentity,
      };
    }

    const updated = await userRepo.upsert({
      id: user.id,
      displayName: ctx.interaction.user.displayName,
      avatarUrl: ctx.interaction.user.displayAvatarURL(),
      admin: user.admin,
    });

    return {
      rodUserId: updated.id,
      discordUserId,
      user: updated,
      discordIdentity: existingIdentity,
    };
  }

  const newRodUserId: Snowflake = generateSnowflake();

  const createdUser: UserData = await userRepo.create({
    id: newRodUserId,
    displayName: ctx.interaction.user.displayName,
    avatarUrl: ctx.interaction.user.displayAvatarURL(),
    admin: false,
  });

  try {
    const createdIdentity = await identityRepo.create({
      discordId: discordUserId,
      userId: newRodUserId,
    });

    return {
      rodUserId: newRodUserId,
      discordUserId,
      user: createdUser,
      discordIdentity: createdIdentity,
    };
  } catch (error) {
    if (!isPostgresUniqueViolation(error)) {
      throw error;
    }

    // Race condition: someone else created the identity first.
    // Best effort:
    // - Re-fetch the identity and use it
    // - Clean up the just-created user to avoid an orphan
    logger.debug("Discord identity was created concurrently; re-fetching", {
      fields: { discordUserId },
    });

    const racedIdentity = await identityRepo.findByDiscordId(discordUserId);
    if (!racedIdentity) {
      throw error;
    }

    try {
      await userRepo.delete(newRodUserId);
    } catch (cleanupError) {
      logger.exception(
        "Failed to cleanup orphan user after identity race",
        cleanupError,
        {
          fields: { rodUserId: newRodUserId, discordUserId },
        }
      );
    }

    const racedUser = await userRepo.findById(racedIdentity.userId);
    if (!racedUser) {
      const fallbackCreated = await userRepo.upsert({
        id: racedIdentity.userId,
        displayName: ctx.interaction.user.displayName,
        avatarUrl: ctx.interaction.user.displayAvatarURL(),
        admin: false,
      });

      return {
        rodUserId: fallbackCreated.id,
        discordUserId,
        user: fallbackCreated,
        discordIdentity: racedIdentity,
      };
    }

    return {
      rodUserId: racedUser.id,
      discordUserId,
      user: racedUser,
      discordIdentity: racedIdentity,
    };
  }
}

/**
 * Middleware that ensures `ctx.actor` exists.
 */
export function ensureActorMiddleware<TInteraction extends BaseInteraction>(): (
  ctx: BaseInteractionContext<TInteraction>,
  next: () => Promise<void>
) => Promise<void> {
  return async (ctx, next) => {
    if (!ctx.actor) {
      ctx.actor = await ensureActor(ctx);
    }
    await next();
  };
}
