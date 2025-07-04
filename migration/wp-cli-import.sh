#!/bin/bash

# WordPress CLI Import Script for midastechnical.com
# This script imports data using WP-CLI commands

# Configuration
STAGING_URL="https://staging-123456.siteground.site"  # Update with actual staging URL
WP_PATH="/path/to/wordpress"  # Update with actual WordPress path
EXPORT_DIR="./exports"

echo "🚀 Starting WordPress import for midastechnical.com"
echo "Staging URL: $STAGING_URL"
echo "Export Directory: $EXPORT_DIR"

# Function to check if WP-CLI is available
check_wp_cli() {
    if ! command -v wp &> /dev/null; then
        echo "❌ WP-CLI not found. Please install WP-CLI first."
        echo "Visit: https://wp-cli.org/"
        exit 1
    fi
    echo "✅ WP-CLI found"
}

# Function to verify WordPress installation
verify_wordpress() {
    if [ ! -f "$WP_PATH/wp-config.php" ]; then
        echo "❌ WordPress not found at: $WP_PATH"
        echo "Please update WP_PATH variable with correct WordPress installation path"
        exit 1
    fi
    echo "✅ WordPress installation found"
}

# Function to import categories
import_categories() {
    echo "📁 Importing categories..."
    
    if [ ! -f "$EXPORT_DIR/categories.csv" ]; then
        echo "❌ Categories CSV not found: $EXPORT_DIR/categories.csv"
        return 1
    fi
    
    # Read CSV and create categories
    tail -n +2 "$EXPORT_DIR/categories.csv" | while IFS=',' read -r id name slug description parent image; do
        # Remove quotes from fields
        name=$(echo "$name" | sed 's/"//g')
        slug=$(echo "$slug" | sed 's/"//g')
        description=$(echo "$description" | sed 's/"//g')
        
        echo "Creating category: $name"
        wp term create product_cat "$name" --slug="$slug" --description="$description" --path="$WP_PATH" 2>/dev/null || echo "Category may already exist: $name"
    done
    
    echo "✅ Categories import completed"
}

# Function to import products using WooCommerce CSV importer
import_products() {
    echo "📦 Importing products..."
    
    if [ ! -f "$EXPORT_DIR/products.csv" ]; then
        echo "❌ Products CSV not found: $EXPORT_DIR/products.csv"
        return 1
    fi
    
    # Use WooCommerce CSV import if available
    wp plugin is-active woocommerce --path="$WP_PATH" || {
        echo "❌ WooCommerce is not active"
        return 1
    }
    
    # Import products via WP-CLI (requires WooCommerce CLI)
    echo "Importing products via WooCommerce..."
    wp wc product import "$EXPORT_DIR/products.csv" --path="$WP_PATH" 2>/dev/null || {
        echo "⚠️  Direct CSV import failed, creating products manually..."
        import_products_manual
    }
    
    echo "✅ Products import completed"
}

# Function to manually import products
import_products_manual() {
    echo "Creating products manually..."
    
    # Read products CSV and create each product
    tail -n +2 "$EXPORT_DIR/products.csv" | while IFS=',' read -r id name slug sku description price sale_price stock categories images brand featured screen_size color storage condition compatibility; do
        # Clean fields
        name=$(echo "$name" | sed 's/"//g')
        slug=$(echo "$slug" | sed 's/"//g')
        sku=$(echo "$sku" | sed 's/"//g')
        description=$(echo "$description" | sed 's/"//g')
        price=$(echo "$price" | sed 's/"//g')
        stock=$(echo "$stock" | sed 's/"//g')
        brand=$(echo "$brand" | sed 's/"//g')
        
        echo "Creating product: $name"
        
        # Create product
        product_id=$(wp post create --post_type=product --post_title="$name" --post_name="$slug" --post_content="$description" --post_status=publish --path="$WP_PATH" --porcelain)
        
        if [ ! -z "$product_id" ]; then
            # Set product meta
            wp post meta update "$product_id" "_sku" "$sku" --path="$WP_PATH"
            wp post meta update "$product_id" "_regular_price" "$price" --path="$WP_PATH"
            wp post meta update "$product_id" "_price" "$price" --path="$WP_PATH"
            wp post meta update "$product_id" "_manage_stock" "yes" --path="$WP_PATH"
            wp post meta update "$product_id" "_stock" "$stock" --path="$WP_PATH"
            wp post meta update "$product_id" "_stock_status" "instock" --path="$WP_PATH"
            
            # Set featured if applicable
            if [ "$featured" = "1" ]; then
                wp post meta update "$product_id" "_featured" "yes" --path="$WP_PATH"
            fi
            
            echo "✅ Created product: $name (ID: $product_id)"
        else
            echo "❌ Failed to create product: $name"
        fi
    done
}

