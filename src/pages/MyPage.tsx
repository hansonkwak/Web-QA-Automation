import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    // Filter orders for this user if we had a real backend, but we'll just show all mock orders for now
    setOrders(savedOrders.reverse());
  }, [navigate]);

  if (!user) return null;

  return (
    <div data-testid="mypage" className="w-full">
      <div className="flex items-center gap-4 mb-8 border-b border-surface-variant pb-6">
        <div className="w-16 h-16 bg-primary-fixed text-primary rounded-full flex items-center justify-center font-display-lg text-headline-lg font-bold">
          {(user.name || 'User').charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary" data-testid="mypage-greeting">Hello, {user.name || 'User'}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{user.email || ''}</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-[250px] flex-shrink-0">
          <div className="bg-surface border border-surface-variant rounded-xl p-4 sticky top-24">
            <ul className="flex flex-col gap-2">
              <li>
                <button className="w-full text-left px-4 py-3 bg-secondary-fixed text-secondary font-label-md text-label-md rounded-lg flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                  Order History
                </button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-3 text-on-surface hover:bg-surface-container font-label-md text-label-md rounded-lg flex items-center gap-3 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  Account Settings
                </button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-3 text-on-surface hover:bg-surface-container font-label-md text-label-md rounded-lg flex items-center gap-3 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                  Wishlist
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <h2 className="font-headline-md text-headline-md text-primary mb-6">Order History</h2>
          
          {orders.length === 0 ? (
            <div className="bg-surface border border-surface-variant rounded-xl p-12 text-center text-on-surface-variant" data-testid="mypage-orders">
              <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">receipt_long</span>
              <p className="font-body-md text-body-md">You have no orders yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6" data-testid="mypage-orders">
              {orders.map((order: any) => (
                <div key={order.id} className="bg-surface border border-surface-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" data-testid={`order-item-${order.id}`}>
                  {/* Order Header */}
                  <div className="bg-surface-container-lowest border-b border-surface-variant p-4 md:px-6 md:py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex flex-wrap gap-x-8 gap-y-2 font-body-sm text-body-sm text-on-surface-variant">
                      <div className="flex flex-col">
                        <span className="font-bold uppercase tracking-wider text-[10px]">Order Placed</span>
                        <span className="text-on-surface">{new Date(order.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold uppercase tracking-wider text-[10px]">Total</span>
                        <span className="text-on-surface">₩{order.total.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold uppercase tracking-wider text-[10px]">Order #</span>
                        <span className="text-on-surface">{order.id}</span>
                      </div>
                    </div>
                    <div>
                      <span className="bg-secondary-fixed text-secondary px-3 py-1 rounded-full font-label-md text-label-md">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="p-4 md:p-6 flex flex-col gap-4">
                    {(order.items || []).map((item: any) => (
                      <div key={item.key || Math.random()} className="flex gap-4">
                        <div className="w-20 h-20 bg-surface-container-low border border-surface-variant rounded overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="font-headline-md text-body-lg text-primary line-clamp-1">{item.name}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">Qty: {item.quantity}</span>
                          <span className="font-label-md text-label-md text-primary mt-1">₩{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
