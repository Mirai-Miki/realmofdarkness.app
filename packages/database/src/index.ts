/**
 * Database package index.
 *
 * Re-exports all schema definitions, types, Zod validation schemas,
 * and the database singleton for use throughout the application.
 *
 * @packageDocumentation
 */

// Re-export all schema tables, relations, types, and Zod schemas
export * from "./schema/";

// Re-export database singleton and type
export { db, type Database } from "./db";
