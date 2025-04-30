import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBanner}>
        Introducing our LCD Buyback Program – Sell your old LCD screens for cash! <Link href="/lcd-buyback">Learn More</Link>
      </div>

      <div className={styles.mainHeader}>
        <div className={styles.logo}>
          <Link href="/">MDTS</Link>
        </div>

        <nav className={styles.navigation}>
          <ul className={styles.navLinks}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/categories">Categories</Link></li>
            <li><Link href="/lcd-buyback">LCD Buyback</Link></li>
          </ul>
        </nav>

        <div className={styles.actionLinks}>
          <Link href="/cart" className={styles.cartLink}>
            Cart
          </Link>
          <Link href="/auth/signin" className={styles.signInLink}>
            Sign In
          </Link>

          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <i className="fas fa-bars">☰</i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <button
          className={styles.closeButton}
          onClick={toggleMobileMenu}
          aria-label="Close menu"
        >
          <i className="fas fa-times">✕</i>
        </button>

        <ul className={styles.mobileNavLinks}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/products">Products</Link></li>
          <li><Link href="/categories">Categories</Link></li>
          <li><Link href="/lcd-buyback">LCD Buyback</Link></li>
          <li><Link href="/cart">Cart</Link></li>
          <li><Link href="/auth/signin">Sign In</Link></li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
