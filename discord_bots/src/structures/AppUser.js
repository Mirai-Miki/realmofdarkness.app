"use strict";
require(`${process.cwd()}/alias`);
const API = require("@api");
const { toDiscordTimestamp } = require("@modules/misc");
const { TimestampStyles, User, Client } = require("discord.js");

/**
 * Represents an application user with Discord authentication details
 *
 * @example
 * // Fetch a user
 * const user = await AppUser.fetch("123456789012345678");
 *
 * @example
 * // Check user properties
 * if (user.isAdmin()) {
 *   console.log("User is an admin");
 * }
 * if (user.isSupporter()) {
 *   console.log(`User is a ${user.getSupporterLevel()}`);
 * }
 *
 * @example
 * // Discord timestamp formatting
 * console.log(user.getCreatedDate()); // Default format: "January 1, 2023 12:00 PM"
 * console.log(user.getCreatedDate("f")); // Full format: "Saturday, January 1, 2023 12:00 PM"
 * console.log(user.getCreatedDate("d")); // Date only: "01/01/2023"
 * console.log(user.getCreatedDate("R")); // Relative: "2 hours ago"
 * console.log(user.getCreatedRelative()); // Shorthand for relative time
 */
module.exports = class AppUser {
  /**
   * Create an AppUser instance
   * @param {Object} options - User data options
   * @param {String} options.id - Discord user ID
   * @param {String} options.username - Discord username
   * @param {String} options.discriminator - Discord discriminator (default "0")
   * @param {String} options.avatarUrl - Avatar URL
   * @param {String} options.email - Email address
   * @param {Boolean} options.verified - If email is verified
   * @param {Boolean} options.registered - If user is registered
   * @param {Boolean} options.admin - If user is admin
   * @param {Number} options.supporter - Supporter level
   * @param {String} options.createdAt - Account creation date
   * @param {String} options.lastSaved - Last saved timestamp
   * @param {String} options.lastActive - Last active timestamp
   */
  constructor(client) {
    if (!client || !(client instanceof Client)) {
      throw new Error("Client must be provided to AppUser constructor");
    }

    // Public properties
    this.client = client; // Discord client instance
    this.id = null;
    this.discordUser = null; // Discord User
    this.username = "";
    this.discriminator = "";
    this.avatarUrl = "";
    this.email = null;
    this.verified = false;
    this.registered = false;
    this.admin = false;
    this.supporter = null;
    this.createdAt = null;
    this.lastSaved = null;
    this.lastActive = null;

    // private properties
    this._isLoaded = false;
  }

  /**
   * Get the user from the database
   * @param {String|User|GuildMember} user - A Discord User ID, User, or GuildMember
   * @returns {Promise<AppUser>} Returns a promise that resolves to an AppUser instance
   */
  async fetch(discordUser) {
    if (!discordUser) {
      throw new Error("Discord user must be provided");
    }

    if (discordUser instanceof User) {
      this.discordUser = discordUser;
      this.id = discordUser.id;
    } else {
      throw new Error(
        "discordUser must be a Discord User instance or a valid user ID"
      );
    }
    const json = await API.getUser(this.discordUser);
    this.deserialize(json);
    return this;
  }

  /**
   * Deserialize JSON data from the API into this AppUser instance
   * @param {Object} json - JSON data from the API
   */
  deserialize(json) {
    this.id = json.id;
    this.username = json.username;
    this.discriminator = json.discriminator || "0";
    this.avatarUrl = json.avatarUrl || "";
    this.email = json.email || "";
    this.verified = json.verified || false;
    this.registered = json.registered || false;
    this.admin = json.admin || false;
    this.supporter = json.supporter || 0;
    this.createdAt = json.createdAt;
    this.lastSaved = json.lastSaved;
    this.lastActive = json.lastActive;

    // Lazy-loaded related data
    // undefined = not fetched, null = fetched but no data, object = fetched data
    this.characterCount = undefined;

    // private properties
    this._isLoaded = true;
    return this;
  }

  /**
   * Serialize this AppUser instance to JSON
   * @returns {Object} JSON representation of the user
   */
  serialize() {
    return {
      id: this.id,
      username: this.username,
      discriminator: this.discriminator,
      avatarUrl: this.avatarUrl,
      email: this.email,
      verified: this.verified,
      registered: this.registered,
      admin: this.admin,
      supporter: this.supporter,
      createdAt: this.createdAt,
      lastSaved: this.lastSaved,
      lastActive: this.lastActive,
    };
  }

  /**
   * Lazily load the character count for this member from the backend.
   * @returns {Promise<Object>} Character count data
   * @throws {Error} If member data is not loaded
   */
  async loadCharacterCount() {
    if (!this.isLoaded())
      throw new Error(
        "User data must be loaded before fetching Character Count"
      );
    this.characterCount = await API.getCharacterCount(this.id);
    return this.characterCount;
  }

  /**
   * Check if user is a supporter
   * @returns {Boolean} True if supporter level > 0
   */
  isSupporter() {
    return this.supporter > 0;
  }

  /**
   * Check if user is an admin of the application
   * @returns {Boolean} True if user is admin
   */
  isAdmin() {
    return this.admin;
  }

  /**
   * Check if user is registered (logged into the website)
   * @returns {Boolean} True if user is registered
   */
  isRegistered() {
    return this.registered;
  }

  /**
   * Check if Character Count data has been fetched for this member.
   * @returns {Boolean} True if Character Count data is available
   */
  hasCharacterCount() {
    return this.characterCount !== undefined;
  }

  /**
   * Get formatted creation date
   * @param {TimestampStyles} style - Discord.js TimestampStyles
   * @returns {String} Discord formatted creation date
   */
  getCreatedTimestamp(style = TimestampStyles.LongDateTime) {
    return toDiscordTimestamp(this.createdAt, style);
  }

  /**
   * Get formatted last active date
   * @param {TimestampStyles} style - Discord.js TimestampStyles
   * @returns {String} Discord formatted last active date
   */
  getLastActiveTimestamp(style = TimestampStyles.LongDateTime) {
    return toDiscordTimestamp(this.lastActive, style);
  }
};
