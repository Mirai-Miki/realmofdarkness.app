import {
  ActionRowBuilder,
  TextDisplayBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  type InteractionEditReplyOptions,
  SeparatorBuilder,
} from "discord.js";
import { Splat, CharacterNameSchema } from "@realm/common";

/**
 * Handler ID for the splat selection interface.
 * Used by the interface handler to route interactions.
 */
export const SPLAT_SELECTION_HANDLER_ID = "character_creation";

/**
 * Encode character name into custom ID for splat selection dropdown.
 *
 * @param characterName - Validated character name
 * @returns Custom ID string in format: "character_creation:characterName"
 */
export function encodeSplatSelectionId(characterName: string): string {
  return `${SPLAT_SELECTION_HANDLER_ID}:${characterName}`;
}

/**
 * Decode custom ID to extract character name.
 *
 * @param customId - Custom ID from interaction
 * @returns Parsed and validated character name
 * @throws {Error} If custom ID format is invalid or name fails validation
 */
export function decodeSplatSelectionId(customId: string): {
  characterName: string;
} {
  const parts = customId.split(":");

  if (parts.length !== 2) {
    throw new Error(
      `Invalid custom ID format: expected 2 parts, got ${parts.length}`
    );
  }

  const [handlerId, characterName] = parts;

  if (handlerId !== SPLAT_SELECTION_HANDLER_ID) {
    throw new Error(
      `Invalid handler ID: expected ${SPLAT_SELECTION_HANDLER_ID}, got ${handlerId}`
    );
  }

  // Validate character name
  const validation = CharacterNameSchema.safeParse(characterName);
  if (!validation.success) {
    throw new Error(
      `Invalid character name in custom ID: ${validation.error.message}`
    );
  }

  return { characterName: validation.data };
}

/**
 * Renders the splat selection page for character creation using Components V2.
 * This is Page 1 of the character creation wizard.
 */
export class SplatSelectionView {
  /**
   * Render the splat selection page using Components V2.
   *
   * @param characterName - Name of the character to create
   * @returns Discord message options with container and select menu
   */
  public static render(characterName: string): InteractionEditReplyOptions {
    // Header section
    const header = new TextDisplayBuilder().setContent(
      `# Character Creation\n\n` +
        `Would you like to create the character **${characterName}**?`
    );

    const seperator = new SeparatorBuilder().setSpacing(
      SeparatorSpacingSize.Large
    );

    // Instructions section
    const instructions = new TextDisplayBuilder().setContent(
      `**Select a character type from the menu below to begin creation.**`
    );

    // Info section
    const info = new TextDisplayBuilder().setContent(
      `ℹ️ This character will belong to this server (you can change this later).\n\n` +
        `💡 **Pro Tip:** The website offers a more complete character sheet experience!`
    );

    // Splat selection menu (outside container)
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(encodeSplatSelectionId(characterName))
      .setPlaceholder("Select a character type...")
      .addOptions(
        Object.entries(Splat).map(([key, value]) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(this.formatSplatLabel(key))
            .setValue(value)
        )
      );

    const selectRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    return {
      components: [header, seperator, instructions, selectRow, seperator, info],
      flags: MessageFlags.IsComponentsV2,
    };
  }

  /**
   * Format splat key into human-readable label.
   * Example: "Vampire20th" -> "Vampire (20th Anniversary)"
   */
  private static formatSplatLabel(key: string): string {
    // Extract game line and edition
    const match = key.match(/^([A-Za-z]+)(20th|5th|CoD)?$/);
    if (!match) return key;

    const [, gameLine, edition] = match;
    const gameLineName = gameLine.replace(/([A-Z])/g, " $1").trim();

    if (edition === "20th") {
      return `${gameLineName} (20th Anniversary)`;
    } else if (edition === "5th") {
      return `${gameLineName} (5th Edition)`;
    } else if (edition === "CoD") {
      return `${gameLineName} (Chronicles of Darkness)`;
    }

    return gameLineName;
  }
}
