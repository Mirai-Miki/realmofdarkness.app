/**
 * @file Example tests for emoji assets
 * @description Demonstrates usage of the assets package
 */

import {
  getEmojiPath,
  emojiExists,
  EMOJI_COUNT,
  Emojis,
  type EmojiName,
} from "../src";
import fs from "node:fs";

describe("Emoji Assets", () => {
  describe("EmojiName type", () => {
    it("should provide type-safe emoji names (MD5 hashes)", () => {
      // Use Emojis object to get the MD5 hash
      const validEmoji: EmojiName = Emojis.Dice.V5.Default.Primary.Crit;
      expect(typeof validEmoji).toBe("string");
      expect(validEmoji.length).toBe(32); // MD5 hashes are 32 chars
    });

    it("should have correct count of emojis", () => {
      expect(EMOJI_COUNT).toBe(109);
    });
  });

  describe("getEmojiPath", () => {
    it("should return absolute path to emoji file", () => {
      const emojiHash = Emojis.Dice.V5.Default.Primary.Crit;
      const emojiPath = getEmojiPath(emojiHash);

      expect(emojiPath).toContain("emojis");
      expect(emojiPath).toMatch(/dice.*v5.*default.*primary.*crit\.webp/i);
    });

    it("should support custom extensions", () => {
      const logoHash = Emojis.Logo.Gold;
      const emojiPath = getEmojiPath(logoHash, "png");

      expect(emojiPath).toContain("logo");
      expect(emojiPath).toContain(".png");
    });

    it("should return path to existing file for valid emoji", () => {
      const emojiHash = Emojis.Dice.V5.Default.Primary.Crit;
      const emojiPath = getEmojiPath(emojiHash);

      // File should exist
      expect(fs.existsSync(emojiPath)).toBe(true);
    });
  });

  describe("emojiExists", () => {
    it("should return true for valid emoji hashes", () => {
      const emojiHash = Emojis.Dice.V5.Default.Primary.Crit;
      expect(emojiExists(emojiHash)).toBe(true);
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
