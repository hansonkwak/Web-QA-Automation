import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Mock Auth State (for now)
  const isAuthenticated = !!localStorage.getItem('token');

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cart_updated', updateCartCount);
    return () => window.removeEventListener('cart_updated', updateCartCount);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        navigate('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/products`);
    }
  };

  return (
    <header className="bg-surface dark:bg-surface-container-lowest docked full-width top-0 shadow-[0px_4px_12px_rgba(26,43,60,0.05)] z-50 sticky" data-testid="header">
      <div className="flex justify-between items-center px-gutter py-unit max-w-container-max mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed" data-testid="logo-link">
            QA Shop
          </Link>
        </div>
        
        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <form className="w-full flex" onSubmit={handleSearch} data-testid="search-form">
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
            />
            <button type="submit" data-testid="search-button" className="hidden">Submit</button>
          </form>
        </div>

        {/* Navigation Links & Actions */}
        <nav className="flex items-center gap-6">
          <ul className="hidden md:flex items-center gap-6">
            <li>
              <Link to="/support" className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors duration-200" data-testid="nav-support">
                Support
              </Link>
            </li>
            {!isAuthenticated && (
              <li>
                <Link to="/login" className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors duration-200" data-testid="nav-login">
                  Login
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/mypage" className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors duration-200" data-testid="nav-mypage">
                    My Page
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors duration-200" data-testid="nav-logout">
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
          <div className="flex items-center gap-4">
            <Link to="/cart" aria-label="shopping_cart" className="text-on-surface-variant hover:text-secondary transition-colors duration-200 relative" data-testid="nav-cart">
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
              <span className="absolute -top-1 -right-1 bg-error text-on-error rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold" data-testid="cart-badge">{cartCount}</span>
            </Link>
            {isAuthenticated && (
              <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant text-[32px] mt-1 ml-0.5">person</span>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
