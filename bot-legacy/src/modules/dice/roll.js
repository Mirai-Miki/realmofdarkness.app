"use strict";
/**
 * Dice Rolling Module
 *
 * Provides cryptographically secure random dice rolling functions
 * for tabletop RPG systems. Uses Node's crypto module to ensure
 * fair and unpredictable results.
 */
const crypto = require("crypto");

/**
 * Rolls a single die with the specified number of sides
 *
 * @param {number} diceSides - Number of sides on the die
 * @returns {number} Result of the die roll (1 to diceSides)
 */
function rollSingle(diceSides) {
  return crypto.randomInt(1, diceSides + 1);
}

/**
 * Rolls multiple dice of the same type and tracks individual results
 *
 * @param {number} quantity - Number of dice to roll
 * @param {number} diceSides - Number of sides on each die
 * @returns {Object} Object containing roll results and total
 */
function rollManySingle(quantity, diceSides) {
  const sides = diceSides.toString();
  const results = { total: 0 };
  results[sides] = [];

  for (let i = 0; i < quantity; i++) {
    const result = rollSingle(diceSides);
    results[sides].push(result);
    results.total += result;
  }

  return results;
}

/**
 * Rolls a specified number of 10-sided dice (d10)
 * Used primarily for World of Darkness systems
 *
 * @param {number} quantity - Number of d10 to roll
 * @returns {number[]} Array of individual d10 results
 */
function rollD10(quantity) {
  const results = [];
  for (let i = 0; i < quantity; i++) {
    results.push(rollSingle(10));
  }
  return results;
}

// Export all functions
module.exports = {
  single: rollSingle,
  manySingle: rollManySingle,
  d10: rollD10,
};
