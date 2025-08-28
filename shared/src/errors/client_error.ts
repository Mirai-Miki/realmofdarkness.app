import { RealmError } from "./realm_error";
import { HttpStatus } from "types";

/**
 * Client error class for user-facing errors that should not be logged.
 * These are errors that occur due to user input or client-side issues,
 * not problems with our application code.
 */
export class ClientError extends RealmError {
  /** HTTP status code for this error */
  public readonly statusCode: number;

  /**
   * Creates a new ClientError instance.
   *
   * @param message - The error message
   * @param options - Additional error options
   * @param options.statusCode - HTTP status code (default: 400)
   * @param options.errorCode - Error code for programmatic handling
   * @param options.fields - Additional key-value pairs to include in response
   */
  constructor(
    message: string,
    options: {
      code?: string;
      location?: string;
      log?: boolean;
      fields?: Record<string, string>;
      cause?: Error;
      statusCode?: number;
    } = {}
  ) {
    // Pass log option to parent constructor with default of false for ClientError
    super(message, {
      ...options,
      log: options.log ?? false,
    });

    this.name = "ClientError";
    this.statusCode = options.statusCode ?? HttpStatus.BAD_REQUEST;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClientError);
    }
  }

  /**
   * Converts the error to a JSON representation suitable for API responses.
   *
   * @returns A JSON representation of the error
   */
  override toJSON(): Record<string, unknown> {
    const json = super.toJSON();
    return {
      ...json,
      statusCode: this.statusCode,
    };
  }
}
