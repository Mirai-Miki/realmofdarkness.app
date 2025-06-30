#!/bin/bash
# Frontend production deployment script for Realm of Darkness

# Navigate to frontend directory
cd "$(dirname "$0")"

echo "=========================================================="
echo "=     ⚛️ Realm of Darkness Frontend Production ⚛️       ="
echo "=========================================================="
echo

# Identify current user
CURRENT_USER=$(whoami)
PROJECT_PATH=$(pwd)
WEB_USER="web"  # The user that owns the files

# Function to run commands as web user
run_as_web() {
    if [ "$CURRENT_USER" = "$WEB_USER" ]; then
        # Already the web user
        eval "$@"
    else
        # Run as web user
        sudo -u "$WEB_USER" bash -c "$@"
    fi
}

echo "[1/2] 📦 Installing/updating frontend dependencies..."
run_as_web "cd $PROJECT_PATH && npm install"
echo "      ✅ Frontend dependencies updated successfully."

echo "[2/2] 🏗️  Building frontend for production..."
run_as_web "cd $PROJECT_PATH && npm run build"
if [ $? -ne 0 ]; then
    echo "      ❌ Frontend build failed!"
    exit 1
fi
echo "      ✅ Frontend built successfully."

echo
echo "=========================================================="
echo "=      ⚛️ Frontend deployment completed! ⚛️             ="
echo "=========================================================="
echo