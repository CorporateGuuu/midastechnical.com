import axios from 'axios';
import { query } from '../db';

// Zapier automation integration for midastechnical.com
export class ZapierIntegration {
  constructor() {
    this.webhookUrls = {
      newOrder: process.env.ZAPIER_NEW_ORDER_WEBHOOK,
      lowStock: process.env.ZAPIER_LOW_STOCK_WEBHOOK,
      customerRegistration: process.env.ZAPIER_CUSTOMER_REGISTRATION_WEBHOOK,
      productUpdate: process.env.ZAPIER_PRODUCT_UPDATE_WEBHOOK,
      paymentReceived: process.env.ZAPIER_PAYMENT_RECEIVED_WEBHOOK,
      supportTicket: process.env.ZAPIER_SUPPORT_TICKET_WEBHOOK
    };

    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };
  }

  // Order processing automation
  async triggerNewOrderWorkflow(orderData) {
    try {
      const payload = {
        orderId: orderData.id,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        totalAmount: orderData.totalAmount,
        currency: orderData.currency,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        orderDate: orderData.createdAt,
        paymentMethod: orderData.paymentMethod,
        orderStatus: orderData.status,
        metadata: {
          source: 'midastechnical',
          timestamp: new Date().toISOString()
        }
      };

      await this.sendToZapier('newOrder', payload);

      // Log successful trigger
      await this.logAutomationTrigger('new_order', orderData.id, 'success');

      return { success: true };

    } catch (error) {
      await this.logAutomationTrigger('new_order', orderData.id, 'failed', error.message);
      throw new Error(`Failed to trigger new order workflow: ${error.message}`);
    }
  }

  // Inventory management automation
  async triggerLowStockAlert(productData) {
    try {
      const payload = {
        productId: productData.id,
        productName: productData.name,
        sku: productData.sku,
        currentStock: productData.stockQuantity,
        lowStockThreshold: productData.lowStockThreshold,
        category: productData.category,
        price: productData.price,
        supplier: productData.supplier,
        lastRestocked: productData.lastRestocked,
        metadata: {
          urgency: productData.stockQuantity === 0 ? 'critical' : 'warning',
          timestamp: new Date().toISOString()
        }
      };

      await this.sendToZapier('lowStock', payload);

      await this.logAutomationTrigger('low_stock', productData.id, 'success');

      return { success: true };

    } catch (error) {
      await this.logAutomationTrigger('low_stock', productData.id, 'failed', error.message);
      throw new Error(`Failed to trigger low stock alert: ${error.message}`);
    }
  }

  // Customer management automation
  async triggerCustomerRegistrationWorkflow(customerData) {
    try {
      const payload = {
        customerId: customerData.id,
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        registrationDate: customerData.createdAt,
        source: customerData.source || 'website',
        preferences: customerData.preferences,
        metadata: {
          welcomeEmailSent: false,
          timestamp: new Date().toISOString()
        }
      };

      await this.sendToZapier('customerRegistration', payload);

      await this.logAutomationTrigger('customer_registration', customerData.id, 'success');

      return { success: true };

    } catch (error) {
      await this.logAutomationTrigger('customer_registration', customerData.id, 'failed', error.message);
      throw new Error(`Failed to trigger customer registration workflow: ${error.message}`);
    }
  }

  // Product management automation
  async triggerProductUpdateWorkflow(productData, updateType = 'update') {
    try {
      const payload = {
        productId: productData.id,
        productName: productData.name,
        sku: productData.sku,
        updateType: updateType, // 'create', 'update', 'delete'
        changes: productData.changes || {},
        category: productData.category,
        price: productData.price,
        stockQuantity: productData.stockQuantity,
        status: productData.status,
        lastModified: productData.updatedAt,
        metadata: {
          requiresSync: true,
          timestamp: new Date().toISOString()
        }
      };

      await this.sendToZapier('productUpdate', payload);

      await this.logAutomationTrigger('product_update', productData.id, 'success');

      return { success: true };

    } catch (error) {
      await this.logAutomationTrigger('product_update', productData.id, 'failed', error.message);
      throw new Error(`Failed to trigger product update workflow: ${error.message}`);
    }
  }

  // Payment processing automation
  async triggerPaymentReceivedWorkflow(paymentData) {
    try {
      const payload = {
        paymentId: paymentData.id,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        status: paymentData.status,
        customerEmail: paymentData.customerEmail,
        transactionId: paymentData.transactionId,
        paymentDate: paymentData.createdAt,
        metadata: {
          requiresReceipt: true,
          timestamp: new Date().toISOString()
        }
      };

      await this.sendToZapier('paymentReceived', payload);

      await this.logAutomationTrigger('payment_received', paymentData.id, 'success');

      return { success: true };

    } catch (error) {
      await this.logAutomationTrigger('payment_received', paymentData.id, 'failed', error.message);
      throw new Error(`Failed to trigger payment received workflow: ${error.message}`);
    }
  }

  // Customer support automation
  async triggerSupportTicketWorkflow(ticketData) {
    try {
      const payload = {
        ticketId: ticketData.id,
        customerId: ticketData.customerId,
        customerEmail: ticketData.customerEmail,
        subject: ticketData.subject,
        description: ticketData.description,
        priority: ticketData.priority,
        category: ticketData.category,
        status: ticketData.status,
        createdDate: ticketData.createdAt,
        metadata: {
          requiresResponse: true,
          timestamp: new Date().toISOString()
        }
      };

      await this.sendToZapier('supportTicket', payload);

      await this.logAutomationTrigger('support_ticket', ticketData.id, 'success');

      return { success: true };

    } catch (error) {
      await this.logAutomationTrigger('support_ticket', ticketData.id, 'failed', error.message);
      throw new Error(`Failed to trigger support ticket workflow: ${error.message}`);
    }
  }

  // Core Zapier communication method
  async sendToZapier(workflowType, payload, retryCount = 0) {
    const webhookUrl = this.webhookUrls[workflowType];

    if (!webhookUrl) {
      throw new Error(`No webhook URL configured for workflow type: ${workflowType}`);
    }

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'midastechnical-automation/1.0'
        },
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error(`Zapier webhook returned status ${response.status}`);
      }

      return response.data;

    } catch (error) {
      // Implement retry logic
      if (retryCount < this.retryConfig.maxRetries) {
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, retryCount),
          this.retryConfig.maxDelay
        );

        console.log(`Retrying Zapier webhook in ${delay}ms (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));

        return await this.sendToZapier(workflowType, payload, retryCount + 1);
      }

      throw error;
    }
  }

  // Logging and monitoring
  async logAutomationTrigger(workflowType, entityId, status, error = null) {
    try {
      await query(`
        INSERT INTO automation_triggers (
          workflow_type, entity_id, status, error_message, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [workflowType, entityId, status, error]);
    } catch (dbError) {
      console.error('Failed to log automation trigger:', dbError);
    }
  }

  // Get automation statistics
  async getAutomationStats(timeframe = '24h') {
    try {
      const timeCondition = timeframe === '24h' ?
        "created_at > NOW() - INTERVAL '24 hours'" :
        timeframe === '7d' ?
        "created_at > NOW() - INTERVAL '7 days'" :
        "created_at > NOW() - INTERVAL '30 days'";

      const result = await query(`
        SELECT
          workflow_type,
          status,
          COUNT(*) as count
        FROM automation_triggers
        WHERE ${timeCondition}
        GROUP BY workflow_type, status
        ORDER BY workflow_type, status
      `);

      return result.rows;
    } catch (error) {
      console.error('Failed to get automation stats:', error);
      return [];
    }
  }
}

// Export singleton instance
export const zapierIntegration = new ZapierIntegration();
