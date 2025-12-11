import type { Client } from "discord.js";
import { ActivityType } from "discord.js";
import { RealmError } from "@realm/logger/errors";
import { logger } from "@realm/logger";

/**
 * Sets the bot's activity status showing the number of guilds it's connected to
 * @param client - The Discord client instance
 * @throws {Error} When client or client.user is not available
 */
export async function setActivity(client: Client): Promise<void> {
  if (!client.user) {
    throw new RealmError("Client user is not available");
  }

  try {
    let size: number;

    if (client.shard) {
      const guildSizes = (await client.shard.fetchClientValues(
        "guilds.cache.size"
      )) as number[];
      size = guildSizes.reduce(
        (accumulator: number, currentValue: number) =>
          accumulator + currentValue,
        0
      );
    } else {
      size = client.guilds.cache.size;
    }

    const shardDisplay = client.shard?.ids
      ? client.shard.ids.join(", ")
      : "None";

    client.user.setActivity({
      name: `${size} Chronicles - Shard: ${shardDisplay}`,
      type: ActivityType.Watching,
    });
  } catch (error) {
    logger.exception("Failed to set bot activity:", error});
  }
}
