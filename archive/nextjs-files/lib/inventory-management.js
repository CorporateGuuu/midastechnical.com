import { query } from '../db';
import { fourSellerIntegration } from './fourseller-integration';

export class InventoryManagementService {
  constructor() {
    this.channels = ['website', 'fourseller'];
    this.syncInterval = 60000; // 1 minute
  }

  async updateInventoryAcrossChannels(productId, newQuantity, source = 'website') {
    try {
      // Update local inventory
      await this.updateLocalInventory(productId, newQuantity);

      // Sync to 4Seller if source is not 4Seller
      if (source !== 'fourseller') {
        const mapping = await this.getProductMapping(productId);
        if (mapping) {
          await fourSellerIntegration.updateInventory(mapping.fourseller_product_id, newQuantity);
        }
      }

      // Log inventory change
      await this.logInventoryChange(productId, newQuantity, source);

      return { success: true };
    } catch (error) {
      console.error('Failed to update inventory across channels:', error);
      throw error;
    }
  }

  async syncInventoryFromMarketplace() {
    try {
      const mappings = await this.getAllProductMappings();

      for (const mapping of mappings) {
        const marketplaceInventory = await fourSellerIntegration.getInventoryStatus(mapping.fourseller_product_id);
        await this.updateLocalInventory(mapping.product_id, marketplaceInventory.quantity);
      }

      console.log(`✅ Synced inventory for ${mappings.length} products`);
    } catch (error) {
      console.error('Failed to sync inventory from marketplace:', error);
    }
  }

  async updateLocalInventory(productId, quantity) {
    await query('UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2', [quantity, productId]);
  }

  async getProductMapping(productId) {
    const result = await query('SELECT * FROM fourseller_product_mappings WHERE product_id = $1', [productId]);
    return result.rows[0] || null;
  }

  async getAllProductMappings() {
    const result = await query('SELECT * FROM fourseller_product_mappings');
    return result.rows;
  }

  async logInventoryChange(productId, quantity, source) {
    await query(`
      INSERT INTO inventory_changes (product_id, quantity, source, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [productId, quantity, source]);
  }
}

export const inventoryManagementService = new InventoryManagementService();
