/**
 * Application services for orchestrating domain logic.
 *
 * Services in this layer:
 * - Coordinate multiple domain entities and repositories
 * - Implement use cases and business workflows
 * - Handle cross-cutting concerns (logging, validation)
 * - Depend on port interfaces (not concrete implementations)
 */

export { GuildService } from "./guild.service";
