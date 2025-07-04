#!/bin/bash

# 404 Error Diagnostic Script for midastechnical.com
# Comprehensive analysis of potential 404 issues after WordPress migration

DOMAIN="midastechnical.com"
STAGING_DOMAIN="staging-123456.siteground.site"  # Update with actual staging URL
LOG_FILE="404-diagnosis-$(date +%Y%m%d-%H%M%S).log"

echo "🚨 404 Error Diagnosis for $DOMAIN" | tee $LOG_FILE
echo "Started: $(date)" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE

# Function to test URL and log response
test_url() {
    local url=$1
    local description=$2
    
    echo "Testing: $description" | tee -a $LOG_FILE
    echo "URL: $url" | tee -a $LOG_FILE
    
    response=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}|%{time_total}" "$url")
    http_code=$(echo $response | cut -d'|' -f1)
    redirect_url=$(echo $response | cut -d'|' -f2)
    time_total=$(echo $response | cut -d'|' -f3)
    
    if [ "$http_code" = "404" ]; then
        echo "❌ 404 ERROR: $url" | tee -a $LOG_FILE
        return 1
    elif [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
        echo "🔄 REDIRECT ($http_code): $url → $redirect_url" | tee -a $LOG_FILE
        return 0
    elif [ "$http_code" = "200" ]; then
        echo "✅ OK: $url (${time_total}s)" | tee -a $LOG_FILE
        return 0
    else
        echo "⚠️  HTTP $http_code: $url" | tee -a $LOG_FILE
        return 1
    fi
}

echo "" | tee -a $LOG_FILE
echo "🔍 TESTING CORE WORDPRESS PAGES" | tee -a $LOG_FILE
echo "================================" | tee -a $LOG_FILE

# Test core WordPress pages
test_url "https://$DOMAIN/" "Homepage"
test_url "https://$DOMAIN/shop/" "Shop page"
test_url "https://$DOMAIN/cart/" "Cart page"
test_url "https://$DOMAIN/checkout/" "Checkout page"
test_url "https://$DOMAIN/my-account/" "My Account page"
test_url "https://$DOMAIN/wp-admin/" "WordPress Admin"

echo "" | tee -a $LOG_FILE
echo "🛒 TESTING PRODUCT PAGES" | tee -a $LOG_FILE
echo "========================" | tee -a $LOG_FILE

# Test migrated product pages (WordPress format)
test_url "https://$DOMAIN/product/iphone-12-screen/" "iPhone 12 Screen (WordPress)"
test_url "https://$DOMAIN/product/samsung-s21-battery/" "Samsung Battery (WordPress)"
test_url "https://$DOMAIN/product/pro-screwdriver-set/" "Screwdriver Set (WordPress)"
test_url "https://$DOMAIN/product/iphone-13-lcd/" "iPhone 13 LCD (WordPress)"
test_url "https://$DOMAIN/product/universal-phone-stand/" "Phone Stand (WordPress)"

echo "" | tee -a $LOG_FILE
echo "📁 TESTING CATEGORY PAGES" | tee -a $LOG_FILE
echo "==========================" | tee -a $LOG_FILE

# Test category pages (WordPress format)
test_url "https://$DOMAIN/product-category/phone-parts/" "Phone Parts Category"
test_url "https://$DOMAIN/product-category/iphone-parts/" "iPhone Parts Category"
test_url "https://$DOMAIN/product-category/repair-tools/" "Repair Tools Category"

echo "" | tee -a $LOG_FILE
echo "🔄 TESTING OLD NEXT.JS URLS (Should Redirect)" | tee -a $LOG_FILE
echo "=============================================" | tee -a $LOG_FILE

# Test old Next.js URLs that should redirect
test_url "https://$DOMAIN/products/" "Old products listing"
test_url "https://$DOMAIN/products/iphone-12-screen" "Old iPhone 12 Screen URL"
test_url "https://$DOMAIN/products/samsung-s21-battery" "Old Samsung Battery URL"
test_url "https://$DOMAIN/products/pro-screwdriver-set" "Old Screwdriver Set URL"
test_url "https://$DOMAIN/categories/phone-parts" "Old Phone Parts Category"
test_url "https://$DOMAIN/categories/iphone-parts" "Old iPhone Parts Category"
test_url "https://$DOMAIN/account" "Old account URL"
test_url "https://$DOMAIN/admin" "Old admin URL"

