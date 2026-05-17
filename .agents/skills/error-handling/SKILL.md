---
name: error-handling
description: Instructs the agent on how to correctly build and manage exceptions using `RealmError` and `UserError`. Use this skill whenever you need to throw errors, configure error constructor options, define new error properties, or handle bubble-up error propagation across application handler boundaries.
---

# Error Handling

## 1. Custom Exception Hierarchy & Constructor Options

- **RealmError** _(extends Error)_: Base class for domain-driven system exceptions and structural validation failures.
- **UserError** _(extends RealmError)_: Used for predictable, user-instigated exceptions (e.g., missing preconditions, input anomalies, command cooldowns).
- **Constructor Signatures**:
  - `new RealmError(message: string, options?: { log?: boolean; fields?: Record<string, string>; cause?: unknown })`
  - `new UserError(message: string, options?: { log?: boolean; fields?: Record<string, string>; cause?: unknown; statusCode?: number })`
- **Error Options Object**: Do not force downstream code to evaluate whether an exception should trigger system logs. Configure these rules directly within the error initialization payload using:
  - `statusCode`: (Only for `UserError`) Maps context-appropriate status values (e.g., `HttpStatus` enumerations, defaults to `HttpStatus.BAD_REQUEST`).
  - `log`: Boolean flag indicating if the error should be logged. It defaults to `true` on `RealmError` and `false` on `UserError`.
  - `fields`: A key-value record to include additional metadata in log messages or API responses.
  - `cause`: The original error that caused this exception.

## 2. Bubble-Up Propagation Strategy

- **No Defensive Wrapping**: Do not intercept external or native exceptions simply to wrap them inside a generic `RealmError`. Allow native exceptions to bubble up without chaining micro try/catch blocks down the functional pipeline.
- **Centralized Handler Action**: Let all errors fall directly to the lowest centralized entry points (the master interaction router in `apps/bot` or global filter interceptors in `apps/api`).
- **Centralized Processing Execution**: Entry boundaries should unconditionally pass all intercepted exceptions directly to `logger.exception(error)`. The centralized logger automatically evaluates the built-in `log` property on `RealmError` and `UserError` instances, silently suppressing alerts for those where `log: false`. After logging, extract the error message to notify the user and safely halt execution.
