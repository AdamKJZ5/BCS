# Database Backup & Disaster Recovery Guide

## Overview

This guide covers database backup strategies, restoration procedures, and disaster recovery planning for the Bellevue Collision Services application.

## Backup Strategy

### Automatic Backups

The backup system provides automated MongoDB backups with:
- Compressed backup files (gzip + tar.gz)
- Timestamped filenames for easy identification
- Automatic cleanup of old backups
- Configurable retention period

### Backup Schedule Recommendations

**Development:**
- Manual backups before major changes
- Weekly automated backups

**Production:**
- **Daily**: Full database backup
- **Hourly**: Incremental backups (if using MongoDB Atlas)
- **Weekly**: Offsite backup copies
- **Monthly**: Long-term archival backups

## Manual Backup

### One-Time Backup

```bash
cd server
./scripts/backup-database.sh
```

This will:
1. Connect to MongoDB using `MONGO_URI` from `.env`
2. Create a compressed backup in `./backups/`
3. Name it with timestamp: `backup_YYYYMMDD_HHMMSS.tar.gz`
4. Clean up backups older than retention period

### Configuration

Edit `.env` to configure backup settings:

```env
# Backup directory (default: ./backups)
BACKUP_DIR=./backups

# Retention period in days (default: 30)
RETENTION_DAYS=30
```

## Automated Backups

### Using Cron (Linux/Mac)

Add to crontab:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/server && ./scripts/backup-database.sh >> ./logs/backup.log 2>&1

# Add hourly backups (production)
0 * * * * cd /path/to/server && ./scripts/backup-database.sh >> ./logs/backup.log 2>&1
```

### Using npm script

Add to `package.json`:

```json
{
  "scripts": {
    "backup": "./scripts/backup-database.sh",
    "restore": "./scripts/restore-database.sh"
  }
}
```

Then run:
```bash
npm run backup
```

### Cloud Scheduling

**AWS CloudWatch Events:**
- Schedule Lambda function to trigger backup
- Store backups in S3 with lifecycle policies

**Google Cloud Scheduler:**
- Schedule Cloud Function for backups
- Store in Google Cloud Storage

**MongoDB Atlas:**
- Enable automated backups (included in M10+ clusters)
- Configure backup schedule and retention
- Point-in-time recovery available

## Restoration

### List Available Backups

```bash
ls -lh backups/
```

### Restore from Backup

```bash
./scripts/restore-database.sh backups/backup_20260126_150000.tar.gz
```

**Warning:** This will **replace** your current database!

### Restore to Different Database

Temporarily change `MONGO_URI` in `.env` or pass it directly:

```bash
MONGO_URI="mongodb://localhost:27017/test_restore" ./scripts/restore-database.sh backups/backup_20260126_150000.tar.gz
```

### Selective Collection Restore

To restore only specific collections:

```bash
# Extract backup
tar -xzf backups/backup_20260126_150000.tar.gz

# Restore specific collection
mongorestore --uri="$MONGO_URI" --gzip --collection=users --drop extracted_folder/database_name/users.bson.gz
```

## Backup Storage

### Local Storage

**Pros:**
- Fast backup/restore
- No additional costs
- Full control

**Cons:**
- Vulnerable to hardware failure
- Not protected from disasters
- Limited by disk space

**Recommendation:** Use for development only

### Cloud Storage

#### Amazon S3

```bash
# Install AWS CLI
brew install awscli # Mac
# Configure: aws configure

# Upload backup
aws s3 cp backups/backup_20260126_150000.tar.gz s3://your-bucket/backups/

# Download backup
aws s3 cp s3://your-bucket/backups/backup_20260126_150000.tar.gz ./backups/
```

#### Google Cloud Storage

```bash
# Install gsutil
# https://cloud.google.com/storage/docs/gsutil_install

# Upload backup
gsutil cp backups/backup_20260126_150000.tar.gz gs://your-bucket/backups/

# Download backup
gsutil cp gs://your-bucket/backups/backup_20260126_150000.tar.gz ./backups/
```

#### Azure Blob Storage

```bash
# Install Azure CLI
brew install azure-cli # Mac

