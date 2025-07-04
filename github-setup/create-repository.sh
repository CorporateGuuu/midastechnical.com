#!/bin/bash

# GitHub Repository Creation Script for midastechnical-wordpress
# Creates the repository and sets up initial configuration

set -e

REPO_NAME="midastechnical-wordpress"
REPO_DESCRIPTION="WordPress e-commerce platform for MDTS - Midas Technical Solutions"
GITHUB_USERNAME="CorporateGuuu"

echo "🚀 Creating GitHub repository: $REPO_NAME"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo "Please run: gh auth login"
    exit 1
fi

# Create the repository
echo "📁 Creating private repository..."
gh repo create "$REPO_NAME" \
    --description "$REPO_DESCRIPTION" \
    --private \
    --clone

# Navigate to repository directory
cd "$REPO_NAME"

# Copy all setup files to repository
echo "📋 Setting up repository structure..."

# Copy .gitignore
cp ../github-setup/.gitignore .

# Copy README
cp ../github-setup/README.md .

# Copy GitHub Actions workflows
mkdir -p .github/workflows
cp ../github-setup/.github/workflows/* .github/workflows/

# Copy configuration files
mkdir -p config
cp ../github-setup/config/* config/

# Copy scripts
mkdir -p scripts
cp ../github-setup/scripts/* scripts/
chmod +x scripts/*.sh

# Copy composer and other config files
cp ../github-setup/composer.json .
cp ../github-setup/lighthouserc.json .

# Create additional directories
mkdir -p docs
mkdir -p wp-content/themes
mkdir -p wp-content/plugins
mkdir -p wp-content/mu-plugins

# Create placeholder files to maintain directory structure
touch wp-content/themes/.gitkeep
touch wp-content/plugins/.gitkeep
touch wp-content/mu-plugins/.gitkeep

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

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

# Create staging branch
echo "🌿 Creating staging branch..."
git checkout -b staging
git push -u origin staging

# Switch back to main
git checkout main

echo "✅ Repository created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up GitHub Secrets (see setup instructions below)"
echo "2. Export WordPress files from SiteGround"
echo "3. Add WordPress files to repository"
echo "4. Configure deployment pipeline"
echo ""
echo "🔐 Required GitHub Secrets:"
echo "Production:"
echo "  - SITEGROUND_HOST"
echo "  - SITEGROUND_USERNAME" 
echo "  - SITEGROUND_PASSWORD"
echo "  - SITEGROUND_SSH_KEY"
echo "  - DB_USERNAME"
echo "  - DB_PASSWORD"
echo "  - DB_NAME"
echo ""
echo "Staging:"
echo "  - SITEGROUND_STAGING_HOST"
echo "  - SITEGROUND_STAGING_USERNAME"
echo "  - SITEGROUND_STAGING_PASSWORD"
echo "  - SITEGROUND_STAGING_SSH_KEY"
echo "  - STAGING_DB_USERNAME"
echo "  - STAGING_DB_PASSWORD"
echo "  - STAGING_DB_NAME"
echo "  - STAGING_URL"
echo ""
echo "WordPress:"
echo "  - AUTH_KEY, SECURE_AUTH_KEY, LOGGED_IN_KEY, NONCE_KEY"
echo "  - AUTH_SALT, SECURE_AUTH_SALT, LOGGED_IN_SALT, NONCE_SALT"
echo ""
echo "Stripe:"
echo "  - STRIPE_PUBLISHABLE_KEY"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_WEBHOOK_SECRET"
echo "  - STRIPE_TEST_PUBLISHABLE_KEY"
echo "  - STRIPE_TEST_SECRET_KEY"
echo "  - STRIPE_TEST_WEBHOOK_SECRET"
echo ""
echo "Email:"
echo "  - SMTP_USER"
echo "  - SMTP_PASS"
echo "  - STAGING_SMTP_PASS"
echo ""
echo "🔗 Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
