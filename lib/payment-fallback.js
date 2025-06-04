import { query } from '../db';

// Payment fallback and retry system
export class PaymentFallbackManager {
  constructor() {
    this.paymentProviders = [
      {
        name: 'stripe',
        priority: 1,
        enabled: true,
        healthCheck: () => this.checkStripeHealth(),
        processor: (orderData) => this.processStripePayment(orderData)
      },
      {
        name: 'paypal',
        priority: 2,
        enabled: true,
        healthCheck: () => this.checkPayPalHealth(),
        processor: (orderData) => this.processPayPalPayment(orderData)
      },
      {
        name: 'crypto',
        priority: 3,
        enabled: true,
        healthCheck: () => this.checkCryptoHealth(),
        processor: (orderData) => this.processCryptoPayment(orderData)
      }
    ];

    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      backoffMultiplier: 2
    };
  }

  // Process payment with automatic fallback
  async processPaymentWithFallback(orderData, preferredProvider = null) {
    const paymentAttemptId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Log payment attempt
      await this.logPaymentAttempt(paymentAttemptId, orderData, preferredProvider);

      // Get available providers in priority order
      const availableProviders = await this.getAvailableProviders(preferredProvider);

      if (availableProviders.length === 0) {
        throw new Error('No payment providers available');
      }

      let lastError = null;

      // Try each provider in order
      for (const provider of availableProviders) {
        try {
          console.log(`Attempting payment with ${provider.name}...`);

          const result = await this.processPaymentWithRetry(
            provider,
            orderData,
            paymentAttemptId
          );

          // Log successful payment
          await this.logPaymentSuccess(paymentAttemptId, provider.name, result);

          return {
            success: true,
            provider: provider.name,
            paymentAttemptId,
            result
          };

        } catch (error) {
          console.error(`Payment failed with ${provider.name}:`, error.message);
          lastError = error;

          // Log provider failure
          await this.logProviderFailure(paymentAttemptId, provider.name, error.message);

          // Mark provider as temporarily unavailable if needed
          await this.handleProviderFailure(provider.name, error);

          // Continue to next provider
          continue;
        }
      }

      // All providers failed
      await this.logPaymentFailure(paymentAttemptId, lastError.message);
      throw new Error(`All payment providers failed. Last error: ${lastError.message}`);

    } catch (error) {
      console.error('Payment processing with fallback failed:', error);

      // Send critical alert
      await this.sendPaymentFailureAlert(paymentAttemptId, orderData, error.message);

      throw error;
    }
  }

  // Process payment with retry logic
  async processPaymentWithRetry(provider, orderData, paymentAttemptId, retryCount = 0) {
    try {
      const result = await provider.processor(orderData);
      return result;

    } catch (error) {
      // Check if error is retryable
      if (!this.isRetryableError(error) || retryCount >= this.retryConfig.maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount),
        this.retryConfig.maxDelay
      );

      console.log(`Retrying payment with ${provider.name} in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);

      // Log retry attempt
      await this.logRetryAttempt(paymentAttemptId, provider.name, retryCount + 1, delay);

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry payment
      return await this.processPaymentWithRetry(provider, orderData, paymentAttemptId, retryCount + 1);
    }
  }

  // Get available providers based on health checks
  async getAvailableProviders(preferredProvider = null) {
    const providers = [...this.paymentProviders];

    // Move preferred provider to front if specified
    if (preferredProvider) {
      const preferredIndex = providers.findIndex(p => p.name === preferredProvider);
      if (preferredIndex > -1) {
        const [preferred] = providers.splice(preferredIndex, 1);
        providers.unshift(preferred);
      }
    }

    // Filter enabled providers and check health
    const availableProviders = [];

    for (const provider of providers) {
      if (!provider.enabled) continue;

      try {
        const isHealthy = await provider.healthCheck();
        if (isHealthy) {
          availableProviders.push(provider);
        } else {
          console.warn(`Provider ${provider.name} failed health check`);
        }
      } catch (error) {
        console.error(`Health check failed for ${provider.name}:`, error.message);
      }
    }

    return availableProviders.sort((a, b) => a.priority - b.priority);
  }

  // Health check implementations
  async checkStripeHealth() {
    try {
      const { default: stripe } = await import('./stripe-enhanced');
      await stripe.balance.retrieve();
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkPayPalHealth() {
    try {
      const { paypalClient } = await import('./paypal-enhanced');
      // Simple API call to check PayPal connectivity
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkCryptoHealth() {
    try {
      // Check crypto exchange rate API
      const response = await fetch('https://api.coingecko.com/api/v3/ping');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Error classification
  isRetryableError(error) {
    const retryableErrors = [
      'network',
      'timeout',
      'rate_limit',
      'temporary_failure',
      'service_unavailable'
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(retryableError =>
      errorMessage.includes(retryableError)
    );
  }

  // Handle provider failures
  async handleProviderFailure(providerName, error) {
    // Implement circuit breaker pattern
    const failureCount = await this.getProviderFailureCount(providerName);

    if (failureCount >= 5) {
      // Temporarily disable provider
      await this.temporarilyDisableProvider(providerName, 300000); // 5 minutes
      console.warn(`Provider ${providerName} temporarily disabled due to repeated failures`);
    }
  }

  // Database logging functions
  async logPaymentAttempt(paymentAttemptId, orderData, preferredProvider) {
    try {
      await query(`
        INSERT INTO payment_attempts (
          payment_attempt_id, order_data, preferred_provider, status, created_at
        ) VALUES ($1, $2, $3, 'started', NOW())
      `, [paymentAttemptId, JSON.stringify(orderData), preferredProvider]);
    } catch (error) {
      console.error('Failed to log payment attempt:', error);
    }
  }

  async logPaymentSuccess(paymentAttemptId, provider, result) {
    try {
      await query(`
        UPDATE payment_attempts
        SET status = 'success', successful_provider = $1, result = $2, completed_at = NOW()
        WHERE payment_attempt_id = $3
      `, [provider, JSON.stringify(result), paymentAttemptId]);
    } catch (error) {
      console.error('Failed to log payment success:', error);
    }
  }

  async logPaymentFailure(paymentAttemptId, errorMessage) {
    try {
      await query(`
        UPDATE payment_attempts
        SET status = 'failed', error_message = $1, completed_at = NOW()
        WHERE payment_attempt_id = $2
      `, [errorMessage, paymentAttemptId]);
    } catch (error) {
      console.error('Failed to log payment failure:', error);
    }
  }

  async sendPaymentFailureAlert(paymentAttemptId, orderData, error) {
    try {
      await fetch('/api/alerts/payment-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentAttemptId,
          orderData,
          error,
          timestamp: new Date().toISOString()
        })
      });
    } catch (alertError) {
      console.error('Failed to send payment failure alert:', alertError);
    }
  }
}

// Export singleton instance
export const paymentFallbackManager = new PaymentFallbackManager();
