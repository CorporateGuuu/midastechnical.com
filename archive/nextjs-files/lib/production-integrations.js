/**
 * Production Integrations Configuration
 * Handles all third-party service integrations for production environment
 */

// Stripe Payment Processing (Production)
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  apiVersion: '2023-10-16',
  currency: 'usd',
  paymentMethods: ['card', 'apple_pay', 'google_pay'],
  captureMethod: 'automatic',
  confirmationMethod: 'automatic'
};

// SendGrid Email Service (Production)
export const emailConfig = {
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.EMAIL_FROM || 'noreply@midastechnical.com',
  fromName: process.env.EMAIL_FROM_NAME || 'Midas Technical Solutions',
  templates: {
    orderConfirmation: process.env.EMAIL_TEMPLATE_ORDER_CONFIRMATION,
    shippingNotification: process.env.EMAIL_TEMPLATE_SHIPPING_NOTIFICATION,
    passwordReset: process.env.EMAIL_TEMPLATE_PASSWORD_RESET,
    welcome: process.env.EMAIL_TEMPLATE_WELCOME
  },
  categories: ['transactional', 'marketing', 'system'],
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true },
    subscriptionTracking: { enable: false }
  }
};

// Cloudinary CDN (Production)
export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  folders: {
    products: 'midastechnical/products',
    categories: 'midastechnical/categories',
    blog: 'midastechnical/blog',
    assets: 'midastechnical/assets'
  },
  transformations: {
    thumbnail: { width: 300, height: 300, crop: 'fill', quality: 'auto', format: 'webp' },
    medium: { width: 600, height: 600, crop: 'fill', quality: 'auto', format: 'webp' },
    large: { width: 1200, height: 1200, crop: 'fill', quality: 'auto', format: 'webp' },
    hero: { width: 1920, height: 1080, crop: 'fill', quality: 'auto', format: 'webp' }
  }
};

// Google Analytics & Tag Manager (Production)
export const analyticsConfig = {
  gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  events: {
    pageView: 'page_view',
    purchase: 'purchase',
    addToCart: 'add_to_cart',
    removeFromCart: 'remove_from_cart',
    beginCheckout: 'begin_checkout',
    viewItem: 'view_item',
    search: 'search',
    signUp: 'sign_up',
    login: 'login'
  },
  ecommerce: {
    currency: 'USD',
    trackPurchases: true,
    trackCartActions: true,
    trackProductViews: true
  }
};

// Sentry Error Tracking (Production)
export const sentryConfig = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  beforeSend: (event) => {
    // Filter out sensitive information
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    return event;
  },
  integrations: [
    'BrowserTracing',
    'Replay'
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
};

// Notion CMS Integration (Production)
export const notionConfig = {
  apiKey: process.env.NOTION_API_KEY,
  databases: {
    products: process.env.NOTION_PRODUCTS_DATABASE_ID,
    orders: process.env.NOTION_ORDERS_DATABASE_ID,
    customers: process.env.NOTION_CUSTOMERS_DATABASE_ID,
    content: process.env.NOTION_CONTENT_DATABASE_ID,
    inventory: process.env.NOTION_INVENTORY_DATABASE_ID
  },
  syncInterval: 300000, // 5 minutes
  retryAttempts: 3,
  timeout: 10000
};

// Twilio SMS Service (Production)
export const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  services: {
    orderNotifications: true,
    shippingUpdates: true,
    securityAlerts: true,
    marketingMessages: false
  }
};

// Redis Cache Configuration (Production)
export const redisConfig = {
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT || 6379,
  db: 0,
  keyPrefix: 'midastechnical:',
  ttl: {
    session: 86400, // 24 hours
    product: 3600,  // 1 hour
    category: 7200, // 2 hours
    search: 1800,   // 30 minutes
    cart: 86400     // 24 hours
  },
  maxRetries: 3,
  retryDelayOnFailover: 100
};

// AWS S3 Backup Configuration (Production)
export const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  buckets: {
    backups: process.env.AWS_S3_BACKUP_BUCKET,
    assets: process.env.AWS_S3_ASSETS_BUCKET
  },
  backup: {
    schedule: '0 2 * * *', // Daily at 2 AM
    retention: 30, // Keep backups for 30 days
    compression: true,
    encryption: true
  }
};

// Rate Limiting Configuration (Production)
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: 'Retry after 15 minutes'
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
};

// CORS Configuration (Production)
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'https://midastechnical.com',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// Security Configuration (Production)
export const securityConfig = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://js.stripe.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "blob:"
        ],
        connectSrc: [
          "'self'",
          "https://api.stripe.com",
          "https://www.google-analytics.com",
          "https://vitals.vercel-insights.com"
        ],
        frameSrc: [
          "https://js.stripe.com",
          "https://hooks.stripe.com"
        ]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  session: {
    secret: process.env.NEXTAUTH_SECRET,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 86400000 // 24 hours
  }
};

// Monitoring Configuration (Production)
export const monitoringConfig = {
  healthCheck: {
    endpoint: '/api/health',
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    checks: [
      'database',
      'redis',
      'external_apis'
    ]
  },
  alerts: {
    email: process.env.ALERT_EMAIL || 'admin@midastechnical.com',
    slack: process.env.SLACK_WEBHOOK_URL,
    thresholds: {
      errorRate: 0.05,    // 5%
      responseTime: 2000, // 2 seconds
      uptime: 0.99        // 99%
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    format: process.env.LOG_FORMAT || 'json',
    destination: process.env.LOG_DESTINATION || 'file',
    filePath: process.env.LOG_FILE_PATH || '/var/log/midastechnical/app.log'
  }
};

// Feature Flags (Production)
export const featureFlags = {
  cryptoPayments: process.env.FEATURE_CRYPTO_PAYMENTS === 'true',
  liveChat: process.env.FEATURE_LIVE_CHAT === 'true',
  productReviews: process.env.FEATURE_PRODUCT_REVIEWS === 'true',
  wishlist: process.env.FEATURE_WISHLIST === 'true',
  compareProducts: process.env.FEATURE_COMPARE_PRODUCTS === 'true',
  bulkOrders: process.env.FEATURE_BULK_ORDERS === 'true',
  loyaltyProgram: process.env.FEATURE_LOYALTY_PROGRAM === 'true'
};

// Export all configurations
export const productionConfig = {
  stripe: stripeConfig,
  email: emailConfig,
  cloudinary: cloudinaryConfig,
  analytics: analyticsConfig,
  sentry: sentryConfig,
  notion: notionConfig,
  twilio: twilioConfig,
  redis: redisConfig,
  aws: awsConfig,
  rateLimit: rateLimitConfig,
  cors: corsConfig,
  security: securityConfig,
  monitoring: monitoringConfig,
  features: featureFlags
};

export default productionConfig;
