#!/bin/bash
# Full-stack development script for Realm of Darkness

# Navigate to project root
cd "$(dirname "$0")"

echo "=========================================================="
echo "=    ✨ Realm of Darkness Full-Stack Development ✨    ="
echo "=========================================================="
echo

echo "[1/2] 🐍 Starting Backend Development Environment..."
gnome-terminal --title="Backend Development" -- bash -c "cd backend/scripts && ./dev.sh; exec bash" &
echo "      ✅ Backend development environment starting..."

echo "[2/2] ⚛️  Starting Frontend Development Environment..."
gnome-terminal --title="Frontend Development" -- bash -c "cd frontend && ./dev.sh; exec bash" &
echo "      ✅ Frontend development environment starting..."

echo
echo "=========================================================="
echo "=  ✨ Full-Stack Development Environment Started! ✨   ="
echo "=========================================================="
echo
echo "🐍 Backend: Django + Redis (see Backend Development terminal)"
echo "⚛️  Frontend: React Dev Server (see Frontend Development terminal)"
echo
echo "🌐 Django Server: http://localhost:8080"
echo "⚛️  React Dev Server: http://localhost:3000"
echo
echo "Press Enter to exit..."
read
