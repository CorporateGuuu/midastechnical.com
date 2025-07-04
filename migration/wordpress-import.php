<?php
/**
 * WordPress Data Import Script
 * Imports data from Next.js export into WordPress/WooCommerce
 * 
 * Usage: Place this file in your WordPress root and run via browser or WP-CLI
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    require_once('wp-config.php');
}

class NextJSToWordPressImporter {
    
    private $import_dir;
    
    public function __construct() {
        $this->import_dir = __DIR__ . '/migration/exports/';
    }
    
    /**
     * Import product categories
     */
    public function import_categories() {
        echo "Importing categories...\n";
        
        $csv_file = $this->import_dir . 'categories.csv';
        if (!file_exists($csv_file)) {
            echo "Categories CSV file not found!\n";
            return false;
        }
        
        $handle = fopen($csv_file, 'r');
        $header = fgetcsv($handle); // Skip header row
        
        $imported = 0;
        while (($data = fgetcsv($handle)) !== FALSE) {
            $category_data = array_combine($header, $data);
            
            // Check if category already exists
            $existing = get_term_by('slug', $category_data['Slug'], 'product_cat');
            if ($existing) {
                continue;
            }
            
            $args = array(
                'description' => $category_data['Description'],
                'slug' => $category_data['Slug']
            );
            
            // Handle parent category
            if (!empty($category_data['Parent'])) {
                $parent = get_term_by('slug', $category_data['Parent'], 'product_cat');
                if ($parent) {
                    $args['parent'] = $parent->term_id;
                }
            }
            
            $result = wp_insert_term($category_data['Name'], 'product_cat', $args);
            
            if (!is_wp_error($result)) {
                // Set category image if provided
                if (!empty($category_data['Image'])) {
                    $this->set_category_image($result['term_id'], $category_data['Image']);
                }
                $imported++;
            }
        }
        
        fclose($handle);
        echo "Imported {$imported} categories.\n";
        return true;
    }
    
    /**
     * Import products
     */
    public function import_products() {
        echo "Importing products...\n";
        
        $csv_file = $this->import_dir . 'products.csv';
        if (!file_exists($csv_file)) {
            echo "Products CSV file not found!\n";
            return false;
        }
        
        $handle = fopen($csv_file, 'r');
        $header = fgetcsv($handle); // Skip header row
        
        $imported = 0;
        while (($data = fgetcsv($handle)) !== FALSE) {
            $product_data = array_combine($header, $data);
            
            // Check if product already exists
            $existing = get_page_by_path($product_data['Slug'], OBJECT, 'product');
            if ($existing) {
                continue;
            }
            
            // Create WooCommerce product
            $product = new WC_Product_Simple();
            
            // Basic product data
            $product->set_name($product_data['Name']);
            $product->set_slug($product_data['Slug']);
            $product->set_description($product_data['Description']);
            $product->set_sku($product_data['SKU']);
            $product->set_regular_price($product_data['Regular price']);
            
            // Sale price
            if (!empty($product_data['Sale price'])) {
                $product->set_sale_price($product_data['Sale price']);
            }
            
            // Stock management
            $product->set_manage_stock(true);
            $product->set_stock_quantity((int)$product_data['Stock']);
            $product->set_stock_status($product_data['Stock'] > 0 ? 'instock' : 'outofstock');
            
            // Featured product
            $product->set_featured($product_data['Featured'] === '1');
            
            // Set product category
            if (!empty($product_data['Categories'])) {
                $category = get_term_by('name', $product_data['Categories'], 'product_cat');
                if ($category) {
                    $product->set_category_ids(array($category->term_id));
                }
            }
            
            // Save product
            $product_id = $product->save();
            
            if ($product_id) {
                // Set product image
                if (!empty($product_data['Images'])) {
                    $this->set_product_image($product_id, $product_data['Images']);
                }
                
                // Set custom attributes
                $this->set_product_attributes($product_id, $product_data);
                
                $imported++;
            }
        }
        
        fclose($handle);
        echo "Imported {$imported} products.\n";
        return true;
    }
    
    /**
     * Set product image from URL
     */
    private function set_product_image($product_id, $image_url) {
        if (empty($image_url)) return;
        
        // Download image
        $image_data = file_get_contents($image_url);
        if ($image_data === false) return;
        
        // Get image filename
        $filename = basename(parse_url($image_url, PHP_URL_PATH));
        if (empty($filename)) {
            $filename = 'product-image-' . $product_id . '.jpg';
        }
        
        // Upload to WordPress
        $upload = wp_upload_bits($filename, null, $image_data);
        if ($upload['error']) return;
        
        // Create attachment
        $attachment = array(
            'post_mime_type' => $upload['type'],
            'post_title' => sanitize_file_name($filename),
            'post_content' => '',
            'post_status' => 'inherit'
        );
        
        $attachment_id = wp_insert_attachment($attachment, $upload['file']);
        
        if ($attachment_id) {
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            $attachment_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
            wp_update_attachment_metadata($attachment_id, $attachment_data);
            
            // Set as product featured image
            set_post_thumbnail($product_id, $attachment_id);
        }
    }
    
    /**
     * Set product attributes
     */
    private function set_product_attributes($product_id, $product_data) {
        $attributes = array();
        
        // Brand
        if (!empty($product_data['Brand'])) {
            $attributes['brand'] = array(
                'name' => 'Brand',
                'value' => $product_data['Brand'],
                'is_visible' => 1,
                'is_taxonomy' => 0
            );
        }
        
        // Screen Size
        if (!empty($product_data['Screen Size'])) {
            $attributes['screen_size'] = array(
                'name' => 'Screen Size',
                'value' => $product_data['Screen Size'],
                'is_visible' => 1,
                'is_taxonomy' => 0
            );
        }
        
        // Color
        if (!empty($product_data['Color'])) {
            $attributes['color'] = array(
                'name' => 'Color',
                'value' => $product_data['Color'],
                'is_visible' => 1,
                'is_taxonomy' => 0
            );
        }
        
        // Storage
        if (!empty($product_data['Storage'])) {
            $attributes['storage'] = array(
                'name' => 'Storage',
                'value' => $product_data['Storage'],
                'is_visible' => 1,
                'is_taxonomy' => 0
            );
        }
        
        // Condition
        if (!empty($product_data['Condition'])) {
            $attributes['condition'] = array(
                'name' => 'Condition',
                'value' => $product_data['Condition'],
                'is_visible' => 1,
                'is_taxonomy' => 0
            );
        }
        
        // Compatibility
        if (!empty($product_data['Compatibility'])) {
            $attributes['compatibility'] = array(
                'name' => 'Compatibility',
                'value' => $product_data['Compatibility'],
                'is_visible' => 1,
                'is_taxonomy' => 0
            );
        }
        
        if (!empty($attributes)) {
            update_post_meta($product_id, '_product_attributes', $attributes);
        }
    }
    
    /**
     * Set category image
     */
    private function set_category_image($term_id, $image_url) {
        // Similar to product image but for category
        // Implementation depends on your theme/plugin requirements
    }
    
    /**
     * Run full import
     */
    public function run_import() {
        echo "Starting WordPress import...\n";
        
        // Import in order
        $this->import_categories();
        $this->import_products();
        
        echo "Import completed!\n";
    }
}

// Run import if accessed directly
if (isset($_GET['run_import']) && $_GET['run_import'] === 'true') {
    $importer = new NextJSToWordPressImporter();
    $importer->run_import();
}

// WP-CLI command
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('import-nextjs', function() {
        $importer = new NextJSToWordPressImporter();
        $importer->run_import();
    });
}
?>
