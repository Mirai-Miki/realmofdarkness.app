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

// Logger interface
export * from "./logger";

// Event System
export * from "./event-system.definitions";

// Repository interfaces
export * from "./repository.definitions";

// Supporter module
export {
  SupporterLevel,
  SupporterLevelField,
  type SupporterDto,
  type ISupporterRepository,
} from "./supporter.definitions.js";

// Guild module
export {
  // Field schemas
  GuildNameField,
  GuildIconUrlField,
  StorytellerRolesField,
  // DTOs
  GuildDtoSchema,
  type GuildDto,
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
  UsernameField,
  DisplayNameField,
  AvatarUrlField,
  // DTOs
  UserDtoSchema,
  type UserDto,
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
  MemberAdminField,
  MemberRoleIdsField,
  MemberBoostCountField,
  MemberNicknameField,
  MemberAvatarUrlField,
  // DTOs
  MemberDtoSchema,
  type MemberDto,
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
