import { query } from '../db';
import { fourSellerIntegration } from './fourseller-integration';

// Product synchronization service for marketplace integration
export class ProductSynchronizationService {
  constructor() {
    this.syncConfig = {
      batchSize: 50,
      syncInterval: 300000, // 5 minutes
      retryAttempts: 3,
      conflictResolution: 'source_wins' // source_wins, marketplace_wins, manual
    };

    this.syncStatus = {
      isRunning: false,
      lastSync: null,
      totalProducts: 0,
      syncedProducts: 0,
      failedProducts: 0
    };
  }

  // Start automated product synchronization
  async startProductSync() {
    if (this.syncStatus.isRunning) {
      console.log('Product synchronization already running');
      return;
    }

    console.log('🔄 Starting automated product synchronization...');
    this.syncStatus.isRunning = true;

    try {
      // Initial full sync
      await this.performFullSync();

      // Set up periodic sync
      this.setupPeriodicSync();

      console.log('✅ Product synchronization started successfully');

    } catch (error) {
      console.error('Failed to start product synchronization:', error);
      this.syncStatus.isRunning = false;
      throw error;
    }
  }

  // Perform full product synchronization
  async performFullSync() {
    console.log('📦 Performing full product synchronization...');

    const syncId = `sync_${Date.now()}`;
    const startTime = Date.now();

    try {
      // Get all products from local database
      const products = await this.getLocalProducts();
      this.syncStatus.totalProducts = products.length;
      this.syncStatus.syncedProducts = 0;
      this.syncStatus.failedProducts = 0;

      console.log(`Found ${products.length} products to synchronize`);

      // Process products in batches
      for (let i = 0; i < products.length; i += this.syncConfig.batchSize) {
        const batch = products.slice(i, i + this.syncConfig.batchSize);
        await this.processBatch(batch, syncId);

        // Progress update
        const progress = ((i + batch.length) / products.length * 100).toFixed(1);
        console.log(`Sync progress: ${progress}% (${i + batch.length}/${products.length})`);
      }

      const duration = Date.now() - startTime;
      this.syncStatus.lastSync = new Date();

      // Log sync completion
      await this.logSyncCompletion(syncId, {
        totalProducts: this.syncStatus.totalProducts,
        syncedProducts: this.syncStatus.syncedProducts,
        failedProducts: this.syncStatus.failedProducts,
        duration: duration
      });

      console.log(`✅ Full sync completed in ${duration}ms`);
      console.log(`   Synced: ${this.syncStatus.syncedProducts}`);
      console.log(`   Failed: ${this.syncStatus.failedProducts}`);

    } catch (error) {
      console.error('Full sync failed:', error);
      await this.logSyncError(syncId, error.message);
      throw error;
    }
  }

