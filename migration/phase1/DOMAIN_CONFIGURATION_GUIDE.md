# Domain-Specific Configuration for midastechnical.com

## 🎯 OBJECTIVE
Apply domain-specific WordPress configurations using wp-config-midastechnical.php settings and optimize for midastechnical.com.

---

## 📋 WP-CONFIG.PHP CONFIGURATION

### **Step 1: Access File Manager**

#### **Via SiteGround File Manager:**
1. **Login to SiteGround Site Tools**
2. **Navigate to**: Site → File Manager
3. **Open**: public_html directory
4. **Locate**: wp-config.php file

#### **Via FTP/SFTP (Alternative):**
1. **Connect**: Using SiteGround FTP credentials
2. **Navigate to**: public_html directory
3. **Download**: wp-config.php for backup
4. **Edit**: wp-config.php file

### **Step 2: Backup Current wp-config.php**

1. **Create backup**: wp-config-backup.php
2. **Copy**: Current wp-config.php content
3. **Save**: Backup in safe location

### **Step 3: Apply Domain-Specific Settings**

Replace the existing wp-config.php with optimized settings for midastechnical.com:

#### **Database Configuration (Keep Existing)**
```php
// Keep your existing database settings
define('DB_NAME', 'midastechnical_wp');
define('DB_USER', 'your_db_user');
define('DB_PASSWORD', 'your_db_password');
define('DB_HOST', 'localhost');
```

#### **Domain-Specific URLs**
```php
// Force midastechnical.com URLs
define('WP_HOME', 'https://midastechnical.com');
define('WP_SITEURL', 'https://midastechnical.com');

// For staging, temporarily use:
// define('WP_HOME', 'https://staging-123456.siteground.site');
// define('WP_SITEURL', 'https://staging-123456.siteground.site');
```

#### **SSL and Security**
```php
// Force SSL for midastechnical.com
define('FORCE_SSL_ADMIN', true);
if (strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false) {
    $_SERVER['HTTPS'] = 'on';
}

// Security enhancements
define('DISALLOW_FILE_EDIT', true);
define('WP_POST_REVISIONS', 3);
define('AUTOSAVE_INTERVAL', 300);
```

#### **Performance Optimization**
```php
// Memory and performance
define('WP_MEMORY_LIMIT', '512M');
define('WP_MAX_MEMORY_LIMIT', '512M');
define('WP_CACHE', true);
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);
```

#### **Email Configuration**
```php
// Email settings for @midastechnical.com
define('SMTP_HOST', 'mail.midastechnical.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');
define('SMTP_AUTH', true);
define('SMTP_USER', 'noreply@midastechnical.com');
define('SMTP_PASS', 'your_email_password');
```

---

## 🔧 WORDPRESS ADMIN CONFIGURATION

### **Step 1: Update WordPress URLs**

1. **Navigate to**: Settings → General
2. **Update URLs** (for staging, use staging URL):
   ```
   WordPress Address (URL): https://staging-123456.siteground.site
   Site Address (URL): https://staging-123456.siteground.site
   ```
   
   **Note**: Change to https://midastechnical.com during DNS cutover

### **Step 2: Configure Email Settings**

#### **WordPress Email Configuration**
1. **Navigate to**: Settings → General
2. **Administration Email Address**: admin@midastechnical.com

#### **WooCommerce Email Settings**
1. **Navigate to**: WooCommerce → Settings → Emails
2. **Configure email addresses**:
   ```
   "From" Name: MDTS - Midas Technical Solutions
   "From" Address: noreply@midastechnical.com
   ```

### **Step 3: SMTP Plugin Configuration** (If needed)

If emails aren't sending properly:

1. **Install**: WP Mail SMTP plugin
2. **Configure**:
   ```
   Mailer: Other SMTP
   SMTP Host: mail.midastechnical.com
   Encryption: TLS
   SMTP Port: 587
   Authentication: ON
   SMTP Username: noreply@midastechnical.com
   SMTP Password: [Your email password]
   ```

---

## 🛒 WOOCOMMERCE DOMAIN CONFIGURATION

### **Step 1: Store Address Configuration**

1. **Navigate to**: WooCommerce → Settings → General
2. **Configure store details**:
   ```
   Store Address: [Your business address]
   City: [Your city]
   Country/State: United States (US) — [Your state]
   Postcode/ZIP: [Your ZIP code]
   ```

### **Step 2: Email Template Customization**

1. **Navigate to**: WooCommerce → Settings → Emails
2. **Customize email templates**:
   ```
   Header Image: [Upload MDTS logo]
   Footer Text: © 2024 MDTS - Midas Technical Solutions. All rights reserved.
   Base Color: #2563eb (MDTS blue)
   Background Color: #f8f9fa
   Body Background Color: #ffffff
   Body Text Color: #333333
   ```

### **Step 3: Checkout Configuration**

