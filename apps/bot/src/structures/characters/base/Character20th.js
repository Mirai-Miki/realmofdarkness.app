"use strict";
require(`${process.cwd()}/alias`);
const Character = require("./Character.js");
const Consumable = require("../../Consumable.js");
const DamageTracker20th = require("../../DamageTracker20th.js");

module.exports = class Character20th extends Character {
  constructor({ client, name, willpower = 2 } = {}) {
    super({ client, name });
    this.version = "20th";
    this.willpower = new Consumable(willpower);
    this.health = new DamageTracker20th();
  }

  setFields(args) {
    super.setFields(args);
    if (args.willpower != null) this.willpower.setTotal(args.willpower);
    if (args.health != null) this.health.setTotal(args.health);
    if (args.bashing != null) this.health.setBashing(args.bashing);
    if (args.lethal != null) this.health.setLethal(args.lethal);
    if (args.agg != null) this.health.setAgg(args.agg);
  }

  updateFields(args) {
    super.updateFields(args);
    if (args.willpower != null) this.willpower.updateCurrent(args.willpower);
    if (args.health != null) this.health.updateCurrent(args.health);
    if (args.bashing != null) this.health.updateBashing(args.bashing);
    if (args.lethal != null) this.health.updateLethal(args.lethal);
    if (args.agg != null) this.health.updateAgg(args.agg);
  }

  async deserilize(json) {
    await super.deserilize(json);
    this.willpower.setTotal(json.willpower.total);
    this.willpower.setCurrent(json.willpower.current);
    if (json.health.total) this.health.setTotal(json.health.total);
    this.health.setBashing(json.health.bashing);
    this.health.setLethal(json.health.lethal);
    this.health.setAgg(json.health.aggravated);
    this.health.getTracker();
    return this;
  }

  serialize() {
    const serializer = super.serialize();
    serializer.character["willpower_total"] = this.willpower.total;
    serializer.character["willpower_current"] = this.willpower.current;
    serializer.character["health_total"] = this.health.total;
    serializer.character["health_bashing"] = this.health.bashing;
    serializer.character["health_lethal"] = this.health.lethal;
    serializer.character["health_aggravated"] = this.health.aggravated;
    return serializer;
  }
};
