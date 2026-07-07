import React, { useEffect, useState } from 'react';
import { MockDb } from '../services/mockDb';
import type { Product } from '../data/mockProducts';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await MockDb.getProducts(1, 12);
      setProducts(data.items);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div data-testid="home-page" className="w-full flex flex-col gap-12">
      {/* Hero Section */}
      <section className="bg-primary text-on-primary rounded-2xl py-16 px-8 md:px-16 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed-dim opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary opacity-20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <h1 data-testid="hero-title" className="font-display-lg text-headline-lg md:text-display-lg font-bold mb-4 relative z-10">
          Welcome to QA Shop
        </h1>
        <p className="font-body-lg text-body-lg text-on-primary-fixed mb-8 max-w-2xl relative z-10">
          The perfect dummy application for your E2E tests. Explore our beautifully crafted mock products.
        </p>
        <Link to="/products" className="bg-secondary text-on-secondary hover:bg-secondary-fixed hover:text-on-secondary-fixed px-8 py-3 rounded-full font-label-md text-label-md transition-colors relative z-10 shadow-md">
          Shop Now
        </Link>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-end mb-8 border-b border-surface-variant pb-4">
          <h2 className="font-headline-lg text-headline-lg text-primary">Featured Products</h2>
          <Link to="/products" className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-1">
            View All
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20" data-testid="loading-spinner">
            <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="product-list">
            {products.map(product => (
              <Link 
                to={`/product/${product.id}`} 
                key={product.id} 
                data-testid={`product-card-${product.id}`} 
                className="group flex flex-col bg-surface rounded-xl border border-surface-variant overflow-hidden hover:shadow-[0px_8px_24px_rgba(26,43,60,0.12)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-full aspect-square bg-surface-container-lowest relative overflow-hidden flex items-center justify-center p-6 border-b border-surface-variant">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider mb-1">{product.category}</span>
                  <h4 className="font-headline-md text-body-md font-semibold text-primary mb-2 line-clamp-2 leading-tight group-hover:text-secondary transition-colors flex-grow">
                    {product.name}
                  </h4>
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-headline-md text-headline-md text-primary">₩{product.price.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
