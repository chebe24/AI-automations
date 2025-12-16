# AI-automations

Collection of guides and fixes for common automation and development issues.

## Quick Fixes

### npm Permission Errors on macOS

**Problem:** Getting `EACCES: permission denied` when running `npm install -g`?

**Quick Solution:**
```bash
# Download and run the fix script
curl -o- https://raw.githubusercontent.com/chebe24/AI-automations/main/fix-npm-permissions.sh | bash
```

Or manually:
```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Install Gemini CLI (with automatic permission fix)

```bash
# One-command installation
curl -o- https://raw.githubusercontent.com/chebe24/AI-automations/main/install-gemini-cli.sh | bash
```

## Scripts

- **[fix-npm-permissions.sh](./fix-npm-permissions.sh)** - Automated script to fix npm global install permissions
- **[install-gemini-cli.sh](./install-gemini-cli.sh)** - One-command installer for Gemini CLI with permission fixes

## Guides

- **[npm Permissions Fix Guide](./npm-permissions-fix.md)** - Complete guide to resolve EACCES errors when installing global npm packages