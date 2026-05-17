---
name: writing-skills
description: Use this skill when you need to write, create, or update other skills for the agent. It explains the folder structure, frontmatter format, and best practices for writing high-quality agent instructions.
---

# Writing Skills

When the user asks you to write, create, or update a skill, follow these guidelines based on the official Google Antigravity documentation.

## What is a Skill?

A skill is a reusable package of knowledge that extends the capabilities of the agent. A skill consists of:

- **Instructions:** Detailed guidelines on how to approach specific tasks.
- **Best Practices:** Conventions and patterns the agent should follow.
- **Resources:** Optional scripts, helper files, or template files the agent can use.

## Where Skills Live

Skills are structured as folders in one of the following directories:

- **Workspace-Specific Skills:** `<workspace-root>/.agents/skills/<skill-folder>/`
- **Global Skills (all workspaces):** `~/.gemini/antigravity/skills/<skill-folder>/`

## Folder Structure

A skill folder can contain:

```
.agents/skills/my-skill/
├─── SKILL.md       # Main instructions (Required)
├─── scripts/       # Helper scripts (Optional)
├─── examples/      # Reference implementations (Optional)
└─── resources/     # Templates and other assets (Optional)
```

## Writing the `SKILL.md` File

Every skill must have a `SKILL.md` file featuring a YAML frontmatter at the top:

```yaml
---
name: my-skill
description: Clear, 3rd-person description of what the skill does and when the agent should use it.
---

# My Skill

Detailed instructions for the agent go here.

## When to use this skill
- Use this when...

## How to use it
Step-by-step guidance, conventions, and patterns the agent should follow.
```

### Frontmatter Fields:

- **`name`** (Optional): A unique lowercase identifier with hyphens for spaces (defaults to the folder name if not provided).
- **`description`** (Required): A clear description of the skill. The agent uses this description during the **discovery** phase to decide whether to activate the skill. Write it in the third person and include keywords the agent will recognize (e.g., _"Reviews code changes for bugs, style issues, and best practices."_).

## Best Practices

- **Keep skills focused:** Keep each skill limited to one specific, well-defined task rather than creating a "do-everything" skill.
- **Write descriptive frontmatter:** Make descriptions highly specific so the agent knows exactly when to load the skill.
- **Scripts as black boxes:** If a skill includes helper scripts, direct the agent to run them with `--help` instead of reading the source code, saving context tokens.
- **Include decision trees:** For complex skills, provide logic branches/conditions to guide the agent's decision-making.
- **Research before writing:** When writing a skill about a specific pattern or module within the repository, explicitly instruct the agent to look up how that thing actually works in the codebase first. Never rely on assumptions or general knowledge for internal tools.
