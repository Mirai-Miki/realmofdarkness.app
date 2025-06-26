@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0
cd..

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

REM Use WSL with daemon mode and redirect output to nul to prevent window from showing
wsl -e redis-server --daemonize yes > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo      [X] Failed to start Redis server.
    pause
    exit /b 1
)
echo      [+] Redis server started successfully.

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