# Function to import users
import_users() {
    echo "👥 Importing users..."
    
    if [ ! -f "$EXPORT_DIR/users.csv" ]; then
        echo "❌ Users CSV not found: $EXPORT_DIR/users.csv"
        return 1
    fi
    
    # Read users CSV and create each user
    tail -n +2 "$EXPORT_DIR/users.csv" | while IFS=',' read -r id email first_name last_name phone reg_date is_admin status; do
        # Clean fields
        email=$(echo "$email" | sed 's/"//g')
        first_name=$(echo "$first_name" | sed 's/"//g')
        last_name=$(echo "$last_name" | sed 's/"//g')
        is_admin=$(echo "$is_admin" | sed 's/"//g')
        
        echo "Creating user: $email"
        
        # Determine role
        if [ "$is_admin" = "1" ]; then
            role="administrator"
        else
            role="customer"
        fi
        
        # Create user
        wp user create "$email" "$email" --user_pass="$(wp eval 'echo wp_generate_password();' --path="$WP_PATH")" --first_name="$first_name" --last_name="$last_name" --role="$role" --path="$WP_PATH" 2>/dev/null || echo "User may already exist: $email"
    done
    
    echo "✅ Users import completed"
}

# Function to create sample orders (orders require more complex setup)
import_orders() {
    echo "📋 Creating sample orders..."
    
    if [ ! -f "$EXPORT_DIR/orders.csv" ]; then
        echo "❌ Orders CSV not found: $EXPORT_DIR/orders.csv"
        return 1
    fi
    
    echo "⚠️  Order import requires manual setup due to complexity"
    echo "Orders will be created as draft posts for reference"
    
    # Read orders CSV and create reference posts
    tail -n +2 "$EXPORT_DIR/orders.csv" | while IFS=',' read -r id order_number customer_email status total shipping payment_method payment_status date_created; do
        # Clean fields
        order_number=$(echo "$order_number" | sed 's/"//g')
        customer_email=$(echo "$customer_email" | sed 's/"//g')
        status=$(echo "$status" | sed 's/"//g')
        total=$(echo "$total" | sed 's/"//g')
        
        echo "Creating order reference: $order_number"
        
        # Create a post to track the order information
        wp post create --post_type=post --post_title="Order $order_number" --post_content="Customer: $customer_email, Status: $status, Total: $total" --post_status=draft --path="$WP_PATH" --porcelain > /dev/null
    done
    
    echo "✅ Order references created (manual WooCommerce order creation recommended)"
}

# Function to verify import
verify_import() {
    echo "🔍 Verifying import..."
    
    # Check categories
    category_count=$(wp term list product_cat --format=count --path="$WP_PATH")
    echo "Categories imported: $category_count"
    
    # Check products
    product_count=$(wp post list --post_type=product --format=count --path="$WP_PATH")
    echo "Products imported: $product_count"
    
    # Check users
    user_count=$(wp user list --format=count --path="$WP_PATH")
    echo "Users in system: $user_count"
    
    echo "✅ Import verification completed"
}

# Main execution
main() {
    check_wp_cli
    verify_wordpress
    
    echo ""
    echo "Starting import process..."
    
    import_categories
    import_products
    import_users
    import_orders
    
    echo ""
    verify_import
    
    echo ""
    echo "🎉 WordPress import completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Login to WordPress admin: $STAGING_URL/wp-admin/"
    echo "2. Verify all data imported correctly"
    echo "3. Test WooCommerce functionality"
    echo "4. Proceed to Stripe integration setup"
    echo ""
}

# Run main function
main
