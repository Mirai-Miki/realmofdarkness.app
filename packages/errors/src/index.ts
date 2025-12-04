/**
 * Errors package for the Realm of Darkness application.
 *
 * Provides custom error types for better error handling:
 * - RealmError: Internal application errors that should be logged
 * - UserError: User-facing errors (validation, bad input, etc.) - not logged
 * - HttpStatus: Type-safe HTTP status code enum
 *
 * @example
 * ```typescript
 * import { RealmError, UserError, HttpStatus } from "@realm/errors";
 *
 * // Internal error (logged)
 * throw new RealmError("Database connection failed", {
 *   fields: { host: "localhost" },
 *   cause: originalError
 * });
 *
 * // User error (not logged)
 * throw new UserError("Invalid email format", {
 *   statusCode: HttpStatus.BAD_REQUEST,
 *   fields: { email: userInput }
 * });
 * ```
 */

export { RealmError, UserError } from "./errors.js";
export { HttpStatus } from "./types.js";
