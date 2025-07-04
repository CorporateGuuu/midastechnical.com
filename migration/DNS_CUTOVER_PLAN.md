# DNS Cutover Plan for midastechnical.com Migration

## 🎯 OBJECTIVE
Execute zero-downtime migration from Netlify (Next.js) to WordPress hosting while preserving all domain authority and search rankings.

---

## 📋 PRE-CUTOVER PREPARATION (48 Hours Before)

### **Step 1: Lower TTL Values**
```bash
# Current DNS settings (48 hours before migration)
# Reduce TTL to 300 seconds (5 minutes) for faster propagation

A Record: @ → [Current Netlify IP] (TTL: 300)
A Record: www → [Current Netlify IP] (TTL: 300)
CNAME: * → midastechnical.com (TTL: 300)
```

### **Step 2: WordPress Environment Preparation**
- [ ] WordPress fully installed and configured on new hosting
- [ ] All data imported and verified
- [ ] SSL certificate installed for midastechnical.com
- [ ] All plugins activated and configured
- [ ] Theme customized and tested
- [ ] 301 redirects implemented and tested

### **Step 3: Testing Environment Setup**
```bash
# Test WordPress site using hosts file modification
# Add to /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
[New WordPress Hosting IP] midastechnical.com
[New WordPress Hosting IP] www.midastechnical.com
```

### **Step 4: Final Verification Checklist**
- [ ] WordPress site loads correctly on new hosting
- [ ] All pages and functionality work
- [ ] SSL certificate is valid
- [ ] Payment processing works (test mode)
- [ ] Email functionality verified
- [ ] All redirects working properly

---

## 🚀 CUTOVER EXECUTION (Migration Day)

### **Timeline: Saturday 2:00 AM EST (Low Traffic Period)**

#### **T-60 Minutes: Final Preparations**
- [ ] Backup current Netlify site
- [ ] Export latest data from Next.js application
- [ ] Import final data to WordPress
- [ ] Verify all content is current
- [ ] Notify team of impending cutover

#### **T-30 Minutes: Pre-Cutover Checks**
- [ ] Verify WordPress site functionality
- [ ] Check SSL certificate validity
- [ ] Test payment processing
- [ ] Confirm backup systems are ready
- [ ] Prepare rollback plan

#### **T-0: DNS Cutover Execution**

**Step 1: Update A Records (Immediate)**
```bash
# Primary domain records
A Record: @ → [New WordPress Hosting IP] (TTL: 300)
A Record: www → [New WordPress Hosting IP] (TTL: 300)

# Subdomain records
CNAME: blog → midastechnical.com (TTL: 300)
CNAME: shop → midastechnical.com (TTL: 300)
CNAME: api → midastechnical.com (TTL: 300)
```

**Step 2: Preserve Email Settings**
```bash
# Keep existing email configuration
MX Record: @ → mail.midastechnical.com (Priority: 10, TTL: 3600)
TXT Record: @ → "v=spf1 include:_spf.google.com ~all" (TTL: 3600)
TXT Record: _dmarc → "v=DMARC1; p=quarantine; rua=mailto:admin@midastechnical.com" (TTL: 3600)
```

**Step 3: Add Verification Records**
```bash
# Domain verification for services
TXT Record: @ → [WordPress hosting verification] (TTL: 3600)
TXT Record: @ → [Stripe domain verification] (TTL: 3600)
TXT Record: @ → [Google Search Console verification] (TTL: 3600)
```

#### **T+5 Minutes: Initial Verification**
- [ ] Check DNS propagation using whatsmydns.net
- [ ] Verify site loads on new hosting
- [ ] Test SSL certificate
- [ ] Check basic functionality

#### **T+15 Minutes: Comprehensive Testing**
- [ ] Test all major pages
- [ ] Verify shopping cart functionality
- [ ] Test user authentication
- [ ] Check payment processing
- [ ] Verify email functionality
- [ ] Test admin dashboard access

#### **T+30 Minutes: SEO Verification**
- [ ] Verify 301 redirects are working
- [ ] Check Google Search Console for errors
- [ ] Test all critical URLs
- [ ] Verify sitemap accessibility
- [ ] Check robots.txt file

---

## 📊 MONITORING & VALIDATION

