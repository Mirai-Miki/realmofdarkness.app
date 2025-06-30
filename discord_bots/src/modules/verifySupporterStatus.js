"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const { Supporter } = require("@constants");
const { RealmError, ErrorCodes } = require("@errors");

module.exports.fledgling = async function (userId) {
  const level = await API.getSupporterLevel(userId);
  if (level < Supporter.fledgling)
    throw new RealmError({ code: ErrorCodes.RequiresFledgling });
};
