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

