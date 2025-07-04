<?php
/**
 * Plugin Name: MDTS Stripe Integration
 * Description: Custom Stripe integration for MDTS WordPress migration
 * Version: 1.0.0
 * Author: MDTS Team
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class MDTS_Stripe_Integration {

    private $stripe_secret_key;
    private $stripe_publishable_key;
    private $webhook_secret;

    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_create_payment_intent', array($this, 'create_payment_intent'));
        add_action('wp_ajax_nopriv_create_payment_intent', array($this, 'create_payment_intent'));
        add_action('rest_api_init', array($this, 'register_webhook_endpoint'));

        // WooCommerce hooks
        add_action('woocommerce_checkout_process', array($this, 'process_checkout'));
        add_filter('woocommerce_payment_gateways', array($this, 'add_stripe_gateway'));
    }

    public function init() {
        // Get Stripe keys from options or environment
        $this->stripe_secret_key = get_option('mdts_stripe_secret_key') ?: getenv('STRIPE_SECRET_KEY');
        $this->stripe_publishable_key = get_option('mdts_stripe_publishable_key') ?: getenv('STRIPE_PUBLISHABLE_KEY');
        $this->webhook_secret = get_option('mdts_stripe_webhook_secret') ?: getenv('STRIPE_WEBHOOK_SECRET');

        // Include Stripe PHP library
        if (!class_exists('Stripe\Stripe')) {
            require_once plugin_dir_path(__FILE__) . 'vendor/stripe/stripe-php/init.php';
        }

        if ($this->stripe_secret_key) {
            \Stripe\Stripe::setApiKey($this->stripe_secret_key);
        }
    }

    public function enqueue_scripts() {
        if (is_checkout() || is_cart()) {
            wp_enqueue_script('stripe-js', 'https://js.stripe.com/v3/', array(), null, true);
            wp_enqueue_script('mdts-stripe', plugin_dir_url(__FILE__) . 'js/stripe-checkout.js', array('jquery', 'stripe-js'), '1.0.0', true);

            wp_localize_script('mdts-stripe', 'mdts_stripe_params', array(
                'publishable_key' => $this->stripe_publishable_key,
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('mdts_stripe_nonce'),
            ));
        }
    }

    public function create_payment_intent() {
        check_ajax_referer('mdts_stripe_nonce', 'nonce');

        if (!class_exists('WooCommerce') || !WC()->cart) {
            wp_send_json_error('WooCommerce not available');
            return;
        }

        try {
            $cart_total = WC()->cart->get_total('raw');
            $currency = get_woocommerce_currency();

            // Create payment intent
            $intent = \Stripe\PaymentIntent::create([
                'amount' => round($cart_total * 100), // Convert to cents
                'currency' => strtolower($currency),
                'metadata' => [
                    'cart_id' => WC()->session->get_customer_id(),
                    'site_url' => 'https://midastechnical.com',
                    'domain' => 'midastechnical.com',
                    'migration_source' => 'nextjs_to_wordpress',
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            wp_send_json_success([
                'client_secret' => $intent->client_secret,
                'payment_intent_id' => $intent->id,
            ]);

        } catch (Exception $e) {
            wp_send_json_error('Error creating payment intent: ' . $e->getMessage());
        }
    }

    public function register_webhook_endpoint() {
        register_rest_route('mdts/v1', '/stripe-webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_webhook'),
            'permission_callback' => '__return_true',
        ));
    }

    public function handle_webhook($request) {
        $payload = $request->get_body();
        $sig_header = $request->get_header('stripe-signature');

        if (!$this->webhook_secret) {
            return new WP_Error('webhook_error', 'Webhook secret not configured', array('status' => 400));
        }

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $this->webhook_secret);
        } catch (\UnexpectedValueException $e) {
            return new WP_Error('webhook_error', 'Invalid payload', array('status' => 400));
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return new WP_Error('webhook_error', 'Invalid signature', array('status' => 400));
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handle_payment_success($event->data->object);
                break;
            case 'payment_intent.payment_failed':
                $this->handle_payment_failure($event->data->object);
                break;
            default:
                error_log('Unhandled Stripe webhook event: ' . $event->type);
        }

        return rest_ensure_response(array('received' => true));
    }

    private function handle_payment_success($payment_intent) {
        $cart_id = $payment_intent->metadata->cart_id ?? null;

        if (!$cart_id) {
            error_log('No cart ID in payment intent metadata');
            return;
        }

        // Create WooCommerce order
        $order = wc_create_order();

        if (is_wp_error($order)) {
            error_log('Failed to create WooCommerce order: ' . $order->get_error_message());
            return;
        }

        // Add cart items to order
        if (WC()->cart && !WC()->cart->is_empty()) {
            foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
                $product = $cart_item['data'];
                $quantity = $cart_item['quantity'];

                $order->add_product($product, $quantity);
            }
        }

        // Set order details
        $order->set_payment_method('stripe');
        $order->set_payment_method_title('Credit Card (Stripe)');
        $order->set_transaction_id($payment_intent->id);
        $order->payment_complete($payment_intent->id);

        // Add order note
        $order->add_order_note(sprintf(
            'Payment completed via Stripe. Payment Intent ID: %s',
            $payment_intent->id
        ));

        // Save order
        $order->save();

        // Clear cart
        if (WC()->cart) {
            WC()->cart->empty_cart();
        }

        // Send order confirmation email
        $mailer = WC()->mailer();
        $mailer->emails['WC_Email_Customer_Processing_Order']->trigger($order->get_id());

        error_log('Order created successfully: ' . $order->get_id());
    }

    private function handle_payment_failure($payment_intent) {
        error_log('Payment failed for intent: ' . $payment_intent->id);

        // You could create a failed order record here if needed
        // or send notification emails
    }

    public function process_checkout() {
        // Additional checkout validation if needed
    }

    public function add_stripe_gateway($gateways) {
        $gateways[] = 'MDTS_Stripe_Gateway';
        return $gateways;
    }
}

/**
 * Custom Stripe Gateway for WooCommerce
 */
