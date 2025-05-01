import React from 'react';
import Link from 'next/link';
import styles from './CategoryCards.module.css';

const CategoryCards = () => {
  const categories = [
    {
      id: 1,
      name: "iPhone Parts",
      image: "/images/categories/iphone-parts.jpg",
      description: "Quality replacement screens, batteries, and more for all iPhone models",
      slug: "iphone-parts"
    },
    {
      id: 2,
      name: "Samsung Parts",
      image: "/images/categories/samsung-parts.jpg",
      description: "Genuine and aftermarket parts for Samsung Galaxy devices",
      slug: "samsung-parts"
    },
    {
      id: 3,
      name: "iPad Parts",
      image: "/images/categories/ipad-parts.jpg",
      description: "Screens, batteries, and other components for all iPad generations",
      slug: "ipad-parts"
    },
    {
      id: 4,
      name: "MacBook Parts",
      image: "/images/categories/macbook-parts.jpg",
      description: "Keyboards, screens, and batteries for MacBook Pro and Air",
      slug: "macbook-parts"
    },
    {
      id: 5,
      name: "Repair Tools",
      image: "/images/categories/repair-tools.jpg",
      description: "Professional-grade tools for device repair and maintenance",
      slug: "repair-tools"
    },
    {
      id: 6,
      name: "LCD Buyback",
      image: "/images/categories/lcd-buyback.jpg",
      description: "Get cash for your used LCD screens and other components",
      slug: "lcd-buyback"
    }
  ];

  return (
    <section className={styles.categoryCards}>
      <div className="container">
        <h2 className={styles.title}>Shop by Category</h2>
        <p className={styles.subtitle}>Browse our extensive collection of repair parts and tools</p>
        
        <div className={styles.grid}>
          {categories.map((category) => (
            <Link href={`/categories/${category.slug}`} key={category.id} className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={category.image} alt={category.name} className={styles.image} />
              </div>
              <div className={styles.content}>
                <h3 className={styles.name}>{category.name}</h3>
                <p className={styles.description}>{category.description}</p>
                <span className={styles.link}>Browse Products</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
