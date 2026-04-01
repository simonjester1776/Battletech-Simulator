#!/bin/bash
# Quick Desktop Build Script for BattleTech Simulator

set -e

echo "🎮 BattleTech Simulator - Desktop Build Script"
echo "=============================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn not found. Please install Yarn"
    exit 1
fi

echo "✅ All prerequisites found"
echo ""

# Step 1: Install PyInstaller
echo "📦 Step 1: Installing PyInstaller..."
pip install pyinstaller

# Step 2: Build Python backend
echo "🐍 Step 2: Building Python backend..."
cd backend
pyinstaller --onefile \
    --name battletech-backend \
    --hidden-import uvicorn.logging \
    --hidden-import uvicorn.loops.auto \
    --hidden-import uvicorn.protocols.http.auto \
    --hidden-import uvicorn.protocols.websockets.auto \
    --hidden-import uvicorn.lifespan.on \
    server.py

echo "✅ Backend built: backend/dist/battletech-backend"
cd ..

# Step 3: Build React frontend
echo "⚛️  Step 3: Building React frontend..."
yarn install
yarn build
echo "✅ Frontend built: dist/"

# Step 4: Install Electron dependencies
echo "🔧 Step 4: Installing Electron..."
yarn add -D electron electron-builder

echo ""
echo "✅ Build preparation complete!"
echo ""
echo "Next steps:"
echo "1. Review /app/DESKTOP_PACKAGING_GUIDE.md"
echo "2. Run 'yarn build:electron' to create Windows installer"
echo "3. Find installer in electron-dist/ folder"
echo ""
echo "Or test locally with: yarn electron"
