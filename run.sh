#!/bin/bash
# Unified deployment script for Realm of Darkness
# Combines all deployment functionality into one script
# Run as regular user with sudo privileges: ./run.sh [all|backend|frontend|bots]
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    echo -e "${1}${2}${NC}"
}

# Show help information
show_help() {
    echo "Realm of Darkness Unified Deployment Script"
    echo
    echo "Usage: ./run.sh [COMPONENT]"
    echo
    echo "COMPONENTS:"
    echo "  all         Deploy all components (frontend, backend, bots)"
    echo "  backend     Deploy only Django backend"
    echo "  frontend    Deploy only React frontend"
    echo "  bots        Deploy only Discord bots"
    echo
    echo "Examples:"
    echo "  ./run.sh all                    # Deploy everything"
    echo "  ./run.sh backend                # Deploy only backend"
    echo "  ./run.sh bots                   # Deploy only bots"
    echo "  ./run.sh frontend               # Deploy only frontend"
    echo
    echo "Environment detection:"
    echo "  - Production:     No .preproduction file exists"
    echo "  - Preproduction:  .preproduction file exists in project root"
    echo
    echo "Requirements:"
    echo "  - Must have sudo privileges (will prompt for password as needed)"
    echo "  - Users 'web' and 'bot' must exist"
    echo "  - .env files must exist for deployed components"
    echo "  - Systemd services must be configured"
}

# Check if user has sudo privileges
if ! sudo -n true 2>/dev/null; then
    print_color $RED "❌ This script requires sudo privileges!"
    echo "   Usage: ./run.sh [all|backend|frontend|bots]"
    echo "   Examples:"
    echo "     ./run.sh all                    # Deploy everything"
    echo "     ./run.sh backend                # Deploy only backend"
    echo "     ./run.sh bots                   # Deploy only bots"
    echo ""
    echo "   Note: You may be prompted for your sudo password during execution."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"
PROJECT_PATH=$(pwd)

# Parse command line arguments
COMPONENT="${1:-all}"

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Validate component argument
case $COMPONENT in
    all|backend|frontend|bots)
        ;;
    *)
        print_color $RED "❌ Invalid component: $COMPONENT"
        echo "   Valid components: all, backend, frontend, bots"
        exit 1
        ;;
esac

# Determine environment based on .preproduction file
if [ -f ".preproduction" ]; then
    ENVIRONMENT="preproduction"
else
    ENVIRONMENT="production"
fi

# Set environment-specific variables
if [ "$ENVIRONMENT" = "preproduction" ]; then
    GUNICORN_SERVICE="gunicorn-preprod"
    BOT_PREFIX="preprod-"
    ENV_EMOJI="🧪"
    ENV_NAME="PREPRODUCTION"
else
    GUNICORN_SERVICE="gunicorn"
    BOT_PREFIX=""
    ENV_EMOJI="🚀"
    ENV_NAME="PRODUCTION"
fi

# User configuration
WEB_USER="web"   # User for frontend and backend
BOT_USER="bot"   # User for Discord bots

print_color $CYAN "=========================================================="
print_color $CYAN "=  $ENV_EMOJI Realm of Darkness Unified Deployment $ENV_EMOJI   ="
print_color $CYAN "=========================================================="
echo
print_color $YELLOW "Environment: $ENV_NAME"
print_color $YELLOW "Component:   $(echo $COMPONENT | tr '[:lower:]' '[:upper:]')"
print_color $YELLOW "Project:     $PROJECT_PATH"
echo

# Function to run commands as specific user
run_as_user() {
    local user=$1
    shift
    local cmd="$@"

    if [ "$(whoami)" = "$user" ]; then
        eval "$cmd"
    else
        sudo -u "$user" bash -c "$cmd"
    fi
}

