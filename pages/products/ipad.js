import Head from 'next/head';
import Header from '../../components/Header/Header';
import ProductList from '../../components/ProductList/ProductList';
import Footer from '../../components/Footer/Footer';

// Sample iPad parts data
const ipadParts = [
  {
    id: 301,
    name: 'iPad Pro 12.9" LCD Assembly',
    category: 'iPad Parts',
    price: 199.99,
    discount_percentage: 10,
    imageUrl: '/images/placeholder.svg',
    badge: '10% OFF'
  },
  {
    id: 302,
    name: 'iPad Mini 5 Digitizer',
    category: 'iPad Parts',
    price: 79.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 303,
    name: 'iPad Air 4 Battery Replacement',
    category: 'iPad Parts',
    price: 69.99,
    discount_percentage: 15,
    imageUrl: '/images/placeholder.svg',
    badge: '15% OFF'
  },
  {
    id: 304,
    name: 'iPad 9th Gen Charging Port Flex',
    category: 'iPad Parts',
    price: 34.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  }
];

export default function IPadParts() {
  return (
    <>
      <Head>
        <title>iPad Parts - Midas Technical Solutions</title>
        <meta name="description" content="High-quality iPad replacement parts for all models. Screens, digitizers, batteries, charging ports, and more." />
      </Head>
      
      <Header />
      
      <main>
        <div className="container" style={{ padding: '40px 20px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>iPad Parts</h1>
          <p style={{ marginBottom: '2rem' }}>
            Find high-quality replacement parts for all iPad models. We offer screens, digitizers, batteries, 
            charging ports, and more to help you repair your iPad.
          </p>
          
          <ProductList products={ipadParts} title="iPad Replacement Parts" />
        </div>
      </main>
      
      <Footer />
    </>
  );
}
