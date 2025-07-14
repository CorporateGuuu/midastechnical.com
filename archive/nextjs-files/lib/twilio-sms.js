import twilio from 'twilio';
import { query } from '../db';

// Enhanced Twilio SMS integration for midastechnical.com
export class TwilioSmsService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    this.config = {
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      webhookUrl: process.env.TWILIO_WEBHOOK_URL,
      retryAttempts: 3,
      retryDelay: 5000
    };

    this.messageTypes = {
      orderConfirmation: 'order_confirmation',
      shippingUpdate: 'shipping_update',
      twoFactorAuth: '2fa',
      lowStockAlert: 'low_stock_alert',
      customerSupport: 'customer_support',
      marketingPromo: 'marketing_promo'
    };
  }

  // Send order confirmation SMS
  async sendOrderConfirmationSms(orderData) {
    try {
      const message = this.formatOrderConfirmationMessage(orderData);

      const result = await this.sendSms({
        to: orderData.customerPhone,
        message: message,
        type: this.messageTypes.orderConfirmation,
        orderId: orderData.id
      });

      await this.logSmsDelivery({
        type: 'order_confirmation',
        orderId: orderData.id,
        phone: orderData.customerPhone,
        status: 'sent',
        messageSid: result.sid
      });

      return { success: true, messageSid: result.sid };

    } catch (error) {
      await this.logSmsError('order_confirmation', orderData.id, error.message);
      throw new Error(`Failed to send order confirmation SMS: ${error.message}`);
    }
  }

  // Send shipping update SMS
  async sendShippingUpdateSms(shippingData) {
    try {
      const message = this.formatShippingUpdateMessage(shippingData);

      const result = await this.sendSms({
        to: shippingData.customerPhone,
        message: message,
        type: this.messageTypes.shippingUpdate,
        orderId: shippingData.orderId
      });

      await this.logSmsDelivery({
        type: 'shipping_update',
        orderId: shippingData.orderId,
        phone: shippingData.customerPhone,
        status: 'sent',
        messageSid: result.sid
      });

      return { success: true, messageSid: result.sid };

    } catch (error) {
      await this.logSmsError('shipping_update', shippingData.orderId, error.message);
      throw new Error(`Failed to send shipping update SMS: ${error.message}`);
    }
  }

  // Send 2FA SMS
  async send2FaSms(phoneNumber, code, userId) {
    try {
      const message = `Your Midas Technical verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`;

      const result = await this.sendSms({
        to: phoneNumber,
        message: message,
        type: this.messageTypes.twoFactorAuth,
        userId: userId
      });

      await this.logSmsDelivery({
        type: '2fa',
        userId: userId,
        phone: phoneNumber,
        status: 'sent',
        messageSid: result.sid
      });

      return { success: true, messageSid: result.sid };

    } catch (error) {
      await this.logSmsError('2fa', userId, error.message);
      throw new Error(`Failed to send 2FA SMS: ${error.message}`);
    }
  }

  // Send low stock alert SMS
  async sendLowStockAlertSms(productData, recipientPhone) {
    try {
      const message = this.formatLowStockMessage(productData);

      const result = await this.sendSms({
        to: recipientPhone,
        message: message,
        type: this.messageTypes.lowStockAlert,
        productId: productData.id
      });

      await this.logSmsDelivery({
        type: 'low_stock_alert',
        productId: productData.id,
        phone: recipientPhone,
        status: 'sent',
        messageSid: result.sid
      });

      return { success: true, messageSid: result.sid };

    } catch (error) {
      await this.logSmsError('low_stock_alert', productData.id, error.message);
      throw new Error(`Failed to send low stock alert SMS: ${error.message}`);
    }
  }

  // Core SMS sending method with retry logic
  async sendSms(smsData, retryCount = 0) {
    try {
      const messageOptions = {
        body: smsData.message,
        to: smsData.to,
        from: this.config.fromNumber
      };

      // Use messaging service if available
      if (this.config.messagingServiceSid) {
        messageOptions.messagingServiceSid = this.config.messagingServiceSid;
        delete messageOptions.from;
      }

      // Add status callback for delivery confirmation
      if (this.config.webhookUrl) {
        messageOptions.statusCallback = `${this.config.webhookUrl}/sms/status`;
      }

      const message = await this.client.messages.create(messageOptions);

      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from
      };

    } catch (error) {
      // Implement retry logic for transient errors
      if (this.isRetryableError(error) && retryCount < this.config.retryAttempts) {
        console.log(`Retrying SMS send (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return await this.sendSms(smsData, retryCount + 1);
      }

      throw error;
    }
  }

  // Message formatting methods
  formatOrderConfirmationMessage(orderData) {
    return `Hi ${orderData.customerName}! Your order #${orderData.id} has been confirmed. Total: $${orderData.totalAmount}. Track your order at midastechnical.com/orders/${orderData.id}`;
  }

  formatShippingUpdateMessage(shippingData) {
    return `Your order #${shippingData.orderId} has shipped! Tracking: ${shippingData.trackingNumber}. Estimated delivery: ${shippingData.estimatedDelivery}. Track at midastechnical.com/track/${shippingData.trackingNumber}`;
  }

  formatLowStockMessage(productData) {
    return `LOW STOCK ALERT: ${productData.name} (SKU: ${productData.sku}) has only ${productData.stockQuantity} units remaining. Reorder threshold: ${productData.lowStockThreshold}`;
  }

  // Error handling
  isRetryableError(error) {
    const retryableCodes = [20003, 20429, 21610, 21611]; // Rate limit, queue full, etc.
    return retryableCodes.includes(error.code);
  }

  // Database logging
  async logSmsDelivery(data) {
    try {
      await query(`
        INSERT INTO sms_deliveries (
          type, entity_id, phone_number, status, message_sid, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [data.type, data.orderId || data.userId || data.productId, data.phone, data.status, data.messageSid]);
    } catch (error) {
      console.error('Failed to log SMS delivery:', error);
    }
  }

  async logSmsError(type, entityId, error) {
    try {
      await query(`
        INSERT INTO sms_errors (
          type, entity_id, error_message, created_at
        ) VALUES ($1, $2, $3, NOW())
      `, [type, entityId, error]);
    } catch (dbError) {
      console.error('Failed to log SMS error:', dbError);
    }
  }

  // Webhook handling for delivery status
  async handleDeliveryStatus(webhookData) {
    try {
      await query(`
        UPDATE sms_deliveries
        SET status = $1, updated_at = NOW()
        WHERE message_sid = $2
      `, [webhookData.MessageStatus, webhookData.MessageSid]);

      // Handle failed deliveries
      if (webhookData.MessageStatus === 'failed' || webhookData.MessageStatus === 'undelivered') {
        await this.handleFailedDelivery(webhookData);
      }

    } catch (error) {
      console.error('Failed to handle delivery status:', error);
    }
  }

  async handleFailedDelivery(webhookData) {
    // Log failed delivery and potentially trigger fallback communication
    console.error(`SMS delivery failed: ${webhookData.MessageSid}`);

    // Could trigger email fallback here
    // await this.triggerEmailFallback(webhookData);
  }

  // Get SMS statistics
  async getSmsStats(timeframe = '24h') {
    try {
      const timeCondition = timeframe === '24h' ?
        "created_at > NOW() - INTERVAL '24 hours'" :
        "created_at > NOW() - INTERVAL '7 days'";

      const result = await query(`
        SELECT
          type,
          status,
          COUNT(*) as count
        FROM sms_deliveries
        WHERE ${timeCondition}
        GROUP BY type, status
        ORDER BY type, status
      `);

      return result.rows;
    } catch (error) {
      console.error('Failed to get SMS stats:', error);
      return [];
    }
  }
}

// Export singleton instance
export const twilioSmsService = new TwilioSmsService();
