#!/bin/bash

###############################################################################
# MongoDB Backup Script
# Automatically backs up the MongoDB database with timestamp
###############################################################################

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${TIMESTAMP}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  MongoDB Backup Script${NC}"
echo "================================"
echo ""

# Check if mongodump is installed
if ! command -v mongodump &> /dev/null; then
    echo -e "${RED}❌ Error: mongodump is not installed${NC}"
    echo "Install MongoDB Database Tools:"
    echo "  Mac: brew install mongodb/brew/mongodb-database-tools"
    echo "  Linux: sudo apt-get install mongodb-database-tools"
    echo "  Windows: Download from mongodb.com/try/download/database-tools"
    exit 1
fi

# Check if MONGO_URI is set
if [ -z "$MONGO_URI" ]; then
    echo -e "${RED}❌ Error: MONGO_URI not set in .env file${NC}"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "📋 Backup Configuration:"
echo "  Database: ${MONGO_URI}"
echo "  Backup Dir: ${BACKUP_DIR}"
echo "  Backup Name: ${BACKUP_NAME}"
echo ""

# Perform backup
echo "🔄 Starting backup..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/$BACKUP_NAME" --gzip

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"

    # Compress backup
    echo "📦 Compressing backup..."
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"

    BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    echo -e "${GREEN}✅ Backup compressed: ${BACKUP_SIZE}${NC}"
    echo "  Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

    # Clean up old backups
    echo ""
    echo "🧹 Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
    find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete

    REMAINING=$(find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ Cleanup complete. ${REMAINING} backup(s) remaining${NC}"

else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 Backup process complete!${NC}"
