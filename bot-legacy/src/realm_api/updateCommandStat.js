"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const { RealmAPIError } = require("@errors");

module.exports = async function updateCommandStat(interaction) {
  const path = "stats/command/update";
  let commandName = "/" + interaction.commandName;
  commandName += ` ${interaction.options.getSubcommand(false) ?? ""}`;
  commandName.trim();

  const data = {
    user_id: interaction.user.id,
    bot_id: interaction.client.user.id,
    command: commandName,
  };
  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Updated
      return true;
    default:
      throw new RealmAPIError({
        cause: `res_status: ${res?.status}\nres: ${JSON.stringify(
          res?.data,
          null,
          2
        )}\npost: ${JSON.stringify(data, null, 2)}`,
      });
  }
};
