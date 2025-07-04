# SEO Preservation & 301 Redirects Strategy for midastechnical.com

## 🎯 OBJECTIVE
Maintain 100% of current search engine rankings and domain authority during the Next.js to WordPress migration.

---

## 📊 CURRENT URL STRUCTURE ANALYSIS

### **Next.js URLs (Current)**
```
Homepage: https://midastechnical.com/
Products: https://midastechnical.com/products
Product Detail: https://midastechnical.com/products/[slug]
Categories: https://midastechnical.com/categories/[category]
User Account: https://midastechnical.com/account
Cart: https://midastechnical.com/cart
Checkout: https://midastechnical.com/checkout
About: https://midastechnical.com/about
Contact: https://midastechnical.com/contact
Admin: https://midastechnical.com/admin
API Routes: https://midastechnical.com/api/*
```

### **WordPress URLs (New)**
```
Homepage: https://midastechnical.com/
Products: https://midastechnical.com/shop/
Product Detail: https://midastechnical.com/product/[slug]/
Categories: https://midastechnical.com/product-category/[category]/
User Account: https://midastechnical.com/my-account/
Cart: https://midastechnical.com/cart/
Checkout: https://midastechnical.com/checkout/
About: https://midastechnical.com/about/
Contact: https://midastechnical.com/contact/
Admin: https://midastechnical.com/wp-admin/
API Routes: https://midastechnical.com/wp-json/*
```

---

## 🔄 301 REDIRECT MAPPING

### **Critical SEO Redirects**

```apache
# .htaccess redirects for WordPress
RewriteEngine On

# Product pages - preserve individual product SEO
RewriteRule ^products/([^/]+)/?$ /product/$1/ [R=301,L]

# Products listing page
RewriteRule ^products/?$ /shop/ [R=301,L]

# Category pages
RewriteRule ^categories/([^/]+)/?$ /product-category/$1/ [R=301,L]

# User account pages
RewriteRule ^account/?$ /my-account/ [R=301,L]
RewriteRule ^account/(.*)$ /my-account/$1/ [R=301,L]

# Admin redirects
RewriteRule ^admin/?$ /wp-admin/ [R=301,L]
RewriteRule ^admin/(.*)$ /wp-admin/ [R=301,L]

# API redirects (if needed for external integrations)
RewriteRule ^api/products/?$ /wp-json/wc/v3/products [R=301,L]
RewriteRule ^api/orders/?$ /wp-json/wc/v3/orders [R=301,L]

# Static pages (ensure trailing slashes)
RewriteRule ^about/?$ /about/ [R=301,L]
RewriteRule ^contact/?$ /contact/ [R=301,L]

# Legacy URLs (if any exist)
RewriteRule ^home/?$ / [R=301,L]
RewriteRule ^shop/?$ /shop/ [R=301,L]
```

### **WordPress Permalink Structure**
```
Product Base: /product/
Category Base: /product-category/
Shop Page: /shop/
Account Page: /my-account/
```

---

## 🛠️ IMPLEMENTATION METHODS

### **Method 1: WordPress .htaccess (Recommended)**

Create comprehensive .htaccess file:

```apache
# BEGIN WordPress SEO Redirects for midastechnical.com
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /

# Preserve product URLs with exact slug matching
RewriteRule ^products/([a-zA-Z0-9-]+)/?$ /product/$1/ [R=301,L]

# Products listing
RewriteRule ^products/?$ /shop/ [R=301,L]

# Category preservation
RewriteRule ^categories/([a-zA-Z0-9-]+)/?$ /product-category/$1/ [R=301,L]

# User account system
RewriteRule ^account/?$ /my-account/ [R=301,L]
RewriteRule ^account/orders/?$ /my-account/orders/ [R=301,L]
RewriteRule ^account/profile/?$ /my-account/edit-account/ [R=301,L]

# Cart and checkout (likely same URLs)
RewriteRule ^cart/?$ /cart/ [R=301,L]
RewriteRule ^checkout/?$ /checkout/ [R=301,L]

# Admin area
RewriteRule ^admin/?$ /wp-admin/ [R=301,L]

# API endpoints for external integrations
RewriteRule ^api/products/?$ /wp-json/wc/v3/products [R=301,L]
RewriteRule ^api/categories/?$ /wp-json/wc/v3/products/categories [R=301,L]

# WordPress standard rules
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress SEO Redirects
```

