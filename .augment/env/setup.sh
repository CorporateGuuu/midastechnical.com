#!/bin/bash

# Setup script for Next.js e-commerce application
set -e

echo "🚀 Setting up Next.js e-commerce application environment..."

# Update system packages
sudo apt-get update -y

# Install Node.js 18 (LTS) and npm
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js and npm installation
node --version
npm --version

# Navigate to project directory
cd /mnt/persist/workspace

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Create __mocks__ directory and fileMock.js if it doesn't exist
echo "🔧 Setting up test mocks..."
mkdir -p __mocks__
if [ ! -f "__mocks__/fileMock.js" ]; then
  cat > __mocks__/fileMock.js << 'EOF'
module.exports = 'test-file-stub';
EOF
fi

# Ensure jest setup file exists
if [ ! -f "jest.setup.js" ]; then
  echo "⚠️  jest.setup.js not found, creating basic setup..."
  cat > jest.setup.js << 'EOF'
import '@testing-library/jest-dom';
EOF
fi

# Add Node.js and npm to PATH in user profile
echo "🔧 Adding Node.js to PATH..."
echo 'export PATH="/usr/bin:$PATH"' >> $HOME/.profile
echo 'export NODE_PATH="/usr/lib/node_modules"' >> $HOME/.profile

# Source the profile to make changes available
source $HOME/.profile

echo "✅ Setup completed successfully!"
echo "📋 Environment summary:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - Project dependencies: Installed"
echo "  - Test framework: Jest with React Testing Library"
echo "  - Test files found in: __tests__/, tests/, components/**/__tests__/"