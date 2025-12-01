"use strict";
require(`${process.cwd()}/alias`);
const { Emoji } = require("@constants");

module.exports = class Counter {
  /**
   * A Counter stores a primary value and a secondary value.
   * If the secondary ever hits or exeedes the max value it will increment
   * the primary value by 1 up to the max value.
   * @param {*} primary The primary value stored
   * @param {*} secondary The secondary value stored
   * @param {*} max The max value both secondary and primary can be
   */
  constructor(primary = 5, secondary = 0, max = 10) {
    this.primary = primary;
    this.secondary = secondary;
    this.max = max;
  }

  updatePrimary(amount) {
    this.primary += amount;
    if (this.primary > this.max) this.primary = this.max;
    else if (this.primary < 0) this.primary = 0;
  }

  setPrimary(amount) {
    if (amount > this.max) amount = this.max;
    else if (amount < 0) amount = 0;
    this.primary = amount;
  }

  updateSecondary(amount) {
    this.secondary += amount;
    if (this.secondary < 0) {
      this.secondary = 0;
    } else if (this.secondary > this.max - 1) {
      let offset = this.secondary - this.max;
      while (true) {
        this.updatePrimary(1);
        if (offset - this.max < 0) break;
        offset -= this.max;
      }
      this.secondary = offset;
      if (this.primary > this.max) this.primary = this.max;
    }
  }

  setSecondary(amount) {
    if (amount >= this.max) {
      amount = 0;
      this.updatePrimary(1);
    } else if (amount < 0) amount = 0;
    this.secondary = amount;
  }

  getPrimaryTracker({
    showEmoji = true,
    emoji = Emoji.tracker_2_filled.toString(),
  } = {}) {
    return this.getTracker(this.primary, {
      showEmoji: showEmoji,
      emoji: emoji,
    });
  }

  getSecondaryTracker({
    showEmoji = true,
    emoji = Emoji.tracker_1_filled.toString(),
  } = {}) {
    return this.getTracker(this.secondary, {
      showEmoji: showEmoji,
      emoji: emoji,
    });
  }

  getTracker(
    value,
    { showEmoji = true, emoji = Emoji.tracker_1_filled.toString() } = {}
  ) {
    if (value === undefined) throw new Error("value not defined");

    let tracker = "";
    if (this.max > 15 || !showEmoji) {
      tracker = `\`\`\`q\n[${value}/${this.max}]\n\`\`\``;
      return tracker;
    }

    for (let i = 0; i < this.max; i++) {
      if (i < value) tracker += emoji;
      else tracker += Emoji.tracker_0_empty.toString();
    }
    tracker += "⠀";
    return tracker;
  }
};
