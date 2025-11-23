/**
 * Errors package for the Realm of Darkness application.
 *
 * Provides custom error types for better error handling:
 * - RealmError: Internal application errors that should be logged
 * - ClientError: User-facing errors (validation, not found, etc.)
 * - HttpStatus: Type-safe HTTP status code enum
 *
 * @example
 * ```typescript
 * import { RealmError, ClientError, HttpStatus } from "@realm/errors";
 *
 * // Internal error (logged)
 * throw new RealmError("Database connection failed", {
 *   fields: { host: "localhost" },
 *   cause: originalError
 * });
 *
 * // Client error (not logged)
 * throw new ClientError("Invalid email format", {
 *   statusCode: HttpStatus.BAD_REQUEST,
 *   fields: { email: userInput }
 * });
 * ```
 */

export { RealmError, ClientError } from "./errors.js";
export { HttpStatus } from "./types.js";
