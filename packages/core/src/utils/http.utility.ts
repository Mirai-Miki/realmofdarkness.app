import { HttpStatus } from "@realm/common";

/**
 * Check if a status code is informational (1xx)
 * @param code - The HTTP status code to check
 * @returns True if the code is in the 1xx range
 */
export function isInformational(code: number): boolean {
  return code >= 100 && code < 200;
}

/**
 * Check if a status code indicates success (2xx)
 * @param code - The HTTP status code to check
 * @returns True if the code is in the 2xx range
 */
export function isSuccess(code: number): boolean {
  return code >= 200 && code < 300;
}

/**
 * Check if a status code indicates redirection (3xx)
 * @param code - The HTTP status code to check
 * @returns True if the code is in the 3xx range
 */
export function isRedirection(code: number): boolean {
  return code >= 300 && code < 400;
}

/**
 * Check if a status code indicates a client error (4xx)
 * @param code - The HTTP status code to check
 * @returns True if the code is in the 4xx range
 */
export function isUserError(code: number): boolean {
  return code >= 400 && code < 500;
}

/**
 * Check if a status code indicates a server error (5xx)
 * @param code - The HTTP status code to check
 * @returns True if the code is in the 5xx range
 */
export function isServerError(code: number): boolean {
  return code >= 500 && code < 600;
}

/**
 * Get a human-readable description of the status code
 * @param code - The HTTP status code
 * @returns A string description of the status code
 */
export function getHttpStatusDescription(code: HttpStatus): string {
  switch (code) {
    case HttpStatus.OK:
      return "OK";
    case HttpStatus.CREATED:
      return "Created";
    case HttpStatus.NO_CONTENT:
      return "No Content";
    case HttpStatus.BAD_REQUEST:
      return "Bad Request";
    case HttpStatus.UNAUTHORIZED:
      return "Unauthorized";
    case HttpStatus.FORBIDDEN:
      return "Forbidden";
    case HttpStatus.NOT_FOUND:
      return "Not Found";
    case HttpStatus.METHOD_NOT_ALLOWED:
      return "Method Not Allowed";
    case HttpStatus.CONFLICT:
      return "Conflict";
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return "Unprocessable Entity";
    case HttpStatus.TOO_MANY_REQUESTS:
      return "Too Many Requests";
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return "Internal Server Error";
    case HttpStatus.NOT_IMPLEMENTED:
      return "Not Implemented";
    case HttpStatus.BAD_GATEWAY:
      return "Bad Gateway";
    case HttpStatus.SERVICE_UNAVAILABLE:
      return "Service Unavailable";
    case HttpStatus.GATEWAY_TIMEOUT:
      return "Gateway Timeout";
    default:
      return "Unknown Status Code";
  }
}
