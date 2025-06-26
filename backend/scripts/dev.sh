#!/bin/bash
# filepath: f:\programming\Django\realm-of-darkness-site\scripts\dev.sh

# Development environment script for Realm of Darkness
# Navigate to project root
cd "$(dirname "$0")"
cd ..

echo "=========================================================="
echo "=    ✨ Realm of Darkness Development Environment ✨    ="
echo "=========================================================="
echo

echo "[1/9] 🔧 Setting up Python virtual environment..."
# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "      → Creating virtual environment..."
    python3.12 -m venv venv
    if [ $? -ne 0 ]; then
        echo "      ❌ Failed to create virtual environment!"
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo "      ✅ Virtual environment created successfully."
else
    echo "      ✅ Using existing virtual environment."
fi

# Get Python executable in virtual environment
VENV_PYTHON="venv/bin/python"
if [ ! -f "$VENV_PYTHON" ]; then
    echo "      ❌ Could not find Python in virtual environment!"
    read -p "Press Enter to exit..."
    exit 1
fi
echo "      ✅ Virtual environment ready."

echo "[2/9] 📦 Checking Python dependencies..."
$VENV_PYTHON -m pip install -r requirements-dev.txt --quiet
if [ $? -ne 0 ]; then
    echo "      ❌ Failed to install Python dependencies!"
    read -p "Press Enter to exit..."
    exit 1
fi
echo "      ✅ Python dependencies updated successfully."

echo "[3/9] 🎨 Formatting Python code with Black..."
$VENV_PYTHON -m black .
if [ $? -ne 0 ]; then
    echo "      ⚠️  Warning: Black formatting had issues!"
    echo "      → Continuing anyway..."
else
    echo "      ✅ Python code formatting complete."
fi

echo "[4/6] 🗃️  Applying database migrations..."
$VENV_PYTHON manage.py migrate --verbosity 0
if [ $? -ne 0 ]; then
    echo "      ❌ Warning: Database migration had issues!"
    read -p "Press Enter to exit..."
    exit 1
else
    echo "      ✅ Database schema up to date."
fi

echo "[5/6] 📋 Starting Redis..."
# Check for different ways to start Redis based on platform
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    if command -v brew &> /dev/null && brew services list | grep -q redis; then
        brew services start redis
    else
        echo "      ❌ Redis not found via Homebrew. Please install Redis."
        read -p "Press Enter to exit..."
        exit 1
    fi
elif command -v systemctl &> /dev/null && systemctl list-unit-files | grep -q redis; then
    # Linux with systemd
    if ! systemctl is-active --quiet redis-server; then
        sudo systemctl start redis-server
    fi
else
    # Direct start attempt
    if command -v redis-server &> /dev/null; then
        redis-server --daemonize yes &> /dev/null
    else
        echo "      ❌ Redis not found! Please install Redis."
        read -p "Press Enter to exit..."
        exit 1
    fi
fi
echo "      ✅ Redis server started successfully."

echo "[6/6] 🚀 Starting Django server..."
# Start Django server
if [ -n "$TERM_CMD" ]; then
    $TERM_CMD $VENV_PYTHON manage.py runserver 8080 &
else
    # Fall back to background process
    $VENV_PYTHON manage.py runserver 8080 > django_server.log 2>&1 &
    DJANGO_PID=$!
fi
echo "      ✅ Django server started successfully."

echo
echo "=========================================================="
echo "=  ✨ Backend Development Environment Started! ✨      ="
echo "=========================================================="
echo
echo "🐍 Python: Using virtual environment in ./venv"
echo "📋 Redis Server: Running in background (daemon mode)"
echo "🌐 Django Server: http://localhost:8080"
echo

# If we're running background processes, save their PIDs to a file for later cleanup
if [ -n "$DJANGO_PID" ]; then
    echo "$DJANGO_PID" > .dev_pids
fi