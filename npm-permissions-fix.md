# Fixing npm Global Install Permissions on macOS

## Quick Automated Fix

**Don't want to read the full guide? Run this automated script:**

```bash
# Clone the repo and run the script
git clone https://github.com/chebe24/AI-automations.git
cd AI-automations
chmod +x fix-npm-permissions.sh
./fix-npm-permissions.sh
```

Or download and run directly:
```bash
curl -o fix-npm.sh https://raw.githubusercontent.com/chebe24/AI-automations/main/fix-npm-permissions.sh
chmod +x fix-npm.sh
./fix-npm.sh
```

**For Gemini CLI specifically**, use the all-in-one installer:
```bash
curl -o install-gemini.sh https://raw.githubusercontent.com/chebe24/AI-automations/main/install-gemini-cli.sh
chmod +x install-gemini.sh
./install-gemini.sh
```

---

## Problem
When trying to install global npm packages on macOS, you encounter this error:
```
npm error code EACCES
npm error syscall mkdir
npm error path /usr/local/lib/node_modules/@google
npm error errno -13
npm error Error: EACCES: permission denied
```

This happens because the global npm directory (`/usr/local/lib/node_modules`) is owned by root, but npm tries to write to it as your user.

## Solutions

### Solution 1: Change npm's Default Directory (Recommended)

This is the safest approach that doesn't require sudo for global installs.

1. **Create a directory for global installations:**
   ```bash
   mkdir -p ~/.npm-global
   ```

2. **Configure npm to use the new directory:**
   ```bash
   npm config set prefix '~/.npm-global'
   ```

3. **Add the new directory to your PATH:**

   For **zsh** (default on macOS Catalina and later):
   ```bash
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
   source ~/.zshrc
   ```

   For **bash**:
   ```bash
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bash_profile
   source ~/.bash_profile
   ```

4. **Now install packages globally without sudo:**
   ```bash
   npm install -g @google/gemini-cli
   ```

### Solution 2: Use a Node Version Manager (Best Long-term Solution)

Using a version manager like `nvm` gives you better control over Node.js versions and avoids permission issues entirely.

1. **Install nvm:**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```

2. **Close and reopen your terminal, then install Node.js:**
   ```bash
   nvm install node  # installs latest version
   nvm use node
   ```

3. **Install global packages without sudo:**
   ```bash
   npm install -g @google/gemini-cli
   ```

### Solution 3: Fix Permissions on Existing Directory (Alternative)

If you prefer to keep using the existing directory:

1. **Find your npm directory:**
   ```bash
   npm config get prefix
   ```

2. **Change ownership to your user:**
   ```bash
   sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
   ```

3. **Install packages globally:**
   ```bash
   npm install -g @google/gemini-cli
   ```

**Warning:** This approach can cause issues if you switch between different users or use sudo for other operations.

## What NOT to Do

**DO NOT use `sudo npm install -g`** - While this "works", it:
- Creates security risks
- Can cause permission issues later
- Makes it harder to manage packages
- Can break your npm installation

## Verifying the Fix

After applying any solution, test it:

```bash
npm install -g @google/gemini-cli
```

You should see a successful installation without any EACCES errors.

## For Your Specific Case

Based on your error, I recommend **Solution 1** (changing npm's default directory) because:
- It's quick and safe
- No sudo required
- Works immediately
- Doesn't require installing additional tools

Just run these commands:
```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install -g @google/gemini-cli
```
