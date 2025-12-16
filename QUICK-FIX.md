# Quick Fix for npm EACCES Error

## Fastest Solution (Choose One)

### Option A: Change npm Directory (5 minutes, permanent fix)

```bash
# 1. Create directory
mkdir ~/.npm-global

# 2. Configure npm
npm config set prefix '~/.npm-global'

# 3. Add to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# 4. Reload shell
source ~/.zshrc

# 5. Install package
npm install -g @google/gemini-cli
```

### Option B: Fix Permissions (1 minute, may need repeating)

```bash
# Fix permissions
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) /usr/local/bin

# Install package
npm install -g @google/gemini-cli
```

### Option C: Use NVM (10 minutes, best long-term)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal, then:
nvm install --lts
nvm use --lts
npm install -g @google/gemini-cli
```

---

## Verify Installation

```bash
gemini --version
```

or

```bash
npm list -g --depth=0
```

---

## Need More Help?

See [fix-npm-permission-error.md](fix-npm-permission-error.md) for detailed explanations.
