#!/bin/bash
# Discord bot production deployment script for Realm of Darkness
# Exit on regular errors
set -e

# Navigate to discord_bots directory
cd "$(dirname "$0")"
cd ..

# Set production environment 
export NODE_ENV=production

echo "=========================================================="
echo "=      🤖 Realm of Darkness Bot Deployment 🤖           ="
echo "=========================================================="
echo

# Identify current user
CURRENT_USER=$(whoami)
PROJECT_PATH=$(pwd)
BOT_USER="bot"  # The user that owns the files
LOG_DIR="/home/bot/logs" # Log directory

# Function to run commands as bot user
run_as_bot() {
    if [ "$CURRENT_USER" = "$BOT_USER" ]; then
        # Already the bot user
        eval "$@"
    else
        # Run as bot user
        sudo -u "$BOT_USER" bash -c "$@"
    fi
}

# Ensure log directory exists
run_as_bot "mkdir -p $LOG_DIR"

echo "[1/6] 📦 Updating Node.js dependencies..."
run_as_bot "cd $PROJECT_PATH && npm install"
echo "      ✅ Dependencies updated successfully."

echo "[2/6] 🚀 Deploying Discord commands..."
run_as_bot "cd $PROJECT_PATH && npm run deploy:all"
echo "      ✅ Discord commands deployed successfully."

echo "[3/6] 🏗️ Building project..."
run_as_bot "cd $PROJECT_PATH && npm run build" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "      ❌ Build failed!"
    exit 1
fi
echo "      ✅ Project built successfully."

echo "[4/6] 🧹 Flushing PM2 logs..."
run_as_bot "cd $PROJECT_PATH && pm2 flush v5 && pm2 flush v20 && pm2 flush cod"
echo "      ✅ PM2 logs flushed."

echo "[5/6] 🔍 Checking PM2 processes..."
# PM2 process parameters
PM2_PARAMS="--restart-delay 30000 --time --max-memory-restart 1500M"

# v5 bot process
if run_as_bot "cd $PROJECT_PATH && pm2 id v5" > /dev/null 2>&1; then
    echo "      Restarting v5 process..."
    run_as_bot "cd $PROJECT_PATH && pm2 restart v5"
else
    echo "      Creating v5 process..."
    run_as_bot "cd $PROJECT_PATH && pm2 start dist/shards/index-5th.js $PM2_PARAMS --log $LOG_DIR/v5.log --name v5" 
fi

# v20 bot process
if run_as_bot "cd $PROJECT_PATH && pm2 id v20" > /dev/null 2>&1; then
    echo "      Restarting v20 process..."
    run_as_bot "cd $PROJECT_PATH && pm2 restart v20"
else
    echo "      Creating v20 process..."
    run_as_bot "cd $PROJECT_PATH && pm2 start dist/shards/index-20th.js $PM2_PARAMS --log $LOG_DIR/v20.log --name v20"
fi

# cod bot process
if run_as_bot "cd $PROJECT_PATH && pm2 id cod" > /dev/null 2>&1; then
    echo "      Restarting cod process..."
    run_as_bot "cd $PROJECT_PATH && pm2 restart cod"
else
    echo "      Creating cod process..."
    run_as_bot "cd $PROJECT_PATH && pm2 start dist/shards/index-cod.js $PM2_PARAMS --log $LOG_DIR/cod.log --name cod"
fi

echo "[6/6] 🔄 Saving PM2 process list..."
run_as_bot "pm2 save"
echo "      ✅ PM2 process list saved."

echo
echo "=========================================================="
echo "=       🤖 Bot deployment completed successfully! 🤖     ="
echo "=========================================================="
echo