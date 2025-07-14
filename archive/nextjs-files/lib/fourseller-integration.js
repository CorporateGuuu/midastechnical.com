import axios from 'axios';
import { query } from '../db';

// 4Seller marketplace integration
export class FourSellerIntegration {
  constructor() {
    this.apiConfig = {
      baseUrl: process.env.FOURSELLER_API_URL || 'https://api.4seller.com/v1',
      apiKey: process.env.FOURSELLER_API_KEY,
      sellerId: process.env.FOURSELLER_SELLER_ID,
      timeout: 30000,
      retryAttempts: 3
    };

    this.client = axios.create({
      baseURL: this.apiConfig.baseUrl,
      timeout: this.apiConfig.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiConfig.apiKey}`,
        'Content-Type': 'application/json',
        'X-Seller-ID': this.apiConfig.sellerId
      }
    });

    // Set up request/response interceptors
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`4Seller API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('4Seller API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Retry logic for failed requests
        if (error.response?.status >= 500 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Exponential backoff
          const delay = Math.pow(2, originalRequest._retryCount || 0) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));

          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

          if (originalRequest._retryCount <= this.apiConfig.retryAttempts) {
            return this.client(originalRequest);
          }
        }

        await this.logApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // Product management methods
  async createProduct(productData) {
    try {
      const fourSellerProduct = this.transformToFourSellerProduct(productData);

      const response = await this.client.post('/products', fourSellerProduct);

      // Log successful product creation
      await this.logProductSync({
        action: 'create',
        productId: productData.id,
        fourSellerProductId: response.data.id,
        status: 'success'
      });

      return {
        success: true,
        fourSellerProductId: response.data.id,
        data: response.data
      };

    } catch (error) {
      await this.logProductSync({
        action: 'create',
        productId: productData.id,
        status: 'failed',
        error: error.message
      });

      throw new Error(`Failed to create product on 4Seller: ${error.message}`);
    }
  }

  async updateProduct(productId, productData) {
    try {
      const fourSellerProduct = this.transformToFourSellerProduct(productData);

      const response = await this.client.put(`/products/${productId}`, fourSellerProduct);

      await this.logProductSync({
        action: 'update',
        productId: productData.id,
        fourSellerProductId: productId,
        status: 'success'
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      await this.logProductSync({
        action: 'update',
        productId: productData.id,
        fourSellerProductId: productId,
        status: 'failed',
        error: error.message
      });

      throw new Error(`Failed to update product on 4Seller: ${error.message}`);
    }
  }

  async deleteProduct(fourSellerProductId) {
    try {
      await this.client.delete(`/products/${fourSellerProductId}`);

      await this.logProductSync({
        action: 'delete',
        fourSellerProductId: fourSellerProductId,
        status: 'success'
      });

      return { success: true };

    } catch (error) {
      await this.logProductSync({
        action: 'delete',
        fourSellerProductId: fourSellerProductId,
        status: 'failed',
        error: error.message
      });

      throw new Error(`Failed to delete product on 4Seller: ${error.message}`);
    }
  }

  // Inventory management methods
  async updateInventory(fourSellerProductId, quantity) {
    try {
      const response = await this.client.patch(`/products/${fourSellerProductId}/inventory`, {
        quantity: quantity,
        timestamp: new Date().toISOString()
      });

      await this.logInventorySync({
        fourSellerProductId: fourSellerProductId,
        quantity: quantity,
        status: 'success'
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      await this.logInventorySync({
        fourSellerProductId: fourSellerProductId,
        quantity: quantity,
        status: 'failed',
        error: error.message
      });

      throw new Error(`Failed to update inventory on 4Seller: ${error.message}`);
    }
  }

  async getInventoryStatus(fourSellerProductId) {
    try {
      const response = await this.client.get(`/products/${fourSellerProductId}/inventory`);
      return response.data;

    } catch (error) {
      throw new Error(`Failed to get inventory status from 4Seller: ${error.message}`);
    }
  }

  // Order management methods
  async getOrders(filters = {}) {
    try {
      const params = {
        limit: filters.limit || 100,
        offset: filters.offset || 0,
        status: filters.status,
        date_from: filters.dateFrom,
        date_to: filters.dateTo
      };

      const response = await this.client.get('/orders', { params });
      return response.data;

    } catch (error) {
      throw new Error(`Failed to get orders from 4Seller: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId, status, trackingInfo = null) {
    try {
      const updateData = {
        status: status,
        updated_at: new Date().toISOString()
      };

      if (trackingInfo) {
        updateData.tracking = trackingInfo;
      }

      const response = await this.client.patch(`/orders/${orderId}`, updateData);

      await this.logOrderSync({
        orderId: orderId,
        status: status,
        action: 'status_update',
        result: 'success'
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      await this.logOrderSync({
        orderId: orderId,
        status: status,
        action: 'status_update',
        result: 'failed',
        error: error.message
      });

      throw new Error(`Failed to update order status on 4Seller: ${error.message}`);
    }
  }

  // Data transformation methods
  transformToFourSellerProduct(productData) {
    return {
      title: productData.name,
      description: productData.description,
      sku: productData.sku,
      price: productData.price,
      currency: 'USD',
      category: productData.category,
      brand: productData.brand || 'Midas Technical Solutions',
      condition: productData.condition || 'new',
      images: productData.images?.map(img => ({
        url: img.url,
        alt: img.alt || productData.name
      })) || [],
      attributes: {
        weight: productData.weight,
        dimensions: productData.dimensions,
        color: productData.color,
        size: productData.size
      },
      inventory: {
        quantity: productData.stock_quantity || 0,
        track_quantity: true
      },
      shipping: {
        weight: productData.shipping_weight || productData.weight,
        dimensions: productData.shipping_dimensions || productData.dimensions
      },
      metadata: {
        source: 'midastechnical',
        sync_timestamp: new Date().toISOString()
      }
    };
  }

  // Logging methods
  async logProductSync(data) {
    try {
      await query(`
        INSERT INTO fourseller_product_sync_log (
          action, product_id, fourseller_product_id, status, error_message, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [data.action, data.productId, data.fourSellerProductId, data.status, data.error || null]);
    } catch (error) {
      console.error('Failed to log product sync:', error);
    }
  }

  async logInventorySync(data) {
    try {
      await query(`
        INSERT INTO fourseller_inventory_sync_log (
          fourseller_product_id, quantity, status, error_message, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [data.fourSellerProductId, data.quantity, data.status, data.error || null]);
    } catch (error) {
      console.error('Failed to log inventory sync:', error);
    }
  }

  async logOrderSync(data) {
    try {
      await query(`
        INSERT INTO fourseller_order_sync_log (
          order_id, status, action, result, error_message, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [data.orderId, data.status, data.action, data.result, data.error || null]);
    } catch (error) {
      console.error('Failed to log order sync:', error);
    }
  }

  async logApiError(error) {
    try {
      await query(`
        INSERT INTO fourseller_api_errors (
          endpoint, method, status_code, error_message, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [
        error.config?.url || 'unknown',
        error.config?.method || 'unknown',
        error.response?.status || 0,
        error.message
      ]);
    } catch (dbError) {
      console.error('Failed to log API error:', dbError);
    }
  }
}

// Export singleton instance
export const fourSellerIntegration = new FourSellerIntegration();
