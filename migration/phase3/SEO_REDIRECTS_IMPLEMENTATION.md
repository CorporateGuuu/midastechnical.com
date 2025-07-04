# SEO Redirects Implementation for midastechnical.com

## 🎯 OBJECTIVE
Implement and test 301 redirects to preserve SEO rankings during the Next.js to WordPress migration.

---

## 📋 REDIRECT STRATEGY OVERVIEW

### **URL Mapping Strategy**
```
Next.js URLs → WordPress URLs

/products/[slug] → /product/[slug]/
/categories/[slug] → /product-category/[slug]/
/account → /my-account/
/admin → /wp-admin/
/api/* → /wp-json/wc/v3/*
```

### **SEO Preservation Goals**
- Maintain 100% of search engine rankings
- Preserve domain authority
- Ensure zero 404 errors
- Implement proper 301 redirects (not 302)
- Maintain internal link equity

---

## 🔧 HTACCESS IMPLEMENTATION

### **Step 1: Upload .htaccess File**

#### **Via SiteGround File Manager:**
1. **Access**: SiteGround Site Tools → File Manager
2. **Navigate to**: public_html directory
3. **Upload**: `migration/.htaccess-midastechnical` file
4. **Rename**: to `.htaccess`
5. **Set permissions**: 644

#### **Via WordPress Admin (Alternative):**
1. **Install**: Redirection plugin
2. **Navigate to**: Tools → Redirection
3. **Add redirects**: Manually add each redirect rule

### **Step 2: Verify .htaccess Content**

Ensure the .htaccess file contains all necessary redirects:

```apache
# SEO Redirects for midastechnical.com Migration
RewriteEngine On

# Product pages: /products/[slug] -> /product/[slug]/
RewriteRule ^products/([a-zA-Z0-9\-_]+)/?$ /product/$1/ [R=301,L]

# Products listing: /products -> /shop/
RewriteRule ^products/?$ /shop/ [R=301,L]

# Category pages: /categories/[slug] -> /product-category/[slug]/
RewriteRule ^categories/([a-zA-Z0-9\-_]+)/?$ /product-category/$1/ [R=301,L]

# User account: /account -> /my-account/
RewriteRule ^account/?$ /my-account/ [R=301,L]

# Admin area: /admin -> /wp-admin/
RewriteRule ^admin/?$ /wp-admin/ [R=301,L]

# API endpoints: /api/* -> /wp-json/wc/v3/*
RewriteRule ^api/products/?$ /wp-json/wc/v3/products [R=301,L]
RewriteRule ^api/categories/?$ /wp-json/wc/v3/products/categories [R=301,L]
```

---

## 🧪 REDIRECT TESTING

### **Step 1: Manual Redirect Testing**

#### **Test Each Redirect Rule:**

**Product Page Redirects:**
```bash
# Test: /products/iphone-12-screen
curl -I https://staging-[number].siteground.site/products/iphone-12-screen
# Expected: 301 redirect to /product/iphone-12-screen/

# Test: /products/samsung-s21-battery
curl -I https://staging-[number].siteground.site/products/samsung-s21-battery
# Expected: 301 redirect to /product/samsung-s21-battery/
```

**Category Page Redirects:**
```bash
# Test: /categories/phone-parts
curl -I https://staging-[number].siteground.site/categories/phone-parts
# Expected: 301 redirect to /product-category/phone-parts/

# Test: /categories/iphone-parts
curl -I https://staging-[number].siteground.site/categories/iphone-parts
# Expected: 301 redirect to /product-category/iphone-parts/
```

**Account and Admin Redirects:**
```bash
# Test: /account
curl -I https://staging-[number].siteground.site/account
# Expected: 301 redirect to /my-account/

# Test: /admin
curl -I https://staging-[number].siteground.site/admin
# Expected: 301 redirect to /wp-admin/
```

### **Step 2: Browser Testing**

#### **Manual Browser Tests:**
1. **Open browser**: Chrome/Firefox/Safari
2. **Visit old URLs**: Type old URL format
3. **Verify redirect**: Should automatically redirect to new URL
4. **Check status**: Use browser dev tools to confirm 301 status

