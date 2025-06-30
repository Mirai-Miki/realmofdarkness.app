#!/bin/bash
# sync_requirements.sh
# Synchronizes package versions from requirements-dev.txt to requirements.txt

# Navigate to project root
cd "$(dirname "$0")"
cd ..

echo "===== Requirements Synchronization ====="
echo

# Check if both files exist
if [ ! -f "requirements-dev.txt" ]; then
    echo "[X] requirements-dev.txt not found!"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    echo "[X] requirements.txt not found!"
    exit 1
fi

echo "Synchronizing package versions from requirements-dev.txt to requirements.txt..."
echo

# Create temporary file for new requirements.txt
temp_file=$(mktemp)
updated_count=0
dev_only_packages=()

# Read requirements.txt line by line
while IFS= read -r line; do
    # Skip empty lines and comments
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        echo "$line" >> "$temp_file"
        continue
    fi
    
    # Extract package name (everything before ==, [, or space)
    package_name=$(echo "$line" | sed 's/\[.*\]//g' | sed 's/==.*//' | sed 's/[[:space:]].*//')
    
    if [ -z "$package_name" ]; then
        echo "$line" >> "$temp_file"
        continue
    fi
    
    # Look for this package in requirements-dev.txt
    dev_line=$(grep "^${package_name}[=\[]" requirements-dev.txt || true)
    
    if [ -n "$dev_line" ]; then
        # Extract version from dev requirements (everything after ==)
        dev_version=$(echo "$dev_line" | sed 's/.*==//')
        
        # Extract current version from production requirements
        prod_version=$(echo "$line" | sed 's/.*==//')
        
        if [ "$dev_version" != "$prod_version" ]; then
            # Update the version in production requirements
            new_line="${package_name}==${dev_version}"
            echo "$new_line" >> "$temp_file"
            echo "  - $package_name: $prod_version → $dev_version"
            ((updated_count++))
        else
            # Versions match, keep original line
            echo "$line" >> "$temp_file"
        fi
    else
        # Package not found in dev requirements, keep original
        echo "$line" >> "$temp_file"
    fi
done < requirements.txt

# Check for packages that are in dev but not in production
while IFS= read -r line; do
    # Skip empty lines and comments
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Extract package name
    package_name=$(echo "$line" | sed 's/\[.*\]//g' | sed 's/==.*//' | sed 's/[[:space:]].*//')
    
    if [ -z "$package_name" ]; then
        continue
    fi
    
    # Check if this package exists in production requirements
    if ! grep -q "^${package_name}[=\[]" requirements.txt; then
        dev_only_packages+=("$package_name")
    fi
done < requirements-dev.txt

# Replace original file with updated version
mv "$temp_file" requirements.txt

echo
if [ $updated_count -eq 0 ]; then
    echo "✅ All package versions are already synchronized."
else
    echo "✅ Updated $updated_count package version(s) in requirements.txt"
fi

if [ ${#dev_only_packages[@]} -gt 0 ]; then
    echo
    echo "📝 Development-only packages (not copied to production):"
    for pkg in "${dev_only_packages[@]}"; do
        echo "  - $pkg"
    done
fi

echo
echo "Synchronization complete!"
