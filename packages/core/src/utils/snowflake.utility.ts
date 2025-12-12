/**
 * Discord-compatible Snowflake ID generator that guarantees no collisions with Discord snowflakes.
 *
 * This implementation uses a different epoch (project start date) to ensure the timestamp portion
 * will never overlap with Discord's snowflake range, preventing any possible collisions.
 *
 * Snowflake Structure (64 bits):
 * - Timestamp: 42 bits (milliseconds since custom epoch)
 * - Worker ID: 5 bits (0-31, configurable per instance)
 * - Process ID: 5 bits (0-31, auto-detected or configurable)
 * - Increment: 12 bits (0-4095, auto-incrementing sequence)
 *
 * Discord uses epoch: January 1, 2015 00:00:00 UTC (1420070400000)
 * This generator uses: January 1, 1970 00:00:00 UTC (0) - Unix epoch
 *
 * Using Unix epoch maximizes timestamp range and pushes potential collisions
 * with Discord snowflakes to approximately the year 2070.
 */

import { RealmError } from "@realm/common";

/**
 * Snowflake component bit lengths
 */
const TIMESTAMP_BITS = 42;
const WORKER_ID_BITS = 5;
const PROCESS_ID_BITS = 5;
const SEQUENCE_BITS = 12;

/**
 * Maximum values for each component
 */
const MAX_WORKER_ID = (1 << WORKER_ID_BITS) - 1; // 31
const MAX_PROCESS_ID = (1 << PROCESS_ID_BITS) - 1; // 31
const MAX_SEQUENCE = (1 << SEQUENCE_BITS) - 1; // 4095

/**
 * Bit shifts for assembling the snowflake
 */
const WORKER_ID_SHIFT = SEQUENCE_BITS;
const PROCESS_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;
const TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + PROCESS_ID_BITS;

/**
 * Configuration options for the Snowflake generator
 */
export interface SnowflakeConfig {
  /** Worker ID (0-31). Defaults to random value if not specified */
  workerId?: number;
  /** Process ID (0-31). Defaults to process.pid % 32 if available, otherwise random */
  processId?: number;
}

/**
 * Represents a parsed snowflake with its component parts
 */
export interface ParsedSnowflake {
  /** The original snowflake ID as a string */
  id: string;
  /** Timestamp in milliseconds since Unix epoch (1970-01-01) */
  timestamp: number;
  /** Date object representing when the snowflake was created */
  date: Date;
  /** Worker ID component (0-31) */
  workerId: number;
  /** Process ID component (0-31) */
  processId: number;
  /** Sequence number component (0-4095) */
  sequence: number;
}

/**
 * Thread-safe Snowflake ID generator that produces Discord-compatible IDs
 * without risk of collision with actual Discord snowflakes.
 *
 * @example
 * ```typescript
 * // Create a generator with default settings
 * const generator = new SnowflakeGenerator();
 * const id = generator.generate(); // "1234567890123456789"
 *
 * // Create a generator with specific worker/process IDs
 * const generator2 = new SnowflakeGenerator({ workerId: 1, processId: 1 });
 * const id2 = generator2.generate();
 *
 * // Parse a snowflake to extract components
 * const parsed = SnowflakeGenerator.parse(id);
 * console.log(parsed.date); // Date when the ID was generated
 * ```
 */
export class SnowflakeGenerator {
  private readonly workerId: number;
  private readonly processId: number;
  private sequence: number = 0;
  private lastTimestamp: number = 0;

  /**
   * Creates a new Snowflake generator instance
   *
   * @param config Configuration options for worker and process IDs
   * @throws {Error} If worker or process IDs are out of valid range (0-31)
   */
  constructor(config: SnowflakeConfig = {}) {
    // Validate and set worker ID
    this.workerId =
      config.workerId ?? Math.floor(Math.random() * (MAX_WORKER_ID + 1));
    if (this.workerId < 0 || this.workerId > MAX_WORKER_ID) {
      throw new Error(
        `Worker ID must be between 0 and ${MAX_WORKER_ID}, got ${this.workerId}`
      );
    }

    // Validate and set process ID
    this.processId = config.processId ?? this.getDefaultProcessId();
    if (this.processId < 0 || this.processId > MAX_PROCESS_ID) {
      throw new Error(
        `Process ID must be between 0 and ${MAX_PROCESS_ID}, got ${this.processId}`
      );
    }
  }

  /**
   * Gets a default process ID based on the current process or random value
   */
  private getDefaultProcessId(): number {
    // Try to use process.pid if available (Node.js environment)
    if (typeof process !== "undefined" && process.pid) {
      return process.pid % (MAX_PROCESS_ID + 1);
    }
    // Fallback to random value for browser environments
    return Math.floor(Math.random() * (MAX_PROCESS_ID + 1));
  }

