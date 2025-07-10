# DNS Provider Implementation Guide for WordPress.com

## 🎯 **OBJECTIVE**
Complete DNS configuration for midastechnical.com to work with WordPress.com hosting.

---

## 🔍 **STEP 1: IDENTIFY YOUR DNS PROVIDER**

Check your domain registrar by visiting: https://whois.net/midastechnical.com

Common providers and their DNS management locations:

---

## 🌐 **GODADDY DNS CONFIGURATION**

### **Access DNS Management:**
1. Log into **GoDaddy.com**
2. Go to **My Products** → **All Products and Services**
3. Find your domain → Click **DNS**
4. Click **Manage DNS**

### **Required DNS Changes:**

#### **Step 1: Delete Existing A Records**
- Find existing A records pointing to other IPs
- Click **trash icon** to delete them
- Confirm deletion

#### **Step 2: Add WordPress.com A Records**
```
Record Type: A
Name: @
Value: 192.0.78.13
TTL: 1 Hour
```
Click **Add Record**, then add second A record:
```
Record Type: A
Name: @
Value: 192.0.78.12
TTL: 1 Hour
```

#### **Step 3: Configure CNAME Record**
```
Record Type: CNAME
Name: www
Value: midastechnical.com
TTL: 1 Hour
```

#### **Step 4: Add Email Authentication Records**
```
Record Type: TXT
Name: @
Value: "v=spf1 include:_spf.wpcloud.com ~all"
TTL: 1 Hour
```

```
Record Type: TXT
Name: _dmarc
Value: "v=DMARC1;p=none;"
TTL: 1 Hour
```

```
Record Type: CNAME
Name: wpcloud1._domainkey
Value: wpcloud1._domainkey.wpcloud.com
TTL: 1 Hour
```

```
Record Type: CNAME
Name: wpcloud2._domainkey
Value: wpcloud2._domainkey.wpcloud.com
TTL: 1 Hour
```

#### **Step 5: Save Changes**
- Click **Save** at the bottom
- Wait for "Changes saved successfully" message

---

## 🔵 **NAMECHEAP DNS CONFIGURATION**

### **Access DNS Management:**
1. Log into **Namecheap.com**
2. Go to **Domain List**
3. Click **Manage** next to midastechnical.com
4. Click **Advanced DNS** tab

### **Required DNS Changes:**

#### **Step 1: Delete Existing Records**
- Delete existing A records and CNAME records
- Keep only NS records (nameservers)

#### **Step 2: Add New Records**
Click **Add New Record** for each:

```
Type: A Record
Host: @
Value: 192.0.78.13
TTL: Automatic
```

```
Type: A Record
Host: @
Value: 192.0.78.12
TTL: Automatic
```

```
Type: CNAME Record
Host: www
Value: midastechnical.com
TTL: Automatic
```

```
Type: TXT Record
Host: @
Value: v=spf1 include:_spf.wpcloud.com ~all
TTL: Automatic
```

```
Type: TXT Record
Host: _dmarc
Value: v=DMARC1;p=none;
TTL: Automatic
```

```
Type: CNAME Record
Host: wpcloud1._domainkey
Value: wpcloud1._domainkey.wpcloud.com
TTL: Automatic
```

```
Type: CNAME Record
Host: wpcloud2._domainkey
Value: wpcloud2._domainkey.wpcloud.com
TTL: Automatic
```

#### **Step 3: Save All Changes**
- Click **Save All Changes**
- Confirm when prompted

---

## 🟠 **CLOUDFLARE DNS CONFIGURATION**

### **Access DNS Management:**
1. Log into **Cloudflare.com**
2. Select **midastechnical.com** domain
3. Click **DNS** tab

### **Required DNS Changes:**

#### **Step 1: Delete Existing A Records**
- Find existing A records
- Click **Edit** → **Delete**

#### **Step 2: Add WordPress.com A Records**
Click **Add record**:

```
Type: A
Name: @
IPv4 address: 192.0.78.13
Proxy status: DNS only (gray cloud)
TTL: Auto
```

```
Type: A
Name: @
IPv4 address: 192.0.78.12
Proxy status: DNS only (gray cloud)
TTL: Auto
```

#### **Step 3: Configure Other Records**
```
Type: CNAME
Name: www
Target: midastechnical.com
Proxy status: DNS only
TTL: Auto
```

```
Type: TXT
Name: @
Content: "v=spf1 include:_spf.wpcloud.com ~all"
TTL: Auto
```

```
Type: TXT
Name: _dmarc
Content: "v=DMARC1;p=none;"
TTL: Auto
```

```
Type: CNAME
Name: wpcloud1._domainkey
Target: wpcloud1._domainkey.wpcloud.com
Proxy status: DNS only
TTL: Auto
```

```
Type: CNAME
Name: wpcloud2._domainkey
Target: wpcloud2._domainkey.wpcloud.com
Proxy status: DNS only
TTL: Auto
```

#### **Step 4: Save Changes**
- Click **Save** for each record
- Ensure all records show "DNS only" (gray cloud)

---

## ⚡ **OTHER DNS PROVIDERS**

### **General Steps for Any Provider:**
1. **Access DNS Management** (usually under Domain Management)
2. **Delete existing A records** pointing to other IPs
3. **Add the exact records** listed in the BIND zone file
4. **Save changes** and wait for propagation

### **Common DNS Management Locations:**
- **Network Solutions**: Domain Manager → DNS
- **1&1 IONOS**: Domains → DNS
- **Hover**: Domain Details → DNS
- **Google Domains**: DNS tab
- **Amazon Route 53**: Hosted Zones

---

## 🔍 **VERIFICATION STEPS**

### **Immediate Verification (5-10 minutes after changes):**
```bash
# Check A records
nslookup midastechnical.com

# Check CNAME
nslookup www.midastechnical.com

# Check TXT records
nslookup -type=TXT midastechnical.com
```

### **Online DNS Propagation Checkers:**
- **whatsmydns.net** - Global DNS propagation checker
- **dnschecker.org** - Multiple location DNS verification
- **mxtoolbox.com** - Comprehensive DNS analysis

### **Expected Results After Propagation:**
```
midastechnical.com → 192.0.78.13 or 192.0.78.12
www.midastechnical.com → midastechnical.com
TXT records should include SPF and DMARC
```

---

## ⏰ **TIMELINE EXPECTATIONS**

- **DNS Changes**: 5-10 minutes to implement
- **Initial Propagation**: 15-30 minutes
- **Full Global Propagation**: 24-48 hours
- **WordPress.com Recognition**: 1-4 hours after propagation

---

## 🚨 **TROUBLESHOOTING**

### **If Changes Don't Take Effect:**
1. **Clear browser cache** and try incognito mode
2. **Check for typos** in DNS record values
3. **Verify TTL settings** (should be 3600 or Auto)
4. **Contact DNS provider support** if records won't save

### **If WordPress.com Still Shows Errors:**
1. **Wait full 48 hours** for complete propagation
2. **Force refresh** in WordPress.com dashboard
3. **Contact WordPress.com support** with domain name

---

## ✅ **SUCCESS CRITERIA**

You'll know DNS is working when:
- ✅ https://midastechnical.com loads WordPress.com site
- ✅ No 404 or connection errors
- ✅ WordPress.com dashboard shows domain as connected
- ✅ Jetpack connection errors are resolved

---

**Next Step**: Once DNS is working, proceed to WordPress.com eCommerce setup!
