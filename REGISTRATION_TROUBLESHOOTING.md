# 🔍 Registration Troubleshooting Guide

## Quick Diagnosis

Based on your setup, here are the most likely issues and solutions:

---

## Issue #1: Server Not Running ⚠️

**Check if the server is running:**

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
npm run dev
```

You should see output like:
```
✅ Connected to MongoDB
🚀 Server running on port 5138
```

**If you see errors:**
- MongoDB connection error → See Issue #2
- JWT_SECRET error → See Issue #3
- Port already in use → See Issue #4

---

## Issue #2: MongoDB Connection Problem 🗄️

Your current MongoDB URI might have expired or changed. Let me check your connection:

**Test MongoDB connection:**

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
node -e "
const mongoose = require('mongoose');
const uri = 'mongodb+srv://akjzoffices_db_user:YDIOixRNf1HgPCVC@demo.kj33rlz.mongodb.net/?appName=Demo';
mongoose.connect(uri).then(() => {
  console.log('✅ MongoDB connected successfully');
  process.exit(0);
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
"
```

**If connection fails:**
1. Go to MongoDB Atlas (https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Click "Connect" → "Drivers"
4. Copy the new connection string
5. Update in `/Users/bloom/Documents/src/chef/BCS/server/.env`:
   ```
   MONGO_URI=your_new_connection_string
   ```

---

## Issue #3: Frontend Not Connected to Backend 🔌

**Check your client .env file:**

```bash
cat /Users/bloom/Documents/src/chef/BCS/client/.env
```

**It should have:**
```
VITE_API_URL=http://localhost:5138/api
```

**If the file doesn't exist or is wrong, create it:**

```bash
cd /Users/bloom/Documents/src/chef/BCS/client
cat > .env << 'EOF'
VITE_API_URL=http://localhost:5138/api
EOF
```

**Then restart the client:**

```bash
cd /Users/bloom/Documents/src/chef/BCS/client
npm run dev
```

---

## Issue #4: CORS Error 🚫

If you see a CORS error in the browser console, the server needs to allow requests from your frontend.

**Check server CORS configuration:**

The server should already be configured for `http://localhost:5173`. If your client runs on a different port, update the server.

---

## Issue #5: Password Validation Failing 🔐

The registration requires a strong password. Make sure your password:
- ✅ Is at least 8 characters long
- ✅ Contains at least one uppercase letter (A-Z)
- ✅ Contains at least one lowercase letter (a-z)
- ✅ Contains at least one number (0-9)

**Example valid passwords:**
- `Password123`
- `MyPass2024`
- `SecureP@ss1`

---

## Alternative: Create User via CLI 🖥️

If registration still doesn't work, you can create a user directly:

### Option A: Create Admin User

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
npm run build
npm run admin:create
```

Follow the prompts to create an admin account.

### Option B: Create Customer User via MongoDB

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
node << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('./dist/models/User').default;

    const password = await bcrypt.hash('Password123', 10);

    const user = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: password,
      phone: '1234567890',
      role: 'customer',
      needsPasswordSetup: false
    });

    console.log('✅ User created successfully!');
    console.log('Email:', user.email);
    console.log('Password: Password123');
    console.log('\nYou can now login at http://localhost:5173/customer/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUser();
EOF
```

---

## Full Debugging Checklist ✅

Run through this checklist step by step:

### 1. Check Server Status

```bash
# Is the server running?
cd /Users/bloom/Documents/src/chef/BCS/server
npm run dev
```

**Expected output:**
```
✅ Connected to MongoDB
🚀 Server running on port 5138
```

### 2. Check Client Status

```bash
# Is the client running?
cd /Users/bloom/Documents/src/chef/BCS/client
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 3. Test Backend Directly

Open a new terminal and test the backend:

```bash
curl -X POST http://localhost:5138/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "phone": "1234567890"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJ..."
}
```

**If you get an error response, it will tell you exactly what's wrong!**

### 4. Check Browser Console

1. Open your browser
2. Go to http://localhost:5173/customer/register
3. Open Developer Tools (F12)
4. Go to the "Console" tab
5. Try to register
6. Look for any error messages

**Common errors:**
- `Failed to fetch` → Server not running or wrong URL
- `CORS error` → Server not allowing requests from frontend
- `400 Bad Request` → Password validation or missing fields
- `500 Internal Server Error` → Server error (check server logs)

### 5. Check Server Logs

When you try to register, watch the server terminal. You should see logs like:

```
[2024-xx-xx xx:xx:xx] [info]: Authentication Event { event: 'register', email: '...', success: true }
```

If you see an error, it will show in red with details.

---

## Common Error Messages & Solutions

### Error: "Email already registered"
**Solution:** Use a different email address or login with the existing account.

### Error: "Password must be at least 8 characters"
**Solution:** Use a longer password with uppercase, lowercase, and numbers.

### Error: "Failed to fetch"
**Solutions:**
1. Make sure server is running on port 5138
2. Check client .env has correct API URL
3. Make sure no firewall is blocking the connection

### Error: "Network Error" or "CORS"
**Solution:**
1. Make sure both server and client are running
2. Server should be on http://localhost:5138
3. Client should be on http://localhost:5173
4. Restart both if needed

---

## Quick Fix Script 🚀

Run this to fix common issues:

```bash
#!/bin/bash

