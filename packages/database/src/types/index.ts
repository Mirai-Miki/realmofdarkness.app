import type { InferSelectModel } from "drizzle-orm";
import type { users } from "../schema/users";
import type { guilds, storytellerRoles } from "../schema/guilds";
import type { members } from "../schema/members";
import type { initiativeTrackers } from "../schema/initiative";
import type { commandStats } from "../schema/stats";
import type { characters } from "../schema/characters";

export type UserDb = InferSelectModel<typeof users>;
export type GuildDb = InferSelectModel<typeof guilds>;
export type StorytellerRoleDb = InferSelectModel<typeof storytellerRoles>;
export type MemberDb = InferSelectModel<typeof members>;
export type InitiativeTrackerDb = InferSelectModel<typeof initiativeTrackers>;
export type CommandStatDb = InferSelectModel<typeof commandStats>;
export type CharacterDb = InferSelectModel<typeof characters>;

// Placeholder for CharacterJsonbData
export interface CharacterJsonbData {
  [key: string]: unknown;
}
