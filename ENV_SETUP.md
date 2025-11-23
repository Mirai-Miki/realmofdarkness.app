# Environment Variables Setup

This monorepo uses a **hierarchical environment variable system** where root-level variables are automatically shared across all packages via Turbo.

## 📁 File Structure

```
realm-of-darkness/
├── .env                          # Root environment (shared across all packages)
├── .env.example                  # Root template
├── apps/
│   ├── api/
│   │   ├── .env                  # API-specific overrides (optional)
│   │   └── .env.example          # API template
│   ├── bot/
│   │   ├── .env                  # Bot-specific variables
│   │   └── .env.example          # Bot template
│   └── frontend/
│       ├── .env                  # Frontend-specific variables
│       └── .env.example          # Frontend template
└── packages/
    └── database/
        ├── .env                  # Usually not needed (inherits from root)
        └── .env.example          # Database template
```

## 🔄 How It Works

### 1. **Root `.env` File** (Shared Variables)

The root `.env` file contains variables that are **automatically available** to all packages:

- `NODE_ENV` - Environment mode (development/production/preprod)
- `DATABASE_URL` - PostgreSQL connection string
- `ENABLE_CONSOLE_LOGGING` - Logger console output
- `ENABLE_DISCORD_LOGGING` - Logger Discord integration
- `LOGGER_TOKEN` - Discord bot token for logging
- `LOGGER_CHANNEL_ID` - Discord channel for logs
- `LOG_FILE_PATH` - Custom log file location

These are configured in `turbo.json` under `globalEnv` and automatically passed to all tasks.

### 2. **Package-Specific `.env` Files** (Overrides & Additions)

Each package can have its own `.env` file for:

- **Package-specific variables** (e.g., Discord bot tokens, API keys)
- **Overriding root variables** (if needed for testing)

**Priority:** Package `.env` > Root `.env`

## 🚀 Quick Setup

### First Time Setup

```bash
# 1. Copy all example files to create your .env files
cp .env.example .env
cp apps/bot/.env.example apps/bot/.env
cp apps/api/.env.example apps/api/.env
cp apps/frontend/.env.example apps/frontend/.env

# 2. Edit the root .env file with your shared configuration
# Set NODE_ENV, DATABASE_URL, and logging preferences

# 3. Edit package-specific .env files
# Add Discord tokens, API keys, etc.
```

### Changing Environment (dev → preprod → prod)

**You only need to change `NODE_ENV` in ONE place:**

```bash
# Edit root .env file
NODE_ENV=production  # or development, preprod
```

All packages will automatically use this value! 🎉

## 📝 Environment-Specific Configurations

### Development

```bash
# Root .env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/realm_of_darkness_dev
ENABLE_CONSOLE_LOGGING=true
```

### Pre-Production

```bash
# Root .env
NODE_ENV=preprod
DATABASE_URL=postgresql://user:pass@preprod-db:5432/realm_of_darkness
ENABLE_CONSOLE_LOGGING=true
ENABLE_DISCORD_LOGGING=true
```

### Production

```bash
# Root .env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/realm_of_darkness
ENABLE_CONSOLE_LOGGING=false
ENABLE_DISCORD_LOGGING=true
LOGGER_TOKEN=your_production_bot_token
LOGGER_CHANNEL_ID=your_production_channel_id
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Always commit `.env.example` files** - They serve as templates
3. **Use different values per environment** - Don't reuse production credentials in dev
4. **Rotate secrets regularly** - Especially API keys and bot tokens
5. **Use environment-specific databases** - Never point dev to production DB

## 🛠️ Troubleshooting

### Variables Not Loading?

1. **Check Turbo configuration** - Ensure variable is listed in `turbo.json` under `globalEnv` or task-specific `env`
2. **Restart dev server** - Changes to `.env` require a restart
3. **Check variable name** - Must match exactly (case-sensitive)
4. **Verify file location** - Root `.env` should be at project root

### Package Needs Different Value?

Create a package-specific `.env` file to override the root value:

```bash
# apps/api/.env
NODE_ENV=development  # Overrides root NODE_ENV for API only
```

### Adding New Shared Variables

1. Add to root `.env.example`
2. Add to `turbo.json` under `globalEnv`
3. Add to relevant task `env` arrays in `turbo.json`
4. Document in this README

## 📚 Reference

### Turbo Environment Variables

- [Turbo Docs: Environment Variables](https://turbo.build/repo/docs/core-concepts/monorepos/environment-variables)

### Current Global Variables (from `turbo.json`)

```json
{
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL",
    "ENABLE_CONSOLE_LOGGING",
    "ENABLE_DISCORD_LOGGING",
    "LOGGER_TOKEN",
    "LOGGER_CHANNEL_ID",
    "LOG_FILE_PATH"
  ]
}
```

## ✅ Checklist for New Developers

- [ ] Copy all `.env.example` files to `.env`
- [ ] Set `NODE_ENV=development` in root `.env`
- [ ] Configure `DATABASE_URL` in root `.env`
- [ ] Add Discord bot tokens to `apps/bot/.env`
- [ ] Set API key in `apps/api/.env` (must match bot's API_KEY)
- [ ] Test with `pnpm dev`
- [ ] Verify environment variables are loading correctly

---

**Need help?** Check the [QUICKSTART.md](./QUICKSTART.md) or ask in Discord!
