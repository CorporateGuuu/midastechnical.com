#!/bin/bash

# WordPress.com SSL & DNS Verification Script
# This script checks all required DNS records for SSL certificate issuance

echo "🔍 WordPress.com SSL & DNS Verification"
echo "========================================"
echo "Domain: midastechnical.com"
echo "Checking all required records for SSL certificate..."
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

# Check if dig is available
if ! command_exists dig; then
    echo -e "${RED}❌ 'dig' command not found. Please install bind-utils or dnsutils${NC}"
    echo "On macOS: brew install bind"
    echo "On Ubuntu/Debian: sudo apt-get install dnsutils"
    exit 1
fi

echo -e "${BLUE}📋 Checking Required DNS Records...${NC}"
echo ""

# Check A Records (WordPress.com hosting)
echo -e "${YELLOW}🔍 Checking A Records (WordPress.com hosting)...${NC}"
A_RECORDS=$(dig +short A midastechnical.com)
echo "Current A records:"
echo "$A_RECORDS"

if echo "$A_RECORDS" | grep -q "192.0.78.159" && echo "$A_RECORDS" | grep -q "192.0.78.224"; then
    echo -e "${GREEN}✅ A records are correct (WordPress.com IPs)${NC}"
    A_STATUS="✅"
else
    echo -e "${RED}❌ A records are incorrect or missing${NC}"
    echo -e "${RED}   Required: 192.0.78.159 and 192.0.78.224${NC}"
    A_STATUS="❌"
fi
echo ""

# Check WWW CNAME
echo -e "${YELLOW}🔍 Checking WWW CNAME record...${NC}"
WWW_RECORD=$(dig +short CNAME www.midastechnical.com)
echo "Current WWW CNAME: $WWW_RECORD"

if echo "$WWW_RECORD" | grep -q "midastechnical.com"; then
    echo -e "${GREEN}✅ WWW CNAME is correct${NC}"
    WWW_STATUS="✅"
else
    echo -e "${RED}❌ WWW CNAME is incorrect or missing${NC}"
    echo -e "${RED}   Required: www CNAME midastechnical.com${NC}"
    WWW_STATUS="❌"
fi
echo ""

# Check SPF Record
echo -e "${YELLOW}🔍 Checking SPF record...${NC}"
SPF_RECORD=$(dig +short TXT midastechnical.com | grep "spf1")
echo "Current SPF record: $SPF_RECORD"

if echo "$SPF_RECORD" | grep -q "_spf.wpcloud.com"; then
    echo -e "${GREEN}✅ SPF record is correct${NC}"
    SPF_STATUS="✅"
else
    echo -e "${RED}❌ SPF record is incorrect or missing${NC}"
    echo -e "${RED}   Required: v=spf1 include:_spf.wpcloud.com ~all${NC}"
    SPF_STATUS="❌"
fi
echo ""

# Check DKIM1 Record
echo -e "${YELLOW}🔍 Checking DKIM1 record...${NC}"
DKIM1_RECORD=$(dig +short CNAME wpcloud1._domainkey.midastechnical.com)
echo "Current DKIM1 record: $DKIM1_RECORD"

if echo "$DKIM1_RECORD" | grep -q "wpcloud1._domainkey.wpcloud.com"; then
    echo -e "${GREEN}✅ DKIM1 record is correct${NC}"
    DKIM1_STATUS="✅"
else
    echo -e "${RED}❌ DKIM1 record is incorrect or missing${NC}"
    echo -e "${RED}   Required: wpcloud1._domainkey CNAME wpcloud1._domainkey.wpcloud.com${NC}"
    DKIM1_STATUS="❌"
fi
echo ""

# Check DKIM2 Record
echo -e "${YELLOW}🔍 Checking DKIM2 record...${NC}"
DKIM2_RECORD=$(dig +short CNAME wpcloud2._domainkey.midastechnical.com)
echo "Current DKIM2 record: $DKIM2_RECORD"

if echo "$DKIM2_RECORD" | grep -q "wpcloud2._domainkey.wpcloud.com"; then
    echo -e "${GREEN}✅ DKIM2 record is correct${NC}"
    DKIM2_STATUS="✅"
else
    echo -e "${RED}❌ DKIM2 record is incorrect or missing${NC}"
    echo -e "${RED}   Required: wpcloud2._domainkey CNAME wpcloud2._domainkey.wpcloud.com${NC}"
    DKIM2_STATUS="❌"
fi
echo ""

# Check DMARC Record
echo -e "${YELLOW}🔍 Checking DMARC record...${NC}"
DMARC_RECORD=$(dig +short TXT _dmarc.midastechnical.com)
echo "Current DMARC record: $DMARC_RECORD"

if echo "$DMARC_RECORD" | grep -q "DMARC1"; then
    echo -e "${GREEN}✅ DMARC record is correct${NC}"
    DMARC_STATUS="✅"