# Function to check pre-deployment requirements
check_requirements() {
    print_color $BLUE "[CHECK] 🔍 Checking deployment requirements..."

    # Check if required users exist
    if ! id "$WEB_USER" &>/dev/null; then
        print_color $RED "[CHECK] ❌ User '$WEB_USER' does not exist!"
        echo "        Create with: sudo useradd -m -s /bin/bash $WEB_USER"
        return 1
    fi

    if ! id "$BOT_USER" &>/dev/null; then
        print_color $RED "[CHECK] ❌ User '$BOT_USER' does not exist!"
        echo "        Create with: sudo useradd -m -s /bin/bash $BOT_USER"
        return 1
    fi

    # Check if .env files exist for components being deployed
    if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "backend" ]; then
        if [ ! -f "$PROJECT_PATH/backend/.env" ]; then
            print_color $RED "[CHECK] ❌ Backend .env file missing: $PROJECT_PATH/backend/.env"
            return 1
        fi
    fi

    if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "bots" ]; then
        if [ ! -f "$PROJECT_PATH/discord_bots/.env" ]; then
            print_color $RED "[CHECK] ❌ Discord bots .env file missing: $PROJECT_PATH/discord_bots/.env"
            return 1
        fi
    fi

    # Check if required services are available
    if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "backend" ]; then
        if ! sudo systemctl list-unit-files | grep -q "^$GUNICORN_SERVICE.service"; then
            print_color $RED "[CHECK] ❌ Gunicorn service '$GUNICORN_SERVICE' not found!"
            echo "        Check systemd service configuration."
            return 1
        fi
    fi

    print_color $GREEN "[CHECK] ✅ All requirements satisfied."
}

# Function to deploy backend
deploy_backend() {
    print_color $GREEN "[BACKEND] 🐍 Starting Django backend deployment..."

    print_color $BLUE "[BACKEND] [1/6] � Setting up Python virtual environment..."
    cd "$PROJECT_PATH/backend"

    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_color $YELLOW "[BACKEND]       → Creating virtual environment..."
        run_as_user "$WEB_USER" "cd '$PROJECT_PATH/backend' && python3.12 -m venv venv"
        if [ $? -ne 0 ]; then
            print_color $RED "[BACKEND]       ❌ Failed to create virtual environment!"
            return 1
        fi
        print_color $GREEN "[BACKEND]       ✅ Virtual environment created successfully."
    else
        print_color $GREEN "[BACKEND]       ✅ Using existing virtual environment."
    fi

    # Verify virtual environment
    VENV_PYTHON="venv/bin/python"
    if [ ! -f "$PROJECT_PATH/backend/$VENV_PYTHON" ]; then
        print_color $RED "[BACKEND]       ❌ Could not find Python in virtual environment!"
        return 1
    fi

    print_color $BLUE "[BACKEND] [2/6] 📥 Updating Python dependencies..."
    run_as_user "$WEB_USER" "cd '$PROJECT_PATH/backend' && $VENV_PYTHON -m pip install --upgrade pip"
    run_as_user "$WEB_USER" "cd '$PROJECT_PATH/backend' && $VENV_PYTHON -m pip install -r requirements.txt"
    print_color $GREEN "[BACKEND]       ✅ Dependencies updated successfully."

    print_color $BLUE "[BACKEND] [3/6] 🔄 Running Django migrations..."
    run_as_user "$WEB_USER" "cd '$PROJECT_PATH/backend' && $VENV_PYTHON manage.py migrate --no-input"
    print_color $GREEN "[BACKEND]       ✅ Migrations completed successfully."

    print_color $BLUE "[BACKEND] [4/6] 🧹 Cleaning up cache..."
    run_as_user "$WEB_USER" "cd '$PROJECT_PATH/backend' && find . -name '*.pyc' -delete && find . -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true"
    print_color $GREEN "[BACKEND]       ✅ Cache cleaned successfully."

    print_color $BLUE "[BACKEND] [5/6] 📋 Ensuring Redis is running..."
    if ! sudo systemctl is-active --quiet redis-server; then
        print_color $YELLOW "[BACKEND]       → Starting Redis..."
        sudo systemctl start redis-server
        sleep 2
    fi
    if sudo systemctl is-active --quiet redis-server; then
        print_color $GREEN "[BACKEND]       ✅ Redis is running."
    else
        print_color $RED "[BACKEND]       ❌ Redis failed to start!"
        return 1
    fi

    print_color $BLUE "[BACKEND] [6/6] 🔄 Reloading Gunicorn service..."
    sudo systemctl daemon-reload
    sudo systemctl enable "$GUNICORN_SERVICE"
    sudo systemctl restart "$GUNICORN_SERVICE"

    # Wait a moment and check if service started successfully
    sleep 3
    if sudo systemctl is-active --quiet "$GUNICORN_SERVICE"; then
        print_color $GREEN "[BACKEND]       ✅ Gunicorn service started successfully."
    else
        print_color $RED "[BACKEND]       ❌ Gunicorn service failed to start!"
        sudo systemctl status "$GUNICORN_SERVICE" --no-pager -l
        return 1
    fi

    print_color $GREEN "[BACKEND] 🎉 Django backend deployment completed!"
}

