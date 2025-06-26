# Realm of Darkness

![Project Banner](https://res.cloudinary.com/dze64d7cr/image/upload/v1701410603/Logo/banner_bg_index.webp)

Welcome to the Realm of Darkness monorepo! This is a comprehensive platform designed for World of Darkness tabletop roleplaying enthusiasts, providing web-based character sheets, Discord bot integration, and real-time collaboration tools for storytellers and players.

The Realm of Darkness combines a modern web application with Discord bots to create an integrated experience for managing characters, chronicles, and gameplay across multiple World of Darkness game systems including Vampire: The Masquerade V5, V20 edition, and Chronicles of Darkness.

## ✨ Features

- **🌐 Web Application**: Modern React frontend with Django REST API backend
- **🤖 Discord Integration**: Suite of Discord bots for dice rolling and character management
- **📊 Character Sheets**: Full character sheet support for multiple World of Darkness systems
- **⚡ Real-time Collaboration**: Live character sheet updates via WebSockets
- **🎲 Dice Rolling**: Game-specific dice mechanics with Discord slash commands
- **🏰 Chronicle Management**: Organize characters into shared storytelling environments
- **🔐 Discord OAuth**: Seamless login and server synchronization
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🏗️ Project Structure

This monorepo contains three main components:

```
realm-of-darkness/
├── backend/           # Django REST API backend
│   ├── rod/          # Core Django project settings
│   ├── api/          # RESTful API endpoints
│   ├── haven/        # Character sheet models and logic
│   ├── chronicle/    # Chronicle/campaign management
│   ├── discordauth/  # Discord OAuth integration
│   ├── gateway/      # WebSocket services
│   └── scripts/      # Development and deployment scripts
├── frontend/         # React SPA frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── routes/      # Page routing
│   │   └── gateway/     # WebSocket client
│   └── public/
├── discord_bots/     # Discord bot suite
│   ├── src/
│   │   ├── commands/    # Slash commands
│   │   ├── events/      # Discord event handlers
│   │   └── modules/     # Dice rolling and utilities
│   └── scripts/
└── dev.bat/.sh       # Full-stack development scripts
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+** for the Django backend
- **Node.js 18+** and npm for frontend and Discord bots
- **Redis** for WebSocket and caching (WSL required for Windows)
- **Git** for version control

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mirai-Miki/realm-of-darkness-site.git
   cd realm-of-darkness-site
   ```

2. **Run the setup script** (creates .env files and installs dependencies)

   ```bash
   # Windows
   backend\scripts\setup.bat

   # Linux/macOS
   chmod +x backend/scripts/*.sh
   backend/scripts/setup.sh
   ```

3. **Start the full development environment**

   ```bash
   # Windows
   dev.bat

   # Linux/macOS
   ./dev.sh
   ```

This will start:

- **Backend API**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **Redis server**: Running in background
- **Database migrations**: Applied automatically

### Individual Component Development

You can also run components separately:

```bash
# Backend only
cd backend/scripts && ./dev.bat

# Frontend only
cd frontend && ./dev.bat

# Discord bots only
cd discord_bots && npm run dev
```

## 🎯 Usage

### For Players

1. Visit https://realmofdarkness.app (or http://localhost:3000 in development)
2. Login with your Discord account
3. Create character sheets for your campaigns
4. Join Discord servers with the bots installed
5. Use slash commands to roll dice and manage characters

### For Storytellers

1. Set up chronicles on the website
2. Invite the Discord bots to your server
3. Manage player characters and track campaign progress
4. Use real-time features for collaborative storytelling

### For Developers

1. Each component has its own README with detailed development information
2. Use the monorepo dev scripts for full-stack development
3. See individual component READMEs for specific development guidelines

## 🔧 Technology Stack

### Backend

- **Django 5.2** - Web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support
- **Redis** - Caching and WebSocket backend
- **SQLite/MySQL** - Database (SQLite for dev, MySQL for production)

### Frontend

- **React 19** - UI framework
- **Material-UI** - Component library
- **React Router** - Client-side routing
- **WebSocket** - Real-time updates

### Discord Bots

- **Discord.js 14** - Discord API wrapper
- **Node.js** - JavaScript runtime
- **TypeScript** - Type safety (transitioning)

## 📝 Environment Configuration

Key environment variables needed:

| Variable             | Description                   | Required |
| -------------------- | ----------------------------- | -------- |
| `DEBUG`              | Development mode              | Yes      |
| `SECRET_KEY`         | Django security key           | Yes      |
| `API_KEY`            | Bot-to-backend authentication | Yes      |
| `DISCORD_APP_ID`     | Discord OAuth app ID          | Yes      |
| `DISCORD_APP_SECRET` | Discord OAuth secret          | Yes      |
| `DISCORD_BOT_TOKEN`  | Discord bot token             | For bots |
| `REDIS_DB_INDEX`     | Redis database index          | No       |

The setup scripts will help you configure these values.

## 🤝 Contributing

We welcome contributions to improve the Realm of Darkness platform! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Submit a pull request with a clear description

### Branch Naming Conventions

- `feature/description` - New functionality
- `bugfix/issue-description` - Bug fixes
- `refactor/component-name` - Code improvements
- `docs/description` - Documentation updates

## 🔍 Troubleshooting

### Common Issues

**Backend won't start**

- Check Python version (requires 3.12)
- Ensure Redis is running
- Verify .env file exists in backend/

**Frontend build errors**

- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Discord bots not responding**

- Verify bot tokens are correct
- Check API_KEY matches between backend and bots
- Ensure backend server is running and accessible

### Getting Help

- Check component-specific READMEs for detailed troubleshooting
- Join our Discord community for support
- Report bugs via GitHub issues

## 🔄 Connect

- **🌐 Website**: [Realm of Darkness](https://realmofdarkness.app)
- **💬 Discord**: [Join our community](https://discord.com/invite/p82yc8sKx2)
- **🐛 Issues**: [Report bugs](https://github.com/Mirai-Miki/realmofdarkness.app/issues)

## 📄 License

This project is licensed under the AGPL License. See the [LICENSE](LICENSE) file for details.

---

Made with ❤️ for the World of Darkness community
