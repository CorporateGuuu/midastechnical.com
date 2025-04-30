import { useState, useEffect } from 'react';
import Head from 'next/head';
import FirebaseAuth from '../components/FirebaseAuth';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const FirebaseAuthPage = () => {
  return (
    <div>
      <Head>
        <title>Firebase Authentication | MDTS Tech</title>
        <meta name="description" content="Sign in or create an account using Firebase Authentication" />
      </Head>

      <Header />

      <main style={{ padding: '40px 20px', minHeight: 'calc(100vh - 200px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Firebase Authentication</h1>
          <FirebaseAuth />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FirebaseAuthPage;
