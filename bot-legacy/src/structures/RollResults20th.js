"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");

module.exports = class RollResults20th {
  static OutcomeInfo = {
    botched: {
      toString: "```ansi\n[2;31mBotched[0m\n```",
      color: "#cd0e0e",
    },
    failed: {
      toString: "```Failed```",
      color: "#000000",
    },
    success: {
      toString: "```ansi\n[2;32mSuccess[0m[2;31m[0m\n```",
      color: "#66ff33",
    },
  };

  constructor(args) {
    this.pool = args.pool;
    this.nightmare = args.nightmare ?? 0;

    this.blackDice = [];
    this.nightmareDice = [];
    this.failed = [];
    this.passed = [];

    this.botch = false;
    this.total = 0;
    this.outcome = null;

    this._rollDice(args);
    this._setOutcome(args);
  }

  getSortedString(diceList, args) {
    const sorted = diceList.map((x) => x);
    sorted.sort((a, b) => b - a);

    const content = [];
    for (const dice of sorted) {
      if (dice === 10 && args.spec) content.push("**10**");
      else if (dice >= args.difficulty) content.push(`${dice}`);
      else if (dice < args.difficulty && (dice != 1 || args.cancelOnes))
        content.push(`~~${dice}~~`);
      else content.push(`**~~1~~**`);
    }
    return content.join(", ");
  }

  _rollDice(args) {
    const roll = Roll.d10(this.pool);
    let pCount = this.pool - this.nightmare;
    let tens = 0;
    let removed = 0;

    for (const dice of roll) {
      if (pCount) {
        this.blackDice.push(dice);
        pCount--;
      } else this.nightmareDice.push(dice);

      if (dice === 1) {
        this.failed.push(dice);
        if (!args.cancelOnes) {
          this.botch = true;
          removed++;
        }
      } else if (args.spec && dice === 10) {
        tens++;
        this.total += 2;
        this.passed.push(dice);
      } else if (dice < args.difficulty) this.failed.push(dice);
      else {
        this.total++;
        this.passed.push(dice);
      }
    }

    // Removed 10s correctly
    let quantity = this.passed.length - tens;
    for (removed; removed != 0; removed--) {
      if (quantity) {
        this.total -= 1;
        quantity -= 1;
      } else if (tens) {
        this.total -= 2;
        tens -= 1;
      } else break;
    }

    if (args.willpower) this.total++;
    if (args.mod) this.total += args.mod;
    if (this.total < 0) this.total = 0;
  }

  /**
   * Modifies the this object to include the outcome, total and margin
   */
  _setOutcome() {
    if (!this.passed.length && !this.total && this.botch)
      this.outcome = RollResults20th.OutcomeInfo.botched;
    else if (!this.total) this.outcome = RollResults20th.OutcomeInfo.failed;
    else this.outcome = RollResults20th.OutcomeInfo.success;
  }
};
