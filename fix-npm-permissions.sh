#!/bin/bash

# Fix npm Permission Error - Automated Script
# This script helps resolve EACCES permission errors when installing npm packages globally

set -e

echo "==================================="
echo "npm Permission Error Fix Script"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    if [ -f "$HOME/.bash_profile" ]; then
        SHELL_RC="$HOME/.bash_profile"
    else
        SHELL_RC="$HOME/.bashrc"
    fi
    SHELL_NAME="bash"
else
    SHELL_RC="$HOME/.profile"
    SHELL_NAME="unknown"
fi

echo "Detected shell: $SHELL_NAME"
echo "Shell configuration file: $SHELL_RC"
echo ""

# Check if NVM is already installed
if command -v nvm &> /dev/null || [ -s "$HOME/.nvm/nvm.sh" ]; then
    print_success "NVM is already installed!"
    echo ""
    echo "To use NVM:"
    echo "  nvm install --lts"
    echo "  nvm use --lts"
    echo "  npm install -g @google/gemini-cli"
    exit 0
fi

# Present options
echo "Choose a solution:"
echo ""
echo "1. Install NVM (Node Version Manager) - RECOMMENDED"
echo "   Best long-term solution, no permission issues"
echo ""
echo "2. Change npm default directory"
echo "   Use a user-owned directory for global packages"
echo ""
echo "3. Fix permissions on existing directories"
echo "   Make current user owner of npm directories"
echo ""
echo "4. Exit and fix manually"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        print_warning "Installing NVM..."

        # Install NVM
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

        # Load NVM
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        print_success "NVM installed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Restart your terminal (or run: source $SHELL_RC)"
        echo "2. Install Node.js: nvm install --lts"
        echo "3. Use Node.js: nvm use --lts"
        echo "4. Install packages: npm install -g @google/gemini-cli"
        ;;

    2)
        echo ""
        print_warning "Changing npm default directory..."

        # Create directory for global installations
        mkdir -p ~/.npm-global

        # Configure npm to use new directory
        npm config set prefix '~/.npm-global'

        # Add to PATH if not already there
        if ! grep -q "npm-global/bin" "$SHELL_RC"; then
            echo "" >> "$SHELL_RC"
            echo "# npm global packages" >> "$SHELL_RC"
            echo 'export PATH=~/.npm-global/bin:$PATH' >> "$SHELL_RC"
        fi

        print_success "npm directory changed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Restart your terminal (or run: source $SHELL_RC)"
        echo "2. Install packages: npm install -g @google/gemini-cli"
        ;;

    3)
        echo ""
        print_warning "Fixing permissions on npm directories..."
        print_warning "This requires sudo access"

        # Fix permissions
        sudo chown -R $(whoami) /usr/local/lib/node_modules 2>/dev/null || true
        sudo chown -R $(whoami) /usr/local/bin 2>/dev/null || true
        sudo chown -R $(whoami) /usr/local/share 2>/dev/null || true

        print_success "Permissions fixed!"
        echo ""
        echo "You can now run: npm install -g @google/gemini-cli"
        ;;

    4)
        echo ""
        echo "No changes made. See fix-npm-permission-error.md for manual instructions."
        exit 0
        ;;

    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
print_success "Done!"
