/**
 * Custom error class for the Realm of Darkness application.
 * Extends the native Error class to include additional context and metadata
 * that can be used by our custom logger system.
 */
export class RealmError extends Error {
  /** Whether the error should be logged */
  public readonly log: boolean;

  /** The location where the error occurred (file, function, etc.) */
  public readonly location?: string;

  /** Additional fields to include in log messages */
  public readonly fields: Record<string, string>;

  /** Timestamp when the error was created */
  public readonly timestamp: Date;

  /** The original error that caused this RealmError (if any) */
  public override readonly cause?: Error;

  /**
   * Creates a new RealmError instance.
   *
   * @param message - The error message
   * @param options - Additional error options
   * @param options.level - The severity level of the error (default: 'error')
   * @param options.location - The location where the error occurred
   * @param options.fields - Additional key-value pairs to include in logs
   * @param options.cause - The original error that caused this RealmError
   */
  constructor(
    message: string,
    options: {
      location?: string;
      log?: boolean;
      fields?: Record<string, string>;
      cause?: Error | unknown;
    } = {}
  ) {
    super(message);

    this.name = "RealmError";
    this.log = options.log ?? true;
    this.location = options.location;
    this.fields = options.fields ?? {};
    this.timestamp = new Date();
    if (options.cause instanceof Error) {
      this.cause = options.cause;
    } else {
      this.cause = new Error(String(options.cause));
    }

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RealmError);
    }
  }

  /**
   * Converts the error to a JSON representation.
   *
   * @returns A JSON representation of the error
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      location: this.location,
      fields: this.fields,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause: this.cause
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : undefined,
    };
  }
}
