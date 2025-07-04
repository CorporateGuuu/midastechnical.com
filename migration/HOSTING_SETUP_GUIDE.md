# WordPress Hosting Setup Guide for MDTS Migration

## 🏗️ HOSTING PROVIDER RECOMMENDATIONS

### **Option 1: SiteGround (Recommended for Beginners)**
- **Plan**: GrowBig or GoGeek
- **Features**: Free SSL, CDN, daily backups, staging
- **Price**: $6.99-$14.99/month
- **Setup**: One-click WordPress install

### **Option 2: WP Engine (Premium Managed)**
- **Plan**: Startup or Growth
- **Features**: Managed updates, security, performance optimization
- **Price**: $20-$39/month
- **Setup**: Managed WordPress hosting

### **Option 3: Kinsta (High Performance)**
- **Plan**: Starter or Pro
- **Features**: Google Cloud, automatic scaling, premium support
- **Price**: $35-$70/month
- **Setup**: Managed WordPress with advanced features

### **Option 4: Cloudways (Cloud Hosting)**
- **Plan**: DigitalOcean or AWS
- **Features**: Flexible cloud hosting, pay-as-you-scale
- **Price**: $10-$80/month
- **Setup**: Cloud-based WordPress hosting

---

## 📋 STEP-BY-STEP HOSTING SETUP

### **Step 1: Purchase Hosting & Domain**

1. **Choose hosting provider** from recommendations above
2. **Select appropriate plan** based on your traffic expectations
3. **Purchase domain** (if transferring from current registrar)
4. **Configure DNS** to point to new hosting

### **Step 2: WordPress Installation**

#### **For Managed Hosting (SiteGround, WP Engine, Kinsta):**
```bash
# Use one-click installer from hosting control panel
# Most providers offer automatic WordPress installation
```

#### **For Manual Installation:**
```bash
# Download WordPress
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz

# Upload to hosting account via FTP/SFTP
# Create database through hosting control panel
# Run WordPress installation wizard
```

### **Step 3: SSL Certificate Setup**

Most hosting providers offer free SSL certificates:

1. **Enable SSL** in hosting control panel
2. **Force HTTPS** redirects
3. **Update WordPress URLs** to use HTTPS

```php
# Add to wp-config.php
define('FORCE_SSL_ADMIN', true);
if (strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false)
    $_SERVER['HTTPS']='on';
```

### **Step 4: Database Configuration**

Create database and user:

```sql
CREATE DATABASE mdts_wordpress;
CREATE USER 'mdts_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON mdts_wordpress.* TO 'mdts_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🔧 DOMAIN CONFIGURATION FOR MIDASTECHNICAL.COM

### **ZERO-DOWNTIME DNS CUTOVER STRATEGY**

#### **Phase 1: Preparation (Before Cutover)**
1. **Lower TTL values** 24-48 hours before migration:
```
A Record: @ → [Current Netlify IP] (TTL: 300 seconds)
A Record: www → [Current Netlify IP] (TTL: 300 seconds)
CNAME: * → midastechnical.com (TTL: 300 seconds)
```

2. **Prepare new hosting** with WordPress fully configured
3. **Test WordPress site** using temporary domain or hosts file

#### **Phase 2: DNS Cutover (Migration Day)**
```
# Primary domain records
A Record: @ → [New WordPress Hosting IP] (TTL: 300)
A Record: www → [New WordPress Hosting IP] (TTL: 300)

# Subdomain management
CNAME: blog → midastechnical.com (TTL: 300)
CNAME: shop → midastechnical.com (TTL: 300)
CNAME: api → midastechnical.com (TTL: 300)

# Email configuration (preserve existing)
MX Record: @ → [Current Email Provider] (Priority: 10, TTL: 3600)
TXT Record: @ → "v=spf1 include:[email-provider] ~all" (TTL: 3600)
TXT Record: _dmarc → "v=DMARC1; p=quarantine; rua=mailto:admin@midastechnical.com" (TTL: 3600)

