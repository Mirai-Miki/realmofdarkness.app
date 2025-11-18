import type { Client, Collection } from "discord.js";

import type { BotCommand, BotComponent } from "./bot";

// Global module augmentation to override Discord.js types
declare module "discord.js" {
  interface Client {
    commands: Collection<string, BotCommand>;
    components: Collection<string, BotComponent>;
  }
}
