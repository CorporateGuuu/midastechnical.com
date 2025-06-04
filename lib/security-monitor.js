class SecurityMonitor {
  constructor() {
    this.suspiciousActivities = [];
    this.rateLimitViolations = [];
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    this.monitorFailedLogins();
    this.monitorSuspiciousRequests();
    this.monitorCSPViolations();
    this.monitorXSSAttempts();
  }

  monitorFailedLogins() {
    // Track failed login attempts
    document.addEventListener('loginFailed', (event) => {
      this.reportSecurityEvent({
        type: 'failed_login',
        ip: event.detail.ip,
        timestamp: Date.now(),
        attempts: event.detail.attempts,
      });
    });
  }

  monitorSuspiciousRequests() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};

      // Check for suspicious patterns
      if (this.isSuspiciousRequest(url, options)) {
        this.reportSecurityEvent({
          type: 'suspicious_request',
          url: url,
          method: options.method || 'GET',
          timestamp: Date.now(),
        });
      }

      return originalFetch(...args);
    };
  }

  monitorCSPViolations() {
    document.addEventListener('securitypolicyviolation', (event) => {
      this.reportSecurityEvent({
        type: 'csp_violation',
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        timestamp: Date.now(),
      });
    });
  }

  monitorXSSAttempts() {
    // Monitor for potential XSS attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const scripts = node.querySelectorAll('script');
              scripts.forEach((script) => {
                if (this.isSuspiciousScript(script)) {
                  this.reportSecurityEvent({
                    type: 'potential_xss',
                    scriptContent: script.innerHTML.substring(0, 100),
                    timestamp: Date.now(),
                  });
                }
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  isSuspiciousRequest(url, options) {
    const suspiciousPatterns = [
      /\.\.\//, // Path traversal
      /<script/i, // Script injection
      /union.*select/i, // SQL injection
      /javascript:/i, // JavaScript protocol
    ];

    const requestString = url + JSON.stringify(options);
    return suspiciousPatterns.some(pattern => pattern.test(requestString));
  }

  isSuspiciousScript(script) {
    const suspiciousPatterns = [
      /eval\(/,
      /document\.write/,
      /innerHTML.*<script/,
      /fromCharCode/,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(script.innerHTML));
  }

  reportSecurityEvent(event) {
    // Send to security monitoring endpoint
    fetch('/api/monitoring/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(console.error);

    // Log to Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'security',
        message: `Security event: ${event.type}`,
        level: 'warning',
        data: event,
      });
    }

    console.warn('Security event detected:', event);
  }
}

export default SecurityMonitor;
