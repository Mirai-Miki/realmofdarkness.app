"use strict";
require(`${process.cwd()}/alias`);
const Roll = require("@src/modules/dice/roll");

module.exports = class CodRollResults {
  static ResultType = {
    BOTCH: 0,
    CRIT: 1,
    PASS: 2,
    FAIL: 3,
  };

  static OutcomeInfo = {
    [CodRollResults.ResultType.BOTCH]: {
      toString:
        "```ansi\n[2;31m[2;35m[2;33m[2;36m[2;35m[2;33m[2;31mDramatic Failure[0m[2;33m[0m[2;35m[0m[2;36m[0m[2;33m[0m[2;35m[0m[2;31m[0m[2;31m[0m\n```",
      color: "#cd0e0e",
    },
    [CodRollResults.ResultType.CRIT]: {
      toString:
        "```ansi\n[2;32m[2;35m[2;34m[2;36mExceptional Success[0m[2;34m[0m[2;35m[0m[2;32m[0m[2;31m[0m\n```",
      color: "#66ffcc",
    },
    [CodRollResults.ResultType.FAIL]: {
      toString: "```Failed```",
      color: "#000000",
    },
    [CodRollResults.ResultType.PASS]: {
      toString: "```ansi\n[2;32mSuccess[0m[2;31m[0m\n```",
      color: "#66ff33",
    },
  };

  constructor(interaction) {
    const args = interaction.arguments;
    this.pool = args.pool + (args.bonus ?? 0);
    this.chance = false;
    this.dice = [];
    this.roteDice = [];
    this.rerollDice = [];
    this.total = 0;
    this.resultType = null;
    this.outcome = null;

    if (args.willpower) this.pool += 3;
    if (args.spec) this.pool++;
    this.pool -= args.penalty ?? 0;
    if (this.pool <= 0) {
      this.chance = true;
      this.pool = 1;
    }
    this._roll(args);
  }

  _roll(args) {
    this.dice = Roll.d10(this.pool);
    let rerollPool = 0;
    let rotePool = 0;
    let botch = false;

    for (const dice of this.dice) {
      if (this.chance && dice === 10) this.total++;
      else if (this.chance && dice === 1) botch = true;
      else if (dice >= (args.reroll ?? 10) && !this.chance) {
        rerollPool++;
        if (dice >= (args.target ?? 8)) this.total++;
      } else if (dice >= (args.target ?? 8) && !this.chance) this.total++;
      else if (args.rote) rotePool++;
    }

    this.roteDice = Roll.d10(rotePool);
    for (const dice of this.roteDice) {
      if (dice >= (args.reroll ?? 10) && !this.chance) rerollPool++;
      if (this.chance && dice === 10) this.total++;
      if (!this.chance && dice >= (args.target ?? 8)) this.total++;
    }

    while (rerollPool > 0) {
      const dice = Roll.single(10);
      this.rerollDice.push(dice);
      let rerollAgain = false;
      if (dice >= (args.reroll ?? 10)) rerollAgain = true;
      if (dice >= (args.target ?? 8)) {
        this.total++;
        if (!rerollAgain) rerollPool--;
      } else if (!rerollAgain) rerollPool--;
    }
    if (this.chance && botch) this.resultType = CodRollResults.ResultType.BOTCH;
    else if (this.total >= 5) this.resultType = CodRollResults.ResultType.CRIT;
    else if (this.total > 0) this.resultType = CodRollResults.ResultType.PASS;
    else this.resultType = CodRollResults.ResultType.FAIL;
    this.outcome = CodRollResults.OutcomeInfo[this.resultType];
  }
};
