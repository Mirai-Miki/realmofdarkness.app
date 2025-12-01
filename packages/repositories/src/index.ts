/**
 * Repositories package for the Realm of Darkness application.
 *
 * Provides data access layer implementations that bridge between
 * domain models and database persistence.
 *
 * @example
 * ```typescript
 * import { UserRepository } from "@realm/repositories";
 * import { db } from "@realm/database";
 *
 * const userRepo = new UserRepository(db);
 * const user = await userRepo.findById("123456789012345678");
 * ```
 */

// Export repositories
export { UserRepository } from "./user.repository.js";
export { SupporterRepository } from "./supporter.repository.js";
export { GuildRepository } from "./guild.repository.js";

// Export mappers
export { UserMapper } from "./mappers/user.mapper.js";
export { SupporterMapper } from "./mappers/supporter.mapper.js";
export { GuildMapper } from "./mappers/guild.mapper.js";

// TODO: Export when implemented
// export { CharacterRepository } from "./character.repository.js";
// export { MemberRepository } from "./member.repository.js";
