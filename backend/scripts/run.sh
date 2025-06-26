#!/bin/bash
# filepath: f:\programming\Django\realm-of-darkness-site\scripts\run.sh

# Production deployment script for Realm of Darkness
# Exit on regular errors
set -e

# Navigate to project root
cd "$(dirname "$0")"
cd ..

echo "=========================================================="
echo "=     🚀 Realm of Darkness Production Deployment 🚀     ="
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

# Application update steps (run as web user)
if [ "$1" != "--services-only" ]; then
    echo "[1/7] 📥 Updating from git repository..."
    run_as_web "cd $PROJECT_PATH && git pull"
    echo "      ✅ Code updated successfully."
    
    echo "[2/7] 🔧 Setting up Python virtual environment..."
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "      → Creating virtual environment..."
        run_as_web "cd $PROJECT_PATH && python3.12 -m venv venv"
        if [ $? -ne 0 ]; then
            echo "      ❌ Failed to create virtual environment!"
            exit 1
        fi
        echo "      ✅ Virtual environment created successfully."
    else
        echo "      ✅ Using existing virtual environment."
    fi
    
    VENV_PYTHON="venv/bin/python"
    if [ ! -f "$VENV_PYTHON" ]; then
        echo "      ❌ Could not find Python in virtual environment!"
        exit 1
    fi
    echo "      ✅ Virtual environment ready."
    
    echo "[3/7] 📦 Updating Python dependencies..."
    run_as_web "cd $PROJECT_PATH && $VENV_PYTHON -m pip install -r requirements.txt"
    echo "      ✅ Python dependencies updated successfully."
    
    echo "[4/7] 🏗️  Building frontend..."
    run_as_web "cd $PROJECT_PATH/frontend && npm install && npm run build"
    echo "      ✅ Frontend built successfully."
    
    echo "[5/7] 🗃️  Applying database migrations..."
    run_as_web "cd $PROJECT_PATH && $VENV_PYTHON manage.py migrate --no-input"
    echo "      ✅ Database schema up to date."
    
    # Create a touch file to indicate update is complete
    run_as_web "cd $PROJECT_PATH && touch .update_complete"
fi

# Service restart steps (need sudo)
echo "[6/7] 📋 Ensuring Redis is running..."
if ! systemctl is-active --quiet redis-server; then
    echo "      → Starting Redis..."
    if [ "$CURRENT_USER" != "root" ] && id -nG "$CURRENT_USER" | grep -qw "sudo"; then
        sudo systemctl start redis-server
    else
        echo "      ❌ Cannot start Redis - need sudo privileges!"
        echo "      → Please ask your system administrator to start Redis."
    fi
else
    echo "      ✅ Redis is already running."
fi

echo "[7/7] 🔄 Updating and restarting web services..."
if [ "$CURRENT_USER" != "root" ] && id -nG "$CURRENT_USER" | grep -qw "sudo"; then
    sudo systemctl daemon-reload
    sudo systemctl restart gunicorn
    echo "      ✅ Web services restarted successfully."
else
    echo "      ⚠️  Cannot restart services - sudo required."
    echo "      → Please ask your administrator to run: sudo systemctl restart gunicorn"
    # Create a touch file to signal that restart is needed
    run_as_web "cd $PROJECT_PATH && touch .restart_needed"
fi

echo
echo "=========================================================="
echo "=      ✅ Deployment completed successfully! ✅         ="
echo "=========================================================="
echo
echo "🌐 Application is running at: https://realmofdarkness.app"
echo "🐍 Using Python virtual environment: ./venv"
echo