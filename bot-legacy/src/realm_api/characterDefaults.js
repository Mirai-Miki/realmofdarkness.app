"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const getCharacterClass = require("@modules/getCharacterClass");
const { RealmAPIError, RealmError, ErrorCodes } = require("@errors/");

module.exports.get = async function (client, guildId, userId, splats = null) {
  const path = "chronicle/member/defaults/get";
  const data = {
    guild_id: guildId,
    user_id: userId,
    splats: splats,
  };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Found defaults
      const json = res.data;
      const CharacterClass = getCharacterClass(json.character.splat);
      const char = new CharacterClass({
        client: client,
        name: json.character.name,
      });
      await char.deserilize(json.character);
      return { ...json, character: char };
    case 204: // No defaults
      return null;
    default:
      throw new RealmAPIError({
        cause: `res_status: ${res?.status}\nmessage: ${JSON.stringify(
          res.data,
          null,
          2
        )}\npost: ${JSON.stringify(data, null, 2)}`,
      });
  }
};

module.exports.set = async function (
  guildId,
  userId,
  name,
  autoHunger,
  disable
) {
  const path = "chronicle/member/defaults/set";
  const data = {
    user_id: userId,
    guild_id: guildId,
    name: name,
    auto_hunger: autoHunger,
    disable: disable,
  };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Updated
      return;
    case 204: // No Character
      throw new RealmError({ code: ErrorCodes.NoCharacter });
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
