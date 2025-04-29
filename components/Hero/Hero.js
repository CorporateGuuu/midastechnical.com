import Link from 'next/link';
import styles from './Hero.module.css';

const Hero = ({ heroImageUrl = "https://example.com/images/laptop-repair.jpg" }) => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>Midas Technical Solutions</h1>
        <p className={styles.subtitle}>
          Your trusted partner for professional repair parts & tools. Find everything you need for phone, tablet, and laptop repairs.
          Quality parts, tools, and accessories at competitive prices.
        </p>
        <Link href="/products" className={styles.cta}>
          Shop Now
        </Link>
      </div>

      <div className={styles.imageContainer}>
        <img
          src={heroImageUrl}
          alt="Laptop repair"
          className={styles.image}
        />
      </div>
    </section>
  );
};

export default Hero;
