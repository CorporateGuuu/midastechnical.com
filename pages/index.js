import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Hero from '../components/Hero/Hero';
import FeaturedProducts from '../components/FeaturedProducts/FeaturedProducts';
import ProductList from '../components/ProductList/ProductList';
import CategoryCards from '../components/CategoryCards/CategoryCards';
import Testimonials from '../components/Testimonials/Testimonials';
import TrustBadges from '../components/TrustBadges/TrustBadges';
import RecentlyViewed from '../components/RecentlyViewed/RecentlyViewed';
import PersonalizedRecommendations from '../components/Recommendations/PersonalizedRecommendations';
import { MarketplaceIntegration } from '../components/Marketplace';

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

function Home() {
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

      {/* Hero Section */}
      <Hero heroImageUrl={heroImageUrl} />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Category Cards */}
      <CategoryCards />

      {/* Featured Products */}
      <FeaturedProducts products={featuredProducts} />

      {/* Testimonials */}
      <Testimonials />

      {/* Popular Products */}
      <ProductList products={popularProducts} title="Popular Products" />

      {/* Personalized Recommendations */}
      <PersonalizedRecommendations
        title="Recommended For You"
        subtitle="Based on your browsing history and preferences"
        limit={4}
      />

      {/* Recently Viewed */}
      <RecentlyViewed
        title="Recently Viewed Products"
        subtitle="Products you've viewed recently"
      />

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Genuine Apple Parts Program</h2>
          <p>Midas Technical Solutions is proud to offer genuine Apple parts for reliable repairs. Learn more about our GAPP program.</p>
          <Link href="/gapp" className="cta-button">Learn More</Link>
        </div>
      </section>
    </>
  );
}

export default React.memo(Home);
