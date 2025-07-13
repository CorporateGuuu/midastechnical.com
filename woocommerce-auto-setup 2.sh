#!/bin/bash

# WooCommerce Auto-Setup Script for WordPress.com
# Automates the complete e-commerce setup for midastechnical.com

echo "🛒 WooCommerce Auto-Setup for Midastechnical.com"
echo "================================================="
echo "Professional Device Repair E-commerce Platform"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SITE_URL="midastechnical.com"
STORE_NAME="Midas Technical Solutions"
STORE_TAGLINE="Professional Device Repair & Parts"
ADMIN_EMAIL="support@mdtstech.store"
CURRENCY="USD"
COUNTRY="US"
STATE="NY"

echo -e "${BLUE}📋 Store Configuration${NC}"
echo "Site URL: $SITE_URL"
echo "Store Name: $STORE_NAME"
echo "Admin Email: $ADMIN_EMAIL"
echo "Currency: $CURRENCY"
echo "Location: $STATE, $COUNTRY"
echo ""

# Step 1: Check Domain Status
echo -e "${BLUE}🔍 Step 1: Checking Domain Status${NC}"
DOMAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$SITE_URL")
if [ "$DOMAIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Domain is live and accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Domain status: $DOMAIN_STATUS (may still be propagating)${NC}"
    echo "Continuing with setup preparation..."
fi
echo ""

# Step 2: Create WooCommerce Configuration
echo -e "${BLUE}📝 Step 2: Creating WooCommerce Configuration${NC}"

# Create WooCommerce settings JSON
cat > woocommerce-config.json << EOF
{
  "store_setup": {
    "store_name": "$STORE_NAME",
    "store_tagline": "$STORE_TAGLINE",
    "store_address": {
      "address_1": "123 Tech Street",
      "city": "New York",
      "state": "$STATE",
      "postcode": "10001",
      "country": "$COUNTRY"
    },
    "currency": "$CURRENCY",
    "currency_position": "left",
    "thousand_separator": ",",
    "decimal_separator": ".",
    "number_of_decimals": 2
  },
  "payment_gateways": {
    "stripe": {
      "enabled": true,
      "title": "Credit Card",
      "description": "Pay securely with your credit card"
    },
    "paypal": {
      "enabled": true,
      "title": "PayPal",
      "description": "Pay via PayPal"
    },
    "bank_transfer": {
      "enabled": true,
      "title": "Bank Transfer",
      "description": "Make payment directly into our bank account"
    }
  },
  "shipping": {
    "zones": [
      {
        "name": "United States",
        "countries": ["US"],
        "methods": [
          {
            "method": "flat_rate",
            "title": "Standard Shipping",
            "cost": "9.99"
          },
          {
            "method": "flat_rate",
            "title": "Express Shipping",
            "cost": "19.99"
          },
          {
            "method": "free_shipping",
            "title": "Free Shipping",
            "minimum_amount": "100"
          }
        ]
      }
    ]
  },
  "tax": {
    "enabled": true,
    "calculate_tax_for": "shipping_and_billing",
    "shipping_tax_class": "standard",
    "tax_rates": [
      {
        "country": "US",
        "state": "NY",
        "rate": "8.25",
        "name": "NY Sales Tax",
        "shipping": true
      }
    ]
  }
}
EOF

echo -e "${GREEN}✅ WooCommerce configuration created${NC}"
echo ""

# Step 3: Create Product Import Data
echo -e "${BLUE}📦 Step 3: Creating Product Import Data${NC}"

# Create product CSV for import
cat > products-import.csv << 'EOF'
Type,SKU,Name,Published,Is featured?,Visibility in catalog,Short description,Description,Date sale price starts,Date sale price ends,Tax status,Tax class,In stock?,Stock,Low stock amount,Backorders allowed?,Sold individually?,Weight (lbs),Length (in),Width (in),Height (in),Allow customer reviews?,Purchase note,Sale price,Regular price,Categories,Tags,Shipping class,Images,Download limit,Download expiry days,Parent,Grouped products,Upsells,Cross-sells,External URL,Button text,Position
simple,IPH-SCR-12,iPhone 12 Screen Replacement,1,1,visible,"High-quality iPhone 12 screen replacement","Professional grade iPhone 12 screen replacement with lifetime warranty. Includes all necessary tools and installation guide.",,,,taxable,,1,50,5,0,0,0.5,6,3,0.3,1,,89.99,99.99,"iPhone Parts > Screens","iPhone,Screen,Repair,Parts",,"/assets/products/iphone-12-screen.jpg",,,,,,,,,0
simple,IPH-BAT-12,iPhone 12 Battery Replacement,1,0,visible,"OEM quality iPhone 12 battery","Original Equipment Manufacturer quality iPhone 12 battery replacement. 2915mAh capacity with installation tools included.",,,,taxable,,1,75,10,0,0,0.2,4,2,0.1,1,,39.99,49.99,"iPhone Parts > Batteries","iPhone,Battery,Repair,Parts",,"/assets/products/iphone-12-battery.jpg",,,,,,,,,1
simple,SAM-SCR-S21,Samsung Galaxy S21 Screen,1,1,visible,"Samsung S21 OLED display","Premium OLED display replacement for Samsung Galaxy S21. Perfect color reproduction and touch sensitivity.",,,,taxable,,1,30,5,0,0,0.4,6.2,2.9,0.2,1,,129.99,149.99,"Samsung Parts > Screens","Samsung,Screen,OLED,Repair",,"/assets/products/samsung-s21-screen.jpg",,,,,,,,,2
simple,IPD-SCR-AIR4,iPad Air 4 Screen Assembly,1,0,visible,"iPad Air 4th Gen screen","Complete screen assembly for iPad Air 4th generation including digitizer and LCD.",,,,taxable,,1,20,3,0,0,1.2,9.8,6.8,0.3,1,,199.99,229.99,"iPad Parts > Screens","iPad,Screen,Air,Repair",,"/assets/products/ipad-air4-screen.jpg",,,,,,,,,3
simple,MAC-SSD-1TB,MacBook SSD 1TB Upgrade,1,1,visible,"1TB NVMe SSD for MacBook","High-speed 1TB NVMe SSD upgrade compatible with MacBook Pro and Air models 2018+.",,,,taxable,,1,15,2,0,0,0.1,3,1,0.1,1,,299.99,349.99,"MacBook Parts > Storage","MacBook,SSD,Storage,Upgrade",,"/assets/products/macbook-ssd-1tb.jpg",,,,,,,,,4
simple,TOOL-KIT-PRO,Professional Repair Tool Kit,1,1,visible,"Complete repair tool set","Professional 64-piece repair tool kit for smartphones, tablets, and laptops. Includes precision screwdrivers, spudgers, and opening tools.",,,,taxable,,1,100,10,0,0,2.5,12,8,2,1,,79.99,99.99,"Tools > Repair Kits","Tools,Repair,Kit,Professional",,"/assets/products/tool-kit-pro.jpg",,,,,,,,,5
simple,ADHES-STRIP-IPH,iPhone Adhesive Strips,1,0,visible,"iPhone adhesive strips pack","Pack of 10 pre-cut adhesive strips for iPhone battery and screen installations.",,,,taxable,,1,200,20,0,0,0.1,4,3,0.1,1,,9.99,12.99,"Tools > Adhesives","Adhesive,iPhone,Installation,Tools",,"/assets/products/adhesive-strips.jpg",,,,,,,,,6
variable,CASE-PROT-VAR,Device Protection Cases,1,1,visible,"Protective cases for devices","High-quality protective cases available for various device models.",,,,taxable,,1,,,0,0,0.3,6,3,0.5,1,,19.99,29.99,"Accessories > Cases","Case,Protection,Accessories",,"/assets/products/protection-cases.jpg",,,,,,,,,7
service,REP-SRV-SCR,Screen Repair Service,1,1,visible,"Professional screen repair","Expert screen repair service with same-day turnaround and warranty.",,,,taxable,,1,,,0,1,,,,,1,,99.99,149.99,"Services > Repair","Service,Repair,Screen,Professional",,"/assets/products/repair-service.jpg",,,,,,,,,8
service,REP-SRV-BAT,Battery Replacement Service,1,0,visible,"Battery replacement service","Professional battery replacement with genuine parts and 6-month warranty.",,,,taxable,,1,,,0,1,,,,,1,,69.99,89.99,"Services > Repair","Service,Battery,Replacement",,"/assets/products/battery-service.jpg",,,,,,,,,9
EOF

echo -e "${GREEN}✅ Product import data created (10 products)${NC}"
echo ""

# Step 4: Create Category Structure
echo -e "${BLUE}📂 Step 4: Creating Category Structure${NC}"

cat > categories-import.csv << 'EOF'
Category Name,Category Slug,Category Parent,Category Description,Category Image
iPhone Parts,iphone-parts,,"Genuine and OEM quality parts for iPhone devices",
Samsung Parts,samsung-parts,,"High-quality replacement parts for Samsung devices",
iPad Parts,ipad-parts,,"Professional grade parts for iPad repairs",
MacBook Parts,macbook-parts,,"Upgrade and replacement parts for MacBook computers",
Tools,tools,,"Professional repair tools and equipment",
Accessories,accessories,,"Device accessories and protection",
Services,services,,"Professional repair and maintenance services",
Screens,screens,iPhone Parts,"Display and screen replacement parts",
Batteries,batteries,iPhone Parts,"Battery replacement parts and kits",
Screens,screens,Samsung Parts,"Samsung display replacements",
Screens,screens,iPad Parts,"iPad screen and digitizer assemblies",
Storage,storage,MacBook Parts,"SSD and storage upgrade options",
Repair Kits,repair-kits,Tools,"Complete tool sets for device repair",
Adhesives,adhesives,Tools,"Adhesive strips and installation materials",
Cases,cases,Accessories,"Protective cases and covers",
Repair,repair,Services,"Professional repair services"
EOF

echo -e "${GREEN}✅ Category structure created${NC}"
echo ""

# Step 5: Create WordPress.com Deployment Commands
echo -e "${BLUE}🚀 Step 5: Creating Deployment Commands${NC}"

cat > deploy-to-wordpress.sh << 'EOF'
#!/bin/bash

# WordPress.com WooCommerce Deployment Script
echo "🚀 Deploying WooCommerce to WordPress.com"
echo "=========================================="

# Check if SSH connection works
echo "🔍 Testing SSH connection..."
if ssh -o ConnectTimeout=10 wordpress-midastechnical "pwd" 2>/dev/null; then
    echo "✅ SSH connection successful"
else
    echo "❌ SSH connection failed. Please ensure:"
    echo "   1. SSH key is attached to midastechnical.com site"
    echo "   2. WordPress.com SSH access is enabled"
    echo "   3. Domain propagation is complete"
    exit 1
fi

# Upload configuration files
echo "📤 Uploading configuration files..."
sftp wordpress-midastechnical << 'SFTP_COMMANDS'
cd wp-content
put woocommerce-config.json
put products-import.csv
put categories-import.csv
quit
SFTP_COMMANDS

echo "✅ Configuration files uploaded"

# Create wp-config.php additions
echo "⚙️  Creating wp-config additions..."
cat > wp-config-additions.php << 'PHP_CONFIG'
<?php
// WooCommerce Configuration for Midastechnical.com

// Enable WooCommerce features
define('WC_ADMIN_DISABLED', false);
define('WOOCOMMERCE_BLOCKS_PHASE', 3);

// Performance optimizations
define('WP_CACHE', true);
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);

