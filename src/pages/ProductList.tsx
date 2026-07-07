import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MockDb } from '../services/mockDb';
import type { Product } from '../data/mockProducts';

export const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await MockDb.getProducts(page, limit, query, category, sort);
      setProducts(data.items);
      setTotal(data.total);
      setLoading(false);
    };
    fetchProducts();
  }, [page, query, category, sort]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="plp-loading">
        <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
      </div>
    );
  }

  return (
    <div data-testid="plp-page" className="w-full">
      {/* Page Header */}
      <div className="mb-8 border-b border-surface-variant pb-6">
        <h1 className="font-headline-lg text-headline-lg md:text-display-lg md:font-display-lg text-primary mb-2">
          {query ? `Search Results for "${query}"` : (category ? category : 'Our Products')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Showing {products.length} of {total} products
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar: Filters & Sort */}
        <aside className="w-full md:w-[250px] flex-shrink-0 sticky top-24">
          <div className="bg-surface rounded-lg shadow-[0px_4px_12px_rgba(26,43,60,0.05)] border border-surface-variant p-6">
            <h3 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">tune</span>
              Filters
            </h3>
            
            {/* Category Filter */}
            <div className="mb-6">
              <label className="block font-label-md text-label-md text-on-surface mb-2">Category</label>
              <div className="relative">
                <select 
                  value={category} 
                  onChange={e => handleFilterChange('category', e.target.value)}
                  className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded px-4 py-2 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors outline-none cursor-pointer"
                  data-testid="filter-category"
                >
                  <option value="">All Categories</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Sports">Sports</option>
                  <option value="Toys">Toys</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">Sort By</label>
              <div className="relative">
                <select 
                  value={sort} 
                  onChange={e => handleFilterChange('sort', e.target.value)}
                  className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded px-4 py-2 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors outline-none cursor-pointer"
                  data-testid="sort-select"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="flex justify-center items-center py-20" data-testid="loading-spinner">
              <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="product-list">
                {products.map(product => (
                  <Link 
                    to={`/product/${product.id}`} 
                    key={product.id} 
                    data-testid={`product-card-${product.id}`} 
                    className="group flex flex-col bg-surface rounded-xl border border-surface-variant overflow-hidden hover:shadow-[0px_8px_24px_rgba(26,43,60,0.12)] hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div className="w-full aspect-square bg-surface-container-lowest relative overflow-hidden flex items-center justify-center p-6 border-b border-surface-variant">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      />
                      {product.stock === 0 && (
                        <div className="absolute top-3 left-3 bg-error text-on-error font-code-sm text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">
                          Out of Stock
                        </div>
                      )}
                    </div>
                    {/* Details Container */}
                    <div className="p-5 flex flex-col flex-grow">
                      <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider mb-1">{product.category}</span>
                      <h4 className="font-headline-md text-body-md font-semibold text-primary mb-2 line-clamp-2 leading-tight group-hover:text-secondary transition-colors flex-grow">
                        {product.name}
                      </h4>
                      <div className="flex justify-between items-end mt-2">
                        <span className="font-headline-md text-headline-md text-primary">₩{product.price.toLocaleString()}</span>
                        <div className="flex items-center gap-1 text-secondary">
                          <span className="material-symbols-outlined fill-icon text-[14px]">star</span>
                          <span className="font-body-sm text-[12px] text-on-surface-variant">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12" data-testid="pagination">
                  <button 
                    className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                    disabled={page === 1} 
                    onClick={() => handlePageChange(page - 1)}
                    data-testid="prev-page-button"
                    aria-label="Previous page"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = page === pageNum;
                    return (
                      <button 
                        key={i} 
                        className={`w-10 h-10 flex items-center justify-center rounded font-label-md text-label-md transition-colors ${
                          isActive 
                            ? 'bg-primary text-on-primary border border-primary' 
                            : 'border border-outline-variant text-on-surface-variant hover:bg-surface-variant hover:text-primary'
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                        data-testid={`page-button-${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                    disabled={page === totalPages} 
                    onClick={() => handlePageChange(page + 1)}
                    data-testid="next-page-button"
                    aria-label="Next page"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-surface rounded-xl border border-surface-variant text-center" data-testid="no-products">
              <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">search_off</span>
              <h3 className="font-headline-md text-headline-md text-primary mb-2">No products found</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                We couldn't find any products matching your search criteria. Try adjusting your filters or search term.
              </p>
              <button 
                className="mt-6 font-label-md text-label-md text-secondary hover:underline"
                onClick={() => handleFilterChange('category', '')}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
