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
            <li><Link href="/cart">Cart</Link></li>
            <li><Link href="/auth/signin">Sign In</Link></li>
          </ul>

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search products..."
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>
              <i className="fas fa-search">🔍</i>
            </button>
          </div>
        </nav>

        <div className={styles.icons}>
          <div className={styles.icon}>
            <i className="fas fa-user">👨‍💼</i>
          </div>
          <div className={styles.icon}>
            <i className="fas fa-heart">💙</i>
          </div>
          <Link href="/cart">
            <div className={styles.icon}>
              <i className="fas fa-shopping-cart">🛍️</i>
            </div>
          </Link>

          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
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
        >
          <i className="fas fa-times">✕</i>
        </button>

        <div className={styles.mobileSearchBar}>
          <input
            type="text"
            placeholder="Search products..."
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>
            <i className="fas fa-search">🔍</i>
          </button>
        </div>

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
