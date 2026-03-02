# MongoDB Connection Fix Guide

## Current Status

✅ **Server code:** Compiling perfectly
✅ **TypeScript:** No errors
❌ **MongoDB:** IP address not whitelisted

---

## Your Current IP Address

**174.204.70.115** - This needs to be whitelisted in MongoDB Atlas

---

## Solution 1: Whitelist Your IP (Recommended - 2 minutes)

### Step-by-Step Instructions

1. **Open MongoDB Atlas**
   - Go to: https://cloud.mongodb.com
   - Log in with your credentials

2. **Navigate to Network Access**
   - In the left sidebar, under "Security"
   - Click **"Network Access"**

3. **Add Your IP Address**
   - Click **"+ ADD IP ADDRESS"** (green button)

   **For Development (Easy):**
   - Click **"ALLOW ACCESS FROM ANYWHERE"**
   - This adds `0.0.0.0/0`
   - Click **"Confirm"**

   **For Production (Secure):**
   - Manually enter: `174.204.70.115`
   - Comment: "Development Machine"
   - Click **"Confirm"**

4. **Wait for Changes**
   - MongoDB Atlas takes **1-2 minutes** to propagate changes
   - Don't restart your server immediately

5. **Check if Cluster is Paused**
   - Go back to "Database" in left sidebar
   - If you see **"Paused"** status
   - Click **"Resume"** and wait 2-3 minutes

6. **Test Connection**
   ```bash
   cd /Users/bloom/Documents/src/chef/BCS/server
   node test-mongodb-connection.js
   ```

7. **Start Server**
   ```bash
   npm run dev
   ```

### Expected Success Output

```
✅ Environment variables validated successfully
MongoDB connected successfully
Cron jobs started successfully
Server running on port 5138
Environment: development
```

---

## Solution 2: Use Local MongoDB (Alternative)

If you prefer local development without cloud dependencies:

### Quick Setup

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
./setup-local-mongodb.sh
```

This script will:
1. Install MongoDB via Homebrew (if not installed)
2. Start MongoDB service
3. Show you the local connection string

### Manual Setup

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Update .env file
# Change this line:
MONGO_URI=mongodb://localhost:27017/bcs-dev

# Restart server
npm run dev
```

---

## Testing Your Connection

### Test Script (Recommended)

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
node test-mongodb-connection.js
```

This will:
- ✅ Test connection
- ✅ Show specific error if it fails
- ✅ Provide solution for each error type

### Manual Test

```bash
npm run dev
```

Watch for the line:
```
MongoDB connected successfully
```

---

## Common Issues

### Issue 1: "Could not connect... IP isn't whitelisted"
**Solution:** Follow Solution 1 above to whitelist your IP

### Issue 2: "ENOTFOUND" error
**Possible causes:**
1. Cluster is paused - Resume it in Atlas
2. Invalid MongoDB URI - Check .env file
3. No internet connection

### Issue 3: Authentication Failed
**Solution:** Check username/password in MONGO_URI

### Issue 4: Still failing after whitelisting
**Solution:**
1. Wait full 2 minutes for changes to propagate
2. Make sure you clicked "Confirm" in Atlas
3. Refresh Atlas page to verify IP was added
4. Check if there are any other IPs blocking yours

---

## Verification Checklist

After fixing, verify these work:

```bash
# 1. Test MongoDB connection
node test-mongodb-connection.js
# Should see: ✅ SUCCESS!

# 2. Start server
npm run dev
# Should see: MongoDB connected successfully

# 3. Register a user
# Open http://localhost:5173/customer/register
# Create test account

# 4. Check database
# Go to Atlas → Browse Collections
# Should see new user in 'users' collection
```

---

## Quick Scripts

We've created helper scripts for you:

```bash
# Test MongoDB connection
node test-mongodb-connection.js

# Restart server
./restart-server.sh

# Setup local MongoDB (alternative)
./setup-local-mongodb.sh
```

---

## Support Resources

- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
- IP Whitelist Guide: https://www.mongodb.com/docs/atlas/security-whitelist/
- Free Tier Limits: https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/

---

## Next Steps After Fix

Once MongoDB is connected:

1. ✅ Server starts successfully
2. ✅ Test registration at http://localhost:5173/customer/register
3. ✅ Verify user created in MongoDB Atlas
4. ✅ Test login functionality

Your code is ready - just waiting for database access!
