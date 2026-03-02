# Resend Email Setup Guide - Complete Walkthrough

Simple, step-by-step guide to set up Resend for sending emails from your BCS website.

---

## Why Resend?

✅ **Simple Setup**: No 2FA, no app passwords, no confusion
✅ **Free Tier**: 3,000 emails/month, 100/day
✅ **Reliable**: Better deliverability than Gmail
✅ **Developer-Friendly**: Modern API, great docs
✅ **Fast**: Setup in 10 minutes
✅ **Production-Ready**: Used by professional applications

---

## What You'll Need

- A valid email address (Gmail works fine)
- 10 minutes
- Internet connection

---

## Step 1: Create Resend Account

### 1.1: Go to Resend Website

Open your browser and visit:
```
https://resend.com/
```

### 1.2: Sign Up

You'll see the Resend homepage with a signup button.

**Click** one of these buttons:
- **"Start Building"**
- **"Sign Up"**
- **"Get Started"**

### 1.3: Choose Signup Method

You have three options:

**Option A: Sign Up with GitHub (Recommended)**
- Click "Continue with GitHub"
- Authorize Resend to access your GitHub account
- Fastest method if you have GitHub

**Option B: Sign Up with Google**
- Click "Continue with Google"
- Select your Google account
- Quick and easy

**Option C: Sign Up with Email**
- Enter your email address
- Create a password
- You'll need to verify your email

### 1.4: Verify Your Email (If Using Email Signup)

If you signed up with email:
1. Check your inbox
2. Look for email from Resend
3. Click the verification link
4. You'll be redirected to Resend dashboard

### 1.5: Complete Onboarding (If Prompted)

Resend might ask a few questions:
- **What will you use Resend for?**: "Transactional emails"
- **What's your role?**: "Developer" or "Business Owner"
- **Company name**: "Bellevue Collision Services" (optional)

Click **"Continue"** or **"Skip"** to proceed to dashboard.

---

## Step 2: Create API Key

### 2.1: Navigate to API Keys

Once logged in to your Resend dashboard:

1. Look at the **left sidebar**
2. Find and click **"API Keys"**
   - Icon looks like a key 🔑
3. You'll see the API Keys page

### 2.2: Create New API Key

1. **Click** the button:
   - **"+ Create API Key"** or
   - **"Create API Key"** or
   - **"Add API Key"**

2. **Fill in the form**:

   **Name** (required):
   ```
   BCS Production
   ```
   Or any name you'll remember like:
   - `BCS Website`
   - `Bellevue Collision`
   - `Production Server`

   **Permission** (required):
   - Select **"Sending access"** (recommended)
   - Or **"Full access"** (if you need more control)

   For basic email sending, "Sending access" is sufficient and more secure.

3. **Click "Create"** or **"Add"**

### 2.3: Copy Your API Key

**CRITICAL STEP - READ CAREFULLY**:

1. A modal/popup will appear showing your API key
2. The key will look like this:
   ```
   re_AbCdEfGh123456789
   ```
   - Always starts with `re_`
   - Followed by random letters and numbers

3. **COPY IT IMMEDIATELY**:
   - Click the **"Copy"** button
   - Or manually select and copy (Cmd+C / Ctrl+C)

4. **⚠️ IMPORTANT**: You can only see this key ONCE!
   - Once you close this window, you can never see it again
   - If you lose it, you'll need to create a new key

5. **Save it temporarily**:
   - Paste it in a secure note app
   - Or a password manager
   - Or a text file (delete after setup)

   Example of what to save:
   ```
   Resend API Key: re_AbCdEfGh123456789
   Created: Feb 2, 2026
   ```

6. **Click "Done"** or close the modal

### 2.4: Verify API Key is Created

You should now see your API key in the list:
- Name: `BCS Production`
- Key: `re_••••••••••••••••` (hidden for security)
- Permission: "Sending access"
- Status: "Active"

---

## Step 3: Verify Your Sender Email

