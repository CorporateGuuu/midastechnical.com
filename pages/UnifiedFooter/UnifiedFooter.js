import React, { useState } from 'react';
import styles from '../../components/UnifiedFooter/UnifiedFooter.module.css';
import ContactForm from '../../components/ContactForm/ContactForm';

const UnifiedFooter = () => {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
  };

  return (
    <footer className={styles.unifiedFooter}>
      <div className={styles.footerContainer}>
        <div className={styles.leftCol}>
          <div className={styles.footerLogo}>
            <img src="/images/logo.svg" alt="MDTS Tech Logo" width="180" height="60" />
          </div>
          <div className={styles.footerContact}>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <img src="/images/icons/phone.svg" alt="Phone" width="16" height="16" />
              </span>
              <span className={styles.contactText}>
                <a href="tel:+12403510511">+1 (240) 351-0511</a>
              </span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <img src="/images/icons/location.svg" alt="Location" width="16" height="16" />
              </span>
              <span className={styles.contactText}>
                Vienna, VA 22182
              </span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <img src="/images/icons/email.svg" alt="Email" width="16" height="16" />
              </span>
              <span className={styles.contactText}>
                <a href="mailto:support@mdtstech.store">support@mdtstech.store</a>
              </span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <img src="/images/icons/clock.svg" alt="Hours" width="16" height="16" />
              </span>
              <span className={styles.contactText}>
                Mon-Fri 9AM-10PM EST
              </span>
            </div>
          </div>
          <div className={styles.footerNewsletter}>
            <h3>Subscribe to Our Newsletter</h3>
            <p>Stay updated with our latest news and offers</p>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
          <div className={styles.footerSocial}>
            <div className={styles.contactUsButton}>
              <button onClick={openContactForm}>Contact Us</button>
            </div>
            <span className={`${styles.follow2} ${styles.hideDeskOllow}`}>
              <b>FOLLOW</b> MDTS TECH
            </span>
            <ul className={styles.socialMediaPart}>
              <li className={styles.facebook}>
                <a
                  aria-label="facebook"
                  href="https://www.facebook.com/mdtstech"
                  title="facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
              <li className={styles.twitter}>
                <a
                  aria-label="twitter"
                  href="https://twitter.com/mdtstech"
                  title="twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
              <li className={styles.linkedin}>
                <a
                  aria-label="linkedin"
                  href="https://www.linkedin.com/in/fitzgerald-amaniampong-0a2962324/"
                  title="linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
              <li className={styles.instagram}>
                <a
                  aria-label="instagram"
                  href="https://www.instagram.com/mdtstech.store/"
                  title="instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
              <li className={styles.youtube}>
                <a
                  aria-label="youtube"
                  href="https://youtube.com/channel/mdtstech"
                  title="youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
            </ul>
          </div>
          <div className={styles.footerTrademark2}>
            <p>
              All trademarks are properties of their respective holders. MDTS Tech does not own or make claim to those trademarks used on this website in which it is not the holder.
            </p>
            <address>© {new Date().getFullYear()} MIDAS TECHNICAL SOLUTIONS</address>
          </div>
        </div>
        <div className={styles.rightCol}>
          <div className={`${styles.paymentMethodsPart} ${styles.paymentMethodsMobile}`}>
            <ul>
              <li className={styles.amex}>
                <img src="/images/payments/amex.svg" alt="American Express" width="40" height="24" />
              </li>
              <li className={styles.masterCard}>
                <img src="/images/payments/mastercard.svg" alt="Mastercard" width="40" height="24" />
              </li>
              <li className={styles.venmo}>
                <img src="/images/payments/venmo.svg" alt="Venmo" width="40" height="24" />
              </li>
              <li className={styles.paypal}>
                <img src="/images/payments/paypal.svg" alt="PayPal" width="40" height="24" />
              </li>
              <li className={styles.paypalCredit}>
                <img src="/images/payments/paypal-credit.svg" alt="PayPal Credit" width="40" height="24" />
              </li>
              <li className={styles.visa}>
                <img src="/images/payments/visa.svg" alt="Visa" width="40" height="24" />
              </li>
              <li className={styles.discover}>
                <img src="/images/payments/discover.svg" alt="Discover" width="40" height="24" />
              </li>
              <li className={styles.creditKey}>
                <img src="/images/payments/credit-key.svg" alt="Credit Key" width="40" height="24" />
              </li>
              <li className={styles.wireTransfer}>
                <img src="/images/payments/wire-transfer.svg" alt="Wire Transfer" width="40" height="24" />
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} />
    </footer>
  );
};

export default UnifiedFooter;
