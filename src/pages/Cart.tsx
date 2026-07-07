import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate network delay for cart load
    setLoading(true);
    setTimeout(() => {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);
      setLoading(false);
    }, 500);

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.key === 'cart') {
        const newCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(Array.isArray(newCart) ? newCart : []);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateQuantity = (key: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.key === key) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const removeItem = (key: string) => {
    const updated = cart.filter(item => item.key !== key);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="cart-loading">
        <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="w-full">
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg md:text-display-lg md:font-display-lg text-primary mb-2">Shopping Cart</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Review your items before proceeding to checkout.</p>
      </div>
      
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-lg shadow-[0px_4px_12px_rgba(26,43,60,0.05)] text-center" data-testid="empty-cart">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">shopping_cart</span>
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Your cart is empty</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">Looks like you haven't added any products yet.</p>
          <Link to="/products" className="bg-[#1A2B3C] text-white font-label-md text-label-md py-3 px-6 rounded hover:bg-[#121f2b] transition-colors" data-testid="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items (Left Column) */}
          <div className="flex-grow flex flex-col gap-4" data-testid="cart-items">
            {cart.map(item => (
              <div key={item.key} className="bg-surface rounded-lg shadow-[0px_4px_12px_rgba(26,43,60,0.05)] p-4 sm:p-gutter flex flex-col sm:flex-row gap-6 items-start sm:items-center group transition-shadow hover:shadow-[0px_6px_16px_rgba(26,43,60,0.08)]" data-testid={`cart-item-${item.key}`}>
                {/* Image */}
                <div className="w-[100px] h-[100px] flex-shrink-0 bg-surface-container-low rounded overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                {/* Details */}
                <div className="flex-grow flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-start">
                    <Link to={`/product/${item.productId}`} className="font-headline-md text-body-lg font-semibold text-primary hover:text-secondary transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <span className="font-headline-md text-body-lg font-bold text-primary whitespace-nowrap ml-4">
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-on-surface-variant font-body-sm text-body-sm mt-1">
                    {item.color && <span className="mr-3">Color: {item.color}</span>}
                    {item.size && <span>Size: {item.size}</span>}
                  </div>
                  {/* Actions */}
                  <div className="flex justify-between items-end mt-4 w-full">
                    {/* Quantity */}
                    <div className="flex items-center border border-outline-variant rounded">
                      <button 
                        className="px-3 py-1 text-on-surface hover:bg-surface-container transition-colors"
                        onClick={() => updateQuantity(item.key, -1)}
                        data-testid={`qty-minus-${item.key}`}
                        aria-label="Decrease quantity"
                      >-</button>
                      <span className="px-3 py-1 font-label-md text-label-md border-x border-outline-variant min-w-[40px] text-center" data-testid={`qty-value-${item.key}`}>
                        {item.quantity}
                      </span>
                      <button 
                        className="px-3 py-1 text-on-surface hover:bg-surface-container transition-colors"
                        onClick={() => updateQuantity(item.key, 1)}
                        data-testid={`qty-plus-${item.key}`}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                    {/* Remove */}
                    <button 
                      className="text-[#E74C3C] font-label-md text-label-md flex items-center gap-1 hover:opacity-80 transition-opacity"
                      onClick={() => removeItem(item.key)}
                      data-testid={`remove-item-${item.key}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-surface rounded-lg shadow-[0px_4px_12px_rgba(26,43,60,0.05)] p-gutter sticky top-24" data-testid="cart-summary">
              <h2 className="font-headline-md text-headline-md text-primary mb-6 border-b border-[#F1F5F9] pb-4">Order Summary</h2>
              <div className="flex flex-col gap-4 font-body-md text-body-md text-on-surface mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span data-testid="cart-subtotal">₩{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="text-[#27AE60] font-medium">Free</span>
                </div>
              </div>
              
              <div className="border-t border-[#F1F5F9] pt-4 mb-8">
                <div className="flex justify-between items-center font-headline-md text-headline-md text-primary font-bold">
                  <span>Total</span>
                  <span data-testid="cart-total">₩{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <button 
                className="w-full bg-[#1A2B3C] text-white font-label-md text-label-md py-3 px-4 rounded hover:bg-[#121f2b] transition-colors flex justify-center items-center gap-2"
                onClick={() => navigate('/checkout')}
                data-testid="checkout-btn"
              >
                Proceed to Checkout
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/products" className="font-body-sm text-body-sm text-secondary hover:underline flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
