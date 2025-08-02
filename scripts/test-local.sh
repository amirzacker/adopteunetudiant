#!/bin/bash

# Local Test Script for Adopte1Etudiant
# Run this script before pushing to ensure CI/CD will pass

set -e  # Exit on any error

echo "🚀 Starting local test suite for Adopte1Etudiant..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "Current Node.js version: $NODE_VERSION"

# Check if MongoDB is running (optional)
print_status "Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ismaster')" --quiet &> /dev/null; then
        print_success "MongoDB is running"
    else
        print_warning "MongoDB not running locally - tests will use in-memory database"
    fi
else
    print_warning "MongoDB CLI not found - tests will use in-memory database"
fi

# Test Backend
echo ""
print_status "Testing Backend..."
echo "================================"

cd backend

print_status "Installing backend dependencies..."
npm ci

print_status "Running backend unit tests..."
if npm test -- --testPathPattern="unit" --silent; then
    print_success "Backend unit tests passed"
else
    print_error "Backend unit tests failed"
    exit 1
fi

print_status "Running backend integration tests..."
if npm test -- --testPathPattern="integration" --silent; then
    print_success "Backend integration tests passed"
else
    print_error "Backend integration tests failed"
    exit 1
fi

print_status "Checking backend security vulnerabilities..."
if npm audit --audit-level=high; then
    print_success "No high-severity vulnerabilities found in backend"
else
    print_warning "Security vulnerabilities found in backend - please review"
fi

cd ..

# Test Frontend
echo ""
print_status "Testing Frontend..."
echo "================================"

cd frontend

print_status "Installing frontend dependencies..."
npm ci

print_status "Running frontend tests..."
if npm test -- --coverage --watchAll=false --silent; then
    print_success "Frontend tests passed"
else
    print_error "Frontend tests failed"
    exit 1
fi

print_status "Building frontend..."
if npm run build; then
    print_success "Frontend build successful"
    BUILD_SIZE=$(du -sh build/ | cut -f1)
    echo "Build size: $BUILD_SIZE"
else
    print_error "Frontend build failed"
    exit 1
fi

print_status "Checking frontend security vulnerabilities..."
if npm audit --audit-level=high; then
    print_success "No high-severity vulnerabilities found in frontend"
else
    print_warning "Security vulnerabilities found in frontend - please review"
fi

cd ..

# Test Full Application Build
echo ""
print_status "Testing Full Application Build..."
echo "======================================="

print_status "Running full application build..."
if npm run build; then
    print_success "Full application build successful"
else
    print_error "Full application build failed"
    exit 1
fi

# Optional: Run E2E tests if Cypress is available and MongoDB is running
echo ""
print_status "Checking for E2E test capability..."
if [ -f "frontend/cypress.config.js" ] && command -v mongosh &> /dev/null; then
    echo "E2E tests available. Run manually with:"
    echo "  cd frontend && npm run test:smoke"
else
    print_warning "E2E tests not available or MongoDB not running"
fi

# Summary
echo ""
echo "=================================================="
print_success "🎉 All local tests passed!"
echo "=================================================="
echo ""
echo "✅ Backend unit tests: PASSED"
echo "✅ Backend integration tests: PASSED"
echo "✅ Frontend tests: PASSED"
echo "✅ Frontend build: PASSED"
echo "✅ Full application build: PASSED"
echo ""
echo "🚀 Your code is ready to push!"
echo "📝 Next steps:"
echo "   1. git add ."
echo "   2. git commit -m 'Your commit message'"
echo "   3. git push origin your-branch"
echo ""
echo "💡 The CI/CD pipeline will run the same tests when you push"
echo "🔗 Merge to main branch will deploy to Render.com"
echo ""
