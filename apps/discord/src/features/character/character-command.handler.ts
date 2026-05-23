import {
  SlashCommandBuilder,
  MessageFlags,
  TextDisplayBuilder,
} from "discord.js";
import type { AutocompleteContext, CommandContext } from "framework";
import { CommandHandler } from "framework";
import { CharacterNameSchema, UserError } from "@realm/common";
import { logger } from "@realm/logger";
import { SplatSelectionView } from "./splat-selection.view";

/**
 * Command handler for /character command.
 * Routes to character creation or update based on whether the name exists.
 */
export class CharacterCommandHandler extends CommandHandler {
  public readonly data = new SlashCommandBuilder()
    .setName("character")
    .setDescription("Create or update a character")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the character")
        .setRequired(true)
        .setAutocomplete(true)
    ) as SlashCommandBuilder;

  /**
   * Execute the character command.
   * Validates the character name and routes to creation or update.
   */
  public async execute(ctx: CommandContext): Promise<void> {
    const { interaction } = ctx;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const characterName = interaction.options.getString("name", true);

      // Validate character name
      const validation = CharacterNameSchema.safeParse(characterName);
      if (!validation.success) {
        throw new UserError("Invalid character name", {
          fields: {
            name: characterName,
            errors: validation.error.message,
          },
        });
      }

      // TODO: Check if character exists in database
      // If exists -> route to update handler (not yet implemented)
      // For now, we always route to creation

      const infoFields: Record<string, string> = {
        user: interaction.user.displayName,
        characterName: validation.data,
      };
      if (ctx.actor) {
        infoFields.rodUserId = ctx.actor.id;
      }

      logger.info("Starting character creation", {
        fields: infoFields,
      });

      await interaction.editReply(SplatSelectionView.render(validation.data));
    } catch (error) {
      // Handle errors - log if not a UserError, always respond to user
      if (!(error instanceof UserError)) {
        const errorFields: Record<string, string> = {
          userId: interaction.user.id,
        };
        if (ctx.actor) {
          errorFields.rodUserId = ctx.actor.id;
        }

        logger.exception("Error in character command handler", error, {
          fields: errorFields,
        });
      }

      // Respond to user with error message
      const errorMessage = new TextDisplayBuilder().setContent(
        "An error occurred. Please try again."
      );

      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({
            components: [errorMessage],
            flags: MessageFlags.IsComponentsV2,
          });
        } else {
          // All messages should be components V2
          await interaction.reply({
            components: [errorMessage],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
          });
        }
      } catch {
        logger.debug("Failed to send error message to user", {
          error,
        });
      }
    }
  }

  /**
   * Handle autocomplete for character name.
   * Returns list of existing character names for the user.
   * TODO: Implement autocomplete logic to query character repository
   */
  public async autocomplete(ctx: AutocompleteContext): Promise<void> {
    const { interaction } = ctx;
    // TODO: Query CharacterRepository.findAllByUser()
    // TODO: Filter by focused value
    // TODO: Return up to 25 matches
    await interaction.respond([]);
  }
}

/**
 * Export handler instance for auto-discovery by the framework.
 */
export const characterCommandHandler = new CharacterCommandHandler();
