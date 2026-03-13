"use strict";
const { postData } = require("./postData");
const { RealmAPIError } = require("@errors");

module.exports = async function getSupporterLevel(userId) {
  const path = "user/supporter/get";
  const data = { user_id: userId };

  let res = await postData(path, data);
  switch (res?.status) {
    case 200: // Fetched level
      return res.data.level;
    case 204: // No User
      return 0;
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
