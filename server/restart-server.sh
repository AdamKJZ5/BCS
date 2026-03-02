#!/bin/bash

echo "🔄 Restarting BCS Server..."
echo ""

# Stop any running instances
pkill -f "ts-node-dev.*server.ts" 2>/dev/null
sleep 1

# Start server
cd "$(dirname "$0")"
npm run dev
