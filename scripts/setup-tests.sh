#!/bin/bash

# PlantPass - Setup Test Environment
# This script installs all test dependencies

set -e  # Exit on error

echo "🔧 Setting up PlantPass Test Environment"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo ""

# Check Python
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi
echo -e "${GREEN}✅ Python $(python3 --version)${NC}"
echo ""

# Install Frontend Dependencies
echo "📦 Installing Frontend Dependencies..."
echo "--------------------------------------"
cd src/PlantPassApp
npm ci
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
cd ../..
echo ""

# Install Backend Dependencies
echo "🐍 Installing Backend Dependencies..."
echo "-------------------------------------"
cd src/lambda
pip install -r requirements-test.txt
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
cd ../..
echo ""

# Make test scripts executable
chmod +x scripts/run-all-tests.sh
chmod +x scripts/setup-tests.sh

echo -e "${GREEN}🎉 Test environment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run all tests: ./scripts/run-all-tests.sh"
echo "  2. Run frontend tests: cd src/PlantPassApp && npm test"
echo "  3. Run backend tests: cd src/lambda && pytest"
echo ""
echo "For more information, see TESTING.md"
