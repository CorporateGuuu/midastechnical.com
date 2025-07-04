#!/bin/bash

# Manual GitHub Repository Creation for midastechnical-wordpress
# Creates repository structure locally for manual GitHub setup

set -e

REPO_NAME="midastechnical-wordpress"
REPO_DESCRIPTION="WordPress e-commerce platform for MDTS - Midas Technical Solutions"

echo "🚀 Creating local repository structure for $REPO_NAME"

# Create repository directory
mkdir -p "$REPO_NAME"
cd "$REPO_NAME"

# Initialize git repository
git init

# Copy all setup files to repository
echo "📋 Setting up repository structure..."

# Copy .gitignore
cp ../.gitignore .

# Copy README
cp ../README.md .

# Copy GitHub Actions workflows
mkdir -p .github/workflows
cp ../.github/workflows/* .github/workflows/

# Copy configuration files
mkdir -p config
cp ../config/* config/

# Copy scripts
mkdir -p scripts
cp ../scripts/* scripts/
chmod +x scripts/*.sh

# Copy composer and other config files
cp ../composer.json .
cp ../lighthouserc.json .

# Create additional directories
mkdir -p docs
mkdir -p wp-content/themes
mkdir -p wp-content/plugins
mkdir -p wp-content/mu-plugins

# Create placeholder files to maintain directory structure
touch wp-content/themes/.gitkeep
touch wp-content/plugins/.gitkeep
touch wp-content/mu-plugins/.gitkeep

# Copy documentation
cp ../docs/* docs/ 2>/dev/null || true

# Create initial documentation
cat > docs/deployment.md << 'EOF'
# Deployment Guide

## Overview
This document describes the deployment process for the midastechnical.com WordPress site.

## Environments
- **Production**: https://midastechnical.com
- **Staging**: https://staging-[number].siteground.site

## Deployment Process
1. Push changes to `staging` branch for testing
2. Create pull request to `main` branch
3. After approval, merge triggers production deployment

## Manual Deployment
```bash
# Deploy to staging
composer deploy-staging

# Deploy to production
composer deploy-production

# Rollback if needed
composer rollback
```

## Troubleshooting
See troubleshooting.md for common issues and solutions.
EOF

cat > docs/development.md << 'EOF'
# Development Guide

## Local Development Setup

### Prerequisites
- PHP 8.1+
- MySQL 5.7+
- Composer
- Node.js 16+

### Setup
1. Clone repository
2. Install dependencies: `composer install`
3. Configure wp-config.php
4. Import database
5. Start development

### Theme Development
```bash
cd wp-content/themes/mdts-theme
npm install
npm run dev
```

### Plugin Development
Custom plugins are located in `wp-content/plugins/mdts-*`

## Code Standards
- Follow WordPress Coding Standards
- Use PHP_CodeSniffer for linting
- Test all changes in staging environment
EOF

cat > docs/troubleshooting.md << 'EOF'
# Troubleshooting Guide

## Common Issues

### Deployment Failures
1. Check GitHub Actions logs
2. Verify SiteGround credentials
3. Check file permissions

### Site Not Loading
1. Check DNS propagation
2. Verify SSL certificate
3. Check .htaccess file

### Database Issues
1. Check database credentials
2. Verify database connectivity
3. Check for corrupted tables

### Performance Issues
1. Clear WordPress cache
2. Check plugin conflicts
3. Optimize database

## Emergency Procedures
- Rollback: `./scripts/rollback.sh`
- Emergency contact: [Your contact info]
EOF

# Create initial commit
echo "📝 Creating initial commit..."
git add .
git commit -m "Initial repository setup

- WordPress project structure
- GitHub Actions deployment pipeline
- Environment-specific configurations
- Security and performance optimizations
- Documentation and scripts"

echo "✅ Local repository created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Create GitHub repository manually at: https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Description: $REPO_DESCRIPTION"
echo "4. Set as Private repository"
echo "5. Do NOT initialize with README (we have our own)"
echo "6. Add remote and push:"
echo ""
echo "   git remote add origin https://github.com/CorporateGuuu/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "7. Create staging branch:"
echo "   git checkout -b staging"
echo "   git push -u origin staging"
echo ""
echo "8. Set up GitHub Secrets (see docs/github-secrets-setup.md)"
echo ""
echo "🔗 Repository will be at: https://github.com/CorporateGuuu/$REPO_NAME"
