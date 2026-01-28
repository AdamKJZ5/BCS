# Bellevue Collision Services - Deployment Guide

This guide provides step-by-step instructions for deploying the Bellevue Collision Services website to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Creating Admin Users](#creating-admin-users)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Services

1. **MongoDB Atlas** (recommended) or self-hosted MongoDB
   - Free tier available at https://www.mongodb.com/atlas
   - Recommended for production use

2. **Email Service**
   - Gmail with App Password, OR
   - SendGrid, Mailgun, or similar SMTP service
   - Required for lead notifications and customer signup emails

3. **Hosting Provider** (choose one)
   - **Backend**: Heroku, Railway, Render, DigitalOcean, AWS
   - **Frontend**: Vercel, Netlify, Cloudflare Pages, or same as backend
   - **Both**: Can be hosted together or separately

4. **Domain Name** (optional but recommended)
   - Example: bellevuecollisionservices.com

### Software Requirements

- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- Git (for deployment via Git)

---

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```bash
# Node Environment
NODE_ENV=production

# Server Port
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bellevue-collision?retryWrites=true&w=majority

# JWT Secret (CRITICAL - MUST BE SECURE)
JWT_SECRET=<generate-with-crypto-randomBytes-64-hex>

# Email Configuration
EMAIL_USER=your-business-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# CORS Configuration
CORS_ORIGIN=https://www.bellevuecollisionservices.com

# Base URL (for photo URLs and email links)
BASE_URL=https://api.bellevuecollisionservices.com
```

#### Generating JWT_SECRET

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

#### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and your device
4. Generate password
5. Use the generated 16-character password as `EMAIL_PASSWORD`

### Frontend Environment Variables

Create a `.env` file in the `client/` directory:

```bash
# API Base URL (your backend server URL)
VITE_API_BASE_URL=https://api.bellevuecollisionservices.com
```

---

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create Account**
   - Visit https://www.mongodb.com/atlas
   - Sign up for free tier (M0)

2. **Create Cluster**
   - Choose cloud provider and region (closest to your users)
   - Wait for cluster to be provisioned (2-5 minutes)

3. **Create Database User**
   - Navigate to Database Access
   - Click "Add New Database User"
   - Choose password authentication
   - Save username and password securely

4. **Configure Network Access**
   - Navigate to Network Access
   - Click "Add IP Address"
   - For production: "Allow Access from Anywhere" (0.0.0.0/0)
   - Note: More restrictive for better security

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `bellevue-collision`

### Option 2: Self-Hosted MongoDB

If running your own MongoDB server:

```bash
MONGO_URI=mongodb://localhost:27017/bellevue-collision
```

Or for replica set:

```bash
MONGO_URI=mongodb://host1:27017,host2:27017,host3:27017/bellevue-collision?replicaSet=myReplicaSet
```

---

## Backend Deployment

### Deployment Platform Options

#### Option A: Railway (Recommended - Simple & Fast)

1. **Sign up at https://railway.app**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Root Directory**
   - Settings → Service Settings
   - Set Root Directory to `server`

4. **Add Environment Variables**
   - Variables tab
   - Add all backend env variables from above

5. **Configure Build & Start**
   - Railway auto-detects Node.js
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Generate Domain**
   - Settings → Generate Domain
   - Copy the generated URL (e.g., `https://your-app.up.railway.app`)
   - This is your `BASE_URL` and API URL

#### Option B: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd server/
   heroku create bellevue-collision-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-here
   heroku config:set MONGO_URI=your-mongodb-uri
   heroku config:set EMAIL_USER=your-email
   heroku config:set EMAIL_PASSWORD=your-password
   heroku config:set CORS_ORIGIN=https://your-frontend.com
   heroku config:set BASE_URL=https://your-app.herokuapp.com
   ```

4. **Deploy**
   ```bash
   git subtree push --prefix server heroku main
   ```

#### Option C: DigitalOcean App Platform

1. **Create New App** at https://cloud.digitalocean.com/apps

2. **Connect Repository**
   - Choose GitHub
   - Select repository
   - Set source directory to `server`

3. **Configure App**
   - Run Command: `npm run build && npm start`
   - HTTP Port: 5000

4. **Add Environment Variables**
   - Add all backend env variables

5. **Deploy**

### Verify Backend Deployment

After deployment, test your API:

```bash
curl https://your-api-domain.com/health
```

Should return: `{"status":"ok"}`

---

## Frontend Deployment

### Deployment Platform Options

#### Option A: Vercel (Recommended for Frontend)

1. **Sign up at https://vercel.com**

2. **Import Project**
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variable**
   - Environment Variables section
   - Add `VITE_API_BASE_URL` with your backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your production URL

#### Option B: Netlify

1. **Sign up at https://netlify.com**

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select repository

3. **Configure Build**
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`

4. **Environment Variables**
   - Site Settings → Environment Variables
   - Add `VITE_API_BASE_URL`

5. **Deploy**

#### Option C: Cloudflare Pages

1. **Sign up at https://pages.cloudflare.com**

2. **Create Project**
   - Connect GitHub account
   - Select repository

3. **Build Settings**
   - Production branch: `main`
   - Build command: `cd client && npm run build`
   - Build output directory: `client/dist`

4. **Environment Variables**
   - Add `VITE_API_BASE_URL`

5. **Deploy**

### Custom Domain Setup

1. **Add Custom Domain** in your hosting dashboard
2. **Update DNS Records** with your domain registrar:
   - Add A record or CNAME record as instructed
3. **Wait for DNS propagation** (can take up to 48 hours)
4. **Update CORS_ORIGIN** in backend .env to match your domain

---

## Post-Deployment Configuration

### 1. Update Backend CORS_ORIGIN

After deploying frontend, update your backend environment variable:

```bash
CORS_ORIGIN=https://www.bellevuecollisionservices.com
```

Redeploy backend if needed.

### 2. Update Email Links

Verify that `BASE_URL` in backend .env is set to your production API URL. This ensures customer signup emails have correct links.

### 3. Test File Uploads

Ensure the `uploads/` directory exists and has write permissions:

```bash
mkdir -p uploads
chmod 755 uploads
```

For cloud platforms, uploads are typically stored in the filesystem, but consider using cloud storage (S3, Cloudinary) for production.

### 4. Configure SSL/HTTPS

Most modern hosting platforms (Vercel, Netlify, Railway) automatically provide SSL certificates. Verify your site loads with `https://`.

---

## Creating Admin Users

After deployment, you need to create admin users manually in the database.

### Method 1: MongoDB Compass (GUI)

1. **Install MongoDB Compass**: https://www.mongodb.com/products/compass
2. **Connect to Database** using your `MONGO_URI`
3. **Navigate to** `bellevue-collision` database → `users` collection
4. **Insert Document** with this structure:

```json
{
  "name": "Admin User",
  "email": "admin@bellevuecollisionservices.com",
  "password": "$2b$10$hashed-password-here",
  "role": "admin",
  "needsPasswordSetup": false,
  "createdAt": { "$date": "2024-01-23T00:00:00.000Z" }
}
```

5. **Hash the Password** first using bcrypt:

```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash('YourSecurePassword123!', 10);
console.log(hashedPassword);
```

### Method 2: MongoDB Shell

1. **Connect to MongoDB**:
   ```bash
   mongosh "your-mongodb-uri"
   ```

2. **Switch to Database**:
   ```javascript
   use bellevue-collision
   ```

3. **Create Admin User** (after hashing password):
   ```javascript
   db.users.insertOne({
     name: "Admin User",
     email: "admin@bellevuecollisionservices.com",
     password: "$2b$10$hashed-password-here",
     role: "admin",
     needsPasswordSetup: false,
     createdAt: new Date()
   })
   ```

### Method 3: Create Admin Script

Create a script `server/scripts/createAdmin.js`:

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  needsPasswordSetup: Boolean,
  createdAt: Date,
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const hashedPassword = await bcrypt.hash('YourSecurePassword123!', 10);
  
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@bellevuecollisionservices.com',
    password: hashedPassword,
    role: 'admin',
    needsPasswordSetup: false,
    createdAt: new Date(),
  });
  
  console.log('Admin user created:', admin.email);
  await mongoose.disconnect();
}

