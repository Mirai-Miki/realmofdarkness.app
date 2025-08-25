"use strict";
require(`${process.cwd()}/alias`);
const { Events } = require("discord.js");
const { RealmError, handleErrorDebug } = require("@errors");

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    try {
      if (interaction.isCommand()) {
        // Interaction is a command
        const client = interaction.client;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const discordResponse = await command.execute(interaction);
        if (discordResponse === "notRepliable") {
          return;
        } else if (discordResponse) {
          if (!interaction.replied && !interaction.deferred)
            await interaction.reply(discordResponse);
          else await interaction.editReply(discordResponse);
        } else throw new Error("No discordResponse");
        if (interaction.followUps) {
          for (const followUp of interaction.followUps) {
            await interaction.followUp(followUp);
          }
        }
      } else if (interaction.isMessageComponent()) {
        // Interaction is a message component
        interaction.splitId = interaction.customId.split("|");
        const id = interaction.splitId[0];
        const component = interaction.client.components?.get(id);
        if (!component) return;

        const discordResponse = await component.execute(interaction);
        if (discordResponse) {
          if (!interaction.replied && !interaction.deferred)
            await interaction.reply(discordResponse);
          else await interaction.editReply(discordResponse);
        } else throw new Error("No discordResponse");
      } else if (interaction.isAutocomplete()) {
        // Interaction is an autocomplete
        const command = interaction.client.commands.get(
          interaction.commandName
        );

        const choices = await command.autocomplete(interaction);
        await interaction.respond(choices);
      }
    } catch (error) {
      if (!error.discordResponse) {
        // Not a RoD Error, we need to debug
        const rodError = new RealmError({ cause: error.stack });
        error.discordResponse = rodError.discordResponse;
        error.debug = rodError.debug;
      }

      if (
        !interaction.isAutocomplete() &&
        !interaction.replied &&
        !interaction.deferred
      )
        await interaction.reply(error.discordResponse);
      else if (!interaction.isAutocomplete())
        await interaction.editReply(error.discordResponse);
      handleErrorDebug(error, interaction.client);
    }
  },
};
