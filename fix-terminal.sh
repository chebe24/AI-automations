#!/bin/bash

# macOS Terminal -bash Error Fix Script
# This script helps diagnose and fix the "zsh: command not found: -bash" error

echo "======================================"
echo "macOS Terminal -bash Error Diagnostic"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Files to check
CONFIG_FILES=(
    "$HOME/.zshrc"
    "$HOME/.zprofile"
    "$HOME/.zshenv"
    "$HOME/.bash_profile"
    "$HOME/.bashrc"
)

echo "Step 1: Checking for problematic lines..."
echo ""

FOUND_ISSUE=0

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Checking: $file"

        # Search for standalone -bash or suspicious bash invocations
        if grep -n "^-bash" "$file" > /dev/null 2>&1; then
            echo -e "${RED}✗ FOUND ISSUE:${NC} Standalone '-bash' command found"
            grep -n "^-bash" "$file"
            FOUND_ISSUE=1
            PROBLEM_FILE="$file"
        elif grep -n "[^a-zA-Z_]-bash" "$file" > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠ POTENTIAL ISSUE:${NC} Suspicious '-bash' reference found"
            grep -n "[^a-zA-Z_]-bash" "$file"
            FOUND_ISSUE=1
            PROBLEM_FILE="$file"
        else
            echo -e "${GREEN}✓${NC} No issues found"
        fi
        echo ""
    fi
done

if [ $FOUND_ISSUE -eq 0 ]; then
    echo -e "${GREEN}No obvious issues found in shell configuration files.${NC}"
    echo ""
    echo "The issue might be in:"
    echo "1. Terminal app preferences (Terminal → Preferences → Profiles → Shell)"
    echo "2. A script being sourced from one of your config files"
    echo "3. System-wide configuration in /etc/zshrc or /etc/zprofile"
    exit 0
fi

echo "======================================"
echo "Step 2: Backup and Fix"
echo "======================================"
echo ""

if [ ! -z "$PROBLEM_FILE" ]; then
    echo "Problem detected in: $PROBLEM_FILE"
    echo ""
    read -p "Would you like to create a backup and attempt to fix? (y/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create backup
        BACKUP_FILE="${PROBLEM_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$PROBLEM_FILE" "$BACKUP_FILE"
        echo -e "${GREEN}✓${NC} Backup created: $BACKUP_FILE"

        # Remove or comment out problematic lines
        sed -i.tmp 's/^-bash/#-bash (COMMENTED OUT BY FIX SCRIPT)/g' "$PROBLEM_FILE"
        rm "${PROBLEM_FILE}.tmp" 2>/dev/null

        echo -e "${GREEN}✓${NC} Problematic lines have been commented out"
        echo ""
        echo "Please close and reopen Terminal to test the fix."
        echo ""
        echo "If you need to restore the original file:"
        echo "  cp $BACKUP_FILE $PROBLEM_FILE"
    else
        echo "No changes made."
        echo ""
        echo "To manually fix, edit the file:"
        echo "  nano $PROBLEM_FILE"
        echo ""
        echo "And remove or fix the lines containing '-bash'"
    fi
fi

echo ""
echo "======================================"
echo "Additional Checks"
echo "======================================"
echo ""

# Check Terminal preferences
echo "Don't forget to check Terminal preferences:"
echo "  Terminal → Preferences → Profiles → Shell"
echo "  Ensure 'Run command' is not set to '-bash'"
echo ""

# Check for exec commands
echo "Checking for 'exec' commands that might be causing issues..."
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -n "exec.*bash" "$file" > /dev/null 2>&1; then
            echo "Found exec bash command in: $file"
            grep -n "exec.*bash" "$file"
        fi
    fi
done

echo ""
echo "Script complete!"
