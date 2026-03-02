#!/bin/bash

echo "🗄️  Setting up Local MongoDB for Development"
echo ""

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "MongoDB not found. Installing via Homebrew..."

    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install from https://brew.sh"
        exit 1
    fi

    echo "Installing MongoDB Community Edition..."
    brew tap mongodb/brew
    brew install mongodb-community
else
    echo "✅ MongoDB already installed"
fi

# Start MongoDB service
echo ""
echo "Starting MongoDB service..."
brew services start mongodb-community

# Wait for MongoDB to start
sleep 3

# Test connection
echo ""
echo "Testing connection..."
if mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo "✅ MongoDB is running!"
    echo ""
    echo "Update your .env file:"
    echo "MONGO_URI=mongodb://localhost:27017/bcs-dev"
    echo ""
    echo "Then restart your server: npm run dev"
else
    echo "⚠️  MongoDB may still be starting. Wait 10 seconds and try: npm run dev"
fi
