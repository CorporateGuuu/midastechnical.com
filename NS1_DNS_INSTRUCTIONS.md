# 🌐 NS1 DNS Configuration Instructions

## **Your DNS Setup:**
- **Domain Registrar:** Name.com
- **DNS Provider:** NS1 (nsone.net)
- **Name Servers:** dns1.p01.nsone.net, dns2.p01.nsone.net, dns3.p01.nsone.net, dns4.p01.nsone.net

---

## 🔧 **Step-by-Step: Add Missing DNS Records to NS1**

### **Step 1: Access NS1 Dashboard**
1. **Go to:** https://my.nsone.net/
2. **Login** with your NS1 account credentials
3. **Navigate to:** Zones → midastechnical.com

### **Step 2: Add WWW CNAME Record**
1. **Click:** "Add Record" button
2. **Record Type:** CNAME
3. **Name:** www
4. **Target:** midastechnical.com
5. **TTL:** 3600
6. **Click:** Save

### **Step 3: Add SPF TXT Record**
1. **Click:** "Add Record" button
2. **Record Type:** TXT
3. **Name:** @ (or leave blank for root domain)
4. **Value:** `v=spf1 include:_spf.wpcloud.com ~all`
5. **TTL:** 3600
6. **Click:** Save

### **Step 4: Add DKIM1 CNAME Record**
1. **Click:** "Add Record" button
2. **Record Type:** CNAME
3. **Name:** wpcloud1._domainkey
4. **Target:** wpcloud1._domainkey.wpcloud.com
5. **TTL:** 3600
6. **Click:** Save

### **Step 5: Add DKIM2 CNAME Record**
1. **Click:** "Add Record" button
2. **Record Type:** CNAME
3. **Name:** wpcloud2._domainkey
4. **Target:** wpcloud2._domainkey.wpcloud.com
5. **TTL:** 3600
6. **Click:** Save

### **Step 6: Add DMARC TXT Record**
1. **Click:** "Add Record" button
2. **Record Type:** TXT
3. **Name:** _dmarc
4. **Value:** `v=DMARC1;p=none;`
5. **TTL:** 3600
6. **Click:** Save

---

## 📋 **Quick Reference - Records to Add:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | midastechnical.com | 3600 |
| TXT | @ | v=spf1 include:_spf.wpcloud.com ~all | 3600 |
| CNAME | wpcloud1._domainkey | wpcloud1._domainkey.wpcloud.com | 3600 |
| CNAME | wpcloud2._domainkey | wpcloud2._domainkey.wpcloud.com | 3600 |
| TXT | _dmarc | v=DMARC1;p=none; | 3600 |

---

## ⚠️ **Important NS1 Notes:**

### **TXT Record Values:**
- **Always include quotes** around TXT record values in NS1
- **SPF:** `"v=spf1 include:_spf.wpcloud.com ~all"`
- **DMARC:** `"v=DMARC1;p=none;"`

### **CNAME Records:**
- **Don't add trailing dots** unless NS1 specifically requires them
- **Use full domain names** for targets

### **Name Field:**
- **For root domain (@):** Leave blank or use @
- **For subdomains:** Enter the subdomain name only

---

## 🔍 **Verification After Adding Records**

### **Check NS1 Dashboard:**
1. **Verify all 5 records** appear in your zone
2. **Check for any error messages**
3. **Ensure TTL is set to 3600**

### **Test DNS Propagation:**
```bash
# Run our verification script
./verify-ssl-dns.sh

# Or check individual records
dig TXT midastechnical.com
dig CNAME www.midastechnical.com
dig CNAME wpcloud1._domainkey.midastechnical.com
```

---

## ⏰ **Propagation Timeline:**

- **NS1 Updates:** Immediate (0-5 minutes)
- **Global Propagation:** 15-60 minutes
- **WordPress.com Recognition:** 30-90 minutes

---

## 🆘 **Troubleshooting NS1:**

### **Can't Access NS1 Dashboard:**
- **Check login credentials** at https://my.nsone.net/
- **Reset password** if needed
- **Contact NS1 support** if account issues

### **Records Not Saving:**
- **Check syntax** of TXT record values
- **Ensure proper quotes** around TXT values
- **Verify TTL is numeric** (3600)

### **Don't Have NS1 Access:**
- **Check who set up NS1** (might be previous developer)
- **Contact Name.com** to change DNS back to their servers
- **Or get NS1 account access** from whoever manages it

---

## 🔄 **Alternative: Switch to Name.com DNS**

### **If You Can't Access NS1:**
1. **Login to Name.com** account
2. **Go to:** Domain Manager → midastechnical.com
3. **Change Name Servers** back to Name.com:
   - ns1.name.com
   - ns2.name.com
   - ns3.name.com
   - ns4.name.com
4. **Wait 24-48 hours** for propagation
5. **Add DNS records** in Name.com DNS management

---

## 📞 **Support Contacts:**

- **NS1 Support:** https://help.ns1.com/
- **Name.com Support:** https://www.name.com/support
- **WordPress.com Support:** Available in dashboard

**🎯 Priority: Add these 5 DNS records to resolve SSL certificate warnings!**
