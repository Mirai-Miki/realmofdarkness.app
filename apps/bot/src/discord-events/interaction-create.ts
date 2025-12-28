import { Events } from "discord.js";
import type {
  Interaction,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  AutocompleteInteraction,
} from "discord.js";
import { logger } from "@realm/logger";

/**
 * Discord InteractionCreate event handler.
 * Routes all interactions to appropriate handlers and provides centralized error handling.
 */
module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: Interaction): Promise<void> {
    try {
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
      } else if (interaction.isMessageComponent()) {
        await handleMessageComponent(interaction);
      } else if (interaction.isAutocomplete()) {
        await handleAutocomplete(interaction);
      }
    } catch (error) {
      logger.exception("Error handling interaction", error);
    }
  },
};

/**
 * Handle slash command interactions.
 */
async function handleCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn("Received unknown command", {
      fields: { commandName: interaction.commandName },
    });
    return;
  }

  await command.execute(interaction);
}

/**
 * Handle message component interactions (buttons, select menus).
 */
async function handleMessageComponent(
  interaction: MessageComponentInteraction
): Promise<void> {
  const [componentId] = interaction.customId.split("|");
  const component = interaction.client.components.get(componentId);

  if (!component) {
    logger.warn("Received unknown component", {
      fields: { componentId },
    });
    return;
  }

  await component.execute(interaction);
}

/**
 * Handle autocomplete interactions.
 */
async function handleAutocomplete(
  interaction: AutocompleteInteraction
): Promise<void> {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command?.autocomplete) {
    logger.warn("Received autocomplete for unknown command", {
      fields: { commandName: interaction.commandName },
    });
    return;
  }

  await command.autocomplete(interaction);
}
