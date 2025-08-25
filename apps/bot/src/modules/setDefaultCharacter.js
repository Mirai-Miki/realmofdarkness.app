"use strict";
require(`${process.cwd()}/alias`);
const { EmbedBuilder, MessageFlags } = require("discord.js");
const { RealmError, ErrorCodes } = require("@errors");
const verifySupporterStatus = require("@modules/verifySupporterStatus");
const API = require("@api");
const getCharacter = require("@modules/getCharacter");

module.exports = async function setDefaultCharacter(interaction) {
  if (!interaction.guild)
    throw new RealmError({ code: ErrorCodes.GuildRequired });

  await verifySupporterStatus.mortal(interaction.user.id);
  interaction.arguments = await getArgs(interaction);

  if (!interaction.arguments.name && !interaction.arguments.disable) {
    const defaults = await API.characterDefaults.get(
      interaction.client,
      interaction.guild.id,
      interaction.user.id
    );

    return {
      embeds: [getDefaultEmbed(defaults)],
      flags: MessageFlags.Ephemeral,
    };
  } else {
    await API.characterDefaults.set(
      interaction.guild.id,
      interaction.user.id,
      interaction.arguments.name,
      interaction.arguments.auto_hunger,
      interaction.arguments.disable
    );

    return {
      embeds: [getSetEmbed(interaction.arguments)],
      flags: MessageFlags.Ephemeral,
    };
  }
};

async function getArgs(interaction) {
  const args = {
    autocomplete: interaction.options.getString("name"),
    auto_hunger: interaction.options.getBoolean("auto_hunger") ?? false,
    disable: interaction.options.getBoolean("disable") ?? false,
  };
  if (args.autocomplete) {
    const character = await getCharacter(args.autocomplete, interaction, true);
    args.name = character.name; // getCharacter throws an error if not found, so we can assume it's valid
  } else {
    args.name = null; // No character selected
  }
  return args;
}

function getSetEmbed(args) {
  const embed = new EmbedBuilder();
  embed.setTitle("Defaults set");
  embed.setColor("#25ad1d");

  if (args.disable) embed.setTitle("Defaults Disabled");
  if (args.name) embed.addFields({ name: "Name:", value: args.name });
  if (args.auto_hunger)
    embed.addFields({ name: "Auto Hunger:", value: "True" });
  return embed;
}

function getDefaultEmbed(defaults) {
  const embed = new EmbedBuilder();
  embed.setTitle("Defaults");
  embed.setColor("#9247c4");

  if (defaults === null) {
    embed.setTitle("No Defaults Set");
    return embed;
  }

  if (defaults.character?.name)
    embed.addFields({ name: "Name:", value: defaults.character.name });
  if (defaults.auto_hunger)
    embed.addFields({ name: "Auto Hunger:", value: "True" });
  return embed;
}