echo "🔍 BCS Registration Fix Script"
echo "================================"
echo ""

# Check if server is running
if lsof -Pi :5138 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Server is running on port 5138"
else
    echo "❌ Server is NOT running on port 5138"
    echo "   → Start it with: cd server && npm run dev"
fi

# Check if client is running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Client is running on port 5173"
else
    echo "❌ Client is NOT running on port 5173"
    echo "   → Start it with: cd client && npm run dev"
fi

# Check client .env
if [ -f "client/.env" ]; then
    if grep -q "VITE_API_URL=http://localhost:5138/api" client/.env; then
        echo "✅ Client .env is configured correctly"
    else
        echo "❌ Client .env has wrong API URL"
        echo "   → Should be: VITE_API_URL=http://localhost:5138/api"
    fi
else
    echo "❌ Client .env file is missing"
    echo "   → Creating it now..."
    echo "VITE_API_URL=http://localhost:5138/api" > client/.env
    echo "✅ Created client/.env"
fi

# Check server .env for JWT_SECRET
if [ -f "server/.env" ]; then
    if grep -q "JWT_SECRET=" server/.env; then
        echo "✅ Server has JWT_SECRET configured"
    else
        echo "❌ Server is missing JWT_SECRET"
        echo "   → Check server/.env file"
    fi
else
    echo "❌ Server .env file is missing"
fi

echo ""
echo "================================"
echo "Next steps:"
echo "1. Make sure both server and client are running"
echo "2. Try registration at: http://localhost:5173/customer/register"
echo "3. If issues persist, check the browser console (F12)"
```

Save this as `fix-registration.sh` and run:

```bash
chmod +x fix-registration.sh
./fix-registration.sh
```

---

## Still Having Issues? 🆘

If none of the above works, gather this information:

1. **Server logs** (full output when you start the server)
2. **Browser console errors** (F12 → Console tab)
3. **Network tab** (F12 → Network tab, try to register, show the failed request)

Then we can diagnose the exact issue!

---

## Testing Your Setup

Once everything is fixed, test with these credentials:

**For Customer Registration:**
- Name: Test Customer
- Email: customer@test.com
- Password: Password123
- Phone: 1234567890

**For Admin Login (after creating via CLI):**
- Use the email and password you set up with `npm run admin:create`

---

**Quick Start Commands:**

```bash
# Terminal 1 - Start Server
cd /Users/bloom/Documents/src/chef/BCS/server
npm run dev

# Terminal 2 - Start Client
cd /Users/bloom/Documents/src/chef/BCS/client
npm run dev

# Terminal 3 - Test Registration
curl -X POST http://localhost:5138/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Password123","phone":"1234567890"}'
```

This should get you up and running! 🚀
