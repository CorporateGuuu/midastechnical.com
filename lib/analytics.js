import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';

export function AnalyticsProvider({ children }) {
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <>
      {/* Google Analytics 4 */}
      {GA_TRACKING_ID && (
        <>
          <GoogleAnalytics gaId={GA_TRACKING_ID} />
          <Script
            id="ga-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.gtag('config', '${GA_TRACKING_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                  custom_map: {
                    'custom_parameter_1': 'ecommerce_platform'
                  }
                });

                // Enhanced E-commerce tracking
                window.gtag('config', '${GA_TRACKING_ID}', {
                  custom_map: {
                    'custom_parameter_1': 'midastechnical_ecommerce'
                  },
                  send_page_view: false
                });
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager */}
      {GTM_ID && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      )}

      {children}
    </>
  );
}

// E-commerce tracking functions
export const trackPurchase = (transactionData) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionData.transactionId,
      value: transactionData.value,
      currency: transactionData.currency || 'USD',
      items: transactionData.items,
    });
  }
};

export const trackAddToCart = (item) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: item.price,
      items: [item],
    });
  }
};

export const trackViewItem = (item) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: item.price,
      items: [item],
    });
  }
};

export const trackBeginCheckout = (items) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const value = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: value,
      items: items,
    });
  }
};
