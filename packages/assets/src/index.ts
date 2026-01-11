/**
 * @file Assets package - Runtime assets (emojis, images) for Realm of Darkness
 * @description Provides strongly-typed access to emoji assets and other runtime resources
 */

// Export types
export type { EmojiName, EmojisType } from "./types";
export { EMOJI_COUNT, Emojis, EmojiNameSchema } from "./types";

// Export utilities
export {
  getEmojiPath,
  emojiExists,
  getAllEmojiFiles,
  getEmojiFilePath,
  emojiFileExists,
  clearEmojiCache,
  type EmojiFile,
} from "./utilities";