# Function to deploy frontend
deploy_frontend() {
    print_color $GREEN "[FRONTEND] ⚛️  Starting React frontend deployment..."

    print_color $BLUE "[FRONTEND] [1/2] 📦 Installing Node.js dependencies..."
    cd "$PROJECT_PATH/frontend"
    run_as_user "$WEB_USER" "cd '$PROJECT_PATH/frontend' && npm install --silent"
    print_color $GREEN "[FRONTEND]        ✅ Dependencies installed successfully."

    print_color $BLUE "[FRONTEND] [2/2] 🏗️ Building React application..."
    run_as_user "$WEB_USER" "cd '$PROJECT_PATH/frontend' && npm run build --silent"
    print_color $GREEN "[FRONTEND]        ✅ React build completed successfully."

    print_color $GREEN "[FRONTEND] 🎉 React frontend deployment completed!"
}

# Function to deploy Discord bots
deploy_bots() {
    print_color $GREEN "[BOTS] 🤖 Starting Discord bots deployment..."

    print_color $BLUE "[BOTS] [1/7] 📦 Updating Node.js dependencies..."
    cd "$PROJECT_PATH/discord_bots"
    run_as_user "$BOT_USER" "cd '$PROJECT_PATH/discord_bots' && npm install --silent"
    print_color $GREEN "[BOTS]    ✅ Dependencies updated successfully."

    print_color $BLUE "[BOTS] [2/7] 🏗️ Building TypeScript project..."
    if ! run_as_user "$BOT_USER" "cd '$PROJECT_PATH/discord_bots' && npm run build --silent"; then
        print_color $RED "[BOTS]    ❌ Build failed!"
        return 1
    fi
    print_color $GREEN "[BOTS]    ✅ Project built successfully."

    print_color $BLUE "[BOTS] [4/7] 🚀 Deploying Discord commands..."
    run_as_user "$BOT_USER" "cd '$PROJECT_PATH/discord_bots' && npm run deploy:commands:all --silent > /dev/null 2>&1"
    print_color $GREEN "[BOTS]    ✅ Discord commands deployed successfully."

    print_color $BLUE "[BOTS] [5/7] 😀 Syncing application emojis..."
    run_as_user "$BOT_USER" "cd '$PROJECT_PATH/discord_bots' && npm run emoji:sync:all"
    print_color $GREEN "[BOTS]    ✅ Application emojis synced successfully."

    print_color $BLUE "[BOTS] [6/7] 🔍 Managing PM2 processes..."

    # Ensure all files in dist/main are executable before starting PM2 processes
    if [ -d "$PROJECT_PATH/discord_bots/dist/main" ]; then
        run_as_user "$BOT_USER" "chmod +x $PROJECT_PATH/discord_bots/dist/main/*"
    fi

    # Deploy each bot
    for bot_type in "5th" "20th" "cod"; do
        local BOT_NAME="${BOT_PREFIX}${bot_type}"
        local SCRIPT_PATH=""
        local SCRIPT_ARGS="${bot_type}"

        # PM2 process parameters
        local PM2_PARAMS="--restart-delay 30000 --log /realm-of-darkness/logs/$BOT_NAME --time --max-memory-restart 1500M"

        case $bot_type in
            "5th")  SCRIPT_PATH="dist/main/shardLauncher.js" ;;
            "20th") SCRIPT_PATH="dist/main/shardLauncher.js" ;;
            "cod") SCRIPT_PATH="dist/main/shardLauncher.js" ;;
        esac

        # Always delete existing process to ensure fresh start with latest code
        print_color $YELLOW "[BOTS]       Stopping and deleting $BOT_NAME process..."
        run_as_user "$BOT_USER" "cd '$PROJECT_PATH/discord_bots' && pm2 delete '$BOT_NAME'" 2>/dev/null || true

        # Delete existing log file for fresh logs
        print_color $YELLOW "[BOTS]       Clearing log file for $BOT_NAME..."
        run_as_user "$BOT_USER" "rm -f /realm-of-darkness/logs/$BOT_NAME" 2>/dev/null || true

        # Small delay to ensure process is fully cleaned up
        sleep 1

        # Start fresh process
        print_color $YELLOW "[BOTS]       Starting fresh $BOT_NAME process..."
        run_as_user "$BOT_USER" "cd '$PROJECT_PATH/discord_bots' && pm2 start '$SCRIPT_PATH' --name '$BOT_NAME' $PM2_PARAMS -- $SCRIPT_ARGS"

        # Verify the process started successfully
        sleep 2
        if run_as_user "$BOT_USER" "cd '$PROJECT_PATH/discord_bots' && pm2 list | grep -E '\b$BOT_NAME\b' | grep -q online"; then
            print_color $GREEN "[BOTS]       ✅ $BOT_NAME started successfully"
        else
            print_color $RED "[BOTS]       ❌ $BOT_NAME failed to start"
        fi
    done

    print_color $GREEN "[BOTS]    ✅ PM2 processes managed successfully."

    print_color $BLUE "[BOTS] [6/6] 🔄 Saving PM2 process list..."
    run_as_user "$BOT_USER" "pm2 save"
    print_color $GREEN "[BOTS]    ✅ PM2 process list saved."

    print_color $GREEN "[BOTS] 🎉 Discord bots deployment completed!"
}

