"use strict";
require(`${process.cwd()}/alias`);
const { Emoji } = require("@constants");

module.exports = class Humanity5th {
  constructor(total) {
    this.total = total;
    this.stains = 0;
    this.overflow = 0;
  }

  takeStains(amount) {
    this.overflow = 0;
    this.stains += amount;
    if (this.stains < 0) this.stains = 0;
    this.calculateStainsOverflow();
  }

  setStains(amount) {
    this.overflow = 0;
    if (amount < 0) {
      // Should never be less then 0
      return;
    } else {
      this.stains = amount;
      this.calculateStainsOverflow();
    }
  }

  setCurrent(amount) {
    this.overflow = 0;

    // If the player is losing humanity then stains get reset
    if (amount < this.total) this.stains = 0;

    this.total = amount;

    if (this.total > 10) this.total = 10;
    if (this.total < 0) this.total = 0;
    this.calculateStainsOverflow();
  }

  updateCurrent(amount) {
    this.overflow = 0;

    // If the player is losing humanity then stains get reset
    if (amount < 0) this.stains = 0;
    this.total += amount;

    if (this.total > 10) this.total = 10;
    if (this.total < 0) this.total = 0;
    this.calculateStainsOverflow();
  }

  calculateStainsOverflow() {
    if (this.stains > 10 - this.total) {
      this.overflow = this.stains - (10 - this.total);
      this.stains = 10 - this.total;
    }
  }

  getDegenerationInfo() {
    if (this.overflow > 0)
      return (
        `${this.overflow} ${this.overflow > 1 ? "stains" : "stain"}` +
        " overflowed. You are now in Degeneration. p239"
      );
    else return "";
  }

  getOneThird() {
    return Math.floor(this.total / 3);
  }

  getTracker() {
    let total = this.total;
    let tracker = "";
    let undamaged = 10 - total - this.stains;
    for (let i = 0; i < 10; i++) {
      if (i == 5) tracker += "⠀";

      if (total) {
        tracker += Emoji.purple_dot_3;
        total--;
      } else if (undamaged) {
        tracker += Emoji.black_period;
        undamaged--;
      } else tracker += Emoji.red_skull;
    }
    tracker += "⠀";
    return tracker;
  }
};
