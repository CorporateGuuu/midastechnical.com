#!/bin/bash

# WordPress.com Domain Propagation Monitor
# Tracks domain propagation status and readiness for next phase

echo "📡 WordPress.com Domain Propagation Monitor"
echo "==========================================="
echo "Domain: midastechnical.com"
echo "Target: WordPress.com hosting"
echo "Started: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test domain response
test_domain_response() {
    local response=$(curl -s -I https://midastechnical.com 2>/dev/null)
    local status_code=$(echo "$response" | head -1 | awk '{print $2}')
    local server=$(echo "$response" | grep -i "server:" | awk '{print $2}')
    
    echo -e "${BLUE}🔍 Domain Response Test${NC}"
    echo "Status Code: $status_code"
    echo "Server: $server"
    
    if [[ "$status_code" == "200" ]]; then
        echo -e "${GREEN}✅ Domain responding with 200 OK${NC}"
        return 0
    elif [[ "$status_code" == "404" ]] && [[ "$server" == *"Netlify"* ]]; then
        echo -e "${YELLOW}⚠️  Still showing Netlify 404 (propagation in progress)${NC}"
        return 1
    elif [[ "$status_code" == "404" ]] && [[ "$server" != *"Netlify"* ]]; then
        echo -e "${YELLOW}⚠️  WordPress.com 404 (domain connected, homepage needs verification)${NC}"
        return 2
    else
        echo -e "${RED}❌ Unexpected response: $status_code from $server${NC}"
        return 3
    fi
}

# Function to test DNS records
test_dns_records() {
    echo -e "${BLUE}🔍 DNS Records Test${NC}"
    
    # Test A records
    local a_records=$(dig midastechnical.com A +short)
    if echo "$a_records" | grep -q "192.0.78"; then
        echo -e "${GREEN}✅ A records point to WordPress.com${NC}"
    else
        echo -e "${RED}❌ A records incorrect${NC}"
    fi
    
    # Test WWW CNAME
    local www_cname=$(dig www.midastechnical.com CNAME +short)
    if [[ -n "$www_cname" ]]; then
        echo -e "${GREEN}✅ WWW CNAME configured${NC}"
    else
        echo -e "${YELLOW}⚠️  WWW CNAME missing${NC}"
    fi
    
    # Test SPF record
    local spf_record=$(dig midastechnical.com TXT +short | grep spf)
    if [[ -n "$spf_record" ]]; then
        echo -e "${GREEN}✅ SPF record found${NC}"
    else
        echo -e "${YELLOW}⚠️  SPF record not detected${NC}"
    fi
    
    # Test DKIM records
    local dkim1=$(dig wpcloud1._domainkey.midastechnical.com CNAME +short)
    local dkim2=$(dig wpcloud2._domainkey.midastechnical.com CNAME +short)
    
    if [[ -n "$dkim1" ]]; then
        echo -e "${GREEN}✅ DKIM1 record found${NC}"
    else
        echo -e "${YELLOW}⚠️  DKIM1 record not detected${NC}"
    fi
    
    if [[ -n "$dkim2" ]]; then
        echo -e "${GREEN}✅ DKIM2 record found${NC}"
    else
        echo -e "${YELLOW}⚠️  DKIM2 record not detected${NC}"
    fi
    
    # Test DMARC record
    local dmarc=$(dig _dmarc.midastechnical.com TXT +short)
    if [[ -n "$dmarc" ]]; then
        echo -e "${GREEN}✅ DMARC record found${NC}"
    else
        echo -e "${YELLOW}⚠️  DMARC record not detected${NC}"
    fi
}

# Function to test homepage content
test_homepage_content() {
    echo -e "${BLUE}🔍 Homepage Content Test${NC}"
    
    local content=$(curl -s https://midastechnical.com 2>/dev/null)
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" https://midastechnical.com 2>/dev/null)
    
    if [[ "$status_code" == "200" ]]; then
        if echo "$content" | grep -qi "Professional Device Repair"; then
            echo -e "${GREEN}✅ Homepage content detected${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Homepage accessible but content may be missing${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Homepage not accessible (Status: $status_code)${NC}"
        return 2
    fi
}

# Function to check WordPress.com platform
test_wordpress_platform() {
    echo -e "${BLUE}🔍 WordPress.com Platform Test${NC}"
    
    local response=$(curl -s -I https://midastechnical.com 2>/dev/null)
    
    if echo "$response" | grep -qi "wordpress\|wp-"; then
        echo -e "${GREEN}✅ WordPress.com platform detected${NC}"
        return 0
    elif echo "$response" | grep -qi "netlify"; then
        echo -e "${YELLOW}⚠️  Still showing Netlify (propagation in progress)${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠️  Platform detection unclear${NC}"
        return 2
    fi
}

# Main monitoring function
run_monitoring_cycle() {
    local cycle_num=$1
    
    echo -e "${BLUE}📊 Monitoring Cycle #$cycle_num - $(date)${NC}"
    echo "=================================================="
    
    # Test domain response
    test_domain_response
    local domain_status=$?
    echo ""
    
    # Test DNS records
    test_dns_records
    echo ""
    
    # Test homepage content
    test_homepage_content
    local content_status=$?
    echo ""
    
    # Test WordPress.com platform
    test_wordpress_platform
    local platform_status=$?
    echo ""
    
    # Overall assessment
    echo -e "${BLUE}📋 Cycle Summary${NC}"
    echo "================"
    
    if [[ $domain_status -eq 0 && $content_status -eq 0 && $platform_status -eq 0 ]]; then
        echo -e "${GREEN}🎉 DOMAIN FULLY PROPAGATED AND WORKING!${NC}"
        echo -e "${GREEN}✅ Ready to proceed with WooCommerce setup${NC}"
        return 0
    elif [[ $domain_status -eq 2 ]]; then
        echo -e "${YELLOW}⚠️  Domain connected to WordPress.com but homepage needs verification${NC}"
        echo -e "${BLUE}📝 Action: Check WordPress.com homepage settings${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠️  Propagation still in progress${NC}"
        echo -e "${BLUE}📝 Status: Waiting for DNS/CDN propagation${NC}"
        return 2
    fi
}

# Continuous monitoring mode
if [[ "$1" == "--continuous" ]]; then
    echo -e "${BLUE}🔄 Starting continuous monitoring (Ctrl+C to stop)${NC}"
    echo "Will check every 5 minutes..."
    echo ""
    
    cycle=1
    while true; do
        run_monitoring_cycle $cycle
        result=$?
        
        if [[ $result -eq 0 ]]; then
            echo ""
            echo -e "${GREEN}🎉 MONITORING COMPLETE - DOMAIN READY!${NC}"
            echo -e "${GREEN}✅ You can now proceed with WooCommerce setup${NC}"
            break
        fi
        
        echo ""
        echo -e "${BLUE}⏱️  Waiting 5 minutes before next check...${NC}"
        echo "=================================================="
        echo ""
        sleep 300
        cycle=$((cycle + 1))
    done
else
    # Single check mode
    run_monitoring_cycle 1
    result=$?
    
    echo ""
    echo -e "${BLUE}📝 Next Steps${NC}"
    echo "============="
    
    if [[ $result -eq 0 ]]; then
        echo "1. Domain is ready - proceed with WooCommerce setup"
        echo "2. Run: Follow WooCommerce setup checklist"
        echo "3. Upload brand assets from merged repository"
    elif [[ $result -eq 1 ]]; then
        echo "1. Check WordPress.com homepage settings"
        echo "2. Verify 'Home' page is set as homepage"
        echo "3. Re-run this script in 30 minutes"
    else
        echo "1. Wait 30-60 minutes for propagation"
        echo "2. Re-run this script: ./monitor-domain-propagation.sh"
        echo "3. For continuous monitoring: ./monitor-domain-propagation.sh --continuous"
    fi
    
    echo ""
    echo -e "${BLUE}📚 Available Commands${NC}"
    echo "===================="
    echo "Single check:      ./monitor-domain-propagation.sh"
    echo "Continuous mode:   ./monitor-domain-propagation.sh --continuous"
    echo "Homepage verify:   ./wordpress-homepage-verification.sh"
    echo "DNS diagnostic:    ./diagnose-domain-connection.sh"
fi

echo ""
echo -e "${BLUE}📊 Monitoring completed at: $(date)${NC}"
