---
name: zod-validation
description: Use this skill when writing Zod schemas, defining TypeScript interfaces from Zod, and particularly when creating Enums with Zod validation.
---

# Zod Validation & Enums

This repository strictly uses a schema-first design with Zod. Define the Zod schema first, then infer the TypeScript type using `z.infer`.

## 1. The Strict Enum Pattern

**CRITICAL RULE**: You must NEVER use TypeScript `enum` keywords. You must NEVER use `z.nativeEnum()`. You must NEVER pass an array to `z.enum()`.

Instead, you must use the following pattern explicitly. This specific approach guarantees compatibility across various older and newer versions of Zod that might be running in different parts of the toolchain or that AI agents might attempt to use.

### Correct Pattern:

1. Define a standard `const` object using `as const`.
2. Pass that object DIRECTLY into `z.enum()`.
3. Infer the type from the schema.

### Why?

The repository uses **Zod 4+** which is compatible with this pattern.

## 2. Naming Conventions

- All Zod schemas must be suffixed with `Schema` (e.g., `UserDataSchema`).
- All inferred types must use the `Data` suffix for core DTOs, or match the exact name for Enums (e.g., `UserData`, `SupporterLevel`).

## 3. Example Implementation

For a full reference implementation of this exact pattern, read the example file located at:
`./examples/zod-enum-pattern.ts`