# Function to stop services before deployment
stop_services() {
    print_color $YELLOW "[STOP] 🛑 Stopping services for deployment..."

    # Stop Discord bots
    if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "bots" ]; then
        print_color $BLUE "[STOP] Stopping Discord bots..."
        if [ "$ENVIRONMENT" = "preproduction" ]; then
            run_as_user "$BOT_USER" "cd '$PROJECT_PATH/discord_bots' && pm2 delete preprod-v5 preprod-v20 preprod-cod" 2>/dev/null || true
            # Clear log files for fresh start
            run_as_user "$BOT_USER" "rm -f /realm-of-darkness/logs/preprod-v5.log /realm-of-darkness/logs/preprod-v20.log /realm-of-darkness/logs/preprod-cod.log" 2>/dev/null || true
        else
            run_as_user "$BOT_USER" "cd '$PROJECT_PATH/discord_bots' && pm2 delete v5 v20 cod" 2>/dev/null || true
            # Clear log files for fresh start
            run_as_user "$BOT_USER" "rm -f /realm-of-darkness/logs/v5.log /realm-of-darkness/logs/v20.log /realm-of-darkness/logs/cod.log" 2>/dev/null || true
        fi
        print_color $GREEN "[STOP]       ✅ Discord bots stopped."
    fi

    # Stop web services
    if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "backend" ]; then
        print_color $BLUE "[STOP] Stopping web services..."
        sudo systemctl stop "$GUNICORN_SERVICE" 2>/dev/null || print_color $YELLOW "[STOP]       → $GUNICORN_SERVICE was not running"
        print_color $GREEN "[STOP]       ✅ Web services stopped."
    fi
}

# Function to update code from git
update_code() {
    print_color $BLUE "[GIT] 📥 Checking git repository state..."
    cd "$PROJECT_PATH"

    # Check if we're in a detached HEAD state (e.g., checked out to a tag)
    if ! git symbolic-ref HEAD >/dev/null 2>&1; then
        print_color $YELLOW "[GIT]    ⚠️  Detached HEAD state detected (possibly a release tag)"
        print_color $YELLOW "[GIT]    → Skipping git pull, using current code state"
        local CURRENT_REF=$(git describe --always --tags 2>/dev/null || git rev-parse --short HEAD)
        print_color $CYAN "[GIT]    📍 Current ref: $CURRENT_REF"
    else
        # Normal branch - do git pull
        local CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
        print_color $CYAN "[GIT]    → On branch: $CURRENT_BRANCH"
        git pull
        print_color $GREEN "[GIT]    ✅ Code updated successfully."
    fi
}

