/**
 * Discord Emoji Downloader Script
 *
 * Downloads all emojis from a specified Discord message to a tempEmojis folder.
 * Useful for backing up emojis or migrating them between applications.
 *
 * Setup:
 * 1. Add EMOJI_SCRIPT_TOKEN to your .env file (any bot token that can access the message)
 * 2. Run with: node getEmojis.ts <channelId> <messageId>
 *
 * Examples:
 *   node getEmojis.ts 719420620701564968 1399195229797744661
 */
import { Client, GatewayIntentBits, type GuildEmoji } from "discord.js";
import fs from "fs";
import path from "path";
import https from "https";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get configuration from environment and command line arguments
const token: string | undefined = process.env.EMOJI_SCRIPT_TOKEN;
const args: string[] = process.argv.slice(2);

// Validate arguments
if (!token) {
  console.error("❌ EMOJI_SCRIPT_TOKEN not found in environment variables!");
  console.log("Please add EMOJI_SCRIPT_TOKEN to your .env file");
  process.exit(1);
}

if (args.length < 2) {
  console.error("❌ Missing required arguments!");
  console.log("Usage: node getEmojis.ts <channelId> <messageId>");
  console.log("Examples:");
  console.log("  node getEmojis.ts 719420620701564968 1399195229797744661");
  process.exit(1);
}

const channelId: string = args[0];
const messageId: string = args[1];

/**
 * Download an image from a URL and save it to a file
 * @param url - The URL to download from
 * @param filepath - The local file path to save to
 * @returns Promise that resolves when download is complete
 */
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${url}: ${response.statusCode}`)
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve();
        });

        file.on("error", (err) => {
          fs.unlink(filepath, () => {}); // Delete the file on error
          reject(err);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

/**
 * Parse emoji IDs from a message content string
 * @param content - The message content containing emoji strings
 * @returns Array of emoji IDs
 */
function parseEmojiIds(content: string): string[] {
  // Regular expression to match Discord emoji format: <:name:id> or <a:name:id>
  const emojiRegex = /<a?:[^:]+:(\d+)>/g;
  const ids: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = emojiRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }

  return ids;
}

/**
 * Downloads all emojis from a specified Discord message.
 * Usage: node getEmojis.ts <channelId> <messageId>
 */
async function main(): Promise<void> {
  // Create tempEmojis directory if it doesn't exist
  const tempEmojisDir: string = path.join(process.cwd(), "tempEmojis");
  if (!fs.existsSync(tempEmojisDir)) {
    fs.mkdirSync(tempEmojisDir, { recursive: true });
    console.log(`Created directory: ${tempEmojisDir}`);
  }

  // Create client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}`);
    console.log(`Channel ID: ${channelId}`);
    console.log(`Message ID: ${messageId}`);

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel?.isTextBased()) {
        throw new Error("Channel is not a text-based channel");
      }

      const message = await channel.messages.fetch(messageId);
      console.log("\n" + "=".repeat(50));

      // Parse emoji IDs from the message content
      const emojiIds: string[] = parseEmojiIds(message.content);
      console.log(`Found ${emojiIds.length} emojis to download`);

      if (emojiIds.length === 0) {
        console.log("No emojis found in the message content!");
        return;
      }

      // Process each emoji ID
      let downloadedCount = 0;
      let errorCount = 0;
      let animatedCount = 0;
      let staticCount = 0;

      for (const emojiId of emojiIds) {
        try {
          // Resolve the emoji using the client
          const guildEmoji: GuildEmoji | null =
            await client.emojis.resolve(emojiId);

          if (!guildEmoji) {
            console.log(`❌ Could not resolve emoji with ID: ${emojiId}`);
            errorCount++;
            continue;
          }

          // Always use webp for both animated and static emojis
          const isAnimated: boolean = guildEmoji.animated;
          const extension: string = "webp";

          // Get the emoji image URL with webp format
          const imageUrl: string = guildEmoji.imageURL({
            extension: extension as "webp",
            size: 128,
          });

          // Create filename with .webp extension
          const filename: string = `${guildEmoji.name}.${extension}`;
          const filepath: string = path.join(tempEmojisDir, filename);

          // Download the image
          await downloadImage(imageUrl, filepath);
          console.log(
            `✅ Downloaded: ${filename} ${isAnimated ? "(animated)" : "(static)"}`
          );
          downloadedCount++;

          // Track animated vs static counts
          if (isAnimated) {
            animatedCount++;
          } else {
            staticCount++;
          }

          // Add a small delay to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(
            `❌ Error processing emoji ${emojiId}:`,
            (error as Error).message
          );
          errorCount++;
        }
      }

      console.log("\n" + "=".repeat(50));
      console.log(`📊 Download Summary:`);
      console.log(`   ✅ Successfully downloaded: ${downloadedCount}`);
      console.log(`   🎬 Animated (WebP): ${animatedCount}`);
      console.log(`   🖼️  Static (WebP): ${staticCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
      console.log(`   📁 Files saved to: ${tempEmojisDir}`);
    } catch (error) {
      console.error("❌ Error fetching message:", (error as Error).message);

      if ((error as any).code === 50001) {
        console.log(
          "💡 This might be a permissions issue. Make sure the bot has access to the channel/guild."
        );
      } else if ((error as any).code === 10008) {
        console.log(
          "💡 Message not found. Check the message ID and make sure it exists."
        );
      } else if ((error as any).code === 10003) {
        console.log(
          "💡 Channel not found. Check the channel ID and guild ID (if specified)."
        );
      }
    } finally {
      client.destroy();
    }
  });

  await client.login(token);
}

await main().catch(console.error);
