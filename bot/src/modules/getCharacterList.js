"use strict";
require(`${process.cwd()}/alias`);
const { RealmError, ErrorCodes } = require("@errors");
const API = require("@api");

module.exports = async function getCharacterList(interaction) {
  const requestedUser = interaction.arguments.player ?? interaction.user;
  const names = await API.getNamesList(requestedUser.id, interaction.guild?.id);

  if (!names) throw new RealmError({ code: ErrorCodes.NoNamesList });

  const lists = [];
  let count = 0;
  let currentList = [];

  for (const char of names) {
    if (count === 25) {
      count = 0;
      lists.push(currentList);
      currentList = [];
    }
    count++;
    currentList.push({
      label: char.name,
      value: char.id.toString(),
      description: `Splat: ${char.splat}`,
    });
  }

  if (currentList.length) lists.push(currentList);
  return lists;
};