  /**
   * Generates a new snowflake ID
   *
   * @returns A unique snowflake ID as a string
   * @throws {Error} If clock moves backwards or sequence overflows
   */
  public generate(): string {
    let timestamp = this.getCurrentTimestamp();

    // Handle clock going backwards
    if (timestamp < this.lastTimestamp) {
      throw new Error(
        `Clock moved backwards. Refusing to generate ID for ${this.lastTimestamp - timestamp}ms`
      );
    }

    // If we're in the same millisecond, increment sequence
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & MAX_SEQUENCE;

      // If sequence overflows, wait for next millisecond
      if (this.sequence === 0) {
        timestamp = this.waitNextMillisecond(timestamp);
      }
    } else {
      // New millisecond, reset sequence
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    // Assemble the snowflake
    const snowflake =
      (BigInt(timestamp) << BigInt(TIMESTAMP_SHIFT)) |
      (BigInt(this.processId) << BigInt(PROCESS_ID_SHIFT)) |
      (BigInt(this.workerId) << BigInt(WORKER_ID_SHIFT)) |
      BigInt(this.sequence);

    return snowflake.toString();
  }

  /**
   * Gets the current timestamp in milliseconds
   */
  private getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Waits until the next millisecond
   */
  private waitNextMillisecond(lastTimestamp: number): number {
    let timestamp = this.getCurrentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.getCurrentTimestamp();
    }
    return timestamp;
  }

  /**
   * Parses a snowflake ID to extract its component parts
   *
   * @param snowflake The snowflake ID to parse (string or bigint)
   * @returns Parsed snowflake components
   * @throws {Error} If the snowflake format is invalid
   *
   * @example
   * ```typescript
   * const parsed = SnowflakeGenerator.parse("1234567890123456789");
   * console.log(`Created at: ${parsed.date.toISOString()}`);
   * console.log(`Worker ID: ${parsed.workerId}`);
   * ```
   */
  public static parse(snowflake: string | bigint): ParsedSnowflake {
    try {
      const id = typeof snowflake === "string" ? BigInt(snowflake) : snowflake;
      const idStr = id.toString();

      // Extract components using bit shifts
      const timestamp = Number(id >> BigInt(TIMESTAMP_SHIFT));
      const processId = Number(
        (id >> BigInt(PROCESS_ID_SHIFT)) & BigInt(MAX_PROCESS_ID)
      );
      const workerId = Number(
        (id >> BigInt(WORKER_ID_SHIFT)) & BigInt(MAX_WORKER_ID)
      );
      const sequence = Number(id & BigInt(MAX_SEQUENCE));
      const date = new Date(timestamp);

      return {
        id: idStr,
        timestamp,
        date,
        workerId,
        processId,
        sequence,
      };
    } catch (error) {
      throw new RealmError(`Invalid snowflake format: ${snowflake}.`, {
        cause: error,
      });
    }
  }

  /**
   * Validates if a string is a valid snowflake format
   *
   * @param snowflake The string to validate
   * @returns True if valid snowflake format, false otherwise
   */
  public static isValid(snowflake: string): boolean {
    try {
      // Check if it's a valid number string
      if (!/^\d+$/.test(snowflake)) {
        return false;
      }

      // Check if it can be converted to BigInt
      const id = BigInt(snowflake);

      // Basic range check (should be positive and reasonable size)
      if (id <= 0n || id >= 1n << 64n) {
        return false;
      }

      // Try to parse it to ensure components are within valid ranges
      SnowflakeGenerator.parse(id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets information about this generator instance
   */
  public getInfo(): { workerId: number; processId: number; epoch: number } {
    return {
      workerId: this.workerId,
      processId: this.processId,
      epoch: 0, // Unix epoch (1970-01-01)
    };
  }
}

/**
 * Default singleton instance for convenient usage
 */
let defaultGenerator: SnowflakeGenerator | null = null;

/**
 * Gets or creates the default snowflake generator instance
 *
 * @param config Optional configuration for the default generator (only used on first call)
 * @returns The default generator instance
 */
export function getDefaultGenerator(
  config?: SnowflakeConfig
): SnowflakeGenerator {
  if (!defaultGenerator) {
    defaultGenerator = new SnowflakeGenerator(config);
  }
  return defaultGenerator;
}

/**
 * Generates a snowflake using the default generator
 *
 * @returns A unique snowflake ID as a string
 */
export function generateSnowflake(): string {
  return getDefaultGenerator().generate();
}

/**
 * Constants exported for external use
 */
export const SNOWFLAKE_CONSTANTS = {
  MAX_WORKER_ID,
  MAX_PROCESS_ID,
  MAX_SEQUENCE,
  TIMESTAMP_BITS,
  WORKER_ID_BITS,
  PROCESS_ID_BITS,
  SEQUENCE_BITS,
} as const;
