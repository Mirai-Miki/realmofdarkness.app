"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const { RealmAPIError, APIErrorCodes } = require("@errors");

module.exports = async function newCharacter(data) {
  {
    const path = "character/new";
    const res = await postData(path, data);
    switch (res?.status) {
      case 201: // Saved successfully
        return;
      case 304: // Not Modified -- existing character
        throw new RealmAPIError({ code: APIErrorCodes.CharacterExists });
      case 415: // Image provided is not valid
        throw new RealmAPIError({ code: APIErrorCodes.NotAnImage });
      case 413: // Image is too large
        throw new RealmAPIError({ code: APIErrorCodes.ImageTooLarge });
      case 409: // Conflict -- Too many characters
        throw new RealmAPIError({ code: APIErrorCodes.CharacterLimitReached });
      case 422: // Unprocessable Entity -- Name contains special characters
        throw new RealmAPIError({
          code: APIErrorCodes.NameContainsSpecialCharacter,
        });
      default:
        throw new RealmAPIError({
          cause: `res_status: ${res?.status}\nres: ${JSON.stringify(
            res?.data,
            null,
            2
          )}\npost: ${JSON.stringify(data, null, 2)}`,
        });
    }
  }
};
