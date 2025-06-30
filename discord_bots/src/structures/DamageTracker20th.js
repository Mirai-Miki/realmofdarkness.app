"use strict";
require(`${process.cwd()}/alias`);
const { Emoji } = require("@constants");

module.exports = class DamageTracker20th {
  constructor() {
    this.total = 7;
    this.bashing = 0;
    this.lethal = 0;
    this.aggravated = 0;
    this.overflow = 0;
    this.damageInfo = "";
  }

  resetOverflow() {
    this.overflow = 0;
  }

  updateBashing(amount) {
    this.bashing += amount;
    if (this.bashing < 0) this.bashing = 0;
    let total = this.getTotalDamage();
    if (total > this.total) this.bashing = this.bashing - (total - this.total);
  }

  updateLethal(amount) {
    this.lethal += amount;
    if (this.lethal < 0) this.lethal = 0;
    let total = this.getTotalDamage();
    if (total > this.total) this.lethal = this.lethal - (total - this.total);
  }

  updateAgg(amount) {
    this.aggravated += amount;
    if (this.aggravated < 0) this.aggravated = 0;
    let total = this.getTotalDamage();
    if (total > this.total)
      this.aggravated = this.aggravated - (total - this.total);
  }

  setBashing(amount) {
    this.bashing = amount;
    if (this.bashing < 0) this.bashing = 0;
    let total = this.getTotalDamage();
    if (total > this.total) this.bashing = this.bashing - (total - this.total);
  }

  setLethal(amount) {
    this.lethal = amount;
    if (this.lethal < 0) this.lethal = 0;
    let total = this.getTotalDamage();
    if (total > this.total) this.lethal = this.lethal - (total - this.total);
  }

  setAgg(amount) {
    this.aggravated = amount;
    if (this.aggravated < 0) this.aggravated = 0;
    let total = this.getTotalDamage();
    if (total > this.total)
      this.aggravated = this.aggravated - (total - this.total);
  }

  updateCurrent(amount) {
    this.total += amount;
    if (this.total < 7) this.total = 7;
    else if (this.total > 15) this.total = 15;
  }

  setTotal(amount) {
    this.total = amount;
    if (this.total < 7) this.total = 7;
    else if (this.total > 15) this.total = 15;
  }

  getTotalDamage() {
    let total = this.bashing + this.lethal + this.aggravated;
    if (total > this.total) this.overflow += total - this.total;
    return total;
  }

  getTracker() {
    let tracker = "";
    let totalHealth = this.total;
    let bashing = this.bashing;
    let lethal = this.lethal;
    let agg = this.aggravated;

    for (let i = 0; i < totalHealth; i++) {
      if (i !== 0 && i % 2 === 0) tracker += "⠀";

      if (agg) {
        tracker += Emoji.purpleBox;
        agg--;
      } else if (lethal) {
        tracker += Emoji.redBox;
        lethal--;
      } else if (bashing) {
        tracker += Emoji.yellowBox;
        bashing--;
      } else tracker += Emoji.greenBox; // Undamaged Box
    }
    tracker += "⠀";

    let total = this.getTotalDamage();
    if (this.overflow) {
      tracker +=
        `Damage overflowed by ${this.overflow} while ` +
        "Incapacitated.\nCheck the corebook for rules on what happens now.";
      return tracker;
    }

    // Correct for extra levels of brusied
    if (total && total <= totalHealth - 7) total = 1;
    else if (total > totalHealth - 7) total -= totalHealth - 7;

    tracker += damageInfo[total];
    this.damageInfo += damageInfo[total];
    return tracker;
  }
};

const damageInfo = {
  0: "",
  1:
    "Bruised\nCharacter is only bruised and suffers no dice pool penalties " +
    "due to damage.",

  2: "Hurt -1 to rolls\nCharacter is superficially hurt",

  3:
    "Injured -1 to rolls\n" +
    "Character suffers minor injuries and movement is mildly " +
    "inhibited (halve maximum running speed).",

  4:
    "Wounded -2 to rolls\n" +
    "Character suffers significant damage and may not run " +
    "(though he may still walk).\nAt this level, a character may " +
    "only move or attack; he always loses dice when moving " +
    "and attacking in the same turn.",

  5:
    "Mauled -2 to rolls\n" +
    "Character is badly injured and may only hobble about " +
    "(three yards/meters per turn).",

  6:
    "Crippled -5 to rolls\n" +
    "Character is catastrophically injured and may only crawl " +
    "(one yard/meter per turn).",

  7:
    "Incapacitated\nCharacter is incapable of movement and is " +
    "likely unconscious.",
};
