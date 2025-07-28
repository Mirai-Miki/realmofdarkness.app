"use strict";

const EmojiProxy = new Proxy(
  {},
  {
    get(target, prop) {
      // Try to get from client's application emojis first
      if (typeof prop === "string") {
        // Look for a client instance in the global scope or module cache
        const { emojiManager } = require("../utils/emojiManager");
        return emojiManager.get(prop);
      }
      return undefined;
    },
    has(target, prop) {
      if (typeof prop === "string") {
        const { emojiManager } = require("../utils/emojiManager");
        return emojiManager.has(prop);
      }
      return false;
    },
  }
);

/**
 * Emoji constants for Discord applications.
 * @type {import('../types/emojiTypes').EmojiObject}
 */
// @ts-ignore - Proxy object cannot be statically typed but we provide the interface for IntelliSense
const EmojiProxyTyped =
  /** @type {import('../types/emojiTypes').EmojiObject} */ (EmojiProxy);

module.exports.Emoji = EmojiProxyTyped;