**Why?**: Resend requires you to verify the email address you'll send emails FROM. This prevents spam and ensures deliverability.

### 3.1: Navigate to Domains

1. Look at the **left sidebar**
2. Click **"Domains"**
   - You might also see "Senders" or "Verified Senders"

### 3.2: Add Your Email for Verification

**You have two options here:**

#### Option A: Verify Single Email Address (Quick & Easy)

**Best for**: Getting started quickly, using Gmail

1. Look for one of these options:
   - **"+ Add Domain"** button
   - **"Verify Email Address"**
   - **"Add Sender"**

2. You might see two tabs:
   - **"Domain"** (for custom domains like yoursite.com)
   - **"Email Address"** (for individual emails)

3. **Select "Email Address"** tab if available

4. **Enter your email**:
   ```
   your-email@gmail.com
   ```
   - Use your actual Gmail address
   - This is where you'll receive lead notifications
   - This will also be the "FROM" address in emails

5. **Click**:
   - **"Send Verification Email"** or
   - **"Verify Email"** or
   - **"Add"**

6. **Check your email**:
   - Open your Gmail inbox
   - Look for email from Resend
   - Subject: "Verify your email address for Resend"

7. **Click the verification link** in the email
   - Opens in browser
   - You'll see "Email verified successfully" message

8. **Go back to Resend dashboard**
   - Refresh the page
   - Your email should now show status: **"Verified"** ✓

#### Option B: Add Custom Domain (Advanced)

**Best for**: Professional emails (info@bellevuecollision.com)

**Note**: Only do this if you own a domain name.

1. Click **"+ Add Domain"**

