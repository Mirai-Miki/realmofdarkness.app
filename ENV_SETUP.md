# Environment Variables Setup

This monorepo uses a **single root `.env` file** for all environment configuration.

## 📁 File Structure

```
realm-of-darkness/
├── .env                          # ALL environment variables (single source of truth)
└── .env.example                  # Template for all variables
```

## 🔄 How It Works

### Single Root `.env` File

All environment variables live in the **root `.env` file**. Each app/package loads this file at startup:

```typescript
// At the top of each app's entry point
import { config } from "dotenv";
import { resolve } from "path";

// Load root .env
config({ path: resolve(__dirname, "../../../.env") });
```

### Variables in Root `.env`

- `NODE_ENV` - Environment mode (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `ENABLE_CONSOLE_LOGGING` - Logger console output
- `ENABLE_DISCORD_LOGGING` - Logger Discord integration
- `LOGGER_TOKEN` - Discord bot token for logging
- `LOGGER_CHANNEL_ID` - Discord channel for logs
- `LOG_FILE_PATH` - Custom log file location
- `CLIENT_ID_*` - Discord bot client IDs
- `TOKEN_*` - Discord bot tokens
- `DEV_SERVER_ID` - Development Discord server
- `ERROR_CHANNEL_ID` - Error logging channel
- `API_PORT` - API server port
- `API_KEY` - API authentication key

### Turborepo Cache Invalidation

The `turbo.json` `globalEnv` array tells Turbo which environment variables to watch for cache invalidation. When these change, Turbo rebuilds affected packages.

## 🚀 Quick Setup

### First Time Setup

```bash
# 1. Copy example file to create your .env
cp .env.example .env

# 2. Edit .env with your configuration
# Set DATABASE_URL, Discord tokens, API keys, etc.
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

- [ ] Copy `.env.example` to `.env`
- [ ] Set `NODE_ENV=development` in root `.env`
- [ ] Configure `DATABASE_URL` in root `.env`
- [ ] Add Discord bot client IDs (`CLIENT_ID_*`)
- [ ] Add Discord bot tokens (`TOKEN_*`)
- [ ] Set `DEV_SERVER_ID` to your test Discord server
- [ ] Set `API_KEY` (must match between API and bot)
- [ ] Test with `pnpm dev`
- [ ] Verify environment variables are loading correctly

---

**Need help?** Check the [QUICKSTART.md](./QUICKSTART.md) or ask in Discord!
