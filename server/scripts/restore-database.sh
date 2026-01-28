#!/bin/bash

###############################################################################
# MongoDB Restore Script
# Restores MongoDB database from a backup file
###############################################################################

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  MongoDB Restore Script${NC}"
echo "================================"
echo ""

# Check if mongorestore is installed
if ! command -v mongorestore &> /dev/null; then
    echo -e "${RED}❌ Error: mongorestore is not installed${NC}"
    echo "Install MongoDB Database Tools:"
    echo "  Mac: brew install mongodb/brew/mongodb-database-tools"
    exit 1
fi

# Check if MONGO_URI is set
if [ -z "$MONGO_URI" ]; then
    echo -e "${RED}❌ Error: MONGO_URI not set in .env file${NC}"
    exit 1
fi

# Get backup file
BACKUP_DIR="${BACKUP_DIR:-./backups}"

if [ -z "$1" ]; then
    echo "📋 Available backups:"
    echo ""
    ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    echo ""
    echo "Usage: ./restore-database.sh <backup-file>"
    echo "Example: ./restore-database.sh backups/backup_20260126_150000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

# Confirm restoration
echo -e "${YELLOW}⚠️  WARNING: This will replace your current database!${NC}"
echo "  Target Database: ${MONGO_URI}"
echo "  Backup File: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restoration cancelled"
    exit 0
fi

# Extract backup
echo ""
echo "📦 Extracting backup..."
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find the backup directory (should be only one)
BACKUP_FOLDER=$(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -1)

if [ -z "$BACKUP_FOLDER" ]; then
    echo -e "${RED}❌ Error: Could not find backup data in archive${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Perform restore
echo "🔄 Starting restoration..."
echo ""

mongorestore --uri="$MONGO_URI" --gzip --drop "$BACKUP_FOLDER"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
else
    echo -e "${RED}❌ Restoration failed!${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "================================"
echo -e "${GREEN}🎉 Restoration complete!${NC}"
