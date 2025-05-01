import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProductFilters from '../../components/ProductFilters/ProductFilters';
import styles from '../../styles/ProductsPage.module.css';

export default function Products() {
  const router = useRouter();
  const { query } = router;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Mock categories and brands for filtering
  const [categories, setCategories] = useState([
    { id: 1, name: 'iPhone Parts', slug: 'iphone-parts' },
    { id: 2, name: 'Samsung Parts', slug: 'samsung-parts' },
    { id: 3, name: 'iPad Parts', slug: 'ipad-parts' },
    { id: 4, name: 'MacBook Parts', slug: 'macbook-parts' },
    { id: 5, name: 'Repair Tools', slug: 'repair-tools' }
  ]);

  const [brands, setBrands] = useState([
    { id: 1, name: 'Apple', slug: 'apple' },
    { id: 2, name: 'Samsung', slug: 'samsung' },
    { id: 3, name: 'LG', slug: 'lg' },
    { id: 4, name: 'Huawei', slug: 'huawei' },
    { id: 5, name: 'Xiaomi', slug: 'xiaomi' }
  ]);

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

  // Handle filter changes
  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters);
    // In a real implementation, this would update the query parameters
    // and trigger a new fetch of filtered products
  };

  useEffect(() => {
    // Update page from query params if present
    if (query.page) {
      setPage(parseInt(query.page));
    }
  }, [query.page]);

  useEffect(() => {
    // Function to fetch products from API with filters
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query string with all filters
        let queryString = `page=${page}&limit=${limit}`;

        if (query.category) {
          queryString += `&category=${query.category}`;
        }

        if (query.brand) {
          queryString += `&brand=${query.brand}`;
        }

        if (query.minPrice && query.maxPrice) {
          queryString += `&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`;
        }

        if (query.inStock === 'true') {
          queryString += '&inStock=true';
        }

        if (query.sortBy) {
          queryString += `&sortBy=${query.sortBy}`;
        }

        const response = await fetch(`/api/products?${queryString}`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
          setTotalProducts(data.total || data.products.length);
          setTotalPages(data.totalPages || Math.ceil(data.total / limit) || 1);
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
  }, [page, limit, query]);

  // Handle pagination
  const handleNextPage = () => {
    const nextPage = page + 1;
    router.push({
      pathname: router.pathname,
      query: { ...query, page: nextPage }
    }, undefined, { shallow: true });
  };

  const handlePrevPage = () => {
    const prevPage = Math.max(page - 1, 1);
    router.push({
      pathname: router.pathname,
      query: { ...query, page: prevPage }
    }, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Products | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Browse our extensive collection of repair parts and tools for all major device brands." />
      </Head>

      <div className="container">
        <div className={styles.productsHeader}>
          <h1>Products</h1>
          <p>Browse our extensive collection of repair parts and tools</p>
        </div>

        <div className={styles.productsLayout}>
          {/* Product Filters */}
          <ProductFilters
            categories={categories}
            brands={brands}
            onFilterChange={handleFilterChange}
          />

          {/* Product Grid */}
          <div className={styles.productsContent}>
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
              <div className={styles.emptyProducts}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h3>No products found</h3>
                <p>Try adjusting your filters or browse all products</p>
                <button
                  className={styles.resetButton}
                  onClick={() => router.push('/products')}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className={styles.resultsInfo}>
                  <p>Showing {products.length} of {totalProducts} products</p>
                </div>

                <div className={styles.productsGrid}>
                  {products.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.productImageContainer}>
                        <img
                          src={product.image_url || `/images/products/${getRandomProductImage()}`}
                          alt={product.name}
                          className={styles.productImage}
                        />
                        {product.discount_percentage > 0 && (
                          <span className={styles.discountBadge}>
                            {product.discount_percentage}% OFF
                          </span>
                        )}
                        <div className={styles.productActions}>
                          <button className={styles.wishlistButton} title="Add to Wishlist">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          </button>
                          <button className={styles.quickViewButton} title="Quick View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className={styles.productContent}>
                        <div className={styles.productCategory}>{product.category_name}</div>
                        <h3 className={styles.productName}>
                          <Link href={`/products/${product.slug}`}>
                            {product.name}
                          </Link>
                        </h3>

                        <div className={styles.productPrice}>
                          {product.discount_percentage > 0 ? (
                            <>
                              <span className={styles.originalPrice}>${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}</span>
                              <span className={styles.currentPrice}>${product.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className={styles.currentPrice}>${product.price.toFixed(2)}</span>
                          )}
                        </div>

                        <div className={styles.productButtons}>
                          <Link href={`/products/${product.slug}`} className={styles.viewDetailsButton}>
                            View Details
                          </Link>
                          <button className={styles.addToCartButton}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="21" r="1"></circle>
                              <circle cx="20" cy="21" r="1"></circle>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.pagination}>
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`${styles.paginationButton} ${page === 1 ? styles.disabled : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Previous
                  </button>

                  <div className={styles.paginationPages}>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          router.push({
                            pathname: router.pathname,
                            query: { ...query, page: i + 1 }
                          }, undefined, { shallow: true });
                        }}
                        className={`${styles.pageNumber} ${page === i + 1 ? styles.activePage : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                    className={`${styles.paginationButton} ${page >= totalPages ? styles.disabled : ''}`}
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
        </div>
      </div>
    </>
  );
}
