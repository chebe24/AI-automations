#!/bin/bash

# Automated npm Permissions Fix Script for macOS
# This script implements the recommended solution for fixing npm global install permissions

set -e

echo "=========================================="
echo "npm Permissions Fix for macOS"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detect shell
SHELL_NAME=$(basename "$SHELL")
if [ "$SHELL_NAME" = "zsh" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ "$SHELL_NAME" = "bash" ]; then
    SHELL_RC="$HOME/.bash_profile"
else
    echo -e "${YELLOW}Warning: Unknown shell ($SHELL_NAME). Defaulting to ~/.zshrc${NC}"
    SHELL_RC="$HOME/.zshrc"
fi

echo "Detected shell: $SHELL_NAME"
echo "Shell config file: $SHELL_RC"
echo ""

# Step 1: Create npm global directory
echo -e "${GREEN}Step 1:${NC} Creating npm global directory..."
mkdir -p ~/.npm-global
echo "✓ Directory created: ~/.npm-global"
echo ""

# Step 2: Configure npm to use new directory
echo -e "${GREEN}Step 2:${NC} Configuring npm to use new directory..."
npm config set prefix '~/.npm-global'
echo "✓ npm prefix set to: ~/.npm-global"
echo ""

# Step 3: Add to PATH
echo -e "${GREEN}Step 3:${NC} Adding directory to PATH..."

# Check if PATH is already configured
if grep -q "\.npm-global/bin" "$SHELL_RC" 2>/dev/null; then
    echo -e "${YELLOW}⚠ PATH already configured in $SHELL_RC${NC}"
else
    echo 'export PATH=~/.npm-global/bin:$PATH' >> "$SHELL_RC"
    echo "✓ Added to $SHELL_RC"
fi

# Export for current session
export PATH=~/.npm-global/bin:$PATH
echo "✓ PATH updated for current session"
echo ""

# Step 4: Verify configuration
echo -e "${GREEN}Step 4:${NC} Verifying configuration..."
NPM_PREFIX=$(npm config get prefix)
echo "npm prefix: $NPM_PREFIX"

if [ "$NPM_PREFIX" = "$HOME/.npm-global" ] || [ "$NPM_PREFIX" = "~/.npm-global" ]; then
    echo -e "${GREEN}✓ Configuration successful!${NC}"
else
    echo -e "${RED}✗ Configuration may have issues. Expected ~/.npm-global but got: $NPM_PREFIX${NC}"
fi
echo ""

# Final instructions
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Restart your terminal OR run: source $SHELL_RC"
echo "2. Install your package: npm install -g @google/gemini-cli"
echo ""
echo "You should now be able to install global npm packages without sudo!"
echo ""
