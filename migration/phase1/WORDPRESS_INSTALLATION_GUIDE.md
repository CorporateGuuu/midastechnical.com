# WordPress & WooCommerce Installation for midastechnical.com

## 🎯 OBJECTIVE
Install WordPress with WooCommerce on SiteGround hosting, configured specifically for midastechnical.com.

---

## 📋 WORDPRESS INSTALLATION STEPS

### **Step 1: Access SiteGround WordPress Installer**

1. **Login to SiteGround Site Tools**
2. **Navigate to**: WordPress → Install & Manage
3. **Click**: Install WordPress
4. **Select Domain**: midastechnical.com (or staging URL)

### **Step 2: WordPress Installation Configuration**

**Basic Settings:**
```
Site Title: MDTS - Midas Technical Solutions
Admin Username: mdts_admin
Admin Password: [Generate strong password - save this!]
Admin Email: admin@midastechnical.com
Language: English (United States)
```

**Advanced Settings:**
```
Database Name: midastechnical_wp (use existing)
Table Prefix: mdts_ (for security)
WordPress Version: Latest (6.4+)
```

### **Step 3: Complete Installation**

1. **Click**: Install
2. **Wait**: 2-3 minutes for installation
3. **Note**: WordPress admin URL and credentials
4. **Access**: https://[staging-url]/wp-admin/

### **Step 4: Initial WordPress Configuration**

#### **Login to WordPress Admin**
1. **URL**: https://[staging-url]/wp-admin/
2. **Username**: mdts_admin
3. **Password**: [Your generated password]

#### **Basic WordPress Settings**
1. **Navigate to**: Settings → General
2. **Configure**:
   ```
   Site Title: MDTS - Midas Technical Solutions
   Tagline: Your trusted partner for professional repair parts & tools
   WordPress Address (URL): https://midastechnical.com
   Site Address (URL): https://midastechnical.com
   Email Address: admin@midastechnical.com
   Timezone: America/New_York (or your timezone)
   Date Format: F j, Y
   Time Format: g:i a
   ```

#### **Permalink Structure**
1. **Navigate to**: Settings → Permalinks
2. **Select**: Post name
3. **Custom Structure**: `/%postname%/`
4. **Save Changes**

---

## 🛒 WOOCOMMERCE INSTALLATION

### **Step 1: Install WooCommerce Plugin**

1. **Navigate to**: Plugins → Add New
2. **Search**: "WooCommerce"
3. **Install**: WooCommerce by Automattic
4. **Activate**: Plugin

### **Step 2: WooCommerce Setup Wizard**

The setup wizard will automatically launch:

#### **Store Details**
```
Country/Region: United States
State: [Your state]
City: [Your city]
Address: [Your business address]
Postcode: [Your ZIP code]
Currency: US Dollar ($)
Product Types: Physical products
Business Type: I'm setting up a store for a client
```

#### **Industry Selection**
```
Industry: Electronics and computers
```

#### **Product Types**
```
☑ Physical products
☐ Downloads
☐ Subscriptions
☐ Memberships
☐ Bookings
```

#### **Business Details**
```
How many products do you plan to display? 101-1000
Currently selling elsewhere? No
```

### **Step 3: Payment Setup (Skip for Now)**

1. **Skip payment setup** during wizard
2. **We'll configure Stripe later** with custom integration
3. **Click**: Continue without setting up payments

### **Step 4: Shipping Configuration**

```
Shipping Zones: United States
Shipping Methods: 
  - Free shipping (orders over $100)
  - Flat rate ($9.99)
  - Local pickup (optional)
```

### **Step 5: WooCommerce Basic Settings**

#### **General Settings**
1. **Navigate to**: WooCommerce → Settings → General
2. **Configure**:
   ```
   Store Address: [Your business address]
   Selling Location: Sell to all countries
   Default Customer Location: Shop base address
   Enable Taxes: Yes
   Currency: US Dollar ($)
   Currency Position: Left ($99.99)
   Thousand Separator: ,
   Decimal Separator: .
   Number of Decimals: 2
   ```

#### **Product Settings**
1. **Navigate to**: WooCommerce → Settings → Products
2. **Configure**:
   ```
   Shop Page: Shop (auto-created)
   Cart Page: Cart (auto-created)
   Checkout Page: Checkout (auto-created)
   My Account Page: My account (auto-created)
   Terms and Conditions: [Create later]
   ```

