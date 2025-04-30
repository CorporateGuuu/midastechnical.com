import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../styles/CategoriesPage.module.css';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Background images for categories
  const backgroundImages = useMemo(() => [
    'apple-1024x683.png',
    'developer.png',
    'free-iphone-banner-1.png',
    'apple-devices-800x702.jpg'
  ], []);

  // Function to get a background image based on category index
  const getCategoryImage = (index) => {
    return `/images/backgrounds/${backgroundImages[index % backgroundImages.length]}`;
  };

  useEffect(() => {
    // Function to fetch categories from API
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();

        if (data.success) {
          setCategories(data.categories);
        } else {
          throw new Error(data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
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
            <Link href="/lcd-buyback">LCD Buyback</Link>
            <Link href="/auth/signin" className={styles.signInLink}>Sign In</Link>
          </nav>
        </div>
      </div>

      <div className="container">
        <h1>Categories</h1>

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
        <div className="empty-products">
          <p>No categories found.</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="card">
              <div className="card-image">
                <img
                  src={category.image_url || getCategoryImage(categories.indexOf(category))}
                  alt={category.name}
                />
              </div>
              <div className="card-content">
                <h2 className="card-title">{category.name}</h2>
                <p className="card-category">{category.product_count} products</p>
                <Link href={`/categories/${category.slug}`} className="btn btn-primary">
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
