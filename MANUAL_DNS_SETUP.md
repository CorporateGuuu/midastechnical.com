# Manual DNS Setup for WordPress.com
## Complete DNS Configuration for midastechnical.com

### 🎯 **Required DNS Records**

Add these **7 DNS records** in your WordPress.com DNS management:

---

### **1. A Records (WordPress.com Hosting)**
```
Record 1:
Type: A
Name: @ (or blank/root)
Value: 192.0.78.159
TTL: 3600

Record 2:
Type: A
Name: @ (or blank/root)
Value: 192.0.78.224
TTL: 3600
```

### **2. CNAME Record (WWW Subdomain)**
```
Record 3:
Type: CNAME
Name: www
Value: midastechnical.com
TTL: 3600
```

### **3. Email Authentication Records**

#### **SPF Record (Email Security)**
```
Record 4:
Type: TXT
Name: @ (or blank/root)
Value: v=spf1 include:_spf.wpcloud.com ~all
TTL: 3600
```

#### **DMARC Record (Email Policy)**
```
Record 5:
Type: TXT
Name: _dmarc
Value: v=DMARC1;p=none;
TTL: 3600
```

#### **DKIM Records (Email Authentication)**
```
Record 6:
Type: CNAME
Name: wpcloud1._domainkey
Value: wpcloud1._domainkey.wpcloud.com
TTL: 3600

Record 7:
Type: CNAME
Name: wpcloud2._domainkey
Value: wpcloud2._domainkey.wpcloud.com
TTL: 3600
```

---

### **📋 Verification Checklist**

After adding all records:

- [ ] **A Records**: 2 records pointing to 192.0.78.159 and 192.0.78.224
- [ ] **CNAME**: www pointing to midastechnical.com
- [ ] **SPF TXT**: Email authentication for WordPress.com
- [ ] **DMARC TXT**: Email policy configuration
- [ ] **DKIM CNAMEs**: 2 records for email signing

### **🔍 Test After Setup**

1. **WordPress.com Dashboard**: Click "Verify Connection"
2. **Website Access**: Visit https://midastechnical.com
3. **Admin Access**: Visit https://midastechnical.com/wp-admin
4. **Jetpack Status**: Should show "Connected"

### **⏰ Propagation Time**

- **WordPress.com**: 1-4 hours
- **Global DNS**: Up to 24 hours
- **Email Records**: 2-6 hours

---

### **🚨 Important Notes**

- **Remove any conflicting records** before adding these
- **Use exact values** - no modifications needed
- **TTL can be 3600 or Auto** - both work fine
- **Don't include quotes** unless your system requires them

### **✅ Success Indicators**

- WordPress.com shows "Domain Connected"
- Jetpack connection successful
- Website loads WordPress.com site
- No DNS warnings in dashboard
