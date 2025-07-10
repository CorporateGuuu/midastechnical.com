#!/bin/bash

# WordPress.com Homepage Verification Script
# Tests if homepage is live and functioning correctly

echo "🔍 WordPress.com Homepage Verification"
echo "======================================"
echo "Domain: midastechnical.com"
echo "Testing homepage functionality..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if curl is available
if ! command_exists curl; then
    echo -e "${RED}❌ 'curl' command not found. Please install curl${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Testing Homepage Access...${NC}"
echo ""

# Test 1: Basic HTTPS Access
echo -e "${YELLOW}🔍 Test 1: Basic HTTPS Access...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://midastechnical.com 2>/dev/null || echo "000")
echo "HTTP Status Code: $HTTP_STATUS"

if [[ "$HTTP_STATUS" == "200" ]]; then
    echo -e "${GREEN}✅ Homepage is accessible (Status: 200)${NC}"
    BASIC_ACCESS="✅"
elif [[ "$HTTP_STATUS" == "404" ]]; then
    echo -e "${RED}❌ Homepage shows 404 error (Status: 404)${NC}"
    echo -e "${RED}   Homepage not created or not set as front page${NC}"
    BASIC_ACCESS="❌"
elif [[ "$HTTP_STATUS" == "000" ]]; then
    echo -e "${RED}❌ Cannot connect to site (Connection failed)${NC}"
    BASIC_ACCESS="❌"
else
    echo -e "${YELLOW}⚠️  Unexpected status code: $HTTP_STATUS${NC}"
    BASIC_ACCESS="⚠️"
fi
echo ""