2. **Enter your domain**:
   ```
   bellevuecollision.com
   ```
   (without www or http://)

3. **Add DNS Records**:
   - Resend will show you DNS records to add
   - You'll need:
     - **SPF record** (TXT)
     - **DKIM record** (TXT)
     - **DMARC record** (TXT) - optional

4. **Go to your domain registrar**:
   - GoDaddy, Namecheap, Cloudflare, etc.
   - Add the DNS records shown by Resend

5. **Wait for verification**:
   - Can take 5 minutes to 48 hours
   - Check back in Resend dashboard for "Verified" status

**For now, use Option A (single email) - it's faster!**

### 3.3: Confirm Verification Status

In your Resend dashboard under "Domains":
- You should see your email address
- Status: **"Verified"** (green checkmark ✓)
- If it says "Pending", wait a few minutes and refresh

**✓ You're now ready to send emails!**

---

## Step 4: Update Your .env File

Now let's configure your BCS application to use Resend.

### 4.1: Open Your .env File

**Mac/Linux**:
```bash
cd /Users/bloom/Documents/src/chef/BCS/server
nano .env
```

**Or use your code editor**:
- VS Code: Open `/Users/bloom/Documents/src/chef/BCS/server/.env`
- Any text editor works

### 4.2: Update Email Settings

Find these lines in your `.env` file:

**BEFORE** (current settings):
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here

OWNER_EMAIL=your-verified-email@gmail.com
```

**AFTER** (your actual settings):
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_AbCdEfGh123456789

OWNER_EMAIL=your-actual-email@gmail.com
```

**Replace**:
1. `re_your_api_key_here` → Your actual Resend API key (from Step 2.3)
2. `your-verified-email@gmail.com` → The email you verified (from Step 3.2)

### 4.3: Important Notes

**SMTP_USER must be exactly "resend"**:
- Don't change this
- Username is literally the word `resend`
- Not your email, not your name, just: `resend`

**SMTP_PASS is your API key**:
- Must start with `re_`
- Copy exactly as shown in Resend
- No spaces, no quotes in .env file

**OWNER_EMAIL is where notifications go**:
- Must match the email you verified in Step 3
- This is where lead notifications will be sent

### 4.4: Save the File

**If using nano**:
- Press `Ctrl + O` (save)
- Press `Enter` (confirm)
- Press `Ctrl + X` (exit)

**If using code editor**:
- Press `Cmd + S` (Mac) or `Ctrl + S` (Windows)
- Close the file

---

## Step 5: Test Email Setup

### 5.1: Start Your Server

**Terminal**:
```bash
cd /Users/bloom/Documents/src/chef/BCS/server
npm run dev
```

### 5.2: Check Server Logs

You should see:
```
[INFO] MongoDB connected successfully
[INFO] Server running on port 5138
[INFO] Environment: development
```

**No errors?** Good! Continue to next step.

**See errors?** Check:
- MongoDB connection string is correct
- No typos in .env file
- All required environment variables are set

### 5.3: Test Lead Submission

1. **Open your browser**
   ```
   http://localhost:5173/contact
   ```

2. **Fill out the contact form**:
   - Name: `Test User`
   - Email: `test@example.com`
   - Phone: `(206) 555-1234`
   - Message: `Testing email setup with Resend`
   - Upload a photo (optional)

3. **Click "Send Message"** or "Submit"

### 5.4: Check for Success

**In your terminal**, you should see:
```
[INFO] Lead created successfully
[INFO] Email sent to: your-email@gmail.com
```

**In your Gmail inbox**:
- Check for new email
- Subject: "New Lead Submission from BCS Website" (or similar)
- From: your-email@gmail.com
- Contains the lead details you submitted

**Also check spam folder** if you don't see it in inbox.

---

## Step 6: Verify Everything Works

### 6.1: Check Resend Dashboard

1. **Go back to Resend dashboard**
   - https://resend.com/

2. **Click "Emails"** or "Logs" in left sidebar

3. **You should see**:
   - Your test email listed
   - Status: **"Delivered"** ✓
   - To: your-email@gmail.com
   - Timestamp: Just now

4. **Click on the email** to see:
   - Full delivery details
   - Email content preview
   - Opens/clicks (if tracked)

### 6.2: Test Customer Signup Email (Optional)

1. **Submit another lead** with a different email
2. **Check Resend logs** for the signup invitation email
3. **Check test email inbox** to verify receipt

---

## Troubleshooting

### Problem: "Invalid API key" Error

**Error message in logs**:
```
[ERROR] Email failed: Invalid API key
```

**Causes**:
- API key is incorrect
- API key has extra spaces
- API key doesn't start with `re_`

**Solutions**:
1. Check your `.env` file
2. Verify SMTP_PASS matches your Resend API key exactly
3. Make sure there are no spaces before or after
4. Ensure it starts with `re_`
5. Try creating a new API key in Resend

### Problem: "Sender not verified" Error

**Error message**:
```
[ERROR] Email failed: Sender email not verified
```

**Causes**:
- Email address not verified in Resend
- OWNER_EMAIL doesn't match verified email

**Solutions**:
1. Go to Resend dashboard → Domains
2. Check if your email shows "Verified" status
3. If "Pending", click verification link in email
4. Wait a few minutes and try again
5. Make sure OWNER_EMAIL in .env matches exactly

### Problem: Email Not Received

**No error in logs, but no email received**

**Check**:
1. **Spam folder** - check Gmail spam/junk
2. **Resend logs** - does it show "Delivered"?
3. **Email address** - did you use the correct recipient?
4. **Wait** - sometimes takes 1-2 minutes

**Solutions**:
1. Check Resend dashboard → Emails
2. Look at delivery status
3. If "Bounced" - email address might be invalid
4. If "Delivered" but not received - check spam filters

### Problem: "Connection refused" or "ECONNREFUSED"

**Error message**:
```
[ERROR] Error: connect ECONNREFUSED
```

**Causes**:
- SMTP_HOST is wrong
- SMTP_PORT is wrong
- Firewall blocking connection

**Solutions**:
1. Verify SMTP_HOST is exactly: `smtp.resend.com`
2. Verify SMTP_PORT is exactly: `587`
3. Check firewall settings
4. Try different network (mobile hotspot)

### Problem: "Authentication failed"

**Error message**:
```
[ERROR] Email failed: Authentication failed
```

**Causes**:
- SMTP_USER is wrong (should be "resend")
- SMTP_PASS (API key) is incorrect

**Solutions**:
1. Verify SMTP_USER is exactly: `resend` (lowercase)
2. Double-check your API key in SMTP_PASS
3. Try creating a new API key
4. Make sure no quotes around values in .env

### Problem: API Key Not Working After Creation

**Just created key but getting errors**

**Solutions**:
1. Wait 1-2 minutes for key to activate
2. Restart your server (Ctrl+C then `npm run dev`)
3. Clear any caches
4. Try creating a new key

---

## Production Deployment

### Before Going Live

When deploying to production (Heroku, Railway, Vercel, etc.):

1. **Keep same Resend account**
   - No need to create a new account
   - Use the same API key

2. **Set environment variables** in your hosting platform:
   ```
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=587
   SMTP_USER=resend
   SMTP_PASS=re_your_actual_api_key
   OWNER_EMAIL=your-verified-email@gmail.com
   ```

3. **Verify sender email** (if using different email):
   - Add new email in Resend dashboard
   - Verify it
   - Update OWNER_EMAIL

4. **Test thoroughly**:
   - Submit test leads
   - Check email delivery
   - Monitor Resend logs

### For Custom Domain (Optional)

If you want emails to come from `@bellevuecollision.com`:

1. **Add domain in Resend** (see Step 3.2 Option B)
2. **Configure DNS records** at your domain registrar
3. **Wait for verification** (5 min - 48 hours)
4. **Update OWNER_EMAIL** to use custom domain:
   ```env
   OWNER_EMAIL=info@bellevuecollision.com
   ```

---

## Resend Free Tier Limits

### What's Included (Free)

✅ **3,000 emails per month**
✅ **100 emails per day**
✅ **Unlimited domains**
✅ **Unlimited verified senders**
✅ **Email logs (30 days)**
✅ **Basic analytics**

### When to Upgrade

You'll need a paid plan if:
- Sending >100 emails/day
- Need >3,000 emails/month
- Need longer log retention
- Need dedicated IP address
- Need advanced analytics

### Pricing (If Needed Later)

- **Free**: 3,000 emails/month
- **Pro**: $20/month - 50,000 emails
- **Business**: Custom pricing

**For BCS**: Free tier should be plenty to start!

---

## Email Types Sent by BCS

Your website sends these automated emails:

1. **Lead Notification** (to you)
   - When customer submits contact form
   - Includes customer details and message

2. **Customer Signup Invitation** (to customer)
   - When lead is submitted
   - Contains link to set password

3. **Appointment Confirmation** (to customer)
   - When appointment is booked
   - Includes date, time, details

4. **Appointment Reminder** (to customer)
   - 24 hours before appointment
   - Automated via cron job

5. **Invoice Notification** (to customer)
   - When invoice is created
   - Includes payment link

6. **Payment Confirmation** (to customer)
   - When payment is received
   - Receipt and thank you

All these will automatically work with Resend once configured!

---

## Monitoring Your Emails

### Resend Dashboard

**View sent emails**:
1. Go to Resend dashboard
2. Click **"Emails"** or **"Logs"**
3. See all sent emails with status

**Metrics to watch**:
- **Delivered**: Successfully delivered
- **Bounced**: Invalid email address
- **Opens**: Customer opened email (if tracking enabled)
- **Clicks**: Customer clicked links in email

### Best Practices

✅ **Check logs weekly** - spot delivery issues
✅ **Monitor bounce rate** - high bounces = bad email list
✅ **Track opens** - see if customers read emails
✅ **Test regularly** - send yourself test emails monthly

---

## Security & Best Practices

### API Key Security

**DO**:
✅ Keep API key secret
✅ Store in `.env` file (never commit to git)
✅ Use environment variables in production
✅ Rotate keys every 6 months

**DON'T**:
❌ Share API key publicly
❌ Commit to GitHub
❌ Hardcode in source code
❌ Use same key for dev and production

### Email Best Practices

✅ **Verify all sender emails** before sending
✅ **Use clear subject lines** so customers know it's you
✅ **Include unsubscribe link** (for marketing emails)
✅ **Test emails** before sending to customers
✅ **Monitor spam complaints** in Resend dashboard

---

## Quick Reference

### Resend Configuration Summary

```env
# Resend SMTP Settings (copy these exactly)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_YourActualAPIKey

# Your verified sender email
OWNER_EMAIL=your-verified-email@gmail.com
```

### Important Links

- **Resend Dashboard**: https://resend.com/
- **API Keys**: https://resend.com/api-keys
- **Domains/Senders**: https://resend.com/domains
- **Email Logs**: https://resend.com/emails
- **Documentation**: https://resend.com/docs
- **Support**: https://resend.com/support

### Terminal Commands

**Start server**:
```bash
cd /Users/bloom/Documents/src/chef/BCS/server
npm run dev
```

**Test connection** (if needed):
```bash
cd server
node test-email.js
```

---

## Getting Help

### If You're Stuck

1. **Check this guide** - read relevant troubleshooting section
2. **Check Resend docs**: https://resend.com/docs
3. **Check server logs** - look for error messages
4. **Check Resend dashboard** - see delivery status
5. **Ask for help** - provide error messages

### Common Error Messages & Solutions

| Error | Meaning | Solution |
|-------|---------|----------|
| Invalid API key | Wrong key in .env | Copy correct key from Resend |
| Sender not verified | Email not verified | Verify email in Resend dashboard |
| Authentication failed | Wrong SMTP_USER | Must be exactly "resend" |
| Connection refused | Can't reach Resend | Check SMTP_HOST and PORT |
| Recipient not found | Invalid email | Check OWNER_EMAIL spelling |

---

## Checklist - Setup Complete When:

- [ ] Resend account created
- [ ] Email address verified (received verification email)
- [ ] API key created and copied
- [ ] `.env` file updated with:
  - [ ] SMTP_HOST=smtp.resend.com
  - [ ] SMTP_PORT=587
  - [ ] SMTP_USER=resend
  - [ ] SMTP_PASS=re_YourAPIKey
  - [ ] OWNER_EMAIL=verified-email@gmail.com
- [ ] Server started successfully (no errors)
- [ ] Test lead submitted through contact form
- [ ] Email received in inbox (or spam)
- [ ] Resend dashboard shows "Delivered" status

**✓ All checked?** You're done! Email is configured and working!

---

## Next Steps After Setup

Once email is working:

1. **Test all email types**:
   - Submit lead (lead notification)
   - Create appointment (confirmation email)
   - Create invoice (invoice email)

2. **Customize email templates** (optional):
   - Edit `/server/src/utils/email.ts`
   - Change wording, styling, branding

3. **Set up MongoDB Atlas** (if not done):
   - See `MONGODB_SETUP_GUIDE.md`

4. **Configure Stripe payments**:
   - See `STRIPE_SETUP_GUIDE.md` (if exists)

5. **Deploy to production**:
   - See `DEPLOYMENT_GUIDE.md`

---

## Success! 🎉

You now have professional email notifications set up for your auto body shop website!

**What you can do now**:
- ✅ Receive lead notifications instantly
- ✅ Send automated appointment reminders
- ✅ Send invoice notifications
- ✅ Send payment confirmations
- ✅ Professional, reliable email delivery

**Benefits over Gmail**:
- ✅ No 2FA hassle
- ✅ Better deliverability (less spam)
- ✅ Detailed email analytics
- ✅ Professional setup
- ✅ Easy to scale

---

**Last Updated**: February 2, 2026
**Version**: 1.0
**Time to Complete**: 10-15 minutes
**Difficulty**: Easy
**Cost**: Free (3,000 emails/month)
