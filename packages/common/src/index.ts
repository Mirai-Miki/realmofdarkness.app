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
 * - **Enums**: Splats, SheetStatus, SupporterName, Environment
 * - **Errors**: RealmError, UserError
 * - **Contracts**: Zod schemas for events and data validation
 *
 * @packageDocumentation
 */

// Errors
export { RealmError, UserError } from "./error.definitions.js";

// Primitives
export * from "./primitives/index.js";

// Interfaces (Infrastructure interfaces: logger, event client)
export * from "./interfaces/index.js";
