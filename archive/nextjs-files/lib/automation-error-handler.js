import { query } from '../db';

export class AutomationErrorHandler {
  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2
    };
  }

  async handleAutomationError(error, context) {
    try {
      // Log error
      await this.logError(error, context);

      // Determine if error is retryable
      if (this.isRetryableError(error)) {
        await this.scheduleRetry(context);
      } else {
        await this.sendErrorAlert(error, context);
      }
    } catch (handlingError) {
      console.error('Error handling failed:', handlingError);
    }
  }

  isRetryableError(error) {
    const retryableErrors = ['timeout', 'network', 'rate_limit', 'temporary'];
    return retryableErrors.some(type => error.message.toLowerCase().includes(type));
  }

  async scheduleRetry(context) {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, context.retryCount || 0),
      this.retryConfig.maxDelay
    );

    setTimeout(async () => {
      await this.retryAutomation(context);
    }, delay);
  }

  async logError(error, context) {
    await query(`
      INSERT INTO automation_errors (
        workflow_type, entity_id, error_message, context, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [context.workflowType, context.entityId, error.message, JSON.stringify(context)]);
  }

  async sendErrorAlert(error, context) {
    // Send alert to administrators
    console.error(`Automation error: ${error.message}`, context);
  }
}

export const automationErrorHandler = new AutomationErrorHandler();
