import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../../styles/CategoriesPage.module.css';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Predefined categories with images from the New Content folder
  const predefinedCategories = [
    {
      id: 1,
      name: 'iPhone Parts',
      slug: 'iphone-parts',
      product_count: 124,
      image_url: '/images/gapp/iphone-parts.png',
      description: 'Genuine Apple parts and high-quality replacements for all iPhone models'
    },
    {
      id: 2,
      name: 'Samsung Parts',
      slug: 'samsung-parts',
      product_count: 98,
      image_url: '/images/gapp/samsung-parts.png',
      description: 'Premium quality replacement parts for all Samsung Galaxy models'
    },
    {
      id: 3,
      name: 'iPad Parts',
      slug: 'ipad-parts',
      product_count: 76,
      image_url: '/images/gapp/ipad-parts.png',
      description: 'Genuine Apple parts and quality replacements for all iPad models'
    },
    {
      id: 4,
      name: 'MacBook Parts',
      slug: 'macbook-parts',
      product_count: 52,
      image_url: '/images/gapp/macbook-parts.png',
      description: 'High-quality replacement parts for all MacBook models'
    },
    {
      id: 5,
      name: 'Repair Tools',
      slug: 'repair-tools',
      product_count: 87,
      image_url: '/images/gapp/repair-tools.png',
      description: 'Professional repair tools for all your device repair needs'
    }
  ];

  useEffect(() => {
    // Function to fetch categories from API
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setCategories(data.categories || []);
        } else {
          throw new Error(data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);

        // Set predefined categories in case of error
        setCategories(predefinedCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <Head>
        <title>Product Categories | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Browse our product categories including iPhone parts, Samsung parts, iPad parts, MacBook parts, and repair tools." />
      </Head>

      <div className={styles.categoriesContainer}>
        <div className={styles.categoriesHeader}>
          <h1>Product Categories</h1>
          <p>Browse our extensive collection of repair parts and tools by category</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyCategories}>
            <p>No categories found.</p>
          </div>
        ) : (
          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <div key={category.id} className={styles.categoryCard}>
                <div className={styles.categoryImageContainer}>
                  <img
                    src={category.image_url || `/images/gapp/placeholder.png`}
                    alt={category.name}
                    className={styles.categoryImage}
                  />
                </div>
                <div className={styles.categoryContent}>
                  <h2 className={styles.categoryTitle}>{category.name}</h2>
                  <p className={styles.categoryDescription}>{category.description || `Browse our selection of ${category.name.toLowerCase()}`}</p>
                  <p className={styles.productCount}>{category.product_count} products</p>
                  <Link href={`/categories/${category.slug}`} className={styles.viewProductsButton}>
                    View Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
