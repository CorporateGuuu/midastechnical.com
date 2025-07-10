<?php
/**
 * WordPress.com Webhook Setup for n8n Integration
 * Add this to your WordPress theme's functions.php or as a plugin
 */

// WooCommerce Order Webhook
add_action('woocommerce_new_order', 'send_order_to_n8n');
add_action('woocommerce_order_status_changed', 'send_order_status_to_n8n');

function send_order_to_n8n($order_id) {
    $order = wc_get_order($order_id);
    $webhook_url = 'https://n8n.midastechnical.com/webhook/woocommerce-order';
    
    $order_data = array(
        'id' => $order->get_id(),
        'status' => $order->get_status(),
        'total' => $order->get_total(),
        'currency' => $order->get_currency(),
        'billing' => array(
            'first_name' => $order->get_billing_first_name(),
            'last_name' => $order->get_billing_last_name(),
            'email' => $order->get_billing_email(),
            'phone' => $order->get_billing_phone(),
        ),
        'line_items' => array()
    );
    
    foreach ($order->get_items() as $item) {
        $order_data['line_items'][] = array(
            'name' => $item->get_name(),
            'quantity' => $item->get_quantity(),
            'price' => $item->get_total(),
            'sku' => $item->get_product()->get_sku()
        );
    }
    
    wp_remote_post($webhook_url, array(
        'body' => json_encode($order_data),
        'headers' => array('Content-Type' => 'application/json'),
        'timeout' => 30
    ));
}

function send_order_status_to_n8n($order_id) {
    $order = wc_get_order($order_id);
    $webhook_url = 'https://n8n.midastechnical.com/webhook/repair-status';
    
    $status_data = array(
        'orderId' => $order->get_id(),
        'status' => $order->get_status(),
        'customerEmail' => $order->get_billing_email(),
        'customerName' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
        'customerPhone' => $order->get_billing_phone(),
        'deviceType' => get_device_type_from_order($order)
    );
    
    wp_remote_post($webhook_url, array(
        'body' => json_encode($status_data),
        'headers' => array('Content-Type' => 'application/json'),
        'timeout' => 30
    ));
}

function get_device_type_from_order($order) {
    foreach ($order->get_items() as $item) {
        $product_name = $item->get_name();
        if (strpos($product_name, 'iPhone') !== false) return 'iPhone';
        if (strpos($product_name, 'Samsung') !== false) return 'Samsung';
        if (strpos($product_name, 'iPad') !== false) return 'iPad';
        if (strpos($product_name, 'MacBook') !== false) return 'MacBook';
    }
    return 'Other';
}

// Contact Form Webhook
add_action('wp_mail', 'intercept_contact_form_emails');

function intercept_contact_form_emails($args) {
    // Check if this is a contact form email
    if (strpos($args['subject'], 'Contact Form') !== false) {
        $webhook_url = 'https://n8n.midastechnical.com/webhook/contact-form';
        
        // Extract form data (this may need adjustment based on your contact form plugin)
        $form_data = array(
            'name' => extract_name_from_email($args['message']),
            'email' => extract_email_from_email($args['message']),
            'subject' => $args['subject'],
            'message' => $args['message']
        );
        
        wp_remote_post($webhook_url, array(
            'body' => json_encode($form_data),
            'headers' => array('Content-Type' => 'application/json'),
            'timeout' => 30
        ));
    }
    
    return $args;
}

function extract_name_from_email($message) {
    // Simple extraction - adjust based on your form format
    preg_match('/Name:\s*(.+)/i', $message, $matches);
    return isset($matches[1]) ? trim($matches[1]) : 'Unknown';
}

function extract_email_from_email($message) {
    // Simple extraction - adjust based on your form format
    preg_match('/Email:\s*([^\s]+)/i', $message, $matches);
    return isset($matches[1]) ? trim($matches[1]) : '';
}

// Custom repair status update endpoint
add_action('rest_api_init', function () {
    register_rest_route('midas/v1', '/repair-status', array(
        'methods' => 'POST',
        'callback' => 'update_repair_status',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ));
});

function update_repair_status($request) {
    $order_id = $request->get_param('order_id');
    $status = $request->get_param('status');
    
    if (!$order_id || !$status) {
        return new WP_Error('missing_params', 'Order ID and status are required', array('status' => 400));
    }
    
    $order = wc_get_order($order_id);
    if (!$order) {
        return new WP_Error('invalid_order', 'Order not found', array('status' => 404));
    }
    
    // Update order status
    $order->update_status($status);
    
    // Trigger n8n webhook
    send_order_status_to_n8n($order_id);
    
    return array('success' => true, 'message' => 'Status updated successfully');
}
