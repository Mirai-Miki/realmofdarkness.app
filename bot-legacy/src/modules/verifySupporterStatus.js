"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const { Supporter } = require("@constants");
const { RealmError, ErrorCodes } = require("@errors");

const errorCodeMap = {
  [Supporter.mortal]: ErrorCodes.RequiresMortal,
  [Supporter.fledgling]: ErrorCodes.RequiresFledgling,
  [Supporter.neonate]: ErrorCodes.RequiresNeonate,
  [Supporter.ancilla]: ErrorCodes.RequiresAncilla,
  [Supporter.elder]: ErrorCodes.RequiresElder,
  [Supporter.methuselah]: ErrorCodes.RequiresMethuselah,
  [Supporter.antediluvian]: ErrorCodes.RequiresAntediluvian,
};

/**
 * Verifies that a user meets the minimum supporter level requirement.
 * Throws an appropriate RealmError if the user's level is insufficient.
 *
 * @param {string} userId - Discord user ID to check
 * @param {number} requiredLevel - Minimum supporter level required (use Supporter constants)
 * @throws {RealmError} When user's supporter level is below the required level
 */
module.exports.requireLevel = async function (userId, requiredLevel) {
  const userLevel = await API.getSupporterLevel(userId);
  if (userLevel < requiredLevel) {
    // Map supporter levels to their corresponding error codes
    const errorCode = errorCodeMap[requiredLevel] || ErrorCodes.RequiresMortal;
    throw new RealmError({ code: errorCode });
  }
};

/**
 * Convenience functions for common supporter level checks
 */
module.exports.mortal = async function (userId) {
  return module.exports.requireLevel(userId, Supporter.mortal);
};

module.exports.fledgling = async function (userId) {
  return module.exports.requireLevel(userId, Supporter.fledgling);
};

module.exports.neonate = async function (userId) {
  return module.exports.requireLevel(userId, Supporter.neonate);
};

module.exports.ancilla = async function (userId) {
  return module.exports.requireLevel(userId, Supporter.ancilla);
};

module.exports.elder = async function (userId) {
  return module.exports.requireLevel(userId, Supporter.elder);
};

module.exports.methuselah = async function (userId) {
  return module.exports.requireLevel(userId, Supporter.methuselah);
};

module.exports.antediluvian = async function (userId) {
  return module.exports.requireLevel(userId, Supporter.antediluvian);
};
