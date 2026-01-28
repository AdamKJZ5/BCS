# Automation & Monitoring Quick Setup Guide

This guide will help you set up automated backups and monitoring in under 10 minutes.

## 🔄 Part 1: Automated Backups (5 minutes)

### For Mac/Linux (Cron)

**Step 1: Run Setup Script**
```bash
cd server
./scripts/setup-cron-backup.sh
```

**Step 2: Choose Schedule**
- Option 1: Daily at 2:00 AM ✅ (recommended)
- Option 2: Daily at 3:00 AM
- Option 3: Twice daily
- Option 4: Every 6 hours
- Option 5: Custom

**Step 3: Optional Email Notifications**
- Enter email address when prompted
- Install mailutils if needed:
  ```bash
  # Mac: Already has mail command
  # Ubuntu/Debian:
  sudo apt-get install mailutils
  ```

**Step 4: Verify**
```bash
# Check cron job is installed
crontab -l

# Test backup manually
./scripts/backup-database.sh

# View backup logs
tail -f logs/backup-cron.log
```

### For Linux (systemd) - Alternative

```bash
cd server
sudo ./scripts/setup-systemd-backup.sh

# Check status
systemctl status bcs-backup.timer

# View next scheduled run
systemctl list-timers bcs-backup.timer
```

### Backup Configuration

Edit `.env` to customize:
```env
BACKUP_DIR=./backups        # Where backups are stored
RETENTION_DAYS=30           # Days to keep old backups
```

---

## 📊 Part 2: Monitoring Setup (5 minutes)

### Step 1: Set Up Sentry (Error Tracking)

**A. Create Account**
1. Go to https://sentry.io/signup/
2. Sign up with email (free tier available)
3. Create new project:
   - Platform: Node.js
   - Project name: "BCS API" or similar

**B. Get DSN**
1. After creating project, Sentry shows you the DSN
2. Copy it (format: `https://xxxxx@sentry.io/12345`)

**C. Add to Environment**
```bash
# Edit server/.env
nano .env

# Add this line:
SENTRY_DSN=https://your-actual-dsn@sentry.io/your-project-id
```

**D. Restart Server**
```bash
npm run dev
```

**E. Verify**
- Check console: "✅ Sentry initialized for error tracking"
- Errors will now be automatically tracked!

### Step 2: Set Up Uptime Monitoring

**A. Create UptimeRobot Account** (Recommended - Free)
1. Go to https://uptimerobot.com/
2. Sign up for free account
3. Click "Add New Monitor"

**B. Configure Monitor**
```
Monitor Type: HTTP(s)
Friendly Name: BCS API - Health Check
URL: https://yourdomain.com/health
(or http://localhost:5001/health for testing)
Monitoring Interval: 5 minutes
Alert Contacts: Your email
```

**C. Add Additional Monitors** (Optional)
- Detailed health: `/health/detailed`
- Readiness check: `/health/ready`

**D. Set Up Alerts**
- Email: Enabled by default
- SMS: Available on paid plan
- Slack: Can be integrated

### Step 3: Test Everything

**A. Test Health Checks**
```bash
# Basic health
curl http://localhost:5001/health

# Detailed health (shows all services)
curl http://localhost:5001/health/detailed

# Readiness check
curl http://localhost:5001/health/ready

# Liveness check
curl http://localhost:5001/health/live
```

**B. Test Sentry**
```bash
# Trigger a test error in your app
# Sentry will capture and report it

# Check Sentry dashboard
# You should see the error appear within seconds
```

**C. Test Backup**
```bash
# Run manual backup
./scripts/backup-database.sh

# Verify backup created
ls -lh backups/

# Test restore (to temporary database)
# Don't run this on production!
MONGO_URI="mongodb://localhost:27017/test_restore" \
  ./scripts/restore-database.sh backups/backup_YYYYMMDD_HHMMSS.tar.gz
```

---

## ✅ Verification Checklist

### Backups
- [ ] Cron job installed (`crontab -l`)
- [ ] Manual backup works
- [ ] Backups appear in `backups/` directory
- [ ] Old backups are cleaned up (check retention)
- [ ] Email notifications configured (optional)
- [ ] Logs are being created (`logs/backup-cron.log`)

### Monitoring
- [ ] Sentry DSN added to `.env`
- [ ] Server shows "Sentry initialized" on startup
- [ ] UptimeRobot monitor created
- [ ] Health check endpoint responding (`/health`)
- [ ] Alert contacts configured
- [ ] Test alerts received

---

