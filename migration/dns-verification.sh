#!/bin/bash

# DNS Verification Script for midastechnical.com
# Monitor DNS propagation after updating A records

DOMAIN="midastechnical.com"
EXPECTED_IP=""  # Will be filled in after getting SiteGround IP

echo "🔍 DNS Verification for $DOMAIN"
echo "================================"
echo "Started: $(date)"
echo ""

# Function to check DNS from multiple servers
check_dns() {
    echo "Checking DNS propagation..."
    echo ""
    
    # Check from major DNS servers
    echo "Google DNS (8.8.8.8):"
    dig @8.8.8.8 $DOMAIN A +short
    
    echo "Cloudflare DNS (1.1.1.1):"
    dig @1.1.1.1 $DOMAIN A +short
    
    echo "OpenDNS (208.67.222.222):"
    dig @208.67.222.222 $DOMAIN A +short
    
    echo "Quad9 DNS (9.9.9.9):"
    dig @9.9.9.9 $DOMAIN A +short
    
    echo ""
}

# Function to test website accessibility
test_website() {
    echo "Testing website accessibility..."
    echo ""
    
    # Test homepage
    echo "Testing homepage:"
    response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" "https://$DOMAIN/")
    http_code=$(echo $response | cut -d'|' -f1)
    time_total=$(echo $response | cut -d'|' -f2)
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Homepage accessible (${time_total}s)"
    else
        echo "❌ Homepage not accessible (HTTP $http_code)"
    fi
    
    # Test shop page
    echo "Testing shop page:"
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/shop/")
    if [ "$response" = "200" ]; then
        echo "✅ Shop page accessible"
    else
        echo "❌ Shop page not accessible (HTTP $response)"
    fi
    
    # Test WordPress admin
    echo "Testing WordPress admin:"
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/wp-admin/")
    if [ "$response" = "200" ] || [ "$response" = "302" ]; then
        echo "✅ WordPress admin accessible"
    else
        echo "❌ WordPress admin not accessible (HTTP $response)"
    fi
    
    echo ""
}

# Function to check SSL certificate
check_ssl() {
    echo "Checking SSL certificate..."
    echo ""
    
    ssl_info=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate valid"
        echo "$ssl_info"
    else
        echo "❌ SSL certificate issues detected"
    fi
    
    echo ""
}

# Function to test redirects
test_redirects() {
    echo "Testing redirect functionality..."
    echo ""
    
    # Test old product URL redirect
    echo "Testing product redirect:"
    response=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" "https://$DOMAIN/products/iphone-12-screen")
    http_code=$(echo $response | cut -d'|' -f1)
    redirect_url=$(echo $response | cut -d'|' -f2)
    
    if [ "$http_code" = "301" ]; then
        echo "✅ Product redirect working: $redirect_url"
    else
        echo "❌ Product redirect not working (HTTP $http_code)"
    fi
    
    # Test old category URL redirect
    echo "Testing category redirect:"
    response=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" "https://$DOMAIN/categories/phone-parts")
    http_code=$(echo $response | cut -d'|' -f1)
    redirect_url=$(echo $response | cut -d'|' -f2)
    
    if [ "$http_code" = "301" ]; then
        echo "✅ Category redirect working: $redirect_url"
    else
        echo "❌ Category redirect not working (HTTP $http_code)"
    fi
    
    echo ""
}

# Main monitoring loop
echo "Starting DNS monitoring..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
    echo "=== Check at $(date) ==="
    check_dns
    test_website
    check_ssl
    test_redirects
    
    echo "Waiting 60 seconds for next check..."
    echo ""
    sleep 60
done
