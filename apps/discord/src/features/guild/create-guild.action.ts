import type { Guild } from "discord.js";

import { logger } from "@realm/logger";
import {
  DiscordGuildRepository,
  DiscordGuildChronicleRepository,
  ChronicleRepository,
} from "@realm/repositories";

/**
 * Action coordinates the initial creation and setup of a Discord Guild
 * and its default associated Chronicle in our database.
 */
export class CreateGuildAction {
  private guildRepository: DiscordGuildRepository;
  private linkRepository: DiscordGuildChronicleRepository;
  private chronicleRepository: ChronicleRepository;

  constructor() {
    this.guildRepository = new DiscordGuildRepository();
    this.linkRepository = new DiscordGuildChronicleRepository();
    this.chronicleRepository = new ChronicleRepository();
  }

  /**
   * Executes the action to ensure a guild and its default Chronicle are created.
   * If the guild is already tracked, the execution is skipped.
   *
   * @param guild - The Discord guild to create and configure.
   * @returns A promise that resolves when the operation is complete.
   */
  public async execute(guild: Guild): Promise<void> {
    const isTracked = await this.guildRepository.exists(guild.id);
    if (isTracked) {
      return;
    }

    logger.info(
      `New guild joined: ${guild.name} (${guild.id}). Setting up default Chronicle.`
    );

    // Create the guild record in our database
    await this.guildRepository.upsert({
      discordId: guild.id,
      name: guild.name,
      iconUrl: guild.iconURL() || undefined,
    });

    // Create the default Chronicle named after the guild
    const chronicle = await this.chronicleRepository.create({
      name: guild.name,
      iconUrl: guild.iconURL() || undefined,
    });

    // Link the new Chronicle to the Guild
    await this.linkRepository.link({
      discordId: guild.id,
      chronicleId: chronicle.id,
    });

    logger.info(
      `Successfully created and linked default Chronicle (${chronicle.id}) for guild ${guild.id}`
    );
  }
}
