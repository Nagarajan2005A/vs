#!/bin/bash

# Dashboard Backend Setup Script for Mac/Linux

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     Dashboard Backend - Setup Script                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js detected"
node --version

echo ""
echo "📦 Installing dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"

echo ""
echo "⚙️  Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env file created. Please edit it with your Firebase credentials."
else
    echo "✓ .env file already exists"
fi

echo ""
echo "🚀 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Firebase credentials"
echo "2. Place firebase-service-account.json in backend/ folder"
echo "3. Run: npm run dev (for development)"
echo "4. Server will run on http://localhost:5000"
echo ""
echo "Frontend should be opened at http://localhost:3000 or file:///"
echo ""
