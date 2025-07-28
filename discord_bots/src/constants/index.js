"use strict";

const { Emoji } = require("./Emoji");
module.exports.Emoji = Emoji;
// Splats constants for game archetypes
module.exports.Splats = require("./Splats");
// ComponentCID constants for Discord component custom IDs
module.exports.ComponentCID = require("./ComponentCID");

module.exports.Supporter = require("./Supporter");

/**
 * Initialization phases for Discord bot game sessions.
 * Used to track the current state of a game or session.
 */
module.exports.InitPhase = {
  JOIN: 0,
  JOIN2: 1,
  ROLL: 2,
  ROLL2: 3,
  REVEAL: 4,
  DECLARE: 5,
  DECLARED: 6,
  END: 7,
};
