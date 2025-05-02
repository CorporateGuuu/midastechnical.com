import React from 'react';
import '../styles/globals.css';
import '../public/css/api-styles.css';
import '../public/css/product-detail.css';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MiniCart from '../components/MiniCart/MiniCart';
import SearchAutocomplete from '../components/SearchAutocomplete/SearchAutocomplete';
import MobileMenu from '../components/MobileMenu/MobileMenu';
import dynamic from 'next/dynamic';

// Import navigation component
import { MainNavigation } from '../components/Navigation';
import Footer from '../components/Footer/Footer';

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

// Import Apple Banner
const AppleBanner = dynamic(
  () => import('../components/Banner/AppleBanner'),
  { ssr: false }
);

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
  const isAuthPage = router.pathname.startsWith('/auth/');
  const isCartPage = router.pathname === '/cart';
  const isCategoriesPage = router.pathname === '/categories';
  const isProductsPage = router.pathname === '/products';
  const isWholesalePage = router.pathname === '/wholesale';

  // Pages that should have a clean look without navigation
  const isProductDetailPage = router.pathname.startsWith('/products/') && router.pathname !== '/products';
  const shouldHideNavigation = isAuthPage || isCartPage || isCategoriesPage || isProductsPage || isProductDetailPage;

  return (
    <div className="app-wrapper">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0066cc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MDTS" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>

      {/* Cloudflare Security Banner */}
      <SecurityBanner />

      {/* Main Navigation */}
      <MainNavigation />

      {/* PWA Manager - Only rendered client-side */}
      <PWAManager />

      {/* Accessibility components - Only rendered client-side */}
      <SkipNavigation />
      <AccessibilityMenu />
      <KeyboardShortcuts />
      <ChatbotUI />
      <WhatsAppButton />
      <FixHiddenElement />

      {!isLandingPage && !isLcdBuybackPage && (
        <header className="header">
          <div className="container header-content">
            <div className="header-left">
              <Link href="/" className="logo">
                Midas Technical Solutions
              </Link>

              {!shouldHideNavigation && (
                <button
                  className="mobile-menu-button md:hidden"
                  onClick={toggleMobileMenu}
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {mobileMenuOpen ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </>
                    ) : (
                      <>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </>
                    )}
                  </svg>
                </button>
              )}
            </div>

            {!isWholesalePage && (
              <div className="search-form hidden md:flex">
                <SearchAutocomplete />
              </div>
            )}

            {!shouldHideNavigation && (
              <nav className={`nav-links desktop-nav hidden md:flex`}>
                <Link href="/products">Products</Link>
                <Link href="/categories">Categories</Link>
                <Link href="/lcd-buyback">LCD Buyback</Link>
                <MiniCart />

                {isLoading ? (
                  <span className="auth-loading">Loading...</span>
                ) : isAuthenticated ? (
                  <div className="user-menu-container">
                    <button
                      className="user-menu-button"
                      onClick={toggleUserMenu}
                      aria-expanded={showUserMenu}
                    >
                      {session.user.name || session.user.email}
                    </button>

                    {showUserMenu && (
                      <div className="user-menu">
                        <Link href="/user/profile" className="user-menu-item">
                          Profile
                        </Link>
                        <Link href="/user/orders" className="user-menu-item">
                          Orders
                        </Link>
                        {session.user.isAdmin && (
                          <Link href="/admin" className="user-menu-item">
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          className="user-menu-item sign-out-button"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/auth/signin" className="auth-link-button">
                    Sign In
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Mobile menu */}
          <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </header>
      )}

      <main id="main-content" className={isLandingPage || isLcdBuybackPage ? "" : "main"} tabIndex="-1">
        <Component {...pageProps} />
      </main>

      <Footer />

      {/* Apple Banner */}
      <AppleBanner />
    </div>
  );
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
