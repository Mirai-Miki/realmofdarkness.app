"use strict";

/**
 * Represents a Form.
 * @class
 */
module.exports = class WerewolfForm {
  /**
   * Creates a new instance of the Form class.
   * @constructor
   * @param {string} [form="Homid"] - The form of the entity.
   */
  constructor(form) {
    this.form = form ? form : "Homid";
  }

  getForm() {
    return this.form;
  }

  setForm(form) {
    this.form = form;
  }

  updateForm(form, werewolf) {
    if (form === "Crinos" && this.form !== "Crinos") {
      werewolf.health.setTotal(werewolf.health.total + 4);
    } else if (form !== "Crinos" && this.form === "Crinos") {
      werewolf.health.setTotal(werewolf.health.total - 4);
    }
    this.form = form;
  }
};
