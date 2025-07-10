# WordPress.com DNS Configuration Guide

## 🎯 **OBJECTIVE**
Fix all WordPress.com domain configuration errors and enable proper email functionality.

---

## 📁 **FILES PROVIDED**

### **1. BIND Zone File: `midastechnical.com.zone`**
- Complete DNS configuration for WordPress.com
- Includes all required email records
- Ready to import or use as reference

---

## 🔧 **IMPLEMENTATION OPTIONS**

### **Option A: Import BIND Zone File (Advanced)**
If your DNS provider supports BIND zone file imports:

1. **Download** the `midastechnical.com.zone` file
2. **Log into** your DNS provider's control panel
3. **Look for** "Import Zone File" or "BIND Import" option
4. **Upload** the zone file
5. **Verify** all records were imported correctly

### **Option B: Manual DNS Record Entry (Recommended)**
If your DNS provider doesn't support zone file imports, add these records manually:

#### **A Records (WordPress.com Hosting):**
```
Type: A
Name: @
Value: 192.0.78.13
TTL: 3600

Type: A  
Name: @
Value: 192.0.78.12
TTL: 3600
```

#### **CNAME Records:**
```
Type: CNAME
Name: www
Value: midastechnical.com
TTL: 3600
```

#### **TXT Records (Email Configuration):**
```
Type: TXT
Name: @
Value: "v=spf1 include:_spf.wpcloud.com ~all"
TTL: 3600

Type: TXT
Name: _dmarc
Value: "v=DMARC1;p=none;"
TTL: 3600
```

#### **CNAME Records (DKIM Email Authentication):**
```
Type: CNAME
Name: wpcloud1._domainkey
Value: wpcloud1._domainkey.wpcloud.com
TTL: 3600

Type: CNAME
Name: wpcloud2._domainkey
Value: wpcloud2._domainkey.wpcloud.com
TTL: 3600
```

---

## 🏢 **DNS PROVIDER SPECIFIC INSTRUCTIONS**

### **GoDaddy:**
1. Go to **Domain Manager** → **DNS Management**
2. **Delete** existing A records pointing to other IPs
3. **Add** new records as specified above
4. **Save** changes

### **Namecheap:**
1. Go to **Domain List** → **Manage** → **Advanced DNS**
2. **Delete** conflicting records
3. **Add** new records using the values above
4. **Save** all changes

### **Cloudflare:**
1. Go to **DNS** tab in your domain dashboard
2. **Delete** existing A records
3. **Add** new records (ensure proxy status is **DNS only** for A records)
4. **Save** changes

### **Other Providers:**
- Look for **DNS Management**, **Zone Editor**, or **DNS Records**
- Follow the manual entry method above
- Contact support if you need help with zone file import

---

## ✅ **VERIFICATION STEPS**

### **1. DNS Propagation Check (24-48 hours after changes):**
```bash
# Check A records
nslookup midastechnical.com

# Check CNAME
nslookup www.midastechnical.com

# Check TXT records
nslookup -type=TXT midastechnical.com
```

### **2. WordPress.com Connection Test:**
1. **Log into** WordPress.com dashboard
2. **Go to** My Sites → Settings → General
3. **Verify** Site Address shows `https://midastechnical.com`
4. **Check** Domains section for green checkmarks

### **3. Email Configuration Test:**
1. **Go to** WordPress.com → Settings → Discussion
2. **Test** email notifications
3. **Verify** emails are delivered properly

---

## 🚨 **TROUBLESHOOTING**

### **If WordPress.com still shows errors:**
1. **Wait 48 hours** for full DNS propagation
2. **Clear browser cache** and try again
3. **Contact WordPress.com support** with your domain name
4. **Force SSL renewal** in WordPress.com dashboard

### **If emails don't work:**
1. **Verify** all TXT and CNAME records are correct
2. **Check** for typos in record values
3. **Wait** for DNS propagation (up to 48 hours)
4. **Test** with online DNS checker tools

---

## 📞 **NEXT STEPS AFTER DNS FIX**

1. **Verify** WordPress.com site loads at https://midastechnical.com
2. **Test** email functionality
3. **Begin** content migration from Next.js to WordPress
4. **Install** WooCommerce for e-commerce functionality
5. **Import** product data from current site

---

## ⚠️ **IMPORTANT NOTES**

- **DNS changes take 24-48 hours** to fully propagate
- **Backup** current DNS settings before making changes
- **Test thoroughly** before proceeding with content migration
- **Keep** this configuration file for future reference

---

**Need help?** Contact your DNS provider's support team with this configuration guide.
