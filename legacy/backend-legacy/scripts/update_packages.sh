#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"
cd ..

# Check if virtual environment exists
if [ ! -f "venv/bin/python" ]; then
    echo "[X] Virtual environment not found!"
    echo "    Please run dev.sh first to set up the environment."
    read -p "Press Enter to exit..."
    exit 1
fi

# Call the Python update script
venv/bin/python scripts/update_packages.py
if [ $? -ne 0 ]; then
    echo "[X] Package update failed!"
    read -p "Press Enter to exit..."
    exit 1
fi

read -p "Press Enter to exit..."
exit 0