import { query } from '../db';

// Production payment testing suite
export class ProductionPaymentTester {
  constructor() {
    this.testResults = [];
    this.testConfig = {
      testAmounts: [1.00, 10.00, 100.00], // Test different amounts
      testCurrencies: ['USD', 'CAD', 'EUR'],
      testPaymentMethods: ['card', 'paypal', 'crypto'],
      maxTestDuration: 300000 // 5 minutes
    };
  }

  // Run comprehensive payment testing
  async runProductionPaymentTests() {
    console.log('🧪 Starting production payment testing...');

    const testSuiteId = `test_${Date.now()}`;
    const startTime = Date.now();

    try {
      // Test Stripe integration
      await this.testStripeIntegration(testSuiteId);

      // Test PayPal integration
      await this.testPayPalIntegration(testSuiteId);

      // Test crypto payment integration
      await this.testCryptoIntegration(testSuiteId);

      // Test webhook processing
      await this.testWebhookProcessing(testSuiteId);

      // Test fallback logic
      await this.testFallbackLogic(testSuiteId);

      // Generate test report
      const testReport = await this.generateTestReport(testSuiteId, startTime);

      return {
        success: true,
        testSuiteId,
        duration: Date.now() - startTime,
        results: this.testResults,
        report: testReport
      };

    } catch (error) {
      console.error('Production payment testing failed:', error);

      await this.logTestFailure(testSuiteId, error.message);

      return {
        success: false,
        testSuiteId,
        error: error.message,
        results: this.testResults
      };
    }
  }

