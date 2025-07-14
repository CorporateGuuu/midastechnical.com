import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  beforeSend(event) {
    // Filter out sensitive information
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
      delete event.request.headers['x-api-key'];
    }

    // Filter out known non-critical errors
    if (event.exception?.values?.[0]?.value?.includes('Non-Error promise rejection')) {
      return null;
    }

    return event;
  },

  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'midastechnical.com'],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Performance monitoring
  enableTracing: true,

  // Custom tags
  initialScope: {
    tags: {
      component: 'midastechnical-frontend',
      version: process.env.npm_package_version || '1.0.0',
    },
  },
});

export default Sentry;
