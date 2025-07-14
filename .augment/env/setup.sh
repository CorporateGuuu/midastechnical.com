#!/bin/bash

# Update system packages
sudo apt-get update

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PHP 8.1 and required extensions
sudo apt-get install -y php8.1 php8.1-cli php8.1-common php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Python 3 and pip
sudo apt-get install -y python3 python3-pip

# Add executables to PATH in user profile
echo 'export PATH="/usr/local/bin:$PATH"' >> $HOME/.profile
echo 'export PATH="/usr/bin:$PATH"' >> $HOME/.profile
echo 'export PATH="$HOME/.local/bin:$PATH"' >> $HOME/.profile

# Source the profile
source $HOME/.profile

# Navigate to deployment directory and install Node.js dependencies
cd deployment
npm install

# Create a minimal Next.js structure if it doesn't exist
if [ ! -d "pages" ] && [ ! -d "app" ]; then
  echo "Creating minimal Next.js structure for testing..."
  
  # Create pages directory
  mkdir -p pages
  mkdir -p pages/api
  mkdir -p components
  mkdir -p lib
  mkdir -p public
  
  # Create a basic index page
  cat > pages/index.js << 'EOF'
import React from 'react';

export default function Home() {
  return (
    <div>
      <h1>Midas Technical Solutions</h1>
      <p>E-commerce platform for device repair services</p>
    </div>
  );
}
EOF

  # Create a basic API route
  cat > pages/api/health.js << 'EOF'
export default function handler(req, res) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
EOF

  # Create a basic component
  mkdir -p components
  cat > components/Header.js << 'EOF'
import React from 'react';

export default function Header() {
  return (
    <header>
      <h1>Midas Technical Solutions</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
  );
}
EOF

  # Create a basic lib file
  cat > lib/utils.js << 'EOF'
export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
EOF
fi

# Create next.config.js if it doesn't exist
if [ ! -f "next.config.js" ]; then
  cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['localhost', 'midastechnical.com'],
  },
  env: {
    CUSTOM_KEY: 'test-value',
  },
}

module.exports = nextConfig
EOF
fi

# Create jest.config.js with correct configuration
cat > jest.config.js << 'EOF'
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

module.exports = createJestConfig(customJestConfig)
EOF

# Create jest.setup.js
cat > jest.setup.js << 'EOF'
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />
  },
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
EOF

# Create test files
mkdir -p __tests__

# Basic utility tests
cat > __tests__/utils.test.js << 'EOF'
import { formatPrice, slugify } from '../lib/utils'

describe('Utils', () => {
  describe('formatPrice', () => {
    test('should format price correctly', () => {
      expect(formatPrice(19.99)).toBe('$19.99')
      expect(formatPrice(100)).toBe('$100.00')
    })
  })

  describe('slugify', () => {
    test('should create slug from text', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Test Product Name!')).toBe('test-product-name')
    })
  })
})
EOF

# Component tests
cat > __tests__/Header.test.js << 'EOF'
import { render, screen } from '@testing-library/react'
import Header from '../components/Header'

describe('Header', () => {
  test('renders header with title', () => {
    render(<Header />)
    expect(screen.getByText('Midas Technical Solutions')).toBeInTheDocument()
  })

  test('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })
})
EOF

# Page tests
cat > __tests__/index.test.js << 'EOF'
import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Home Page', () => {
  test('renders home page', () => {
    render(<Home />)
    expect(screen.getByText('Midas Technical Solutions')).toBeInTheDocument()
    expect(screen.getByText('E-commerce platform for device repair services')).toBeInTheDocument()
  })
})
EOF

# API tests
cat > __tests__/api.test.js << 'EOF'
import handler from '../pages/api/health'
import { createMocks } from 'node-mocks-http'

describe('/api/health', () => {
  test('returns health status', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.status).toBe('ok')
    expect(data.timestamp).toBeDefined()
  })
})
EOF

# Install additional test dependencies
npm install --save-dev node-mocks-http

# Install Python dependencies if requirements.txt exists
cd ..
if [ -f "Scripts/requirements.txt" ]; then
  pip3 install -r Scripts/requirements.txt
fi

# Install PHP dependencies if composer.json exists
if [ -f "composer.json" ]; then
  composer install --no-dev --optimize-autoloader
fi

# Install dependencies for svelte-kanban if it exists
if [ -d "svelte-kanban-main" ]; then
  cd svelte-kanban-main
  npm install
  cd ..
fi

# Install root level Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
  npm install
fi

echo "Setup completed successfully!"