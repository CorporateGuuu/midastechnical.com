import Stripe from 'stripe';
import { query } from '../db';

// Enhanced Stripe configuration for production
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
  telemetry: false,
  maxNetworkRetries: 3,
  timeout: 10000,
});

// Payment method configurations
export const PAYMENT_METHODS = {
  card: {
    enabled: true,
    currencies: ['usd', 'cad', 'eur', 'gbp'],
    captureMethod: 'automatic',
    confirmationMethod: 'automatic'
  },
  apple_pay: {
    enabled: true,
    currencies: ['usd', 'cad'],
    domains: ['midastechnical.com', 'www.midastechnical.com']
  },
  google_pay: {
    enabled: true,
    currencies: ['usd', 'cad'],
    merchantId: process.env.GOOGLE_PAY_MERCHANT_ID
  },
  link: {
    enabled: true,
    currencies: ['usd', 'cad']
  },
  klarna: {
    enabled: true,
    currencies: ['usd'],
    countries: ['US', 'CA']
  },
  afterpay_clearpay: {
    enabled: true,
    currencies: ['usd'],
    countries: ['US']
  }
};

// Enhanced checkout session creation
export async function createEnhancedCheckoutSession(orderData) {
  try {
    const {
      lineItems,
      customerEmail,
      customerId,
      metadata,
      shippingOptions,
      discountCodes,
      taxCalculation
    } = orderData;

    // Calculate tax if enabled
    let automaticTax = null;
    if (taxCalculation?.enabled) {
      automaticTax = {
        enabled: true,
        liability: {
          type: 'self'
        }
      };
    }

    // Configure shipping options
    let shippingAddressCollection = null;
    let shippingOptions = null;

    if (orderData.requiresShipping) {
      shippingAddressCollection = {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES']
      };

      shippingOptions = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'usd' },
            display_name: 'Express shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 }
            }
          }
        }
      ];
    }

    // Create checkout session with enhanced features
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'apple_pay', 'google_pay', 'link'],
      payment_method_options: {
        card: {
          setup_future_usage: 'on_session',
          statement_descriptor_suffix: 'MDTS'
        },
        klarna: {
          preferred_locale: 'en-US'
        }
      },
      line_items: lineItems,
      mode: 'payment',
      customer: customerId,
      customer_email: customerEmail,
      billing_address_collection: 'required',
      shipping_address_collection: shippingAddressCollection,
      shipping_options: shippingOptions,
      automatic_tax: automaticTax,
      allow_promotion_codes: true,
      consent_collection: {
        terms_of_service: 'required',
        privacy_policy: 'required'
      },
      custom_fields: [
        {
          key: 'order_notes',
          label: { type: 'custom', custom: 'Order Notes' },
          type: 'text',
          optional: true
        }
      ],
      phone_number_collection: {
        enabled: true
      },
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
      metadata: {
        ...metadata,
        integration_version: '2.0',
        platform: 'midastechnical'
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    // Log session creation
    await logPaymentSession({
      sessionId: session.id,
      customerId: customerId,
      amount: session.amount_total,
      currency: session.currency,
      status: 'created',
      metadata: metadata
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
      paymentIntent: session.payment_intent
    };

  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);

    // Log error for monitoring
    await logPaymentError({
      provider: 'stripe',
      operation: 'create_checkout_session',
      error: error.message,
      metadata: orderData.metadata
    });

    throw new Error(`Failed to create Stripe checkout session: ${error.message}`);
  }
}

// Enhanced webhook processing with retry logic
export async function processStripeWebhook(event, retryCount = 0) {
  const maxRetries = 3;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object, event.type);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    // Log successful webhook processing
    await logWebhookProcessing({
      provider: 'stripe',
      eventType: event.type,
      eventId: event.id,
      status: 'processed',
      retryCount: retryCount
    });

  } catch (error) {
    console.error(`Stripe webhook processing failed for ${event.type}:`, error);

    // Implement retry logic
    if (retryCount < maxRetries) {
      console.log(`Retrying webhook processing (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      return await processStripeWebhook(event, retryCount + 1);
    }

    // Log failed webhook processing
    await logWebhookProcessing({
      provider: 'stripe',
      eventType: event.type,
      eventId: event.id,
      status: 'failed',
      error: error.message,
      retryCount: retryCount
    });

    throw error;
  }
}

// Payment intent confirmation with 3D Secure support
export async function confirmPaymentIntent(paymentIntentId, paymentMethodId, returnUrl) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: returnUrl,
      use_stripe_sdk: true
    });

    return {
      success: true,
      paymentIntent: paymentIntent,
      requiresAction: paymentIntent.status === 'requires_action',
      clientSecret: paymentIntent.client_secret
    };

  } catch (error) {
    console.error('Payment intent confirmation failed:', error);

    await logPaymentError({
      provider: 'stripe',
      operation: 'confirm_payment_intent',
      paymentIntentId: paymentIntentId,
      error: error.message
    });

    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Refund processing with partial refund support
export async function processRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
      reason: reason,
      metadata: {
        refund_timestamp: new Date().toISOString(),
        platform: 'midastechnical'
      }
    };

    if (amount) {
      refundData.amount = amount;
    }

    const refund = await stripe.refunds.create(refundData);

    // Log refund
    await logRefund({
      refundId: refund.id,
      paymentIntentId: paymentIntentId,
      amount: refund.amount,
      currency: refund.currency,
      reason: reason,
      status: refund.status
    });

    return {
      success: true,
      refund: refund
    };

  } catch (error) {
    console.error('Refund processing failed:', error);

    await logPaymentError({
      provider: 'stripe',
      operation: 'process_refund',
      paymentIntentId: paymentIntentId,
      error: error.message
    });

    throw error;
  }
}

// Helper functions for database logging
async function logPaymentSession(data) {
  try {
    await query(`
      INSERT INTO payment_sessions (
        session_id, customer_id, amount, currency, status, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [data.sessionId, data.customerId, data.amount, data.currency, data.status, JSON.stringify(data.metadata)]);
  } catch (error) {
    console.error('Failed to log payment session:', error);
  }
}

async function logPaymentError(data) {
  try {
    await query(`
      INSERT INTO payment_errors (
        provider, operation, payment_intent_id, error_message, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [data.provider, data.operation, data.paymentIntentId || null, data.error, JSON.stringify(data.metadata || {})]);
  } catch (error) {
    console.error('Failed to log payment error:', error);
  }
}

async function logWebhookProcessing(data) {
  try {
    await query(`
      INSERT INTO webhook_logs (
        provider, event_type, event_id, status, error_message, retry_count, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [data.provider, data.eventType, data.eventId, data.status, data.error || null, data.retryCount]);
  } catch (error) {
    console.error('Failed to log webhook processing:', error);
  }
}

async function logRefund(data) {
  try {
    await query(`
      INSERT INTO refunds (
        refund_id, payment_intent_id, amount, currency, reason, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [data.refundId, data.paymentIntentId, data.amount, data.currency, data.reason, data.status]);
  } catch (error) {
    console.error('Failed to log refund:', error);
  }
}

export default stripe;
