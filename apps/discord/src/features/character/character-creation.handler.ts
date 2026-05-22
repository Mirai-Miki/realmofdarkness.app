import { InterfaceHandler, type InterfaceContext } from "framework";
import { SplatSchema, UserError, RealmError } from "@realm/common";
import { logger } from "@realm/logger";
import {
  SPLAT_SELECTION_HANDLER_ID,
  decodeSplatSelectionId,
} from "./splat-selection.view";

/**
 * Interface handler for character creation splat selection.
 * Handles the dropdown interaction when user selects a character type.
 */
export class CharacterCreationInterfaceHandler extends InterfaceHandler {
  public readonly handlerId = SPLAT_SELECTION_HANDLER_ID as string;

  /**
   * Execute the splat selection handler.
   * Creates a new character with the selected splat and routes to next page.
   */
  public async execute(ctx: InterfaceContext): Promise<void> {
    const { interaction } = ctx;
    try {
      await interaction.deferUpdate();
      // Type guard - ensure this is a string select menu
      if (!interaction.isStringSelectMenu()) {
        throw new RealmError(
          "Invalid interaction type for character creation",
          {
            fields: {
              interactionType: interaction.type.toString(),
            },
          }
        );
      }

      const selectInteraction = interaction;

      // Decode custom ID to get character name
      const { characterName } = decodeSplatSelectionId(
        selectInteraction.customId
      );

      // Get selected splat from interaction
      const selectedValue = selectInteraction.values[0];
      const splatValidation = SplatSchema.safeParse(selectedValue);

      if (!splatValidation.success) {
        throw new UserError("Invalid character type selected", {
          fields: {
            selectedValue,
            errors: splatValidation.error.message,
          },
        });
      }

      const splat = splatValidation.data;

      logger.info("Character splat selected", {
        fields: {
          userId: interaction.user.id,
          ...(ctx.actor ? { rodUserId: ctx.actor.rodUserId } : {}),
          characterName,
          splat,
        },
      });

      // TODO: Implement character creation and next page routing
      // This requires:
      // 1. Character entity classes in @realm/core
      // 2. Edition-specific creation views (5th, 20th, CoD)
      // 3. Character repository for saving to database

      await interaction.editReply({
        content: `Character creation not yet implemented. Selected: ${characterName} as ${splat}`,
      });
    } catch (error) {
      // Handle errors - log if not a UserError, always respond to user
      if (!(error instanceof UserError)) {
        logger.error("Error in character creation interface handler", {
          fields: {
            userId: interaction.user.id,
            ...(ctx.actor ? { rodUserId: ctx.actor.rodUserId } : {}),
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }

      // Respond to user with error message
      const errorMessage =
        error instanceof UserError
          ? error.message
          : "An error occurred while creating your character. Please try again.";

      await interaction.editReply({ content: errorMessage });
    }
  }
}

/**
 * Export handler instance for auto-discovery by the framework.
 */
export const characterCreationInterfaceHandler =
  new CharacterCreationInterfaceHandler();
