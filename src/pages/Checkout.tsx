import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('cart') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const totalAmount = cart.reduce((acc: number, item: any) => {
    if (!item) return acc;
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || Number(item.qty) || 1;
    return acc + (price * qty);
  }, 0);

  useEffect(() => {
    const loadCart = () => {
      try {
        setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
      } catch {}
    };
    
    // Handle back/forward cache
    window.addEventListener('pageshow', loadCart);
    return () => window.removeEventListener('pageshow', loadCart);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    payment: 'card'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const newOrder = {
        id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        date: new Date().toISOString(),
        items: cart,
        total: totalAmount,
        status: 'Processing',
        shippingInfo: formData
      };
      
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart_updated'));
      
      setLoading(false);
      navigate('/order-success');
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">shopping_cart</span>
        <h2 className="font-headline-md text-headline-md text-primary mb-4">Your cart is empty</h2>
        <button className="bg-primary text-on-primary px-6 py-2 rounded" onClick={() => navigate('/products')}>Return to Shop</button>
      </div>
    );
  }

  return (
    <div data-testid="checkout-page" className="w-full">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Form */}
        <div className="flex-1">
          <form className="bg-surface rounded-xl shadow-[0px_4px_12px_rgba(26,43,60,0.05)] p-8 border border-surface-variant flex flex-col gap-6" onSubmit={handleSubmit} data-testid="checkout-form">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Shipping Information</h2>
            
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                data-testid="checkout-name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                data-testid="checkout-email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface">Shipping Address</label>
              <textarea 
                required
                rows={3}
                className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none resize-none" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                data-testid="checkout-address"
              />
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <label className="font-label-md text-label-md text-on-surface">Payment Method</label>
              <select 
                className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none cursor-pointer" 
                value={formData.payment}
                onChange={e => setFormData({...formData, payment: e.target.value})}
                data-testid="checkout-payment"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-container hover:bg-primary text-on-tertiary font-label-md text-label-md py-4 rounded transition-colors flex justify-center items-center gap-2"
              disabled={loading}
              data-testid="checkout-submit-btn"
            >
              {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-surface rounded-xl shadow-[0px_4px_12px_rgba(26,43,60,0.05)] p-8 border border-surface-variant sticky top-24">
            <h2 className="font-headline-md text-headline-md text-primary mb-6 border-b border-surface-variant pb-4">Order Summary</h2>
            
            <div className="flex flex-col gap-4 mb-6">
              {cart.filter(item => !!item).map((item: any) => (
                <div key={item.key || Math.random()} className="flex justify-between items-start" data-testid={`checkout-cart-item-${item.key || 'unknown'}`}>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-surface-container-low rounded overflow-hidden flex-shrink-0 border border-surface-variant">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-primary line-clamp-1">{item.name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md text-primary">₩{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-surface-variant pt-4 flex flex-col gap-2 mb-4 font-body-sm text-body-sm text-on-surface">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₩{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </div>

            <div className="border-t border-surface-variant pt-4 flex justify-between items-center font-headline-md text-headline-md text-primary font-bold">
              <span>Total</span>
              <span data-testid="checkout-total">₩{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
