"use strict";

// Dynamic emoji proxy that works with the new emoji manager
// This maintains backwards compatibility while using application emojis
const EmojiProxy = new Proxy(
  {},
  {
    get(target, prop) {
      // Try to get from client's application emojis first
      if (typeof prop === "string") {
        // Look for a client instance in the global scope or module cache
        const { emojiManager } = require("@utils/emojiManager");
        return emojiManager.get(prop);
      }
      return undefined;
    },
    has(target, prop) {
      if (typeof prop === "string") {
        const { emojiManager } = require("@utils/emojiManager");
        return emojiManager.has(prop);
      }
      return false;
    },
  }
);

// Export the dynamic emoji proxy for backwards compatibility
module.exports.Emoji = EmojiProxy;
// Splats constants for game archetypes
module.exports.Splats = require("./Splats");
// ComponentCID constants for Discord component custom IDs
module.exports.ComponentCID = require("./ComponentCID");

module.exports.Supporter = require("./Supporter");

/**
 * Initialization phases for Discord bot game sessions.
 * Used to track the current state of a game or session.
 */
module.exports.InitPhase = {
  JOIN: 0,
  JOIN2: 1,
  ROLL: 2,
  ROLL2: 3,
  REVEAL: 4,
  DECLARE: 5,
  DECLARED: 6,
  END: 7,
};
