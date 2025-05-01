import Link from 'next/link';
import styles from './Hero.module.css';

const Hero = ({ heroImageUrl = "/images/hero-repair.jpg" }) => {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <span className={styles.badge}>Premium Quality Parts & Tools</span>
        <h1 className={styles.title}>Midas Technical Solutions</h1>
        <p className={styles.subtitle}>
          Your trusted partner for professional repair parts & tools. We provide high-quality components for iPhone, Samsung, iPad, and MacBook repairs.
        </p>
        <div className={styles.ctaContainer}>
          <Link href="/products" className={styles.cta}>
            Shop Now
          </Link>
          <Link href="/lcd-buyback" className={styles.secondaryCta}>
            LCD Buyback
          </Link>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>5,000+</span>
            <span className={styles.statLabel}>Products</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>10,000+</span>
            <span className={styles.statLabel}>Happy Customers</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>24/7</span>
            <span className={styles.statLabel}>Support</span>
          </div>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <img
          src={heroImageUrl}
          alt="Professional repair tools and parts"
          className={styles.image}
        />
      </div>
    </section>
  );
};

export default Hero;
