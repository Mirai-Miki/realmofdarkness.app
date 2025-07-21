"use strict";

// Emoji constants used throughout the bot UI
module.exports.Emoji = require("./emoji");
// Splats constants for game archetypes
module.exports.Splats = require("./Splats");
// ComponentCID constants for Discord component custom IDs
module.exports.ComponentCID = require("./ComponentCID");

/**
 * Supporter tiers for Discord bot features.
 * Used to unlock features and set limits based on user support level.
 */
module.exports.Supporter = {
  mortal: 1,
  fledgling: 2,
  neonate: 3,
  ancilla: 4,
  elder: 5,
  methuselah: 6,
  antediluvian: 7,
};

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
