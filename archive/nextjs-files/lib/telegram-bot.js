import TelegramBot from 'node-telegram-bot-api';
import { query } from '../db';

// Enhanced Telegram bot integration for customer support and notifications
export class TelegramBotService {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.config = {
      adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
      supportChatId: process.env.TELEGRAM_SUPPORT_CHAT_ID,
      webhookUrl: process.env.TELEGRAM_WEBHOOK_URL
    };

    this.setupBotCommands();
    this.setupMessageHandlers();
  }

  setupBotCommands() {
    // Set bot commands
    this.bot.setMyCommands([
      { command: 'start', description: 'Start the bot and get help' },
      { command: 'help', description: 'Get help and available commands' },
      { command: 'order', description: 'Check order status' },
      { command: 'support', description: 'Contact customer support' },
      { command: 'track', description: 'Track your shipment' },
      { command: 'products', description: 'Browse our products' },
      { command: 'account', description: 'Manage your account' }
    ]);
  }

  setupMessageHandlers() {
    // Start command
    this.bot.onText(//start/, async (msg) => {
      await this.handleStartCommand(msg);
    });

    // Help command
    this.bot.onText(//help/, async (msg) => {
      await this.handleHelpCommand(msg);
    });

    // Order status command
    this.bot.onText(//order (.+)/, async (msg, match) => {
      await this.handleOrderCommand(msg, match[1]);
    });

    // Support command
    this.bot.onText(//support/, async (msg) => {
      await this.handleSupportCommand(msg);
    });

    // Track shipment command
    this.bot.onText(//track (.+)/, async (msg, match) => {
      await this.handleTrackCommand(msg, match[1]);
    });

    // Handle text messages for support
    this.bot.on('message', async (msg) => {
      if (!msg.text.startsWith('/')) {
        await this.handleSupportMessage(msg);
      }
    });
  }

  // Command handlers
  async handleStartCommand(msg) {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🎉 Welcome to Midas Technical Solutions!

I'm here to help you with:
• Order status and tracking
• Customer support
• Product information
• Account management

Use /help to see all available commands.

Visit our website: https://midastechnical.com
    `;

    await this.sendMessage(chatId, welcomeMessage);
    await this.logBotInteraction(chatId, 'start', 'command_executed');
  }

  async handleHelpCommand(msg) {
    const chatId = msg.chat.id;
    const helpMessage = `
🤖 Available Commands:

/order <order_id> - Check your order status
/track <tracking_number> - Track your shipment
/support - Contact customer support
/products - Browse our products
/account - Manage your account

💬 You can also send me a message for customer support!

🌐 Website: https://midastechnical.com
📧 Email: support@midastechnical.com
📞 Phone: +1 (555) 123-4567
    `;

    await this.sendMessage(chatId, helpMessage);
    await this.logBotInteraction(chatId, 'help', 'command_executed');
  }

  async handleOrderCommand(msg, orderId) {
    const chatId = msg.chat.id;

    try {
      const order = await this.getOrderDetails(orderId);

      if (!order) {
        await this.sendMessage(chatId, `❌ Order #${orderId} not found. Please check your order ID and try again.`);
        return;
      }

      const orderMessage = `
📦 Order #${order.id}

Status: ${this.getOrderStatusEmoji(order.status)} ${order.status.toUpperCase()}
Total: $${order.total_amount}
Date: ${new Date(order.created_at).toLocaleDateString()}

${order.tracking_number ? `📍 Tracking: ${order.tracking_number}` : ''}

View full details: https://midastechnical.com/orders/${order.id}
      `;

      await this.sendMessage(chatId, orderMessage);
      await this.logBotInteraction(chatId, 'order_check', 'success', { orderId });

    } catch (error) {
      await this.sendMessage(chatId, '❌ Sorry, I couldn\'t retrieve your order information. Please try again later.');
      await this.logBotInteraction(chatId, 'order_check', 'error', { orderId, error: error.message });
    }
  }

  async handleSupportCommand(msg) {
    const chatId = msg.chat.id;
    const supportMessage = `
🎧 Customer Support

How can we help you today?

Please describe your issue and we'll get back to you as soon as possible.

You can also:
📧 Email: support@midastechnical.com
📞 Call: +1 (555) 123-4567
🌐 Live Chat: https://midastechnical.com/support

Our support hours: Mon-Fri 9AM-6PM EST
    `;

    await this.sendMessage(chatId, supportMessage);
    await this.logBotInteraction(chatId, 'support', 'command_executed');
  }

  async handleTrackCommand(msg, trackingNumber) {
    const chatId = msg.chat.id;

    try {
      const trackingInfo = await this.getTrackingInfo(trackingNumber);

      if (!trackingInfo) {
        await this.sendMessage(chatId, `❌ Tracking number ${trackingNumber} not found. Please check and try again.`);
        return;
      }

      const trackingMessage = `
📍 Tracking #${trackingNumber}

Status: ${this.getShippingStatusEmoji(trackingInfo.status)} ${trackingInfo.status}
Location: ${trackingInfo.location || 'In transit'}
Estimated Delivery: ${trackingInfo.estimated_delivery || 'TBD'}

Track online: https://midastechnical.com/track/${trackingNumber}
      `;

      await this.sendMessage(chatId, trackingMessage);
      await this.logBotInteraction(chatId, 'tracking', 'success', { trackingNumber });

    } catch (error) {
      await this.sendMessage(chatId, '❌ Sorry, I couldn\'t retrieve tracking information. Please try again later.');
      await this.logBotInteraction(chatId, 'tracking', 'error', { trackingNumber, error: error.message });
    }
  }

  async handleSupportMessage(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const message = msg.text;

    try {
      // Create support ticket
      const ticketId = await this.createSupportTicket({
        userId: userId,
        chatId: chatId,
        message: message,
        source: 'telegram'
      });

      // Send confirmation to user
      await this.sendMessage(chatId, `
✅ Support ticket #${ticketId} created!

We've received your message and will respond within 24 hours.

Your message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"

Thank you for contacting Midas Technical Solutions!
      `);

      // Notify support team
      await this.notifySupportTeam(ticketId, message, userId);

      await this.logBotInteraction(chatId, 'support_message', 'ticket_created', { ticketId });

    } catch (error) {
      await this.sendMessage(chatId, '❌ Sorry, there was an error processing your message. Please try again or contact support directly.');
      await this.logBotInteraction(chatId, 'support_message', 'error', { error: error.message });
    }
  }

  // Notification methods
  async sendOrderNotification(orderData) {
    try {
      const customer = await this.getCustomerTelegramId(orderData.customer_email);

      if (!customer?.telegram_chat_id) {
        return { success: false, reason: 'No Telegram chat ID found' };
      }

      const message = `
🎉 Order Confirmation #${orderData.id}

Thank you for your order!

Total: $${orderData.total_amount}
Items: ${orderData.items.length} item(s)

We'll send you updates as your order is processed.

View order: https://midastechnical.com/orders/${orderData.id}
      `;

      await this.sendMessage(customer.telegram_chat_id, message);

      return { success: true };

    } catch (error) {
      console.error('Failed to send Telegram order notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendShippingNotification(shippingData) {
    try {
      const customer = await this.getCustomerTelegramId(shippingData.customer_email);

      if (!customer?.telegram_chat_id) {
        return { success: false, reason: 'No Telegram chat ID found' };
      }

      const message = `
📦 Your order has shipped! #${shippingData.order_id}

Tracking Number: ${shippingData.tracking_number}
Estimated Delivery: ${shippingData.estimated_delivery}

Track your package: https://midastechnical.com/track/${shippingData.tracking_number}
      `;

      await this.sendMessage(customer.telegram_chat_id, message);

      return { success: true };

    } catch (error) {
      console.error('Failed to send Telegram shipping notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility methods
  async sendMessage(chatId, text, options = {}) {
    try {
      return await this.bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...options
      });
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  getOrderStatusEmoji(status) {
    const emojis = {
      pending: '⏳',
      processing: '🔄',
      shipped: '📦',
      delivered: '✅',
      cancelled: '❌'
    };
    return emojis[status] || '📋';
  }

  getShippingStatusEmoji(status) {
    const emojis = {
      'in_transit': '🚚',
      'out_for_delivery': '🚛',
      'delivered': '✅',
      'exception': '⚠️'
    };
    return emojis[status] || '📦';
  }

  // Database methods
  async getOrderDetails(orderId) {
    try {
      const result = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get order details: ${error.message}`);
    }
  }

  async getTrackingInfo(trackingNumber) {
    try {
      const result = await query('SELECT * FROM shipments WHERE tracking_number = $1', [trackingNumber]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get tracking info: ${error.message}`);
    }
  }

  async getCustomerTelegramId(email) {
    try {
      const result = await query('SELECT telegram_chat_id FROM customers WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get customer Telegram ID: ${error.message}`);
    }
  }

  async createSupportTicket(ticketData) {
    try {
      const result = await query(`
        INSERT INTO support_tickets (
          user_id, chat_id, message, source, status, created_at
        ) VALUES ($1, $2, $3, $4, 'open', NOW())
        RETURNING id
      `, [ticketData.userId, ticketData.chatId, ticketData.message, ticketData.source]);

      return result.rows[0].id;
    } catch (error) {
      throw new Error(`Failed to create support ticket: ${error.message}`);
    }
  }

  async notifySupportTeam(ticketId, message, userId) {
    if (this.config.supportChatId) {
      const supportMessage = `
🎧 New Support Ticket #${ticketId}

From: User ${userId}
Message: "${message}"

Respond at: https://midastechnical.com/admin/support/${ticketId}
      `;

      await this.sendMessage(this.config.supportChatId, supportMessage);
    }
  }

  async logBotInteraction(chatId, action, status, metadata = {}) {
    try {
      await query(`
        INSERT INTO telegram_bot_interactions (
          chat_id, action, status, metadata, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [chatId, action, status, JSON.stringify(metadata)]);
    } catch (error) {
      console.error('Failed to log bot interaction:', error);
    }
  }
}

// Export singleton instance
export const telegramBotService = new TelegramBotService();
