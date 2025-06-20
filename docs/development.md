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
