"use strict";
require(`${process.cwd()}/alias`);
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} = require("discord.js");
const isAdminOrST = require("@modules/isAdminOrST");
const { RealmError, ErrorCodes } = require("@errors");
const API = require("@api");
const { ComponentCID } = require("@constants");
const getCharacterList = require("@modules/getCharacterList");

module.exports.command = async function (interaction) {
  interaction.arguments = await getArgs(interaction);
  interaction.nameLists = await getCharacterList(interaction);
  return {
    embeds: [getNamesListEmbed()],
    components: getNamesListComponenets(interaction),
    flags: MessageFlags.Ephemeral,
  };
};

module.exports.component = async function (interaction) {
  const characterId = interaction.values[0];
  if (!characterId) return;

  const character = await API.getCharacter({
    client: interaction.client,
    pk: characterId,
  });
  if (!character) throw new RealmError({ code: ErrorCodes.NoCharacter });

  return { embeds: [character.getEmbed()], components: [], content: null };
};

async function getArgs(interaction) {
  const args = {
    player: interaction.options.getUser("player"),
    showHistory: interaction.options.getBoolean("history") ?? false,
  };

  if (args.player && !interaction.guild)
    throw new RealmError({ code: ErrorCodes.GuildRequired });
  if (args.player) await isAdminOrST(interaction.member, interaction.guild.id);
  return args;
}

function getNamesListEmbed() {
  return new EmbedBuilder()
    .setTitle("Character Find")
    .setDescription(
      "Please select the character you wish to find.\n\nYou can now see all your characters with real time updates in one place using the [Realm of Darkness Website](https://realmofdarkness.app).\nTo use this feature all you need to do is Login and you will see a page showing all your characters."
    )
    .setColor("#7836ba");
}

function getNamesListComponenets(interaction) {
  const lists = interaction.nameLists;
  const components = [];
  let count = 0;

  for (const list of lists) {
    components.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`${ComponentCID.FindCharacter}|${count}`)
          .setPlaceholder("Choose a Character")
          .addOptions(list)
      )
    );
    count++;
  }
  return components;
}
