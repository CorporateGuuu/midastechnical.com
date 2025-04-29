import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AddToCart from '../../components/AddToCart';

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch when slug is available
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${slug}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();

        if (data.success) {
          setProduct(data.product);
        } else {
          throw new Error(data.message || 'Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Error</h1>
        <p>{error}</p>
        <Link href="/products">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <h1>Product Not Found</h1>
        <p>The requested product could not be found.</p>
        <Link href="/products">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link href="/products" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        &larr; Back to Products
      </Link>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', '@media (min-width: 768px)': { flexDirection: 'row' } }}>
          <div style={{ flex: '1 1 50%' }}>
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: '1 1 50%', padding: '1.5rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>{product.name}</h1>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Category: {product.category_name}</p>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${product.price.toFixed(2)}</span>
              {product.discount_percentage > 0 && (
                <span style={{ marginLeft: '0.5rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                  {product.discount_percentage}% OFF
                </span>
              )}
            </div>

            <p style={{ marginBottom: '1.5rem' }}>{product.description}</p>

            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Specifications</h2>
              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.25rem' }}>
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  value && key !== 'id' && key !== 'product_id' && (
                    <div key={key} style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '500' }}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {value}
                    </div>
                  )
                ))}
              </div>
            </div>

            <AddToCart product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}


