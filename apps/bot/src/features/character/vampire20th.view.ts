import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type BaseMessageOptions,
} from "discord.js";
import type { Vampire20thData } from "@realm/common";

/**
 * Renders pages specific to Vampire 20th Anniversary Edition characters.
 * These pages handle Blood Pool and Morality (Humanity/Path) trackers.
 */
export class Vampire20thView {
  /**
   * Render the Blood Pool and Morality page for Vampire20th characters.
   *
   * @param characterData - Vampire character data
   * @param currentPage - Current page number
   * @param totalPages - Total number of pages in wizard
   * @returns Discord message options with blood/morality display
   */
  public static renderVampireTrackersPage(
    characterData: Vampire20thData,
    currentPage: number,
    totalPages: number
  ): BaseMessageOptions {
    const embed = new EmbedBuilder()
      .setTitle(`${characterData.name} - Vampire Trackers`)
      .setDescription(
        "Manage your vampire's Blood Pool and Morality.\n\n" +
          "💡 Use +/- buttons to adjust blood points."
      )
      .setColor(0x8b0000) // Dark red for vampires
      .addFields(
        {
          name: "🩸 Blood Pool",
          value: this.renderBloodPoolTracker(characterData.bloodPool),
          inline: false,
        },
        {
          name: `😇 ${characterData.morality.name}`,
          value: this.renderMoralityTracker(characterData.morality),
          inline: false,
        }
      )
      .setFooter({
        text: `Step ${currentPage} of ${totalPages}: Vampire Trackers`,
      });

    // Blood Pool adjustment buttons
    const bloodRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`blood:decrease:${characterData.id}`)
        .setLabel("- Blood")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(characterData.bloodPool.current === 0),
      new ButtonBuilder()
        .setCustomId(`blood:increase:${characterData.id}`)
        .setLabel("+ Blood")
        .setStyle(ButtonStyle.Success)
        .setDisabled(
          characterData.bloodPool.current >= characterData.bloodPool.total
        ),
      new ButtonBuilder()
        .setCustomId(`blood:fill:${characterData.id}`)
        .setLabel("Fill Blood Pool")
        .setStyle(ButtonStyle.Success)
        .setDisabled(
          characterData.bloodPool.current === characterData.bloodPool.total
        ),
      new ButtonBuilder()
        .setCustomId(`blood:empty:${characterData.id}`)
        .setLabel("Empty Blood Pool")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(characterData.bloodPool.current === 0)
    );

    // Navigation buttons
    const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`creation:previous:${characterData.id}`)
        .setLabel("◀ Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 1),
      new ButtonBuilder()
        .setCustomId(`creation:next:${characterData.id}`)
        .setLabel("Next ▶")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages)
    );

    return {
      embeds: [embed],
      components: [bloodRow, navRow],
    };
  }

  /**
   * Render blood pool tracker visualization.
   */
  private static renderBloodPoolTracker(bloodPool: {
    current: number;
    total: number;
  }): string {
    const filled = "🔴".repeat(bloodPool.current);
    const empty = "⚫".repeat(bloodPool.total - bloodPool.current);

    return (
      `${filled}${empty}\n` +
      `**Current:** ${bloodPool.current} / ${bloodPool.total} blood points`
    );
  }

  /**
   * Render morality tracker visualization.
   * In V20, morality is typically Humanity (rating 0-10) or a Path of Enlightenment.
   */
  private static renderMoralityTracker(morality: {
    value: number;
    name: string;
  }): string {
    const maxRating = 10;
    const filled = "⭐".repeat(morality.value);
    const empty = "☆".repeat(maxRating - morality.value);

    return (
      `${filled}${empty}\n` +
      `**Rating:** ${morality.value} / ${maxRating}\n` +
      `*Note: ${morality.name} represents your character's connection to their moral compass.*`
    );
  }
}
