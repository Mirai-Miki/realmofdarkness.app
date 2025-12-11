/**
 * Options for repository save operations.
 *
 * @remarks
 * This interface acts as a contract for metadata injection into events published
 * by repositories. Repositories publish events when data changes, but need to
 * "masquerade" as the original source to prevent loopback.
 *
 * @example
 * ```typescript
 * // In Gateway: Pass socket ID to prevent loopback
 * await characterRepo.save(character, { sourceId: socket.id });
 *
 * // In Bot: Pass shard ID
 * await characterRepo.save(character, { sourceId: `bot-shard-${shardId}` });
 *
 * // In Migration: Suppress events entirely
 * await characterRepo.save(character, { suppressEvents: true });
 * ```
 */
export interface SaveOptions {
  /**
   * The source ID (publisherId) to use when publishing events.
   *
   * **Purpose:** Prevent loopback when repositories publish events.
   *
   * **Use Cases:**
   * - WebSocket Gateway: Pass socket connection ID
   * - Bot Commands: Pass bot shard ID or command interaction ID
   * - API Requests: Pass request ID or user session ID
   *
   * **How it works:**
   * 1. Gateway receives update from socket "abc-123"
   * 2. Gateway calls `repo.save(entity, { sourceId: "abc-123" })`
   * 3. Repository publishes event with `publisherId: "abc-123"`
   * 4. Event system delivers to all clients EXCEPT "abc-123"
   * 5. Socket "abc-123" doesn't receive its own update
   *
   * If not provided, uses repository's default event client publisherId.
   */
  sourceId?: string;

  /**
   * Trace ID for distributed tracing and observability.
   *
   * Pass through from incoming requests to correlate events with their origin.
   * Useful for debugging and monitoring event chains.
   */
  correlationId?: string;

  /**
   * If true, suppresses event publication entirely.
   *
   * **Use Cases:**
   * - Data migrations (don't broadcast bulk imports)
   * - Database seeding
   * - Background jobs that shouldn't trigger real-time updates
   * - Testing (when you don't want events)
   */
  suppressEvents?: boolean;
}

/**
 * Result of a repository save operation.
 */
export interface SaveResult<T> {
  /** The saved entity (with updated metadata like lastUpdated) */
  entity: T;

  /** Whether any changes were actually persisted */
  changed: boolean;

  /** List of field names that changed (for partial updates) */
  changedFields?: string[];
}
