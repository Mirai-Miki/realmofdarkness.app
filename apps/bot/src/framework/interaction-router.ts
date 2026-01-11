import type {
  Interaction,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  AutocompleteInteraction,
  ContextMenuCommandInteraction,
} from "discord.js";
import { logger } from "@realm/logger";
import { registry } from "./registry";
import { CommandHandler } from "./entities/interaction-handlers.entity";

/**
 * Main router for handling Discord interactions.
 * Routes interactions to the appropriate handler based on type:
 * - Slash Commands → CommandHandler
 * - Buttons/Modals/Selects → InterfaceHandler
 * - Autocomplete → CommandHandler.autocomplete
 * - Context Menus → Future implementation
 */
export class InteractionRouter {
  /**
   * Route an interaction to the appropriate handler.
   * @param interaction - The Discord interaction to route
   */
  public async route(interaction: Interaction): Promise<void> {
    try {
      // Slash Command
      if (interaction.isChatInputCommand()) {
        await this.handleCommand(interaction);
      } else if (
        // Interface Interaction
        interaction.isMessageComponent() ||
        interaction.isModalSubmit()
      ) {
        await this.handleInterface(interaction);
      } else if (interaction.isAutocomplete()) {
        // Autocomplete Interaction
        await this.handleAutocomplete(interaction);
      } else if (interaction.isContextMenuCommand()) {
        // Context Menu Interaction
        await this.handleContextMenu(interaction);
      } else {
        // Unknown Interaction Type
        logger.warn("Unknown interaction type", {
          fields: { type: interaction.type.toString() },
        });
      }
    } catch (error) {
      logger.fatal("Error handling interaction", { error });
    }
  }

  /**
   * Handle slash command interactions.
   */
  private async handleCommand(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const handler = registry.getInteractionHandler(interaction.commandName);

    if (!handler) {
      logger.warn("No command handler found", {
        fields: { commandName: interaction.commandName },
      });
      return;
    }

    if (!(handler instanceof CommandHandler)) {
      logger.warn("Handler is not a CommandHandler", {
        fields: { commandName: interaction.commandName },
      });
      return;
    }

    logger.debug("Executing command", {
      fields: { commandName: interaction.commandName },
    });
    await handler.execute(interaction);
  }

  /**
   * Handle interface interactions (buttons, modals, select menus).
   */
  private async handleInterface(
    interaction: MessageComponentInteraction | ModalSubmitInteraction
  ): Promise<void> {
    // Extract handler ID from custom ID
    // Format: "handler_id:params" or just "handler_id"
    const [handlerId] = interaction.customId.split(":");

    const handler = registry.getInteractionHandler(handlerId);

    if (!handler) {
      logger.warn("No interface handler found", {
        fields: { handlerId },
      });
      return;
    }

    logger.debug("Executing interface", { fields: { handlerId } });
    await handler.execute(interaction);
  }

  /**
   * Handle autocomplete interactions.
   */
  private async handleAutocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    const handler = registry.getInteractionHandler(interaction.commandName);

    if (!handler) {
      logger.warn("No autocomplete handler found", {
        fields: { commandName: interaction.commandName },
      });
      return;
    }

    if (!(handler instanceof CommandHandler) || !handler.autocomplete) {
      logger.warn("Handler does not support autocomplete", {
        fields: { commandName: interaction.commandName },
      });
      return;
    }

    logger.debug("Executing autocomplete", {
      fields: { commandName: interaction.commandName },
    });
    await handler.autocomplete(interaction);
  }

  /**
   * Handle context menu interactions.
   */
  private async handleContextMenu(
    interaction: ContextMenuCommandInteraction
  ): Promise<void> {
    logger.debug("Context menu interaction received", {
      fields: { commandName: interaction.commandName },
    });
    // TODO: Implement context menu routing
    return Promise.resolve();
  }
}
