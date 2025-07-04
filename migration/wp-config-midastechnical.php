<?php
/**
 * WordPress Configuration for midastechnical.com
 * 
 * This file contains the WordPress configuration specifically optimized
 * for the midastechnical.com domain migration from Next.js to WordPress.
 */

// ** Database settings - You'll need to update these with your hosting provider's details ** //
define('DB_NAME', 'midastechnical_wp');
define('DB_USER', 'midastechnical_user');
define('DB_PASSWORD', 'your_secure_database_password');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// ** Authentication Unique Keys and Salts ** //
// Generate these at: https://api.wordpress.org/secret-key/1.1/salt/
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');

// ** WordPress Database Table prefix ** //
$table_prefix = 'mdts_';

// ** Domain-specific configurations for midastechnical.com ** //
define('WP_HOME', 'https://midastechnical.com');
define('WP_SITEURL', 'https://midastechnical.com');

// ** Force SSL for midastechnical.com ** //
define('FORCE_SSL_ADMIN', true);
if (strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false) {
    $_SERVER['HTTPS'] = 'on';
}

// ** WordPress debugging - disable in production ** //
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', false);

// ** Memory and performance optimizations ** //
define('WP_MEMORY_LIMIT', '512M');
define('WP_MAX_MEMORY_LIMIT', '512M');
define('WP_CACHE', true);
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);
define('CONCATENATE_SCRIPTS', false);
define('ENFORCE_GZIP', true);

// ** Security enhancements for midastechnical.com ** //
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', false); // Allow plugin/theme updates
define('WP_POST_REVISIONS', 3);
define('AUTOSAVE_INTERVAL', 300);
define('EMPTY_TRASH_DAYS', 30);

// ** Disable XML-RPC for security ** //
add_filter('xmlrpc_enabled', '__return_false');

// ** Cookie settings for midastechnical.com ** //
define('COOKIE_DOMAIN', '.midastechnical.com');
define('COOKIEPATH', '/');
define('SITECOOKIEPATH', '/');

// ** File permissions ** //
define('FS_CHMOD_DIR', (0755 & ~ umask()));
define('FS_CHMOD_FILE', (0644 & ~ umask()));

// ** Multisite configuration (if needed in future) ** //
// define('WP_ALLOW_MULTISITE', true);

// ** WooCommerce specific configurations ** //
define('WC_LOG_HANDLER', 'WC_Log_Handler_File');
define('WOOCOMMERCE_USE_PRETTY_PERMALINKS', true);

// ** Email configuration for @midastechnical.com ** //
define('SMTP_HOST', 'mail.midastechnical.com'); // Update with your email provider
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');
define('SMTP_AUTH', true);
define('SMTP_USER', 'noreply@midastechnical.com');
define('SMTP_PASS', 'your_email_password');

// ** Stripe configuration for midastechnical.com ** //
define('STRIPE_PUBLISHABLE_KEY', 'pk_live_your_stripe_publishable_key');
define('STRIPE_SECRET_KEY', 'sk_live_your_stripe_secret_key');
define('STRIPE_WEBHOOK_SECRET', 'whsec_your_webhook_secret');

// ** CDN and performance settings ** //
define('WP_CONTENT_URL', 'https://midastechnical.com/wp-content');
define('UPLOADS', 'wp-content/uploads');

// ** Automatic updates configuration ** //
define('WP_AUTO_UPDATE_CORE', 'minor'); // Only minor updates
define('AUTOMATIC_UPDATER_DISABLED', false);

// ** Cron settings ** //
define('DISABLE_WP_CRON', false);
define('WP_CRON_LOCK_TIMEOUT', 60);

// ** Redis/Object caching (if available) ** //
define('WP_REDIS_HOST', '127.0.0.1');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_DATABASE', 0);

// ** Custom upload limits ** //
@ini_set('upload_max_size', '64M');
@ini_set('post_max_size', '64M');
@ini_set('max_execution_time', 300);
@ini_set('max_input_vars', 3000);

// ** WordPress Salts for enhanced security ** //
// These should be unique for midastechnical.com
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

// ** Custom error handling for production ** //
if (!WP_DEBUG) {
    error_reporting(0);
    @ini_set('display_errors', 0);
    @ini_set('log_errors', 1);
    @ini_set('error_log', ABSPATH . 'wp-content/debug.log');
}

// ** Custom constants for MDTS functionality ** //
define('MDTS_VERSION', '1.0.0');
define('MDTS_DOMAIN', 'midastechnical.com');
define('MDTS_MIGRATION_DATE', '2024-01-01'); // Update with actual migration date

// ** Environment-specific settings ** //
if (defined('WP_CLI') && WP_CLI) {
    // WP-CLI specific settings
    define('WP_CLI_CACHE_DIR', '/tmp/wp-cli-cache');
}

// ** Custom headers for midastechnical.com ** //
function mdts_custom_headers() {
    if (!is_admin()) {
        header('X-Powered-By: WordPress + MDTS');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }
}
add_action('send_headers', 'mdts_custom_headers');

// ** Custom login URL (optional security enhancement) ** //
// define('CUSTOM_LOGIN_URL', 'secure-admin');

// ** Backup and maintenance settings ** //
define('BACKUP_RETENTION_DAYS', 30);
define('MAINTENANCE_MODE', false);

// ** API settings for external integrations ** //
define('REST_API_ENABLED', true);
define('XMLRPC_ENABLED', false);

// ** Timezone setting for midastechnical.com ** //
date_default_timezone_set('America/New_York'); // Update as needed

// ** Custom upload directory structure ** //
function mdts_custom_upload_dir($uploads) {
    $uploads['subdir'] = '/products/' . date('Y/m');
    $uploads['path'] = $uploads['basedir'] . $uploads['subdir'];
    $uploads['url'] = $uploads['baseurl'] . $uploads['subdir'];
    return $uploads;
}
// Uncomment to enable custom upload structure
// add_filter('upload_dir', 'mdts_custom_upload_dir');

// ** Load WordPress ** //
require_once ABSPATH . 'wp-settings.php';

// ** Post-load configurations ** //
if (function_exists('add_action')) {
    // Ensure proper URL structure
    add_action('init', function() {
        if (is_admin() && !wp_doing_ajax()) {
            // Admin-specific configurations
            add_filter('admin_url', function($url) {
                return str_replace('http://', 'https://', $url);
            });
        }
    });
    
    // Custom email configuration
    add_action('phpmailer_init', function($phpmailer) {
        if (defined('SMTP_HOST')) {
            $phpmailer->isSMTP();
            $phpmailer->Host = SMTP_HOST;
            $phpmailer->Port = SMTP_PORT;
            $phpmailer->SMTPSecure = SMTP_SECURE;
            $phpmailer->SMTPAuth = SMTP_AUTH;
            $phpmailer->Username = SMTP_USER;
            $phpmailer->Password = SMTP_PASS;
            $phpmailer->From = 'noreply@midastechnical.com';
            $phpmailer->FromName = 'MDTS - Midas Technical Solutions';
        }
    });
}

/* That's all, stop editing! Happy publishing. */
?>
