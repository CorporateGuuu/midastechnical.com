import { query } from '../db';
import { fourSellerIntegration } from './fourseller-integration';

export class StatusSynchronizationService {
  constructor() {
    this.syncInterval = 300000; // 5 minutes
  }

  async startStatusSync() {
    console.log('🔄 Starting status synchronization...');

    // Initial sync
    await this.syncAllStatuses();

    // Set up periodic sync
    setInterval(async () => {
      await this.syncAllStatuses();
    }, this.syncInterval);
  }

  async syncAllStatuses() {
    try {
      await this.syncOrderStatuses();
      await this.syncInventoryStatuses();
      console.log('✅ Status synchronization completed');
    } catch (error) {
      console.error('Status synchronization failed:', error);
    }
  }

  async syncOrderStatuses() {
    const orders = await fourSellerIntegration.getOrders({ limit: 100 });

    for (const order of orders.data) {
      await this.updateLocalOrderStatus(order);
    }
  }

  async syncInventoryStatuses() {
    const mappings = await this.getAllProductMappings();

    for (const mapping of mappings) {
      const inventory = await fourSellerIntegration.getInventoryStatus(mapping.fourseller_product_id);
      await this.updateLocalInventory(mapping.product_id, inventory.quantity);
    }
  }

  async updateLocalOrderStatus(marketplaceOrder) {
    await query(`
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE marketplace_order_id = $2
    `, [marketplaceOrder.status, marketplaceOrder.id]);
  }

  async updateLocalInventory(productId, quantity) {
    await query(`
      UPDATE products
      SET stock_quantity = $1, updated_at = NOW()
      WHERE id = $2
    `, [quantity, productId]);
  }

  async getAllProductMappings() {
    const result = await query('SELECT * FROM fourseller_product_mappings');
    return result.rows;
  }
}

export const statusSyncService = new StatusSynchronizationService();
