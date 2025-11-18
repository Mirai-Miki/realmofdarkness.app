import type { InferSelectModel } from "drizzle-orm";
import type { users } from "database/schema/users";
import type { guilds, storytellerRoles } from "database/schema/guilds";
import type { members } from "database/schema/members";
import type { initiativeTrackers } from "database/schema/initiative";
import type { commandStats } from "database/schema/stats";
import type { characters } from "database/schema/characters";

export type UserDb = InferSelectModel<typeof users>;
export type GuildDb = InferSelectModel<typeof guilds>;
export type StorytellerRoleDb = InferSelectModel<typeof storytellerRoles>;
export type MemberDb = InferSelectModel<typeof members>;
export type InitiativeTrackerDb = InferSelectModel<typeof initiativeTrackers>;
export type CommandStatDb = InferSelectModel<typeof commandStats>;
export type CharacterDb = InferSelectModel<typeof characters>;
