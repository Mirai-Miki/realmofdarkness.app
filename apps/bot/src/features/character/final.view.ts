import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type BaseMessageOptions,
} from "discord.js";
import type { CharacterData } from "@realm/common";
import { Colors } from "types";

/**
 * Renders the final page of the character creation wizard.
 * Displays success message and directs users to the website for full sheet editing.
 */
export class FinalView {
  /**
   * Render the final success page.
   *
   * @param characterData - The newly created character
   * @param websiteUrl - Base URL for the website (optional)
   * @returns Discord message options with success message and website link
   */
  public static render(
    characterData: CharacterData,
    websiteUrl?: string
  ): BaseMessageOptions {
    const embed = new EmbedBuilder()
      .setTitle("✅ Character Created Successfully!")
      .setDescription(
        `**${characterData.name}** has been created!\n\n` +
          `🎭 **Type:** ${this.formatSplat(characterData.splat)}\n` +
          `🆔 **Character ID:** \`${characterData.id}\`\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `**Next Steps:**\n` +
          `📝 Visit the website to complete your character sheet\n` +
          `🎲 Use slash commands to roll dice and manage your character\n` +
          `📊 Track health, willpower, and other stats in Discord\n\n` +
          `💡 **Pro Tip:** The website offers the full character creation experience ` +
          `with detailed backgrounds, disciplines, attributes, and more!`
      )
      .setColor(Colors.Success)
      .setFooter({ text: "Character creation complete!" })
      .setTimestamp();

    const components: ActionRowBuilder<ButtonBuilder>[] = [];

    // Add website button if URL provided
    if (websiteUrl) {
      const websiteRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Open Character Sheet")
          .setStyle(ButtonStyle.Link)
          .setURL(`${websiteUrl}/characters/${characterData.id}`)
          .setEmoji("🌐")
      );
      components.push(websiteRow);
    }

    // Action buttons
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`character:view:${characterData.id}`)
        .setLabel("View Character")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👁️"),
      new ButtonBuilder()
        .setCustomId(`character:edit:${characterData.id}`)
        .setLabel("Edit in Discord")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("✏️"),
      new ButtonBuilder()
        .setCustomId(`creation:dismiss:${characterData.id}`)
        .setLabel("Dismiss")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("❌")
    );
    components.push(actionRow);

    return {
      embeds: [embed],
      components,
    };
  }

  /**
   * Format splat into human-readable string.
   */
  private static formatSplat(splat: string): string {
    const match = splat.match(/^([a-z]+)(20th|5th|cod)?$/i);
    if (!match) return splat;

    const [, gameLine, edition] = match;
    const gameLineName =
      gameLine.charAt(0).toUpperCase() +
      gameLine.slice(1).replace(/([A-Z])/g, " $1");

    if (edition === "20th") {
      return `${gameLineName} (20th Anniversary)`;
    } else if (edition === "5th") {
      return `${gameLineName} (5th Edition)`;
    } else if (edition === "cod" || edition === "CoD") {
      return `${gameLineName} (Chronicles of Darkness)`;
    }

    return gameLineName;
  }
}
