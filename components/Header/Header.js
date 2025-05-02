import React from 'react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              className={styles.dropdownButton}
              onClick={toggleDropdown}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              My Account
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.dropdownIcon}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link href="/auth/signin" className={styles.dropdownItem}>Sign In</Link>
                <Link href="/auth/register" className={styles.dropdownItem}>Register</Link>
                <Link href="/user/orders" className={styles.dropdownItem}>My Orders</Link>
                <Link href="/user/profile" className={styles.dropdownItem}>My Profile</Link>
                <Link href="/wishlist" className={styles.dropdownItem}>Wishlist</Link>
              </div>
            )}
          </div>

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
          <li><Link href="/products">Products</Link></li>
          <li><Link href="/categories">Categories</Link></li>
          <li><Link href="/lcd-buyback">LCD Buyback</Link></li>
          <li><Link href="/gapp">Apple Parts Program</Link></li>
          <li><Link href="/cart">Cart</Link></li>
          <li><Link href="/auth/signin">Sign In</Link></li>
          <li><Link href="/auth/register">Register</Link></li>
          <li><Link href="/user/orders">My Orders</Link></li>
          <li><Link href="/user/profile">My Profile</Link></li>
          <li><Link href="/wishlist">Wishlist</Link></li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