## 📱 Mobile App Setup (Optional)

### UptimeRobot Mobile App

1. Download app:
   - iOS: https://apps.apple.com/app/uptimerobot/id1104878581
   - Android: https://play.google.com/store/apps/details?id=com.uptimerobot

2. Login with your account
3. View all monitors on mobile
4. Get push notifications for downtime

### Sentry Mobile App

1. Download app:
   - iOS: https://apps.apple.com/app/sentry/id1213648989
   - Android: https://play.google.com/store/apps/details?id=io.sentry.mobile

2. Login and view errors on the go

---

## 🔔 Alert Configuration

### Recommended Alert Settings

#### Critical (Immediate SMS + Email)
- Server down >5 minutes
- Database disconnected
- Error rate >10%

#### Warning (Email)
- Server down >2 minutes
- Response time >500ms for 5 minutes
- Memory usage >80%

#### Info (Dashboard only)
- Response time >300ms
- Memory usage >60%

---

## 📊 What You'll See

### Backup Logs
```
📋 Backup Configuration:
  Database: mongodb://localhost:27017/bellevue-collision
  Backup Dir: ./backups
  Backup Name: backup_20260126_150000

🔄 Starting backup...
✅ Backup completed successfully!
📦 Compressing backup...
✅ Backup compressed: 2.4M
  Location: ./backups/backup_20260126_150000.tar.gz

🧹 Cleaning up old backups (older than 30 days)...
✅ Cleanup complete. 15 backup(s) remaining

🎉 Backup process complete!
```

### Sentry Dashboard
- Total errors count
- Affected users
- Error frequency trends
- Stack traces
- User context (email, ID)
- Request details
- Browser/OS information

### UptimeRobot Dashboard
- Uptime percentage (target: 99.9%+)
- Response time graph
- Downtime incidents
- Alert history
- Status indicators

---

## 🛠️ Troubleshooting

### Cron Job Not Running

```bash
# Check if cron service is running
# Mac: Cron runs automatically
# Linux:
sudo systemctl status cron

# Check cron logs
# Mac:
tail -f /var/log/system.log | grep cron
# Linux:
tail -f /var/log/syslog | grep CRON

# Verify script permissions
ls -l scripts/backup-database.sh
# Should show: -rwxr-xr-x (executable)
```

### Sentry Not Capturing Errors

```bash
# Check SENTRY_DSN is set
echo $SENTRY_DSN

# Check server logs
tail -f logs/combined-*.log | grep -i sentry

# Verify DSN format
# Should be: https://xxxxx@sentry.io/12345
```

### Health Check Returns 503

```bash
# Check detailed health
curl http://localhost:5001/health/detailed

# Check database connection
mongo $MONGO_URI --eval "db.runCommand({ping: 1})"

# Check server logs
tail -f logs/error-*.log
```

---

## 📈 Monitoring Best Practices

### Daily Tasks (2 minutes)
- Check UptimeRobot dashboard
- Review Sentry error dashboard
- Verify last backup completed

### Weekly Tasks (10 minutes)
- Review backup logs
- Check disk space usage
- Review error trends
- Test restore procedure

### Monthly Tasks (30 minutes)
- Full disaster recovery drill
- Review and update alert thresholds
- Optimize based on monitoring data
- Update documentation

---

## 🆘 Emergency Contacts

Keep these handy:

```
Database Backup Location: ./backups/
Latest Backup: ./backups/backup_YYYYMMDD_HHMMSS.tar.gz

Monitoring Dashboards:
- Sentry: https://sentry.io/organizations/your-org/issues/
- UptimeRobot: https://uptimerobot.com/dashboard

Health Checks:
- Basic: https://yourdomain.com/health
- Detailed: https://yourdomain.com/health/detailed

Emergency Restore:
./scripts/restore-database.sh backups/latest-backup.tar.gz
```

---

## 📚 Additional Resources

- **Backup Guide**: See `BACKUP_GUIDE.md` for detailed backup procedures
- **Monitoring Guide**: See `MONITORING_GUIDE.md` for advanced monitoring
- **Logging Guide**: See `LOGGING_GUIDE.md` for log analysis

---

## 🎉 You're Done!

Your application now has:
- ✅ Automated daily backups
- ✅ Error tracking with Sentry
- ✅ Uptime monitoring with UptimeRobot
- ✅ Health check endpoints
- ✅ Automated alerting

**Total setup time:** ~10 minutes
**Maintenance time:** ~5 minutes/week

**Sleep better knowing your application is monitored! 😴**
