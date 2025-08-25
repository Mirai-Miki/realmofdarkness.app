#!/bin/bash
# filepath: /f:/programming/Django/realm-of-darkness-site/scripts/setup.sh

# Enable better error handling
set -e

# Navigate to project root directory
cd "$(dirname "$0")"
cd ..

echo "===== Realm of Darkness Configuration Setup ====="
echo
echo "This script will create a .env file with your configuration settings."
echo

# Check if .env already exists
if [ -f .env ]; then
    echo "An existing .env file was found."
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "Setup canceled. Existing .env file was kept."
        exit 0
    fi
fi

echo "Creating .env file..."
cat > .env << EOL
# Realm of Darkness Environment Configuration
# Created on $(date)

EOL

echo "=== Environment Type ==="
echo "Select environment type:"
echo "1. Development (SQLite, Dev mode)"
echo "2. Production (MariaDB, Production mode)"
read -p "Enter choice (1/2, default: 1): " env_type

if [ "$env_type" = "2" ]; then
    echo "# Production Environment" >> .env
    echo "ENV=production" >> .env
    
    echo "=== Database Configuration ==="
    echo "DB_ENGINE=mysql" >> .env
    
    read -p "Database name (default: realm_of_darkness): " db_name
    if [ -z "$db_name" ]; then
        db_name="realm_of_darkness"
    fi
    echo "DB_NAME=$db_name" >> .env
    
    read -p "Database user: " db_user
    echo "DB_USER=$db_user" >> .env
    
    read -p "Database password: " db_password
    echo "DB_PASSWORD=$db_password" >> .env
    
    read -p "Database host (default: localhost): " db_host
    if [ -z "$db_host" ]; then
        db_host="localhost"
    fi
    echo "DB_HOST=$db_host" >> .env
    
    read -p "Database port (default: 3306): " db_port
    if [ -z "$db_port" ]; then
        db_port="3306"
    fi
    echo "DB_PORT=$db_port" >> .env
else
    echo "# Development Environment" >> .env
    echo "ENV=development" >> .env
    echo "DB_ENGINE=sqlite3" >> .env
    echo "DB_NAME=db.sqlite3" >> .env
fi
echo "" >> .env

echo "=== Django Settings ==="
read -p "Enter Django SECRET_KEY (leave blank for auto-generated): " secret_key
if [ -z "$secret_key" ]; then
    secret_key="django-insecure-dev-environment-key-change-in-production"
    echo "Using default development key"
fi
echo "SECRET_KEY=$secret_key" >> .env

read -p "Enter API_KEY (leave blank for auto-generated): " api_key
if [ -z "$api_key" ]; then
    api_key="dev-api-key-for-testing"
    echo "Using default development key"
fi
echo "API_KEY=$api_key" >> .env
echo "" >> .env

echo "=== Discord Integration ==="
read -p "Enter Discord App ID: " discord_app_id
echo "DISCORD_APP_ID=$discord_app_id" >> .env

read -p "Enter Discord App Secret: " discord_secret
echo "DISCORD_APP_SECRET=$discord_secret" >> .env

read -p "Enter Discord Bot Token (optional): " discord_bot_token
echo "DISCORD_BOT_TOKEN=$discord_bot_token" >> .env

read -p "Enter Discord Debug Channel ID (optional): " discord_debug
echo "DISCORD_DEBUG_CHANNEL=$discord_debug" >> .env
echo "" >> .env

echo "=== Patreon Integration ==="
read -p "Enter Patreon Webhook Secret (optional): " patreon_secret
echo "PATREON_WEBHOOK_SECRET=$patreon_secret" >> .env

echo
echo "Configuration complete! Environment settings saved to .env"
echo
echo "Run 'scripts/run.sh' to start the application."
echo "Run 'scripts/dev.sh' to start in development mode."

# Pause at the end (Unix equivalent of Windows pause)
read -p "Press Enter to continue..."