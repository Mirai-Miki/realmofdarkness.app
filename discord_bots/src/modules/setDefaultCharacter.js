"use strict";
require(`${process.cwd()}/alias`);
const { EmbedBuilder, MessageFlags } = require("discord.js");
const { RealmError, ErrorCodes } = require("@errors");
const API = require("@api");

module.exports = async function setDefaultCharacter(interaction) {
  const level = await API.getSupporterLevel(interaction.user.id);
  if (level === 0) throw new RealmError({ code: ErrorCodes.RequiresFledgling });
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
    name: interaction.options.getString("name"),
    auto_hunger: interaction.options.getBoolean("auto_hunger") ?? false,
    disable: interaction.options.getBoolean("disable") ?? false,
  };

  if (!interaction.guild)
    throw new RealmError({ code: ErrorCodes.GuildRequired });
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

  if (defaults.name) embed.addFields({ name: "Name:", value: defaults.name });
  if (defaults.auto_hunger)
    embed.addFields({ name: "Auto Hunger:", value: "True" });
  return embed;
}
