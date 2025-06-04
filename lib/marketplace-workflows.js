import { productSyncService } from './product-sync-service';
import { inventoryManagementService } from './inventory-management';
import { orderFulfillmentService } from './order-fulfillment';
import { statusSyncService } from './status-sync';

export class MarketplaceWorkflowOrchestrator {
  constructor() {
    this.workflows = {
      productSync: { enabled: true, interval: 300000 }, // 5 minutes
      inventorySync: { enabled: true, interval: 60000 }, // 1 minute
      orderProcessing: { enabled: true, interval: 120000 }, // 2 minutes
      statusSync: { enabled: true, interval: 300000 } // 5 minutes
    };
  }

  async startAllWorkflows() {
    console.log('⚙️ Starting all marketplace workflows...');

    try {
      // Start product synchronization
      if (this.workflows.productSync.enabled) {
        await productSyncService.startProductSync();
      }

      // Start inventory synchronization
      if (this.workflows.inventorySync.enabled) {
        setInterval(async () => {
          await inventoryManagementService.syncInventoryFromMarketplace();
        }, this.workflows.inventorySync.interval);
      }

      // Start order processing
      if (this.workflows.orderProcessing.enabled) {
        setInterval(async () => {
          await orderFulfillmentService.processMarketplaceOrders();
        }, this.workflows.orderProcessing.interval);
      }

      // Start status synchronization
      if (this.workflows.statusSync.enabled) {
        await statusSyncService.startStatusSync();
      }

      console.log('✅ All marketplace workflows started successfully');

    } catch (error) {
      console.error('Failed to start marketplace workflows:', error);
      throw error;
    }
  }

  getWorkflowStatus() {
    return {
      productSync: productSyncService.getSyncStatus(),
      workflows: this.workflows,
      lastUpdate: new Date().toISOString()
    };
  }
}

export const workflowOrchestrator = new MarketplaceWorkflowOrchestrator();
