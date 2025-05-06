import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="safari-fix">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
