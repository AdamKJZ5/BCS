#!/bin/bash

# BCS Application Startup Script
# Starts both server and client in separate terminal windows/tabs

echo "🚀 Starting BCS Application"
echo "==========================="
echo ""

# Detect OS
OS="$(uname -s)"

# Function to start server
start_server() {
    echo "Starting server..."
    cd server && npm run dev
}

# Function to start client
start_client() {
    echo "Starting client..."
    cd client && npm run dev
}

# For macOS
if [ "$OS" = "Darwin" ]; then
    echo "Detected macOS"
    echo ""
    echo "Opening terminals..."

    # Open server in new terminal
    osascript -e 'tell application "Terminal"
        do script "cd '"$PWD"' && cd server && echo \"🖥️  Starting Server...\" && npm run dev"
        activate
    end tell'

    sleep 2

    # Open client in new terminal
    osascript -e 'tell application "Terminal"
        do script "cd '"$PWD"' && cd client && echo \"💻 Starting Client...\" && npm run dev"
    end tell'

    echo ""
    echo "✅ Started server and client in separate terminals"
    echo ""
    echo "📝 Access points:"
    echo "   Client: http://localhost:5173"
    echo "   Server API: http://localhost:5138/api"
    echo ""
    echo "⚠️  Keep both terminal windows open"

# For Linux
elif [ "$OS" = "Linux" ]; then
    echo "Detected Linux"
    echo ""

    # Try gnome-terminal first
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $PWD/server && npm run dev; exec bash" &
        gnome-terminal -- bash -c "cd $PWD/client && npm run dev; exec bash" &
    # Try xterm
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $PWD/server && npm run dev" &
        xterm -e "cd $PWD/client && npm run dev" &
    else
        echo "⚠️  No suitable terminal emulator found"
        echo "Please run these commands manually in separate terminals:"
        echo ""
        echo "Terminal 1:"
        echo "  cd server && npm run dev"
        echo ""
        echo "Terminal 2:"
        echo "  cd client && npm run dev"
        exit 1
    fi

    echo "✅ Started server and client"

# Fallback - print instructions
else
    echo "⚠️  Automatic startup not supported on this OS"
    echo ""
    echo "Please run these commands manually in separate terminals:"
    echo ""
    echo "Terminal 1 - Server:"
    echo "  cd $PWD/server"
    echo "  npm run dev"
    echo ""
    echo "Terminal 2 - Client:"
    echo "  cd $PWD/client"
    echo "  npm run dev"
    exit 1
fi
