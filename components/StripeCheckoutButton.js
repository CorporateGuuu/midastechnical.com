import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { getStripe } from '../lib/stripe';

export default function StripeCheckoutButton({ shippingAddress }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create Stripe checkout session
      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipping_address: shippingAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        router.push(data.url);
      } else {
        // If no URL is provided, use the client-side Stripe redirect
        const stripe = await getStripe();
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-checkout">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn btn-primary checkout-button"
      >
        {loading ? 'Processing...' : 'Pay with Stripe'}
      </button>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
