#!/usr/bin/env python3
"""
Package update utility for the Realm of Darkness project.
This script checks for outdated packages and selectively updates them.
"""
import json
import re
import subprocess
import sys
import os
from pathlib import Path


def main():
    """Main function to check and update packages."""
    print("===== Realm of Darkness Package Manager =====\n")

    # Find project root (parent directory of the scripts directory)
    project_root = Path(__file__).resolve().parent.parent
    os.chdir(project_root)

    # Determine the path to Python executable in virtual environment
    if sys.platform == "win32":
        venv_python = project_root / "venv" / "Scripts" / "python.exe"
    else:
        venv_python = project_root / "venv" / "bin" / "python"

    if not venv_python.exists():
        print("[X] Virtual environment not found!")
        print("    Please run dev script first to set up the environment.")
        return 1

    print("[1/3] Checking for outdated packages...\n")

    # Get list of outdated packages
    try:
        result = subprocess.run(
            [str(venv_python), "-m", "pip", "list", "--outdated", "--format=json"],
            capture_output=True,
            text=True,
            check=True,
        )
        outdated = json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"[X] Error checking for outdated packages: {e}")
        return 1
    except json.JSONDecodeError:
        print("[X] Could not parse pip output")
        return 1

    # Display outdated packages
    if not outdated:
        print("All packages are up to date!")
        return 0

    print("Outdated packages:")
    for pkg in outdated:
        print(f" - {pkg['name']} {pkg['version']} -> {pkg['latest_version']}")
    print()

    print("[2/3] Selecting packages to update...\n")

    # Enhanced selection interface
    print("How would you like to proceed?")
    print("  [1] Update all packages")
    print("  [2] Select packages individually")
    print("  [3] Skip all updates")

    while True:
        selection = input("\nEnter your choice (1-3): ")
        if selection in ("1", "2", "3"):
            break
        print("Please enter 1, 2, or 3.")

    # Process selection
    to_update = []
    if selection == "1":  # Update all
        print("\nAll packages will be updated.")
        to_update = [pkg["name"] for pkg in outdated]
    elif selection == "3":  # Skip all
        print("\nNo packages will be updated.")
    else:  # Select individually
        print("\nSelect packages to update:")
        for package in outdated:
            name = package["name"]
            current = package["version"]
            latest = package["latest_version"]

            while True:
                choice = input(
                    f"  Update {name} from {current} to {latest}? (y/n): "
                ).lower()
                if choice in ("y", "n"):
                    break
                print("  Please enter 'y' or 'n'.")

            if choice == "y":
                to_update.append(name)

    if not to_update:
        print("\nNo packages selected for update.")
        return 0

    print(f"\nUpdating {len(to_update)} selected packages...")

    # Update selected packages
    updated = {}
    for package in to_update:
        print(f"Updating {package}...")
        try:
            subprocess.run(
                [str(venv_python), "-m", "pip", "install", "--upgrade", package],
                capture_output=True,
                text=True,
                check=True,
            )

            # Get the installed version
            version_cmd = subprocess.run(
                [str(venv_python), "-m", "pip", "show", package],
                capture_output=True,
                text=True,
                check=True,
            )

            version = None
            for line in version_cmd.stdout.split("\n"):
                if line.startswith("Version: "):
                    version = line.split("Version: ")[1].strip()
                    updated[package] = version
                    print(f"  {package} updated to {version}")
                    break
        except subprocess.CalledProcessError as e:
            print(f"  Failed to update {package}: {e}")

    # Update requirements.txt
    if updated:
        req_file = project_root / "requirements-dev.txt"
        print("\nUpdating requirements-dev.txt...")

        try:
            with open(req_file, "r") as f:
                lines = f.readlines()

            new_lines = []
            for line in lines:
                orig_line = line.strip()
                # Skip comments or empty lines
                if not orig_line or orig_line.startswith(("#", "//")):
                    new_lines.append(line)
                    continue

                line_modified = False
                for pkg_name, version in updated.items():
                    # Extract base package name from the requirement line
                    req_base_name = re.split(r"\[|\s|=", orig_line)[0]

                    # If the package being updated matches the base name in the requirements file
                    if pkg_name == req_base_name:
                        # Preserve any extras and indentation
                        extras_match = re.search(r"(\[.*?\])", orig_line)
                        extras = extras_match.group(1) if extras_match else ""
                        indent = re.match(r"^\s*", line).group(0)

                        # Create the new line with preserved extras
                        new_lines.append(
                            f"{indent}{req_base_name}{extras}=={version}\n"
                        )
                        print(f"  {req_base_name}{extras}=={version}")
                        line_modified = True
                        break

                if not line_modified:
                    new_lines.append(line)

            with open(req_file, "w") as f:
                f.writelines(new_lines)
        except Exception as e:
            print(f"[X] Error updating requirements-dev.txt: {e}")
            return 1

    print("\n[3/3] Cleanup complete")
    print("\n✅ Package update completed successfully!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
