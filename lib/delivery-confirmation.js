import { query } from '../db';

export class DeliveryConfirmationService {
  async confirmSmsDelivery(messageSid, status) {
    try {
      await query(`
        UPDATE sms_deliveries
        SET status = $1, confirmed_at = NOW()
        WHERE message_sid = $2
      `, [status, messageSid]);

      return { success: true };
    } catch (error) {
      console.error('Failed to confirm SMS delivery:', error);
      return { success: false, error: error.message };
    }
  }

  async confirmTelegramDelivery(chatId, messageId, status) {
    try {
      await query(`
        UPDATE telegram_messages
        SET delivery_status = $1, confirmed_at = NOW()
        WHERE chat_id = $2 AND message_id = $3
      `, [status, chatId, messageId]);

      return { success: true };
    } catch (error) {
      console.error('Failed to confirm Telegram delivery:', error);
      return { success: false, error: error.message };
    }
  }
}

export const deliveryConfirmationService = new DeliveryConfirmationService();
