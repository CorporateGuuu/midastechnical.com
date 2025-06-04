import { query } from '../db';

export class AutomationNotificationSystem {
  constructor() {
    this.channels = ['email', 'slack', 'webhook'];
  }

  async sendAutomationNotification(type, data) {
    try {
      const notifications = await this.getNotificationConfig(type);

      for (const notification of notifications) {
        await this.sendNotification(notification.channel, data);
      }
    } catch (error) {
      console.error('Failed to send automation notification:', error);
    }
  }

  async sendNotification(channel, data) {
    switch (channel) {
      case 'email':
        await this.sendEmailNotification(data);
        break;
      case 'slack':
        await this.sendSlackNotification(data);
        break;
      case 'webhook':
        await this.sendWebhookNotification(data);
        break;
    }
  }

  async getNotificationConfig(type) {
    const result = await query('SELECT * FROM notification_configs WHERE type = $1', [type]);
    return result.rows;
  }
}

export const automationNotificationSystem = new AutomationNotificationSystem();
