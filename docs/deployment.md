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
