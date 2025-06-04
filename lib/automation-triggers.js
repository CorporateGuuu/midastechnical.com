import { zapierIntegration } from './zapier-integration';
import { n8nIntegration } from './n8n-integration';
import { query } from '../db';

export class AutomationTriggerSystem {
  constructor() {
    this.triggers = {
      order: ['created', 'updated', 'paid', 'shipped', 'delivered', 'cancelled'],
      product: ['created', 'updated', 'deleted', 'low_stock', 'out_of_stock'],
      customer: ['registered', 'updated', 'order_placed', 'support_ticket'],
      payment: ['received', 'failed', 'refunded', 'disputed'],
      inventory: ['updated', 'low_stock', 'restocked', 'sync_required']
    };
  }

  async triggerOrderAutomation(order, event) {
    try {
      // Trigger Zapier workflow
      await zapierIntegration.triggerNewOrderWorkflow(order);

      // Trigger n8n workflow for complex processing
      await n8nIntegration.executeOrderProcessingWorkflow(order);

      await this.logTrigger('order', event, order.id, 'success');
    } catch (error) {
      await this.logTrigger('order', event, order.id, 'failed', error.message);
    }
  }

  async triggerInventoryAutomation(product, event) {
    try {
      if (event === 'low_stock') {
        await zapierIntegration.triggerLowStockAlert(product);
      }

      await n8nIntegration.executeInventoryManagementWorkflow({
        products: [product],
        actions: [event]
      });

      await this.logTrigger('inventory', event, product.id, 'success');
    } catch (error) {
      await this.logTrigger('inventory', event, product.id, 'failed', error.message);
    }
  }

  async logTrigger(type, event, entityId, status, error = null) {
    await query(`
      INSERT INTO automation_trigger_logs (type, event, entity_id, status, error_message, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [type, event, entityId, status, error]);
  }
}

export const automationTriggerSystem = new AutomationTriggerSystem();
