"use strict";
require(`${process.cwd()}/alias`);
const AppUser = require("@structures/AppUser");
const { toDiscordTimestamp } = require("@modules/misc");
const API = require("@api");
const { GuildMember, Client, TimestampStyles } = require("discord.js");

/**
 * Represents a chronicle member with Discord and backend data, supporting lazy loading for related resources.
 *
 * - Use `AppMember.fetch()` to load member data from the backend.
 * - Related data (AppUser, Chronicle, Characters, CharacterCount) is loaded on demand via dedicated methods.
 * - Permission checks and Discord timestamp formatting are provided.
 *
 * @example
 * // Fetch a member by Discord IDs
 * const member = await AppMember.fetch({ userId, guildId });
 *
 * @example
 * // Fetch a member by GuildMember object
 * const member = await AppMember.fetch({ guildMember });
 *
 * @example
 * // Lazy load related data
 * const appUser = await member.loadAppUser();
 * const chronicle = await member.loadChronicle();
 * const characters = await member.loadCharacters();
 * const counts = await member.loadCharacterCount();
 *
 * @example
 * // Discord timestamp formatting
 * member.getCreatedTimestamp();
 * member.getLastUpdatedTimestamp();
 */
module.exports = class AppMember {
  /**
   * Create an AppMember instance.
   * @param {Client} client - Discord client instance
   */
  constructor(client) {
    if (!client || !(client instanceof Client)) {
      throw new Error("Client must be provided to AppMember constructor");
    }

    // public properties
    this.client = client; // Discord client instance
    this.id = null; // AppMember ID
    this.guildMember = null; // Discord GuildMember object
    this.chronicleId = null; // Chronicle ID
    this.chronicle = null; // Chronicle data
    this.userId = null; // User ID
    this.appUser = null; // AppUser data
    this.guild = null; // Discord Guild object
    this.user = null; // Discord User object
    this.admin = false;
    this.storyteller = false;
    this.nickname = "";
    this.avatarUrl = "";
    this.createdAt = null;
    this.lastUpdated = null;
    this.defaultCharacter = null;
    this.defaultAutoHunger = null;

    // Lazy-loaded related data
    // undefined = not fetched, null = fetched but no data, object = fetched data
    this.characters = undefined;
    this.characterCount = undefined;

    // private properties
    this._isLoaded = false; // If member data has been loaded
  }

  /**
   * Loads a member from the backend and Discord cache.
   *
   * @param {Object} options - Options object
   * @param {GuildMember} [guildMember] - Discord GuildMember object (optional)
   * @param {String} [userId] - Discord user ID
   * @param {String} [guildId] - Discord guild/chronicle ID
   * @returns {Promise<AppMember>} Returns an AppMember instance
   *
   * @throws {RealmError} If required data is missing or member not found
   */
  async fetch(guildMember = null) {
    if (guildMember && guildMember instanceof GuildMember) {
      this.userId = guildMember.user.id;
      this.chronicleId = guildMember.guild.id;
      this.guildMember = guildMember;
      this.guild = guildMember.guild;
      this.user = guildMember.user;
    } else {
      throw new Error("guildMember must be provided");
    }

    const json = await API.getMember(this.userId, this.chronicleId);
    this.deserialize(json);
    return this;
  }

  /**
   * Populate this AppMember instance from backend JSON data.
   * @param {Object} json - JSON data from the API
   */
  deserialize(json) {
    this.id = json.id;
    this.chronicleId = json.chronicle.id;
    this.chronicle = json.chronicle;
    this.userId = json.user.id;
    this.admin = json.admin || false;
    this.storyteller = json.storyteller || false;
    this.nickname = json.nickname || "";
    this.avatarUrl = json.avatarUrl || "";
    this.createdAt = json.createdAt;
    this.lastUpdated = json.lastUpdated;
    this.defaultCharacter = json.defaultCharacter;
    this.defaultAutoHunger = json.defaultAutoHunger || false;

    this.appUser = new AppUser(this.client);
    this.appUser.deserialize(json.user);

    this._isLoaded = true; // Mark as loaded
    return this;
  }

  /**
   * Serialize this AppMember instance to a plain object for API or storage.
   * @returns {Object} JSON representation of the member
   */
  serialize() {
    return {
      id: this.id,
      chronicle: this.chronicleId,
      user: this.userId,
      admin: this.admin,
      storyteller: this.storyteller,
      nickname: this.nickname,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated,
      defaultCharacter: this.defaultCharacter,
      defaultAutoHunger: this.defaultAutoHunger,
    };
  }

  /**
   * Lazily load the character list for this member from the backend.
   * @returns {Promise<Array|null>} Array of character objects or null if not found
   * @throws {Error} If member data is not loaded
   * @note Not implemented yet
   */
  async loadCharacters() {
    if (!this.isLoaded())
      throw new Error("Member data must be loaded before fetching Characters");

    // TODO Implement character fetching logic
  }

  /**
   * Lazily load the character count for this member from the backend.
   * @returns {Promise<Object>} Character count data
   * @throws {Error} If member data is not loaded
   */
  async loadCharacterCount() {
    if (!this.isLoaded())
      throw new Error(
        "Member data must be loaded before fetching Character Count"
      );

    this.characterCount = await API.getCharacterCount(
      this.userId,
      this.chronicleId
    );
    return this.characterCount;
  }

  /**
   * Check if member data has been loaded from the backend.
   * @returns {Boolean} True if member data has been loaded
   */
  isLoaded() {
    return this._isLoaded;
  }

  /**
   * Check if member is an admin.
   * @returns {Boolean} True if member is admin
   */
  isAdmin() {
    return this.admin;
  }

  /**
   * Check if member is a storyteller.
   * @returns {Boolean} True if member is storyteller
   */
  isStoryteller() {
    return this.storyteller;
  }

  /**
   * Check if member has elevated permissions (admin or storyteller).
   * @returns {Boolean} True if member has elevated permissions
   */
  isStaff() {
    return this.admin || this.storyteller;
  }

  /**
   * Check if Characters data has been fetched for this member.
   * @returns {Boolean} True if Characters data is available
   */
  hasCharacters() {
    return this.Characters !== undefined;
  }

  /**
   * Check if Character Count data has been fetched for this member.
   * @returns {Boolean} True if Character Count data is available
   */
  hasCharacterCount() {
    return this.characterCount !== undefined;
  }

  /**
   * Get formatted creation date for this member.
   * @param {TimestampStyles} [style=TimestampStyles.LongDateTime] - Discord.js TimestampStyles
   * @returns {String} Discord formatted creation date
   */
  getCreatedTimestamp(style = TimestampStyles.LongDateTime) {
    return toDiscordTimestamp(this.createdAt, style);
  }

  /**
   * Get formatted last updated date for this member.
   * @param {TimestampStyles} [style=TimestampStyles.LongDateTime] - Discord.js TimestampStyles
   * @returns {String} Discord formatted last updated date
   */
  getLastUpdatedTimestamp(style = TimestampStyles.LongDateTime) {
    return toDiscordTimestamp(this.lastUpdated, style);
  }
};
