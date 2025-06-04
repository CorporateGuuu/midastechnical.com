/**
 * Production Middleware for midastechnical.com
 * Handles security, rate limiting, and performance optimizations
 */

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();

// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

// Protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/dashboard',
  '/account',
  '/orders',
  '/wishlist',
  '/api/admin',
  '/api/user'
];

// API routes that need rate limiting
const rateLimitedRoutes = [
  '/api/auth',
  '/api/contact',
  '/api/newsletter',
  '/api/reviews',
  '/api/search'
];

// Cache durations for different asset types
const CACHE_DURATIONS = {
  images: 60 * 60 * 24 * 30, // 30 days
  fonts: 60 * 60 * 24 * 365, // 1 year
  css: 60 * 60 * 24 * 7, // 7 days
  js: 60 * 60 * 24 * 7, // 7 days
  default: 60 * 60 * 24, // 1 day
};

function getRateLimitKey(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip;
  return `rate_limit:${ip}`;
}

function isRateLimited(key) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  rateLimitStore.set(key, validRequests);
  
  // Check if limit exceeded
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitStore.set(key, validRequests);
  
  return false;
}

function isProtectedRoute(pathname) {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

function needsRateLimit(pathname) {
  return rateLimitedRoutes.some(route => pathname.startsWith(route));
}

function getAssetType(path) {
  if (/\.(jpe?g|png|gif|svg|webp|avif)$/i.test(path)) {
    return 'images';
  }
  if (/\.(woff2?|eot|ttf|otf)$/i.test(path)) {
    return 'fonts';
  }
  if (/\.css$/i.test(path)) {
    return 'css';
  }
  if (/\.js$/i.test(path)) {
    return 'js';
  }
  return 'default';
}

function addSecurityHeaders(response) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CSP header based on environment
  if (process.env.NODE_ENV === 'production') {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://vitals.vercel-insights.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
  }
  
  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // Handle static assets with caching
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/assets/') ||
    /\.(jpe?g|png|gif|svg|webp|avif|woff2?|eot|ttf|otf|css|js)$/i.test(pathname)
  ) {
    const assetType = getAssetType(pathname);
    const maxAge = CACHE_DURATIONS[assetType];
    
    const response = NextResponse.next();
    
    // Set caching headers
    response.headers.set(
      'Cache-Control',
      `public, max-age=${maxAge}, stale-while-revalidate=${Math.floor(maxAge * 0.5)}`
    );
    
    // Add Vary header for proper caching
    response.headers.set('Vary', 'Accept-Encoding');
    
    // Add basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    return response;
  }
  
  // Create response
  let response = NextResponse.next();
  
  // Add security headers to all responses
  response = addSecurityHeaders(response);
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') === 'http') {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    httpsUrl.host = 'midastechnical.com';
    return NextResponse.redirect(httpsUrl.toString(), 301);
  }
  
  // Rate limiting for specific routes
  if (needsRateLimit(pathname)) {
    const rateLimitKey = getRateLimitKey(request);
    
    if (isRateLimited(rateLimitKey)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString(),
            ...Object.fromEntries(Object.entries(securityHeaders))
          }
        }
      );
    }
    
    // Add rate limit headers to successful responses
    const requests = rateLimitStore.get(rateLimitKey) || [];
    const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - requests.length);
    
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', (Date.now() + RATE_LIMIT_WINDOW).toString());
  }
  
  // Authentication check for protected routes
  if (isProtectedRoute(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (!token) {
      // Redirect to login for protected pages
      if (!pathname.startsWith('/api/')) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
      }
      
      // Return 401 for API routes
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(Object.entries(securityHeaders))
          }
        }
      );
    }
    
    // Check admin access for admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (token.role !== 'admin') {
        return new NextResponse(
          JSON.stringify({
            error: 'Forbidden',
            message: 'Admin access required'
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(Object.entries(securityHeaders))
            }
          }
        );
      }
    }
  }
  
  // Bot detection and blocking
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousBots = ['scrapy', 'crawler', 'spider', 'scraper'];
  
  const isSuspiciousBot = suspiciousBots.some(bot => 
    userAgent.toLowerCase().includes(bot)
  );
  
  if (isSuspiciousBot) {
    // Allow legitimate bots but block suspicious ones
    const allowedBots = ['googlebot', 'bingbot', 'facebookexternalhit', 'twitterbot'];
    const isAllowedBot = allowedBots.some(bot => 
      userAgent.toLowerCase().includes(bot)
    );
    
    if (!isAllowedBot) {
      return new NextResponse('Access Denied', {
        status: 403,
        headers: securityHeaders
      });
    }
  }
  
  // Add performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Powered-By', 'Midas Technical Solutions');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
