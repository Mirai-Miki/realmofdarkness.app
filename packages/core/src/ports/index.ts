/**
 * Port interfaces for dependency inversion.
 *
 * These interfaces define contracts that infrastructure implementations must follow.
 * The domain layer depends on these interfaces, not on concrete implementations.
 */

export * from "./user.repository.interface.js";
export * from "./supporter.repository.interface.js";
export * from "./guild.repository.interface.js";