// Security enhancements
define('DISALLOW_FILE_EDIT', true);
define('WP_AUTO_UPDATE_CORE', true);

// WooCommerce specific settings
define('WC_SESSION_CACHE_GROUP', 'wc_session_id');
define('WC_TEMPLATE_DEBUG_MODE', false);

// Email configuration
define('WOOCOMMERCE_EMAIL_FROM_NAME', 'Midas Technical Solutions');
define('WOOCOMMERCE_EMAIL_FROM_ADDRESS', 'support@mdtstech.store');
PHP_CONFIG

echo "✅ WordPress configuration prepared"
echo ""
echo "🎯 Next Steps:"
echo "1. Login to WordPress.com admin dashboard"
echo "2. Install WooCommerce plugin"
echo "3. Run WooCommerce setup wizard"
echo "4. Import products and categories"
echo "5. Configure payment gateways"
echo "6. Test checkout process"
echo ""
echo "📋 Configuration files ready:"
echo "   - woocommerce-config.json"
echo "   - products-import.csv"
echo "   - categories-import.csv"
echo "   - wp-config-additions.php"

EOF

chmod +x deploy-to-wordpress.sh
echo -e "${GREEN}✅ Deployment script created${NC}"
echo ""

# Step 6: Create Testing Checklist
echo -e "${BLUE}✅ Step 6: Creating Testing Checklist${NC}"

