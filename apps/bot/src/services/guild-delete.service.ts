import type { Guild } from "discord.js";
import { AppGuild } from "../entities";
import { db } from "@realm/database";
import { members } from "@realm/database/schema/members";
import { eq } from "drizzle-orm";

export class GuildDeleteService {
  static async execute(guild: Guild) {
    // We need to unset all character guilds via a character guild update

    // Before we delete the guild, we need to delete all members to force member delete events
    // const members = await AppMember.findByGuild(guild);
    // await Promise.all(members.map((member) => AppMember.delete(member)));

    // Direct DB deletion for efficiency and to avoid missing method issues
    await db.delete(members).where(eq(members.guildId, guild.id));

    // Now we can safely delete the guild
    await AppGuild.delete(guild);
  }
}
