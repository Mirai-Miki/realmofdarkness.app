@echo off
setlocal EnableDelayedExpansion

:: Setup environment
cd /d %~dp0
cd..

echo ===== Realm of Darkness Configuration Setup =====
echo.
echo This script will create a .env file with your configuration settings.
echo.

rem Check if .env already exists
if exist .env (
    echo An existing .env file was found.
    set /p "overwrite=Do you want to overwrite it? (y/n) "
    if /i not "!overwrite!"=="y" (
        echo Setup canceled. Existing .env file was kept.
        goto end
    )
)

echo Creating .env file...
echo # Realm of Darkness Environment Configuration > .env
echo # Created on %date% >> .env
echo. >> .env

echo === Environment Type ===
echo Select environment type:
echo 1. Development (SQLite, Debug mode)
echo 2. Production (MariaDB, Production mode)
set /p "env_type=Enter choice (1/2, default: 1) "

if "!env_type!"=="2" (
    echo # Production Environment >> .env
    echo DEBUG=False >> .env
    
    echo === Database Configuration ===
    echo DB_ENGINE=mysql >> .env
    set /p "db_name=Database name (default: realm_of_darkness)"
    if "!db_name!"=="" set "db_name=realm_of_darkness"
    echo DB_NAME=!db_name! >> .env
    set /p "db_user=Database user "
    echo DB_USER=!db_user! >> .env
    set /p "db_password=Database password "
    echo DB_PASSWORD=!db_password! >> .env
    set /p "db_host=Database host (default: localhost) "
    if "!db_host!"=="" set "db_host=localhost"
    echo DB_HOST=!db_host! >> .env
    set /p "db_port=Database port (default: 3306) "
    if "!db_port!"=="" set "db_port=3306"
    echo DB_PORT=!db_port! >> .env
) else (
    echo # Development Environment >> .env
    echo DEBUG=True >> .env
    echo DB_ENGINE=sqlite3 >> .env
    echo DB_NAME=db.sqlite3 >> .env
)
echo. >> .env

echo === Django Settings ===
set /p "secret_key=Enter Django SECRET_KEY (leave blank for auto-generated) "
if "!secret_key!"=="" (
    set "secret_key=django-insecure-dev-environment-key-change-in-production"
    echo Using default development key
)
echo SECRET_KEY=!secret_key! >> .env

set /p "api_key=Enter API_KEY (leave blank for auto-generated) "
if "!api_key!"=="" (
    set "api_key=dev-api-key-for-testing"
    echo Using default development key
)
echo API_KEY=!api_key! >> .env

echo. >> .env

echo === Discord Integration ===
set /p "discord_app_id=Enter Discord App ID "
echo DISCORD_APP_ID=!discord_app_id! >> .env

set /p "discord_secret=Enter Discord App Secret "
echo DISCORD_APP_SECRET=!discord_secret! >> .env

set /p "discord_bot_token=Enter Discord Bot Token (optional) "
echo DISCORD_BOT_TOKEN=!discord_bot_token! >> .env

set /p "discord_debug=Enter Discord Debug Channel ID (optional) "
echo DISCORD_DEBUG_CHANNEL=!discord_debug! >> .env
echo. >> .env

echo === Patreon Integration ===
set /p "patreon_secret=Enter Patreon Webhook Secret (optional) "
echo PATREON_WEBHOOK_SECRET=!patreon_secret! >> .env

echo.
echo Configuration complete! Environment settings saved to .env
echo.
echo Run 'scripts\run.bat' to start the application.
echo Run 'scripts\dev.bat' to start in development mode.

:end
endlocal
pause