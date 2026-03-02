#!/bin/bash

# MongoDB Backup Script for BCS
# Creates timestamped backups of the MongoDB database

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===========================================\033[0m"
echo -e "${GREEN}   MongoDB Backup Script\033[0m"
echo -e "${GREEN}===========================================\033[0m"
echo ""

# Check if MONGO_URI is set
if [ -z "$MONGO_URI" ]; then
    echo -e "${RED}❌ Error: MONGO_URI environment variable not set${NC}"
    echo "Please set MONGO_URI in your .env file"
    exit 1
fi

# Check if mongodump is installed
if ! command -v mongodump &> /dev/null; then
    echo -e "${RED}❌ Error: mongodump is not installed${NC}"
    echo ""
    echo "Install MongoDB Database Tools:"
    echo "  macOS: brew install mongodb-database-tools"
    echo "  Linux: sudo apt-get install mongodb-database-tools"
    echo "  Or download from: https://www.mongodb.com/try/download/database-tools"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Creating backup...${NC}"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Run mongodump
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo ""
    echo "Backup location: $BACKUP_DIR"
    echo "Backup size: $(du -sh $BACKUP_DIR | cut -f1)"
    echo ""

    # Optional: Compress backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    tar -czf "${BACKUP_DIR}.tar.gz" -C "./backups" "$DATE"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup compressed: ${BACKUP_DIR}.tar.gz${NC}"
        echo "Compressed size: $(du -sh ${BACKUP_DIR}.tar.gz | cut -f1)"

        # Optional: Remove uncompressed backup
        rm -rf "$BACKUP_DIR"
        echo "Removed uncompressed backup"
    fi

    echo ""
    echo -e "${GREEN}===========================================\033[0m"
    echo -e "${GREEN}   Backup Complete\033[0m"
    echo -e "${GREEN}===========================================\033[0m"
else
    echo ""
    echo -e "${RED}❌ Backup failed!${NC}"
    echo "Please check your MongoDB connection and try again"
    exit 1
fi

# Optional: Clean up old backups (keep last 7 days)
echo ""
echo -e "${YELLOW}Cleaning up old backups (keeping last 7)...${NC}"
cd ./backups
ls -t *.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm
echo -e "${GREEN}✅ Cleanup complete${NC}"
