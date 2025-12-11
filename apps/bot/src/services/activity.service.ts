import type { Client } from "discord.js";
import { ActivityType } from "discord.js";
import { RealmError } from "@realm/errors";
import { logger } from "@realm/logger";

/**
 * Service responsible for managing the bot's presence and activity status.
 *
 * This service handles calculating the total guild count across all shards (if applicable)
 * and updating the bot's "Watching" status to reflect the current reach of the bot.
 */
export class ActivityService {
  /**
   * Updates the bot's activity status with the current guild count.
   *
   * @remarks
   * This method runs asynchronously in the background ("fire-and-forget") and catches
   * all errors internally to prevent unhandled rejections. It is safe to call this
   * method from synchronous contexts or event handlers without awaiting it.
   *
   * It calculates the total guild count by:
   * - Fetching client values from all shards if sharding is enabled
   * - Using local cache size if not sharded
   *
   * @param client - The Discord.js Client instance
   */
  public static update(client: Client): void {
    // We use an Immediately Invoked Async Function Expression (IIFE)
    // The 'void' operator ensures we don't return the Promise to the caller
    void (async () => {
      try {
        // 1. Handle Validation Internally
        // We moved this INSIDE the try/catch.
        // Originally it threw an error outside, which would crash if unhandled.
        if (!client.user) {
          throw new RealmError("Client user is not available");
        }

        let size: number;

        // 2. Perform Async Logic
        if (client.shard) {
          const guildSizes = (await client.shard.fetchClientValues(
            "guilds.cache.size"
          )) as number[];

          size = guildSizes.reduce((acc, val) => acc + val, 0);
        } else {
          size = client.guilds.cache.size;
        }

        const shardDisplay = client.shard?.ids
          ? client.shard.ids.join(", ")
          : "None";

        // 3. Set Activity
        client.user.setActivity({
          name: `${size} Chronicles - Shard: ${shardDisplay}`,
          type: ActivityType.Watching,
        });
      } catch (error) {
        // 4. Catch-All Error Handling
        // Since the caller isn't awaiting, we MUST log here.
        logger.exception("Failed to set bot activity", error);
      }
    })();
  }
}