echo "" | tee -a $LOG_FILE
echo "🔗 TESTING API ENDPOINTS" | tee -a $LOG_FILE
echo "========================" | tee -a $LOG_FILE

# Test API endpoints
test_url "https://$DOMAIN/wp-json/wc/v3/products" "WooCommerce Products API"
test_url "https://$DOMAIN/wp-json/wc/v3/products/categories" "WooCommerce Categories API"
test_url "https://$DOMAIN/wp-json/mdts/v1/stripe-webhook" "Custom Stripe Webhook"

echo "" | tee -a $LOG_FILE
echo "📄 TESTING ESSENTIAL PAGES" | tee -a $LOG_FILE
echo "===========================" | tee -a $LOG_FILE

# Test essential pages
test_url "https://$DOMAIN/about/" "About page"
test_url "https://$DOMAIN/contact/" "Contact page"
test_url "https://$DOMAIN/privacy-policy/" "Privacy Policy"
test_url "https://$DOMAIN/terms-of-service/" "Terms of Service"
test_url "https://$DOMAIN/shipping-returns/" "Shipping & Returns"

echo "" | tee -a $LOG_FILE
echo "🔍 TESTING COMMON 404 PATTERNS" | tee -a $LOG_FILE
echo "===============================" | tee -a $LOG_FILE

# Test common 404 patterns
test_url "https://$DOMAIN/blog/" "Blog page (might not exist)"
test_url "https://$DOMAIN/news/" "News page (might not exist)"
test_url "https://$DOMAIN/services/" "Services page (might not exist)"
test_url "https://$DOMAIN/support/" "Support page (might not exist)"

echo "" | tee -a $LOG_FILE
echo "🔧 CHECKING WORDPRESS CONFIGURATION" | tee -a $LOG_FILE
echo "====================================" | tee -a $LOG_FILE

# Check if WordPress is accessible
wp_check=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/wp-admin/")
if [ "$wp_check" = "200" ] || [ "$wp_check" = "302" ]; then
    echo "✅ WordPress admin accessible" | tee -a $LOG_FILE
else
    echo "❌ WordPress admin not accessible (HTTP $wp_check)" | tee -a $LOG_FILE
fi

# Check if WooCommerce is working
wc_check=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/shop/")
if [ "$wc_check" = "200" ]; then
    echo "✅ WooCommerce shop accessible" | tee -a $LOG_FILE
else
    echo "❌ WooCommerce shop not accessible (HTTP $wc_check)" | tee -a $LOG_FILE
fi

echo "" | tee -a $LOG_FILE
echo "📊 DIAGNOSIS SUMMARY" | tee -a $LOG_FILE
echo "====================" | tee -a $LOG_FILE

# Count 404 errors
error_count=$(grep -c "❌ 404 ERROR" $LOG_FILE)
redirect_count=$(grep -c "🔄 REDIRECT" $LOG_FILE)
success_count=$(grep -c "✅ OK" $LOG_FILE)

echo "404 Errors Found: $error_count" | tee -a $LOG_FILE
echo "Redirects Working: $redirect_count" | tee -a $LOG_FILE
echo "Successful Requests: $success_count" | tee -a $LOG_FILE

if [ $error_count -gt 0 ]; then
    echo "" | tee -a $LOG_FILE
    echo "🚨 CRITICAL: $error_count 404 errors found!" | tee -a $LOG_FILE
    echo "URLs returning 404:" | tee -a $LOG_FILE
    grep "❌ 404 ERROR" $LOG_FILE | sed 's/❌ 404 ERROR: /- /' | tee -a $LOG_FILE
else
    echo "✅ No 404 errors detected!" | tee -a $LOG_FILE
fi

echo "" | tee -a $LOG_FILE
echo "Diagnosis completed: $(date)" | tee -a $LOG_FILE
echo "Log saved to: $LOG_FILE" | tee -a $LOG_FILE

# Return exit code based on errors found
exit $error_count
