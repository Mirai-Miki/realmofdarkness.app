"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const { RealmAPIError, APIErrorCodes } = require("@errors");

/**
 * Takes in a character and saves the information to the Database
 * @param {Character} character The character class being saved
 * @returns Returns true on save or throws an Error if not.
 */
module.exports = async function saveCharacter(cData) {
  {
    const path = "character/save";
    const res = await postData(path, cData);

    switch (res?.status) {
      case 200: // Saved successfully
        return true;
      case 415: // Image provided is not valid
        throw new RealmAPIError({ code: APIErrorCodes.NotAnImage });
      case 413: // Image is too large
        throw new RealmAPIError({ code: APIErrorCodes.ImageTooLarge });
      case 304: // Not Modified - Duplicate character name
        throw new RealmAPIError({ code: APIErrorCodes.NameExists });
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
          )}\npost: ${JSON.stringify(cData, null, 2)}`,
        });
    }
  }
};
