@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0
cd..

REM Check if virtual environment exists
if not exist "venv\Scripts\python.exe" (
    echo [X] Virtual environment not found!
    echo     Please run dev.bat first to set up the environment.
    pause
    exit /b 1
)

REM Call the Python update script
venv\Scripts\python.exe scripts\update_packages.py
if %ERRORLEVEL% neq 0 (
    echo [X] Package update failed!
    pause
    exit /b 1
)

exit /b 0