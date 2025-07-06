# WordPress.com E-commerce Setup Guide

## 🎯 **OBJECTIVE**
Complete WordPress.com e-commerce setup with WooCommerce for midastechnical.com migration.

**Prerequisites**: DNS must be working and domain loading WordPress.com site.

---

## 📋 **PHASE 2: WORDPRESS.COM E-COMMERCE SETUP**

### **Step 1: Verify Domain Connection**

1. **Log into WordPress.com**
   - Go to https://wordpress.com/log-in
   - Enter your WordPress.com credentials

2. **Check Domain Status**
   - Navigate to **My Sites** → **Settings** → **General**
   - Verify **Site Address (URL)** shows: `https://midastechnical.com`
   - Look for green checkmark indicating domain is connected
   - If red error, wait for DNS propagation or contact support

3. **Verify Jetpack Connection**
   - Go to **My Sites** → **Jetpack**
   - Should show "Connected" status
   - If errors persist, DNS may still be propagating

---

### **Step 2: Upgrade to E-commerce Plan**

#### **Plan Selection:**
- **eCommerce Plan** ($45/month) - **RECOMMENDED**
  - ✅ WooCommerce included
  - ✅ Premium themes
  - ✅ Advanced customization
  - ✅ Payment processing
  - ✅ Shipping integrations

- **Business Plan** ($25/month) - **MINIMUM**
  - ✅ WooCommerce plugin support
  - ✅ Custom plugins
  - ❌ Limited e-commerce features

#### **Upgrade Process:**
1. **Go to Plans**: My Sites → Plans
2. **Select eCommerce Plan** (recommended)
3. **Choose billing cycle** (annual saves money)
4. **Complete payment** with credit card
5. **Wait for activation** (usually immediate)

---

### **Step 3: Install Essential Plugins**

#### **Plugin Installation Order:**

**3.1 Install WooCommerce (Core E-commerce)**
1. Go to **My Sites** → **Plugins**
2. Click **Add New Plugin**
3. Search for "WooCommerce"
4. Click **Install** → **Activate**
5. **Run WooCommerce Setup Wizard** (appears automatically)

**3.2 Install WooCommerce Stripe Gateway**
1. **Plugins** → **Add New Plugin**
2. Search for "WooCommerce Stripe Gateway"
3. **Install** → **Activate**
4. Note: Configuration comes later

**3.3 Install WP All Import (Data Migration)**
1. **Plugins** → **Add New Plugin**
2. Search for "WP All Import"
3. **Install** → **Activate**
4. Note: Used for importing your product data

**3.4 Install Yoast SEO (Search Optimization)**
1. **Plugins** → **Add New Plugin**
2. Search for "Yoast SEO"
3. **Install** → **Activate**
4. Run initial SEO setup wizard

---

### **Step 4: WooCommerce Setup Wizard**

#### **Store Details Configuration:**

**4.1 Store Location**
```
Country/Region: United States
State: [Your State]
City: [Your City]
Postal Code: [Your ZIP]
```

**4.2 Industry Selection**
```
Industry: Electronics and computers
Product Types: Physical products
```

**4.3 Business Details**
```
Store Name: Midas Technical
Tagline: Professional Device Repair Parts
```

**4.4 Store Features**
Select these options:
- ✅ **I plan to sell physical products**
- ✅ **I will provide customer support**
- ✅ **I want to sell to customers in multiple countries**
- ✅ **I plan to sell subscriptions** (if offering services)

---

### **Step 5: Payment Gateway Configuration**

#### **5.1 Stripe Setup (Primary Payment Method)**

**Access Stripe Settings:**
1. **WooCommerce** → **Settings** → **Payments**
2. Click **Stripe** → **Set up**

**Configure Stripe:**
```
Enable Stripe: ✅ Yes
Title: Credit Card (Stripe)
Description: Pay securely with your credit card
```

**API Keys Configuration:**
```
Test Mode: ✅ Enable (for initial testing)

Test Publishable Key: pk_test_[your_test_key]
Test Secret Key: sk_test_[your_test_key]

Live Publishable Key: pk_live_[your_live_key]
Live Secret Key: sk_live_[your_live_key]
```

**Advanced Settings:**
```
Capture: ✅ Capture charge immediately
Payment Request Buttons: ✅ Enable
Saved Cards: ✅ Allow customers to save cards
```

#### **5.2 Test Stripe Configuration**
1. **Enable Test Mode** in Stripe settings
2. **Save settings**
3. **Test checkout** with test card: 4242 4242 4242 4242
4. **Verify payment** appears in Stripe dashboard

---

### **Step 6: Store Settings Configuration**

#### **6.1 General Settings**
**WooCommerce** → **Settings** → **General**
```
Store Address: [Your business address]
Selling Location: Sell to all countries
Default Customer Location: Shop base address
Enable Taxes: ✅ Yes
Currency: US Dollar ($)
Currency Position: Left ($99.99)
Thousand Separator: ,
Decimal Separator: .
Number of Decimals: 2
```

