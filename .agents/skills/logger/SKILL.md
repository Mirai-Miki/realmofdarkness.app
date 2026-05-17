---
name: logger
description: Instructs the agent on how to correctly use the centralized `@realm/logger` system. Use this skill whenever you need to add, modify, or review logging statements (e.g., logger.info, logger.exception), configure `LogOptions` metadata fields, determine proper severity levels, or handle error logging at execution boundaries.
---

## 1. Method Signatures & Options

- **Log Methods**:
  - `logger.debug(message: string, options?: LogOptions)`
  - `logger.info(message: string, options?: LogOptions)`
  - `logger.warn(message: string, options?: LogOptions)`
  - `logger.error(message: string, options?: LogOptions)`
  - `logger.fatal(message: string, options?: LogOptions)`
  - `logger.exception(message: string, error: unknown, additionalOptions?: Omit<LogOptions, "error">)`
- **LogOptions Object**: When logging, utilize the `options` argument to provide structured operational context.
  - `fields`: Key-value (`Record<string, string>`) metadata maps supporting structured tracking logs.
  - `error`: An optional error object (used internally or by standard log methods).
  - `sendToDiscord`: Boolean to override the default Discord logging behavior.
  - `logToConsole`: Boolean to override the default console logging behavior.

## 2. Exception Execution Rules

- **Errors with an Error Class**: Use `logger.exception(message, error, options)` exclusively when logging an instantiated `Error` object. Note that the `message` comes **first**, followed by the `error` object. Do not call `.error()` for exceptions, as `.exception()` extracts the error stack trace and automatically extracts `fields` if it's a `RealmError`.
- **Downgraded Logging**: If the error passed to `.exception()` is a `RealmError` (or `UserError`) with its internal `log` property set to `false`, the logger will automatically downgrade the output level to `Debug`. This safely preserves the trace in development while keeping the production console clean.
- **Handling Boundaries**: Never call `logger.error()`, `logger.exception()`, or `logger.fatal()` at the precise location where an error is thrown or instantiated. Only execute error-level logs at the absolute lowest catch boundaries where the thread is intercepted and absorbed.
- **Trace Logs**: If telemetry tracking is required alongside a `throw` statement higher up the stack, utilize `logger.debug()` with `options.fields`.
