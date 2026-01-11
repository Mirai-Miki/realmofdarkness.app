/**
 * @file Example tests for emoji assets
 * @description Demonstrates usage of the assets package
 */

import { getEmojiPath, emojiExists, EMOJI_COUNT, type EmojiName } from "../src";
import fs from "node:fs";

describe("Emoji Assets", () => {
  describe("EmojiName type", () => {
    it("should provide type-safe emoji names", () => {
      // This should compile without errors
      const validEmoji: EmojiName = "dice_v5_default_primary_crit";
      expect(validEmoji).toBe("dice_v5_default_primary_crit");
    });

    it("should have correct count of emojis", () => {
      expect(EMOJI_COUNT).toBe(109);
    });
  });

  describe("getEmojiPath", () => {
    it("should return absolute path to emoji file", () => {
      const emojiPath = getEmojiPath("dice_v5_default_primary_crit");

      expect(emojiPath).toContain("emojis");
      expect(emojiPath).toContain("dice_v5_default_primary_crit.webp");
    });

    it("should support custom extensions", () => {
      const emojiPath = getEmojiPath("logo_gold", "png");

      expect(emojiPath).toContain("logo_gold.png");
    });

    it("should return path to existing file for valid emoji", () => {
      const emojiPath = getEmojiPath("dice_v5_default_primary_crit");

      // File should exist
      expect(fs.existsSync(emojiPath)).toBe(true);
    });
  });

  describe("emojiExists", () => {
    it("should return true for valid emoji names", () => {
      expect(emojiExists("dice_v5_default_primary_crit")).toBe(true);
    });

    it("should return false for empty strings", () => {
      expect(emojiExists("")).toBe(false);
    });

    it("should act as type guard", () => {
      const name: string = "dice_v5_0_p_crit";

      if (emojiExists(name)) {
        // Within this block, name is typed as EmojiName
        const path = getEmojiPath(name);
        expect(path).toBeDefined();
      }
    });
  });
});
