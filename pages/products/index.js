import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../styles/ProductsPage.module.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Product images from the Website Content folder
  const productImages = useMemo(() => [
    '0DA4ABBF-40A3-456A-8275-7A18F7831F17.JPG',
    '1333A34A-20B6-481E-A61A-2144DE8EB250.JPG',
    '2AA4A703-8C13-4A01-BA85-3B3AD0FC729D.JPG',
    '31DC2BA3-E822-41C9-8AD4-E901A05C73E2.JPG',
    '5FE8C433-F216-4C2F-AFAA-B17576A69E70.JPG',
    '64EA3D01-5BD4-44CB-A7D9-5779ACF06239.JPG',
    '6B074445-59FB-47A1-AA9E-A6F54F36C28B.JPG',
    '77A26396-50B6-405B-B76C-C751924A6621.JPG',
    '78D0434A-D569-40A9-BCD9-FD0C1F113C72.JPG',
    '84B5F3DD-755C-4E8A-96DD-EA6F63B9642F.JPG',
    '8A1B4B2E-EDE6-4D12-A79C-AB7ACE5A1460.JPG',
    '901CCF8F-6A4E-46F3-B319-11F81EE5C240.JPG',
    'B8C872E3-8F03-4207-88A3-D714D5C5C801.JPG',
    'BA8EC1D7-89F1-45BD-94E3-0FD68374AA7C.JPG',
    'C6488984-139C-46D2-BBDA-79717072235B.JPG',
    'D7AC4198-419E-4992-9E65-6D3AADBDBEE8.JPG',
    'E31077DE-4766-4F72-AA7F-0CF19CF06A22.JPG',
    'FCD10084-3B70-4FAB-BDD0-FE04958553D6.JPG'
  ], []);

  // Function to get a random product image
  const getRandomProductImage = () => {
    const randomIndex = Math.floor(Math.random() * productImages.length);
    return productImages[randomIndex];
  };

  useEffect(() => {
    // Function to fetch products from API
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?page=${page}&limit=${limit}`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
        } else {
          throw new Error(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit]);

  // Handle pagination
  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage(prevPage => Math.max(prevPage - 1, 1));
  };

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
        <h1>Products</h1>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-products">
          <p>No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {products.map((product) => (
              <div key={product.id} className="card">
                <div className="card-image">
                  <img
                    src={product.image_url || `/images/products/${getRandomProductImage()}`}
                    alt={product.name}
                  />
                </div>
                <div className="card-content">
                  <h2 className="card-title">{product.name}</h2>
                  <p className="card-category">{product.category_name}</p>
                  {product.discount_percentage > 0 ? (
                    <div className="card-price">
                      <span className="original-price">${product.price.toFixed(2)}</span>
                      <span className="discounted-price">${product.discounted_price.toFixed(2)}</span>
                      <span className="discount-badge">{product.discount_percentage}% OFF</span>
                    </div>
                  ) : (
                    <p className="card-price">${product.price.toFixed(2)}</p>
                  )}
                  <Link href={`/products/${product.slug}`}>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className={`pagination-button ${page === 1 ? 'disabled' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Previous
            </button>
            <span className="pagination-info">Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={products.length < limit}
              className={`pagination-button ${products.length < limit ? 'disabled' : ''}`}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
    </>
  );
}
