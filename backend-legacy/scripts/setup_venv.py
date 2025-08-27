#!/usr/bin/env python3
"""
Script to set up and verify the Python virtual environment
"""
import subprocess
import sys
import os
from pathlib import Path


def main():
    # Get base directory (repository root)
    base_dir = Path(__file__).resolve().parent.parent
    venv_dir = base_dir / "venv"

    # Check if virtual environment exists
    if not (venv_dir / "Scripts").exists() and not (venv_dir / "bin").exists():
        print(f"Creating virtual environment in {venv_dir}...")
        try:
            subprocess.check_call([sys.executable, "-m", "venv", str(venv_dir)])
        except subprocess.CalledProcessError:
            print("[X] Failed to create virtual environment!")
            return 1
        print("✓ Virtual environment created successfully.")
    else:
        print("✓ Virtual environment already exists.")

    # Return path to the virtual environment's Python executable
    if os.name == "nt":  # Windows
        return str(venv_dir / "Scripts" / "python")
    else:  # Unix-like
        return str(venv_dir / "bin" / "python")


if __name__ == "__main__":
    venv_python = main()
    if isinstance(venv_python, str):
        print(f"VENV_PYTHON={venv_python}")
    else:
        sys.exit(venv_python)
