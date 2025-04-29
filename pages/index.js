import Head from 'next/head';
import Header from '../components/Header/Header';
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
    imageUrl: '/images/placeholder.svg',
    badge: 'Best Seller'
  },
  {
    id: 2,
    name: 'Professional Repair Tool Kit',
    category: 'Tools',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg',
    badge: 'New'
  },
  {
    id: 3,
    name: 'Samsung Galaxy S22 Battery',
    category: 'Batteries',
    price: 39.99,
    discount_percentage: 20,
    imageUrl: '/images/placeholder.svg',
    badge: '20% OFF'
  },
  {
    id: 4,
    name: 'iPad Pro 12.9" LCD Assembly',
    category: 'Replacement Parts',
    price: 199.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg',
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
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 6,
    name: 'Samsung Galaxy S21 Battery',
    category: 'Samsung Parts',
    price: 34.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 7,
    name: 'iPad Mini 5 Digitizer',
    category: 'iPad Parts',
    price: 79.99,
    discount_percentage: 10,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 8,
    name: 'MacBook Pro Keyboard',
    category: 'MacBook Parts',
    price: 129.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 9,
    name: 'Precision Screwdriver Set',
    category: 'Tools',
    price: 49.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 10,
    name: 'Heat Gun for Repairs',
    category: 'Tools',
    price: 69.99,
    discount_percentage: 15,
    imageUrl: '/images/placeholder.svg'
  }
];

export default function Home() {
  const heroImageUrl = "/images/placeholder.svg";

  return (
    <>
      <Head>
        <title>MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Your trusted partner for professional repair parts & tools. Find everything you need for phone, tablet, and laptop repairs. Quality parts, tools, and accessories at competitive prices." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <Hero heroImageUrl={heroImageUrl} />
        <FeaturedProducts products={featuredProducts} />
        <ProductList products={popularProducts} title="Popular Products" />
      </main>

      <Footer />
    </>
  );
}
