import { logger } from "@realm/logger";
import { UserRepository } from "@realm/repositories";
import { generateSnowflake, User } from "@realm/core";

import type { BaseInteraction } from "discord.js";

import type { BaseInteractionContext } from "../interaction-context";

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
 * Ensure the interacting Discord user has a corresponding RoD user record.
 *
 * The Discord app only tracks users who interact with it.
 * This middleware upserts the user using Discord profile data keyed by `discordId`.
 */
export async function ensureActor<TInteraction extends BaseInteraction>(
  ctx: BaseInteractionContext<TInteraction>
): Promise<User> {
  const discordUserId = ctx.interaction.user.id;
  const userRepo = new UserRepository();
  try {
    const userData = await userRepo.upsertFromDiscordProfile(
      {
        discordId: discordUserId,
        displayName: ctx.interaction.user.displayName,
        avatarUrl: ctx.interaction.user.displayAvatarURL(),
      },
      { newUserId: generateSnowflake() }
    );

    return new User(userData);
  } catch (error) {
    if (!isPostgresUniqueViolation(error)) throw error;

    // Extremely rare fallback: if a unique violation happened concurrently,
    // re-fetch the user by discordId.
    logger.debug("User was created concurrently; re-fetching", {
      fields: { discordUserId },
    });

    const racedUserData = await userRepo.findByDiscordId(discordUserId);
    if (!racedUserData) throw error;

    return new User(racedUserData);
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
