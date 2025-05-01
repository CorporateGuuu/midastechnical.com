import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './RecentlyViewed.module.css';

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // In a real implementation, this would fetch from localStorage or a user's session
    // For demo purposes, we'll use mock data
    const mockRecentlyViewed = [
      {
        id: 1,
        name: 'iPhone 13 Pro OLED Screen',
        slug: 'iphone-13-pro-oled-screen',
        price: 129.99,
        category: 'iPhone Parts',
        imageUrl: '/images/iphone-screen.svg'
      },
      {
        id: 2,
        name: 'Samsung Galaxy S22 Battery',
        slug: 'samsung-galaxy-s22-battery',
        price: 39.99,
        category: 'Samsung Parts',
        imageUrl: '/images/samsung-battery.svg'
      },
      {
        id: 3,
        name: 'Professional Repair Tool Kit',
        slug: 'professional-repair-tool-kit',
        price: 89.99,
        category: 'Repair Tools',
        imageUrl: '/images/repair-tools.svg'
      },
      {
        id: 4,
        name: 'iPad Pro 12.9" LCD Assembly',
        slug: 'ipad-pro-12-9-lcd-assembly',
        price: 199.99,
        category: 'iPad Parts',
        imageUrl: '/images/ipad-screen.svg'
      }
    ];

    setRecentProducts(mockRecentlyViewed);
  }, []);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className={styles.recentlyViewed}>
      <div className="container">
        <h2 className={styles.title}>Recently Viewed</h2>
        <p className={styles.subtitle}>Products you've viewed recently</p>
        
        <div className={styles.products}>
          {recentProducts.map(product => (
            <Link href={`/products/${product.slug}`} key={product.id} className={styles.product}>
              <div className={styles.imageContainer}>
                <img src={product.imageUrl} alt={product.name} className={styles.image} />
              </div>
              <div className={styles.content}>
                <div className={styles.category}>{product.category}</div>
                <h3 className={styles.name}>{product.name}</h3>
                <div className={styles.price}>${product.price.toFixed(2)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
