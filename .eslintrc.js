module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable console warnings for production
    'no-console': 'off',
    
    // Ensure all links have proper rel attributes
    'react/jsx-no-target-blank': 'error',
    
    // Ensure all Next.js links use the Link component
    '@next/next/no-html-link-for-pages': 'error',
    
    // Disable manual stylesheet inclusion warning
    '@next/next/no-css-tags': 'off',
    
    // Disable other warnings as needed
    '@next/next/no-img-element': 'off',
  }
};