#### **Inventory Settings**
```
☑ Manage stock
☑ Hold stock (minutes): 60
☑ Enable stock management at product level
☑ Hide out of stock items from the catalog
Stock Display Format: Always show quantity remaining in stock
```

---

## 🔧 WORDPRESS OPTIMIZATION

### **Step 1: Remove Default Content**

1. **Delete**: Sample page, Hello World post
2. **Navigate to**: Posts → All Posts → Delete "Hello world!"
3. **Navigate to**: Pages → All Pages → Delete "Sample Page"
4. **Navigate to**: Comments → Delete default comment

### **Step 2: Create Essential Pages**

Create these pages (Pages → Add New):

```
1. About Us
   - Slug: about
   - Content: [Add your about content]

2. Contact
   - Slug: contact
   - Content: [Add contact form later]

3. Privacy Policy
   - Slug: privacy-policy
   - Content: [Use WordPress template]

4. Terms of Service
   - Slug: terms-of-service
   - Content: [Add your terms]

5. Shipping & Returns
   - Slug: shipping-returns
   - Content: [Add shipping policy]
```

### **Step 3: Configure WordPress Security**

#### **User Settings**
1. **Navigate to**: Users → All Users
2. **Delete**: Default admin user (if exists)
3. **Keep**: mdts_admin user
4. **Update**: Display name to "MDTS Admin"

#### **Security Settings**
1. **Navigate to**: Settings → Discussion
2. **Uncheck**: "Anyone can register"
3. **Set**: "Users must be registered and logged in to comment"

---

## ✅ VERIFICATION CHECKLIST

### **WordPress Installation Complete**
- [ ] WordPress installed successfully
- [ ] Admin access working (wp-admin)
- [ ] Site title and tagline configured
- [ ] Permalink structure set to /%postname%/
- [ ] Timezone and date formats configured
- [ ] Default content removed

### **WooCommerce Installation Complete**
- [ ] WooCommerce plugin installed and activated
- [ ] Setup wizard completed
- [ ] Store details configured
- [ ] Basic shipping zones created
- [ ] Essential WooCommerce pages created
- [ ] Inventory management enabled

### **Essential Pages Created**
- [ ] About Us page
- [ ] Contact page
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Shipping & Returns page

### **Access Information Recorded**
- [ ] WordPress admin URL
- [ ] Admin username and password
- [ ] Database connection working
- [ ] WooCommerce dashboard accessible

---

## 🚨 TROUBLESHOOTING

### **Common Issues**

**Issue**: WordPress installation fails
**Solution**: Check database credentials, contact SiteGround support

**Issue**: Can't access wp-admin
**Solution**: Clear browser cache, check URL (use staging URL)

**Issue**: WooCommerce setup wizard doesn't appear
**Solution**: Navigate to WooCommerce → Status → Tools → Setup Wizard

**Issue**: Pages return 404 errors
**Solution**: Go to Settings → Permalinks → Save Changes

---

## 📊 INSTALLATION SUMMARY

**WordPress Details:**
- Version: Latest (6.4+)
- Database: midastechnical_wp
- Admin User: mdts_admin
- Admin Email: admin@midastechnical.com

**WooCommerce Details:**
- Version: Latest
- Currency: USD
- Base Location: United States
- Tax Calculation: Enabled

**Essential URLs:**
- Admin: https://[staging-url]/wp-admin/
- Shop: https://[staging-url]/shop/
- Cart: https://[staging-url]/cart/
- Checkout: https://[staging-url]/checkout/
- My Account: https://[staging-url]/my-account/

---

## 🚀 NEXT STEPS

1. **Proceed to Custom Theme Upload** (Task 1.3)
2. **Keep admin credentials secure**
3. **Test basic WordPress functionality**
4. **Verify WooCommerce pages load correctly**

**Important Notes:**
- Use staging URL for all testing
- Don't configure payments yet (custom Stripe integration coming)
- Keep database credentials secure
- WooCommerce is ready for product import

This completes the WordPress and WooCommerce installation. The platform is now ready for theme customization and plugin installation.
