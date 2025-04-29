import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function CategoryDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    // Only fetch when slug is available
    if (!slug) return;

    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/categories/${slug}?page=${page}&limit=${limit}`);

        if (!response.ok) {
          throw new Error('Failed to fetch category data');
        }

        const data = await response.json();

        if (data.success) {
          setCategory(data.category);
          setProducts(data.products);
        } else {
          throw new Error(data.message || 'Failed to fetch category data');
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug, page, limit]);

  // Handle pagination
  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage(prevPage => Math.max(prevPage - 1, 1));
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading category data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Error</h1>
        <p>{error}</p>
        <Link href="/categories">
          Back to Categories
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container">
        <h1>Category Not Found</h1>
        <p>The requested category could not be found.</p>
        <Link href="/categories">
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link href="/categories" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        &larr; Back to Categories
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1>{category.name}</h1>
        <p style={{ color: '#666' }}>{category.description}</p>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Products in this Category</h2>

      {products.length === 0 ? (
        <p>No products found in this category.</p>
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
                  <h3 className="card-title">{product.name}</h3>
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