# Upload backup
az storage blob upload --account-name youraccountupload --container-name backups --name backup_20260126_150000.tar.gz --file backups/backup_20260126_150000.tar.gz
```

### MongoDB Atlas Backups

If using MongoDB Atlas (recommended for production):

1. Enable automated backups in Atlas dashboard
2. Configure:
   - Backup frequency
   - Retention period
   - Snapshot schedule
3. Enable point-in-time recovery for M10+ clusters
4. Download snapshots when needed

## Disaster Recovery Plan

### Recovery Time Objective (RTO)

Target time to restore service after disaster:
- **Development**: 4 hours
- **Staging**: 2 hours
- **Production**: 30 minutes

### Recovery Point Objective (RPO)

Maximum acceptable data loss:
- **Development**: 7 days
- **Staging**: 24 hours
- **Production**: 1 hour

### Disaster Scenarios

#### 1. Accidental Data Deletion

**Symptoms:** Important data deleted by mistake

**Recovery:**
1. Stop all write operations immediately
2. Identify most recent backup before deletion
3. Restore to temporary database
4. Export deleted records
5. Import to production database
6. Verify data integrity

**Time:** ~30 minutes

#### 2. Database Corruption

**Symptoms:** MongoDB errors, data inconsistencies

**Recovery:**
1. Take immediate snapshot of current state
2. Attempt MongoDB repair: `mongod --repair`
3. If repair fails, restore from latest backup
4. Verify all indexes and collections
5. Resume operations

**Time:** ~1 hour

#### 3. Server Failure

**Symptoms:** Server unreachable, hardware failure

**Recovery:**
1. Provision new server instance
2. Install dependencies (Node.js, MongoDB)
3. Restore latest database backup
4. Deploy application code
5. Update DNS/load balancer
6. Verify all services

**Time:** ~2 hours

#### 4. Complete Data Center Failure

**Symptoms:** Regional outage, natural disaster

**Recovery:**
1. Activate failover region/provider
2. Restore database from cloud backup
3. Deploy application to new region
4. Update DNS to point to new location
5. Monitor and verify operations

**Time:** ~4 hours

## Testing Backups

### Regular Backup Tests

**Monthly:**
1. Select random backup file
2. Restore to test database
3. Verify data integrity
4. Check all collections present
5. Test critical queries
6. Document results

### Disaster Recovery Drill

**Quarterly:**
1. Simulate complete system failure
2. Follow disaster recovery procedures
3. Measure actual RTO/RPO
4. Identify bottlenecks
5. Update procedures

## Backup Verification

### Automated Verification Script

```bash
#!/bin/bash
# verify-backup.sh

BACKUP_FILE=$1
TEMP_DB="mongodb://localhost:27017/backup_verification"

# Restore to temp database
MONGO_URI=$TEMP_DB ./scripts/restore-database.sh $BACKUP_FILE

# Verify collections exist
mongo $TEMP_DB --eval "db.getCollectionNames()" > /tmp/collections.txt

# Check for expected collections
EXPECTED="users leads invoices appointments"
for collection in $EXPECTED; do
  if grep -q $collection /tmp/collections.txt; then
    echo "✅ $collection exists"
  else
    echo "❌ $collection missing!"
  fi
done

# Cleanup
mongo $TEMP_DB --eval "db.dropDatabase()"
```

## Security Considerations

### Backup Encryption

Encrypt backups before uploading to cloud:

```bash
# Encrypt backup
openssl enc -aes-256-cbc -salt -in backup.tar.gz -out backup.tar.gz.enc

# Decrypt backup
openssl enc -d -aes-256-cbc -in backup.tar.gz.enc -out backup.tar.gz
```

### Access Control

- Store backups in private S3 buckets/private containers
- Use IAM roles with least privilege
- Enable MFA for backup access
- Rotate backup encryption keys quarterly
- Audit backup access logs

### Sensitive Data

- Backups contain sensitive customer data
- Ensure compliance with GDPR, CCPA, etc.
- Implement data retention policies
- Securely delete old backups
- Consider backup anonymization for development

## Monitoring

### Backup Health Checks

Monitor these metrics:
- Backup success/failure rate
- Backup file size (detect corruption)
- Backup duration (detect performance issues)
- Available storage space
- Last successful backup timestamp

### Alerts

Set up alerts for:
- Backup failure
- Backup not run in 24 hours
- Storage space < 20%
- Backup size anomalies
- Restoration failures

## Best Practices

### ✅ Do:

- Test restores regularly
- Store backups offsite
- Encrypt sensitive backups
- Document recovery procedures
- Automate backup process
- Monitor backup health
- Keep multiple backup versions
- Verify backup integrity

### ❌ Don't:

- Rely solely on local backups
- Store backups on same server as database
- Skip backup verification
- Ignore backup failures
- Keep backups indefinitely without review
- Share backup credentials
- Perform backups during peak hours (production)

## Troubleshooting

### Backup Fails with "mongodump not found"

```bash
# Mac
brew install mongodb/brew/mongodb-database-tools

# Ubuntu/Debian
sudo apt-get install mongodb-database-tools

# Check installation
mongodump --version
```

### "Out of disk space" Error

```bash
# Check disk usage
df -h

# Clean old backups manually
find ./backups -name "*.tar.gz" -mtime +7 -delete

# Use external storage
BACKUP_DIR=/mnt/external/backups ./scripts/backup-database.sh
```

### Restore Hangs or is Very Slow

- Check network connection to MongoDB
- Verify backup file isn't corrupted
- Ensure sufficient memory available
- Consider partial restore of specific collections

### "Unauthorized" Error

- Verify MONGO_URI includes authentication
- Check database user permissions
- Ensure user has backup/restore roles

## Resources

- [MongoDB Backup Methods](https://www.mongodb.com/docs/manual/core/backups/)
- [mongodump Documentation](https://www.mongodb.com/docs/database-tools/mongodump/)
- [MongoDB Atlas Backup](https://www.mongodb.com/docs/atlas/backup-restore/)
- [AWS S3 Backup Best Practices](https://aws.amazon.com/s3/backup/)

---

**Remember:** A backup is only as good as your last successful restore test!
