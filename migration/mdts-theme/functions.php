<?php
/**
 * MDTS Theme Functions
 *
 * @package MDTS
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Theme setup
 */
function mdts_theme_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    add_theme_support('custom-logo');
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');

    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'mdts'),
        'footer' => __('Footer Menu', 'mdts'),
    ));

    // Set content width
    $GLOBALS['content_width'] = 1200;
}
add_action('after_setup_theme', 'mdts_theme_setup');

/**
 * Enqueue scripts and styles
 */
function mdts_scripts() {
    // Theme stylesheet
    wp_enqueue_style('mdts-style', get_stylesheet_uri(), array(), '1.0.0');

    // Custom JavaScript
    wp_enqueue_script('mdts-script', get_template_directory_uri() . '/js/main.js', array('jquery'), '1.0.0', true);

    // WooCommerce styles
    if (class_exists('WooCommerce')) {
        wp_enqueue_style('mdts-woocommerce', get_template_directory_uri() . '/css/woocommerce.css', array(), '1.0.0');
    }

    // Localize script for AJAX
    wp_localize_script('mdts-script', 'mdts_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('mdts_nonce'),
    ));
}
add_action('wp_enqueue_scripts', 'mdts_scripts');

/**
 * Register widget areas
 */
function mdts_widgets_init() {
    register_sidebar(array(
        'name'          => __('Sidebar', 'mdts'),
        'id'            => 'sidebar-1',
        'description'   => __('Add widgets here.', 'mdts'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));

    register_sidebar(array(
        'name'          => __('Footer 1', 'mdts'),
        'id'            => 'footer-1',
        'description'   => __('Footer widget area 1.', 'mdts'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));

    register_sidebar(array(
        'name'          => __('Footer 2', 'mdts'),
        'id'            => 'footer-2',
        'description'   => __('Footer widget area 2.', 'mdts'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));

    register_sidebar(array(
        'name'          => __('Footer 3', 'mdts'),
        'id'            => 'footer-3',
        'description'   => __('Footer widget area 3.', 'mdts'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
}
add_action('widgets_init', 'mdts_widgets_init');

/**
 * Custom post types and taxonomies
 */
function mdts_custom_post_types() {
    // Testimonials post type
    register_post_type('testimonial', array(
        'labels' => array(
            'name' => 'Testimonials',
            'singular_name' => 'Testimonial',
        ),
        'public' => true,
        'has_archive' => false,
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-format-quote',
    ));
}
add_action('init', 'mdts_custom_post_types');

/**
 * Customize WooCommerce
 */
function mdts_woocommerce_customizations() {
    // Remove default WooCommerce styles
    add_filter('woocommerce_enqueue_styles', '__return_empty_array');

    // Change number of products per row
    add_filter('loop_shop_columns', function() {
        return 4;
    });

    // Change number of products per page
    add_filter('loop_shop_per_page', function() {
        return 12;
    });
}
add_action('init', 'mdts_woocommerce_customizations');

/**
 * Add custom fields to products
 */
function mdts_product_custom_fields() {
    global $post;

    if ($post->post_type !== 'product') return;

    echo '<div class="options_group">';

    // Compatibility field
    woocommerce_wp_text_input(array(
        'id' => '_compatibility',
        'label' => __('Compatibility', 'mdts'),
        'placeholder' => 'e.g., iPhone 12, Samsung Galaxy S21',
        'desc_tip' => true,
        'description' => __('Device compatibility information', 'mdts'),
    ));

    // Condition field
    woocommerce_wp_select(array(
        'id' => '_condition',
        'label' => __('Condition', 'mdts'),
        'options' => array(
            '' => __('Select condition', 'mdts'),
            'new' => __('New', 'mdts'),
            'refurbished' => __('Refurbished', 'mdts'),
            'used' => __('Used', 'mdts'),
        ),
    ));

    echo '</div>';
}
add_action('woocommerce_product_options_general_product_data', 'mdts_product_custom_fields');

/**
 * Save custom fields
 */
function mdts_save_product_custom_fields($post_id) {
    $compatibility = isset($_POST['_compatibility']) ? sanitize_text_field($_POST['_compatibility']) : '';
    $condition = isset($_POST['_condition']) ? sanitize_text_field($_POST['_condition']) : '';

    update_post_meta($post_id, '_compatibility', $compatibility);
    update_post_meta($post_id, '_condition', $condition);
}
add_action('woocommerce_process_product_meta', 'mdts_save_product_custom_fields');

/**
 * Display custom fields on product page
 */
function mdts_display_product_custom_fields() {
    global $product;

    $compatibility = get_post_meta($product->get_id(), '_compatibility', true);
    $condition = get_post_meta($product->get_id(), '_condition', true);

    if ($compatibility || $condition) {
        echo '<div class="product-custom-fields">';

        if ($compatibility) {
            echo '<p><strong>' . __('Compatibility:', 'mdts') . '</strong> ' . esc_html($compatibility) . '</p>';
        }

        if ($condition) {
            echo '<p><strong>' . __('Condition:', 'mdts') . '</strong> ' . esc_html(ucfirst($condition)) . '</p>';
        }

        echo '</div>';
    }
}
add_action('woocommerce_single_product_summary', 'mdts_display_product_custom_fields', 25);

/**
 * AJAX handler for cart updates
 */
function mdts_update_cart_count() {
    check_ajax_referer('mdts_nonce', 'nonce');

    if (class_exists('WooCommerce')) {
        $cart_count = WC()->cart->get_cart_contents_count();
        wp_send_json_success(array('count' => $cart_count));
    }

    wp_send_json_error();
}
add_action('wp_ajax_update_cart_count', 'mdts_update_cart_count');
add_action('wp_ajax_nopriv_update_cart_count', 'mdts_update_cart_count');

/**
 * Customize excerpt length
 */
function mdts_excerpt_length($length) {
    return 20;
}
add_filter('excerpt_length', 'mdts_excerpt_length');

/**
 * Custom excerpt more
 */
function mdts_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'mdts_excerpt_more');

/**
 * Add custom body classes
 */
function mdts_body_classes($classes) {
    if (is_woocommerce() || is_cart() || is_checkout()) {
        $classes[] = 'woocommerce-page';
    }

    if (is_front_page()) {
        $classes[] = 'home-page';
    }

    return $classes;
}
add_filter('body_class', 'mdts_body_classes');

/**
 * Optimize images
 */
function mdts_image_sizes() {
    add_image_size('product-thumb', 300, 300, true);
    add_image_size('product-large', 600, 600, true);
    add_image_size('hero-image', 1200, 600, true);
}
add_action('after_setup_theme', 'mdts_image_sizes');

/**
 * Security enhancements for midastechnical.com
 */
function mdts_security_headers() {
    if (!is_admin()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    }
}
add_action('send_headers', 'mdts_security_headers');

/**
 * Domain-specific configurations for midastechnical.com
 */
function mdts_domain_configurations() {
    // Ensure WordPress URLs are set correctly
    if (!defined('WP_HOME')) {
        define('WP_HOME', 'https://midastechnical.com');
    }
    if (!defined('WP_SITEURL')) {
        define('WP_SITEURL', 'https://midastechnical.com');
    }

    // Force HTTPS for midastechnical.com
    if (!is_ssl() && !is_admin()) {
        $redirect_url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        wp_redirect($redirect_url, 301);
        exit();
    }
}
add_action('init', 'mdts_domain_configurations');

/**
 * SEO redirects for Next.js to WordPress migration
 */
function mdts_migration_redirects() {
    $request_uri = $_SERVER['REQUEST_URI'];

    // Product page redirects: /products/slug -> /product/slug/
    if (preg_match('/^\/products\/([^\/]+)\/?$/', $request_uri, $matches)) {
        wp_redirect(home_url('/product/' . $matches[1] . '/'), 301);
        exit;
    }

    // Products listing: /products -> /shop/
    if ($request_uri === '/products' || $request_uri === '/products/') {
        wp_redirect(home_url('/shop/'), 301);
        exit;
    }

    // Category redirects: /categories/slug -> /product-category/slug/
    if (preg_match('/^\/categories\/([^\/]+)\/?$/', $request_uri, $matches)) {
        wp_redirect(home_url('/product-category/' . $matches[1] . '/'), 301);
        exit;
    }

    // Account redirects: /account -> /my-account/
    if ($request_uri === '/account' || $request_uri === '/account/') {
        wp_redirect(home_url('/my-account/'), 301);
        exit;
    }

    // Admin redirects: /admin -> /wp-admin/
    if ($request_uri === '/admin' || $request_uri === '/admin/') {
        wp_redirect(admin_url(), 301);
        exit;
    }
}
add_action('template_redirect', 'mdts_migration_redirects');

/**
 * Remove WordPress version from head
 */
remove_action('wp_head', 'wp_generator');

/**
 * Disable XML-RPC
 */
add_filter('xmlrpc_enabled', '__return_false');
?>