cat > woocommerce-testing-checklist.md << 'EOF'
# 🧪 WooCommerce Testing Checklist

## **Pre-Launch Testing for midastechnical.com**

### **✅ Store Setup Verification**
- [ ] Store name and tagline correct
- [ ] Store address and contact info accurate
- [ ] Currency and tax settings configured
- [ ] Shipping zones and methods set up
- [ ] Payment gateways tested

### **✅ Product Testing**
- [ ] All 10 products imported successfully
- [ ] Product images display correctly
- [ ] Product descriptions and pricing accurate
- [ ] Inventory tracking working
- [ ] Variable products (cases) configured
- [ ] Service products (repairs) set up correctly

### **✅ Category Structure**
- [ ] All categories created and organized
- [ ] Category descriptions added
- [ ] Category images uploaded
- [ ] Navigation menu updated

### **✅ Checkout Process**
- [ ] Add to cart functionality
- [ ] Cart page displays correctly
- [ ] Checkout form validation
- [ ] Payment processing (test mode)
- [ ] Order confirmation emails
- [ ] Order status updates

### **✅ User Experience**
- [ ] Mobile responsiveness
- [ ] Page load speeds acceptable
- [ ] Search functionality working
- [ ] Product filtering operational
- [ ] Customer account creation
- [ ] Order history accessible

