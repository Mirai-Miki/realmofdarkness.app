"use strict";
require(`${process.cwd()}/alias`);
const { MessageFlags } = require("discord.js");
const { RealmError, ErrorCodes } = require("@errors");
const isAdminOrST = require("@modules/isAdminOrST");
const getCharacterClass = require("@modules/getCharacterClass");
const parseAutocompleteCharacter = require("@modules/parseAutocompleteCharacter");
const API = require("@api");

module.exports.new = async function (interaction, splat) {
  const CharacterClass = getCharacterClass(splat.slug);
  const options = interaction.arguments;
  options.command = "New Character";
  const char = new CharacterClass({
    client: interaction.client,
    name: options.name,
  });
  await char.setDiscordInfo({
    user: interaction.user,
    guild: interaction.guild,
  });

  char.setFields(options);
  await char.save(interaction.client);
  return {
    flags: MessageFlags.Ephemeral,
    embeds: [char.getEmbed(options.notes)],
  };
};

module.exports.set = async function (interaction, splat) {
  const options = interaction.arguments;
  options.command = "Set Character";

  const parsedChar = parseAutocompleteCharacter(options.name, splat?.slug);

  const char = await API.getCharacter({
    client: interaction.client,
    name: parsedChar.name,
    user: interaction.user,
    guild: interaction.guild ?? null,
    splat: parsedChar.splat,
    pk: parsedChar.pk,
  });

  if (!char) throw new RealmError({ code: ErrorCodes.NoCharacter });
  char.setFields(options);
  await char.save(interaction.client);
  interaction.character = char;
  return {
    flags: MessageFlags.Ephemeral,
    embeds: [char.getEmbed(options.notes)],
  };
};

module.exports.update = async function (interaction, splat) {
  const options = interaction.arguments;
  options.command = "Update Character";
  let requestedUser = interaction.user;

  const parsedChar = parseAutocompleteCharacter(options.name, splat?.slug);

  // An ST is trying to change another players character
  if (options.player && !interaction.guild)
    throw new RealmError({ code: ErrorCodes.GuildRequired });
  else if (
    options.player &&
    !(await isAdminOrST(interaction.member, interaction.guild.id))
  ) {
    throw new RealmError({ code: ErrorCodes.NotAdminOrST });
  } else if (options.player) requestedUser = options.player;

  const char = await API.getCharacter({
    client: interaction.client,
    name: parsedChar.name,
    user: requestedUser,
    splat: parsedChar.splat,
    guild: interaction.guild ?? null,
    pk: parsedChar.pk,
  });
  if (!char) throw new RealmError({ code: ErrorCodes.NoCharacter });
  if (options.action) {
    if (char.blood.current <= 0)
      throw new RealmError({ code: ErrorCodes.NoBlood });
    const invalidKey = Object.keys(options).find(
      (key) => key in char.health && char.health[key] === 0
    );
    if (
      invalidKey ||
      (char.health.aggravated <= 0 && options.action === "agg_damage")
    ) {
      throw new RealmError({ code: ErrorCodes.NoDamage });
    }
  }
  char.updateFields(options);
  await char.save(interaction.client);
  interaction.character = char;
  return {
    flags: MessageFlags.Ephemeral,
    embeds: [char.getEmbed(options.notes)],
  };
};
