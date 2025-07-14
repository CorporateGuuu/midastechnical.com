import { query } from '../db';

export class CommunicationMonitoringService {
  async getDeliveryStats(timeframe = '24h') {
    try {
      const timeCondition = timeframe === '24h' ?
        "created_at > NOW() - INTERVAL '24 hours'" :
        "created_at > NOW() - INTERVAL '7 days'";

      const smsStats = await query(`
        SELECT status, COUNT(*) as count
        FROM sms_deliveries
        WHERE ${timeCondition}
        GROUP BY status
      `);

      const telegramStats = await query(`
        SELECT action, status, COUNT(*) as count
        FROM telegram_bot_interactions
        WHERE ${timeCondition}
        GROUP BY action, status
      `);

      return {
        sms: smsStats.rows,
        telegram: telegramStats.rows,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get delivery stats:', error);
      return { error: error.message };
    }
  }

  async generateCommunicationReport() {
    const stats = await this.getDeliveryStats('24h');

    return {
      summary: {
        totalSmsMessages: stats.sms?.reduce((sum, s) => sum + parseInt(s.count), 0) || 0,
        totalTelegramInteractions: stats.telegram?.reduce((sum, s) => sum + parseInt(s.count), 0) || 0,
        deliverySuccessRate: this.calculateSuccessRate(stats)
      },
      details: stats
    };
  }

  calculateSuccessRate(stats) {
    const totalSms = stats.sms?.reduce((sum, s) => sum + parseInt(s.count), 0) || 0;
    const successfulSms = stats.sms?.filter(s => s.status === 'delivered').reduce((sum, s) => sum + parseInt(s.count), 0) || 0;

    return totalSms > 0 ? (successfulSms / totalSms) * 100 : 0;
  }
}

export const communicationMonitoringService = new CommunicationMonitoringService();
