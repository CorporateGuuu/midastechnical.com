import crypto from 'crypto';
import { query } from '../db';

// Webhook validation and processing system
export class WebhookValidator {
  constructor() {
    this.providers = {
      stripe: {
        secret: process.env.STRIPE_WEBHOOK_SECRET,
        algorithm: 'sha256',
        tolerance: 300 // 5 minutes
      },
      paypal: {
        webhookId: process.env.PAYPAL_WEBHOOK_ID,
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET
      }
    };
  }

  // Validate Stripe webhook signature
  async validateStripeWebhook(payload, signature, timestamp) {
    try {
      const secret = this.providers.stripe.secret;
      if (!secret) {
        throw new Error('Stripe webhook secret not configured');
      }

      // Check timestamp tolerance
      const currentTime = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTime - timestamp) > this.providers.stripe.tolerance) {
        throw new Error('Webhook timestamp outside tolerance window');
      }

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');

      const providedSignature = signature.split('=')[1];

      if (!crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      )) {
        throw new Error('Invalid webhook signature');
      }

      return { valid: true };

    } catch (error) {
      await this.logWebhookValidationError('stripe', error.message, { signature, timestamp });
      return { valid: false, error: error.message };
    }
  }

  // Validate PayPal webhook signature
  async validatePayPalWebhook(headers, payload) {
    try {
      const authAlgo = headers['paypal-auth-algo'];
      const transmission_id = headers['paypal-transmission-id'];
      const cert_id = headers['paypal-cert-id'];
      const transmission_sig = headers['paypal-transmission-sig'];
      const transmission_time = headers['paypal-transmission-time'];
      const webhook_id = this.providers.paypal.webhookId;

      if (!authAlgo || !transmission_id || !cert_id || !transmission_sig || !transmission_time) {
        throw new Error('Missing required PayPal webhook headers');
      }

      // Get PayPal access token
      const accessToken = await this.getPayPalAccessToken();

      // Verify webhook signature with PayPal API
      const verificationResponse = await fetch('https://api.paypal.com/v1/notifications/verify-webhook-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_id: cert_id,
          transmission_id: transmission_id,
          transmission_sig: transmission_sig,
          transmission_time: transmission_time,
          webhook_id: webhook_id,
          webhook_event: JSON.parse(payload)
        })
      });

      const verificationResult = await verificationResponse.json();

      if (verificationResult.verification_status !== 'SUCCESS') {
        throw new Error('PayPal webhook signature verification failed');
      }

      return { valid: true };

    } catch (error) {
      await this.logWebhookValidationError('paypal', error.message, headers);
      return { valid: false, error: error.message };
    }
  }

  // Get PayPal access token for webhook verification
  async getPayPalAccessToken() {
    try {
      const auth = Buffer.from(`${this.providers.paypal.clientId}:${this.providers.paypal.clientSecret}`).toString('base64');

      const response = await fetch('https://api.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      return data.access_token;

    } catch (error) {
      console.error('Failed to get PayPal access token:', error);
      throw new Error('PayPal authentication failed');
    }
  }

  // Process webhook with retry logic and error handling
  async processWebhook(provider, payload, headers, retryCount = 0) {
    const maxRetries = 3;
    const webhookId = `${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Log webhook receipt
      await this.logWebhookReceipt(webhookId, provider, payload, headers);

      // Validate webhook
      let validation;
      switch (provider) {
        case 'stripe':
          const timestamp = headers['stripe-timestamp'];
          const signature = headers['stripe-signature'];
          validation = await this.validateStripeWebhook(payload, signature, timestamp);
          break;

        case 'paypal':
          validation = await this.validatePayPalWebhook(headers, payload);
          break;

        default:
          throw new Error(`Unsupported webhook provider: ${provider}`);
      }

      if (!validation.valid) {
        throw new Error(`Webhook validation failed: ${validation.error}`);
      }

      // Process the webhook
      const event = JSON.parse(payload);
      const result = await this.executeWebhookHandler(provider, event);

      // Log successful processing
      await this.logWebhookProcessing(webhookId, 'success', result);

      return { success: true, webhookId, result };

    } catch (error) {
      console.error(`Webhook processing failed (attempt ${retryCount + 1}):`, error);

      // Implement exponential backoff retry
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying webhook processing in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.processWebhook(provider, payload, headers, retryCount + 1);
      }

      // Log failed processing
      await this.logWebhookProcessing(webhookId, 'failed', { error: error.message, retryCount });

      // Send alert for failed webhook
      await this.sendWebhookFailureAlert(provider, webhookId, error.message);

      throw error;
    }
  }

  // Execute provider-specific webhook handler
  async executeWebhookHandler(provider, event) {
    switch (provider) {
      case 'stripe':
        const { processStripeWebhook } = await import('./stripe-enhanced');
        return await processStripeWebhook(event);

      case 'paypal':
        const { processPayPalWebhook } = await import('./paypal-enhanced');
        return await processPayPalWebhook(event);

      default:
        throw new Error(`No handler found for provider: ${provider}`);
    }
  }

  // Database logging functions
  async logWebhookReceipt(webhookId, provider, payload, headers) {
    try {
      await query(`
        INSERT INTO webhook_receipts (
          webhook_id, provider, payload, headers, received_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [webhookId, provider, payload, JSON.stringify(headers)]);
    } catch (error) {
      console.error('Failed to log webhook receipt:', error);
    }
  }

  async logWebhookProcessing(webhookId, status, result) {
    try {
      await query(`
        INSERT INTO webhook_processing_logs (
          webhook_id, status, result, processed_at
        ) VALUES ($1, $2, $3, NOW())
      `, [webhookId, status, JSON.stringify(result)]);
    } catch (error) {
      console.error('Failed to log webhook processing:', error);
    }
  }

  async logWebhookValidationError(provider, error, metadata) {
    try {
      await query(`
        INSERT INTO webhook_validation_errors (
          provider, error_message, metadata, created_at
        ) VALUES ($1, $2, $3, NOW())
      `, [provider, error, JSON.stringify(metadata)]);
    } catch (error) {
      console.error('Failed to log webhook validation error:', error);
    }
  }

  // Send alert for webhook failures
  async sendWebhookFailureAlert(provider, webhookId, error) {
    try {
      // Send email alert
      await fetch('/api/alerts/webhook-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          webhookId,
          error,
          timestamp: new Date().toISOString()
        })
      });
    } catch (alertError) {
      console.error('Failed to send webhook failure alert:', alertError);
    }
  }
}

// Export singleton instance
export const webhookValidator = new WebhookValidator();