  // Process a batch of products
  async processBatch(products, syncId) {
    const promises = products.map(product => this.syncProduct(product, syncId));
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.syncStatus.syncedProducts++;
      } else {
        this.syncStatus.failedProducts++;
        console.error(`Failed to sync product ${products[index].id}:`, result.reason);
      }
    });
  }

  // Synchronize individual product
  async syncProduct(product, syncId) {
    try {
      // Check if product exists on 4Seller
      const existingMapping = await this.getProductMapping(product.id);

      if (existingMapping) {
        // Update existing product
        await fourSellerIntegration.updateProduct(existingMapping.fourseller_product_id, product);

        // Update mapping timestamp
        await this.updateProductMapping(product.id, {
          lastSynced: new Date(),
          syncId: syncId
        });

      } else {
        // Create new product
        const result = await fourSellerIntegration.createProduct(product);

        // Create product mapping
        await this.createProductMapping({
          productId: product.id,
          fourSellerProductId: result.fourSellerProductId,
          syncId: syncId
        });
      }

      // Sync inventory
      await this.syncProductInventory(product);

      return { success: true, productId: product.id };

    } catch (error) {
      await this.logProductSyncError(product.id, syncId, error.message);
      throw error;
    }
  }

  // Sync product inventory
  async syncProductInventory(product) {
    try {
      const mapping = await this.getProductMapping(product.id);
      if (!mapping) return;

      await fourSellerIntegration.updateInventory(
        mapping.fourseller_product_id,
        product.stock_quantity || 0
      );

    } catch (error) {
      console.error(`Failed to sync inventory for product ${product.id}:`, error);
    }
  }

  // Set up periodic synchronization
  setupPeriodicSync() {
    setInterval(async () => {
      try {
        console.log('🔄 Running periodic product sync...');
        await this.performIncrementalSync();
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, this.syncConfig.syncInterval);
  }

  // Perform incremental synchronization (only changed products)
  async performIncrementalSync() {
    const lastSync = this.syncStatus.lastSync || new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    try {
      // Get products modified since last sync
      const modifiedProducts = await this.getModifiedProducts(lastSync);

      if (modifiedProducts.length === 0) {
        console.log('No products modified since last sync');
        return;
      }

      console.log(`Found ${modifiedProducts.length} modified products`);

      const syncId = `incremental_${Date.now()}`;

      // Process modified products
      for (const product of modifiedProducts) {
        try {
          await this.syncProduct(product, syncId);
          this.syncStatus.syncedProducts++;
        } catch (error) {
          this.syncStatus.failedProducts++;
          console.error(`Failed to sync product ${product.id}:`, error);
        }
      }

      this.syncStatus.lastSync = new Date();

      console.log(`✅ Incremental sync completed: ${modifiedProducts.length} products processed`);

    } catch (error) {
      console.error('Incremental sync failed:', error);
    }
  }

  // Database helper methods
  async getLocalProducts() {
    try {
      const result = await query(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY p.updated_at DESC
      `);

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get local products: ${error.message}`);
    }
  }

  async getModifiedProducts(since) {
    try {
      const result = await query(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active' AND p.updated_at > $1
        ORDER BY p.updated_at DESC
      `, [since]);

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get modified products: ${error.message}`);
    }
  }

  async getProductMapping(productId) {
    try {
      const result = await query(`
        SELECT * FROM fourseller_product_mappings WHERE product_id = $1
      `, [productId]);

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get product mapping: ${error.message}`);
    }
  }

  async createProductMapping(data) {
    try {
      await query(`
        INSERT INTO fourseller_product_mappings (
          product_id, fourseller_product_id, sync_id, created_at, last_synced
        ) VALUES ($1, $2, $3, NOW(), NOW())
      `, [data.productId, data.fourSellerProductId, data.syncId]);
    } catch (error) {
      throw new Error(`Failed to create product mapping: ${error.message}`);
    }
  }

  async updateProductMapping(productId, data) {
    try {
      await query(`
        UPDATE fourseller_product_mappings
        SET last_synced = $1, sync_id = $2, updated_at = NOW()
        WHERE product_id = $3
      `, [data.lastSynced, data.syncId, productId]);
    } catch (error) {
      throw new Error(`Failed to update product mapping: ${error.message}`);
    }
  }

  async logSyncCompletion(syncId, stats) {
    try {
      await query(`
        INSERT INTO fourseller_sync_logs (
          sync_id, type, status, stats, created_at
        ) VALUES ($1, 'product_sync', 'completed', $2, NOW())
      `, [syncId, JSON.stringify(stats)]);
    } catch (error) {
      console.error('Failed to log sync completion:', error);
    }
  }

  async logSyncError(syncId, error) {
    try {
      await query(`
        INSERT INTO fourseller_sync_logs (
          sync_id, type, status, error_message, created_at
        ) VALUES ($1, 'product_sync', 'failed', $2, NOW())
      `, [syncId, error]);
    } catch (dbError) {
      console.error('Failed to log sync error:', dbError);
    }
  }

  async logProductSyncError(productId, syncId, error) {
    try {
      await query(`
        INSERT INTO fourseller_product_sync_errors (
          product_id, sync_id, error_message, created_at
        ) VALUES ($1, $2, $3, NOW())
      `, [productId, syncId, error]);
    } catch (dbError) {
      console.error('Failed to log product sync error:', dbError);
    }
  }

  // Get synchronization status
  getSyncStatus() {
    return {
      ...this.syncStatus,
      nextSync: this.syncStatus.lastSync ?
        new Date(this.syncStatus.lastSync.getTime() + this.syncConfig.syncInterval) :
        null
    };
  }
}

// Export singleton instance
export const productSyncService = new ProductSynchronizationService();
