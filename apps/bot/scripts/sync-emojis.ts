import { REST } from "discord.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { config } from "dotenv";
import { resolve } from "path";
import { BotTypes } from "../src/types";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load root .env
config({ path: resolve(__dirname, "../../../.env"), quiet: true });

interface BotConfig {
  name: string;
  clientId: string | undefined;
  token: string | undefined;
}

interface EmojiFile {
  name: string;
  path: string;
}

interface ApplicationEmoji {
  id: string;
  name: string;
}

interface ApplicationEmojisResponse {
  items: ApplicationEmoji[];
}

interface SyncResult {
  bot: string;
  success: boolean;
  added?: number;
  removed?: number;
  error?: string;
}

const BOT_CONFIGS: BotConfig[] = [
  {
    name: BotTypes.Wod5,
    clientId: process.env.CLIENT_ID_5TH,
    token: process.env.TOKEN_5TH,
  },
  {
    name: BotTypes.Wod20,
    clientId: process.env.CLIENT_ID_20TH,
    token: process.env.TOKEN_20TH,
  },
  {
    name: BotTypes.Cod,
    clientId: process.env.CLIENT_ID_COD,
    token: process.env.TOKEN_COD,
  },
];

async function syncEmojis(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║            Discord Application Emoji Sync                ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const emojisPath = join(__dirname, "../emojis");

  let emojiFiles: EmojiFile[];
  try {
    const entries = await readdir(emojisPath);
    emojiFiles = entries
      .filter((file) => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
      .map((file) => ({
        name: file.replace(/\.[^.]+$/, ""),
        path: join(emojisPath, file),
      }));
  } catch (error) {
    console.log("⚠️  No emojis folder found, skipping emoji sync\n");

    // Write empty output file for Turbo cache
    const turboDir = join(__dirname, "../.turbo");
    await mkdir(turboDir, { recursive: true });
    await writeFile(
      join(turboDir, "emoji-sync.log"),
      JSON.stringify(
        { timestamp: new Date().toISOString(), results: [] },
        null,
        2
      )
    );
    return;
  }

  console.log(`🎨 Found ${emojiFiles.length} emoji files\n`);

  const results: SyncResult[] = [];

  for (const { name, clientId, token } of BOT_CONFIGS) {
    if (!clientId || !token) {
      console.log(`⚠️  Skipping ${name} (missing credentials)\n`);
      results.push({ bot: name, success: false, error: "Missing credentials" });
      continue;
    }

    try {
      console.log(`🔄 Syncing emojis for ${name}...`);
      const rest = new REST({ version: "10" }).setToken(token);

      const currentEmojis = (await rest.get(
        `/applications/${clientId}/emojis`
      )) as ApplicationEmojisResponse;

      const fileEmojiNames = new Set(emojiFiles.map((e) => e.name));
      const currentEmojiNames = new Set(currentEmojis.items.map((e) => e.name));

      const toAdd = emojiFiles.filter((e) => !currentEmojiNames.has(e.name));
      const toRemove = currentEmojis.items.filter(
        (e) => !fileEmojiNames.has(e.name)
      );

      let added = 0;
      let removed = 0;

      // Add new emojis
      for (const emoji of toAdd) {
        const imageBuffer = await readFile(emoji.path);
        const ext = emoji.path.split(".").pop()?.toLowerCase() || "png";
        const mimeType = getMimeType(ext);
        const imageDataUri = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

        await rest.post(`/applications/${clientId}/emojis`, {
          body: { name: emoji.name, image: imageDataUri },
        });
        added++;

        // Rate limit protection
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Remove old emojis
      for (const emoji of toRemove) {
        await rest.delete(`/applications/${clientId}/emojis/${emoji.id}`);
        removed++;

        // Rate limit protection
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(`✅ ${name}: +${added} -${removed}\n`);
      results.push({ bot: name, success: true, added, removed });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to sync ${name}:`, errorMessage, "\n");
      results.push({ bot: name, success: false, error: errorMessage });
    }
  }

  // Write output file for Turbo cache
  const turboDir = join(__dirname, "../.turbo");
  await mkdir(turboDir, { recursive: true });
  await writeFile(
    join(turboDir, "emoji-sync.log"),
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
  );

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} bot(s) failed to sync emojis`);
    process.exit(1);
  }

  console.log("✨ All emoji syncs completed successfully!\n");
}

function getMimeType(ext: string): string {
  const types: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };
  return types[ext] || "image/png";
}

syncEmojis().catch((error) => {
  console.error("❌ Emoji sync failed:", error);
  process.exit(1);
});
