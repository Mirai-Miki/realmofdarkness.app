"use strict";
require(`${process.cwd()}/alias`);
const DamageTracker5th = require("../../DamageTracker5th");
const Character = require("./Character.js");

module.exports = class Character5th extends Character {
  constructor({ client, name, health = 4, willpower = 2 } = {}) {
    super({ client, name });
    this.version = "5th";
    this.willpower = new DamageTracker5th(willpower);
    this.health = new DamageTracker5th(health);
    this.skills = null;
    this.attributes = null;
  }

  setFields(args) {
    super.setFields(args);
    if (args.willpower != null) this.willpower.setTotal(args.willpower);
    if (args.health != null) this.health.setTotal(args.health);
    if (args.willpowerSup != null)
      this.willpower.setSuperficial(args.willpowerSup);
    if (args.willpowerAgg != null) this.willpower.setAgg(args.willpowerAgg);
    if (args.healthSup != null) this.health.setSuperficial(args.healthSup);
    if (args.healthAgg != null) this.health.setAgg(args.healthAgg);
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.willpower != null) this.willpower.updateCurrent(args.willpower);
    if (args.health != null) this.health.updateCurrent(args.health);
    if (args.willpowerSup != null)
      this.willpower.takeSuperfical(args.willpowerSup);
    if (args.willpowerAgg != null) this.willpower.takeAgg(args.willpowerAgg);
    if (args.healthSup != null) this.health.takeSuperfical(args.healthSup);
    if (args.healthAgg != null) this.health.takeAgg(args.healthAgg);
  }

  async deserilize(json) {
    await super.deserilize(json);

    this.willpower.setTotal(json.willpower.total);
    this.willpower.takeSuperfical(json.willpower.superficial);
    this.willpower.takeAgg(json.willpower.aggravated);
    this.health.setTotal(json.health.total);
    this.health.takeSuperfical(json.health.superficial);
    this.health.takeAgg(json.health.aggravated);
    this.skills = json.skills;
    this.attributes = json.attributes;
    return this;
  }

  serialize() {
    const serializer = super.serialize();
    serializer.character["willpower_total"] = this.willpower.total;
    serializer.character["willpower_superficial"] = this.willpower.superficial;
    serializer.character["willpower_aggravated"] = this.willpower.aggravated;
    serializer.character["health_total"] = this.health.total;
    serializer.character["health_superficial"] = this.health.superficial;
    serializer.character["health_aggravated"] = this.health.aggravated;
    return serializer;
  }
};
