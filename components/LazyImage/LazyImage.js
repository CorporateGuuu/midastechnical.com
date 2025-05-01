import { useState, useEffect, useRef } from 'react';
import styles from './LazyImage.module.css';

const LazyImage = ({
  src,
  alt,
  width,
  height,
  className,
  placeholderSrc = '/images/placeholder.svg',
  threshold = 0.1,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  
  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setIsInView(false);
  }, [src]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    const currentImgRef = imgRef.current;
    
    if (currentImgRef) {
      observer.observe(currentImgRef);
    }
    
    return () => {
      if (currentImgRef) {
        observer.disconnect();
      }
    };
  }, [threshold]);
  
  const handleImageLoad = () => {
    setIsLoaded(true);
  };
  
  const handleImageError = () => {
    console.error(`Failed to load image: ${src}`);
    // Keep the placeholder visible on error
  };
  
  return (
    <div
      ref={imgRef}
      className={`${styles.lazyImageContainer} ${className || ''}`}
      style={{ width, height }}
      {...props}
    >
      {/* Placeholder image */}
      <img
        src={placeholderSrc}
        alt={alt}
        className={`${styles.placeholder} ${isLoaded ? styles.hidden : ''}`}
        width={width}
        height={height}
      />
      
      {/* Actual image (only loads when in view) */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${styles.actualImage} ${isLoaded ? styles.visible : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default LazyImage;
