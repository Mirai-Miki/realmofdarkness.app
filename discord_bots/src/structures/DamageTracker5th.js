"use strict";
require(`${process.cwd()}/alias`);
const { Emoji } = require("@constants");

/**
 * Damage tracker for 5th Edition games
 * Handles health and willpower tracking with superficial and aggravated damage
 */
module.exports = class DamageTracker5th {
  /**
   * Creates a new damage tracker
   * @param {number} total - Total boxes available
   * @param {number} superficial - Initial superficial damage
   * @param {number} aggravated - Initial aggravated damage
   */
  constructor(total, superficial = 0, aggravated = 0) {
    this.total = total;
    this.superficial = 0;
    this.aggravated = 0;

    // Initialize with proper damage allocation
    this.setAgg(aggravated);
    this.setSuperficial(superficial);
  }

  /**
   * Takes or heals superficial damage
   * Converts to aggravated if no boxes remain
   * @param {number} amount - Amount of superficial damage to take (positive) or heal (negative)
   */
  takeSuperfical(amount) {
    // HANDLE HEALING (negative values)
    if (amount < 0) {
      // Convert to positive for easier math
      const healAmount = -amount;
      // Limit healing to current damage
      const actualHeal = Math.min(healAmount, this.superficial);
      this.superficial -= actualHeal;
      return;
    }

    // HANDLE DAMAGE (positive values)
    const availableBoxes = this.total - this.aggravated - this.superficial;

    if (amount <= availableBoxes) {
      // Simple case: enough empty boxes for all superficial damage
      this.superficial += amount;
    } else {
      // Complex case: not enough empty boxes
      // First fill all empty boxes
      this.superficial += availableBoxes;

      // Calculate excess damage that needs conversion
      const excess = amount - availableBoxes;

      // Convert superficial boxes to aggravated for the excess
      // Each point of excess damage converts one superficial to aggravated
      const conversionAmount = Math.min(excess, this.superficial);
      this.superficial -= conversionAmount;
      this.aggravated += conversionAmount;
    }
  }

  /**
   * Sets superficial damage to a specific value
   * @param {number} amount - New superficial damage value
   */
  setSuperficial(amount) {
    // Ensure non-negative
    if (amount < 0) amount = 0;

    // First set to the requested amount
    this.superficial = amount;

    // Then adjust if total damage exceeds available boxes
    const excess = this.superficial + this.aggravated - this.total;
    if (excess > 0) {
      // Reduce superficial damage first
      this.superficial = Math.max(0, this.superficial - excess);
    }
  }

  /**
   * Takes or heals aggravated damage
   * Replaces superficial damage if no empty boxes remain
   * @param {number} amount - Amount of aggravated damage to take (positive) or heal (negative)
   */
  takeAgg(amount) {
    // HANDLE HEALING (negative values)
    if (amount < 0) {
      // Convert to positive for easier math
      const healAmount = -amount;
      // Limit healing to current damage
      const actualHeal = Math.min(healAmount, this.aggravated);
      this.aggravated -= actualHeal;
      return;
    }

    // HANDLE DAMAGE (positive values)
    const availableBoxes = this.total - this.aggravated - this.superficial;

    if (amount <= availableBoxes) {
      // Simple case: enough empty boxes for all aggravated damage
      this.aggravated += amount;
    } else {
      // Complex case: not enough empty boxes
      // First fill all empty boxes
      this.aggravated += availableBoxes;

      // Calculate excess damage that needs to replace superficial
      const excess = amount - availableBoxes;

      // Replace superficial with aggravated for the excess
      const replacementAmount = Math.min(excess, this.superficial);
      this.superficial -= replacementAmount;
      this.aggravated += replacementAmount;

      // Any additional damage is discarded because all boxes are now filled with aggravated
    }
  }

  /**
   * Sets aggravated damage to a specific value
   * @param {number} amount - New aggravated damage value
   */
  setAgg(amount) {
    // Ensure non-negative and within total bounds
    if (amount < 0) amount = 0;
    if (amount > this.total) amount = this.total;

    this.aggravated = amount;

    // Adjust superficial if combined damage exceeds total
    if (this.aggravated + this.superficial > this.total) {
      this.superficial = this.total - this.aggravated;
    }
  }

  /**
   * Sets the total number of boxes
   * @param {number} amount - New total value
   */
  setTotal(amount) {
    // Minimum of 1 box
    if (amount < 1) amount = 1;

    this.total = amount;

    // Ensure damage values don't exceed new total
    this.adjustDamageValues();
  }

  /**
   * Updates the total number of boxes by adding/subtracting amount
   * @param {number} amount - Amount to change total by
   */
  updateCurrent(amount) {
    this.total += amount;
    if (this.total < 1) this.total = 1;
    else if (this.total > 20) this.total = 20;

    // Ensure damage values don't exceed new total
    this.adjustDamageValues();
  }

  /**
   * Adjusts damage values when total changes
   * Prioritizes preserving aggravated damage over superficial
   */
  adjustDamageValues() {
    if (this.total < this.aggravated + this.superficial) {
      // If total decreased, reduce damage to fit
      // First reduce superficial damage
      const excess = this.aggravated + this.superficial - this.total;
      this.superficial = Math.max(0, this.superficial - excess);

      // If still exceeds total, reduce aggravated too
      if (this.aggravated > this.total) {
        this.aggravated = this.total;
      }
    }
  }

  /**
   * Gets status based on damage condition
   * @param {string} type - "health" or "willpower"
   * @returns {string} Status text
   */
  getHealthStatus(type) {
    if (this.total - this.aggravated <= 0 && type === "health")
      return conditionInfo.dead;
    else if (this.total - this.aggravated <= 0 && type === "willpower")
      return conditionInfo.breakdown;
    else if (this.total - this.superficial - this.aggravated <= 0)
      return conditionInfo.impaired;
    else return "";
  }

  /**
   * Gets number of undamaged boxes
   * @returns {number} Undamaged box count
   */
  getUndamaged() {
    return this.total - this.superficial - this.aggravated;
  }

  /**
   * Generates a visual box representation of the tracker
   * @returns {string} Visual representation using emoji boxes
   */
  getTracker() {
    let tracker = "";
    let aggDamage = this.aggravated;
    let supDamage = this.superficial;

    for (let i = 0; i < this.total; i++) {
      // Add spacing every 5 boxes
      if (i == 5 || i == 10 || i == 15) tracker += "⠀";

      if (aggDamage > 0) {
        tracker += Emoji.redBox;
        aggDamage--;
      } else if (supDamage > 0) {
        tracker += Emoji.yellowBox;
        supDamage--;
      } else tracker += Emoji.greenBox;
    }

    tracker += "⠀";
    return tracker;
  }

  /**
   * Serializes tracker state for storage
   * @returns {Object} Serialized tracker
   */
  serialize() {
    return {
      total: this.total,
      superficial: this.superficial,
      aggravated: this.aggravated,
    };
  }
};

const conditionInfo = {
  impaired: "You are currently Impaired.",
  dead: "You have entered Torpor or are Dead.",
  breakdown: "You have mentally broken down.",
};
