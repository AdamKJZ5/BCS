# 👑 Admin User Management Guide

This guide explains how to create and manage admin users for the Bellevue Collision Services system.

---

## 📋 Table of Contents

1. [Creating a New Admin User](#creating-a-new-admin-user)
2. [Promoting an Existing User to Admin](#promoting-an-existing-user-to-admin)
3. [Viewing All Users](#viewing-all-users)
4. [Admin Login](#admin-login)

---

## Creating a New Admin User

### Method 1: Interactive Mode (Recommended)

Run the script and answer the prompts:

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
node create-admin.js
```

You'll be asked for:
- **Full Name**: Admin's full name
- **Email**: Admin's email address
- **Phone**: Admin's phone number
- **Password**: Secure password (must meet requirements)

**Password Requirements:**
- ✅ At least 8 characters
- ✅ One uppercase letter
- ✅ One lowercase letter
- ✅ One number
- ✅ One special character (!@#$%^&*)

**Good password examples:**
- `AdminPass#2026`
- `SecureAdmin!99`
- `BCS@dmin2026`

### Method 2: Command Line Arguments

Provide all information in one command:

```bash
node create-admin.js "John Smith" "admin@bellevuecollision.com" "555-1234" "AdminPass#2026"
```

---

## Promoting an Existing User to Admin

If you already have a customer account and want to make it an admin:

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
node promote-to-admin.js user@example.com
```

Replace `user@example.com` with the actual email address.

**Example:**
```bash
node promote-to-admin.js john@example.com
```

**Output:**
```
✅ User promoted to admin successfully!

📋 User Details:
   Name:  John Doe
   Email: john@example.com
   Phone: 555-1234
   Role:  admin

🔐 They can now login at: http://localhost:5137/admin/login
```

---

## Viewing All Users

To see all users in the database and their roles:

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
node check-users.js
```

**Output:**
```
📊 Total Users in Database: 5
   👑 Admins: 2
   👤 Customers: 3

Users:
────────────────────────────────────────────────────────────────────────────────
1. John Smith [👑 ADMIN]
   Email: admin@bellevuecollision.com
   Phone: 555-1234
   Created: 2/7/2026, 10:30:00 AM

2. Jane Doe [👤 CUSTOMER]
   Email: jane@example.com
   Phone: 555-5678
   Created: 2/6/2026, 3:45:00 PM
```

---

## Admin Login

Once an admin user is created, they can log in at:

**🔐 Admin Login URL:**
```
http://localhost:5137/admin/login
```

**For production:**
```
https://your-domain.com/admin/login
```

### Admin Dashboard Access

After logging in, admins have access to:

- 📅 **Calendar** - View and manage all appointments
- 📊 **Dashboard** - System overview and statistics
- 💰 **Invoices** - Create and manage invoices
- 🚗 **Vehicles** - View all customer vehicles
- 📝 **Leads** - Manage contact form submissions
- ⭐ **Reviews** - Moderate customer reviews
- 🖼️ **Gallery** - Manage photo gallery
- ⚙️ **Settings** - Configure business settings

---

## Troubleshooting

### Error: "User already exists"

If you get this error, the email is already registered. You have two options:

1. **Use a different email:**
   ```bash
   node create-admin.js "Admin Name" "different@email.com" "555-1234" "SecurePass#2026"
   ```

2. **Promote the existing user to admin:**
   ```bash
   node promote-to-admin.js existing@email.com
   ```

### Error: "MONGO_URI not found"

Make sure you're running the script from the `server` directory and the `.env` file exists with a valid `MONGO_URI`.

```bash
cd /Users/bloom/Documents/src/chef/BCS/server
cat .env | grep MONGO_URI
```

### Error: "Password validation failed"

Your password doesn't meet the requirements. Make sure it has:
- At least 8 characters
- One uppercase letter (A-Z)
- One lowercase letter (a-z)
- One number (0-9)
- One special character (!@#$%^&*)

**Try one of these:**
- `AdminPass#2026`
- `SecureAdmin!99`
- `MyAdmin$2026`

---

## Security Best Practices

### Password Management

1. **Use strong, unique passwords** for admin accounts
2. **Never share admin credentials** in plain text
3. **Change passwords regularly** (every 90 days recommended)
4. **Use different passwords** for each admin user

### Access Control

1. **Create separate admin accounts** for each staff member
2. **Don't use customer accounts** as admin accounts
3. **Revoke admin access** when staff leaves
4. **Regularly audit** admin users (use `check-users.js`)

### Monitoring

1. **Review admin actions** regularly in logs
2. **Monitor failed login attempts** for admin accounts
3. **Set up alerts** for suspicious admin activity

---

## Quick Reference

| Task | Command |
|------|---------|
| Create new admin | `node create-admin.js` |
| Promote existing user | `node promote-to-admin.js email@example.com` |
| List all users | `node check-users.js` |
| Admin login page | `http://localhost:5137/admin/login` |

---

## Example Workflow

### Creating Your First Admin

```bash
# 1. Navigate to server directory
cd /Users/bloom/Documents/src/chef/BCS/server

# 2. Create admin user
node create-admin.js

# Follow prompts:
# Full Name: John Smith
# Email: admin@bellevuecollision.com
# Phone: 425-555-1234
# Password: AdminPass#2026

# 3. Verify creation
node check-users.js

# 4. Log in at http://localhost:5137/admin/login
```

### Converting a Customer to Admin

```bash
# 1. Check current users and find the email
node check-users.js

# 2. Promote the user
node promote-to-admin.js john.doe@example.com

# 3. Verify the change
node check-users.js
```

---

## Need Help?

If you encounter issues:

1. **Check server logs:**
   ```bash
   tail -f /tmp/bcs-server.log
   ```

2. **Verify MongoDB connection:**
   ```bash
   node test-mongodb-connection.js
   ```

3. **Test the scripts:**
   ```bash
   node check-users.js
   ```

---

## Summary

You now have three tools to manage admin users:

1. ✅ **create-admin.js** - Create new admin users from scratch
2. ✅ **promote-to-admin.js** - Upgrade existing users to admin
3. ✅ **check-users.js** - View all users and their roles

Use these scripts to set up your admin team and manage access to the Bellevue Collision Services system.
