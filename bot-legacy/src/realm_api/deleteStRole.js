"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const RealmAPIError = require("@src/errors/RealmAPIError.js");

module.exports = async function deleteStRole(roleId) {
  const path = `chronicle/storyteller/roles/delete`;
  const data = { role_id: roleId };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Deleted
      return true;
    case 204:
      return false;
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
