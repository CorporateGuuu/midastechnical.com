#!/bin/bash

# Real-time DNS Cutover Monitoring for midastechnical.com
# Run this script after updating DNS records to monitor propagation

DOMAIN="midastechnical.com"
OLD_IP1="192.0.78.159"
OLD_IP2="192.0.78.224"
NEW_IP=""  # Will be detected automatically

echo "🚀 DNS Cutover Monitoring for $DOMAIN"
echo "======================================"
echo "Started: $(date)"
echo ""

# Function to get current IP from DNS
get_current_ip() {
    dig +short $DOMAIN A | head -1
}

# Function to check DNS from multiple servers
check_dns_servers() {
    echo "Checking DNS servers..."
    
    local google=$(dig @8.8.8.8 $DOMAIN A +short | head -1)
    local cloudflare=$(dig @1.1.1.1 $DOMAIN A +short | head -1)
    local opendns=$(dig @208.67.222.222 $DOMAIN A +short | head -1)
    local quad9=$(dig @9.9.9.9 $DOMAIN A +short | head -1)
    
    echo "Google DNS (8.8.8.8):     $google"
    echo "Cloudflare (1.1.1.1):     $cloudflare"
    echo "OpenDNS (208.67.222.222): $opendns"
    echo "Quad9 (9.9.9.9):          $quad9"
    
    # Count how many are showing new IP
    local new_count=0
    local total=4
    
    if [ "$google" != "$OLD_IP1" ] && [ "$google" != "$OLD_IP2" ] && [ -n "$google" ]; then
        ((new_count++))
        if [ -z "$NEW_IP" ]; then NEW_IP="$google"; fi
    fi
    
    if [ "$cloudflare" != "$OLD_IP1" ] && [ "$cloudflare" != "$OLD_IP2" ] && [ -n "$cloudflare" ]; then
        ((new_count++))
        if [ -z "$NEW_IP" ]; then NEW_IP="$cloudflare"; fi
    fi
    
    if [ "$opendns" != "$OLD_IP1" ] && [ "$opendns" != "$OLD_IP2" ] && [ -n "$opendns" ]; then
        ((new_count++))
        if [ -z "$NEW_IP" ]; then NEW_IP="$opendns"; fi
    fi
    
    if [ "$quad9" != "$OLD_IP1" ] && [ "$quad9" != "$OLD_IP2" ] && [ -n "$quad9" ]; then
        ((new_count++))
        if [ -z "$NEW_IP" ]; then NEW_IP="$quad9"; fi
    fi
    
    local percentage=$((new_count * 100 / total))
    echo "Propagation: $new_count/$total servers ($percentage%)"
    
    if [ -n "$NEW_IP" ]; then
        echo "New IP detected: $NEW_IP"
    fi
    
    echo ""
    return $percentage
}

# Function to test website accessibility
test_website() {
    echo "Testing website accessibility..."
    
    # Test homepage
    local response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" "https://$DOMAIN/" 2>/dev/null)
    local http_code=$(echo $response | cut -d'|' -f1)
    local time_total=$(echo $response | cut -d'|' -f2)
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Homepage accessible (${time_total}s)"
    elif [ "$http_code" = "000" ]; then
        echo "⏳ Homepage not yet accessible (DNS still propagating)"
    else
        echo "⚠️  Homepage HTTP $http_code (${time_total}s)"
    fi
    
    # Test shop page
    local shop_response=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/shop/" 2>/dev/null)
    if [ "$shop_response" = "200" ]; then
        echo "✅ Shop page accessible"
    elif [ "$shop_response" = "000" ]; then
        echo "⏳ Shop page not yet accessible"
    else
        echo "⚠️  Shop page HTTP $shop_response"
    fi
    
    # Test WordPress admin
    local admin_response=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/wp-admin/" 2>/dev/null)
    if [ "$admin_response" = "200" ] || [ "$admin_response" = "302" ]; then
        echo "✅ WordPress admin accessible"
    elif [ "$admin_response" = "000" ]; then
        echo "⏳ WordPress admin not yet accessible"
    else
        echo "⚠️  WordPress admin HTTP $admin_response"
    fi
    
    echo ""
}

# Function to test SSL certificate
test_ssl() {
    echo "Testing SSL certificate..."
    
    local ssl_check=$(echo | timeout 5 openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | grep -c "Verify return code: 0")
    
    if [ "$ssl_check" = "1" ]; then
        echo "✅ SSL certificate valid"
    else
        echo "⏳ SSL certificate not yet valid (may be provisioning)"
    fi
    
    echo ""
}

# Function to test redirects
test_redirects() {
    echo "Testing redirect functionality..."
    
    # Test old product URL
    local redirect_response=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/products/iphone-12-screen" 2>/dev/null)
    if [ "$redirect_response" = "301" ]; then
        echo "✅ Product redirects working"
    elif [ "$redirect_response" = "000" ]; then
        echo "⏳ Redirects not yet accessible"
    else
        echo "⚠️  Product redirect HTTP $redirect_response"
    fi
    
    # Test old category URL
    local category_response=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/categories/phone-parts" 2>/dev/null)
    if [ "$category_response" = "301" ]; then
        echo "✅ Category redirects working"
    elif [ "$category_response" = "000" ]; then
        echo "⏳ Category redirects not yet accessible"
    else
        echo "⚠️  Category redirect HTTP $category_response"
    fi
    
    echo ""
}

# Function to show progress bar
show_progress() {
    local percentage=$1
    local bar_length=50
    local filled_length=$((percentage * bar_length / 100))
    
    printf "Progress: ["
    for ((i=0; i<filled_length; i++)); do printf "█"; done
    for ((i=filled_length; i<bar_length; i++)); do printf "░"; done
    printf "] %d%%\n" $percentage
}

# Main monitoring loop
echo "🔍 Starting DNS cutover monitoring..."
echo "Press Ctrl+C to stop monitoring"
echo ""

start_time=$(date +%s)
check_count=0

while true; do
    ((check_count++))
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    echo "=== Check #$check_count at $(date) (${elapsed}s elapsed) ==="
    
    # Check DNS propagation
    check_dns_servers
    percentage=$?
    
    # Show progress bar
    show_progress $percentage
    
    # Test website functionality
    test_website
    
    # Test SSL certificate
    test_ssl
    
    # Test redirects
    test_redirects
    
    # Check if cutover is complete
    if [ $percentage -ge 75 ]; then
        echo "🎉 DNS cutover appears successful!"
        echo "✅ 75%+ of DNS servers showing new IP"
        echo "✅ Website should be accessible for most users"
        echo ""
        echo "Continue monitoring for full propagation..."
    fi
    
    if [ $percentage -ge 95 ]; then
        echo "🚀 DNS cutover COMPLETE!"
        echo "✅ 95%+ global propagation achieved"
        echo "✅ midastechnical.com is now live on WordPress!"
        echo ""
        echo "Final verification recommended:"
        echo "1. Test complete e-commerce workflow"
        echo "2. Verify all redirects working"
        echo "3. Check admin dashboard access"
        echo "4. Test payment processing"
        break
    fi
    
    echo "Waiting 60 seconds for next check..."
    echo ""
    sleep 60
done

echo ""
echo "🎯 DNS Cutover Monitoring Complete"
echo "Total time: ${elapsed} seconds"
echo "Final status: WordPress site live on $DOMAIN"
