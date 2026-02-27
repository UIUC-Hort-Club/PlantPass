#!/bin/bash

# PlantPass - Run All Tests
# This script runs both frontend and backend tests with coverage

set -e  # Exit on error

echo "🧪 PlantPass Test Suite"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track test results
FRONTEND_PASSED=0
BACKEND_PASSED=0

# Frontend Tests
echo "📦 Running Frontend Tests..."
echo "----------------------------"
cd src/PlantPassApp

if npm test; then
    echo -e "${GREEN}✅ Frontend tests passed!${NC}"
    FRONTEND_PASSED=1
else
    echo -e "${RED}❌ Frontend tests failed!${NC}"
fi

cd ../..
echo ""

# Backend Tests
echo "🐍 Running Backend Tests..."
echo "---------------------------"
cd src/lambda

if pytest --cov --cov-report=term --cov-report=html; then
    echo -e "${GREEN}✅ Backend tests passed!${NC}"
    BACKEND_PASSED=1
else
    echo -e "${RED}❌ Backend tests failed!${NC}"
fi

cd ../..
echo ""

# Summary
echo "📊 Test Summary"
echo "==============="

if [ $FRONTEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}✅ Frontend: PASSED${NC}"
else
    echo -e "${RED}❌ Frontend: FAILED${NC}"
fi

if [ $BACKEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}✅ Backend: PASSED${NC}"
else
    echo -e "${RED}❌ Backend: FAILED${NC}"
fi

echo ""
echo "📈 Coverage Reports:"
echo "  Frontend: src/PlantPassApp/coverage/index.html"
echo "  Backend:  src/lambda/htmlcov/index.html"
echo ""

# Exit with error if any tests failed
if [ $FRONTEND_PASSED -eq 1 ] && [ $BACKEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}💥 Some tests failed!${NC}"
    exit 1
fi
