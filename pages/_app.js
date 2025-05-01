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
  const isComparePage = router.pathname === '/compare';

  // Pages that should have a clean look without navigation
  const isProductDetailPage = router.pathname.startsWith('/products/') && router.pathname !== '/products';
  const shouldHideNavigation = isAuthPage || isCartPage || isCategoriesPage || isProductsPage || isProductDetailPage;

  return (
    <div className="app-wrapper">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

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

            <div className="search-form hidden md:flex">
              <SearchAutocomplete />
            </div>

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

      <main className={isLandingPage || isLcdBuybackPage ? "" : "main"}>
        <Component {...pageProps} />
      </main>

      {!isLandingPage && !isLcdBuybackPage && (
        <footer className={`footer ${isProductsPage || isCartPage || isAuthPage || isCategoriesPage || router.pathname.startsWith('/products/') || isComparePage ? 'clean-footer' : ''}`}>
          <div className="container">
            {isProductsPage || isCartPage || isAuthPage || isCategoriesPage || router.pathname.startsWith('/products/') || isComparePage ? (
              // Clean footer for products, cart, auth pages and product detail pages
              <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Midas Technical Solutions. All rights reserved.
              </div>
            ) : (
              // Full footer for other pages
              <>
                <div className="footer-content">
                  <div className="footer-section">
                    <h3>Midas Technical Solutions</h3>
                    <p>Your trusted partner for professional repair parts & tools.</p>
                  </div>

                  <div className="footer-section">
                    <h3>Quick Links</h3>
                    <nav className="footer-nav">
                      <Link href="/products">Products</Link> {' '}
                      <Link href="/categories">Categories</Link> {' '}
                      <Link href="/lcd-buyback">LCD Buyback</Link> {' '}
                      <Link href="/cart">Cart</Link> {' '}
                      <Link href="/auth/signin">Sign In</Link>
                    </nav>
                  </div>

                  <div className="footer-section">
                    <h3>Contact</h3>
                    <p>Email: support@mdtstech.store</p>
                    <p>Phone: +1 (240) 351-0511</p>
                  </div>
                </div>

                <div className="footer-bottom">
                  &copy; {new Date().getFullYear()} Midas Technical Solutions. All rights reserved.
                </div>
              </>
            )}
          </div>
        </footer>
      )}
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
