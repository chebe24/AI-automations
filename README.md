# AI-automations

## npm Permission Error Fix

This repository contains solutions for fixing the common npm `EACCES` permission error that occurs when installing global packages on macOS/Linux.

### Quick Start

**Option 1: Use the automated script (Recommended)**
```bash
./fix-npm-permissions.sh
```

**Option 2: Read the detailed guide**
See [fix-npm-permission-error.md](fix-npm-permission-error.md) for comprehensive solutions.

### The Error

```
npm error code EACCES
npm error syscall mkdir
npm error path /usr/local/lib/node_modules/@google
npm error errno -13
npm error Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@google'
```

### Quick Solutions

1. **Best Practice**: Install NVM (Node Version Manager)
2. **Alternative**: Change npm's default directory to a user-owned location
3. **Quick Fix**: Fix permissions on existing directories

See the documentation for detailed instructions on each solution.