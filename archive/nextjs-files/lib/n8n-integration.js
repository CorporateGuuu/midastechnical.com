import axios from 'axios';
import { query } from '../db';

// n8n automation integration for advanced workflows
export class N8nIntegration {
  constructor() {
    this.n8nConfig = {
      baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
      apiKey: process.env.N8N_API_KEY,
      webhookBaseUrl: process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook'
    };

    this.workflows = {
      orderProcessing: 'order-processing-workflow',
      inventoryManagement: 'inventory-management-workflow',
      customerCommunication: 'customer-communication-workflow',
      marketplaceSync: 'marketplace-sync-workflow',
      analyticsReporting: 'analytics-reporting-workflow'
    };
  }

  // Advanced order processing workflow
  async executeOrderProcessingWorkflow(orderData) {
    try {
      const workflowData = {
        orderId: orderData.id,
        customerData: {
          id: orderData.customerId,
          email: orderData.customerEmail,
          name: orderData.customerName,
          phone: orderData.customerPhone
        },
        orderDetails: {
          items: orderData.items,
          totalAmount: orderData.totalAmount,
          currency: orderData.currency,
          paymentMethod: orderData.paymentMethod,
          shippingAddress: orderData.shippingAddress
        },
        automationSteps: [
          'validate_order',
          'check_inventory',
          'process_payment',
          'update_inventory',
          'send_confirmation',
          'create_shipping_label',
          'notify_fulfillment',
          'update_crm'
        ],
        metadata: {
          source: 'midastechnical',
          timestamp: new Date().toISOString(),
          priority: orderData.totalAmount > 1000 ? 'high' : 'normal'
        }
      };

      const result = await this.executeWorkflow('orderProcessing', workflowData);

      await this.logWorkflowExecution('order_processing', orderData.id, 'success', result);

      return { success: true, workflowId: result.workflowId };

    } catch (error) {
      await this.logWorkflowExecution('order_processing', orderData.id, 'failed', { error: error.message });
      throw new Error(`Order processing workflow failed: ${error.message}`);
    }
  }

  // Inventory management workflow
  async executeInventoryManagementWorkflow(inventoryData) {
    try {
      const workflowData = {
        products: inventoryData.products,
        actions: inventoryData.actions, // 'restock', 'low_stock_alert', 'sync_channels'
        thresholds: {
          lowStock: 10,
          criticalStock: 5,
          reorderPoint: 20
        },
        channels: ['website', 'fourseller', 'amazon', 'ebay'],
        automationSteps: [
          'check_stock_levels',
          'identify_low_stock',
          'calculate_reorder_quantities',
          'generate_purchase_orders',
          'notify_suppliers',
          'update_all_channels',
          'send_alerts'
        ],
        metadata: {
          timestamp: new Date().toISOString(),
          batchSize: inventoryData.products.length
        }
      };

      const result = await this.executeWorkflow('inventoryManagement', workflowData);

      await this.logWorkflowExecution('inventory_management', 'batch', 'success', result);

      return { success: true, workflowId: result.workflowId };

    } catch (error) {
      await this.logWorkflowExecution('inventory_management', 'batch', 'failed', { error: error.message });
      throw new Error(`Inventory management workflow failed: ${error.message}`);
    }
  }

  // Customer communication workflow
  async executeCustomerCommunicationWorkflow(communicationData) {
    try {
      const workflowData = {
        customerId: communicationData.customerId,
        communicationType: communicationData.type, // 'welcome', 'order_update', 'support', 'marketing'
        channels: communicationData.channels || ['email', 'sms'],
        content: {
          subject: communicationData.subject,
          message: communicationData.message,
          template: communicationData.template,
          personalization: communicationData.personalization
        },
        scheduling: {
          immediate: communicationData.immediate || true,
          scheduledTime: communicationData.scheduledTime,
          timezone: communicationData.timezone || 'UTC'
        },
        automationSteps: [
          'validate_customer',
          'check_preferences',
          'personalize_content',
          'send_email',
          'send_sms',
          'track_delivery',
          'log_interaction'
        ],
        metadata: {
          timestamp: new Date().toISOString(),
          priority: communicationData.priority || 'normal'
        }
      };

      const result = await this.executeWorkflow('customerCommunication', workflowData);

      await this.logWorkflowExecution('customer_communication', communicationData.customerId, 'success', result);

      return { success: true, workflowId: result.workflowId };

    } catch (error) {
      await this.logWorkflowExecution('customer_communication', communicationData.customerId, 'failed', { error: error.message });
      throw new Error(`Customer communication workflow failed: ${error.message}`);
    }
  }