createAdmin().catch(console.error);
```

Run with: `node --loader ts-node/esm scripts/createAdmin.js`

---

## Troubleshooting

### Backend Issues

**Error: Cannot connect to MongoDB**
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist includes your server IP
- Ensure database user has correct permissions

**Error: JWT malformed**
- Verify `JWT_SECRET` is set in production environment
- Check that frontend is sending correct token format

**Error: Email not sending**
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- For Gmail, ensure App Password is used (not regular password)
- Check SMTP settings for your email provider

**Error: File upload failed**
- Ensure `uploads/` directory exists with write permissions
- Check disk space on server
- Verify `BASE_URL` is set correctly

### Frontend Issues

**Error: API request failed**
- Verify `VITE_API_BASE_URL` is set correctly
- Check CORS configuration on backend
- Ensure backend is running and accessible

**Error: Images not loading**
- Verify image URLs are absolute (include BASE_URL)
- Check backend `/uploads` endpoint is accessible
- Ensure CORS allows image requests

**Error: Authentication not persisting**
- Check localStorage is working (not disabled)
- Verify JWT tokens are valid and not expired
- Check that AuthContext is wrapping entire app

### Performance Issues

**Slow page loads**
- Optimize images (compress before upload)
- Enable CDN for static assets
- Consider lazy loading for gallery images

**Database queries slow**
- Add indexes to frequently queried fields
- Limit query results with pagination
- Use MongoDB Atlas performance monitoring

---

## Production Checklist

Before going live, verify:

- [ ] All environment variables are set in production
- [ ] JWT_SECRET is secure and different from development
- [ ] CORS_ORIGIN is set to production domain (not *)
- [ ] MongoDB is using Atlas or secured self-hosted instance
- [ ] Email notifications are working
- [ ] SSL/HTTPS is enabled on both frontend and backend
- [ ] Admin user(s) created in database
- [ ] File uploads are working correctly
- [ ] All pages load without errors
- [ ] Customer registration and login work
- [ ] Admin login and dashboard work
- [ ] Lead submission sends emails
- [ ] Gallery photos display correctly
- [ ] Mobile responsive design verified
- [ ] SEO meta tags are present
- [ ] Error pages (404, 500) are styled
- [ ] Performance is acceptable (PageSpeed Insights)
- [ ] Analytics installed (Google Analytics, etc.)
- [ ] Monitoring enabled (error tracking, uptime monitoring)

---

## Monitoring & Maintenance

### Recommended Tools

1. **Uptime Monitoring**
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

2. **Error Tracking**
   - Sentry (free tier available)
   - Rollbar
   - LogRocket

3. **Analytics**
   - Google Analytics
   - Plausible
   - Fathom

4. **Performance**
   - Google PageSpeed Insights
   - Lighthouse
   - WebPageTest

### Regular Maintenance

- **Weekly**: Check error logs and uptime reports
- **Monthly**: Review database size and performance
- **Quarterly**: Update npm dependencies
- **Annually**: Renew domain and SSL certificates (if manual)

---

## Security Best Practices

1. **Never commit `.env` files** - Use `.gitignore`
2. **Use strong JWT_SECRET** - 64+ character random string
3. **Rotate secrets regularly** - Change JWT_SECRET every 6-12 months
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use HTTPS everywhere** - Enforce SSL/TLS
6. **Implement rate limiting** - Already configured for `/api/leads`
7. **Validate all inputs** - Already implemented on backend
8. **Sanitize user uploads** - Consider file type restrictions
9. **Monitor for suspicious activity** - Review admin logs
10. **Backup database regularly** - MongoDB Atlas auto-backup recommended

---

## Support

For issues or questions:
- Check the TESTING_CHECKLIST.md for verification steps
- Review error logs in your hosting platform
- Check MongoDB Atlas logs for database issues
- Verify all environment variables are set correctly

---

## Version History

- **v1.0** - Initial deployment guide
- Includes: Customer portal, admin panel, gallery, lead management, settings
