# Realm of Darkness App

![Project Banner](https://res.cloudinary.com/dze64d7cr/image/upload/v1701410603/Logo/banner_bg_index.webp)

Welcome to the https://github.com/Mirai-Miki/realmofdarkness.app codebase! This repository contains the source code for a web application built with Django framework and React frontend.

The Realm of Darkness is a platform designed for World of Darkness tabletop roleplaying enthusiasts, providing a space to create and manage character sheets, chronicles, and more within the World of Darkness setting.

With this application, users can easily create and update character sheets, track their progress in various chronicles, and interact with other players in a collaborative environment.

## ✨ Features

- **Discord Integration**: Seamless login and server synchronization
- **Character Sheets**: Create and manage World of Darkness character sheets
- **Chronicles**: Organize characters into shared storytelling environments
- **Real-time Updates**: Live notifications and character sheet changes
- **Responsive Design**: Works on both desktop and mobile devices

## 🚀 Installation and Setup

### Prerequisites

- Python 3.12
- Node.js and npm
- Redis (WSL required for Windows users)
- MariaDB/MySQL (for production environments only)

### First-time Setup

We provide automated setup scripts to create your environment configuration:

#### Windows Setup

1. Navigate to the scripts directory: `cd scripts`
2. Run the setup script: `setup.bat`
3. Follow the prompts to configure your environment

#### Linux/macOS Setup

1. Navigate to the scripts directory: `cd scripts`
2. Make scripts executable: `chmod +x *.sh`
3. Run the setup script: `./setup.sh`
4. Follow the prompts to configure your environment

This will create a .env file with your configuration settings. The setup process will ask for:

- Environment type (development or production)
- Database configuration (for production)
- Django security keys
- Discord integration settings
- Patreon integration settings (optional)

### Running the Application

After initial setup, use these scripts to start the application:

#### Development Environment (with hot reloading)

- Windows: `cd scripts` then run `dev.bat`
- Linux/macOS: `cd scripts` then run `./dev.sh`

This will:

- Install/update all Python and npm dependencies
- Apply database migrations
- Start Redis server
- Start Django development server on http://localhost:8080
- Start React development server on http://localhost:3000

#### Production Environment

- Linux only: `cd scripts` then run `./run.sh`

This will:

- Pull latest code from Git
- Install/update all dependencies
- Build the frontend
- Apply database migrations
- Ensure Redis is running
- Restart Gunicorn and reload services

## 🔧 Project Structure

### Core Components

- rod - Core Django project settings, configuration, and URL routing
- main - Main application views, templates, and site-wide functionality
- manage.py - Django command-line utility for administrative tasks

### Authentication & Integration

- discordauth - Discord OAuth2 authentication and server integration
- patreon - Patreon integration for premium features and webhooks

### Game Content & Logic

- haven - Character sheet models, views, and game mechanics
- chronicle - Chronicle/campaign management and Discord server connections
- constants - Game constants, configuration, and reference data
- bot - Discord bot functionality and command handling

### API & Frontend

- api - RESTful API endpoints for frontend communication
- gateway - WebSocket-based real-time communication services
- frontend - React-based single page application (SPA) with component structure
- media - User-uploaded content and static media files

### Utilities & Deployment

- scripts - Setup, deployment, and maintenance automation scripts
- .env - Environment variable configuration (not tracked in git)

## 🤝 Contributing

We welcome contributions to improve realmofdarkness.app! Here's how you can help:

1. Fork the repository
2. Create a branch following our naming conventions:
   - `feature/description` - New functionality or enhancements
   - `bugfix/issue-description` - Bug fixes
   - `refactor/component-name` - Code improvements
   - `docs/description` - Documentation updates
   - `test/description` - Test additions
   - `chore/description` - Maintenance tasks
3. Commit your changes with clear messages
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## 🐛 Known Issues

- On sheet update from another user the nickname changes to your own and clicking on the sheet will bring up a nickname error and fail to load
- Updated sheets with a chronicle change will not automatically be added to another person's home page even if they should be able to see it
- A character sheet is not setting the chronicle to None when a member leaves a server
- Pressing enter when creating a new sheet should work as well
- Being in a sheet when the character is deleted should redirect the user back home
- Leaving a server does not automatically update a sheet; you need to refresh the page

## 🗺️ Roadmap

- Put a timer on returning Archived/Dead character to Active
- Implement Draft/Active/Dead/Retired features more thoroughly
- Server pages: Settings, Exp Management, Server stats (clan stats etc.)
- Make Character profiles Public (Add settings to allow what is shown)

## 🔍 Troubleshooting

### Redis Connection Issues

- Windows: Ensure WSL is properly installed and running
- Linux: Check that the Redis service is active with `systemctl status redis-server`

### Frontend Build Failures

- Clear npm cache: `npm cache clean --force`
- Remove node_modules: `rm -rf node_modules/`
- Reinstall dependencies: `npm install`

## ⚙️ Environment Variables

Key environment variables used by the application:

| Variable               | Description                                                        | Required |
| ---------------------- | ------------------------------------------------------------------ | -------- |
| DEBUG                  | Development mode when True                                         | Yes      |
| SECRET_KEY             | Django security key                                                | Yes      |
| API_KEY                | Internal API authentication - must match API key in bot repository | Yes      |
| DISCORD_APP_ID         | Discord OAuth application ID                                       | Yes      |
| DISCORD_APP_SECRET     | Discord OAuth secret                                               | Yes      |
| DISCORD_BOT_TOKEN      | Bot integration token                                              | No       |
| PATREON_WEBHOOK_SECRET | Patreon integration                                                | No       |

**Note:** The API_KEY value must match the API key configured in the companion Discord bot repository for proper integration. See the [Realm of Darkness Bot Repository](https://github.com/Mirai-Miki/Realm-of-Darkness-Bot) for more information.

## 🔄 Connect

- **Website**: [Realm of Darkness](https://realmofdarkness.app)
- **Discord**: [Join our community](https://discord.com/invite/p82yc8sKx2)
- **Issues**: [Report bugs](https://github.com/Mirai-Miki/realm-of-darkness-site/issues)
- **Bot Repository**: [Discord Bot Companion](https://github.com/Mirai-Miki/Realm-of-Darkness-Bot)

## 📄 License

This project is licensed under the AGPL License. See the LICENSE file for details.

---

Made with ❤️ for the World of Darkness community
