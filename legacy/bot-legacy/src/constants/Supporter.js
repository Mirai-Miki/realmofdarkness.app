const { ApplicationEmoji } = require("discord.js");
const { Emoji } = require("./Emoji.js");

module.exports = class Supporter {
  static free = 0;
  static mortal = 1;
  static fledgling = 2;
  static neonate = 3;
  static ancilla = 4;
  static elder = 5;
  static methuselah = 6;
  static antediluvian = 7;

  /**
   * Get supporter tier name from level number
   * @param {number} level - Supporter tier level
   * @returns {string} - Tier name
   */
  static getName(level) {
    switch (level) {
      case this.mortal:
        return "Mortal";
      case this.fledgling:
        return "Fledgling";
      case this.neonate:
        return "Neonate";
      case this.ancilla:
        return "Ancilla";
      case this.elder:
        return "Elder";
      case this.methuselah:
        return "Methuselah";
      case this.antediluvian:
        return "Antediluvian";
      default:
        return "Free";
    }
  }

  /**
   * Get supporter tier emoji based on level
   * @param {number} level - Supporter tier level
   * @returns {String} - Tier emoji string or empty string
   */
  static getEmoji(level) {
    switch (level) {
      case this.mortal:
        return Emoji.supporter_mortal.toString();
      case this.fledgling:
        return Emoji.supporter_fledgling.toString();
      case this.neonate:
        return Emoji.supporter_neonate.toString();
      case this.ancilla:
        return Emoji.supporter_ancilla.toString();
      case this.elder:
        return Emoji.supporter_elder.toString();
      case this.methuselah:
        return Emoji.supporter_methuselah.toString();
      case this.antediluvian:
        return Emoji.supporter_antediluvian.toString();
      default:
        return "";
    }
  }

  /**
   * Get character sheet limits based on supporter tier
   * @param {number} level - Supporter tier level
   * @returns {number} - Sheet limit
   */
  static getSheetLimit(level) {
    switch (level) {
      case this.mortal:
        return 4;
      case this.fledgling:
        return 8;
      case this.neonate:
        return 30;
      case this.ancilla:
        return 60;
      case this.elder:
        return 150;
      case this.methuselah:
        return 300;
      case this.antediluvian:
        return 500;
      default:
        return 2;
    }
  }

  /**
   * Get tracker limits based on supporter tier
   * @param {number} level - Supporter tier level
   * @returns {number} - Tracker limit
   */
  static getTrackerLimit(level) {
    switch (level) {
      case this.mortal:
        return 75;
      case this.fledgling:
        return 100;
      case this.neonate:
        return 150;
      case this.ancilla:
        return 200;
      case this.elder:
        return 300;
      case this.methuselah:
        return 500;
      case this.antediluvian:
        return 1000;
      default:
        return 50;
    }
  }

  /**
   * Get Supporter Color based on tier
   * @param {number} level - Supporter tier level
   * @return {string} - Hex color code
   */
  static getColor(level) {
    switch (level) {
      case this.mortal:
        return "#087013";
      case this.fledgling:
        return "#cb3148";
      case this.neonate:
        return "#df8200";
      case this.ancilla:
        return "#5036d5";
      case this.elder:
        return "#db1fc2";
      case this.methuselah:
        return "#2adede";
      case this.antediluvian:
        return "#f0e810";
      default:
        return "#9d9d9d";
    }
  }
};
