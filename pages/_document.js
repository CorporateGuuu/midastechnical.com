import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/global.css" />
        <link rel="stylesheet" href="/css/components.css" />
        <link rel="stylesheet" href="/css/home.css" />
        <link rel="stylesheet" href="/css/animations.css" />
        <link rel="stylesheet" href="/css/fixes.css" />
        <link rel="stylesheet" href="/css/product-detail.css" />
        <link rel="stylesheet" href="/css/responsive.css" />
      </Head>
      <body className="safari-fix">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default React.memo(Document);