### **Real-Time Monitoring Tools**
1. **DNS Propagation**: whatsmydns.net
2. **Site Uptime**: UptimeRobot or Pingdom
3. **SSL Status**: SSL Labs SSL Test
4. **Performance**: Google PageSpeed Insights
5. **Search Console**: Google Search Console

### **Critical Metrics to Monitor**
- Site availability (target: 99.9%+)
- Page load times (target: <3 seconds)
- SSL certificate validity
- Payment processing success rate
- Email delivery rates
- Search engine crawl errors

### **Monitoring Schedule**
- **First Hour**: Check every 5 minutes
- **First 6 Hours**: Check every 15 minutes
- **First 24 Hours**: Check every hour
- **First Week**: Check twice daily

---

## 🚨 ROLLBACK PROCEDURES

### **Immediate Rollback (If Critical Issues Arise)**

**Scenario**: Major functionality failure or site completely down

**Action**: Revert DNS to original Netlify hosting
```bash
# Emergency rollback DNS settings
A Record: @ → [Original Netlify IP] (TTL: 300)
A Record: www → [Original Netlify IP] (TTL: 300)
```

**Timeline**: 5-15 minutes for DNS propagation

### **Partial Rollback (If Minor Issues)**

**Scenario**: Specific functionality not working but site mostly functional

**Action**: 
1. Identify and document issues
2. Fix on WordPress staging environment
3. Deploy fixes to live site
4. Continue monitoring

### **Rollback Decision Matrix**

| Issue Severity | Action | Timeline |
|----------------|--------|----------|
| Site completely down | Immediate rollback | 5 minutes |
| Payment processing failed | Immediate rollback | 5 minutes |
| SSL certificate issues | Fix or rollback | 15 minutes |
| Minor functionality issues | Fix on live site | 30 minutes |
| Performance degradation | Monitor and optimize | 1 hour |

---

## 📞 EMERGENCY CONTACTS

### **Technical Team**
- **Primary**: [Your Name] - [Phone] - [Email]
- **Backup**: [Backup Person] - [Phone] - [Email]

### **Service Providers**
- **Hosting Support**: [Hosting Provider] - [Support Phone/Chat]
- **Domain Registrar**: [Registrar] - [Support Contact]
- **SSL Provider**: [SSL Provider] - [Support Contact]
- **Payment Processor**: Stripe Support - support@stripe.com

### **Escalation Procedures**
1. **Level 1**: Technical team attempts resolution (0-15 minutes)
2. **Level 2**: Contact hosting provider support (15-30 minutes)
3. **Level 3**: Execute rollback procedures (30+ minutes)

---

## 📋 POST-CUTOVER TASKS (24-48 Hours After)

### **Immediate Tasks (First 24 Hours)**
- [ ] Monitor site performance and uptime
- [ ] Check Google Search Console for crawl errors
- [ ] Verify all 301 redirects are working
- [ ] Test payment processing with real transactions
- [ ] Monitor email delivery rates
- [ ] Check analytics data flow

### **Short-term Tasks (48 Hours)**
- [ ] Increase DNS TTL values back to normal (3600-86400)
- [ ] Submit updated sitemap to search engines
- [ ] Update Google My Business listing
- [ ] Notify external partners of URL changes
- [ ] Update any hardcoded links in external systems

### **Medium-term Tasks (1 Week)**
- [ ] Monitor search engine rankings
- [ ] Analyze traffic patterns for anomalies
- [ ] Optimize performance based on real usage
- [ ] Review and fix any discovered issues
- [ ] Update documentation and procedures

---

## ✅ SUCCESS CRITERIA

### **Technical Success Metrics**
- [ ] Site uptime: >99.9%
- [ ] Page load time: <3 seconds
- [ ] SSL certificate: A+ rating
- [ ] All redirects: 301 status codes
- [ ] Payment processing: 100% success rate

### **Business Success Metrics**
- [ ] Zero data loss during migration
- [ ] No interruption to customer orders
- [ ] Maintained search engine rankings
- [ ] Preserved email functionality
- [ ] Continued third-party integrations

### **SEO Success Metrics**
- [ ] No increase in 404 errors
- [ ] Maintained organic traffic levels
- [ ] Preserved keyword rankings
- [ ] Successful sitemap submission
- [ ] No crawl errors in Search Console

This comprehensive DNS cutover plan ensures a smooth, zero-downtime migration while preserving all domain authority and business continuity for midastechnical.com.
