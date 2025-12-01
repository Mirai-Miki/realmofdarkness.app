"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");

module.exports = class Wta5thRollResults {
  static ResultType = {
    unrolled: 0,
    totalFail: 1,
    brutal: 2,
    fail: 3,
    success: 4,
    crit: 5,
  };

  static OutcomeInfo(type, brutalGain) {
    let brutalInfo = brutalGain ? " - Gain +4" : " - Failed";
    let outcomeInfo = {
      [Wta5thRollResults.ResultType.totalFail]: {
        toString:
          "```ansi\n[2;31m[2;35m[2;33m[2;36m[2;35m[2;33mTotal Failure[0m[2;35m[0m[2;36m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;31m[0m\n```",
        color: "#ffcc00",
      },
      [Wta5thRollResults.ResultType.brutal]: {
        toString: `\`\`\`ansi\n[2;31m[2;35m[2;33m[2;36m[2;35m[2;33m[2;31mBrutal Outcome!${brutalInfo}[0m[2;33m[0m[2;35m[0m[2;36m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;31m[0m\n\`\`\``,
        color: "#cd0e0e",
      },
      [Wta5thRollResults.ResultType.fail]: {
        toString: "```Failed```",
        color: "#000000",
      },
      [Wta5thRollResults.ResultType.success]: {
        toString: "```ansi\n[2;32mSuccess[0m[2;31m[0m\n```",
        color: "#66ff33",
      },
      [Wta5thRollResults.ResultType.crit]: {
        toString:
          "```ansi\n[2;32m[2;35m[2;34m[2;36mCritical[0m[2;34m[0m[2;35m[0m[2;32m[0m[2;31m[0m\n```",
        color: "#66ffcc",
      },
    };
    return outcomeInfo[type];
  }

  constructor({ difficulty, pool, spec } = {}) {
    this.blackDice = [];
    this.rageDice = [];
    this.reroll = null;
    this.totalPool = pool + (spec ? 1 : 0);
    this.difficulty = difficulty;
    this.total = 0;
    this.margin = 0;
    this.outcome = null;
    this.rageCheck = null;
    this.resultType = 0;
    this.canReroll = false;
    this.canRageReroll = false;
    this.canSelectReroll = false;
    this.brutalGain = false;
  }

  _setOutcome(type) {
    this.outcome = Wta5thRollResults.OutcomeInfo(type, this.brutalGain);
    this.resultType = type;
    return this;
  }

  rollDice(rage = 0) {
    let pool = this.totalPool;
    if (pool <= rage) {
      rage = pool;
      pool = 0;
    } else pool = pool - rage;
    this.blackDice = Roll.d10(pool);
    this.rageDice = Roll.d10(rage);

    return this;
  }

  rerollDice(values, rage) {
    // need to get the rage dice selected
    const selectedRage = values?.map((x) => {
      if (x.match(/^r/)) return parseInt(x.match(/\d+/)[0]);
    });
    const selected = values?.map((x) => {
      if (x.match(/^\d+/)) return parseInt(x.match(/^\d+/)[0]);
    });
    this.reroll = [];
    const bDice = [];
    const rDice = [];

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
        const roll = Roll.single(10);
        this.reroll.push(`${dice}>${roll}`);
        bDice.push(roll);
      } else bDice.push(dice);
    }
    this.blackDice = bDice;

    for (const dice of this.rageDice) {
      if (
        selectedRage?.includes(dice) ||
        (!values && this.reroll.length < 3 && dice > 2 && dice < 6 && rage)
      ) {
        if (values) {
          // We pull the value out of selected so we cannot reread it
          const index = selectedRage.indexOf(dice);
          if (index > -1) selectedRage.splice(index, 1);
        }
        const roll = Roll.single(10);
        this.reroll.push(`r${dice}>${roll}`);
        rDice.push(roll);
      } else rDice.push(dice);
    }
    this.rageDice = rDice;

    this.setOutcome();
  }

  /**
   * Modifies the this object to include the outcome, total and margin
   */
  setOutcome() {
    let crit = 0;
    let brutal = [];
    let total = 0;
    let normalRerollCount = 0;

    for (const dice of this.blackDice) {
      if (dice < 6) {
        if (!this.canReroll) this.canReroll = true;
        normalRerollCount++;
      }

      if (dice === 10) {
        crit++;
        total++;
      } else if (dice >= 6) total++;
    }
    if (this.blackDice.length) this.canSelectReroll = true;

    for (const dice of this.rageDice) {
      if (!this.canSelectReroll && dice > 2) this.canSelectReroll = true;
      if (normalRerollCount < 3 && !this.canRageReroll && dice > 2 && dice < 6)
        this.canRageReroll = true;
      if (dice === 10) {
        crit++;
        total++;
      } else if (dice >= 6) total++;
      else if (dice <= 2) brutal.push(true);
    }

    // Calculating how many critals were scored and adding them to the total
    crit = crit % 2 ? crit - 1 : crit;
    total += crit;
    if (this.brutalGain) total += 4;

    // set outcome
    if (brutal.length >= 2)
      this._setOutcome(Wta5thRollResults.ResultType.brutal);
    else if (total === 0)
      this._setOutcome(Wta5thRollResults.ResultType.totalFail);
    else if (total < this.difficulty)
      this._setOutcome(Wta5thRollResults.ResultType.fail);
    else if (crit) this._setOutcome(Wta5thRollResults.ResultType.crit);
    else this._setOutcome(Wta5thRollResults.ResultType.success);

    this.total = total;
    this.margin = total - this.difficulty;
    return this;
  }

  setRageCheck(reroll) {
    const rolls = [Roll.single(10)];
    if (reroll === "Reroll") rolls.push(Roll.single(10));
    this.rageCheck = {
      dice: rolls,
      passed: false,
      toString:
        "```ansi\n[2;36m[2;34m[2;36mRage Decreased[0m[2;34m[0m[2;36m[0m\n```",
    };

    for (const dice of rolls) {
      if (dice >= 6) {
        this.rageCheck.passed = true;
        this.rageCheck.toString = "```Rage Unchanged```";
      }
    }
    return this;
  }

  setDoubleRageCheck(reroll) {
    const roll1 = [Roll.single(10)];
    if (reroll === "Reroll") roll1.push(Roll.single(10));
    const roll2 = [Roll.single(10)];
    if (reroll === "Reroll") roll2.push(Roll.single(10));
    const rolls = [roll1, roll2];

    this.doubleRageCheck = {
      roll1: roll1,
      roll2: roll2,
      decreased: 0,
      toString: "```Rage Unchanged```",
    };

    for (const roll of rolls) {
      for (const dice of roll) {
        if (dice < 6) {
          this.doubleRageCheck.decreased++;
          this.doubleRageCheck.toString =
            "```ansi\n[2;36m[2;34m[2;36mRage Decreased{amount}[0m[2;34m[0m[2;36m[0m\n```";
        }
      }
    }
    this.doubleRageCheck.toString = this.doubleRageCheck.toString.replace(
      "{amount}",
      ` by ${this.doubleRageCheck.decreased}`
    );
    return this;
  }

  setBrutalGain() {
    this.brutalGain = true;
    this.setOutcome();
  }
};
