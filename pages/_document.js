import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fonts will be loaded in _app.js */}
      </Head>
      <body className="safari-fix">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default React.memo(Document);
