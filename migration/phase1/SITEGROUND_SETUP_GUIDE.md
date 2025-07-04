# SiteGround Hosting Setup for midastechnical.com

## 🎯 OBJECTIVE
Set up SiteGround GrowBig hosting specifically configured for midastechnical.com WordPress migration.

---

## 📋 STEP-BY-STEP SITEGROUND SETUP

### **Step 1: Purchase SiteGround GrowBig Plan**

1. **Visit SiteGround**: https://www.siteground.com/
2. **Select GrowBig Plan** ($6.99/month - recommended for e-commerce)
3. **Choose "I already have a Domain"**
4. **Enter**: `midastechnical.com`
5. **Complete purchase** with your details

**GrowBig Plan Features:**
- 20GB Web Space
- Unlimited Websites
- Free SSL Certificate
- Free CDN
- Daily Backups
- Staging Environment
- Enhanced Security

### **Step 2: Access SiteGround Control Panel**

1. **Check email** for SiteGround welcome message
2. **Login to Site Tools**: https://my.siteground.com/
3. **Navigate to**: Site Tools → Websites
4. **Select**: midastechnical.com

### **Step 3: Domain Configuration**

#### **Option A: If Domain is Already with SiteGround**
- Domain should be automatically configured
- Skip to Step 4

#### **Option B: If Domain is External (Current Setup)**
1. **In Site Tools**: Domains → DNS Zone Editor
2. **Note the nameservers**:
   ```
   ns1.siteground.net
   ns2.siteground.net
   ```
3. **Keep current DNS** for now (we'll change during cutover)

### **Step 4: SSL Certificate Setup**

1. **Navigate to**: Security → SSL Manager
2. **Select**: Let's Encrypt (Free)
3. **Enable**: Force HTTPS Redirect
4. **Domain**: midastechnical.com
5. **Include**: www.midastechnical.com
6. **Click**: Install

**Verification:**
- SSL should be active within 10-15 minutes
- Check: https://staging-midastechnical.com (temporary URL)

### **Step 5: PHP Configuration**

1. **Navigate to**: Site → PHP Manager
2. **Select PHP Version**: 8.1 or 8.2 (latest stable)
3. **Configure PHP Settings**:
   ```
   memory_limit = 512M
   max_execution_time = 300
   max_input_vars = 3000
   upload_max_filesize = 64M
   post_max_size = 64M
   ```

### **Step 6: Database Creation**

1. **Navigate to**: Site → MySQL
2. **Create Database**:
   - **Database Name**: `midastechnical_wp`
   - **Username**: `midastechnical_user`
   - **Password**: Generate strong password (save this!)
3. **Note database details** for WordPress installation

### **Step 7: Email Configuration**

1. **Navigate to**: Email → Accounts
2. **Create email accounts**:
   ```
   admin@midastechnical.com
   support@midastechnical.com
   orders@midastechnical.com
   noreply@midastechnical.com
   ```
3. **Configure forwarding** if needed

---

## 🔧 SITEGROUND OPTIMIZATION SETTINGS

### **Caching Configuration**

1. **Navigate to**: Speed → Caching
2. **Enable**: Dynamic Caching
3. **Configure**:
   - **Cache Level**: Aggressive
   - **Browser Caching**: Enabled
   - **GZIP Compression**: Enabled

### **CDN Setup**

1. **Navigate to**: Speed → Cloudflare CDN
2. **Enable**: Free Cloudflare CDN
3. **Configure**: Automatic optimization

### **Security Settings**

1. **Navigate to**: Security → Security
2. **Enable**:
   - **Anti-bot AI**: On
   - **Login Protection**: On
   - **Application Updates**: Automatic (WordPress core only)

---

## 📊 TEMPORARY ACCESS SETUP

### **Staging URL Configuration**

SiteGround provides a temporary URL for testing:
```
Format: https://staging-[random].siteground.site
Example: https://staging-123456.siteground.site
```

**To find your staging URL:**
1. **Navigate to**: Site → WordPress
2. **Look for**: Staging URL
3. **Note this URL** for testing

### **Hosts File Testing (Alternative)**

If you want to test with the actual domain:

**Windows:**
```
# Edit C:\Windows\System32\drivers\etc\hosts
[SiteGround IP] midastechnical.com
[SiteGround IP] www.midastechnical.com
```

**Mac/Linux:**
```
# Edit /etc/hosts
[SiteGround IP] midastechnical.com
[SiteGround IP] www.midastechnical.com
```

**To find SiteGround IP:**
1. **Navigate to**: Site → Site Information
2. **Note**: Server IP Address

---

## ✅ VERIFICATION CHECKLIST

### **Hosting Setup Complete**
- [ ] SiteGround GrowBig plan purchased
- [ ] Domain midastechnical.com added to account
- [ ] SSL certificate installed and active
- [ ] PHP 8.1+ configured with optimized settings
- [ ] Database created: midastechnical_wp
- [ ] Email accounts created for @midastechnical.com
- [ ] Caching and CDN enabled
- [ ] Security features activated
- [ ] Staging URL identified and accessible

### **Access Information Recorded**
- [ ] SiteGround login credentials
- [ ] Database name, username, and password
- [ ] Server IP address
- [ ] Staging URL
- [ ] Email account passwords

---

## 📞 SITEGROUND SUPPORT

### **Contact Information**
- **24/7 Chat**: Available in Site Tools
- **Phone**: Available for GrowBig+ plans
- **Tickets**: Through Site Tools → Support

### **Common Issues & Solutions**

**Issue**: SSL not activating
**Solution**: Wait 15 minutes, then contact support

**Issue**: Domain not propagating
**Solution**: Check nameservers, may take 24-48 hours

**Issue**: Email not working
**Solution**: Verify MX records in DNS Zone Editor

---

## 🚀 NEXT STEPS

Once hosting setup is complete:

1. **Proceed to WordPress Installation** (Task 1.2)
2. **Keep all access credentials** secure
3. **Test staging URL** accessibility
4. **Verify SSL certificate** is working

**Important Notes:**
- Don't change DNS/nameservers yet (save for cutover day)
- Use staging URL for all testing
- Keep database credentials secure
- SSL certificate should be active before WordPress installation

This completes the SiteGround hosting setup for midastechnical.com. The hosting environment is now ready for WordPress installation.
