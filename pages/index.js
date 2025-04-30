import Head from 'next/head';
import LandingNav from '../components/LandingNav';
import Hero from '../components/Hero/Hero';
import FeaturedProducts from '../components/FeaturedProducts/FeaturedProducts';
import ProductList from '../components/ProductList/ProductList';
import Footer from '../components/Footer/Footer';

// Simulating data from CSV since we can't use getStaticProps in this environment
const featuredProducts = [
  {
    id: 1,
    name: 'iPhone 13 Pro OLED Screen',
    category: 'Replacement Parts',
    price: 129.99,
    discount_percentage: 13.33,
    imageUrl: '/images/iphone-screen.svg',
    badge: 'Best Seller'
  },
  {
    id: 2,
    name: 'Professional Repair Tool Kit',
    category: 'Tools',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/repair-tools.svg',
    badge: 'New'
  },
  {
    id: 3,
    name: 'Samsung Galaxy S22 Battery',
    category: 'Batteries',
    price: 39.99,
    discount_percentage: 20,
    imageUrl: '/images/samsung-battery.svg',
    badge: '20% OFF'
  },
  {
    id: 4,
    name: 'iPad Pro 12.9" LCD Assembly',
    category: 'Replacement Parts',
    price: 199.99,
    discount_percentage: 0,
    imageUrl: '/images/ipad-screen.svg',
    badge: null
  }
];

const popularProducts = [
  {
    id: 5,
    name: 'iPhone 12 LCD Screen',
    category: 'iPhone Parts',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/iphone12-screen.svg'
  },
  {
    id: 6,
    name: 'Samsung Galaxy S21 Battery',
    category: 'Samsung Parts',
    price: 34.99,
    discount_percentage: 0,
    imageUrl: '/images/s21-battery.svg'
  },
  {
    id: 7,
    name: 'iPad Mini 5 Digitizer',
    category: 'iPad Parts',
    price: 79.99,
    discount_percentage: 10,
    imageUrl: '/images/ipad-mini.svg'
  },
  {
    id: 8,
    name: 'MacBook Pro Keyboard',
    category: 'MacBook Parts',
    price: 129.99,
    discount_percentage: 0,
    imageUrl: '/images/macbook-keyboard.svg'
  },
  {
    id: 9,
    name: 'Precision Screwdriver Set',
    category: 'Tools',
    price: 49.99,
    discount_percentage: 0,
    imageUrl: '/images/screwdriver-set.svg'
  },
  {
    id: 10,
    name: 'Heat Gun for Repairs',
    category: 'Tools',
    price: 69.99,
    discount_percentage: 15,
    imageUrl: '/images/heat-gun.svg'
  }
];

export default function Home() {
  const heroImageUrl = "/images/hero-repair.svg";

  return (
    <>
      <Head>
        <title>MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Your trusted partner for professional repair parts & tools. Find everything you need for phone, tablet, and laptop repairs." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0066cc" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="landing-hero">
        <LandingNav />
        <div className="landing-hero-overlay"></div>
        <div className="landing-hero-content">
          <h1>Midas Technical Solutions</h1>
          <p>Your trusted partner for professional repair parts & tools</p>
          <div className="landing-hero-buttons">
            <a href="/products" className="primary-button">Shop Now</a>
            <a href="/lcd-buyback" className="secondary-button">LCD Buyback</a>
          </div>
        </div>
        <div className="landing-hero-image">
          <img src={heroImageUrl} alt="Professional repair tools and parts" />
        </div>
      </div>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            <span>Why Choose MDTS?</span>
          </h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛠️</div>
              <h3>Quality Parts</h3>
              <p>All our parts are tested and guaranteed to meet or exceed OEM specifications.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Competitive Pricing</h3>
              <p>Get professional-grade parts and tools without the premium price tag.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Shipping</h3>
              <p>Orders ship within 24 hours with tracking provided on all packages.</p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedProducts products={featuredProducts} />
      <ProductList products={popularProducts} title="Popular Products" />

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Repair?</h2>
          <p>Browse our extensive catalog of repair parts and tools for all major device brands.</p>
          <a href="/products" className="cta-button">Shop All Products</a>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer-content">
            <div className="landing-footer-logo">
              <h3>MDTS</h3>
              <p>Midas Technical Solutions</p>
            </div>

            <div className="landing-footer-links">
              <div className="landing-footer-column">
                <h4>Shop</h4>
                <a href="/products">All Products</a>
                <a href="/categories">Categories</a>
                <a href="/lcd-buyback">LCD Buyback</a>
              </div>

              <div className="landing-footer-column">
                <h4>Company</h4>
                <a href="/about">About Us</a>
                <a href="/contact">Contact</a>
                <a href="/faq">FAQ</a>
              </div>

              <div className="landing-footer-column">
                <h4>Contact</h4>
                <p>Email: support@mdtstech.store</p>
                <p>Phone: +1 (240) 351-0511</p>
                <p>Vienna, VA 22182</p>
              </div>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <p>&copy; {new Date().getFullYear()} Midas Technical Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
