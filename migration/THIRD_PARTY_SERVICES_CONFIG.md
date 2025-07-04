# Third-Party Services Configuration for midastechnical.com WordPress Migration

## 🎯 OVERVIEW
This guide covers the reconfiguration of all third-party services to work with the new WordPress installation on midastechnical.com.

---

## 💳 STRIPE PAYMENT PROCESSING

### **Current Configuration (Next.js)**
```
Webhook URL: https://midastechnical.com/api/webhooks/stripe
Domain: midastechnical.com (already verified)
```

### **New WordPress Configuration**
```
Webhook URL: https://midastechnical.com/wp-json/mdts/v1/stripe-webhook
Domain: midastechnical.com (keep existing verification)
```

### **Stripe Dashboard Updates Required**

#### **Step 1: Update Webhook Endpoints**
1. Login to Stripe Dashboard: https://dashboard.stripe.com/
2. Navigate to **Developers > Webhooks**
3. Find existing webhook for midastechnical.com
4. Update endpoint URL to: `https://midastechnical.com/wp-json/mdts/v1/stripe-webhook`
5. Ensure these events are selected:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

#### **Step 2: Business Profile Updates**
```
Business URL: https://midastechnical.com
Support URL: https://midastechnical.com/contact
Privacy Policy: https://midastechnical.com/privacy-policy
Terms of Service: https://midastechnical.com/terms-of-service
```

#### **Step 3: Domain Verification**
- Domain `midastechnical.com` should already be verified
- If not verified, add TXT record: `stripe-verification=[verification_code]`

#### **Step 4: Test Webhook**
```bash
# Test webhook endpoint after WordPress deployment
curl -X POST https://midastechnical.com/wp-json/mdts/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test" \
  -d '{"test": true}'
```

---

## 📧 EMAIL CONFIGURATION

### **Current Email Setup**
- Domain: @midastechnical.com
- Provider: [Current email provider]

### **WordPress Email Integration**

#### **SMTP Configuration**
```php
// Add to wp-config.php
define('SMTP_HOST', 'mail.midastechnical.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');
define('SMTP_AUTH', true);
define('SMTP_USER', 'noreply@midastechnical.com');
define('SMTP_PASS', 'your_email_password');
```

#### **Email Addresses to Configure**
```
Admin: admin@midastechnical.com
Support: support@midastechnical.com
Orders: orders@midastechnical.com
No-Reply: noreply@midastechnical.com
```

#### **WooCommerce Email Templates**
- Order confirmation: noreply@midastechnical.com
- Shipping notifications: orders@midastechnical.com
- Customer support: support@midastechnical.com

### **Email Provider Updates**

#### **If Using Google Workspace**
1. Update MX records (should remain the same)
2. Configure SMTP settings in WordPress
3. Test email delivery

#### **If Using External SMTP Service**
1. Update sending domain to midastechnical.com
2. Configure SPF/DKIM records
3. Update SMTP credentials in WordPress

---

## 🔍 GOOGLE SERVICES

### **Google Search Console**
#### **Current Setup**
- Property: https://midastechnical.com
- Verification: [Current verification method]

#### **WordPress Updates Required**
1. **Verify WordPress site** (verification should carry over)
2. **Submit new sitemap**: `https://midastechnical.com/sitemap.xml`
3. **Update robots.txt** if needed
4. **Monitor crawl errors** after migration

### **Google Analytics**
#### **Current Setup**
- Property: midastechnical.com
- Tracking ID: [Current GA4 ID]

#### **WordPress Integration**
1. **Install Google Analytics plugin** or add tracking code
2. **Verify tracking** is working on new WordPress site
3. **Set up enhanced ecommerce** tracking for WooCommerce
4. **Configure conversion goals** for WordPress

### **Google My Business**
#### **Updates Required**
1. **Website URL**: Confirm https://midastechnical.com
2. **Contact information**: Verify all details
3. **Business hours**: Update if changed
4. **Photos**: Add new WordPress site screenshots

---

## 🛡️ SECURITY SERVICES

### **SSL Certificate**
#### **Current**: Netlify SSL
#### **New**: Hosting provider SSL

**Migration Steps:**
1. **Install SSL certificate** on new hosting
2. **Verify certificate** covers midastechnical.com and www.midastechnical.com
3. **Test SSL rating** at ssllabs.com
4. **Force HTTPS** in WordPress settings

