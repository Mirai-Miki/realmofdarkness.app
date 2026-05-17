---
name: file-naming
description: Use this skill when creating new files, deciding on filenames, or evaluating edition-specific naming conventions across the repository.
---

# File Naming Conventions

This repository strictly enforces the `{name}.{suffix}.ts` file naming pattern and specific conventions for naming edition-specific files.

## 1. Suffix Conventions

Use the following exact suffixes when creating files:

| Type          | Suffix            | Example                  |
| ------------- | ----------------- | ------------------------ |
| Entity        | `.entity.ts`      | `user.entity.ts`         |
| Service       | `.service.ts`     | `user.service.ts`        |
| Action        | `.action.ts`      | `sync-profile.action.ts` |
| Repository    | `.repository.ts`  | `user.repository.ts`     |
| Mapper        | `.mapper.ts`      | `user.mapper.ts`         |
| DTO/Contracts | `.definitions.ts` | `user.definitions.ts`    |
| Value Object  | `.vo.ts`          | `dice-pool.vo.ts`        |
| Utility       | `.util.ts`        | `http.util.ts`           |
| Enum          | `.enum.ts`        | `splat.enum.ts`          |
| Constants     | `.constants.ts`   | `experience.constants.ts`|
| Types         | `.types.ts`       | `character.types.ts`     |
| Controller    | `.controller.ts`  | `user.controller.ts`     |
| Module        | `.module.ts`      | `user.module.ts`         |
| Gateway       | `.gateway.ts`     | `events.gateway.ts`      |
| Interceptor   | `.interceptor.ts` | `logging.interceptor.ts` |
| Middleware    | `.middleware.ts`  | `auth.middleware.ts`     |
| Pipe          | `.pipe.ts`        | `validation.pipe.ts`     |
| Decorator     | `.decorator.ts`   | `roles.decorator.ts`     |
| Filter        | `.filter.ts`      | `exception.filter.ts`    |
| Guard         | `.guard.ts`       | `auth.guard.ts`          |
| Handler       | `.handler.ts`     | `interaction.handler.ts` |
| Event         | `.event.ts`       | `user-created.event.ts`  |
| Factory       | `.factory.ts`     | `user.factory.ts`        |
| Port          | `.port.ts`        | `cache.port.ts`          |

## 2. Edition Naming Convention

When naming files or classes that relate to specific game editions:

- **Standalone/at start**: Use `wod20`, `wod5`, `cod` (e.g., `wod20-roll.action.ts`, class `Wod20RollAction`).
- **Game-specific**: Use `v5`, `v20`, `h5`, `w20` (e.g., `Vampire5thData`).
- **Edition in middle/end**: Use `20th`, `5th`, `cod` (e.g., class `Vampire20th`, `Hunter5th`, **not** `VampireWod20`).
