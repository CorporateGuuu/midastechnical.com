import Head from 'next/head';
import styles from '../styles/LcdBuyback.module.css';
import { useState } from 'react';
import Link from 'next/link';

export default function LcdBuyback() {
  return (
    <>
      <Head>
        <title>LCD Buyback Program - Midas Technical Solutions</title>
        <meta name="description" content="Sell your old LCD screens and get cash back with our LCD Buyback Program. Fast, easy, and competitive prices." />
      </Head>

      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logo}>
            <Link href="/">MDTS</Link>
          </div>

          <div className={styles.searchBar}>
            <form action="/search" method="get">
              <input
                type="text"
                name="q"
                placeholder="Search products..."
              />
              <button type="submit" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
          </div>

          <nav className={styles.navigation}>
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/auth/signin" className={styles.signInLink}>Sign In</Link>
          </nav>
        </div>
      </div>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>LCD Buyback Program</h1>
            <p>Turn your old LCD screens into cash! We buy broken, used, and new LCD screens for iPhones, Samsung, iPads, and more.</p>
            <button className={styles.heroButton}>Get Started</button>
          </div>
        </section>

        <section className={styles.infoSection}>
          <div className={styles.container}>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>💰</div>
                <h3>Competitive Pricing</h3>
                <p>We offer some of the best prices in the industry for your used and broken LCD screens.</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>🚚</div>
                <h3>Free Shipping</h3>
                <p>We provide free shipping labels for all buyback orders over $100.</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>⚡</div>
                <h3>Fast Payment</h3>
                <p>Get paid within 48 hours of us receiving and verifying your LCD screens.</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>♻️</div>
                <h3>Eco-Friendly</h3>
                <p>Help the environment by recycling your old LCD screens instead of throwing them away.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.formSection}>
          <div className={styles.container}>
            <div className={styles.formWrapper}>
              <h2>Submit Your Device Details</h2>
              <p>Fill out the form below to get an instant quote for your LCD screens.</p>

              <form className={styles.buybackForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="deviceType">Device Type</label>
                  <select id="deviceType" name="deviceType">
                    <option value="">Select Device Type</option>
                    <option value="iphone">iPhone</option>
                    <option value="samsung">Samsung</option>
                    <option value="ipad">iPad</option>
                    <option value="macbook">MacBook</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="deviceModel">Device Model</label>
                  <input
                    type="text"
                    id="deviceModel"
                    name="deviceModel"
                    placeholder="e.g., iPhone 13 Pro, Galaxy S22"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="condition">Condition</label>
                  <select id="condition" name="condition">
                    <option value="">Select Condition</option>
                    <option value="new">New/Like New</option>
                    <option value="good">Good (Minor Scratches)</option>
                    <option value="fair">Fair (Visible Wear)</option>
                    <option value="broken">Broken (Still Powers On)</option>
                    <option value="damaged">Damaged (Does Not Power On)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    defaultValue="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your email address"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Your phone number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="comments">Additional Comments (Optional)</label>
                  <textarea
                    id="comments"
                    name="comments"
                    rows="3"
                    placeholder="Any additional information about your LCD screens"
                  ></textarea>
                </div>

                <button type="submit" className={styles.submitButton}>Get Quote</button>
              </form>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.container}>
            <h2>Frequently Asked Questions</h2>

            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h3>What types of LCD screens do you buy?</h3>
                <p>We buy LCD screens for iPhones, Samsung phones, iPads, MacBooks, and other popular devices. Both working and non-working screens are accepted.</p>
              </div>

              <div className={styles.faqItem}>
                <h3>How is the value determined?</h3>
                <p>The value is determined based on the device model, condition of the screen, and current market demand. We strive to offer competitive prices.</p>
              </div>

              <div className={styles.faqItem}>
                <h3>How do I ship my LCD screens to you?</h3>
                <p>After accepting our quote, we'll provide shipping instructions and a prepaid shipping label for orders over $100. For smaller orders, you can use your preferred shipping method.</p>
              </div>

              <div className={styles.faqItem}>
                <h3>How will I get paid?</h3>
                <p>We offer payment via PayPal, direct bank transfer, or store credit (with a 10% bonus). Payments are processed within 48 hours after we receive and verify your LCD screens.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

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
                  <div className={styles.footerServiceDescription}>Free shipping on orders over $50</div>
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
                <li><Link href="/careers">Careers</Link></li>
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
