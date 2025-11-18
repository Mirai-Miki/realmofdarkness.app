"use strict";
require(`${process.cwd()}/alias`);
const { postData } = require("./postData.js");
const RealmAPIError = require("@src/errors/RealmAPIError.js");
const InitiativeTracker = require("@structures/InitiativeTracker");

module.exports = async function getInitTracker(channelId) {
  const path = "initiative/get";
  const data = { channel_id: channelId };

  const res = await postData(path, data);
  switch (res?.status) {
    case 200: // Found a Tracker
      return new InitiativeTracker({ json: res.data.tracker });
    case 204: // No Tracker
      return null;
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
