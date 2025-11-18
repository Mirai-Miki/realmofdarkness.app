@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0

echo ==========================================================
echo =      Realm of Darkness Frontend Development          =
echo ==========================================================
echo.

echo [1/3] Checking frontend dependencies...
call npm install --silent
if %ERRORLEVEL% neq 0 (
    echo      [X] Failed to install frontend dependencies!
    pause
    exit /b 1
)
echo      [+] Frontend dependencies updated successfully.

echo [2/3] Formatting frontend code with Prettier...
call npm run format > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo      [!] Warning: Prettier formatting had issues!
    echo      * Continuing anyway...
) else (
    echo      [+] Frontend code formatting complete.
)

echo [3/3] Starting React development server in new terminal...
start "React Dev Server" cmd /k "cd /d %~dp0 && npm start"
echo      [+] React development server started in new terminal window.

echo.
echo React Dev Server: http://localhost:3000
echo.
echo ==========================================================
echo =    Frontend development server ready!                 =
echo ==========================================================
echo.
exit /b 0