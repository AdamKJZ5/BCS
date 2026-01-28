#!/bin/bash

###############################################################################
# Systemd Timer Setup Script (Alternative to Cron)
# For modern Linux systems using systemd
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Systemd Timer Backup Setup           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running on Linux with systemd
if ! command -v systemctl &> /dev/null; then
    echo -e "${RED}❌ Error: systemd not found${NC}"
    echo "This script is for Linux systems with systemd."
    echo "For Mac, use setup-cron-backup.sh instead."
    exit 1
fi

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Error: This script must be run as root (sudo)${NC}"
    exit 1
fi

# Get project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
USER=$(logname)

echo "📁 Project directory: $PROJECT_DIR"
echo "👤 User: $USER"
echo ""

# Create systemd service
SERVICE_FILE="/etc/systemd/system/bcs-backup.service"

cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Bellevue Collision Services Database Backup
After=network.target

[Service]
Type=oneshot
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=$SCRIPT_DIR/backup-database.sh
StandardOutput=append:$PROJECT_DIR/logs/backup-systemd.log
StandardError=append:$PROJECT_DIR/logs/backup-systemd.log

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✅ Created service file: $SERVICE_FILE${NC}"

# Create systemd timer
TIMER_FILE="/etc/systemd/system/bcs-backup.timer"

cat > "$TIMER_FILE" << EOF
[Unit]
Description=Daily Backup Timer for BCS Database
Requires=bcs-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

echo -e "${GREEN}✅ Created timer file: $TIMER_FILE${NC}"
echo ""

# Reload systemd
systemctl daemon-reload

# Enable and start timer
systemctl enable bcs-backup.timer
systemctl start bcs-backup.timer

echo -e "${GREEN}✅ Timer enabled and started${NC}"
echo ""

# Show status
echo "📊 Timer status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
systemctl status bcs-backup.timer --no-pager
echo ""

echo "📅 Next scheduled run:"
systemctl list-timers bcs-backup.timer --no-pager
echo ""

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Setup Complete! ✨                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "📋 Useful commands:"
echo "  • Check timer status: systemctl status bcs-backup.timer"
echo "  • View logs: journalctl -u bcs-backup.service"
echo "  • Run backup now: systemctl start bcs-backup.service"
echo "  • Disable timer: systemctl disable bcs-backup.timer"
echo ""
