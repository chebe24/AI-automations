# Fix npm EACCES Permission Error

## Problem Description

When running `npm install -g @google/gemini-cli`, you encounter:
```
npm error code EACCES
npm error syscall mkdir
npm error path /usr/local/lib/node_modules/@google
npm error errno -13
npm error Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@google'
```

This happens because npm tries to install global packages in `/usr/local/lib/node_modules/`, which requires administrator permissions on macOS.

## Solutions (Ranked from Best to Quick Fix)

### Solution 1: Use NVM (Node Version Manager) - RECOMMENDED

This is the best long-term solution as it avoids permission issues entirely.

#### Install NVM:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

#### Restart your terminal, then install Node:
```bash
nvm install --lts
nvm use --lts
```

#### Now install the package without sudo:
```bash
npm install -g @google/gemini-cli
```

**Benefits:**
- No permission issues
- Easy to switch between Node versions
- Industry best practice

---

### Solution 2: Change npm's Default Directory

Reconfigure npm to use a directory you own.

#### Create a directory for global installations:
```bash
mkdir ~/.npm-global
```

#### Configure npm to use this directory:
```bash
npm config set prefix '~/.npm-global'
```

#### Add the new directory to your PATH:
```bash
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

#### Now install the package:
```bash
npm install -g @google/gemini-cli
```

---

### Solution 3: Fix Permissions on Node Modules Directory

Make yourself the owner of npm's directories.

#### Change ownership of npm directories:
```bash
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) /usr/local/bin
sudo chown -R $(whoami) /usr/local/share
```

#### Now install the package:
```bash
npm install -g @google/gemini-cli
```

**Warning:** This may cause issues if other users need to use npm on the same machine.

---

### Solution 4: Use sudo (NOT RECOMMENDED)

This is the quickest but least recommended solution as it can cause permission issues later.

```bash
sudo npm install -g @google/gemini-cli
```

**Why this is problematic:**
- Creates files owned by root
- Can cause permission issues for future npm operations
- Security risk

---

## Verification

After installing, verify the package is installed:

```bash
gemini --version
```

or

```bash
npm list -g --depth=0
```

---

## Which Solution Should You Choose?

1. **New to Node.js?** → Use Solution 1 (NVM)
2. **Already have Node installed?** → Use Solution 2 (Change npm directory)
3. **Quick fix needed?** → Use Solution 3 (Fix permissions)
4. **Desperate?** → Use Solution 4 (sudo), but migrate to Solution 1 or 2 later

---

## Additional Resources

- [Official npm documentation on fixing permissions](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)
- [NVM GitHub repository](https://github.com/nvm-sh/nvm)
- [Node.js installation guide](https://nodejs.org/)

---

## Troubleshooting

### If NVM installation fails:
Make sure you're using the latest install script from [nvm repository](https://github.com/nvm-sh/nvm).

### If PATH changes don't work:
- For Bash: edit `~/.bash_profile` or `~/.bashrc`
- For Zsh (macOS default): edit `~/.zshrc`
- Restart your terminal after making changes

### If you still get permission errors:
Check which node you're using:
```bash
which node
which npm
```

If they point to `/usr/local/bin/`, you're not using NVM yet.
