"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");

module.exports = async function commandDatabaseUpdate(interaction) {
  if (interaction.guild) await API.updateGuild(interaction.guild);
  const user = interaction.member ?? interaction.user;
  await API.updateUser(user, true);
  API.updateCommandStat(interaction);
};
