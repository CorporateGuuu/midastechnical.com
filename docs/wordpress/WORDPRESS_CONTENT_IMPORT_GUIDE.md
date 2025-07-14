# 📝 WordPress.com Content Import Guide

**For:** Midas Technical Solutions Homepage Setup  
**File:** wordpress-homepage-complete.html → WordPress.com

---

## 🎨 **Step 3.1: Homepage Content Import**

### **Access WordPress Editor**

1. **Go to your WordPress.com site dashboard**
2. **Click "Pages" in the left sidebar**
3. **Find your homepage** (usually called "Home" or "Front Page")
4. **Click "Edit" to open the Block Editor**

### **Import Homepage Blocks**

**Method A: Copy-Paste Blocks (Recommended)**

1. **Open the prepared file**: `wordpress-homepage-complete.html`
2. **Copy the WordPress blocks** (the content between `<!-- wp:` tags)
3. **In WordPress Editor**:
   - Click the "+" button to add a new block
   - Select "Custom HTML" block
   - Paste the copied content
   - Click "Preview" to see how it looks

**Method B: Manual Block Creation**

If copy-paste doesn't work, create blocks manually:

#### **Hero Section Block**
```
1. Add "Cover" block
2. Upload background image from assets/
3. Add heading: "Professional Device Repair Services"
4. Add subheading: "Expert repair solutions for phones, tablets, and laptops"
5. Add button: "Shop Parts" (link to /shop)
```

#### **Statistics Section**
```
1. Add "Columns" block (3 columns)
2. Column 1: "5,000+ Parts Available"
3. Column 2: "24/7 Customer Support"  
4. Column 3: "Fast Shipping Nationwide"
```

#### **Product Categories Section**
```
1. Add "Heading" block: "Shop by Category"
2. Add "Columns" block (3 columns)
3. Each column: Image + Heading + Description
   - iPhone Parts
   - Samsung Parts  
   - Repair Tools
```

### **Upload Logo and Branding**

1. **Go to Appearance → Customize**
2. **Click "Site Identity"**
3. **Upload logo**:
   - Click "Select Logo"
   - Upload: `assets/Logos/MIDASTECHLOGOPNG.png`
   - Adjust size as needed

4. **Set colors**:
   - Primary color: `#2563eb` (blue)
   - Secondary color: `#ffffff` (white)
   - Text color: `#1f2937` (dark gray)

---

## 🛒 **Step 3.2: WooCommerce Installation**

### **Install WooCommerce Plugin**

1. **Go to Plugins → Add New**
2. **Search for "WooCommerce"**
3. **Click "Install Now"** then **"Activate"**
4. **WooCommerce Setup Wizard will start automatically**

### **WooCommerce Setup Wizard**

**Store Details:**
```
Business Name: Midas Technical Solutions
Country: United States
Address: [Your business address]
City: [Your city]
State: [Your state]
Postcode: [Your ZIP code]
```

**Industry and Product Types:**
```
Industry: Electronics and Technology
Product Types: Physical products
Business Details: I'm already selling
```

**Store Setup:**
```
Currency: US Dollar ($)
Sell to: Specific countries (US + any others you serve)
Tax: Yes, I will enter tax rates manually
```

**Payment Methods:**
```
✅ Stripe (for credit cards)
✅ PayPal Standard
✅ Cash on delivery (optional)
```

**Shipping:**
```
✅ I will set up shipping myself
Shipping zones: United States
```

### **Configure WooCommerce Settings**

Use the prepared configuration file `woocommerce-midas-config.json`:

**Products Settings:**
- Manage stock: Yes
- Hold stock (minutes): 60
- Enable reviews: Yes
- Show related products: Yes

**Tax Settings:**
- Enable taxes: Yes
- Prices include tax: No
- Calculate tax based on: Customer billing address

**Shipping Settings:**
- Enable shipping: Yes
- Shipping destination: Ship to billing address by default
- Free shipping threshold: $50

---

## 📦 **Step 3.3: Product Import**

### **Prepare Product Import**

1. **Go to WooCommerce → Products → Import**
2. **Upload file**: `woocommerce-products-import.csv`
3. **Map columns** (WooCommerce will auto-detect most):
   - Name → Name
   - SKU → SKU  
   - Price → Regular price
   - Categories → Categories
   - Images → Images

### **Import Settings**
```
✅ Update existing products
✅ Skip unknown attributes  
✅ Create product categories
```

### **Product Images Upload**

**After import, upload product images:**

1. **Go to Media → Add New**
2. **Upload images from**: `public/images/products/`
3. **Organize by folders**:
   - batteries/
   - cameras/
   - lcd/
   - tools/
   - samsung/

4. **Assign images to products**:
   - Edit each product
   - Set featured image
   - Add gallery images

---

## 🎯 **Step 3.4: Site Verification**

### **Test Site Functionality**

1. **Visit your site**: `https://midastechnical.com`
2. **Check homepage loads correctly**
3. **Test navigation menu**
4. **Verify shop page works**
5. **Test add to cart functionality**

### **Mobile Responsiveness**
- Test on mobile device
- Check tablet view
- Verify all elements display correctly

### **Performance Check**
- Page load speed should be under 3 seconds
- Images should load properly
- No broken links

---

## 🔧 **Troubleshooting Common Issues**

### **Homepage Not Displaying**
1. Go to Settings → Reading
2. Set "Front page displays" to "A static page"
3. Select your homepage from dropdown

### **WooCommerce Pages Missing**
1. Go to WooCommerce → Status → Tools
2. Click "Create default WooCommerce pages"

### **Images Not Loading**
1. Check file permissions
2. Re-upload images if needed
3. Clear any caching plugins

### **SSL Certificate Issues**
1. Wait 30 minutes after domain connection
2. Force HTTPS in WordPress settings
3. Contact WordPress.com support if persistent

---

## ✅ **Completion Checklist**

- [ ] WordPress.com site created successfully
- [ ] Custom domain connected and working
- [ ] Homepage content imported and styled
- [ ] Logo uploaded and branding configured
- [ ] WooCommerce installed and configured
- [ ] Product categories created
- [ ] Products imported successfully
- [ ] Payment gateways configured
- [ ] Shipping settings configured
- [ ] Site tested on desktop and mobile
- [ ] SSL certificate active and working

---

**🎉 Once complete, your site should be fully functional at https://midastechnical.com!**
