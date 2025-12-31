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
export { UserRepository } from "./user.repository";
export { GuildRepository } from "./guild.repository";
export { MemberRepository } from "./member.repository";

export { CharacterRepository } from "./character.repository";
