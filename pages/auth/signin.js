import React, { useState, useEffect } from 'react';
import { signIn, getCsrfToken, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Turnstile, SecurityBadge, SecurityMessage } from '../../components/Security';
import { recordFailedLogin } from '../../lib/fraudPrevention';
import styles from '../../styles/AuthPages.module.css';

export default function SignIn({ csrfToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [securityMessage, setSecurityMessage] = useState(null);
  const router = useRouter();
  const { callbackUrl, error: errorParam } = router.query;

  useEffect(() => {
    // Check if user is already signed in
    async function checkSession() {
      const session = await getSession();
      if (session) {
        router.replace(callbackUrl || '/');
      } else {
        setInitialLoading(false);
      }
    }

    checkSession();

    // Set error message from URL parameter
    if (errorParam) {
      if (errorParam === 'CredentialsSignin') {
        setError('Invalid email or password');
      } else {
        setError(errorParam);
      }
    }
  }, [router, callbackUrl, errorParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSecurityMessage(null);

    // Check if Turnstile token is present
    if (!turnstileToken) {
      setError('Please complete the security check');
      setLoading(false);
      return;
    }

    try {
      // First, verify the Turnstile token
      const verifyResponse = await fetch('/api/security/verify-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: turnstileToken }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setError('Security check failed. Please try again.');
        setLoading(false);
        return;
      }

      // Proceed with sign in
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: callbackUrl || '/'
      });

      if (result.error) {
        // Record failed login attempt for fraud prevention
        // recordFailedLogin('client_ip', email);

        setError('Invalid email or password');
        setSecurityMessage({
          type: 'warning',
          message: 'Multiple failed login attempts may result in temporary account lockout.'
        });
        setLoading(false);
      } else if (result.url && result.url.includes('requiresTwoFactor=true')) {
        // Redirect to 2FA page
        router.push(`/auth/2fa${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`);
      } else {
        // Check if the callback URL is to the account page
        if (callbackUrl && callbackUrl.includes('/account')) {
          // Redirect to account page with a small delay to ensure session is properly set
          setTimeout(() => {
            router.push('/account');
          }, 500);
        } else {
          router.push(callbackUrl || '/');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: callbackUrl || '/' });
  };

  if (initialLoading) {
    return (
      <>
        <Head>
          <title>Sign In - Midas Technical Solutions</title>
          <meta name="description" content="Sign in to your Midas Technical Solutions account." />
        </Head>
        <div className={styles.mainContent}>
          <div className={styles.authForm}>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In - Midas Technical Solutions</title>
        <meta name="description" content="Sign in to your Midas Technical Solutions account." />
      </Head>



      <div className={styles.mainContent}>
        <div className={styles.authForm}>
          <h1>Sign In</h1>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {securityMessage && (
            <SecurityMessage type={securityMessage.type}>
              {securityMessage.message}
            </SecurityMessage>
          )}

          <form onSubmit={handleSubmit}>
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password">Password</label>
                <Link href="/auth/forgot-password" className="forgot-password-link">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Cloudflare Turnstile for bot protection */}
            <Turnstile
              onVerify={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken('')}
              action="signin"
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !turnstileToken}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <SecurityBadge />

          <div className="auth-separator">
            <span>OR</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="btn btn-google"
            type="button"
          >
            Sign in with Google
          </button>

          <p className="auth-link">
            Don't have an account? <Link href="/auth/register">Register</Link>
          </p>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerTop}>
            <div className={styles.footerNewsletter}>
              <h3>Subscribe to Our Newsletter</h3>
              <p>Stay updated with our latest products, promotions, and repair guides.</p>
              <form className={styles.footerForm}>
                <input type="email" placeholder="Your email address" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>

            <div>
              <h3>Our Services</h3>
              <div className={styles.footerServices}>
                <div className={styles.footerService}>
                  <div className={styles.footerServiceIcon}>🚚</div>
                  <div className={styles.footerServiceName}>Fast Shipping</div>
                  <div className={styles.footerServiceDescription}>Free shipping on orders over $1000</div>
                </div>

                <div className={styles.footerService}>
                  <div className={styles.footerServiceIcon}>🔧</div>
                  <div className={styles.footerServiceName}>Repair Guides</div>
                  <div className={styles.footerServiceDescription}>Step-by-step tutorials</div>
                </div>

                <div className={styles.footerService}>
                  <div className={styles.footerServiceIcon}>💬</div>
                  <div className={styles.footerServiceName}>Support</div>
                  <div className={styles.footerServiceDescription}>24/7 customer service</div>
                </div>

                <div className={styles.footerService}>
                  <div className={styles.footerServiceIcon}>🔄</div>
                  <div className={styles.footerServiceName}>Returns</div>
                  <div className={styles.footerServiceDescription}>30-day money back</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footerMiddle}>
            <div className={styles.footerColumn}>
              <h3>Shop</h3>
              <ul className={styles.footerLinks}>
                <li><Link href="/products/iphone">iPhone Parts</Link></li>
                <li><Link href="/products/samsung">Samsung Parts</Link></li>
                <li><Link href="/products/ipad">iPad Parts</Link></li>
                <li><Link href="/products/macbook">MacBook Parts</Link></li>
                <li><Link href="/products/tools">Repair Tools</Link></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3>Information</h3>
              <ul className={styles.footerLinks}>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/blog">Repair Guides</Link></li>
                <li><Link href="/lcd-buyback">LCD Buyback Program</Link></li>
                <li><Link href="/wholesale">Wholesale Program</Link></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3>Customer Service</h3>
              <ul className={styles.footerLinks}>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/shipping">Shipping Policy</Link></li>
                <li><Link href="/returns">Returns & Warranty</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms & Conditions</Link></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3>Contact Us</h3>
              <ul className={styles.footerLinks}>
                <li>Vienna, VA 22182</li>
                <li>Phone: +1 (240) 351-0511</li>
                <li>Email: support@mdtstech.store</li>
                <li>Hours: Mon-Fri 9AM-10PM EST</li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerCopyright}>
              &copy; {new Date().getFullYear()} Midas Technical Solutions. All rights reserved.
            </div>
            <div className={styles.footerPaymentMethods}>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="18" cy="12" r="3" />
                </svg>
              </div>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M12 9v6" />
                  <path d="M8 9h8" />
                </svg>
              </div>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z" />
                  <path d="M12 16V8" />
                  <path d="M8 12h8" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export async function getServerSideProps(context) {
  const csrfToken = await getCsrfToken(context);

  return {
    props: {
      csrfToken: csrfToken || null,
    },
  };
}
