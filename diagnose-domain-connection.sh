#!/bin/bash

# Domain Connection Diagnostic Script
# Identifies why domain isn't connecting to WordPress.com despite correct DNS

echo "🔍 Domain Connection Diagnostic"
echo "==============================="
echo "Domain: midastechnical.com"
echo "Expected: WordPress.com hosting"
echo "Current: Netlify responses"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 DNS Analysis${NC}"
echo "==============="

# Check A records
echo -e "${YELLOW}🔍 A Records:${NC}"
A_RECORDS=$(dig midastechnical.com A +short)
echo "$A_RECORDS"

if echo "$A_RECORDS" | grep -q "192.0.78"; then
    echo -e "${GREEN}✅ A records point to WordPress.com${NC}"
else
    echo -e "${RED}❌ A records do not point to WordPress.com${NC}"
fi
echo ""

# Check CNAME for www
echo -e "${YELLOW}🔍 WWW CNAME:${NC}"
WWW_CNAME=$(dig www.midastechnical.com CNAME +short)
if [ -n "$WWW_CNAME" ]; then
    echo "$WWW_CNAME"
    if echo "$WWW_CNAME" | grep -q "midastechnical.com"; then
        echo -e "${GREEN}✅ WWW CNAME correctly configured${NC}"
    else
        echo -e "${RED}❌ WWW CNAME incorrect${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No WWW CNAME record found${NC}"
fi
echo ""

echo -e "${BLUE}📋 Response Analysis${NC}"
echo "==================="

# Test direct connection to WordPress.com IP
echo -e "${YELLOW}🔍 Direct WordPress.com IP Test:${NC}"
WP_RESPONSE=$(curl -s -H "Host: midastechnical.com" https://192.0.78.159 -w "%{http_code}" -o /dev/null)
echo "Response code: $WP_RESPONSE"

if [ "$WP_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ WordPress.com IP responds correctly${NC}"
elif [ "$WP_RESPONSE" = "404" ]; then
    echo -e "${YELLOW}⚠️  WordPress.com responds but no content (domain not connected)${NC}"
else
    echo -e "${RED}❌ WordPress.com IP not responding correctly${NC}"
fi
echo ""

# Test current domain response
echo -e "${YELLOW}🔍 Current Domain Response:${NC}"
DOMAIN_RESPONSE=$(curl -s -I https://midastechnical.com)
echo "$DOMAIN_RESPONSE" | head -10

# Check for Netlify indicators
if echo "$DOMAIN_RESPONSE" | grep -qi "netlify"; then
    echo -e "${RED}❌ Domain still serving from Netlify${NC}"
elif echo "$DOMAIN_RESPONSE" | grep -qi "wordpress"; then
    echo -e "${GREEN}✅ Domain serving from WordPress.com${NC}"
else
    echo -e "${YELLOW}⚠️  Unknown hosting provider${NC}"
fi
echo ""

echo -e "${BLUE}📋 Cache Analysis${NC}"
echo "================="

# Check for cache headers
echo -e "${YELLOW}🔍 Cache Headers:${NC}"
CACHE_HEADERS=$(curl -s -I https://midastechnical.com | grep -i "cache\|age\|etag")
echo "$CACHE_HEADERS"

if echo "$CACHE_HEADERS" | grep -qi "netlify"; then
    echo -e "${RED}❌ Netlify cache still active${NC}"
    echo -e "${YELLOW}   This explains why domain shows Netlify despite DNS changes${NC}"
else
    echo -e "${GREEN}✅ No Netlify cache detected${NC}"
fi
echo ""

echo -e "${BLUE}📋 Possible Issues & Solutions${NC}"
echo "=============================="

echo -e "${YELLOW}🔍 Issue Analysis:${NC}"

# Issue 1: DNS propagation
echo "1. DNS Propagation:"
if echo "$A_RECORDS" | grep -q "192.0.78"; then
    echo -e "   ${GREEN}✅ DNS A records correct${NC}"
else
    echo -e "   ${RED}❌ DNS A records incorrect${NC}"
    echo -e "   ${BLUE}Solution: Update DNS A records to WordPress.com IPs${NC}"
fi

# Issue 2: Domain connection in WordPress.com
echo "2. WordPress.com Domain Connection:"
if [ "$WP_RESPONSE" = "404" ]; then
    echo -e "   ${RED}❌ Domain not connected to WordPress.com site${NC}"
    echo -e "   ${BLUE}Solution: Add domain in WordPress.com dashboard${NC}"
elif [ "$WP_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✅ Domain connected to WordPress.com${NC}"
else
    echo -e "   ${YELLOW}⚠️  Connection status unclear${NC}"
fi

# Issue 3: Netlify cache/CDN
if echo "$DOMAIN_RESPONSE" | grep -qi "netlify"; then
    echo "3. Netlify Cache/CDN:"
    echo -e "   ${RED}❌ Netlify still serving the domain${NC}"
    echo -e "   ${BLUE}Solution: Remove domain from Netlify or wait for cache expiry${NC}"
fi

# Issue 4: Homepage configuration
echo "4. WordPress.com Homepage:"
echo -e "   ${YELLOW}⚠️  Cannot verify until domain connection resolved${NC}"

echo ""
echo -e "${BLUE}📝 Recommended Actions${NC}"
echo "======================"

echo -e "${YELLOW}Priority 1: Verify WordPress.com Domain Connection${NC}"
echo "1. Go to: https://wordpress.com/domains/manage/midastechnical.com"
echo "2. Check: Domain status and connection"
echo "3. If not connected: Follow domain connection wizard"
echo ""

echo -e "${YELLOW}Priority 2: Remove from Netlify (if applicable)${NC}"
echo "1. Login to: Netlify dashboard"
echo "2. Find: midastechnical.com site"
echo "3. Remove: Domain from Netlify site"
echo "4. Wait: 30-60 minutes for cache to clear"
echo ""

echo -e "${YELLOW}Priority 3: Clear DNS Cache${NC}"
echo "1. Local: sudo dscacheutil -flushcache"
echo "2. Wait: 15-30 minutes"
echo "3. Test: curl -s -I https://midastechnical.com"
echo ""

echo -e "${YELLOW}Priority 4: Contact Support (if needed)${NC}"
echo "1. WordPress.com Support: Domain connection issues"
echo "2. Netlify Support: Remove domain/cache"
echo "3. NS1 Support: DNS propagation issues"
echo ""

echo -e "${BLUE}📊 Summary${NC}"
echo "=========="

if echo "$A_RECORDS" | grep -q "192.0.78" && echo "$DOMAIN_RESPONSE" | grep -qi "netlify"; then
    echo -e "${YELLOW}⚠️  DNS is correct but domain still serves from Netlify${NC}"
    echo -e "${BLUE}   Most likely: Domain not connected in WordPress.com dashboard${NC}"
    echo -e "${BLUE}   Or: Netlify cache/CDN still active${NC}"
elif ! echo "$A_RECORDS" | grep -q "192.0.78"; then
    echo -e "${RED}❌ DNS A records incorrect${NC}"
    echo -e "${BLUE}   Solution: Update DNS to WordPress.com IPs${NC}"
else
    echo -e "${GREEN}✅ DNS correct and domain serving from WordPress.com${NC}"
fi

echo ""
echo -e "${BLUE}🔄 Next Steps${NC}"
echo "============="
echo "1. Check WordPress.com domain connection"
echo "2. Remove domain from Netlify (if present)"
echo "3. Wait 30-60 minutes for changes to propagate"
echo "4. Re-run this diagnostic script"
echo "5. Test homepage once domain connection is resolved"
