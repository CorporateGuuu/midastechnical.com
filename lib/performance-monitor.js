import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    // Core Web Vitals
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));

    // Custom performance metrics
    this.monitorPageLoadTime();
    this.monitorAPIResponseTimes();
    this.monitorImageLoadTimes();
  }

  handleMetric(metric) {
    this.metrics[metric.name] = metric.value;

    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Send to Sentry for performance monitoring
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'performance',
        message: `${metric.name}: ${metric.value}`,
        level: 'info',
      });
    }

    // Log performance issues
    if (this.isPerformanceIssue(metric)) {
      console.warn(`Performance issue detected: ${metric.name} = ${metric.value}`);
      this.reportPerformanceIssue(metric);
    }
  }

  isPerformanceIssue(metric) {
    const thresholds = {
      CLS: 0.1,
      FID: 100,
      FCP: 1800,
      LCP: 2500,
      TTFB: 600,
    };

    return metric.value > (thresholds[metric.name] || Infinity);
  }

  reportPerformanceIssue(metric) {
    // Report to monitoring service
    fetch('/api/monitoring/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error);
  }

  monitorPageLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.handleMetric({ name: 'PageLoadTime', value: loadTime });
    });
  }

  monitorAPIResponseTimes() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;

        if (args[0].includes('/api/')) {
          this.handleMetric({
            name: 'APIResponseTime',
            value: duration,
            endpoint: args[0]
          });
        }

        return response;
      } catch (error) {
        const duration = performance.now() - start;
        this.handleMetric({
          name: 'APIErrorTime',
          value: duration,
          endpoint: args[0]
        });
        throw error;
      }
    };
  }

  monitorImageLoadTimes() {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      const start = performance.now();
      img.addEventListener('load', () => {
        const duration = performance.now() - start;
        this.handleMetric({ name: 'ImageLoadTime', value: duration });
      });
    });
  }

  getMetrics() {
    return this.metrics;
  }
}

export default PerformanceMonitor;
