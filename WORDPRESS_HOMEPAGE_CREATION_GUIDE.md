# 🏠 WordPress.com Homepage Creation Guide

## **Step-by-Step: Create NexusTechHub-Style Homepage**

---

## 🔑 **Step 1: Access WordPress.com Dashboard**

### **Login to WordPress.com:**
1. **Open browser** and go to: https://wordpress.com/home/midastechnical.com
2. **Login** with your WordPress.com account credentials
3. **You should see:** Site dashboard for midastechnical.com

### **Alternative Access Methods:**
- **Direct admin:** https://midastechnical.com/wp-admin
- **WordPress.com sites:** https://wordpress.com/sites → Select midastechnical.com

---

## 📄 **Step 2: Create Homepage**

### **Navigate to Pages:**
1. **In dashboard, click:** Pages (in left sidebar)
2. **Click:** "Add New Page" button
3. **You'll see:** WordPress Block Editor

### **Set Page Title:**
1. **Click** in the title area at top
2. **Type:** "Home" (or "Homepage")
3. **Don't publish yet** - we'll add content first

---

## 🎨 **Step 3: Add Homepage Content Using Blocks**

### **Method A: Copy-Paste Block Code (Recommended)**

1. **Open the template file:** `templates/wordpress-homepage-blocks.html`
2. **Copy the entire content** (all the block code)
3. **In WordPress editor:**
   - **Click the "⋮" menu** (three dots) in top right
   - **Select:** "Code editor"
   - **Paste the copied block code**
   - **Click:** "Exit code editor"

### **Method B: Build Manually Using Block Editor**

#### **Add Hero Section (Cover Block):**
1. **Click "+" to add block**
2. **Search for:** "Cover"
3. **Add Cover block**
4. **Configure:**
   - **Background:** Gradient (Blue to Purple)
   - **Title:** "Professional Device Repair Services"
   - **Subtitle:** "Your trusted partner for high-quality phone, tablet, and laptop repair services. Expert technicians, genuine parts, and fast turnaround times."
   - **Add buttons:** "Shop Parts" and "Get Repair Quote"

#### **Add Stats Section (Columns Block):**
1. **Add new block:** Columns (4 columns)
2. **In each column add:**
   - **Column 1:** "5,000+ Parts Available"
   - **Column 2:** "24/7 Support"  
   - **Column 3:** "Fast Delivery"
   - **Column 4:** "Expert Technicians"

#### **Add Services Section (Columns Block):**
1. **Add heading:** "Our Services"
2. **Add Columns block** (3 columns, then another 3 columns)
3. **Add services:**
   - **iPhone Repair** 📱
   - **Samsung Repair** 📲
   - **Laptop Repair** 💻
   - **Repair Parts** 🔧
   - **Repair Tools** 🛠️
   - **Express Service** ⚡

---

## 💾 **Step 4: Publish the Homepage**

### **Save and Publish:**
1. **Click:** "Publish" button (top right)
2. **Review settings** in publish panel
3. **Click:** "Publish" again to confirm
4. **You'll see:** "Page published" confirmation

### **Preview the Page:**
1. **Click:** "View Page" link
2. **Check:** Content displays correctly
3. **Note the URL** for reference

---

## 🏠 **Step 5: Set as Homepage**

### **Configure Reading Settings:**
1. **Go to:** Settings → Reading (in dashboard sidebar)
2. **Find:** "Your homepage displays"
3. **Select:** "A static page" (not "Your latest posts")
4. **Homepage dropdown:** Select "Home" (the page you just created)
5. **Posts page:** Leave as "Select" or choose a blog page if you have one
6. **Click:** "Save Changes"

---

## 🔗 **Step 6: Fix Permalink Structure**

### **Configure Permalinks:**
1. **Go to:** Settings → Permalinks
2. **Select:** "Post name" option
3. **Custom structure should show:** `/%postname%/`
4. **Click:** "Save Changes"
5. **This fixes 404 errors!**

---

## 🎨 **Step 7: Upload Logo and Branding**

### **Upload Logo:**
1. **Go to:** Media → Add New
2. **Upload logo files** from `assets/Logos/` folder
3. **Note the uploaded file URLs**

### **Set Site Logo:**
1. **Go to:** Appearance → Customize
2. **Click:** Site Identity
3. **Upload logo** or select from media library
4. **Adjust size** and positioning
5. **Click:** "Publish" to save

---

## 🧭 **Step 8: Create Navigation Menu**

### **Create Main Menu:**
1. **Go to:** Appearance → Menus
2. **Click:** "Create a new menu"
3. **Menu name:** "Main Menu"
4. **Add pages:**
   - Home
   - Services (create this page later)
   - Parts (create this page later)
   - Contact (create this page later)
5. **Menu location:** Primary Menu
6. **Click:** "Save Menu"

---

## ✅ **Step 9: Test the Homepage**

### **Verify Homepage Works:**
1. **Visit:** https://midastechnical.com
2. **Should show:** Your new homepage (not 404!)
3. **Check:** SSL certificate (🔒 icon)
4. **Test:** Navigation and buttons

### **Check Mobile Responsiveness:**
1. **Resize browser** window
2. **Or use mobile device**
3. **Verify:** Content displays properly

---

## 🔧 **Troubleshooting Common Issues**

### **Still Getting 404 Errors:**
1. **Flush permalinks:**
   - Settings → Permalinks → Save Changes
2. **Check homepage setting:**
   - Settings → Reading → Verify "A static page" is selected
3. **Clear cache:**
   - Wait 5-10 minutes for WordPress.com cache to clear

### **Blocks Not Displaying Correctly:**
1. **Check theme compatibility**
2. **Try switching to default theme** temporarily
3. **Re-add blocks** one section at a time

### **Can't Access Dashboard:**
1. **Try:** https://midastechnical.com/wp-admin
2. **Reset password** if needed
3. **Contact WordPress.com support**

---

## 📱 **Step 10: Install WooCommerce (Next Phase)**

### **After Homepage is Working:**
1. **Go to:** Plugins → Add New
2. **Search:** "WooCommerce"
3. **Install and Activate**
4. **Run setup wizard**
5. **Configure for device repair business**

---

## 🎯 **Success Checklist**

### **Homepage Creation Complete When:**
- [ ] **Page created** with title "Home"
- [ ] **Content added** using NexusTechHub-style blocks
- [ ] **Page published** successfully
- [ ] **Set as homepage** in Reading settings
- [ ] **Permalinks configured** to "Post name"
- [ ] **Logo uploaded** and set
- [ ] **Navigation menu** created
- [ ] **https://midastechnical.com** loads homepage
- [ ] **No 404 errors** on main site
- [ ] **SSL certificate** shows secure (🔒)

---

## 📞 **Support Resources**

### **WordPress.com Help:**
- **24/7 Support:** Available in dashboard
- **Documentation:** WordPress.com support docs
- **Community:** WordPress.com forums

### **Block Editor Help:**
- **Block editor guide:** Built into WordPress
- **Video tutorials:** WordPress.com YouTube channel

**🎯 Priority: Create homepage to resolve 404 error immediately!**