#### **Test URLs:**
```
https://staging-[number].siteground.site/products/
→ Should redirect to: /shop/

https://staging-[number].siteground.site/products/iphone-12-screen
→ Should redirect to: /product/iphone-12-screen/

https://staging-[number].siteground.site/categories/phone-parts
→ Should redirect to: /product-category/phone-parts/

https://staging-[number].siteground.site/account
→ Should redirect to: /my-account/
```

### **Step 3: Automated Redirect Testing**

Create a redirect testing script:

```bash
#!/bin/bash
# Redirect Testing Script

STAGING_URL="https://staging-[number].siteground.site"

echo "Testing redirects for midastechnical.com..."

# Test product redirects
echo "Testing product redirects..."
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "$STAGING_URL/products/iphone-12-screen"
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "$STAGING_URL/products/samsung-s21-battery"

# Test category redirects
echo "Testing category redirects..."
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "$STAGING_URL/categories/phone-parts"
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "$STAGING_URL/categories/iphone-parts"

# Test account redirects
echo "Testing account redirects..."
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "$STAGING_URL/account"
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "$STAGING_URL/admin"

echo "Redirect testing completed!"
```

---

## 🔍 SEO VALIDATION

### **Step 1: Redirect Status Verification**

#### **Using Online Tools:**
1. **Redirect Checker**: https://httpstatus.io/
2. **Bulk Redirect Checker**: https://www.redirectchecker.org/
3. **SEO Site Checkup**: https://seositecheckup.com/

#### **Expected Results:**
- All redirects return 301 status (not 302)
- No redirect chains (A→B→C)
- No redirect loops
- All redirects point to correct destinations

### **Step 2: Search Engine Validation**

#### **Google Search Console:**
1. **Submit new sitemap**: https://staging-url/sitemap.xml
2. **Check crawl errors**: Monitor for 404 errors
3. **Verify redirects**: Ensure Google recognizes redirects
4. **Monitor rankings**: Track any ranking changes

#### **Sitemap Generation:**
1. **Navigate to**: SEO → General → Features
2. **Enable**: XML sitemaps
3. **Generate**: New sitemap with WordPress URLs
4. **Submit**: To Google Search Console

### **Step 3: Internal Link Audit**

#### **Check Internal Links:**
1. **Scan website**: Use Screaming Frog or similar tool
2. **Identify**: Any internal links using old URL format
3. **Update**: Internal links to use new WordPress URLs
4. **Verify**: No broken internal links

---

## 📊 REDIRECT MAPPING TABLE

### **Complete Redirect Mapping**

| Old URL (Next.js) | New URL (WordPress) | Status | Priority |
|-------------------|-------------------|---------|----------|
| `/products/` | `/shop/` | 301 | High |
| `/products/iphone-12-screen` | `/product/iphone-12-screen/` | 301 | High |
| `/products/samsung-s21-battery` | `/product/samsung-s21-battery/` | 301 | High |
| `/products/pro-screwdriver-set` | `/product/pro-screwdriver-set/` | 301 | High |
| `/products/iphone-13-lcd` | `/product/iphone-13-lcd/` | 301 | High |
| `/products/universal-phone-stand` | `/product/universal-phone-stand/` | 301 | High |
| `/categories/phone-parts` | `/product-category/phone-parts/` | 301 | High |
| `/categories/iphone-parts` | `/product-category/iphone-parts/` | 301 | High |
| `/categories/repair-tools` | `/product-category/repair-tools/` | 301 | High |
| `/account` | `/my-account/` | 301 | Medium |
| `/account/orders` | `/my-account/orders/` | 301 | Medium |
| `/account/profile` | `/my-account/edit-account/` | 301 | Medium |
| `/admin` | `/wp-admin/` | 301 | Low |
| `/api/products` | `/wp-json/wc/v3/products` | 301 | Low |
| `/api/categories` | `/wp-json/wc/v3/products/categories` | 301 | Low |

---

## 🛠️ WORDPRESS PERMALINK CONFIGURATION

### **Step 1: Set Permalink Structure**

1. **Navigate to**: Settings → Permalinks
2. **Select**: Post name structure
3. **Custom structure**: `/%postname%/`
4. **Product base**: `/product/`
5. **Category base**: `/product-category/`
6. **Save changes**

