"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");

module.exports = class HunterV5RollResults {
  static ResultType = {
    totalFail: 0,
    despair: 1,
    fail: 2,
    success: 3,
    crit: 4,
    overreach: 5,
    overreachCrit: 6,
    choose: 7,
  };

  static OutcomeInfo = {
    [HunterV5RollResults.ResultType.totalFail]: {
      toString:
        "```ansi\n[2;31m[2;35m[2;33m[2;36m[2;35m[2;33mTotal Failure[0m[2;35m[0m[2;36m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;31m[0m\n```",
      color: "#cf1723",
    },
    [HunterV5RollResults.ResultType.despair]: {
      toString:
        "```ansi\n[2;35m[2;31m[2;35m[2;33m[2;33m[2;32m[2;36m[2;37m[2;30m[2;32m[2;34m[2;33m[2;35m[2;33m[2;32m[2;31mDespair[0m[2;32m[0m[2;33m[0m[2;35m[0m[2;33m[0m[2;34m[0m[2;32m[0m[2;30m[0m[2;37m[0m[2;36m[0m[2;32m[0m[2;33m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;35m[0m```",
      color: "#a60016",
    },
    [HunterV5RollResults.ResultType.fail]: {
      toString: "```Failed```",
      color: "#000000",
    },
    [HunterV5RollResults.ResultType.success]: {
      toString:
        "```ansi\n[2;35m[2;31m[2;35m[2;33m[2;33m[2;32m[2;36m[2;37m[2;30m[2;32m[2;34m[2;33m[2;35m[2;33m[2;32mSuccess[0m[2;33m[0m[2;35m[0m[2;33m[0m[2;34m[0m[2;32m[0m[2;30m[0m[2;37m[0m[2;36m[0m[2;32m[0m[2;33m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;35m[0m\n```",
      color: "#3ee33b",
    },
    [HunterV5RollResults.ResultType.crit]: {
      toString:
        "```ansi\n[2;32m[2;35m[2;34m[2;36mCritical[0m[2;34m[0m[2;35m[0m[2;32m[0m[2;31m[0m\n```",
      color: "#66ffcc",
    },
    [HunterV5RollResults.ResultType.overreach]: {
      toString:
        "```ansi\n[2;35m[2;31m[2;35m[2;33m[2;33m[2;32m[2;36m[2;37m[2;30m[2;32m[2;34m[2;33m[2;35m[2;33mOverreach[0m[2;35m[0m[2;33m[0m[2;34m[0m[2;32m[0m[2;30m[0m[2;37m[0m[2;36m[0m[2;32m[0m[2;33m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;35m[0m\n```",
      color: "#e6a35c",
    },
    [HunterV5RollResults.ResultType.overreachCrit]: {
      toString:
        "```ansi\n[2;35m[2;31m[2;35m[2;33m[2;33m[2;32m[2;36m[2;37m[2;30m[2;32m[2;34m[2;33m[2;35m[2;33mCritical Overreach[0m[2;35m[0m[2;33m[0m[2;34m[0m[2;32m[0m[2;30m[0m[2;37m[0m[2;36m[0m[2;32m[0m[2;33m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;35m[0m\n```",
      color: "#fcbd79",
    },
    [HunterV5RollResults.ResultType.choose]: {
      toString:
        "```ansi\n[2;35m[2;31m[2;35m[2;33m[2;33m[2;32m[2;36m[2;37m[2;30m[2;32m[2;34m[2;33m[2;35mChoose your fate![0m[2;33m[0m[2;34m[0m[2;32m[0m[2;30m[0m[2;37m[0m[2;36m[0m[2;32m[0m[2;33m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;35m[0m\n```",
      color: "#ba1ebd",
    },
  };

  constructor({ difficulty, pool, desperation, spec } = {}) {
    this.dice = [];
    this.desperationDice = [];
    this.reroll = null;
    this.totalPool = pool + (spec ? 1 : 0);
    this.desperationPool = desperation ?? 0;
    this.difficulty = difficulty;
    this.total = 0;
    this.margin = 0;
    this.outcome = null;
    this.resultType = null;
    this.canReroll = false;
    this.despair = false;
    this.crit = null;
  }

  _setOutcome(type) {
    this.outcome = HunterV5RollResults.OutcomeInfo[type];
    this.resultType = type;
    return this;
  }

  rollDice() {
    this.dice = Roll.d10(this.totalPool);
    if (this.desperationPool)
      this.desperationDice = Roll.d10(this.desperationPool);

    for (const dice of this.dice) {
      if (dice < 6) {
        this.canReroll = true;
        break;
      }
    }
    this.setOutcome();
    return this;
  }

  rerollDice(values) {
    const selected = values?.map((x) => parseInt(x.match(/^\d+/)[0]));
    this.reroll = [];
    const rDice = [];
    for (const dice of this.dice) {
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
        rDice.push(roll);
      } else rDice.push(dice);
    }
    this.dice = rDice;
    this.setOutcome();
  }

  /**
   * Modifies the this object to include the outcome, total and margin
   */
  setOutcome(choose = null) {
    let crit = 0;
    let total = 0;

    for (const dice of this.dice) {
      if (dice === 10) {
        crit++;
        total++;
      } else if (dice >= 6) total++;
    }

    for (const dice of this.desperationDice) {
      if (dice === 10) {
        crit++;
        total++;
      } else if (dice >= 6) total++;
      else if (dice === 1) this.despair = true;
    }

    // Calculating how many critals were scored and adding them to the total
    crit = crit % 2 ? crit - 1 : crit;
    total += crit;

    // set outcome
    if (choose === HunterV5RollResults.ResultType.despair)
      this._setOutcome(HunterV5RollResults.ResultType.despair);
    else if (
      choose === HunterV5RollResults.ResultType.overreachCrit ||
      (this.resultType >= HunterV5RollResults.ResultType.overreach &&
        total >= this.difficulty &&
        crit)
    ) {
      this._setOutcome(HunterV5RollResults.ResultType.overreachCrit);
    } else if (
      choose === HunterV5RollResults.ResultType.overreach ||
      (this.resultType >= HunterV5RollResults.ResultType.overreach &&
        total >= this.difficulty)
    ) {
      this._setOutcome(HunterV5RollResults.ResultType.overreach);
    } else if (this.despair && total < this.difficulty)
      this._setOutcome(HunterV5RollResults.ResultType.despair);
    else if (this.despair)
      this._setOutcome(HunterV5RollResults.ResultType.choose);
    else if (crit && total >= this.difficulty)
      this._setOutcome(HunterV5RollResults.ResultType.crit);
    else if (total >= this.difficulty)
      this._setOutcome(HunterV5RollResults.ResultType.success);
    else if (total === 0)
      this._setOutcome(HunterV5RollResults.ResultType.totalFail);
    else this._setOutcome(HunterV5RollResults.ResultType.fail);

    this.total = total;
    this.margin = total - this.difficulty;
    this.crit = crit;
    return this;
  }
};
