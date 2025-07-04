# midastechnical-wordpress

WordPress e-commerce platform for MDTS - Midas Technical Solutions

## 🌐 Live Site
- **Production**: https://midastechnical.com
- **Staging**: https://staging-[number].siteground.site

## 📋 Project Overview

This repository contains the WordPress codebase for midastechnical.com, a professional e-commerce platform built with WordPress and WooCommerce. The site was migrated from Next.js to WordPress to provide enhanced content management capabilities and better integration with repair desk software systems.

### **Key Features**
- **WordPress + WooCommerce** e-commerce platform
- **Custom MDTS Theme** with professional branding
- **Stripe Payment Integration** for secure transactions
- **SEO Optimized** with Yoast SEO
- **Mobile Responsive** design
- **Security Hardened** with Wordfence protection
- **Performance Optimized** with caching and CDN

## 🏗️ Architecture

### **Technology Stack**
- **CMS**: WordPress 6.4+
- **E-commerce**: WooCommerce
- **Hosting**: SiteGround GrowBig
- **SSL**: Let's Encrypt A+ rating
- **CDN**: SiteGround CDN
- **Database**: MySQL
- **PHP**: 8.1+

### **Custom Components**
- **MDTS Theme**: Custom WordPress theme (`wp-content/themes/mdts-theme/`)
- **Stripe Integration**: Custom payment plugin (`wp-content/plugins/mdts-stripe-integration/`)
- **Security Configuration**: Wordfence and custom security headers
- **Performance Optimization**: Multi-layer caching system

## 🚀 Deployment

### **Automated Deployment**
This repository uses GitHub Actions for automated deployment to SiteGround hosting:

- **Production Branch**: `main` → https://midastechnical.com
- **Staging Branch**: `staging` → SiteGround staging environment
- **Development**: Local development environment

### **Deployment Process**
1. **Push to branch** triggers GitHub Actions workflow
2. **Automated testing** runs security and compatibility checks
3. **Database backup** created before deployment
4. **Files deployed** via SFTP to SiteGround
5. **Cache cleared** and optimizations applied
6. **Notifications sent** on success/failure

## 📁 Repository Structure

```
midastechnical-wordpress/
├── wp-content/
│   ├── themes/
│   │   └── mdts-theme/           # Custom MDTS theme
│   ├── plugins/
│   │   └── mdts-stripe-integration/  # Custom Stripe plugin
│   └── mu-plugins/               # Must-use plugins
├── .github/
│   └── workflows/
│       ├── deploy-production.yml
│       └── deploy-staging.yml
├── config/
│   ├── wp-config-production.php
│   ├── wp-config-staging.php
│   └── .htaccess-production
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   └── rollback.sh
├── docs/
│   ├── deployment.md
│   ├── development.md
│   └── troubleshooting.md
├── .gitignore
├── README.md
└── composer.json
```

## 🔧 Development Setup

### **Local Development**
1. **Clone repository**:
   ```bash
   git clone https://github.com/CorporateGuuu/midastechnical-wordpress.git
   cd midastechnical-wordpress
   ```

2. **Install dependencies**:
   ```bash
   composer install
   npm install  # For theme development
   ```

3. **Configure local environment**:
   ```bash
   cp config/wp-config-sample.php wp-config.php
   # Update database credentials and settings
   ```

4. **Import database**:
   ```bash
   # Import staging database for local development
   mysql -u username -p database_name < staging-database.sql
   ```

### **Theme Development**
```bash
cd wp-content/themes/mdts-theme/
npm install
npm run dev    # Development mode with hot reload
npm run build  # Production build
```

## 🔒 Security

### **Security Features**
- **Wordfence Security**: Real-time threat protection
- **SSL Certificate**: A+ grade encryption
- **Security Headers**: Complete OWASP headers
- **File Permissions**: Proper WordPress permissions
- **Login Protection**: Brute force prevention
- **Regular Updates**: Automated security updates

### **Sensitive Data**
- **Database credentials** stored in GitHub Secrets
- **API keys** (Stripe, etc.) in environment variables
- **wp-config.php** excluded from repository
- **Uploads directory** excluded for security

## 📊 Monitoring & Analytics

### **Performance Monitoring**
- **Uptime**: 99.9% availability target
- **Page Speed**: <3 second load time
- **Core Web Vitals**: All "Good" ratings
- **SSL Monitoring**: Certificate expiration alerts

### **Analytics**
- **Google Analytics 4**: Traffic and conversion tracking
- **Google Search Console**: SEO performance monitoring
- **WooCommerce Analytics**: E-commerce metrics
- **Custom Dashboards**: Business intelligence

## 🛠️ Maintenance

### **Regular Tasks**
- **Security Updates**: Automated via GitHub Actions
- **Performance Optimization**: Monthly reviews
- **Database Cleanup**: Automated optimization
- **Backup Verification**: Daily backup checks
- **SSL Renewal**: Automated certificate renewal

### **Emergency Procedures**
- **Rollback**: Automated rollback to previous version
- **Backup Restoration**: Quick database/file restoration
- **Security Response**: Incident response procedures
- **Performance Issues**: Optimization protocols

## 📞 Support

### **Technical Support**
- **SiteGround**: 24/7 hosting support
- **WordPress**: Community documentation
- **WooCommerce**: Official support channels
- **Custom Development**: Internal team

### **Emergency Contacts**
- **Technical Lead**: [Your contact information]
- **Hosting Support**: SiteGround 24/7 chat
- **Domain Management**: [Domain registrar contact]

## 📝 Documentation

### **Additional Documentation**
- **[Deployment Guide](docs/deployment.md)**: Detailed deployment procedures
- **[Development Guide](docs/development.md)**: Local development setup
- **[Troubleshooting](docs/troubleshooting.md)**: Common issues and solutions
- **[Security Guide](docs/security.md)**: Security best practices

## 🤝 Contributing

### **Development Workflow**
1. **Create feature branch** from `staging`
2. **Make changes** and test locally
3. **Push to staging** for testing
4. **Create pull request** to `main`
5. **Review and merge** after approval
6. **Deploy to production** automatically

### **Code Standards**
- **WordPress Coding Standards**: Follow WordPress PHP standards
- **Theme Development**: Use WordPress best practices
- **Plugin Development**: Follow WordPress plugin guidelines
- **Security**: Regular security audits and updates

## 📄 License

This project is proprietary software for MDTS - Midas Technical Solutions. All rights reserved.

## 🎯 Project Status

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: [Current Date]
**Deployment**: Automated via GitHub Actions

---

**MDTS - Midas Technical Solutions**  
Professional WordPress E-commerce Platform  
https://midastechnical.com
