"use strict";

module.exports.Emoji = require("./emoji");
module.exports.Splats = require("./Splats");
module.exports.ComponentCID = require("./ComponentCID");

module.exports.Supporter = {
  fledgling: 1,
  neonate: 2,
  ancilla: 3,
  elder: 4,
  methuselah: 5,
};

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