# Domain verification records
TXT Record: @ → [WordPress hosting verification] (TTL: 3600)
TXT Record: @ → [Stripe domain verification] (TTL: 3600)
TXT Record: @ → [Google Search Console verification] (TTL: 3600)
```

#### **Phase 3: Post-Cutover (After Migration)**
1. **Monitor DNS propagation** using tools like whatsmydns.net
2. **Increase TTL values** back to normal (3600-86400) after 24 hours
3. **Verify all services** are working correctly

### **Domain Transfer Process**

1. **Unlock domain** at current registrar
2. **Get authorization code** (EPP code)
3. **Initiate transfer** at new registrar
4. **Confirm transfer** via email
5. **Update nameservers** to new hosting

### **Subdomain Setup (if needed)**

```
CNAME: blog → midastechnical.com
CNAME: shop → midastechnical.com
CNAME: api → midastechnical.com
```

---

## ⚙️ SERVER CONFIGURATION

### **PHP Configuration**

Recommended PHP settings for WooCommerce:

```ini
# php.ini or .htaccess
memory_limit = 512M
max_execution_time = 300
max_input_vars = 3000
upload_max_filesize = 64M
post_max_size = 64M
```

### **WordPress Configuration**

```php
# wp-config.php optimizations
define('WP_MEMORY_LIMIT', '512M');
define('WP_MAX_MEMORY_LIMIT', '512M');
define('WP_CACHE', true);
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);
define('CONCATENATE_SCRIPTS', false);
define('ENFORCE_GZIP', true);

# Security settings
define('DISALLOW_FILE_EDIT', true);
define('WP_POST_REVISIONS', 3);
define('AUTOSAVE_INTERVAL', 300);
```

### **Database Optimization**

```sql
# Optimize database tables
OPTIMIZE TABLE wp_posts;
OPTIMIZE TABLE wp_postmeta;
OPTIMIZE TABLE wp_options;

# Add indexes for better performance
ALTER TABLE wp_postmeta ADD INDEX meta_key_value (meta_key, meta_value(10));
```

---

## 🔒 SECURITY SETUP

### **Essential Security Plugins**

1. **Wordfence Security**
   - Firewall protection
   - Malware scanning
   - Login security

2. **iThemes Security**
   - Brute force protection
   - File change detection
   - Security hardening

### **Security Hardening**

```php
# .htaccess security rules
<Files wp-config.php>
order allow,deny
deny from all
</Files>

# Disable directory browsing
Options -Indexes

# Protect against script injection
<FilesMatch "\.(php|phtml|php3|php4|php5|pl|py|jsp|asp|sh|cgi)$">
order deny,allow
deny from all
</FilesMatch>
```

### **Backup Configuration**

1. **UpdraftPlus** - Automated backups to cloud storage
2. **BackWPup** - Comprehensive backup solution
3. **Hosting backups** - Use provider's backup service

---

## 📊 PERFORMANCE OPTIMIZATION

### **Caching Setup**

1. **WP Super Cache** or **W3 Total Cache**
2. **Object caching** (Redis/Memcached if available)
3. **CDN setup** (Cloudflare, MaxCDN)

### **Image Optimization**

1. **Smush** or **ShortPixel** for image compression
2. **WebP format** support
3. **Lazy loading** implementation

### **Database Optimization**

1. **WP-Optimize** for database cleanup
2. **Query optimization** plugins
3. **Regular maintenance** schedules

---

## 🚀 DEPLOYMENT CHECKLIST

### **Pre-Launch**
- [ ] WordPress installed and configured
- [ ] SSL certificate active
- [ ] Domain pointing to hosting
- [ ] Database created and optimized
- [ ] Security plugins installed
- [ ] Backup system configured

### **Post-Launch**
- [ ] Test all pages load correctly
- [ ] Verify SSL is working
- [ ] Check email functionality
- [ ] Test contact forms
- [ ] Verify payment processing
- [ ] Monitor site performance

### **Ongoing Maintenance**
- [ ] Regular WordPress updates
- [ ] Plugin and theme updates
- [ ] Security monitoring
- [ ] Performance optimization
- [ ] Regular backups
- [ ] Database maintenance

---

## 📞 SUPPORT CONTACTS

### **Hosting Support**
- **SiteGround**: 24/7 chat and phone support
- **WP Engine**: 24/7 expert WordPress support
- **Kinsta**: 24/7 premium support
- **Cloudways**: 24/7 technical support

### **Emergency Contacts**
- **Domain registrar** support
- **DNS provider** support
- **SSL certificate** provider
- **Payment processor** support

---

## 💡 TROUBLESHOOTING

### **Common Issues**

1. **Site not loading**: Check DNS propagation
2. **SSL errors**: Verify certificate installation
3. **Database connection**: Check credentials
4. **Plugin conflicts**: Deactivate and test
5. **Performance issues**: Check caching and optimization

### **Monitoring Tools**

1. **Google PageSpeed Insights**
2. **GTmetrix**
3. **Pingdom**
4. **UptimeRobot**
5. **Google Search Console**

This hosting setup will provide a solid foundation for your WordPress migration with proper security, performance, and scalability.