# Main deployment logic
main() {
    # Check requirements before starting
    check_requirements

    # Always update code before deployment
    update_code

    # Stop relevant services
    stop_services

    # Deploy components based on selection
    local DEPLOYMENT_SUCCESS=true
    case $COMPONENT in
        "all")
            if ! deploy_frontend; then DEPLOYMENT_SUCCESS=false; fi
            if ! deploy_backend; then DEPLOYMENT_SUCCESS=false; fi
            if ! deploy_bots; then DEPLOYMENT_SUCCESS=false; fi
            ;;
        "frontend")
            if ! deploy_frontend; then DEPLOYMENT_SUCCESS=false; fi
            ;;
        "backend")
            if ! deploy_backend; then DEPLOYMENT_SUCCESS=false; fi
            ;;
        "bots")
            if ! deploy_bots; then DEPLOYMENT_SUCCESS=false; fi
            ;;
    esac

    # Check deployment result
    if [ "$DEPLOYMENT_SUCCESS" = false ]; then
        print_color $RED "❌ Deployment failed! Some components may be in an inconsistent state."
        print_color $YELLOW "💡 Check the error messages above and fix issues before re-running."
        exit 1
    fi

    # Final status
    echo
    print_color $CYAN "=========================================================="
    print_color $CYAN "=      ✅ Deployment completed successfully! ✅     ="
    print_color $CYAN "=========================================================="
    echo

    # Show service status
    print_color $BLUE "📊 Service Status Check:"

    if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "backend" ]; then
        if sudo systemctl is-active --quiet "$GUNICORN_SERVICE"; then
            print_color $GREEN "   ✅ $GUNICORN_SERVICE (Django backend)"
        else
            print_color $RED "   ❌ $GUNICORN_SERVICE (Django backend) - Not running!"
        fi
    fi

    if sudo systemctl is-active --quiet nginx; then
        print_color $GREEN "   ✅ nginx (Web server)"
    else
        print_color $RED "   ❌ nginx (Web server) - Not running!"
    fi

    if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "bots" ]; then
        # Check PM2 processes
        local PM2_STATUS=$(run_as_user "$BOT_USER" "pm2 jlist" 2>/dev/null || echo "[]")
        local RUNNING_BOTS=$(echo "$PM2_STATUS" | grep -o '"status":"online"' | wc -l)
        if [ "$RUNNING_BOTS" -gt 0 ]; then
            print_color $GREEN "   ✅ Discord bots ($RUNNING_BOTS processes running)"
        else
            print_color $RED "   ❌ Discord bots - No processes running!"
        fi
    fi

    echo

    # Environment-specific URLs
    if [ "$ENVIRONMENT" = "preproduction" ]; then
        print_color $YELLOW "🌐 Web Application: https://dev.realmofdarkness.app"
    else
        print_color $YELLOW "🌐 Web Application: https://realmofdarkness.app"
    fi

    print_color $YELLOW "🐍 Python Backend:  ./backend/ (virtual env: backend/venv)"
    print_color $YELLOW "⚛️  React Frontend:  ./frontend/"
    print_color $YELLOW "🤖 Discord Bots:    ./discord_bots/"
    echo
    print_color $CYAN "🔎 Monitor Discord bots: pm2 status"
    print_color $CYAN "📋 View bot logs:        pm2 logs [${BOT_PREFIX}5th|${BOT_PREFIX}20th|${BOT_PREFIX}cod]"
    print_color $CYAN "🔧 Check backend logs:   sudo systemctl status $GUNICORN_SERVICE"
    print_color $CYAN "🌐 Check nginx status:   sudo systemctl status nginx"
    echo
}

# Run main function
main
