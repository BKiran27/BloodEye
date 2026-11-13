#!/usr/bin/env bash
# BloodEye - Local Development Setup Script
# Usage: bash scripts/setup.sh

set -euo pipefail

echo "=========================================="
echo "  BloodEye - Development Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "[1/6] Checking prerequisites..."

if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python 3.11+ is required but not found."
    echo "Install from: https://www.python.org/downloads/"
    exit 1
fi

PYTHON_CMD=$(command -v python3 || command -v python)
PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
echo "  Python: $PYTHON_VERSION"

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js 20+ is required but not found."
    echo "Install from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "  Node.js: $NODE_VERSION"

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is required but not found."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "  npm: $NPM_VERSION"

echo ""

# Setup environment
echo "[2/6] Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "  Created .env from .env.example"
else
    echo "  .env already exists, skipping"
fi

# Setup backend
echo ""
echo "[3/6] Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    $PYTHON_CMD -m venv venv
    echo "  Created Python virtual environment"
fi

# Activate venv
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install --quiet -r requirements.txt
echo "  Installed Python dependencies"
cd ..

# Setup frontend
echo ""
echo "[4/6] Setting up frontend..."
cd frontend
npm install --silent
echo "  Installed Node.js dependencies"
cd ..

# Create data directories
echo ""
echo "[5/6] Creating data directories..."
mkdir -p data/uploads data/datasets data/models
echo "  Created data/uploads, data/datasets, data/models"

# Summary
echo ""
echo "[6/6] Setup complete!"
echo ""
echo "=========================================="
echo "  To start the application:"
echo ""
echo "  Backend:"
echo "    cd backend"
echo "    source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "    uvicorn app.main:app --reload --port 8000"
echo ""
echo "  Frontend (new terminal):"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo "=========================================="
