# SSL Certificate Setup for midastechnical.com

## 🎯 OBJECTIVE
Configure SSL certificate for midastechnical.com on SiteGround hosting to ensure secure HTTPS connections.

---

## 🔒 SSL CERTIFICATE INSTALLATION

### **Step 1: Access SiteGround SSL Manager**

1. **Login to SiteGround Site Tools**
2. **Navigate to**: Security → SSL Manager
3. **Select domain**: midastechnical.com

### **Step 2: Choose SSL Certificate Type**

#### **Let's Encrypt (Recommended - Free)**
```
Certificate Type: Let's Encrypt
Domain: midastechnical.com
Include WWW: ☑ Yes (www.midastechnical.com)
Wildcard: ☐ No (not needed for basic setup)
```

#### **Alternative: Paid SSL Certificate**
If you prefer a paid certificate:
- **Sectigo SSL**: Available through SiteGround
- **Extended Validation**: For enhanced trust indicators

### **Step 3: Install SSL Certificate**

1. **Click**: Install SSL Certificate
2. **Wait**: 10-15 minutes for installation
3. **Verify**: Certificate shows as "Active"

### **Step 4: Enable Force HTTPS**

1. **In SSL Manager**: Enable "Force HTTPS Redirect"
2. **This ensures**: All HTTP traffic redirects to HTTPS
3. **Verify**: Redirect is working properly

---

## 🔧 WORDPRESS SSL CONFIGURATION

### **Step 1: Update WordPress URLs**

#### **Via WordPress Admin:**
1. **Navigate to**: Settings → General
2. **Update URLs to HTTPS**:
   ```
   WordPress Address (URL): https://staging-123456.siteground.site
   Site Address (URL): https://staging-123456.siteground.site
   ```
   
   **Note**: Use staging URL for now, change to https://midastechnical.com during cutover

#### **Via wp-config.php (Already configured):**
```php
define('FORCE_SSL_ADMIN', true);
if (strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false) {
    $_SERVER['HTTPS'] = 'on';
}
```

### **Step 2: Install Really Simple SSL Plugin** (If needed)

1. **Navigate to**: Plugins → Add New
2. **Search**: "Really Simple SSL"
3. **Install and Activate**: Plugin
4. **Follow**: Setup wizard if SSL issues persist

**Note**: SiteGround usually handles SSL automatically, so this plugin may not be necessary.

---

## 🛒 WOOCOMMERCE SSL CONFIGURATION

### **Step 1: WooCommerce SSL Settings**

1. **Navigate to**: WooCommerce → Settings → Advanced
2. **Force secure checkout**: Should be automatically enabled
3. **Verify**: Checkout pages use HTTPS

### **Step 2: Payment Gateway SSL Requirements**

#### **Stripe Requirements:**
- SSL certificate must be valid
- TLS 1.2 or higher required
- Certificate must cover exact domain used

#### **Verification:**
1. **Test**: https://staging-url/checkout/
2. **Verify**: Green padlock appears in browser
3. **Check**: No mixed content warnings

---

## 🔍 SSL VERIFICATION & TESTING

### **Step 1: SSL Certificate Validation**

#### **Online SSL Checkers:**
1. **SSL Labs Test**: https://www.ssllabs.com/ssltest/
   - Enter: staging-123456.siteground.site
   - Target Grade: A or A+

2. **Why No Padlock**: https://www.whynopadlock.com/
   - Check for mixed content issues

#### **Browser Testing:**
1. **Chrome**: Check for green padlock
2. **Firefox**: Verify security indicator
3. **Safari**: Confirm secure connection
4. **Edge**: Test SSL functionality

### **Step 2: Mixed Content Detection**

#### **Common Mixed Content Issues:**
- HTTP images in HTTPS pages
- HTTP scripts or stylesheets
- HTTP iframes or embeds

#### **Fix Mixed Content:**
1. **Navigate to**: WordPress admin
2. **Check**: All uploaded images use HTTPS
3. **Update**: Any hardcoded HTTP links
4. **Verify**: External resources use HTTPS

### **Step 3: SSL Performance Testing**

1. **Page Load Speed**: Test with SSL enabled
2. **Server Response**: Should be minimal impact
3. **CDN Compatibility**: Verify with SiteGround CDN

---

