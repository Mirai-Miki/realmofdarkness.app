import type {
  AutocompleteInteraction,
  BaseInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Interaction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { logger } from "@realm/logger";

import {
  CommandHandler,
  InterfaceHandler,
} from "../entities/interaction-handlers.entity";
import { registry } from "../registry";
import type {
  AutocompleteContext,
  BaseInteractionContext,
  CommandContext,
  ContextMenuContext,
  InterfaceContext,
} from "./interaction-context";
import { parseHandlerIdFromCustomId } from "./interaction-context";
import { composeMiddleware } from "./interaction-middleware";
import { ensureActorMiddleware } from "./middlewares/ensure-actor.middleware";

/**
 * Main router for handling Discord interactions.
 * Routes interactions to the appropriate handler based on type:
 * - Slash Commands → CommandHandler
 * - Buttons/Modals/Selects → InterfaceHandler
 * - Autocomplete → CommandHandler.autocomplete
 * - Context Menus → Future implementation
 */
export class InteractionRouter {
  private readonly runBaseMiddleware = composeMiddleware<
    BaseInteractionContext<BaseInteraction>
  >([ensureActorMiddleware<BaseInteraction>()]);

  /**
   * Route an interaction to the appropriate handler.
   * @param interaction - The Discord interaction to route
   */
  public async route(interaction: Interaction): Promise<void> {
    try {
      if (interaction.isChatInputCommand()) {
        await this.handleCommand(interaction);
        return;
      }

      if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        await this.handleInterface(interaction);
        return;
      }

      if (interaction.isAutocomplete()) {
        await this.handleAutocomplete(interaction);
        return;
      }

      if (interaction.isContextMenuCommand()) {
        await this.handleContextMenu(interaction);
        return;
      }

      logger.warn("Unknown interaction type", {
        fields: { type: interaction.type.toString() },
      });
    } catch (error) {
      logger.fatal("Error handling interaction", { error });
    }
  }

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

    const ctx: CommandContext = {
      interaction,
    };

    await this.runBaseMiddleware(ctx, async () => handler.execute(ctx));
  }

  private async handleInterface(
    interaction: MessageComponentInteraction | ModalSubmitInteraction
  ): Promise<void> {
    const handlerId = parseHandlerIdFromCustomId(interaction.customId);

    const handler = registry.getInteractionHandler(handlerId);

    if (!handler) {
      logger.warn("No interface handler found", {
        fields: { handlerId },
      });
      return;
    }

    if (!(handler instanceof InterfaceHandler)) {
      logger.warn("Handler is not an InterfaceHandler", {
        fields: { handlerId },
      });
      return;
    }

    logger.debug("Executing interface", { fields: { handlerId } });

    const ctx: InterfaceContext = {
      interaction,
    };

    await this.runBaseMiddleware(ctx, async () => handler.execute(ctx));
  }

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

    const ctx: AutocompleteContext = {
      interaction,
    };

    await this.runBaseMiddleware(
      ctx,
      async () => handler.autocomplete?.(ctx) ?? Promise.resolve()
    );
  }

  private async handleContextMenu(
    interaction: ContextMenuCommandInteraction
  ): Promise<void> {
    logger.debug("Context menu interaction received", {
      fields: { commandName: interaction.commandName },
    });

    const ctx: ContextMenuContext = {
      interaction,
    };

    await this.runBaseMiddleware(ctx, async () => Promise.resolve());

    // TODO: Implement context menu routing
    return Promise.resolve();
  }
}
