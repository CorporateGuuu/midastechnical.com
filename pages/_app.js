import React from 'react';
// Import critical CSS component and utilities
import CriticalCss from '../components/CriticalCss';
import { getCriticalCssByPage, getPreloadStylesByPage, getDeferredStylesByPage } from '../utils/criticalCss';
// Import CSS files dynamically to allow for optimization
import dynamic from 'next/dynamic';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Import global CSS files
import '../public/css/global.css';
import '../public/css/components.css';
import '../public/css/home.css';
import '../public/css/animations.css';
import '../public/css/fixes.css';
import '../public/css/product-detail.css';
import '../public/css/responsive.css';

// Google Fonts will be loaded in Head
import MiniCart from '../components/MiniCart/MiniCart';
import SearchAutocomplete from '../components/SearchAutocomplete/SearchAutocomplete';
import MobileMenu from '../components/MobileMenu/MobileMenu';
import ThemeProvider from '../components/Theme/ThemeProvider';

// Import UnifiedHeader component
import UnifiedHeader from '../components/UnifiedHeader/UnifiedHeader';

// Import security components
const SecurityBanner = dynamic(
  () => import('../components/Security/SecurityBanner'),
  { ssr: false }
);

// Import WhatsApp button
const WhatsAppButton = dynamic(
  () => import('../components/WhatsApp/WhatsAppButton'),
  { ssr: false }
);

// Import NotificationCenter
const NotificationCenter = dynamic(
  () => import('../components/Notifications/NotificationCenter'),
  { ssr: false }
);

// Import Apple Banner
const AppleBanner = dynamic(
  () => import('../components/Banner/AppleBanner'),
  { ssr: false }
);

// Import UnifiedFooter
const UnifiedFooter = dynamic(
  () => import('../components/UnifiedFooter/UnifiedFooter'),
  { ssr: false }
);

// Ensure we have a fallback for Netlify
const UnifiedFooterFallback = UnifiedFooter;

// Import fix for hidden element
const FixHiddenElement = dynamic(
  () => import('../components/FixHiddenElement'),
  { ssr: false }
);

// Dynamically import PWAManager with no SSR
const PWAManager = dynamic(
  () => import('../components/PWA/PWAManager'),
  { ssr: false }
);

// Dynamically import accessibility components with no SSR
const AccessibilityMenu = dynamic(
  () => import('../components/Accessibility/AccessibilityMenu'),
  { ssr: false }
);

const SkipNavigation = dynamic(
  () => import('../components/Accessibility/SkipNavigation'),
  { ssr: false }
);

const KeyboardShortcuts = dynamic(
  () => import('../components/Accessibility/KeyboardShortcuts'),
  { ssr: false }
);

// Dynamically import ChatbotUI with no SSR
const ChatbotUI = dynamic(
  () => import('../components/Chatbot/ChatbotUI'),
  { ssr: false }
);

function AppContent({ Component, pageProps }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoading = status === 'loading';
  const isAuthenticated = !!session;

  // Determine page type for critical CSS
  const getPageType = () => {
    const { pathname } = router;
    if (pathname === '/') return 'home';
    if (pathname === '/products') return 'products';
    if (pathname.startsWith('/products/') && pathname !== '/products') return 'product-detail';
    return 'default';
  };

  // Close menus when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setShowUserMenu(false);
      setMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }

      if (mobileMenuOpen && !event.target.closest('.mobile-menu') &&
        !event.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu, mobileMenuOpen]);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    signOut({ callbackUrl: '/' });
  };

  // Check if we're on the landing page, LCD Buyback page, or other pages that need a clean look
  const isLandingPage = router.pathname === '/';
  const isLcdBuybackPage = router.pathname === '/lcd-buyback';
  const isGappPage = router.pathname === '/gapp';
  const isAuthPage = router.pathname.startsWith('/auth/');
  const isCartPage = router.pathname === '/cart';
  const isAccountPage = router.pathname === '/account' || router.pathname.startsWith('/account/');
  const isCategoriesPage = router.pathname === '/categories';
  const isProductsPage = router.pathname === '/products';
  const isWholesalePage = router.pathname === '/wholesale';

  // Pages that should have a clean look without navigation
  const isProductDetailPage = router.pathname.startsWith('/products/') && router.pathname !== '/products';
  const shouldHideNavigation = isAuthPage || isCartPage || isCategoriesPage || isProductsPage || isProductDetailPage || isAccountPage;

  // Get the current page type
  const pageType = getPageType();

  // Get critical CSS and styles for the current page
  const criticalCss = getCriticalCssByPage(pageType);
  const preloadStyles = getPreloadStylesByPage(pageType);
  const deferredStyles = getDeferredStylesByPage(pageType);

  return (
    <div className="app-wrapper">
      {/* Critical CSS for performance optimization */}
      <CriticalCss
        id={`critical-css-${pageType}`}
        criticalStyles={criticalCss}
        preloadStyles={preloadStyles}
        deferredStyles={deferredStyles}
      />

      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0066cc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MDTS" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Add preload for critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </Head>

      {/* Cloudflare Security Banner */}
      <SecurityBanner />

      {/* PWA Manager - Only rendered client-side */}
      <PWAManager />

      {/* Accessibility components - Only rendered client-side */}
      <SkipNavigation />
      <AccessibilityMenu />
      <KeyboardShortcuts />
      <ChatbotUI />
      <WhatsAppButton />
      <NotificationCenter />
      <FixHiddenElement />

      {/* Removed redundant header */}

      <main id="main-content" className={isLandingPage || isLcdBuybackPage || isGappPage || isCartPage || isAccountPage ? "" : "main"} tabIndex="-1">
        <Component {...pageProps} />
      </main>

      {/* Apple Banner */}
      <AppleBanner />

      {/* Footer - Only render for pages that don't use the Layout component */}
      {/* Footer is now included in the Layout component for all pages */}
    </div>
  );
}

// Fix for NextAuth.js in development mode
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // Browser should use relative URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use Vercel URL
  return `http://localhost:${process.env.PORT || 3002}`; // Dev SSR should use localhost
};

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider
      session={session}
      basePath={getBaseUrl() + '/api/auth'}
    >
      <ThemeProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