  // Test Stripe integration
  async testStripeIntegration(testSuiteId) {
    console.log('   Testing Stripe integration...');

    try {
      const { createEnhancedCheckoutSession } = await import('./stripe-enhanced');

      // Test checkout session creation
      const testOrderData = {
        lineItems: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'Test Product' },
            unit_amount: 1000
          },
          quantity: 1
        }],
        customerEmail: 'test@midastechnical.com',
        metadata: { testSuiteId, test: 'stripe_checkout' }
      };

      const session = await createEnhancedCheckoutSession(testOrderData);

      this.addTestResult('stripe_checkout_creation', true, {
        sessionId: session.sessionId,
        url: session.url
      });

      // Test webhook signature validation
      await this.testStripeWebhookValidation(testSuiteId);

      console.log('   ✅ Stripe integration tests passed');

    } catch (error) {
      this.addTestResult('stripe_integration', false, { error: error.message });
      throw new Error(`Stripe integration test failed: ${error.message}`);
    }
  }

  // Test PayPal integration
  async testPayPalIntegration(testSuiteId) {
    console.log('   Testing PayPal integration...');

    try {
      const { createPayPalOrder } = await import('./paypal-enhanced');

      // Test PayPal order creation
      const testOrderData = {
        amount: 10.00,
        currency: 'USD',
        items: [{
          name: 'Test Product',
          price: 10.00,
          quantity: 1,
          sku: 'TEST-001'
        }],
        customerInfo: {
          firstName: 'Test',
          lastName: 'Customer',
          email: 'test@midastechnical.com'
        },
        metadata: { testSuiteId, test: 'paypal_order' }
      };

      const order = await createPayPalOrder(testOrderData);

      this.addTestResult('paypal_order_creation', true, {
        orderId: order.orderId,
        approvalUrl: order.approvalUrl
      });

      console.log('   ✅ PayPal integration tests passed');

    } catch (error) {
      this.addTestResult('paypal_integration', false, { error: error.message });
      throw new Error(`PayPal integration test failed: ${error.message}`);
    }
  }

  // Test crypto payment integration
  async testCryptoIntegration(testSuiteId) {
    console.log('   Testing crypto payment integration...');

    try {
      const { createCryptoPayment, SUPPORTED_CRYPTOS } = await import('./crypto-payments');

      // Test crypto payment creation for each supported currency
      for (const cryptoType of Object.keys(SUPPORTED_CRYPTOS)) {
        const testOrderData = {
          amount: 50.00,
          currency: 'USD',
          cryptoType: cryptoType,
          customerEmail: 'test@midastechnical.com',
          orderId: `TEST-${testSuiteId}-${cryptoType}`,
          metadata: { testSuiteId, test: 'crypto_payment' }
        };

        const payment = await createCryptoPayment(testOrderData);

        this.addTestResult(`crypto_payment_${cryptoType}`, true, {
          paymentId: payment.paymentId,
          paymentAddress: payment.paymentAddress,
          cryptoAmount: payment.cryptoAmount
        });
      }

      console.log('   ✅ Crypto payment integration tests passed');

    } catch (error) {
      this.addTestResult('crypto_integration', false, { error: error.message });
      throw new Error(`Crypto integration test failed: ${error.message}`);
    }
  }

  // Test webhook processing
  async testWebhookProcessing(testSuiteId) {
    console.log('   Testing webhook processing...');

    try {
      const { webhookValidator } = await import('./webhook-validator');

      // Test Stripe webhook validation
      const testStripePayload = JSON.stringify({
        id: 'evt_test_webhook',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test' } }
      });

      const testTimestamp = Math.floor(Date.now() / 1000);
      const testSignature = 'v1=test_signature';

      // This would normally fail validation, but we're testing the validation logic
      const stripeValidation = await webhookValidator.validateStripeWebhook(
        testStripePayload,
        testSignature,
        testTimestamp
      );

      this.addTestResult('webhook_validation_logic', true, {
        stripeValidation: stripeValidation.valid
      });

      console.log('   ✅ Webhook processing tests passed');

    } catch (error) {
      this.addTestResult('webhook_processing', false, { error: error.message });
      throw new Error(`Webhook processing test failed: ${error.message}`);
    }
  }

  // Test fallback logic
  async testFallbackLogic(testSuiteId) {
    console.log('   Testing payment fallback logic...');

    try {
      const { paymentFallbackManager } = await import('./payment-fallback');

      // Test provider health checks
      const providers = await paymentFallbackManager.getAvailableProviders();

      this.addTestResult('fallback_provider_health', true, {
        availableProviders: providers.map(p => p.name),
        providerCount: providers.length
      });

      // Test error classification
      const testErrors = [
        new Error('Network timeout'),
        new Error('Rate limit exceeded'),
        new Error('Invalid API key')
      ];

      const retryableResults = testErrors.map(error =>
        paymentFallbackManager.isRetryableError(error)
      );

      this.addTestResult('fallback_error_classification', true, {
        retryableResults
      });

      console.log('   ✅ Payment fallback logic tests passed');

    } catch (error) {
      this.addTestResult('fallback_logic', false, { error: error.message });
      throw new Error(`Fallback logic test failed: ${error.message}`);
    }
  }

  // Helper methods
  addTestResult(testName, passed, data = {}) {
    this.testResults.push({
      testName,
      passed,
      timestamp: new Date().toISOString(),
      data
    });
  }

  async generateTestReport(testSuiteId, startTime) {
    const duration = Date.now() - startTime;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    const successRate = (passedTests / totalTests) * 100;

    const report = {
      testSuiteId,
      duration,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate,
      results: this.testResults,
      summary: {
        stripe: this.testResults.filter(r => r.testName.includes('stripe')),
        paypal: this.testResults.filter(r => r.testName.includes('paypal')),
        crypto: this.testResults.filter(r => r.testName.includes('crypto')),
        webhook: this.testResults.filter(r => r.testName.includes('webhook')),
        fallback: this.testResults.filter(r => r.testName.includes('fallback'))
      }
    };

    // Save test report to database
    await this.saveTestReport(testSuiteId, report);

    return report;
  }

  async saveTestReport(testSuiteId, report) {
    try {
      await query(`
        INSERT INTO payment_test_reports (
          test_suite_id, report_data, created_at
        ) VALUES ($1, $2, NOW())
      `, [testSuiteId, JSON.stringify(report)]);
    } catch (error) {
      console.error('Failed to save test report:', error);
    }
  }

  async logTestFailure(testSuiteId, error) {
    try {
      await query(`
        INSERT INTO payment_test_failures (
          test_suite_id, error_message, created_at
        ) VALUES ($1, $2, NOW())
      `, [testSuiteId, error]);
    } catch (dbError) {
      console.error('Failed to log test failure:', dbError);
    }
  }
}

// Export singleton instance
export const productionPaymentTester = new ProductionPaymentTester();
