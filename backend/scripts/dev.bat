@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0
cd..

REM Check if .env file exists and has required keys
if not exist ".env" goto run_setup

REM Check for essential keys in .env file
findstr /C:"ENV=" .env >nul 2>&1
if %ERRORLEVEL% neq 0 goto run_setup

findstr /C:"DB_ENGINE=" .env >nul 2>&1
if %ERRORLEVEL% neq 0 goto run_setup

findstr /C:"DB_NAME=" .env >nul 2>&1
if %ERRORLEVEL% neq 0 goto run_setup

findstr /C:"SECRET_KEY=" .env >nul 2>&1
if %ERRORLEVEL% neq 0 goto run_setup

findstr /C:"API_KEY=" .env >nul 2>&1
if %ERRORLEVEL% neq 0 goto run_setup

findstr /C:"DISCORD_APP_ID=" .env >nul 2>&1
if %ERRORLEVEL% neq 0 goto run_setup

findstr /C:"DISCORD_APP_SECRET=" .env >nul 2>&1
if %ERRORLEVEL% neq 0 goto run_setup

goto start_dev

:run_setup
echo ==========================================================
echo =       Environment Setup Required                      =
echo ==========================================================
echo.
echo The .env configuration file is missing or incomplete.
echo Running setup script first...
echo.

if exist "scripts\setup.bat" (
    call "scripts\setup.bat"
    if !ERRORLEVEL! neq 0 (
        echo Setup failed. Cannot continue.
        pause
        exit /b 1
    )
) else (
    echo Setup script not found at scripts\setup.bat
    pause
    exit /b 1
)

echo.
echo Setup complete! Starting development environment...
echo.

:start_dev
echo ==========================================================
echo =      Realm of Darkness Backend Development            =
echo ==========================================================
echo.

echo [1/6] Setting up Python virtual environment...
REM Check if virtual environment exists
if not exist "venv\Scripts\python.exe" (
    echo      * Creating virtual environment...
    py -m venv venv
    if !ERRORLEVEL! neq 0 (
        echo      [X] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo      [+] Virtual environment created successfully.
) else (
    echo      [+] Using existing virtual environment.
)

REM Set path to Python in virtual environment
set VENV_PYTHON=venv\Scripts\python.exe
echo      [+] Virtual environment ready.

echo [2/6] Checking Python dependencies...
"%VENV_PYTHON%" -m pip install -r requirements-dev.txt --quiet
if %ERRORLEVEL% neq 0 (
    echo      [X] Failed to install Python dependencies!
    pause
    exit /b 1
)
echo      [+] Python dependencies updated successfully.

echo [3/6] Formatting Python code with Black...
"%VENV_PYTHON%" -m black . > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo      [!] Warning: Black formatting had issues!
    echo      * Continuing anyway...
) else (
    echo      [+] Python code formatting complete.
)

echo [4/6] Applying database migrations...
"%VENV_PYTHON%" manage.py migrate > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo      [X] Warning: Database migration had issues!
    pause
    exit /b 1
) else (
    echo      [+] Database schema up to date.
)

echo [5/6] Starting Redis in WSL...
where wsl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo      [X] WSL not found! Redis cannot be started.
    echo      [X] Please install WSL to run Redis, or install Redis directly.
    pause
    exit /b 1
)

REM Check if Redis is already running
wsl pgrep redis-server >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo      [+] Redis server is already running.
) else (
    REM Start Redis in a new window using PowerShell
    start "Redis Server" powershell -NoExit -Command "wsl redis-server"
    echo      [+] Redis server started in new window.
    REM Give Redis a moment to start
    timeout /t 2 /nobreak >nul
)

echo [6/6] Starting Django server...
start "Django Server" cmd /k "%VENV_PYTHON%" manage.py runserver 8080
echo      [+] Django server started successfully.

echo.
echo * Python: Using virtual environment in .\venv
echo * Redis Server: Running in background (daemon mode)
echo * Django Server: http://localhost:8080
echo.
echo ==========================================================
echo =    Backend development environment started!           =
echo ==========================================================