# Test 2: SSL Certificate Check
echo -e "${YELLOW}🔍 Test 2: SSL Certificate Status...${NC}"
SSL_INFO=$(curl -s -I https://midastechnical.com 2>/dev/null | head -1)
echo "SSL Response: $SSL_INFO"

if echo "$SSL_INFO" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ SSL certificate is working${NC}"
    SSL_STATUS="✅"
else
    echo -e "${RED}❌ SSL certificate issues detected${NC}"
    SSL_STATUS="❌"
fi
echo ""

# Test 3: Content Verification
echo -e "${YELLOW}🔍 Test 3: Homepage Content Verification...${NC}"
if [[ "$HTTP_STATUS" == "200" ]]; then
    # Download homepage content
    HOMEPAGE_CONTENT=$(curl -s https://midastechnical.com 2>/dev/null)
    
    # Check for key content elements
    TITLE_CHECK=$(echo "$HOMEPAGE_CONTENT" | grep -i "Professional Device Repair" && echo "found" || echo "missing")
    SERVICES_CHECK=$(echo "$HOMEPAGE_CONTENT" | grep -i "Our Services" && echo "found" || echo "missing")
    STATS_CHECK=$(echo "$HOMEPAGE_CONTENT" | grep -i "5,000" && echo "found" || echo "missing")
    
    echo "Content checks:"
    if [[ "$TITLE_CHECK" == *"found"* ]]; then
        echo -e "${GREEN}✅ Main title found: 'Professional Device Repair Services'${NC}"
        TITLE_STATUS="✅"
    else
        echo -e "${RED}❌ Main title missing${NC}"
        TITLE_STATUS="❌"
    fi
    
    if [[ "$SERVICES_CHECK" == *"found"* ]]; then
        echo -e "${GREEN}✅ Services section found${NC}"
        SERVICES_STATUS="✅"
    else
        echo -e "${RED}❌ Services section missing${NC}"
        SERVICES_STATUS="❌"
    fi
    
    if [[ "$STATS_CHECK" == *"found"* ]]; then
        echo -e "${GREEN}✅ Stats section found (5,000+ parts)${NC}"
        STATS_STATUS="✅"
    else
        echo -e "${RED}❌ Stats section missing${NC}"
        STATS_STATUS="❌"
    fi
    
    # Overall content status
    if [[ "$TITLE_STATUS" == "✅" && "$SERVICES_STATUS" == "✅" && "$STATS_STATUS" == "✅" ]]; then
        CONTENT_STATUS="✅"
        echo -e "${GREEN}✅ Homepage content is complete${NC}"
    else
        CONTENT_STATUS="❌"
        echo -e "${YELLOW}⚠️  Some homepage content may be missing${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot verify content (homepage not accessible)${NC}"
    CONTENT_STATUS="❌"
fi
echo ""

# Test 4: Mobile Responsiveness Check
echo -e "${YELLOW}🔍 Test 4: Mobile Responsiveness...${NC}"
if [[ "$HTTP_STATUS" == "200" ]]; then
    MOBILE_CONTENT=$(curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" https://midastechnical.com 2>/dev/null)
    VIEWPORT_CHECK=$(echo "$MOBILE_CONTENT" | grep -i "viewport" && echo "found" || echo "missing")
    
    if [[ "$VIEWPORT_CHECK" == *"found"* ]]; then
        echo -e "${GREEN}✅ Mobile viewport meta tag found${NC}"
        MOBILE_STATUS="✅"
    else
        echo -e "${YELLOW}⚠️  Mobile viewport meta tag not detected${NC}"
        MOBILE_STATUS="⚠️"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot test mobile responsiveness${NC}"
    MOBILE_STATUS="❌"
fi
echo ""

# Test 5: WordPress.com Specific Checks
echo -e "${YELLOW}🔍 Test 5: WordPress.com Platform Verification...${NC}"
if [[ "$HTTP_STATUS" == "200" ]]; then
    WP_CHECK=$(echo "$HOMEPAGE_CONTENT" | grep -i "wp-content\|wordpress" && echo "found" || echo "missing")
    
    if [[ "$WP_CHECK" == *"found"* ]]; then
        echo -e "${GREEN}✅ WordPress.com platform detected${NC}"
        WP_STATUS="✅"
    else
        echo -e "${YELLOW}⚠️  WordPress.com platform indicators not clear${NC}"
        WP_STATUS="⚠️"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot verify WordPress.com platform${NC}"
    WP_STATUS="❌"
fi
echo ""

# Summary Report
echo -e "${BLUE}📊 Homepage Verification Summary${NC}"
echo "=================================="
echo -e "Basic Access (200 OK):           $BASIC_ACCESS"
echo -e "SSL Certificate:                 $SSL_STATUS"
echo -e "Homepage Content:                $CONTENT_STATUS"
echo -e "Mobile Responsiveness:           $MOBILE_STATUS"
echo -e "WordPress.com Platform:          $WP_STATUS"
echo ""

# Overall Status
if [[ "$BASIC_ACCESS" == "✅" && "$SSL_STATUS" == "✅" && "$CONTENT_STATUS" == "✅" ]]; then
    echo -e "${GREEN}🎉 Homepage Verification: SUCCESSFUL!${NC}"
    echo -e "${GREEN}✅ https://midastechnical.com is live and functioning correctly${NC}"
    echo ""
    echo -e "${BLUE}📝 Next Steps:${NC}"
    echo "1. Add missing DNS records to resolve SSL warnings"
    echo "2. Install and configure WooCommerce"
    echo "3. Upload brand assets and create essential pages"
    echo "4. Set up navigation menu"
    OVERALL_STATUS="SUCCESS"
elif [[ "$BASIC_ACCESS" == "❌" ]]; then
    echo -e "${RED}❌ Homepage Verification: FAILED${NC}"
    echo -e "${RED}Homepage is not accessible - needs to be created or configured${NC}"
    echo ""
    echo -e "${BLUE}📝 Required Actions:${NC}"
    echo "1. Create 'Home' page in WordPress.com dashboard"
    echo "2. Add homepage content using wordpress-homepage-content.txt"
    echo "3. Set as homepage in Settings → Reading"
    echo "4. Configure permalinks to 'Post name'"
    OVERALL_STATUS="FAILED"
else
    echo -e "${YELLOW}⚠️  Homepage Verification: PARTIAL${NC}"
    echo -e "${YELLOW}Homepage is accessible but may need content or configuration fixes${NC}"
    echo ""
    echo -e "${BLUE}📝 Recommended Actions:${NC}"
    echo "1. Review homepage content and formatting"
    echo "2. Check WordPress.com dashboard for any issues"
    echo "3. Verify all homepage sections are displaying correctly"
    OVERALL_STATUS="PARTIAL"
fi

echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "- Setup guide: docs/WORDPRESS_SITE_SETUP_GUIDE.md"
echo "- Homepage content: wordpress-homepage-content.txt"
echo "- WordPress.com dashboard: https://wordpress.com/home/midastechnical.com"
echo ""

# Exit with appropriate code
if [[ "$OVERALL_STATUS" == "SUCCESS" ]]; then
    exit 0
elif [[ "$OVERALL_STATUS" == "PARTIAL" ]]; then
    exit 1
else
    exit 2
fi
