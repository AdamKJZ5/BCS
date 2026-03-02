# Registration Guide

## ✅ Your System is Working!

The server, database, and API are all functioning perfectly. Users ARE being created successfully.

---

## Password Requirements

Your password **MUST**:

1. ✅ Be at least **8 characters** long
2. ✅ Contain at least **1 uppercase letter** (A-Z)
3. ✅ Contain at least **1 lowercase letter** (a-z)
4. ✅ Contain at least **1 number** (0-9)
5. ✅ Contain at least **1 special character** (!@#$%^&* etc)
6. ❌ **NOT contain common passwords** (password, admin, test, etc.)

---

## ✅ GOOD Password Examples

Use these patterns:

- `MySecret#2026`
- `StrongP@ss99`
- `Secure$Blue2026`
- `CarFix!2026`
- `BlueSky#456`
- `Ocean$Wave99`

---

## ❌ BAD Passwords (Will Be Rejected)

These will fail:

- ❌ `Password123!` - Contains "password"
- ❌ `Test1234!` - Too simple
- ❌ `password123` - Contains "password"
- ❌ `Admin123!` - Contains "admin"
- ❌ `Welcome1!` - Contains "welcome"
- ❌ `Qwerty123!` - Contains "qwerty"

---

## Test Your Password

Before using the website, test if your password will work:

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
node test-password.js "YourPasswordHere"
```

Example:
```bash
node test-password.js "MySecret#2026"
```

You'll see if it passes all requirements!

---

## How to Register

### Option 1: Web Interface

1. Make sure client is running:
   ```bash
   cd /Users/bloom/Documents/src/chef/BCS/client
   npm run dev
   ```

2. Open: **http://localhost:5173/customer/register**

3. Fill in the form with:
   - **Name:** Your full name
   - **Email:** Valid email address
   - **Phone:** Any phone number
   - **Password:** Use a GOOD password from examples above
   - **Confirm Password:** Same as password

4. Click **Register**

### Option 2: Command Line (For Testing)

```bash
curl -X POST http://localhost:5138/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your@email.com",
    "password": "MySecret#2026",
    "phone": "555-1234"
  }'
```

---

## Troubleshooting

### "Registration failed" Error

**Cause:** Password doesn't meet requirements

**Solution:**
1. Test your password: `node test-password.js "YourPassword"`
2. Use a password that passes all checks
3. Avoid words like: password, test, admin, welcome, qwerty

### Check Created Users

See all registered users:
```bash
cd /Users/bloom/Documents/src/chef/BCS/server
node check-users.js
```

### Server Logs

View real-time server activity:
```bash
tail -f /private/tmp/claude-501/-Users-bloom-Documents-src-chef-BCS/tasks/b8eaee4.output
```

---

## Already Created Users

You already have these test accounts:

1. **test@example.com** - Password: `SecurePass123!`
2. **test3@example.com** - Password: `SecurePass123!`

You can log in with these at: http://localhost:5173/customer/login

---

## Summary

✅ Server is running perfectly
✅ Database is connected
✅ Registration API works
❌ Password validation is VERY STRICT

**Use a unique password without common words!**