#### **6.2 Shipping Configuration**
**WooCommerce** → **Settings** → **Shipping**

**Create Shipping Zones:**

**Zone 1: United States**
```
Zone Name: United States
Zone Regions: United States

Shipping Methods:
- Flat Rate: $5.99 (standard shipping)
- Free Shipping: $75+ orders
- Local Pickup: Available
```

**Zone 2: International**
```
Zone Name: International
Zone Regions: All other countries

Shipping Methods:
- Flat Rate: $15.99 (international shipping)
```

#### **6.3 Tax Configuration**
**WooCommerce** → **Settings** → **Tax**
```
Enable Taxes: ✅ Yes
Prices Entered With Tax: No, I will enter prices exclusive of tax
Calculate Tax Based On: Customer billing address
Shipping Tax Class: Shipping (same as cart)
Rounding: Round at subtotal level
```

**Add Tax Rates:**
- Create tax rates for states where you have nexus
- Standard rate: 8.25% (adjust for your location)

---

### **Step 7: Theme Selection and Customization**

#### **7.1 Choose E-commerce Theme**

**Recommended Themes:**
1. **Storefront** (Free, WooCommerce default)
2. **Astra** (Fast, customizable)
3. **OceanWP** (Feature-rich)

**Install Theme:**
1. **Appearance** → **Themes**
2. **Add New Theme**
3. Search for chosen theme
4. **Install** → **Activate**

#### **7.2 Basic Customization**
**Appearance** → **Customize**
```
Site Identity:
- Site Title: Midas Technical
- Tagline: Professional Device Repair Parts
- Logo: Upload your logo

Colors:
- Primary Color: #1e3a8a (blue)
- Secondary Color: #f59e0b (orange)
- Text Color: #1f2937 (dark gray)

Typography:
- Headings: Roboto or similar
- Body Text: Open Sans or similar
```

---

### **Step 8: Essential Pages Creation**

#### **8.1 Create Required Pages**
**Pages** → **Add New**

**Privacy Policy Page:**
```
Title: Privacy Policy
Content: Use WordPress.com privacy policy generator
```

**Terms of Service Page:**
```
Title: Terms of Service
Content: Include return policy, warranty terms
```

**About Us Page:**
```
Title: About Us
Content: Company history, mission, team
```

**Contact Page:**
```
Title: Contact Us
Content: Contact form, address, phone, hours
```

#### **8.2 Configure WooCommerce Pages**
**WooCommerce** → **Settings** → **Advanced**
```
Shop Page: Shop (auto-created)
Cart Page: Cart (auto-created)
Checkout Page: Checkout (auto-created)
My Account Page: My Account (auto-created)
Terms and Conditions: Terms of Service
```

---

### **Step 9: Security and Performance**

#### **9.1 Security Settings**
**Settings** → **General**
```
Membership: ✅ Anyone can register
New User Default Role: Customer
```

**Jetpack** → **Security**
```
Brute Force Protection: ✅ Enable
Two-Factor Authentication: ✅ Enable for admin
```

#### **9.2 Performance Optimization**
**Jetpack** → **Performance**
```
Site Accelerator: ✅ Enable
Image CDN: ✅ Enable
Lazy Load Images: ✅ Enable
```

---

### **Step 10: Testing Checklist**

#### **10.1 Store Functionality Test**
- [ ] **Homepage loads** without errors
- [ ] **Shop page displays** correctly
- [ ] **Product pages** are accessible
- [ ] **Cart functionality** works
- [ ] **Checkout process** completes
- [ ] **Payment processing** works (test mode)
- [ ] **Order confirmation** emails sent
- [ ] **Admin order management** functional

#### **10.2 Stripe Test Transactions**
**Test Cards:**
```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

**Test Process:**
1. Add product to cart
2. Proceed to checkout
3. Enter test card details
4. Complete purchase
5. Verify order in WooCommerce admin
6. Check Stripe dashboard for transaction

---

## ✅ **SUCCESS CRITERIA**

Your WordPress.com e-commerce setup is complete when:

- ✅ **Domain loads** WordPress.com site without errors
- ✅ **WooCommerce is active** and configured
- ✅ **Stripe payments work** in test mode
- ✅ **Store pages display** correctly
- ✅ **Test transactions** process successfully
- ✅ **Email notifications** are sent
- ✅ **Admin dashboard** is accessible

---

## 🚀 **NEXT STEPS**

Once setup is complete:

1. **Run data export** from Next.js site
2. **Import products** using WP All Import
3. **Configure product categories**
4. **Test imported data**
5. **Switch Stripe to live mode**
6. **Launch store**

---

**Ready for data migration?** Proceed to product import phase!
