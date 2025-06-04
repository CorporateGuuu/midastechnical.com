class AlertingSystem {
  constructor() {
    this.alertRules = {
      errorRate: { threshold: 0.05, window: '5m' },
      responseTime: { threshold: 2000, window: '1m' },
      uptime: { threshold: 0.999, window: '1h' },
      lowStock: { threshold: 5, window: 'immediate' },
      highTraffic: { threshold: 1000, window: '1m' },
      securityIncident: { threshold: 1, window: 'immediate' },
    };

    this.alertChannels = {
      email: process.env.ALERT_EMAIL || 'admin@midastechnical.com',
      slack: process.env.SLACK_WEBHOOK_URL,
      sms: process.env.TWILIO_PHONE_NUMBER,
    };

    this.initializeAlerting();
  }

  initializeAlerting() {
    this.monitorErrorRate();
    this.monitorResponseTime();
    this.monitorUptime();
    this.monitorInventory();
    this.monitorSecurity();
  }

  async sendAlert(alertType, message, severity = 'warning') {
    const alert = {
      type: alertType,
      message: message,
      severity: severity,
      timestamp: new Date().toISOString(),
      platform: 'midastechnical.com',
    };

    console.log(`🚨 ALERT [${severity.toUpperCase()}]: ${message}`);

    // Send to all configured channels
    await Promise.all([
      this.sendEmailAlert(alert),
      this.sendSlackAlert(alert),
      this.sendSMSAlert(alert),
    ]);

    // Log to monitoring system
    await this.logAlert(alert);
  }

  async sendEmailAlert(alert) {
    if (!this.alertChannels.email) return;

    try {
      await fetch('/api/alerts/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.alertChannels.email,
          subject: `[ALERT] ${alert.type} - midastechnical.com`,
          html: `
            <h2>🚨 Production Alert</h2>
            <p><strong>Type:</strong> ${alert.type}</p>
            <p><strong>Severity:</strong> ${alert.severity}</p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Time:</strong> ${alert.timestamp}</p>
            <p><strong>Platform:</strong> ${alert.platform}</p>

            <hr>
            <p><small>This is an automated alert from the midastechnical.com monitoring system.</small></p>
          `,
        }),
      });
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  async sendSlackAlert(alert) {
    if (!this.alertChannels.slack) return;

    const color = {
      critical: '#FF0000',
      warning: '#FFA500',
      info: '#0000FF',
    }[alert.severity] || '#808080';

    try {
      await fetch(this.alertChannels.slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [{
            color: color,
            title: `🚨 ${alert.type} Alert`,
            text: alert.message,
            fields: [
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Platform', value: alert.platform, short: true },
              { title: 'Time', value: alert.timestamp, short: false },
            ],
          }],
        }),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  async sendSMSAlert(alert) {
    if (!this.alertChannels.sms || alert.severity !== 'critical') return;

    try {
      await fetch('/api/alerts/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.alertChannels.sms,
          message: `CRITICAL ALERT: ${alert.type} - ${alert.message} at ${alert.timestamp}`,
        }),
      });
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
    }
  }

  async logAlert(alert) {
    try {
      await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to log alert:', error);
    }
  }

  monitorErrorRate() {
    let errorCount = 0;
    let requestCount = 0;

    setInterval(() => {
      const errorRate = requestCount > 0 ? errorCount / requestCount : 0;

      if (errorRate > this.alertRules.errorRate.threshold) {
        this.sendAlert(
          'high_error_rate',
          `Error rate is ${(errorRate * 100).toFixed(2)}% (threshold: ${(this.alertRules.errorRate.threshold * 100).toFixed(2)}%)`,
          'critical'
        );
      }

      // Reset counters
      errorCount = 0;
      requestCount = 0;
    }, 5 * 60 * 1000); // 5 minutes
  }

  monitorResponseTime() {
    const responseTimes = [];

    setInterval(() => {
      if (responseTimes.length === 0) return;

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      if (avgResponseTime > this.alertRules.responseTime.threshold) {
        this.sendAlert(
          'slow_response_time',
          `Average response time is ${avgResponseTime.toFixed(0)}ms (threshold: ${this.alertRules.responseTime.threshold}ms)`,
          'warning'
        );
      }

      responseTimes.length = 0;
    }, 60 * 1000); // 1 minute
  }

  monitorUptime() {
    setInterval(async () => {
      try {
        const start = Date.now();
        const response = await fetch('/api/health');
        const responseTime = Date.now() - start;

        if (!response.ok) {
          this.sendAlert(
            'service_down',
            `Health check failed with status ${response.status}`,
            'critical'
          );
        } else if (responseTime > 5000) {
          this.sendAlert(
            'service_slow',
            `Health check took ${responseTime}ms`,
            'warning'
          );
        }
      } catch (error) {
        this.sendAlert(
          'service_unreachable',
          `Health check failed: ${error.message}`,
          'critical'
        );
      }
    }, 60 * 1000); // 1 minute
  }

  monitorInventory() {
    setInterval(async () => {
      try {
        const response = await fetch('/api/inventory/low-stock');
        const lowStockItems = await response.json();

        if (lowStockItems.length > 0) {
          this.sendAlert(
            'low_stock',
            `${lowStockItems.length} items are low in stock: ${lowStockItems.map(item => item.name).join(', ')}`,
            'warning'
          );
        }
      } catch (error) {
        console.error('Failed to check inventory:', error);
      }
    }, 15 * 60 * 1000); // 15 minutes
  }

  monitorSecurity() {
    // This would be called by the security monitor
    window.addEventListener('securityIncident', (event) => {
      this.sendAlert(
        'security_incident',
        `Security incident detected: ${event.detail.type} - ${event.detail.message}`,
        'critical'
      );
    });
  }
}

export default AlertingSystem;
