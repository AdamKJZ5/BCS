#!/bin/bash

###############################################################################
# Cron Backup Setup Script
# Automatically configures cron jobs for database backups
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Automated Backup Setup Wizard        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Check if backup script exists
if [ ! -f "$SCRIPT_DIR/backup-database.sh" ]; then
    echo -e "${RED}❌ Error: backup-database.sh not found in scripts directory${NC}"
    exit 1
fi

# Make backup script executable
chmod +x "$SCRIPT_DIR/backup-database.sh"
echo -e "${GREEN}✅ Backup script is executable${NC}"
echo ""

# Ask for backup schedule
echo -e "${YELLOW}📅 Choose backup schedule:${NC}"
echo "  1) Daily at 2:00 AM (recommended for production)"
echo "  2) Daily at 3:00 AM"
echo "  3) Twice daily (2:00 AM and 2:00 PM)"
echo "  4) Every 6 hours"
echo "  5) Custom schedule"
echo ""
read -p "Enter choice [1-5]: " schedule_choice

case $schedule_choice in
    1)
        CRON_SCHEDULE="0 2 * * *"
        SCHEDULE_DESC="Daily at 2:00 AM"
        ;;
    2)
        CRON_SCHEDULE="0 3 * * *"
        SCHEDULE_DESC="Daily at 3:00 AM"
        ;;
    3)
        CRON_SCHEDULE="0 2,14 * * *"
        SCHEDULE_DESC="Twice daily (2:00 AM and 2:00 PM)"
        ;;
    4)
        CRON_SCHEDULE="0 */6 * * *"
        SCHEDULE_DESC="Every 6 hours"
        ;;
    5)
        echo ""
        echo "Cron format: minute hour day month weekday"
        echo "Example: 0 2 * * * (daily at 2:00 AM)"
        read -p "Enter custom cron schedule: " CRON_SCHEDULE
        SCHEDULE_DESC="Custom schedule"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Schedule selected: ${SCHEDULE_DESC}${NC}"
echo "   Cron expression: ${CRON_SCHEDULE}"
echo ""

# Create log directory
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

# Create cron job
CRON_COMMAND="cd $PROJECT_DIR && $SCRIPT_DIR/backup-database.sh >> $LOG_DIR/backup-cron.log 2>&1"
CRON_JOB="$CRON_SCHEDULE $CRON_COMMAND"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "backup-database.sh"; then
    echo -e "${YELLOW}⚠️  Existing backup cron job found${NC}"
    read -p "Replace existing job? (yes/no): " replace
    if [ "$replace" != "yes" ]; then
        echo "Keeping existing cron job. Exiting."
        exit 0
    fi
    # Remove old job
    crontab -l 2>/dev/null | grep -v "backup-database.sh" | crontab -
    echo -e "${GREEN}✅ Removed old cron job${NC}"
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo ""
echo -e "${GREEN}✅ Cron job installed successfully!${NC}"
echo ""

# Display current crontab
echo "📋 Current cron jobs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
crontab -l | grep -v "^#" | grep -v "^$"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Email notification setup (optional)
echo -e "${YELLOW}📧 Email Notifications (optional)${NC}"
echo "Would you like to receive email notifications for backup failures?"
read -p "Configure email? (yes/no): " setup_email

if [ "$setup_email" = "yes" ]; then
    read -p "Enter email address: " email_address

    # Create wrapper script with email notification
    WRAPPER_SCRIPT="$SCRIPT_DIR/backup-with-notification.sh"

    cat > "$WRAPPER_SCRIPT" << EOF
#!/bin/bash
# Automated backup with email notification

LOG_FILE="$LOG_DIR/backup-cron.log"
ERROR_LOG="/tmp/backup-error.log"

# Run backup
cd $PROJECT_DIR
$SCRIPT_DIR/backup-database.sh > "\$LOG_FILE" 2> "\$ERROR_LOG"

# Check if backup failed
if [ \$? -ne 0 ]; then
    # Backup failed - send email
    SUBJECT="❌ Database Backup Failed - \$(date)"
    BODY=\$(cat "\$ERROR_LOG")

    # Try to send email using mail command
    if command -v mail &> /dev/null; then
        echo "\$BODY" | mail -s "\$SUBJECT" $email_address
    else
        echo "Warning: 'mail' command not found. Install mailutils to enable email notifications."
    fi
fi
EOF

    chmod +x "$WRAPPER_SCRIPT"

    # Update cron job to use wrapper script
    crontab -l | grep -v "backup-database.sh" | crontab -
    CRON_COMMAND="cd $PROJECT_DIR && $WRAPPER_SCRIPT"
    CRON_JOB="$CRON_SCHEDULE $CRON_COMMAND"
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

    echo -e "${GREEN}✅ Email notifications configured${NC}"
    echo "   Email: $email_address"
    echo ""
    echo "Note: Ensure 'mailutils' is installed for email notifications:"
    echo "  Ubuntu/Debian: sudo apt-get install mailutils"
    echo "  Mac: mail command is pre-installed"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Setup Complete! ✨                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "📋 Summary:"
echo "  • Backup schedule: ${SCHEDULE_DESC}"
echo "  • Backup script: $SCRIPT_DIR/backup-database.sh"
echo "  • Log file: $LOG_DIR/backup-cron.log"
echo "  • Backup location: $PROJECT_DIR/backups/"
echo ""
echo "🔍 Verify cron job:"
echo "  crontab -l"
echo ""
echo "📊 View backup logs:"
echo "  tail -f $LOG_DIR/backup-cron.log"
echo ""
echo "🧪 Test backup manually:"
echo "  $SCRIPT_DIR/backup-database.sh"
echo ""
echo "❌ To remove cron job:"
echo "  crontab -e  # Then delete the backup line"
echo ""
