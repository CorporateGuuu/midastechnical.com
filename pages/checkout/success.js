import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function CheckoutSuccess() {
  const { data: session } = useSession();
  const router = useRouter();
  const { session_id } = router.query;

  // Redirect to orders page if user is authenticated
  useEffect(() => {
    if (session?.user) {
      const redirectTimer = setTimeout(() => {
        router.push('/user/orders');
      }, 5000);

      return () => clearTimeout(redirectTimer);
    }
  }, [session, router]);

  return (
    <div className="container">
      <div className="checkout-success">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h1>Payment Successful!</h1>
        
        <p>Thank you for your purchase. Your order has been received and is being processed.</p>
        
        {session?.user ? (
          <p>You will be redirected to your orders page in 5 seconds, or you can click the button below.</p>
        ) : (
          <p>Create an account to track your order and manage your purchases.</p>
        )}
        
        <div className="success-actions">
          {session?.user ? (
            <Link href="/user/orders" className="btn btn-primary">
              View Orders
            </Link>
          ) : (
            <Link href="/auth/register" className="btn btn-primary">
              Create Account
            </Link>
          )}
          
          <Link href="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
