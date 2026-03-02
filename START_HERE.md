# 🚀 Quick Start Guide - BCS Application

## ✅ Setup Complete - Fixed Issues:

1. ✅ Fixed CORS configuration (was blocking localhost)
2. ✅ Fixed client API URL (now points to http://localhost:5138/api)
3. ✅ Cleaned up server .env file
4. ✅ Created test scripts for easy user creation

---

## 🎯 Quick Start (3 Steps)

### Step 1: Start the Server

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
npm run dev
```

**You should see:**
```
✅ Connected to MongoDB
🚀 Server running on port 5138
```

**If you see errors:**
- Check MongoDB connection string in `server/.env`
- Make sure JWT_SECRET exists in `server/.env`

---

### Step 2: Start the Client (New Terminal)

```bash
cd /Users/bloom/Documents/src/chef/BCS/client
npm run dev
```

**You should see:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

### Step 3: Create Test Users (New Terminal)

```bash
cd /Users/bloom/Documents/src/chef/BCS
node create-test-users.js
```

This creates:
- **Customer:** customer@test.com / Password123
- **Admin:** admin@test.com / Admin123
- **Another customer:** john@test.com / Password123

---

## 🧪 Test Registration

### Option A: Use the Web Interface

1. Go to: http://localhost:5173/customer/register
2. Fill in the form:
   - **Name:** Your Name
   - **Email:** youremail@test.com
   - **Password:** Password123 (must have uppercase, lowercase, number)
   - **Confirm Password:** Password123
   - **Phone:** (425) 555-1234
3. Click **Register**

### Option B: Test with Script

```bash
cd /Users/bloom/Documents/src/chef/BCS
./test-registration.sh
```

This will test the API directly and show you if registration is working.

---

## 🔐 Login to Test Accounts

### Customer Dashboard
- **URL:** http://localhost:5173/customer/login
- **Email:** customer@test.com
- **Password:** Password123

### Admin Dashboard
- **URL:** http://localhost:5173/admin/login
- **Email:** admin@test.com
- **Password:** Admin123

---

## 📋 Password Requirements

When registering or creating users, passwords must:
- ✅ Be at least 8 characters long
- ✅ Contain at least ONE uppercase letter (A-Z)
- ✅ Contain at least ONE lowercase letter (a-z)
- ✅ Contain at least ONE number (0-9)

**Valid examples:**
- Password123
- MyPass2024
- SecureP@ss1
- Admin123

**Invalid examples:**
- password (no uppercase or number)
- PASSWORD123 (no lowercase)
- Password (no number)
- Pass123 (too short, only 7 characters)

---

## 🛠️ Troubleshooting

### Problem: "Failed to fetch" or "Network Error"

**Check:**
1. Is the server running? (should be on http://localhost:5138)
2. Is the client running? (should be on http://localhost:5173)
3. Check browser console (F12) for specific errors

**Fix:**
```bash
# Restart server
cd server
npm run dev

# Restart client (in another terminal)
cd client
npm run dev
```

---

### Problem: "CORS Error"

**This should now be fixed!** The server `.env` now has:
```
CORS_ORIGIN=http://localhost:5173
```

If you still see CORS errors:
1. Stop the server
2. Verify `server/.env` has `CORS_ORIGIN=http://localhost:5173`
3. Restart the server

---

### Problem: "Password validation failed"

Make sure your password:
- Is at least 8 characters
- Has uppercase letters
- Has lowercase letters
- Has numbers

Try: `Password123`

---

### Problem: "MongoDB connection failed"

Your MongoDB credentials might have expired.

**Fix:**
1. Go to https://cloud.mongodb.com/
2. Navigate to your cluster
3. Click **Connect** → **Drivers**
4. Copy the new connection string
5. Update `server/.env`:
   ```
   MONGO_URI=your_new_connection_string_here
   ```
6. Restart the server

---

### Problem: "Email already registered"

The email is already in the database.

**Solutions:**
1. Use a different email address
2. Login with the existing account
3. Delete the user from MongoDB and try again

---

## 🔍 Debug Commands

### Check if services are running:
```bash
# Check server (should show process on port 5138)
lsof -i :5138

# Check client (should show process on port 5173)
lsof -i :5173
```

### Test API directly:
```bash
curl -X POST http://localhost:5138/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "phone": "4255551234"
  }'
```

### Check MongoDB connection:
```bash
cd server
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => { console.log('✅ MongoDB connected'); process.exit(0); }).catch((err) => { console.error('❌ MongoDB error:', err.message); process.exit(1); });"
```

---

## 📁 Important Files

- **Server config:** `server/.env`
- **Client config:** `client/.env`
- **User model:** `server/src/models/User.ts`
- **Auth controller:** `server/src/controllers/authController.ts`
- **Register page:** `client/src/pages/customer/Register.tsx`

---

## 🎨 Development URLs

- **Client:** http://localhost:5173
- **Server API:** http://localhost:5138/api
- **Health Check:** http://localhost:5138/health

---

## 📝 Quick Reference

### Create a new customer user:
```javascript
// In server directory, create user-create.js:
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createUser() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./dist/models/User').default;

  const password = await bcrypt.hash('Password123', 10);
  const user = await User.create({
    name: 'New Customer',
    email: 'newuser@test.com',
    password: password,
    phone: '(425) 555-9999',
    role: 'customer',
    needsPasswordSetup: false
  });

  console.log('✅ User created:', user.email);
  process.exit(0);
}
createUser().catch(console.error);
```

Then run:
```bash
cd server
npm run build
node user-create.js
```

---

## ✅ Everything Working?

If you can:
1. ✅ Start both server and client without errors
2. ✅ Create test users with `create-test-users.js`
3. ✅ Login as customer@test.com
4. ✅ Login as admin@test.com
5. ✅ Register a new account via the web form

**Then everything is working! 🎉**

---

## 🆘 Still Having Issues?

Run the diagnostic:
```bash
cd /Users/bloom/Documents/src/chef/BCS
./test-registration.sh
```

This will tell you exactly what's wrong and how to fix it.

---

## 🚀 Next Steps

Once registration is working:

1. **Customize email templates** - Edit files in `server/src/utils/email/templates/`
2. **Set up real email service** - Configure Resend in `server/.env`
3. **Add more features** - See `docs/ROADMAP.md`
4. **Deploy to production** - See `docs/HOSTING_AND_DOMAIN_GUIDE.md`

---

**Questions? Check the full troubleshooting guide:**
`/REGISTRATION_TROUBLESHOOTING.md`
