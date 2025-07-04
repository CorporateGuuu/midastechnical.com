<?php
/**
 * Automated WordPress Import Script for midastechnical.com
 * Imports CSV data directly into WordPress/WooCommerce database
 */

// WordPress configuration
define('WP_USE_THEMES', false);

// Include WordPress
$wp_path = '/path/to/wordpress'; // Update this path
if (file_exists($wp_path . '/wp-load.php')) {
    require_once($wp_path . '/wp-load.php');
} else {
    echo "WordPress not found. Please update the wp_path variable.\n";
    exit(1);
}

// Ensure WooCommerce is active
if (!class_exists('WooCommerce')) {
    echo "WooCommerce is not active. Please activate WooCommerce first.\n";
    exit(1);
}

class MDTSDataImporter {
    
    private $import_dir;
    private $log = [];
    
    public function __construct($import_dir = './exports/') {
        $this->import_dir = $import_dir;
    }
    
    public function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        $log_message = "[{$timestamp}] {$message}";
        echo $log_message . "\n";
        $this->log[] = $log_message;
    }
    
    public function import_categories() {
        $this->log('Starting category import...');
        
        $csv_file = $this->import_dir . 'categories.csv';
        if (!file_exists($csv_file)) {
            $this->log('Categories CSV file not found: ' . $csv_file);
            return false;
        }
        
        $handle = fopen($csv_file, 'r');
        $header = fgetcsv($handle); // Skip header row
        
        $imported = 0;
        while (($data = fgetcsv($handle)) !== FALSE) {
            $category_data = array_combine($header, $data);
            
            // Check if category already exists
            $existing = get_term_by('slug', $category_data['Slug'], 'product_cat');
            
            if (!$existing) {
                $result = wp_insert_term(
                    $category_data['Name'],
                    'product_cat',
                    array(
                        'slug' => $category_data['Slug'],
                        'description' => $category_data['Description'] ?? ''
                    )
                );
                
                if (!is_wp_error($result)) {
                    $imported++;
                    $this->log("Imported category: {$category_data['Name']}");
                } else {
                    $this->log("Failed to import category: {$category_data['Name']} - " . $result->get_error_message());
                }
            } else {
                $this->log("Category already exists: {$category_data['Name']}");
            }
        }
        
        fclose($handle);
        $this->log("Categories import complete. Imported: {$imported}");
        return true;
    }
    
    public function import_products() {
        $this->log('Starting product import...');
        
        $csv_file = $this->import_dir . 'products.csv';
        if (!file_exists($csv_file)) {
            $this->log('Products CSV file not found: ' . $csv_file);
            return false;
        }
        
        $handle = fopen($csv_file, 'r');
        $header = fgetcsv($handle); // Skip header row
        
        $imported = 0;
        while (($data = fgetcsv($handle)) !== FALSE) {
            $product_data = array_combine($header, $data);
            
            // Check if product already exists by SKU
            $existing_id = wc_get_product_id_by_sku($product_data['SKU']);
            
            if (!$existing_id) {
                // Create new product
                $product = new WC_Product_Simple();
                
                $product->set_name($product_data['Name']);
                $product->set_slug($product_data['Slug']);
                $product->set_sku($product_data['SKU']);
                $product->set_description($product_data['Description']);
                $product->set_regular_price($product_data['Regular price']);
                
                if (!empty($product_data['Sale price'])) {
                    $product->set_sale_price($product_data['Sale price']);
                }
                
                $product->set_stock_quantity((int)$product_data['Stock']);
                $product->set_manage_stock(true);
                $product->set_stock_status('instock');
                
                // Set featured status
                $product->set_featured($product_data['Featured'] == '1');
                
                // Set category
                if (!empty($product_data['Categories'])) {
                    $category = get_term_by('name', $product_data['Categories'], 'product_cat');
                    if ($category) {
                        $product->set_category_ids([$category->term_id]);
                    }
                }
                
                // Set brand attribute
                if (!empty($product_data['Brand'])) {
                    $attributes = [];
                    $attribute = new WC_Product_Attribute();
                    $attribute->set_name('Brand');
                    $attribute->set_options([$product_data['Brand']]);
                    $attribute->set_visible(true);
                    $attributes[] = $attribute;
                    $product->set_attributes($attributes);
                }
                
                $product_id = $product->save();
                
                if ($product_id) {
                    $imported++;
                    $this->log("Imported product: {$product_data['Name']} (ID: {$product_id})");
                } else {
                    $this->log("Failed to import product: {$product_data['Name']}");
                }
            } else {
                $this->log("Product already exists: {$product_data['Name']} (SKU: {$product_data['SKU']})");
            }
        }
        
        fclose($handle);
        $this->log("Products import complete. Imported: {$imported}");
        return true;
    }
    
    public function import_users() {
        $this->log('Starting user import...');
        
        $csv_file = $this->import_dir . 'users.csv';
        if (!file_exists($csv_file)) {
            $this->log('Users CSV file not found: ' . $csv_file);
            return false;
        }
        
        $handle = fopen($csv_file, 'r');
        $header = fgetcsv($handle); // Skip header row
        
        $imported = 0;
        while (($data = fgetcsv($handle)) !== FALSE) {
            $user_data = array_combine($header, $data);
            
            // Check if user already exists
            $existing_user = get_user_by('email', $user_data['Email']);
            
            if (!$existing_user) {
                $user_id = wp_create_user(
                    $user_data['Email'], // username
                    wp_generate_password(), // password
                    $user_data['Email'] // email
                );
                
                if (!is_wp_error($user_id)) {
                    // Update user meta
                    wp_update_user([
                        'ID' => $user_id,
                        'first_name' => $user_data['First Name'] ?? '',
                        'last_name' => $user_data['Last Name'] ?? '',
                        'role' => ($user_data['Is Admin'] == '1') ? 'administrator' : 'customer'
                    ]);
                    
                    $imported++;
                    $this->log("Imported user: {$user_data['Email']} (ID: {$user_id})");
                } else {
                    $this->log("Failed to import user: {$user_data['Email']} - " . $user_id->get_error_message());
                }
            } else {
                $this->log("User already exists: {$user_data['Email']}");
            }
        }
        
        fclose($handle);
        $this->log("Users import complete. Imported: {$imported}");
        return true;
    }
    
    public function import_orders() {
        $this->log('Starting order import...');
        
        $csv_file = $this->import_dir . 'orders.csv';
        if (!file_exists($csv_file)) {
            $this->log('Orders CSV file not found: ' . $csv_file);
            return false;
        }
        
        $handle = fopen($csv_file, 'r');
        $header = fgetcsv($handle); // Skip header row
        
        $imported = 0;
        while (($data = fgetcsv($handle)) !== FALSE) {
            $order_data = array_combine($header, $data);
            
            // Check if order already exists
            $existing_orders = wc_get_orders([
                'meta_key' => '_order_number',
                'meta_value' => $order_data['Order Number'],
                'limit' => 1
            ]);
            
            if (empty($existing_orders)) {
                // Create new order
                $order = wc_create_order();
                
                $order->set_status($order_data['Status']);
                $order->set_total($order_data['Total']);
                
                // Set payment method
                $order->set_payment_method($order_data['Payment Method'] ?? 'stripe');
                $order->set_payment_method_title('Stripe');
                
                // Set order number
                $order->update_meta_data('_order_number', $order_data['Order Number']);
                
                // Set customer if email provided
                if (!empty($order_data['Customer Email'])) {
                    $customer = get_user_by('email', $order_data['Customer Email']);
                    if ($customer) {
                        $order->set_customer_id($customer->ID);
                    }
                }
                
                $order->save();
                
                $imported++;
                $this->log("Imported order: {$order_data['Order Number']} (ID: {$order->get_id()})");
            } else {
                $this->log("Order already exists: {$order_data['Order Number']}");
            }
        }
        
        fclose($handle);
        $this->log("Orders import complete. Imported: {$imported}");
        return true;
    }
    
    public function run_full_import() {
        $this->log('Starting full WordPress import for midastechnical.com');
        
        // Import in correct order (dependencies first)
        $this->import_categories();
        $this->import_products();
        $this->import_users();
        $this->import_orders();
        
        $this->log('Full import completed successfully!');
        
        // Save log to file
        $log_file = $this->import_dir . 'wordpress_import.log';
        file_put_contents($log_file, implode("\n", $this->log));
        $this->log("Import log saved to: {$log_file}");
        
        return true;
    }
}

// Run the import
if (php_sapi_name() === 'cli') {
    $importer = new MDTSDataImporter('./exports/');
    $importer->run_full_import();
} else {
    echo "This script should be run from command line.\n";
}
?>
