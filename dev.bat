@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0

echo ==========================================================
echo =      Realm of Darkness Full-Stack Development        =
echo ==========================================================
echo.

echo [1/2] Starting Backend Development Environment...
call backend\scripts\dev.bat
echo      [+] Backend development environment finished.

echo [2/2] Starting Frontend Development Environment...
echo.
call frontend\dev.bat
echo      [+] Frontend development environment finished.
echo.

echo ==========================================================
echo =    Full-Stack Development Environment Finished       =
echo ==========================================================
echo.
echo Backend: Django + Redis
echo Frontend: React Dev Server
echo.
echo Django Server: http://localhost:8080
echo React Dev Server: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
