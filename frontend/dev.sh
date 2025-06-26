#!/bin/bash
# Frontend development script for Realm of Darkness

# Navigate to frontend directory
cd "$(dirname "$0")"

echo "=========================================================="
echo "=      Realm of Darkness Frontend Development          ="
echo "=========================================================="
echo

echo "[1/3] 📦 Checking frontend dependencies..."
npm install --silent
if [ $? -ne 0 ]; then
    echo "      ❌ Failed to install frontend dependencies!"
    read -p "Press Enter to exit..."
    exit 1
fi
echo "      ✅ Frontend dependencies updated successfully."

echo "[2/3] 🎨 Formatting frontend code with Prettier..."
npm run format &> /dev/null
if [ $? -ne 0 ]; then
    echo "      ⚠️  Warning: Prettier formatting had issues!"
    echo "      → Continuing anyway..."
else
    echo "      ✅ Frontend code formatting complete."
fi

echo "[3/3] ⚛️  Starting React development server..."
echo "      ✅ React development server starting..."
echo
echo "=========================================================="
echo "=    Frontend development server ready!                ="
echo "=========================================================="
echo
echo "⚛️  React Dev Server: http://localhost:3000"
echo

npm start
