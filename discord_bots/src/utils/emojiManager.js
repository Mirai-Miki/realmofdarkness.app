"use strict";
const { Client } = require("discord.js");

/**
 * Dynamic emoji manager for Discord applications
 * Replaces the static emoji definitions with dynamic application emoji loading
 */
class EmojiManager {
  constructor() {
    this.emojis = new Map();
    this.loaded = false;
  }

  /**
   * Load application emojis into the manager
   * @param {Client} client - Discord.js client instance
   */
  async loadEmojis(client) {
    try {
      if (!client.application) {
        throw new Error("Client application not available");
      }

      // Fetch all application emojis
      await client.application.emojis.fetch();
      const applicationEmojis = client.application.emojis.cache;

      // Clear existing emojis
      this.emojis.clear();

      // Map emojis by name for easy access
      for (const emoji of applicationEmojis.values()) {
        this.emojis.set(emoji.name, emoji);
      }

      this.loaded = true;
    } catch (error) {
      console.error("Failed to load application emojis:", error);
      this.loaded = false;
    }
  }

  /**
   * Get an emoji by name
   * @param {string} name - Emoji name
   * @returns {string} - Emoji string or fallback
   */
  get(name) {
    if (!this.loaded) {
      throw new Error("Emoji manager not loaded. Call loadEmojis first.");
    }

    const emoji = this.emojis.get(name);
    if (emoji) {
      return emoji;
    }
  }

  /**
   * Check if an emoji exists
   * @param {string} name - Emoji name
   * @returns {boolean}
   */
  has(name) {
    return this.emojis.has(name);
  }

  /**
   * Get all available emoji names
   * @returns {string[]}
   */
  getNames() {
    return Array.from(this.emojis.keys());
  }

  /**
   * Get emoji count
   * @returns {number}
   */
  size() {
    return this.emojis.size;
  }
}

// Create global instance
const emojiManager = new EmojiManager();

/**
 * Initialize emoji manager with client
 * Call this in your bot's ready event
 * @param {Client} client - Discord.js client
 */
async function initializeEmojis(client) {
  await emojiManager.loadEmojis(client);
}

module.exports = {
  EmojiManager,
  emojiManager,
  initializeEmojis,
};
