#!/bin/bash

# Caisse Manager Pro - Quick Start Script
# This script helps you get started quickly

echo "🍽️  Caisse Manager Pro - Quick Start"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/caisse-manager
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
EOF
    echo "✅ .env file created with secure JWT secret"
else
    echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Check if client/node_modules exists
if [ ! -d "client/node_modules" ]; then
    echo ""
    echo "📦 Installing frontend dependencies..."
    cd client && npm install && cd ..
else
    echo "✅ Frontend dependencies already installed"
fi

# Check if MongoDB is running
echo ""
echo "🔍 Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "⚠️  MongoDB is not running"
    echo ""
    echo "Please start MongoDB:"
    echo "  macOS (Homebrew): brew services start mongodb-community"
    echo "  Linux: sudo systemctl start mongod"
    echo "  Manual: mongod --dbpath /path/to/data"
    echo ""
    read -p "Press Enter when MongoDB is running..."
fi

echo ""
echo "🚀 Starting Caisse Manager Pro..."
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Default login credentials:"
echo "  Admin: admin@caisse.com / admin123"
echo "  Cashier: cashier@caisse.com / cashier123"
echo "  Kitchen: kitchen@caisse.com / kitchen123"
echo ""
echo "⚠️  Remember to change these passwords in production!"
echo ""
echo "Starting servers..."
echo ""

# Start the application
npm run dev