class MDTS_Stripe_Gateway extends WC_Payment_Gateway {

    public function __construct() {
        $this->id = 'mdts_stripe';
        $this->icon = '';
        $this->has_fields = true;
        $this->method_title = 'MDTS Stripe';
        $this->method_description = 'Custom Stripe integration for MDTS';

        $this->supports = array(
            'products',
            'refunds',
        );

        $this->init_form_fields();
        $this->init_settings();

        $this->title = $this->get_option('title');
        $this->description = $this->get_option('description');
        $this->enabled = $this->get_option('enabled');

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
    }

    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title' => 'Enable/Disable',
                'type' => 'checkbox',
                'label' => 'Enable MDTS Stripe',
                'default' => 'yes'
            ),
            'title' => array(
                'title' => 'Title',
                'type' => 'text',
                'description' => 'This controls the title which the user sees during checkout.',
                'default' => 'Credit Card',
                'desc_tip' => true,
            ),
            'description' => array(
                'title' => 'Description',
                'type' => 'textarea',
                'description' => 'Payment method description that the customer will see on your checkout.',
                'default' => 'Pay securely with your credit card.',
                'desc_tip' => true,
            ),
        );
    }

    public function payment_fields() {
        if ($this->description) {
            echo wpautop(wp_kses_post($this->description));
        }

        echo '<div id="stripe-card-element" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin: 10px 0;"></div>';
        echo '<div id="stripe-card-errors" role="alert" style="color: #e74c3c; margin: 10px 0;"></div>';
    }

    public function process_payment($order_id) {
        $order = wc_get_order($order_id);

        // Payment will be processed via JavaScript and webhook
        // Mark order as pending payment
        $order->update_status('pending', 'Awaiting Stripe payment confirmation.');

        // Reduce stock levels
        wc_reduce_stock_levels($order_id);

        // Remove cart
        WC()->cart->empty_cart();

        // Return success and redirect to the thank you page
        return array(
            'result' => 'success',
            'redirect' => $this->get_return_url($order)
        );
    }
}

// Initialize the plugin
new MDTS_Stripe_Integration();

// Admin settings page
add_action('admin_menu', function() {
    add_options_page(
        'MDTS Stripe Settings',
        'MDTS Stripe',
        'manage_options',
        'mdts-stripe-settings',
        'mdts_stripe_settings_page'
    );
});

function mdts_stripe_settings_page() {
    if (isset($_POST['submit'])) {
        update_option('mdts_stripe_secret_key', sanitize_text_field($_POST['stripe_secret_key']));
        update_option('mdts_stripe_publishable_key', sanitize_text_field($_POST['stripe_publishable_key']));
        update_option('mdts_stripe_webhook_secret', sanitize_text_field($_POST['stripe_webhook_secret']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }

    $secret_key = get_option('mdts_stripe_secret_key', '');
    $publishable_key = get_option('mdts_stripe_publishable_key', '');
    $webhook_secret = get_option('mdts_stripe_webhook_secret', '');
    ?>
    <div class="wrap">
        <h1>MDTS Stripe Settings</h1>
        <form method="post" action="">
            <table class="form-table">
                <tr>
                    <th scope="row">Secret Key</th>
                    <td><input type="password" name="stripe_secret_key" value="<?php echo esc_attr($secret_key); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th scope="row">Publishable Key</th>
                    <td><input type="text" name="stripe_publishable_key" value="<?php echo esc_attr($publishable_key); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th scope="row">Webhook Secret</th>
                    <td><input type="password" name="stripe_webhook_secret" value="<?php echo esc_attr($webhook_secret); ?>" class="regular-text" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>

        <h2>Webhook URL for midastechnical.com</h2>
        <p>Configure this URL in your Stripe dashboard:</p>
        <code>https://midastechnical.com/wp-json/mdts/v1/stripe-webhook</code>

        <h3>Required Webhook Events</h3>
        <ul>
            <li>payment_intent.succeeded</li>
            <li>payment_intent.payment_failed</li>
            <li>checkout.session.completed</li>
            <li>customer.subscription.created</li>
            <li>customer.subscription.updated</li>
            <li>customer.subscription.deleted</li>
        </ul>

        <h3>Domain Verification</h3>
        <p>Add this domain to your Stripe account's verified domains:</p>
        <code>midastechnical.com</code>
    </div>
    <?php
}
?>
