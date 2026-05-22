import type { Client, ApplicationEmoji } from "discord.js";
import type { EmojiName } from "@realm/assets";
import { RealmError } from "@realm/common";

/**
 * Dynamic emoji manager for Discord applications
 * Replaces the static emoji definitions with dynamic application emoji loading
 */
class EmojiManager {
  private readonly emojis: Map<EmojiName, ApplicationEmoji>;
  private loaded: boolean;

  /**
   * Creates a new EmojiManager instance
   */
  constructor() {
    this.emojis = new Map<EmojiName, ApplicationEmoji>();
    this.loaded = false;
  }

  /**
   * Load application emojis into the manager
   * @param client - Discord.js client instance
   * @throws {Error} When client application is not available
   */
  async loadEmojis(client: Client): Promise<void> {
    try {
      if (!client.application) {
        throw new RealmError("Client application not available");
      }

      // Fetch all application emojis
      await client.application.emojis.fetch();
      const applicationEmojis = client.application.emojis.cache;

      // Clear existing emojis
      this.emojis.clear();

      // Map emojis by their MD5 hash name
      for (const emoji of applicationEmojis.values()) {
        this.emojis.set(emoji.name as EmojiName, emoji);
      }

      this.loaded = true;
    } catch (error) {
      console.error("Failed to load application emojis:", error);
      this.loaded = false;
    }
  }

  /**
   * Get an emoji by name
   * @param name - Emoji name
   * @returns The emoji if found, undefined otherwise
   * @throws {Error} When emoji manager is not loaded
   */
  get(name: EmojiName): ApplicationEmoji | undefined {
    if (!this.loaded) {
      throw new RealmError("Emoji manager not loaded. Call loadEmojis first.");
    }

    return this.emojis.get(name);
  }

  /**
   * Check if an emoji exists
   * @param name - Emoji name
   * @returns True if the emoji exists
   */
  has(name: EmojiName): boolean {
    return this.emojis.has(name);
  }

  /**
   * Get all available emoji names
   * @returns Array of available emoji names
   */
  getNames(): EmojiName[] {
    return Array.from(this.emojis.keys());
  }

  /**
   * Get emoji count
   * @returns Number of loaded emojis
   */
  size(): number {
    return this.emojis.size;
  }

  /**
   * Check if emojis are loaded
   * @returns True if emojis are loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }
}

// Create global instance
const emojiManager = new EmojiManager();

/**
 * Initialize emoji manager with client
 * Call this in your bot's ready event
 * @param client - Discord.js client
 */
async function initializeEmojis(client: Client): Promise<void> {
  await emojiManager.loadEmojis(client);
}

// Export both the instance and the class for flexibility
export { EmojiManager, initializeEmojis, emojiManager };
