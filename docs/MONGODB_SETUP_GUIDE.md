# MongoDB Atlas Setup Guide - Complete Deployment Guide

Complete step-by-step guide for setting up MongoDB Atlas for the Bellevue Collision Services website, from account creation to production deployment.

---

## Table of Contents

1. [Overview](#overview)
2. [MongoDB Atlas Account Setup](#mongodb-atlas-account-setup)
3. [Creating Your First Cluster](#creating-your-first-cluster)
4. [Database User Configuration](#database-user-configuration)
5. [Network Access Configuration](#network-access-configuration)
6. [Getting Your Connection String](#getting-your-connection-string)
7. [Connecting to MongoDB](#connecting-to-mongodb)
8. [Database Structure](#database-structure)
9. [Creating Admin User](#creating-admin-user)
10. [Security Best Practices](#security-best-practices)
11. [Backup Configuration](#backup-configuration)
12. [Monitoring & Alerts](#monitoring--alerts)
13. [Troubleshooting](#troubleshooting)
14. [Migration from Local to Atlas](#migration-from-local-to-atlas)

---

## Overview

### What is MongoDB Atlas?

MongoDB Atlas is the official cloud-hosted MongoDB service. It provides:
- **Fully Managed**: No server maintenance required
- **Automatic Backups**: Daily snapshots with point-in-time recovery
- **High Availability**: Built-in replication and failover
- **Global Distribution**: Deploy worldwide
- **Free Tier**: M0 cluster with 512MB storage (perfect for getting started)

### Why Use Atlas for BCS?

✅ No need to manage your own MongoDB server
✅ Automatic security patches and updates
✅ Built-in monitoring and alerts
✅ Easy scaling as your business grows
✅ Professional-grade reliability
✅ Free tier available for small projects

---

## MongoDB Atlas Account Setup

### Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**
   - Visit: https://www.mongodb.com/cloud/atlas/register

2. **Sign Up**
   - Choose one of these options:
     - Sign up with Google (recommended for easy access)
     - Sign up with email and password
   - Fill in your information:
     - First Name: Your first name
     - Last Name: Your last name
     - Email: Your business email
     - Password: Strong password (if not using Google)

3. **Verify Your Email**
   - Check your email inbox
   - Click the verification link
   - Complete email verification

4. **Complete Initial Survey** (Optional)
   - Select your experience level
   - Choose your goal: "Build a new application"
   - Select your preferred language: "JavaScript"
   - Click "Finish"

### Step 2: Create Organization

1. **Organization Setup**
   - Organization Name: `Bellevue Collision Services` (or your business name)
   - Click "Next"

2. **Create Project**
   - Project Name: `BCS Production` (or `BCS Website`)
   - Click "Next"

---

## Creating Your First Cluster

### Step 1: Choose Deployment Type

1. **From the Atlas Dashboard**
   - Click "Build a Database" or "Create"
   - You'll see three options:
     - **Serverless** (pay per use)
     - **Dedicated** (production workloads)
     - **Shared** (free tier - recommended to start)

2. **Select "Shared" (Free Tier)**
   - Click "Create" under the Shared option
   - This gives you:
     - 512 MB storage
     - Shared RAM
     - No credit card required
     - Perfect for small to medium websites

### Step 2: Configure Cluster

1. **Cloud Provider & Region**
   - **Provider**: AWS (recommended) or Google Cloud or Azure
   - **Region**: Choose closest to your customers
     - For Seattle area: `us-west-2` (Oregon) or `us-west-1` (N. California)
     - For US East Coast: `us-east-1` (Virginia)
     - For international: Choose nearest region
   - Look for "FREE TIER AVAILABLE" label

2. **Cluster Tier**
   - **M0 Sandbox** (Free Forever)
     - RAM: 512 MB
     - Storage: 512 MB
     - Perfect for getting started
   - **Note**: Can upgrade later if you need more storage

3. **Additional Settings** (Optional)
   - MongoDB Version: Use latest stable (default is fine)
   - Backup: Not available on free tier (can upgrade later)

4. **Cluster Name**
   - Default: `Cluster0`
   - Recommended: `bcs-production` or `bellevue-collision`
   - Click "Create Cluster"

5. **Wait for Cluster Creation**
   - Takes 3-10 minutes
   - You'll see "Your cluster is being created..." message
   - You can continue with next steps while waiting

---

## Database User Configuration

### Step 1: Create Database User

**Important**: This is the username/password that your application uses to connect to the database.

1. **Navigate to Database Access**
   - In left sidebar, click "Database Access" (under "Security")
   - Or click "QUICKSTART" if prompted

2. **Add New Database User**
   - Click "+ ADD NEW DATABASE USER"

3. **Choose Authentication Method**
   - Select "Password" (default and recommended)

4. **Set Username and Password**

   **Option A: Auto-generate Password (Recommended)**
   - Username: `bcs_app_user` or `bellevue_user`
   - Click "Autogenerate Secure Password"
   - **IMPORTANT**: Click "Copy" and save password immediately!
     - Save in password manager or secure note
     - You won't be able to see it again!

   **Option B: Custom Password**
   - Username: `bcs_app_user`
   - Password: Create strong password
     - At least 12 characters
     - Mix of upper/lowercase, numbers, symbols
     - No spaces or special characters like `@`, `#`, `:`, `/`
     - Example: `BCS2026secure!Pass`

5. **Set Database User Privileges**

   **For Production (Recommended)**:
   - Built-in Role: "Read and write to any database"

   **For Extra Security (Advanced)**:
   - Click "Specific Privileges"
   - Database: Select your database name (create one if needed)
   - Collection: Leave blank for all collections
   - Privilege: "readWrite"

6. **Temporary User (Optional)**
   - Restrict Access For: Leave as "Indefinite" for production
   - Or set expiration date for temporary access

7. **Click "Add User"**

### Step 2: Save Your Credentials Securely

Create a temporary note with:
```
MongoDB Atlas Credentials
========================
Cluster: bcs-production
Username: bcs_app_user
Password: [your generated password]
Created: [today's date]
```

**Security Note**: Never commit these credentials to git or share publicly!

---

## Network Access Configuration

By default, MongoDB Atlas blocks all connections. You must whitelist IP addresses.

### Option 1: Allow Access from Anywhere (Easiest for Getting Started)

⚠️ **Warning**: Less secure but works with dynamic IPs

1. **Navigate to Network Access**
   - Click "Network Access" in left sidebar (under "Security")

2. **Add IP Address**
   - Click "+ ADD IP ADDRESS"
   - Click "ALLOW ACCESS FROM ANYWHERE"
   - IP Address will show: `0.0.0.0/0`
   - Comment: "Allow all IPs - Development"
   - Click "Confirm"

3. **Wait for Activation**
   - Status will change from "Pending" to "Active"
   - Takes about 1-2 minutes

### Option 2: Specific IP Addresses (More Secure)

Recommended for production if you have static IPs.

1. **Find Your Server's IP Address**

   **For cloud hosting**:
   - Heroku: Use `0.0.0.0/0` (Heroku IPs change)
   - Railway: Check your deployment IP in dashboard
   - DigitalOcean: Use your droplet's IP
   - AWS EC2: Use your instance's Elastic IP

2. **Add Your IP Addresses**
   - Click "+ ADD IP ADDRESS"
   - Click "ADD CURRENT IP ADDRESS" (adds your computer)
   - Or manually enter IP address
   - Add comment: "Office" or "Production Server"
   - Click "Confirm"

3. **Add Multiple IPs if Needed**
   - Development machine IP
   - Production server IP
   - Office network IP
   - Backup server IP

### Option 3: Cloud Provider Integration (Advanced)

For AWS, Azure, or Google Cloud deployments.

1. **Set Up VPC Peering**
   - Click "Peering" tab
   - Follow provider-specific instructions

---

## Getting Your Connection String

### Step 1: Navigate to Connect

1. **Go to Database Deployments**
   - Click "Database" in left sidebar
   - Wait for cluster status: "Active" (green)

2. **Click Connect**
   - Find your cluster (e.g., `bcs-production`)
   - Click "Connect" button

### Step 2: Choose Connection Method

1. **Select "Connect your application"**
   - Don't choose Compass or Shell for now
   - Click "Connect your application"

2. **Select Driver and Version**
   - Driver: **Node.js**
   - Version: **5.5 or later** (or whatever is latest)

3. **Copy Connection String**
   - You'll see a connection string like:
   ```
   mongodb+srv://<username>:<password>@bcs-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Click "Copy" button

### Step 3: Format Your Connection String

1. **Replace `<username>`** with your database username:
   ```
   mongodb+srv://bcs_app_user:<password>@bcs-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

2. **Replace `<password>`** with your actual password:
   ```
   mongodb+srv://bcs_app_user:BCS2026secure!Pass@bcs-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. **Add Database Name** (optional but recommended):

   Add database name before the `?`:
   ```
   mongodb+srv://bcs_app_user:BCS2026secure!Pass@bcs-production.xxxxx.mongodb.net/bellevue-collision?retryWrites=true&w=majority
   ```

4. **Add App Name** (optional):
   ```
   mongodb+srv://bcs_app_user:BCS2026secure!Pass@bcs-production.xxxxx.mongodb.net/bellevue-collision?retryWrites=true&w=majority&appName=BCS-Website
   ```

### Connection String Format Explained

```
mongodb+srv://          ← Protocol (uses SRV DNS lookup)
bcs_app_user            ← Your database username
:                       ← Separator
BCS2026secure!Pass      ← Your password
@                       ← Separator
bcs-production.xxxxx    ← Your cluster hostname
.mongodb.net            ← MongoDB Atlas domain
/bellevue-collision     ← Database name (optional)
?                       ← Query parameters start
retryWrites=true        ← Automatically retry failed writes
&w=majority             ← Write concern (wait for majority acknowledgment)
&appName=BCS-Website    ← Application identifier
```

---

## Connecting to MongoDB

### Step 1: Update Environment Variables

1. **Open your `.env` file**
   ```bash
   cd /Users/bloom/Documents/src/chef/BCS/server
   nano .env
   ```

   Or use your code editor.

2. **Update MONGO_URI**

   **Replace this**:
   ```env
   MONGO_URI=mongodb://localhost:27017/autobody-leads
   ```

   **With your Atlas connection string**:
   ```env
   MONGO_URI=mongodb+srv://bcs_app_user:BCS2026secure!Pass@bcs-production.xxxxx.mongodb.net/bellevue-collision?retryWrites=true&w=majority&appName=BCS-Website
   ```

3. **Save the file**

### Step 2: Test Connection Locally

1. **Stop your server** if it's running (Ctrl+C)

2. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

3. **Check the logs**

   **Success** looks like:
   ```
   [INFO] MongoDB connected successfully
   [INFO] Server running on port 5138
   ```

   **Failure** looks like:
   ```
   [ERROR] MongoDB connection failed: MongoServerError: bad auth
   ```

### Step 3: Verify Connection

1. **Check MongoDB Atlas Dashboard**
   - Go to Database → Cluster → Metrics
   - You should see connection count increase
   - Look for "Current Connections" metric

2. **Test Through Your Application**
   - Go to `http://localhost:5173/contact`
   - Submit a test lead
   - Check if it appears in your database

---

## Database Structure

### Viewing Your Database in Atlas

1. **Navigate to Browse Collections**
   - Click "Database" in left sidebar
   - Click "Browse Collections" button on your cluster

2. **You Should See These Collections**:
   ```
   bellevue-collision (database)
   ├── users
   ├── leads
   ├── appointments
   ├── invoices
   ├── vehicles
   ├── servicerecords
   ├── reviews
   ├── galleryphotos
   ├── notifications
   ├── settings
   └── payments
   ```

3. **If Database is Empty**
   - Collections are created automatically when first document is inserted
   - Submit a test lead through your website to create initial data

### Sample Document Structure

**Users Collection**:
```json
{
  "_id": "ObjectId('...')",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$encrypted...",
  "role": "customer",
  "needsPasswordSetup": false,
  "createdAt": "2026-02-02T12:00:00.000Z"
}
```

**Leads Collection**:
```json
{
  "_id": "ObjectId('...')",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "(206) 555-1234",
  "message": "Need front bumper repair",
  "serviceType": "Collision Repair",
  "status": "new",
  "photos": ["photo1.jpg", "photo2.jpg"],
  "adminNotes": [],
  "createdAt": "2026-02-02T12:00:00.000Z"
}
```

---

## Creating Admin User

**Important**: There's no admin registration UI. You must create admin users manually in the database.

### Method 1: Using MongoDB Atlas Web Interface

1. **Navigate to Browse Collections**
   - Database → Browse Collections

2. **Select Users Collection**
   - Click on `users` collection

3. **Insert Document**
   - Click "INSERT DOCUMENT"
   - Switch to "JSON" view (if available)

4. **Paste This Template**
   ```json
   {
     "name": "Admin User",
     "email": "admin@bellevuecollision.com",
     "password": "$2b$10$YourHashedPasswordHere",
     "role": "admin",
     "needsPasswordSetup": false,
     "createdAt": {
       "$date": "2026-02-02T12:00:00.000Z"
     }
   }
   ```

5. **Generate Password Hash**

   You need to hash your password first. Create a file `hash-password.js`:

   ```javascript
   const bcrypt = require('bcrypt');

   const password = 'YourSecureAdminPassword123!';
   const salt = bcrypt.genSaltSync(10);
   const hash = bcrypt.hashSync(password, salt);

   console.log('Password:', password);
   console.log('Hash:', hash);
   ```

   Run it:
   ```bash
   cd server
   node hash-password.js
   ```

   Copy the hash output.

6. **Update and Insert**
   - Replace `$2b$10$YourHashedPasswordHere` with your hash
   - Update name and email
   - Click "Insert"

### Method 2: Using MongoDB Compass (GUI Tool)

1. **Download MongoDB Compass**
   - Go to: https://www.mongodb.com/products/compass
   - Download and install

2. **Connect to Atlas**
   - Open Compass
   - Paste your connection string
   - Click "Connect"

3. **Navigate to Users Collection**
   - Select `bellevue-collision` database
   - Click `users` collection

4. **Add Document**
   - Click "ADD DATA" → "Insert Document"
   - Paste JSON (use same template as Method 1)
   - Click "Insert"

### Method 3: Using Node.js Script (Recommended)

Create `/server/scripts/create-admin.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../src/models/User').default;

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bellevuecollision.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const password = 'ChangeThisPassword123!'; // CHANGE THIS!
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bellevuecollision.com', // CHANGE THIS!
      password: hashedPassword,
      role: 'admin',
      needsPasswordSetup: false,
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('⚠️  REMEMBER TO CHANGE THIS PASSWORD AFTER FIRST LOGIN!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
```

Run the script:
```bash
cd server
node scripts/create-admin.js
```

### Step 4: Test Admin Login

1. **Go to admin login**
   - Navigate to: `http://localhost:5173/admin/login`

2. **Login with credentials**
   - Email: `admin@bellevuecollision.com`
   - Password: The password you set

3. **Change Password**
   - After first login, create a secure password
   - Store in password manager

---

## Security Best Practices

### 1. Secure Connection Strings

**DO NOT**:
- ❌ Commit `.env` to git
- ❌ Share connection strings in chat/email
- ❌ Hardcode credentials in code
- ❌ Use weak passwords

**DO**:
- ✅ Use `.env` files (already in `.gitignore`)
- ✅ Store credentials in password manager
- ✅ Use environment variables in production
- ✅ Rotate passwords every 90 days

### 2. Network Security

**Free Tier Recommendations**:
- Use `0.0.0.0/0` during development
- Add specific IPs once you know your hosting IPs

**Production Recommendations**:
- Whitelist only your server's IP
- Remove `0.0.0.0/0` after deployment
- Use VPC peering for cloud deployments

### 3. User Permissions

**Principle of Least Privilege**:
- Application user: `readWrite` to specific database only
- Don't use `atlasAdmin` role for application
- Create separate users for different environments:
  - `bcs_production_user` → Production database
  - `bcs_staging_user` → Staging database
  - `bcs_dev_user` → Development database

### 4. Password Requirements

**Strong Passwords**:
- Minimum 12 characters
- Mix of upper/lowercase letters
- Include numbers and symbols
- No dictionary words
- Use password generator

**Example Good Passwords**:
- `Bcs#2026$Secure!Mongo`
- `CollisionDB@2026!Safe`
- `Atlas#BCS$Production26`

### 5. Connection String Security

**URL Encoding**:

If your password contains special characters, they must be URL-encoded:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `[` | `%5B` |
| `]` | `%5D` |
| `!` | `%21` |

Example:
```
Password: BCS@2026!
Encoded: BCS%402026%21
```

**Better**: Avoid special characters that need encoding when creating passwords.

---

## Backup Configuration

### Free Tier (M0) Limitations

❌ No automatic backups on free tier
❌ No point-in-time recovery
❌ No snapshots

**Upgrade to M2 or higher** for backup features.

### Manual Backup Strategies

#### Option 1: Manual mongodump

Create backup script `/server/scripts/backup-mongodb.sh`:

```bash
#!/bin/bash

# MongoDB Atlas Connection String
MONGO_URI="your_connection_string_here"

# Backup directory
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

# Create backup
echo "📦 Creating backup..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR"

echo "✅ Backup completed: $BACKUP_DIR"
```

Run manually:
```bash
cd server/scripts
chmod +x backup-mongodb.sh
./backup-mongodb.sh
```

#### Option 2: Export Collections via Atlas UI

1. Go to Database → Browse Collections
2. Select a collection
3. Click "Export Collection"
4. Download as JSON or CSV
5. Save to secure location

#### Option 3: Upgrade to Paid Tier

**M2 Cluster** ($9/month):
- Automated daily backups
- 2 days retention
- Point-in-time recovery

**M10+ Cluster**:
- Continuous backups
- Custom retention periods
- Instant recovery

### Backup Best Practices

✅ **Run weekly manual backups** (if on free tier)
✅ **Store backups in multiple locations** (local + cloud)
✅ **Test restoration process** quarterly
✅ **Encrypt backup files** before storing
✅ **Document restoration procedures**

---

## Monitoring & Alerts

### Real-Time Monitoring

1. **Navigate to Metrics**
   - Database → Your Cluster → Metrics tab

2. **Key Metrics to Monitor**:
   - **Connections**: Current active connections
   - **Network**: Data transferred in/out
   - **Operations**: Reads/writes per second
   - **Query Performance**: Slow queries
   - **Storage**: Disk space used

### Setting Up Alerts

1. **Navigate to Alerts**
   - Click "Alerts" in left sidebar

2. **Create Alert**
   - Click "CREATE ALERT"

3. **Recommended Alerts**:

   **Storage Alert**:
   - Condition: "Disk space used" > 80%
   - Notification: Email
   - Threshold: 400 MB (for 512 MB free tier)

   **Connection Alert**:
   - Condition: "Connections" > 400
   - Note: Free tier has 500 connection limit

   **Error Alert**:
   - Condition: "Authentication failures" > 10 per hour
   - Could indicate attack attempt

4. **Set Notification Channels**
   - Email: Your business email
   - SMS: Optional (requires phone verification)
   - Webhook: For integration with Slack/PagerDuty

### Performance Insights

1. **Go to Performance Advisor**
   - Database → Your Cluster → Performance Advisor

2. **Review Recommendations**
   - Suggested indexes
   - Slow queries
   - Schema optimization

3. **Enable Profiler** (M10+ only)
   - Tracks all database operations
   - Identifies performance bottlenecks

---

## Troubleshooting

### Error: "bad auth Authentication failed"

**Cause**: Wrong username or password

**Solutions**:
1. Verify username matches exactly (case-sensitive)
2. Check password is correct (no extra spaces)
3. URL-encode special characters in password
4. Recreate database user with simpler password

### Error: "connection timed out" or "ECONNREFUSED"

**Cause**: IP not whitelisted or network issues

**Solutions**:
1. Check Network Access in Atlas
2. Add your IP address: `0.0.0.0/0` (temporary)
3. Wait 2-3 minutes for changes to propagate
4. Check your firewall isn't blocking port 27017
5. Try different network (mobile hotspot to test)

### Error: "Server selection timed out"

**Cause**: Cluster not active or wrong connection string

**Solutions**:
1. Verify cluster status is "Active" (not paused)
2. Check connection string format
3. Ensure `mongodb+srv://` protocol (not `mongodb://`)
4. Verify cluster hostname is correct

### Error: "not authorized on admin to execute command"

**Cause**: User doesn't have required permissions

**Solutions**:
1. Check Database Access → User privileges
2. Grant "readWrite" to your database
3. Or use "Read and write to any database" role
4. Wait 2-3 minutes for permissions to update

### Error: "MongooseServerSelectionError"

**Cause**: Can't reach MongoDB servers

**Solutions**:
1. Check internet connection
2. Verify cluster is running (not paused)
3. Check Network Access whitelist
4. Try connecting from different network
5. Check Atlas status: https://status.mongodb.com/

### Cluster Paused (Free Tier)

**Cause**: Free tier clusters pause after 60 days of inactivity

**Solutions**:
1. Log in to Atlas
2. Go to your cluster
3. Click "Resume" button
4. Wait 3-5 minutes for cluster to wake up

### Connection Working Locally But Not in Production

**Cause**: Production server IP not whitelisted

**Solutions**:
1. Find your production server's IP address
2. Add to Network Access in Atlas
3. Or temporarily use `0.0.0.0/0` to test
4. Check production environment variables are set correctly

---

## Migration from Local to Atlas

### Step 1: Backup Local Database

```bash
# Backup local MongoDB
mongodump --uri="mongodb://localhost:27017/autobody-leads" --out="./backup"
```

### Step 2: Restore to Atlas

```bash
# Restore to Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/bellevue-collision" ./backup/autobody-leads
```

### Step 3: Verify Data

1. Check Atlas Browse Collections
2. Verify document counts match
3. Test application functionality

### Alternative: Export/Import Single Collection

```bash
# Export from local
mongoexport --uri="mongodb://localhost:27017/autobody-leads" --collection=users --out=users.json

# Import to Atlas
mongoimport --uri="mongodb+srv://user:pass@cluster.mongodb.net/bellevue-collision" --collection=users --file=users.json
```

---

## Production Deployment Checklist

Before launching to production:

### Database Configuration
- [ ] MongoDB Atlas account created
- [ ] Production cluster created and active
- [ ] Database user created with strong password
- [ ] Network access configured (specific IPs preferred)
- [ ] Connection string tested and working
- [ ] Database name set in connection string

### Security
- [ ] Strong passwords used (12+ characters)
- [ ] Credentials stored securely (password manager)
- [ ] `.env` file not committed to git
- [ ] Environment variables set in hosting platform
- [ ] IP whitelist configured (not just 0.0.0.0/0)
- [ ] User permissions set to least privilege

### Data
- [ ] Admin user created
- [ ] Admin login tested
- [ ] Sample data imported (if needed)
- [ ] All collections visible in Atlas
- [ ] Indexes created (automatic on first use)

### Monitoring
- [ ] Alerts configured (storage, connections)
- [ ] Email notifications set up
- [ ] Monitoring dashboard reviewed
- [ ] Performance advisor checked

### Backup
- [ ] Backup strategy documented
- [ ] Manual backup script created (if free tier)
- [ ] Or upgrade to M2+ for automatic backups
- [ ] Restoration procedure tested

### Testing
- [ ] Connection test successful
- [ ] Create operation works (submit lead)
- [ ] Read operation works (view dashboard)
- [ ] Update operation works (change lead status)
- [ ] Delete operation works (if applicable)
- [ ] Authentication works (login/logout)

---

## Environment Variables Reference

### Development (.env)

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://bcs_dev_user:password@bcs-dev.xxxxx.mongodb.net/bellevue-collision-dev?retryWrites=true&w=majority

# Server Configuration
PORT=5138
NODE_ENV=development

# Other configs...
```

### Production (.env.production)

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://bcs_prod_user:SecurePassword123!@bcs-production.xxxxx.mongodb.net/bellevue-collision?retryWrites=true&w=majority&appName=BCS-Production

# Server Configuration
PORT=5138
NODE_ENV=production

# Other configs...
```

---

## Cost Considerations

### Free Tier (M0)

**Included**:
- 512 MB storage
- Shared RAM
- Shared vCPU
- 500 connections max
- No backups

**Good For**:
- Development
- Small websites (<100 active users)
- Testing/staging
- Personal projects

### When to Upgrade

**Signs You Need More**:
- ⚠️ Storage >80% (>400 MB used)
- ⚠️ Connection errors (hitting 500 limit)
- ⚠️ Slow queries (need dedicated resources)
- ⚠️ Need automated backups
- ⚠️ Business-critical application

### Pricing Tiers

| Tier | Price/Month | RAM | Storage | Backups |
|------|-------------|-----|---------|---------|
| M0 | Free | Shared | 512 MB | No |
| M2 | ~$9 | 2 GB | 2 GB | Yes |
| M5 | ~$25 | 2 GB | 5 GB | Yes |
| M10 | ~$57 | 2 GB | 10 GB | Yes |
| M20 | ~$150 | 4 GB | 20 GB | Yes |

**Recommendation**: Start with M0 free tier, upgrade to M2 when needed.

---

## Additional Resources

### Official Documentation
- Atlas Getting Started: https://docs.atlas.mongodb.com/getting-started/
- Connection Strings: https://docs.mongodb.com/manual/reference/connection-string/
- Security Best Practices: https://docs.atlas.mongodb.com/security-best-practices/

### Tools
- MongoDB Compass: https://www.mongodb.com/products/compass
- MongoDB Shell: https://docs.mongodb.com/mongodb-shell/
- VS Code Extension: Search "MongoDB" in VS Code extensions

### Support
- Atlas Support: https://support.mongodb.com/
- Community Forums: https://community.mongodb.com/
- Stack Overflow: Tag `mongodb-atlas`

---

## Quick Reference Commands

### Test Connection
```bash
cd server
npm run dev
# Look for "MongoDB connected successfully"
```

### Create Admin User
```bash
cd server
node scripts/create-admin.js
```

### Backup Database (if mongodump installed)
```bash
mongodump --uri="YOUR_CONNECTION_STRING" --out="./backup"
```

### Restore Database
```bash
mongorestore --uri="YOUR_CONNECTION_STRING" ./backup/database-name
```

### Check Connection from Node.js
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err.message));
```

---

## Need Help?

If you're still having issues:

1. **Check Atlas Status**: https://status.mongodb.com/
2. **Review Error Logs**: Check server console output
3. **Verify All Steps**: Go through checklist above
4. **Test Connection String**: Use MongoDB Compass to test
5. **Contact Support**: Atlas has free support for connection issues

---

**Last Updated**: February 2, 2026
**Version**: 1.0
**Maintained For**: Bellevue Collision Services Website
**MongoDB Version**: 6.0+
**Node.js Driver**: 5.5+

---

## Summary

You now have a complete guide to:
✅ Create MongoDB Atlas account
✅ Set up free tier cluster
✅ Configure database users
✅ Whitelist IP addresses
✅ Get connection string
✅ Connect your application
✅ Create admin users
✅ Secure your database
✅ Monitor and maintain
✅ Troubleshoot common issues

**Next Steps**:
1. Follow this guide to set up your MongoDB Atlas cluster
2. Update your `.env` file with the connection string
3. Create your first admin user
4. Test the connection
5. Deploy to production!

Good luck with your deployment! 🚀
