import paypal from '@paypal/checkout-server-sdk';
import { query } from '../db';

// PayPal environment configuration
const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    )
  : new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );

const client = new paypal.core.PayPalHttpClient(environment);

// Enhanced PayPal order creation
export async function createPayPalOrder(orderData) {
  try {
    const {
      amount,
      currency = 'USD',
      items,
      shippingAddress,
      customerInfo,
      metadata
    } = orderData;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');

    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'Midas Technical Solutions',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXTAUTH_URL}/checkout/paypal/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/checkout/paypal/cancel`,
        shipping_preference: shippingAddress ? 'SET_PROVIDED_ADDRESS' : 'GET_FROM_FILE'
      },
      purchase_units: [{
        reference_id: metadata.orderId || `MDTS-${Date.now()}`,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
            },
            shipping: {
              currency_code: currency,
              value: orderData.shippingCost?.toFixed(2) || '0.00'
            },
            tax_total: {
              currency_code: currency,
              value: orderData.taxAmount?.toFixed(2) || '0.00'
            }
          }
        },
        items: items.map(item => ({
          name: item.name.substring(0, 127),
          unit_amount: {
            currency_code: currency,
            value: item.price.toFixed(2)
          },
          quantity: item.quantity.toString(),
          description: item.description?.substring(0, 127) || '',
          sku: item.sku || '',
          category: 'PHYSICAL_GOODS'
        })),
        shipping: shippingAddress ? {
          name: {
            full_name: shippingAddress.name
          },
          address: {
            address_line_1: shippingAddress.address,
            address_line_2: shippingAddress.address2 || '',
            admin_area_2: shippingAddress.city,
            admin_area_1: shippingAddress.state,
            postal_code: shippingAddress.zip,
            country_code: shippingAddress.country || 'US'
          }
        } : undefined
      }],
      payer: customerInfo ? {
        name: {
          given_name: customerInfo.firstName,
          surname: customerInfo.lastName
        },
        email_address: customerInfo.email,
        phone: customerInfo.phone ? {
          phone_type: 'MOBILE',
          phone_number: {
            national_number: customerInfo.phone
          }
        } : undefined
      } : undefined
    });

    const order = await client.execute(request);

    // Log PayPal order creation
    await logPayPalOrder({
      orderId: order.result.id,
      amount: amount,
      currency: currency,
      status: order.result.status,
      metadata: metadata
    });

    return {
      success: true,
      orderId: order.result.id,
      approvalUrl: order.result.links.find(link => link.rel === 'approve')?.href,
      order: order.result
    };

  } catch (error) {
    console.error('PayPal order creation failed:', error);

    await logPaymentError({
      provider: 'paypal',
      operation: 'create_order',
      error: error.message,
      metadata: orderData.metadata
    });

    throw new Error(`Failed to create PayPal order: ${error.message}`);
  }
}

// Capture PayPal payment
export async function capturePayPalPayment(orderId) {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);

    // Log successful capture
    await logPayPalCapture({
      orderId: orderId,
      captureId: capture.result.purchase_units[0].payments.captures[0].id,
      amount: capture.result.purchase_units[0].payments.captures[0].amount.value,
      currency: capture.result.purchase_units[0].payments.captures[0].amount.currency_code,
      status: capture.result.status
    });

    return {
      success: true,
      capture: capture.result,
      transactionId: capture.result.purchase_units[0].payments.captures[0].id
    };

  } catch (error) {
    console.error('PayPal payment capture failed:', error);

    await logPaymentError({
      provider: 'paypal',
      operation: 'capture_payment',
      orderId: orderId,
      error: error.message
    });

    throw new Error(`Failed to capture PayPal payment: ${error.message}`);
  }
}

// Process PayPal refund
export async function processPayPalRefund(captureId, amount = null, reason = 'REFUND') {
  try {
    const request = new paypal.payments.CapturesRefundRequest(captureId);

    const refundData = {
      note_to_payer: 'Refund processed by Midas Technical Solutions'
    };

    if (amount) {
      refundData.amount = {
        value: amount.toFixed(2),
        currency_code: 'USD'
      };
    }

    request.requestBody(refundData);

    const refund = await client.execute(request);

    // Log refund
    await logPayPalRefund({
      refundId: refund.result.id,
      captureId: captureId,
      amount: refund.result.amount.value,
      currency: refund.result.amount.currency_code,
      status: refund.result.status
    });

    return {
      success: true,
      refund: refund.result
    };

  } catch (error) {
    console.error('PayPal refund failed:', error);

    await logPaymentError({
      provider: 'paypal',
      operation: 'process_refund',
      captureId: captureId,
      error: error.message
    });

    throw error;
  }
}

// PayPal webhook verification and processing
export async function processPayPalWebhook(headers, body) {
  try {
    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(headers, body);

    if (!isValid) {
      throw new Error('Invalid PayPal webhook signature');
    }

    const event = JSON.parse(body);

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePayPalCaptureCompleted(event.resource);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        await handlePayPalCaptureDenied(event.resource);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePayPalCaptureRefunded(event.resource);
        break;

      case 'CHECKOUT.ORDER.APPROVED':
        await handlePayPalOrderApproved(event.resource);
        break;

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    // Log successful webhook processing
    await logWebhookProcessing({
      provider: 'paypal',
      eventType: event.event_type,
      eventId: event.id,
      status: 'processed'
    });

    return { success: true };

  } catch (error) {
    console.error('PayPal webhook processing failed:', error);

    await logWebhookProcessing({
      provider: 'paypal',
      eventType: 'unknown',
      eventId: 'unknown',
      status: 'failed',
      error: error.message
    });

    throw error;
  }
}

// Helper functions for PayPal logging
async function logPayPalOrder(data) {
  try {
    await query(`
      INSERT INTO paypal_orders (
        order_id, amount, currency, status, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [data.orderId, data.amount, data.currency, data.status, JSON.stringify(data.metadata)]);
  } catch (error) {
    console.error('Failed to log PayPal order:', error);
  }
}

async function logPayPalCapture(data) {
  try {
    await query(`
      INSERT INTO paypal_captures (
        order_id, capture_id, amount, currency, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [data.orderId, data.captureId, data.amount, data.currency, data.status]);
  } catch (error) {
    console.error('Failed to log PayPal capture:', error);
  }
}

async function logPayPalRefund(data) {
  try {
    await query(`
      INSERT INTO paypal_refunds (
        refund_id, capture_id, amount, currency, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [data.refundId, data.captureId, data.amount, data.currency, data.status]);
  } catch (error) {
    console.error('Failed to log PayPal refund:', error);
  }
}

export { client as paypalClient };