### **Step 2: WooCommerce URL Settings**

1. **Navigate to**: WooCommerce → Settings → Products
2. **Configure**:
   ```
   Shop page: /shop/
   Cart page: /cart/
   Checkout page: /checkout/
   My account page: /my-account/
   ```

### **Step 3: Category Hierarchy**

Ensure category URLs match the redirect structure:
```
/product-category/phone-parts/
/product-category/iphone-parts/
/product-category/repair-tools/
```

---

## 🔧 ADVANCED REDIRECT FEATURES

### **Step 1: Query Parameter Handling**

Handle search and filter parameters:
```apache
# Preserve search parameters
RewriteCond %{QUERY_STRING} ^(.*)$
RewriteRule ^products/search/?$ /shop/?s=%1 [R=301,L]

# Preserve filter parameters
RewriteCond %{QUERY_STRING} ^(.*)$
RewriteRule ^products/filter/?$ /shop/?%1 [R=301,L]
```

### **Step 2: Mobile URL Handling**

If you had mobile-specific URLs:
```apache
# Mobile product pages
RewriteRule ^m/products/([a-zA-Z0-9\-_]+)/?$ /product/$1/ [R=301,L]

# Mobile category pages
RewriteRule ^m/categories/([a-zA-Z0-9\-_]+)/?$ /product-category/$1/ [R=301,L]
```

### **Step 3: Legacy URL Support**

Handle any legacy URLs that might exist:
```apache
# Legacy shop URLs
RewriteRule ^shop/?$ /shop/ [R=301,L]
RewriteRule ^store/?$ /shop/ [R=301,L]

# Legacy product URLs
RewriteRule ^item/([a-zA-Z0-9\-_]+)/?$ /product/$1/ [R=301,L]
```

---

## ✅ SEO REDIRECTS CHECKLIST

### **Implementation Complete**
- [ ] .htaccess file uploaded and active
- [ ] All product redirects working (301 status)
- [ ] All category redirects working (301 status)
- [ ] Account and admin redirects working
- [ ] API endpoint redirects configured
- [ ] No redirect chains or loops

### **Testing Complete**
- [ ] Manual browser testing passed
- [ ] Automated redirect testing passed
- [ ] Online redirect tools validation passed
- [ ] All redirects return 301 status
- [ ] No 404 errors on old URLs

### **SEO Validation**
- [ ] New sitemap generated and submitted
- [ ] Google Search Console configured
- [ ] Internal links audited and updated
- [ ] No broken links detected
- [ ] Search engine crawling verified

### **WordPress Configuration**
- [ ] Permalink structure optimized
- [ ] WooCommerce URLs configured
- [ ] Category hierarchy preserved
- [ ] Product URLs SEO-friendly

---

## 📊 REDIRECT PERFORMANCE MONITORING

### **Monitoring Tools**
1. **Google Search Console**: Track crawl errors and redirects
2. **Google Analytics**: Monitor traffic patterns
3. **Redirect monitoring**: Set up alerts for redirect failures
4. **SEO tools**: Monitor ranking changes

### **Key Metrics to Track**
- Redirect success rate (should be 100%)
- Page load impact (redirects should be fast)
- Search engine crawling (no increase in errors)
- Ranking preservation (no significant drops)

---

## 🚨 TROUBLESHOOTING

### **Common Issues**

**Redirects Not Working:**
- Check .htaccess file permissions (644)
- Verify Apache mod_rewrite is enabled
- Check for syntax errors in .htaccess
- Clear any caching

**Wrong Redirect Status:**
- Ensure using R=301 (not R=302)
- Check for conflicting redirect rules
- Verify rule order in .htaccess

**Redirect Loops:**
- Check for circular redirects
- Verify destination URLs are correct
- Test each redirect individually

---

## 🚀 NEXT STEPS

Once SEO redirects are implemented and tested:

1. **Proceed to Task 3.3**: Security & Performance Testing
2. **Monitor redirect performance**
3. **Document any issues found**
4. **Prepare for production deployment**

**SEO Status**: ✅ Redirects implemented and tested
**Next Phase**: Security and performance optimization

This completes the SEO redirects implementation. All old URLs now properly redirect to new WordPress URLs with 301 status, preserving search engine rankings.