### **Security Monitoring**
#### **If Using External Security Service**
1. **Update monitored domain** to point to new hosting
2. **Configure firewall rules** for WordPress
3. **Set up malware scanning** for WordPress files
4. **Update security notifications** email addresses

---

## 📊 ANALYTICS & MONITORING

### **Performance Monitoring**
#### **Current Tools**: [List current monitoring tools]
#### **WordPress Setup**:
1. **Configure uptime monitoring** for midastechnical.com
2. **Set up performance monitoring** (GTmetrix, Pingdom)
3. **Configure alerts** for downtime or performance issues

### **Error Tracking**
#### **If Using Sentry or Similar**
1. **Create new WordPress project**
2. **Install WordPress error tracking plugin**
3. **Configure error reporting** for midastechnical.com
4. **Set up alert notifications**

---

## 🔗 CDN & PERFORMANCE

### **Content Delivery Network**
#### **Current**: Netlify CDN
#### **New Options**:
1. **Cloudflare** (Recommended)
   - Add midastechnical.com to Cloudflare
   - Configure DNS through Cloudflare
   - Enable caching and optimization

2. **Hosting Provider CDN**
   - Enable CDN through hosting control panel
   - Configure caching rules

### **Image Optimization**
#### **Current**: Next.js Image Optimization
#### **WordPress**: 
1. **Install image optimization plugin** (Smush, ShortPixel)
2. **Configure WebP conversion**
3. **Set up lazy loading**

---

## 🛒 E-COMMERCE INTEGRATIONS

### **Inventory Management**
#### **If Using External Inventory System**
1. **Update API endpoints** to WordPress/WooCommerce
2. **Configure webhook URLs** for inventory updates
3. **Test product sync** functionality

### **Shipping Providers**
#### **Current Integrations**: [List shipping providers]
#### **WordPress Setup**:
1. **Install WooCommerce shipping plugins**
2. **Configure shipping provider APIs**
3. **Update webhook URLs** for tracking updates

### **Marketplace Integrations**
#### **If Selling on Amazon, eBay, etc.**
1. **Update product feed URLs**
2. **Configure new API endpoints**
3. **Test order synchronization**

---

## 📱 MOBILE APP INTEGRATIONS

### **If You Have Mobile Apps**
#### **API Endpoint Updates**
```
Old: https://midastechnical.com/api/
New: https://midastechnical.com/wp-json/wc/v3/
```

#### **Required Updates**
1. **Update API base URLs** in mobile apps
2. **Test authentication** with WordPress
3. **Verify product data** synchronization
4. **Update app store listings** if needed

---

## 🔄 BACKUP & RECOVERY

### **Backup Services**
#### **WordPress Backup Setup**
1. **Configure automated backups** (UpdraftPlus, BackWPup)
2. **Set backup schedule** (daily for database, weekly for files)
3. **Configure cloud storage** for backups
4. **Test backup restoration** process

---

## ✅ VERIFICATION CHECKLIST

### **Pre-Migration Testing**
- [ ] Stripe webhook responds correctly
- [ ] Email sending works from WordPress
- [ ] Google Analytics tracking active
- [ ] SSL certificate valid
- [ ] All APIs responding correctly

### **Post-Migration Verification**
- [ ] All payment processing working
- [ ] Email notifications sending
- [ ] Analytics data flowing
- [ ] Search Console updated
- [ ] Security monitoring active
- [ ] Performance monitoring configured

### **Service-by-Service Testing**
- [ ] **Stripe**: Test payment processing
- [ ] **Email**: Send test emails
- [ ] **Google Analytics**: Verify tracking
- [ ] **Search Console**: Check for errors
- [ ] **SSL**: Verify certificate
- [ ] **CDN**: Test content delivery
- [ ] **Monitoring**: Verify alerts working

---

## 📞 SUPPORT CONTACTS

### **Service Provider Support**
- **Stripe**: support@stripe.com
- **Google**: Google Support Center
- **Hosting Provider**: [Your hosting support]
- **Email Provider**: [Your email provider support]

### **Emergency Procedures**
1. **Payment Issues**: Contact Stripe immediately
2. **Email Problems**: Check SMTP settings first
3. **SSL Issues**: Contact hosting provider
4. **Analytics Problems**: Verify tracking code installation

This comprehensive service reconfiguration ensures all third-party integrations continue working seamlessly with your new WordPress installation on midastechnical.com.