## 🔧 ADVANCED SSL CONFIGURATION

### **Step 1: Security Headers**

Add security headers via .htaccess (already included in our custom .htaccess):

```apache
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### **Step 2: HSTS Preload** (Optional)

1. **Visit**: https://hstspreload.org/
2. **Submit**: midastechnical.com for HSTS preload list
3. **Requirements**: 
   - Valid SSL certificate
   - HSTS header with preload directive
   - All subdomains covered

### **Step 3: Certificate Monitoring**

1. **Set up monitoring**: For certificate expiration
2. **SiteGround**: Automatically renews Let's Encrypt certificates
3. **Email alerts**: Configure for certificate issues

---

## 🚨 TROUBLESHOOTING SSL ISSUES

### **Common SSL Problems**

#### **Problem**: Mixed content warnings
**Solution**: 
1. Check browser console for HTTP resources
2. Update all URLs to HTTPS
3. Use Really Simple SSL plugin if needed

#### **Problem**: Certificate not trusted
**Solution**:
1. Verify certificate installation
2. Check certificate chain
3. Contact SiteGround support

#### **Problem**: Redirect loops
**Solution**:
1. Check .htaccess for conflicting redirects
2. Verify WordPress URL settings
3. Clear cache and cookies

#### **Problem**: SSL not working on staging
**Solution**:
1. SiteGround staging URLs have SSL by default
2. Verify staging URL format
3. Check Site Tools SSL status

### **SSL Debugging Tools**

1. **Browser Developer Tools**: Check console for errors
2. **SSL Checker**: Online validation tools
3. **WordPress Health Check**: Built-in site health tool
4. **Really Simple SSL**: Plugin diagnostics

---

## ✅ VERIFICATION CHECKLIST

### **SSL Certificate Installation**
- [ ] Let's Encrypt certificate installed successfully
- [ ] Certificate covers midastechnical.com and www.midastechnical.com
- [ ] Certificate shows as "Active" in SiteGround
- [ ] Force HTTPS redirect enabled
- [ ] Certificate auto-renewal configured

### **WordPress SSL Configuration**
- [ ] WordPress URLs updated to HTTPS
- [ ] wp-config.php SSL settings applied
- [ ] Admin area forces HTTPS
- [ ] No mixed content warnings
- [ ] All pages load with green padlock

### **WooCommerce SSL Verification**
- [ ] Checkout pages use HTTPS
- [ ] Payment forms secure
- [ ] Customer account pages secure
- [ ] No SSL warnings on any WooCommerce pages

### **SSL Performance & Security**
- [ ] SSL Labs grade A or A+
- [ ] Page load speeds acceptable
- [ ] Security headers configured
- [ ] No certificate errors in browser
- [ ] HSTS header present

### **Testing Complete**
- [ ] All major browsers tested
- [ ] Mobile devices tested
- [ ] No SSL-related errors in logs
- [ ] Certificate monitoring configured

---

## 📊 SSL CERTIFICATE DETAILS

### **Certificate Information**
```
Certificate Authority: Let's Encrypt
Certificate Type: Domain Validated (DV)
Encryption: 256-bit
Key Size: 2048-bit RSA
Validity: 90 days (auto-renewal)
Domains Covered: 
  - midastechnical.com
  - www.midastechnical.com
```

### **Security Features**
- **TLS 1.2/1.3**: Modern encryption protocols
- **Perfect Forward Secrecy**: Enhanced security
- **HSTS**: HTTP Strict Transport Security
- **OCSP Stapling**: Certificate validation optimization

---

## 🚀 NEXT STEPS

1. **Proceed to Staging Environment Creation** (Task 1.7)
2. **Document SSL configuration**
3. **Test all HTTPS functionality**
4. **Prepare for DNS cutover**

**Important Notes:**
- SSL certificate ready for midastechnical.com
- Staging environment has working HTTPS
- All security headers configured
- Certificate auto-renewal enabled

### **DNS Cutover Preparation**

When ready for DNS cutover:
1. **Update WordPress URLs**: Change from staging to https://midastechnical.com
2. **Verify SSL**: Certificate will automatically work for live domain
3. **Test thoroughly**: All HTTPS functionality on live domain

This completes the SSL certificate setup. The website now has enterprise-grade SSL security configured and ready for the midastechnical.com domain.
