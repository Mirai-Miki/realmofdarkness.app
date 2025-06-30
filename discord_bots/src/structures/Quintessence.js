"use strict";
require(`${process.cwd()}/alias`);
const { Emoji } = require("@constants");

module.exports = class Quintessence {
  constructor({ quintessence = 5, paradox = 0 }) {
    this.quintessence = quintessence;
    this.paradox = paradox;
  }

  updateQuint(amount) {
    this.quintessence += amount;
    if (this.quintessence < 0) this.quintessence = 0;
    else if (this.quintessence > 20) this.quintessence = 20;

    if (this.quintessence > 20 - this.paradox)
      this.quintessence = 20 - this.paradox;
  }

  setQuint(amount) {
    this.quintessence = amount;
    if (this.quintessence < 0) this.quintessence = 0;
    else if (this.quintessence > 20) this.quintessence = 20;

    if (this.quintessence > 20 - this.paradox)
      this.quintessence = 20 - this.paradox;
  }

  updateParadox(amount) {
    this.paradox += amount;
    if (this.paradox < 0) this.paradox = 0;
    else if (this.paradox > 20) this.paradox = 20;

    if (this.paradox > 20 - this.quintessence)
      this.quintessence = 20 - this.paradox;
  }

  setParadox(amount) {
    this.paradox = amount;
    if (this.paradox < 0) this.paradox = 0;
    else if (this.paradox > 20) this.paradox = 20;

    if (this.paradox > 20 - this.quintessence)
      this.quintessence = 20 - this.paradox;
  }

  getTracker() {
    let tracker = "";
    let qCount = this.quintessence;
    let eCount = 20 - this.quintessence - this.paradox;

    for (let i = 0; i < 20; i++) {
      if (i == 5 || i == 15) tracker += "⠀";
      else if (i == 10) tracker += "\n";

      if (qCount) {
        qCount--;
        tracker += Emoji.purple_dot_2;
      } else if (eCount) {
        eCount--;
        tracker += Emoji.blank_dot;
      } else tracker += Emoji.yellow_dot;
    }
    return tracker;
  }
};
