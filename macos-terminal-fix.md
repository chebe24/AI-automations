# Fix macOS Terminal "-bash: command not found" Error

## Problem
When opening Terminal on macOS, you see:
```
zsh: command not found: -bash
```

## Root Cause
Something is trying to execute `-bash` as a command. This most commonly happens in one of two places:
1. **Terminal app preferences** (most common - check this first!)
2. Shell configuration files with malformed lines

## Quick Fix Steps

### Step 1: Check Terminal Preferences (MOST COMMON CAUSE)

**This is where the issue is 90% of the time!**

1. Open **Terminal** app
2. Go to **Terminal** menu → **Preferences** (or press `Cmd+,`)
3. Click on the **Profiles** tab
4. Select your default profile (the one with a checkmark or labeled "Default")
5. Click the **Shell** tab on the right side
6. Look for the **Startup** section
7. Check if **"Run command:"** is checked
8. If it says `-bash` or anything with `-bash`:
   - Uncheck the "Run command" box, OR
   - Delete the `-bash` text
9. Close Preferences
10. Quit Terminal completely (`Cmd+Q`)
11. Reopen Terminal - the error should be gone!

### Step 2: If Terminal Preferences Were Clean, Check Configuration Files

If the Terminal preferences didn't have the issue, check your shell configuration files.

The issue might be in one of these files in your home directory:
- `~/.zshrc` (most common)
- `~/.zprofile`
- `~/.zshenv`
- `~/.bash_profile` (if it's being sourced)

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

### Step 3: Search for the Problem

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

## Restore Default Configuration

If all else fails, you can temporarily rename your config files:
```bash
mv ~/.zshrc ~/.zshrc.old
mv ~/.zprofile ~/.zprofile.old
mv ~/.zshenv ~/.zshenv.old
```

Then open a new Terminal window. It will use default settings.
