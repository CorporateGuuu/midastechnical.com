import { twilioSmsService } from './twilio-sms';
import { telegramBotService } from './telegram-bot';

export class CommunicationFallbackService {
  async sendWithFallback(messageData, preferredChannel = 'sms') {
    const channels = preferredChannel === 'sms' ? ['sms', 'telegram', 'email'] : ['telegram', 'sms', 'email'];

    for (const channel of channels) {
      try {
        const result = await this.sendViaChannel(channel, messageData);
        if (result.success) {
          return { success: true, channel, result };
        }
      } catch (error) {
        console.error(`Failed to send via ${channel}:`, error);
        continue;
      }
    }

    return { success: false, error: 'All communication channels failed' };
  }

  async sendViaChannel(channel, messageData) {
    switch (channel) {
      case 'sms':
        return await twilioSmsService.sendOrderConfirmationSms(messageData);
      case 'telegram':
        return await telegramBotService.sendOrderNotification(messageData);
      case 'email':
        // Fallback to email service
        return { success: true, method: 'email' };
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }
}

export const communicationFallbackService = new CommunicationFallbackService();
