# Fix macOS Terminal "-bash: command not found" Error

## Problem
When opening Terminal on macOS, you see:
```
zsh: command not found: -bash
```

## Root Cause
Something in your shell configuration files is trying to execute `-bash` as a command. This typically happens when there's a malformed line in one of your zsh startup files.

## Common Locations to Check

The issue is likely in one of these files in your home directory:
- `~/.zshrc` (most common)
- `~/.zprofile`
- `~/.zshenv`
- `~/.bash_profile` (if it's being sourced)

## Quick Fix Steps

### Step 1: Open Terminal in Safe Mode
1. Open Terminal
2. Even though you see the error, the terminal should still be usable
3. You can ignore the error message for now

### Step 2: Check Your Shell Configuration Files

Run these commands to inspect your configuration files:

```bash
# Check .zshrc
cat ~/.zshrc

# Check .zprofile
cat ~/.zprofile

# Check .zshenv
cat ~/.zshenv

# Check .bash_profile
cat ~/.bash_profile
```

### Step 3: Look for the Problem

Search for lines containing `-bash`:
```bash
grep -n "bash" ~/.zshrc ~/.zprofile ~/.zshenv ~/.bash_profile 2>/dev/null
```

### Step 4: Common Issues and Fixes

**Issue 1:** A line that just says `-bash`
```bash
# Wrong:
-bash

# Fix: Remove this line entirely
```

**Issue 2:** Trying to switch to bash incorrectly
```bash
# Wrong:
-bash

# Correct:
exec bash -l
# or
exec /bin/bash
```

**Issue 3:** Malformed alias or function
```bash
# Wrong:
alias bash=-bash

# Correct:
alias bash='/bin/bash'
```

### Step 5: Edit the Problematic File

Use nano or vim to edit the file:
```bash
nano ~/.zshrc
# or
vim ~/.zshrc
```

Remove or fix the problematic line, then save.

### Step 6: Test the Fix

1. Close Terminal completely (Cmd+Q)
2. Reopen Terminal
3. The error should be gone

## Quick Automated Fix

If you want to quickly comment out any suspicious lines, use the fix script provided in this repository.

## Manual Backup Before Fixing

Always backup your config files first:
```bash
cp ~/.zshrc ~/.zshrc.backup
cp ~/.zprofile ~/.zprofile.backup
cp ~/.zshenv ~/.zshenv.backup
```

## Still Having Issues?

If the error persists:
1. Check if you have any custom Terminal profiles that execute commands on startup
2. Open Terminal preferences (Cmd+,) → Profiles → Shell
3. Ensure "Run command" is not checked or doesn't contain `-bash`

## Restore Default Configuration

If all else fails, you can temporarily rename your config files:
```bash
mv ~/.zshrc ~/.zshrc.old
mv ~/.zprofile ~/.zprofile.old
mv ~/.zshenv ~/.zshenv.old
```

Then open a new Terminal window. It will use default settings.
