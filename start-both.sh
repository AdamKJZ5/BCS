#!/bin/bash

echo "🚀 Starting Bellevue Collision Services"
echo "======================================="
echo ""

# Kill any existing processes
pkill -f "vite" 2>/dev/null
pkill -f "ts-node-dev" 2>/dev/null
sleep 2

# Start server in background
cd /Users/bloom/Documents/src/chef/BCS/server
echo "📡 Starting server on port 5138..."
npm run dev > /tmp/bcs-server.log 2>&1 &
SERVER_PID=$!
sleep 5

# Start client in background
cd /Users/bloom/Documents/src/chef/BCS/client
echo "🌐 Starting client on port 5137..."
npm run dev > /tmp/bcs-client.log 2>&1 &
CLIENT_PID=$!
sleep 3

echo ""
echo "✅ Services started!"
echo ""
echo "Server: http://localhost:5138"
echo "Client: http://localhost:5137"
echo ""
echo "📋 To view logs:"
echo "  Server: tail -f /tmp/bcs-server.log"
echo "  Client: tail -f /tmp/bcs-client.log"
echo ""
echo "🛑 To stop:"
echo "  kill $SERVER_PID $CLIENT_PID"
echo ""
echo "📝 Register at: http://localhost:5137/customer/register"
echo ""
