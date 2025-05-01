import Link from 'next/link';
import { useState } from 'react';
import LazyImage from '../LazyImage/LazyImage';
import StarRating from '../StarRating/StarRating';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    // In a real app, this would add the product to the cart
    alert(`Added ${product.name} to cart`);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    // In a real app, this would add the product to the wishlist
    alert(`Added ${product.name} to wishlist`);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    // In a real app, this would show a quick view modal
    alert(`Quick view for ${product.name}`);
  };

  return (
    <div
      className={styles.productCard}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.productImageContainer}>
        <Link href={`/products/${product.slug}`}>
          <LazyImage
            src={product.image_url || '/images/placeholder.svg'}
            alt={product.name}
            className={styles.productImage}
            width="100%"
            height="100%"
          />
        </Link>

        {product.discount_percentage > 0 && (
          <span className={styles.discountBadge}>
            {product.discount_percentage}% OFF
          </span>
        )}

        <div className={`${styles.productActions} ${isHovered ? styles.visible : ''}`}>
          <button
            className={styles.wishlistButton}
            title="Add to Wishlist"
            onClick={handleAddToWishlist}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <button
            className={styles.quickViewButton}
            title="Quick View"
            onClick={handleQuickView}
          >
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

        <div className={styles.productRating}>
          <StarRating rating={product.rating || 0} size="small" />
          {product.review_count > 0 && (
            <span className={styles.reviewCount}>({product.review_count})</span>
          )}
        </div>

        <div className={styles.productPrice}>
          {product.discount_percentage > 0 ? (
            <>
              <span className={styles.originalPrice}>
                ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
              </span>
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

          <button
            className={styles.addToCartButton}
            onClick={handleAddToCart}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
