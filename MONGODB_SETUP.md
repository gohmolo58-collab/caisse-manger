# MongoDB Setup - Quick Guide

## 🚀 Fastest Option: MongoDB Atlas (Cloud - FREE)

### Step 1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose FREE tier (M0)

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "M0 FREE" tier
3. Select a region close to you
4. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Create Database User
1. Click "Database Access" in left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `caisseuser`
5. Password: Create a strong password (save it!)
6. User Privileges: "Atlas admin"
7. Click "Add User"

### Step 4: Allow Network Access
1. Click "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://caisseuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: change `/?retryWrites` to `/caisse-manager?retryWrites`

### Step 6: Update .env File
Open `/Users/mac/Desktop/caisse manager/.env` and update:

```env
PORT=5000
MONGODB_URI=mongodb+srv://caisseuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/caisse-manager?retryWrites=true&w=majority
JWT_SECRET=zNb0CfVIMpVlrInIqHePT2Cm23f6p3ROjgnwdprI9EQ=
NODE_ENV=development
```

### Step 7: Restart Application
The app will automatically reconnect!

---

## Alternative: Install MongoDB Locally

If you prefer local installation:

```bash
# Fix Homebrew permissions first
sudo chown -R $(whoami) /usr/local/Cellar

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list | grep mongodb
```

Then keep your current .env:
```env
MONGODB_URI=mongodb://localhost:27017/caisse-manager
```

---

## ✅ Which Should You Choose?

**MongoDB Atlas (Cloud):**
- ✅ No installation needed
- ✅ Works immediately
- ✅ Free tier available
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ⏱️ Takes 5 minutes to setup

**Local MongoDB:**
- ✅ Full control
- ✅ Works offline
- ✅ Faster for development
- ❌ Requires installation
- ❌ Manual backups
- ⏱️ Takes 10-15 minutes to setup

**Recommendation**: Use **MongoDB Atlas** for fastest setup!
