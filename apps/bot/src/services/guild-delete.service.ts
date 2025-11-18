import type { Guild } from "discord.js";

export class GuildDeleteService {
  static async execute(guild: Guild) {
    // We need to unset all character guilds via a character guild update

    // Before we delete the guild, we need to delete all members to force member delete events
    const members = await AppMember.findByGuild(guild);
    await Promise.all(members.map((member) => AppMember.delete(member)));

    // Now we can safely delete the guild
    await AppGuild.delete(guild);
  }
}