### **Method 2: WordPress Redirection Plugin**

Install and configure the Redirection plugin:

```php
// Programmatic redirects via functions.php
function mdts_custom_redirects() {
    // Product redirects
    if (preg_match('/^\/products\/([^\/]+)\/?$/', $_SERVER['REQUEST_URI'], $matches)) {
        wp_redirect(home_url('/product/' . $matches[1] . '/'), 301);
        exit;
    }
    
    // Products listing
    if ($_SERVER['REQUEST_URI'] === '/products' || $_SERVER['REQUEST_URI'] === '/products/') {
        wp_redirect(home_url('/shop/'), 301);
        exit;
    }
    
    // Category redirects
    if (preg_match('/^\/categories\/([^\/]+)\/?$/', $_SERVER['REQUEST_URI'], $matches)) {
        wp_redirect(home_url('/product-category/' . $matches[1] . '/'), 301);
        exit;
    }
}
add_action('template_redirect', 'mdts_custom_redirects');
```

---

## 📈 SEO PRESERVATION CHECKLIST

### **Pre-Migration SEO Audit**
- [ ] Export current sitemap from Google Search Console
- [ ] Document all indexed pages and their rankings
- [ ] Backup current meta titles and descriptions
- [ ] Note all inbound links and their anchor text
- [ ] Record current Core Web Vitals scores

### **During Migration**
- [ ] Implement 301 redirects before DNS cutover
- [ ] Preserve exact URL slugs for products and categories
- [ ] Maintain meta titles and descriptions
- [ ] Keep same heading structure (H1, H2, etc.)
- [ ] Preserve internal linking structure

### **Post-Migration SEO Tasks**
- [ ] Submit new XML sitemap to Google Search Console
- [ ] Update Google My Business listing
- [ ] Verify all redirects are working (301, not 302)
- [ ] Check for 404 errors and fix immediately
- [ ] Monitor search rankings for 30 days
- [ ] Update any hardcoded links in external sources

---

## 🔍 MONITORING & VALIDATION

### **Redirect Testing Tools**
1. **Redirect Checker**: httpstatus.io
2. **Bulk URL Tester**: redirectchecker.org
3. **Google Search Console**: Monitor crawl errors
4. **Screaming Frog**: Comprehensive site audit

### **SEO Monitoring**
1. **Google Search Console**: Track ranking changes
2. **Google Analytics**: Monitor traffic patterns
3. **SEMrush/Ahrefs**: Track keyword rankings
4. **Core Web Vitals**: Monitor performance metrics

### **Critical Metrics to Track**
- Organic traffic levels
- Keyword ranking positions
- Click-through rates
- Bounce rates
- Page load speeds
- Crawl error rates

---

## 🚨 EMERGENCY ROLLBACK PLAN

### **If SEO Issues Arise**
1. **Immediate Actions**:
   - Revert DNS to original Netlify hosting
   - Restore original URLs temporarily
   - Notify search engines of temporary change

2. **Investigation Process**:
   - Identify specific redirect issues
   - Fix WordPress configuration
   - Test thoroughly on staging

3. **Re-Migration**:
   - Implement fixes
   - Re-test all redirects
   - Execute cutover again

---

## 📋 REDIRECT IMPLEMENTATION TIMELINE

### **Week Before Migration**
- [ ] Prepare all redirect rules
- [ ] Test redirects on staging environment
- [ ] Validate with SEO tools
- [ ] Create monitoring dashboard

### **Migration Day**
- [ ] Implement redirects before DNS change
- [ ] Monitor redirect functionality
- [ ] Check Google Search Console for errors
- [ ] Verify all critical pages redirect correctly

### **Week After Migration**
- [ ] Daily monitoring of search rankings
- [ ] Fix any discovered redirect issues
- [ ] Update external links where possible
- [ ] Monitor Core Web Vitals scores

This comprehensive redirect strategy will ensure zero loss of search engine rankings and maintain full domain authority during the migration to WordPress.
