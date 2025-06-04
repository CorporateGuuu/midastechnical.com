import { query } from '../db';
import { fourSellerIntegration } from './fourseller-integration';

export class OrderFulfillmentService {
  constructor() {
    this.fulfillmentStatuses = {
      pending: 'pending',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled'
    };
  }

  async processMarketplaceOrders() {
    try {
      const orders = await fourSellerIntegration.getOrders({ status: 'pending' });

      for (const order of orders.data) {
        await this.processOrder(order);
      }

      console.log(`✅ Processed ${orders.data.length} marketplace orders`);
    } catch (error) {
      console.error('Failed to process marketplace orders:', error);
    }
  }

  async processOrder(marketplaceOrder) {
    try {
      // Create local order record
      const localOrderId = await this.createLocalOrder(marketplaceOrder);

      // Update inventory
      for (const item of marketplaceOrder.items) {
        await this.updateInventoryForOrder(item);
      }

      // Log order processing
      await this.logOrderProcessing(localOrderId, marketplaceOrder.id, 'processed');

      return { success: true, localOrderId };
    } catch (error) {
      await this.logOrderProcessing(null, marketplaceOrder.id, 'failed', error.message);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status, trackingInfo = null) {
    try {
      // Update local order
      await this.updateLocalOrderStatus(orderId, status);

      // Update marketplace order
      const mapping = await this.getOrderMapping(orderId);
      if (mapping) {
        await fourSellerIntegration.updateOrderStatus(mapping.marketplace_order_id, status, trackingInfo);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  async createLocalOrder(marketplaceOrder) {
    const result = await query(`
      INSERT INTO orders (
        marketplace_order_id, customer_email, total_amount, status, created_at
      ) VALUES ($1, $2, $3, 'pending', NOW())
      RETURNING id
    `, [marketplaceOrder.id, marketplaceOrder.customer.email, marketplaceOrder.total]);

    return result.rows[0].id;
  }

  async updateInventoryForOrder(item) {
    await query(`
      UPDATE products
      SET stock_quantity = stock_quantity - $1
      WHERE sku = $2
    `, [item.quantity, item.sku]);
  }

  async updateLocalOrderStatus(orderId, status) {
    await query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, orderId]);
  }

  async getOrderMapping(orderId) {
    const result = await query('SELECT * FROM order_mappings WHERE local_order_id = $1', [orderId]);
    return result.rows[0] || null;
  }

  async logOrderProcessing(localOrderId, marketplaceOrderId, status, error = null) {
    await query(`
      INSERT INTO order_processing_logs (
        local_order_id, marketplace_order_id, status, error_message, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [localOrderId, marketplaceOrderId, status, error]);
  }
}

export const orderFulfillmentService = new OrderFulfillmentService();
