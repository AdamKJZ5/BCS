#!/bin/bash

echo "🚀 Starting BCS Client..."
echo ""

cd "$(dirname "$0")"

# Kill any existing vite processes
pkill -f "vite" 2>/dev/null

# Start the client
npm run dev