1. **Navigate to**: WooCommerce → Settings → Advanced → Checkout
2. **Configure checkout pages**:
   ```
   Cart Page: /cart/
   Checkout Page: /checkout/
   My Account Page: /my-account/
   Terms and Conditions: [Create and link terms page]
   ```

---

## 🔒 SECURITY CONFIGURATION

### **Step 1: WordPress Security Settings**

1. **Navigate to**: Settings → General
2. **Membership**: Uncheck "Anyone can register"
3. **Default Role**: Customer (for WooCommerce)

### **Step 2: Wordfence Domain Configuration**

1. **Navigate to**: Wordfence → Firewall → All Firewall Options
2. **Configure**:
   ```
   Whitelisted URLs: 
   - /wp-admin/admin-ajax.php
   - /wp-json/
   - /checkout/
   - /my-account/
   ```

### **Step 3: Login Security**

1. **Navigate to**: Wordfence → Login Security
2. **Configure**:
   ```
   Enable 2FA: For admin users
   XML-RPC Access: Disabled
   Login Attempts: 5 attempts, 20 minute lockout
   ```

---

## 📊 SEO DOMAIN CONFIGURATION

### **Step 1: Yoast SEO Site Settings**

1. **Navigate to**: SEO → General → Site Representation
2. **Configure**:
   ```
   Website represents: A company
   Company name: MDTS - Midas Technical Solutions
   Company logo: [Upload MDTS logo]
   ```

### **Step 2: Social Media Configuration**

1. **Navigate to**: SEO → Social
2. **Configure social profiles**:
   ```
   Facebook: https://facebook.com/midastechnical
   Twitter: @midastechnical
   Instagram: https://instagram.com/midastechnical
   LinkedIn: https://linkedin.com/company/midastechnical
   ```

### **Step 3: Local SEO (If applicable)**

1. **Configure business information**:
   ```
   Business Type: Electronics Store
   Business Address: [Your business address]
   Phone: [Your business phone]
   Opening Hours: [Your business hours]
   ```

---

## 🔧 PERFORMANCE OPTIMIZATION

### **Step 1: Caching Configuration**

1. **WP Super Cache**: Already configured
2. **SiteGround Caching**: 
   - Navigate to SiteGround Site Tools → Speed → Caching
   - Enable Dynamic Caching
   - Enable Browser Caching

### **Step 2: Image Optimization**

1. **Configure Smush** (if installed):
   ```
   Compression Level: Lossy (recommended)
   Resize Images: Enable (max width: 1200px)
   Lazy Loading: Enable
   WebP Conversion: Enable
   ```

### **Step 3: Database Optimization**

1. **Install**: WP-Optimize plugin (optional)
2. **Configure**: Weekly database cleanup
3. **Remove**: Spam comments, revisions, transients

---

## ✅ VERIFICATION CHECKLIST

### **Domain Configuration Complete**
- [ ] wp-config.php updated with domain-specific settings
- [ ] WordPress URLs configured (staging for now)
- [ ] SSL settings applied and working
- [ ] Email configuration tested
- [ ] Performance settings optimized

### **WooCommerce Configuration**
- [ ] Store address and details configured
- [ ] Email templates customized with MDTS branding
- [ ] Checkout pages properly configured
- [ ] Currency and tax settings applied

### **Security Configuration**
- [ ] Wordfence configured for midastechnical.com
- [ ] Login security enabled
- [ ] File editing disabled
- [ ] User registration properly configured

### **SEO Configuration**
- [ ] Yoast SEO configured with company details
- [ ] Social media profiles linked
- [ ] Local business information added
- [ ] XML sitemap generated

### **Performance Configuration**
- [ ] Caching enabled and working
- [ ] Image optimization active
- [ ] Database optimization scheduled
- [ ] CDN configured (SiteGround)

---

## 🚨 IMPORTANT NOTES

### **Staging vs. Production URLs**

**Current Configuration (Staging):**
```
WP_HOME: https://staging-123456.siteground.site
WP_SITEURL: https://staging-123456.siteground.site
```

**Production Configuration (After DNS Cutover):**
```
WP_HOME: https://midastechnical.com
WP_SITEURL: https://midastechnical.com
```

### **Email Testing**

1. **Test email sending**: Use Contact Form 7 or WooCommerce test
2. **Check spam folders**: Ensure emails aren't marked as spam
3. **Verify SMTP**: Use WP Mail SMTP test feature

### **Security Considerations**

- Keep wp-config.php secure (proper file permissions)
- Use strong passwords for all accounts
- Enable 2FA for admin users
- Regular security scans with Wordfence

---

## 🚀 NEXT STEPS

1. **Proceed to SSL Certificate Setup** (Task 1.6)
2. **Test all configurations**
3. **Verify email functionality**
4. **Check performance metrics**

**Important Notes:**
- All configurations optimized for midastechnical.com
- Staging URLs in use until DNS cutover
- Security and performance enhanced
- Email system configured for @midastechnical.com domain

This completes the domain-specific configuration. WordPress is now optimized specifically for midastechnical.com with proper security, performance, and branding settings.