  // Marketplace synchronization workflow
  async executeMarketplaceSyncWorkflow(syncData) {
    try {
      const workflowData = {
        syncType: syncData.type, // 'products', 'inventory', 'orders', 'full'
        marketplaces: syncData.marketplaces || ['fourseller'],
        products: syncData.products,
        batchSize: syncData.batchSize || 50,
        automationSteps: [
          'prepare_data',
          'validate_products',
          'transform_data',
          'sync_to_marketplaces',
          'verify_sync',
          'handle_conflicts',
          'update_mappings',
          'generate_report'
        ],
        errorHandling: {
          retryAttempts: 3,
          retryDelay: 5000,
          skipOnError: false
        },
        metadata: {
          timestamp: new Date().toISOString(),
          initiatedBy: syncData.initiatedBy || 'system'
        }
      };

      const result = await this.executeWorkflow('marketplaceSync', workflowData);

      await this.logWorkflowExecution('marketplace_sync', syncData.type, 'success', result);

      return { success: true, workflowId: result.workflowId };

    } catch (error) {
      await this.logWorkflowExecution('marketplace_sync', syncData.type, 'failed', { error: error.message });
      throw new Error(`Marketplace sync workflow failed: ${error.message}`);
    }
  }

  // Analytics and reporting workflow
  async executeAnalyticsReportingWorkflow(reportData) {
    try {
      const workflowData = {
        reportType: reportData.type, // 'daily', 'weekly', 'monthly', 'custom'
        metrics: reportData.metrics || ['sales', 'inventory', 'customers', 'performance'],
        dateRange: {
          start: reportData.startDate,
          end: reportData.endDate
        },
        recipients: reportData.recipients,
        format: reportData.format || 'pdf',
        automationSteps: [
          'collect_data',
          'calculate_metrics',
          'generate_charts',
          'create_report',
          'send_to_recipients',
          'archive_report'
        ],
        metadata: {
          timestamp: new Date().toISOString(),
          scheduledReport: reportData.scheduled || false
        }
      };

      const result = await this.executeWorkflow('analyticsReporting', workflowData);

      await this.logWorkflowExecution('analytics_reporting', reportData.type, 'success', result);

      return { success: true, workflowId: result.workflowId };

    } catch (error) {
      await this.logWorkflowExecution('analytics_reporting', reportData.type, 'failed', { error: error.message });
      throw new Error(`Analytics reporting workflow failed: ${error.message}`);
    }
  }

  // Core n8n workflow execution
  async executeWorkflow(workflowType, data) {
    const workflowName = this.workflows[workflowType];

    if (!workflowName) {
      throw new Error(`Unknown workflow type: ${workflowType}`);
    }

    try {
      const response = await axios.post(`${this.n8nConfig.webhookBaseUrl}/${workflowName}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.n8nConfig.apiKey}`
        },
        timeout: 30000
      });

      return {
        success: true,
        workflowId: response.data.workflowId || `${workflowName}_${Date.now()}`,
        executionId: response.data.executionId,
        data: response.data
      };

    } catch (error) {
      throw new Error(`n8n workflow execution failed: ${error.message}`);
    }
  }

  // Get workflow status
  async getWorkflowStatus(executionId) {
    try {
      const response = await axios.get(`${this.n8nConfig.baseUrl}/api/v1/executions/${executionId}`, {
        headers: {
          'Authorization': `Bearer ${this.n8nConfig.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get workflow status: ${error.message}`);
    }
  }

  // Logging and monitoring
  async logWorkflowExecution(workflowType, entityId, status, result) {
    try {
      await query(`
        INSERT INTO n8n_workflow_executions (
          workflow_type, entity_id, status, result, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [workflowType, entityId, status, JSON.stringify(result)]);
    } catch (error) {
      console.error('Failed to log n8n workflow execution:', error);
    }
  }

  // Get workflow statistics
  async getWorkflowStats(timeframe = '24h') {
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
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration
        FROM n8n_workflow_executions
        WHERE ${timeCondition}
        GROUP BY workflow_type, status
        ORDER BY workflow_type, status
      `);

      return result.rows;
    } catch (error) {
      console.error('Failed to get n8n workflow stats:', error);
      return [];
    }
  }
}

// Export singleton instance
export const n8nIntegration = new N8nIntegration();
