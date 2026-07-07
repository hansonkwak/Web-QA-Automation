import React from 'react';
import { Link } from 'react-router-dom';

export const OrderSuccess: React.FC = () => {
  return (
    <div data-testid="order-success-page" className="w-full flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-surface rounded-2xl shadow-lg border border-surface-variant p-12 max-w-lg w-full text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-secondary-fixed rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[40px] text-secondary">check_circle</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-4">Order Successful!</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          Thank you for your purchase. Your order has been placed successfully. You can track your order status in your account page.
        </p>
        <Link 
          to="/" 
          className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 px-8 rounded transition-colors"
          data-testid="continue-shopping-btn"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};
