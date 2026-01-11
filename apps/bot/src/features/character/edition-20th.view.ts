import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type BaseMessageOptions,
} from "discord.js";
import type { Character20thData } from "@realm/common";
import { Colors } from "types";

/**
 * Renders pages common to all 20th Anniversary Edition characters.
 * These pages handle Health and Willpower trackers.
 */
export class Edition20thView {
  /**
   * Render the Health and Willpower trackers page for 20th Edition characters.
   *
   * @param characterData - Character data containing health and willpower
   * @param currentPage - Current page number
   * @param totalPages - Total number of pages in wizard
   * @returns Discord message options with health/willpower display
   */
  public static renderTrackersPage(
    characterData: Character20thData,
    currentPage: number,
    totalPages: number
  ): BaseMessageOptions {
    const embed = new EmbedBuilder()
      .setTitle(`${characterData.name} - Trackers`)
      .setDescription(
        "Manage your character's Health and Willpower.\n\n" +
          "💡 Use +/- buttons to adjust values."
      )
      .setColor(Colors.Info)
      .addFields(
        {
          name: "❤️ Health",
          value: this.renderHealthTracker(characterData.health),
          inline: false,
        },
        {
          name: "💪 Willpower",
          value: this.renderWillpowerTracker(characterData.willpower),
          inline: false,
        }
      )
      .setFooter({ text: `Step ${currentPage} of ${totalPages}: Trackers` });

    // Health adjustment buttons
    const healthRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`health:bashing:increase:${characterData.id}`)
        .setLabel("+ Bashing")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.isHealthFull(characterData.health)),
      new ButtonBuilder()
        .setCustomId(`health:bashing:decrease:${characterData.id}`)
        .setLabel("- Bashing")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(characterData.health.bashing === 0),
      new ButtonBuilder()
        .setCustomId(`health:lethal:increase:${characterData.id}`)
        .setLabel("+ Lethal")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(this.isHealthFull(characterData.health)),
      new ButtonBuilder()
        .setCustomId(`health:lethal:decrease:${characterData.id}`)
        .setLabel("- Lethal")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(characterData.health.lethal === 0),
      new ButtonBuilder()
        .setCustomId(`health:aggravated:increase:${characterData.id}`)
        .setLabel("+ Aggravated")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(this.isHealthFull(characterData.health))
    );

    const healthRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`health:aggravated:decrease:${characterData.id}`)
        .setLabel("- Aggravated")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(characterData.health.aggravated === 0),
      new ButtonBuilder()
        .setCustomId(`health:heal:all:${characterData.id}`)
        .setLabel("Heal All")
        .setStyle(ButtonStyle.Success)
        .setDisabled(
          characterData.health.bashing === 0 &&
            characterData.health.lethal === 0 &&
            characterData.health.aggravated === 0
        )
    );

    // Willpower adjustment buttons
    const willpowerRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`willpower:decrease:${characterData.id}`)
        .setLabel("- Willpower")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(characterData.willpower.current === 0),
      new ButtonBuilder()
        .setCustomId(`willpower:increase:${characterData.id}`)
        .setLabel("+ Willpower")
        .setStyle(ButtonStyle.Success)
        .setDisabled(
          characterData.willpower.current >= characterData.willpower.total
        ),
      new ButtonBuilder()
        .setCustomId(`willpower:restore:full:${characterData.id}`)
        .setLabel("Restore All")
        .setStyle(ButtonStyle.Success)
        .setDisabled(
          characterData.willpower.current === characterData.willpower.total
        )
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
      components: [healthRow, healthRow2, willpowerRow, navRow],
    };
  }

  /**
   * Render health tracker visualization.
   */
  private static renderHealthTracker(health: {
    total: number;
    bashing: number;
    lethal: number;
    aggravated: number;
  }): string {
    const totalDamage = health.bashing + health.lethal + health.aggravated;
    const healthy = health.total - totalDamage;

    let tracker = "";

    // Show boxes for each type of damage
    tracker += "⬜".repeat(healthy); // Healthy boxes
    tracker += "🟦".repeat(health.bashing); // Bashing damage
    tracker += "🟥".repeat(health.lethal); // Lethal damage
    tracker += "⬛".repeat(health.aggravated); // Aggravated damage

    return (
      `${tracker}\n` +
      `**Total:** ${health.total} | **Healthy:** ${healthy} | ` +
      `**Bashing:** ${health.bashing} | **Lethal:** ${health.lethal} | **Aggravated:** ${health.aggravated}`
    );
  }

  /**
   * Render willpower tracker visualization.
   */
  private static renderWillpowerTracker(willpower: {
    current: number;
    total: number;
  }): string {
    const spent = willpower.total - willpower.current;

    const filled = "🔵".repeat(willpower.current);
    const empty = "⚫".repeat(spent);

    return (
      `${filled}${empty}\n` +
      `**Current:** ${willpower.current} / ${willpower.total}`
    );
  }

  /**
   * Check if health tracker is full (no more damage can be taken).
   */
  private static isHealthFull(health: {
    total: number;
    bashing: number;
    lethal: number;
    aggravated: number;
  }): boolean {
    const totalDamage = health.bashing + health.lethal + health.aggravated;
    return totalDamage >= health.total;
  }
}
