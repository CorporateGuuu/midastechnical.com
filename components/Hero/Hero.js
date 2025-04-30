import Link from 'next/link';
import styles from './Hero.module.css';

const Hero = ({ heroImageUrl = "/images/hero-repair.jpg" }) => {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <h1 className={styles.title}>Midas Technical Solutions</h1>
        <p className={styles.subtitle}>
          Your trusted partner for professional repair parts & tools
        </p>
        <div className={styles.ctaContainer}>
          <Link href="/products" className={styles.cta}>
            Shop Now
          </Link>
          <Link href="/lcd-buyback" className={styles.secondaryCta}>
            LCD Buyback
          </Link>
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
