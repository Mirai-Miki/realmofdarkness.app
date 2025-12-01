"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");

module.exports = class vtmV5RollResults {
  static ResultType = {
    unrolled: 0,
    totalFail: 1,
    bestialFail: 2,
    fail: 3,
    success: 4,
    messyCrit: 5,
    crit: 6,
  };

  static OutcomeInfo = {
    [vtmV5RollResults.ResultType.totalFail]: {
      toString:
        "```ansi\n[2;31m[2;35m[2;33m[2;36m[2;35m[2;33mTotal Failure[0m[2;35m[0m[2;36m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;31m[0m\n```",
      color: "#ffcc00",
    },
    [vtmV5RollResults.ResultType.bestialFail]: {
      toString:
        "```ansi\n[2;31m[2;35m[2;33m[2;36m[2;35m[2;33m[2;31mBestial Failure[0m[2;33m[0m[2;35m[0m[2;36m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;31m[0m\n```",
      color: "#cd0e0e",
    },
    [vtmV5RollResults.ResultType.fail]: {
      toString: "```Failed```",
      color: "#000000",
    },
    [vtmV5RollResults.ResultType.success]: {
      toString: "```ansi\n[2;32mSuccess[0m[2;31m[0m\n```",
      color: "#66ff33",
    },
    [vtmV5RollResults.ResultType.messyCrit]: {
      toString: "```ansi\n[2;32m[2;35mMessy Critical[0m[2;32m[0m[2;31m[0m\n```",
      color: "#ff0066",
    },
    [vtmV5RollResults.ResultType.crit]: {
      toString:
        "```ansi\n[2;32m[2;35m[2;34m[2;36mCritical[0m[2;34m[0m[2;35m[0m[2;32m[0m[2;31m[0m\n```",
      color: "#66ffcc",
    },
  };

  constructor({ difficulty, pool, bp, spec } = {}) {
    this.blackDice = [];
    this.hungerDice = [];
    this.reroll = null;
    this.totalPool = this.setTotalPool(pool, bp, spec);
    this.difficulty = difficulty;
    this.total = 0;
    this.margin = 0;
    this.outcome = null;
    this.bloodSurge = null;
    this.rouse = null;
    this.resultType = 0;
    this.canReroll = false;
  }

  _setOutcome(type) {
    this.outcome = vtmV5RollResults.OutcomeInfo[type];
    this.resultType = type;
    return this;
  }

  rollDice(hunger = 0) {
    let pool = this.totalPool;
    if (pool <= hunger) {
      hunger = pool;
      pool = 0;
    } else pool = pool - hunger;
    this.blackDice = Roll.d10(pool);
    this.hungerDice = Roll.d10(hunger);

    for (const dice of this.blackDice) {
      if (dice < 6) {
        this.canReroll = true;
        break;
      }
    }
    return this;
  }

  rerollDice(values) {
    const selected = values?.map((x) => parseInt(x.match(/^\d+/)[0]));
    this.reroll = [];
    const bDice = [];
    for (const dice of this.blackDice) {
      if (
        selected?.includes(dice) ||
        (!values && this.reroll.length < 3 && dice < 6)
      ) {
        if (values) {
          // We pull the value out of selected so we cannot reread it
          const index = selected.indexOf(dice);
          if (index > -1) selected.splice(index, 1);
        }
        const roll = Roll.d10(1)[0];
        this.reroll.push(`${dice}>${roll}`);
        bDice.push(roll);
      } else bDice.push(dice);
    }
    this.blackDice = bDice;
    this.setOutcome();
  }

  /**
   * Modifies the this object to include the outcome, total and margin
   */
  setOutcome() {
    let crit = 0;
    let bestialFail = false;
    let messyCrit = false;
    let total = 0;

    for (const dice of this.blackDice) {
      if (dice === 10) {
        crit++;
        total++;
      } else if (dice >= 6) total++;
    }

    for (const dice of this.hungerDice) {
      if (dice === 10) {
        crit++;
        total++;
        messyCrit = true;
      } else if (dice >= 6) total++;
      else if (dice === 1) bestialFail = true;
    }

    // Calculating how many critals were scored and adding them to the total
    crit = crit % 2 ? crit - 1 : crit;
    total += crit;

    // set outcome
    if (total < this.difficulty && bestialFail)
      this._setOutcome(vtmV5RollResults.ResultType.bestialFail);
    else if (total === 0)
      this._setOutcome(vtmV5RollResults.ResultType.totalFail);
    else if (total < this.difficulty)
      this._setOutcome(vtmV5RollResults.ResultType.fail);
    else if (crit && messyCrit)
      this._setOutcome(vtmV5RollResults.ResultType.messyCrit);
    else if (crit) this._setOutcome(vtmV5RollResults.ResultType.crit);
    else this._setOutcome(vtmV5RollResults.ResultType.success);

    this.total = total;
    this.margin = total - this.difficulty;
    return this;
  }
  /**
   * Calculates the total pool based on the Blood Potence and Spec
   * @param {Number} pool The pool before adding extras
   * @param {Number} bp Blood Potency if a surge was used
   * @param {String} spec If a specialty was used
   * @returns {Number} The total pool
   */
  setTotalPool(pool, bp, spec) {
    let surge = 0;

    if (bp != null) {
      switch (bp) {
        case 10:
        case 9:
          surge = 6;
          break;
        case 8:
        case 7:
          surge = 5;
          break;
        case 6:
        case 5:
          surge = 4;
          break;
        case 4:
        case 3:
          surge = 3;
          break;
        case 2:
        case 1:
          surge = 2;
          break;
        case 0:
          surge = 1;
      }
    }

    let totalPool = pool + surge + (spec ? 1 : 0);
    if (totalPool <= 0) totalPool = 1;
    return totalPool;
  }

  /**
   *
   * @param {*} bp
   * @returns
   */
  setBloodSurge(bp) {
    const roll = Roll.single(10);
    this.bloodSurge = {
      dice: roll,
      passed: roll >= 6 ? true : false,
      toString:
        roll >= 6
          ? "```Hunger Unchanged```"
          : "```ansi\n[2;31mHunger Increased[0m[2;31m[0m\n```",
    };
    return this;
  }

  setRouse(reroll) {
    const rolls = [Roll.single(10)];
    if (reroll === "Reroll") rolls.push(Roll.single(10));
    this.rouse = {
      dice: rolls,
      passed: false,
      toString: "```ansi\n[2;31mHunger Increased[0m[2;31m[0m\n```",
    };

    for (const dice of rolls) {
      if (dice >= 6) {
        this.rouse.passed = true;
        this.rouse.toString = "```Hunger Unchanged```";
      }
    }
    return this;
  }
};
