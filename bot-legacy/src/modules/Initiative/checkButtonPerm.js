"use strict";
require(`${process.cwd()}/alias`);
const { RealmError, ErrorCodes } = require("@errors");
const isAdminOrSt = require("@modules/isAdminOrST");

module.exports = async function checkButtonPermissions(interaction, tracker) {
  const admin = await isAdminOrSt(interaction.member, interaction.guild.id);
  if (tracker.startMemberId != interaction.member.id && !admin)
    throw new RealmError({ code: ErrorCodes.InitInvalidButtonPerm });
};
