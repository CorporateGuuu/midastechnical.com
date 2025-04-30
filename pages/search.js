import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Search.module.css';

export default function Search() {
  const router = useRouter();
  const { q } = router.query;
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        setSearchResults(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [q]);

  return (
    <>
      <Head>
        <title>{q ? `Search results for "${q}"` : 'Search'} | MDTS</title>
        <meta name="description" content="Search for repair parts and tools at Midas Technical Solutions" />
      </Head>

      <div className={styles.searchPage}>
        <div className={styles.searchHeader}>
          <h1>Search Results</h1>
          <div className={styles.searchForm}>
            <form action="/search" method="get">
              <input
                type="text"
                name="q"
                defaultValue={q || ''}
                placeholder="Search products..."
              />
              <button type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className={styles.searchContent}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Searching...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>Error: {error}</p>
              <p>Please try again later.</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <p className={styles.resultsCount}>
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{q}"
              </p>
              <div className={styles.resultsList}>
                {searchResults.map((product) => (
                  <div key={product.id} className={styles.resultItem}>
                    <div className={styles.resultImage}>
                      <img src={product.imageUrl || '/images/placeholder.svg'} alt={product.name} />
                    </div>
                    <div className={styles.resultInfo}>
                      <h2>
                        <Link href={`/products/${product.slug || product.id}`}>
                          {product.name}
                        </Link>
                      </h2>
                      <p className={styles.resultCategory}>{product.category_name}</p>
                      <div className={styles.resultPrice}>
                        {product.discount_percentage > 0 ? (
                          <>
                            <span className={styles.originalPrice}>
                              ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                            </span>
                            ${product.price.toFixed(2)}
                          </>
                        ) : (
                          `$${product.price.toFixed(2)}`
                        )}
                      </div>
                      <Link href={`/products/${product.slug || product.id}`} className={styles.viewButton}>
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : q ? (
            <div className={styles.noResults}>
              <p>No results found for "{q}"</p>
              <p>Try different keywords or browse our categories</p>
              <div className={styles.suggestedLinks}>
                <Link href="/products" className={styles.suggestedLink}>
                  Browse All Products
                </Link>
                <Link href="/categories" className={styles.suggestedLink}>
                  Browse Categories
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.initialState}>
              <p>Enter a search term to find products</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
