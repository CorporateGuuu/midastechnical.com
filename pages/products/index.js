import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

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
    <div className="container">
      <h1>Products</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <div className="grid">
            {products.map((product) => (
              <div key={product.id} className="card">
                <div className="card-image">
                  <img
                    src={product.image_url || "/placeholder.svg"}
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
              className={page === 1 ? 'disabled' : ''}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={products.length < limit}
              className={products.length < limit ? 'disabled' : ''}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
