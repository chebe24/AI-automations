#!/bin/bash

# Quick Setup Script for Installing Gemini CLI
# This script fixes npm permissions and installs @google/gemini-cli

set -e

echo "=========================================="
echo "Gemini CLI Setup for macOS"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Detect shell
SHELL_NAME=$(basename "$SHELL")
if [ "$SHELL_NAME" = "zsh" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ "$SHELL_NAME" = "bash" ]; then
    SHELL_RC="$HOME/.bash_profile"
else
    SHELL_RC="$HOME/.zshrc"
fi

echo -e "${GREEN}Step 1/4:${NC} Setting up npm global directory..."
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

echo -e "${GREEN}Step 2/4:${NC} Configuring PATH..."
if ! grep -q "\.npm-global/bin" "$SHELL_RC" 2>/dev/null; then
    echo 'export PATH=~/.npm-global/bin:$PATH' >> "$SHELL_RC"
fi
export PATH=~/.npm-global/bin:$PATH

echo -e "${GREEN}Step 3/4:${NC} Installing @google/gemini-cli..."
npm install -g @google/gemini-cli

echo -e "${GREEN}Step 4/4:${NC} Verifying installation..."
if command -v gemini &> /dev/null; then
    echo -e "${GREEN}✓ Gemini CLI installed successfully!${NC}"
    echo ""
    gemini --version
else
    echo -e "${YELLOW}⚠ Installation complete but 'gemini' command not found.${NC}"
    echo "  Please restart your terminal and try: gemini --version"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "To use gemini CLI:"
echo "1. Restart your terminal OR run: source $SHELL_RC"
echo "2. Run: gemini --help"
echo ""
