/**
 * @realm/common - Shared Kernel Package
 *
 * This package contains all shared definitions, contracts, and interfaces
 * used across the Realm of Darkness monorepo.
 *
 * **Architecture**: Tier 0 (The Truth)
 * - Zero dependencies except zod
 * - Defines the "language" of the application
 * - All other packages depend on this
 *
 * **Contents**:
 * - **Interfaces**: ILogger, IEventClient, Repository interfaces
 * - **Types**: Snowflake, HttpStatus, DTOs
 * - **Enums**: Splats, SheetStatus, SupporterLevel, Environment
 * - **Errors**: RealmError, UserError
 * - **Contracts**: Zod schemas for events and data validation
 *
 * @packageDocumentation
 */

// Errors
export { RealmError, UserError } from "./error.definitions.js";

// Primitives (Snowflake, HexColor, Discord URL, Environment)
export * from "./primitives";

// Character module
export * from "./character";

// Dice Rolling module
export * from "./dice";

// Logger interface
export * from "./logger";

// Event System
export * from "./event-system.definitions";

// Repository interfaces
export * from "./repository.definitions";

// Supporter module
export {
  SupporterLevel,
  SupporterLevelSchema,
  type SupporterData,
  type ISupporterRepository,
} from "./supporter.definitions.js";

// Guild module
export {
  // Field schemas
  GuildNameSchema,
  GuildIconUrlSchema,
  StorytellerRolesSchema,
  // Data schemas
  GuildDataSchema,
  type GuildData,
  CreateGuildInputSchema,
  type CreateGuildInput,
  UpdateGuildInputSchema,
  type UpdateGuildInput,
  UpsertGuildInputSchema,
  type UpsertGuildInput,
  AddStorytellerRoleInputSchema,
  type AddStorytellerRoleInput,
  RemoveStorytellerRoleInputSchema,
  type RemoveStorytellerRoleInput,
  // Repository interface
  type IGuildRepository,
} from "./guild.definitions.js";

// User module
export {
  // Field schemas
  UsernameSchema,
  DisplayNameSchema,
  AvatarUrlSchema,
  // Data schemas
  UserDataSchema,
  type UserData,
  CreateUserInputSchema,
  type CreateUserInput,
  UpdateUserInputSchema,
  type UpdateUserInput,
  // Repository interface
  type IUserRepository,
} from "./user.definitions.js";

// Member module
export {
  // Field schemas
  MemberAdminSchema,
  MemberRoleIdsSchema,
  MemberBoostCountSchema,
  MemberNicknameSchema,
  MemberAvatarUrlSchema,
  // Data schemas
  MemberDataSchema,
  type MemberData,
  CreateMemberInputSchema,
  type CreateMemberInput,
  SyncMemberInputSchema,
  type SyncMemberInput,
  AddBoostInputSchema,
  type AddBoostInput,
  RemoveBoostInputSchema,
  type RemoveBoostInput,
  DeleteMemberInputSchema,
  type DeleteMemberInput,
  MemberExistsInputSchema,
  type MemberExistsInput,
  // Repository interface
  type IMemberRepository,
} from "./member.definitions.js";