### **✅ Business Features**
- [ ] Tax calculation accurate
- [ ] Shipping calculation correct
- [ ] Inventory management working
- [ ] Low stock notifications
- [ ] Order management dashboard
- [ ] Customer communication templates

### **✅ Security & Performance**
- [ ] SSL certificate active
- [ ] Security headers configured
- [ ] Backup system operational
- [ ] Performance optimization enabled
- [ ] Error logging configured
- [ ] Monitoring systems active

### **✅ Integration Readiness**
- [ ] n8n webhook endpoints prepared
- [ ] API access configured
- [ ] Third-party integrations tested
- [ ] Analytics tracking installed
- [ ] Email marketing connected
- [ ] Customer support tools ready

## **🚀 Go-Live Checklist**
- [ ] All tests passed
- [ ] Content reviewed and approved
- [ ] Payment gateways in live mode
- [ ] Shipping rates finalized
- [ ] Legal pages updated
- [ ] Customer support ready
- [ ] Marketing campaigns prepared
- [ ] Staff training completed

## **📊 Success Metrics**
- [ ] Page load time < 3 seconds
- [ ] Mobile score > 90%
- [ ] Checkout completion rate > 70%
- [ ] Search functionality accuracy > 95%
- [ ] Zero critical errors in logs
- [ ] All payment methods functional
EOF

echo -e "${GREEN}✅ Testing checklist created${NC}"
echo ""

# Summary
echo -e "${BLUE}📋 WooCommerce Auto-Setup Summary${NC}"
echo "=================================="
echo -e "${GREEN}✅ Configuration files created${NC}"
echo -e "${GREEN}✅ Product import data prepared (10 products)${NC}"
echo -e "${GREEN}✅ Category structure defined${NC}"
echo -e "${GREEN}✅ Deployment script ready${NC}"
echo -e "${GREEN}✅ Testing checklist prepared${NC}"
echo ""
echo -e "${YELLOW}📝 Files Created:${NC}"
echo "   - woocommerce-config.json"
echo "   - products-import.csv"
echo "   - categories-import.csv"
echo "   - deploy-to-wordpress.sh"
echo "   - woocommerce-testing-checklist.md"
echo "   - wp-config-additions.php"
echo ""
echo -e "${BLUE}🎯 Ready for WordPress.com deployment!${NC}"
echo "Run './deploy-to-wordpress.sh' when domain is live"