else
    echo -e "${RED}❌ DMARC record is incorrect or missing${NC}"
    echo -e "${RED}   Required: _dmarc TXT v=DMARC1;p=none;${NC}"
    DMARC_STATUS="❌"
fi
echo ""

# Summary
echo -e "${BLUE}📊 DNS Records Summary${NC}"
echo "======================"
echo -e "A Records (WordPress.com):     $A_STATUS"
echo -e "WWW CNAME:                     $WWW_STATUS"
echo -e "SPF Record:                    $SPF_STATUS"
echo -e "DKIM1 Record:                  $DKIM1_STATUS"
echo -e "DKIM2 Record:                  $DKIM2_STATUS"
echo -e "DMARC Record:                  $DMARC_STATUS"
echo ""

# Check overall status
if [[ "$A_STATUS" == "✅" && "$WWW_STATUS" == "✅" && "$SPF_STATUS" == "✅" && "$DKIM1_STATUS" == "✅" && "$DKIM2_STATUS" == "✅" && "$DMARC_STATUS" == "✅" ]]; then
    echo -e "${GREEN}🎉 All DNS records are correct!${NC}"
    echo -e "${GREEN}SSL certificate should be issued automatically within 30-60 minutes.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Wait 30-60 minutes for SSL certificate issuance"
    echo "2. Check WordPress.com dashboard for SSL status"
    echo "3. Test https://midastechnical.com access"
    echo "4. Create homepage using templates in templates/ folder"
else
    echo -e "${RED}❌ Some DNS records are missing or incorrect${NC}"
    echo -e "${RED}SSL certificate cannot be issued until all records are correct.${NC}"
    echo ""
    echo -e "${BLUE}Required actions:${NC}"
    echo "1. Add missing DNS records to your DNS provider"
    echo "2. Use the exact values from URGENT_SSL_DNS_FIX.md"
    echo "3. Wait 30-60 minutes for DNS propagation"
    echo "4. Run this script again to verify"
    echo ""
    echo -e "${YELLOW}📋 Quick Reference - Add these records to your DNS provider:${NC}"
    
    if [[ "$A_STATUS" == "❌" ]]; then
        echo "A Record: @ → 192.0.78.159"
        echo "A Record: @ → 192.0.78.224"
    fi
    
    if [[ "$WWW_STATUS" == "❌" ]]; then
        echo "CNAME: www → midastechnical.com"
    fi
    
    if [[ "$SPF_STATUS" == "❌" ]]; then
        echo "TXT: @ → \"v=spf1 include:_spf.wpcloud.com ~all\""
    fi
    
    if [[ "$DKIM1_STATUS" == "❌" ]]; then
        echo "CNAME: wpcloud1._domainkey → wpcloud1._domainkey.wpcloud.com"
    fi
    
    if [[ "$DKIM2_STATUS" == "❌" ]]; then
        echo "CNAME: wpcloud2._domainkey → wpcloud2._domainkey.wpcloud.com"
    fi
    
    if [[ "$DMARC_STATUS" == "❌" ]]; then
        echo "TXT: _dmarc → \"v=DMARC1;p=none;\""
    fi
fi

echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "- Complete guide: URGENT_SSL_DNS_FIX.md"
echo "- DNS zone file: dns/midastechnical-complete.zone"
echo "- WordPress.com dashboard: https://wordpress.com/home/midastechnical.com"
echo ""

# Test HTTPS access
echo -e "${YELLOW}🔍 Testing HTTPS access...${NC}"
if command_exists curl; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://midastechnical.com 2>/dev/null || echo "000")
    if [[ "$HTTP_STATUS" == "200" ]]; then
        echo -e "${GREEN}✅ HTTPS access successful (Status: $HTTP_STATUS)${NC}"
    elif [[ "$HTTP_STATUS" == "404" ]]; then
        echo -e "${YELLOW}⚠️  HTTPS works but shows 404 (Status: $HTTP_STATUS)${NC}"
        echo -e "${YELLOW}   This means SSL is working but no homepage exists yet.${NC}"
        echo -e "${YELLOW}   Create homepage in WordPress.com dashboard.${NC}"
    else
        echo -e "${RED}❌ HTTPS access failed (Status: $HTTP_STATUS)${NC}"
        echo -e "${RED}   SSL certificate may not be issued yet.${NC}"
    fi
else
    echo "curl not available - cannot test HTTPS access"
fi

echo ""
echo -e "${BLUE}🎯 Priority Actions:${NC}"
echo "1. Fix any missing DNS records shown above"
echo "2. Wait for SSL certificate issuance (30-60 minutes)"
echo "3. Create homepage in WordPress.com dashboard"
echo "4. Follow setup guides in docs/ folder"
