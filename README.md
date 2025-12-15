# AI-automations

## macOS Terminal -bash Error Fix

This repository contains tools to diagnose and fix the common macOS terminal error:
```
zsh: command not found: -bash
```

### Quick Start

If you're experiencing this error on your Mac:

1. **Read the guide**: [macos-terminal-fix.md](macos-terminal-fix.md)
2. **Run the diagnostic script**: `./fix-terminal.sh` (download and run on your Mac)

### What's Included

- **macos-terminal-fix.md**: Comprehensive guide explaining the issue and manual fix steps
- **fix-terminal.sh**: Automated diagnostic and fix script

### The Problem

This error occurs when something in your shell configuration files (like `.zshrc`) is trying to execute `-bash` as a command. It's usually caused by:

- A malformed line in your shell config
- An incorrectly configured Terminal profile
- A typo in a script that runs at shell startup

### The Solution

The fix typically involves:
1. Identifying which config file contains the problematic line
2. Removing or correcting that line
3. Restarting Terminal

See the full guide for detailed instructions.