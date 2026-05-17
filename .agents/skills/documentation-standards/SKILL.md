---
name: documentation-standards
description: Use this skill when documenting code, writing JSDoc comments, or adding explanations to public interfaces and classes.
---

# Documentation Standards

This repository requires strict JSDoc comments for all public APIs.

## JSDoc Requirements

**Every** public function, class, and interface must have a complete JSDoc block.

### Required Format

A valid JSDoc block must include:
1. A brief description of what the function/class/interface does.
2. `@param` tags detailing every parameter.
3. An `@returns` tag detailing the return value (unless void).
4. An `@throws` tag detailing any expected errors (e.g., `RealmError`, `UserError`).
5. An `@example` tag demonstrating how to use the code.

### Example

```typescript
/**
 * Brief description of what this does.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws {ErrorType} When this error occurs
 *
 * @example
 * ```typescript
 * const result = myFunction(input);
 * ```
 */
```
