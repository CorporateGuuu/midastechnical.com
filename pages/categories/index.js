import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="container">
      <h1>Categories</h1>

      {loading ? (
        <p>Loading categories...</p>
      ) : error ? (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="grid">
          {categories.map((category) => (
            <div key={category.id} className="card">
              <div className="card-image">
                <img
                  src={category.image_url || "/placeholder.svg"}
                  alt={category.name}
                />
              </div>
              <div className="card-content">
                <h2 className="card-title">{category.name}</h2>
                <p className="card-category">{category.product_count} products</p>
                <Link href={`/categories/${category.slug}`}>
                  View Products
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
