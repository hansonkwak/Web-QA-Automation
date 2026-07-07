import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MockDb } from '../services/mockDb';
import type { Product } from '../data/mockProducts';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      if (id) {
        const data = await MockDb.getProductById(id);
        setProduct(data);
        if (data?.colors) setSelectedColor(data.colors[0]);
        if (data?.sizes) setSelectedSize(data.sizes[0]);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    
    setTimeout(() => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemKey = `${product.id}-${selectedColor}-${selectedSize}`;
      const existing = cart.find((item: any) => item.key === itemKey);
      
      if (existing) {
        const currentQty = existing.quantity || existing.qty || 0;
        const newQty = Math.min(product.stock, currentQty + quantity);
        if (currentQty + quantity > product.stock) {
          alert('Cannot exceed available stock!');
        }
        existing.quantity = newQty;
        existing.qty = newQty;
      } else {
        cart.push({
          key: itemKey,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          color: selectedColor,
          size: selectedSize,
          quantity,
          qty: quantity
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      setAddingToCart(false);
      window.dispatchEvent(new Event('cart_updated'));
      navigate('/cart');
    }, 1500); // 1.5s delay to show the adding state (from user's script)
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64" data-testid="pdp-loading">
      <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
    </div>
  );
  if (!product) return <div className="text-center py-16 text-on-surface-variant font-headline-md" data-testid="pdp-not-found">Product not found.</div>;

  return (
    <div data-testid="pdp-page" className="w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-medium">{product.name}</span>
      </nav>

      {/* Product Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24">
        {/* Left: Large Product Image */}
        <div className="w-full flex flex-col gap-4" data-testid="pdp-image-section">
          <div className="w-full aspect-[4/3] bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(26,43,60,0.05)] overflow-hidden border border-surface-variant relative flex items-center justify-center p-8">
            <img src={product.image} alt={product.name} className="object-contain w-full h-full" data-testid="pdp-main-image" />
          </div>
          {/* Mini Gallery (Static for now as in HTML) */}
          <div className="grid grid-cols-4 gap-4">
            <button className="aspect-square bg-surface border-2 border-secondary rounded-lg overflow-hidden flex items-center justify-center">
              <img src={product.image} alt={product.name} className="object-cover w-full h-full opacity-100" />
            </button>
            <button className="aspect-square bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex items-center justify-center hover:border-outline transition-colors opacity-70 hover:opacity-100">
              <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
            </button>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col" data-testid="pdp-info-section">
          <div className="mb-6">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest block mb-2">{product.category}</span>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4" data-testid="pdp-title">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center text-secondary" data-testid="pdp-rating">
                {Array.from({length: 5}).map((_, i) => (
                  <span key={i} className={`material-symbols-outlined text-[20px] ${i < Math.floor(product.rating) ? 'fill-icon' : ''}`}>
                    {i < Math.floor(product.rating) ? 'star' : (i < product.rating ? 'star_half' : 'star')}
                  </span>
                ))}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
            <div className="font-headline-lg text-headline-lg text-primary" data-testid="pdp-price">₩{product.price.toLocaleString()}</div>
          </div>
          
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed" data-testid="pdp-description">
            {product.description}
          </p>

          {/* Options Box (Gray) */}
          <div className="bg-surface-container-low p-6 rounded-xl border border-surface-variant mb-8 flex flex-col gap-6">
            {/* Color Options */}
            {product.colors && (
              <div>
                <div className="flex justify-between mb-3">
                  <span className="font-label-md text-label-md text-on-surface">Color</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{selectedColor}</span>
                </div>
                <div className="flex gap-3" data-testid="pdp-colors">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      aria-label={`Select ${color}`}
                      onClick={() => setSelectedColor(color)}
                      data-testid={`pdp-color-${color}`}
                      className={`w-10 h-10 rounded-full transition-all shadow-sm ${
                        selectedColor === color 
                          ? 'ring-2 ring-offset-2 ring-secondary ring-offset-surface-container-low' 
                          : 'border border-outline-variant hover:ring-2 hover:ring-offset-2 hover:ring-outline hover:ring-offset-surface-container-low'
                      }`}
                      style={{ backgroundColor: color.toLowerCase() === 'black' ? '#1A1A1A' : color.toLowerCase() === 'white' ? '#FFFFFF' : color.toLowerCase() }}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {/* Layout/Size Options */}
            {product.sizes && (
              <div>
                <div className="flex justify-between mb-3">
                  <span className="font-label-md text-label-md text-on-surface">Size / Layout</span>
                </div>
                <div className="flex flex-wrap gap-3" data-testid="pdp-sizes">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      data-testid={`pdp-size-${size}`}
                      className={`px-4 py-2 font-label-md text-label-md rounded shadow-sm transition-colors ${
                        selectedSize === size 
                          ? 'bg-surface-container-lowest border-2 border-secondary text-secondary' 
                          : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-outline'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-outline-variant my-2" />
            
            {/* Quantity & Stock */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface mb-2">Quantity</span>
                <div className="flex items-center border border-outline-variant rounded bg-surface-container-lowest overflow-hidden h-10 shadow-sm w-[120px]">
                  <button 
                    aria-label="Decrease quantity" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="pdp-qty-minus"
                    className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span 
                    aria-label="Quantity" 
                    className="w-full h-full flex items-center justify-center text-center border-none focus:ring-0 font-code-sm text-code-sm text-primary p-0 bg-transparent outline-none" 
                    data-testid="pdp-qty-value"
                  >
                    {quantity}
                  </span>
                  <button 
                    aria-label="Increase quantity" 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    data-testid="pdp-qty-plus"
                    className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
              <div className="text-right mt-6">
                <span className="font-body-sm text-body-sm text-secondary bg-secondary-fixed px-2 py-1 rounded">{product.stock} available</span>
              </div>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="flex flex-col gap-3">
            <button 
              className={`w-full bg-primary-container hover:bg-primary text-on-tertiary font-label-md text-label-md py-4 px-6 rounded shadow-[0px_4px_12px_rgba(26,43,60,0.05)] transition-all flex items-center justify-center gap-2 group ${addingToCart || product.stock === 0 ? 'opacity-80 cursor-not-allowed' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              data-testid="pdp-add-to-cart"
            >
              <span className={`material-symbols-outlined ${addingToCart ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`}>
                {addingToCart ? 'sync' : 'shopping_cart'}
              </span>
              <span>{product.stock === 0 ? 'Out of Stock' : (addingToCart ? 'Adding to Cart...' : `Add to Cart - ₩${product.price.toLocaleString()}`)}</span>
            </button>
            <div className="flex items-center justify-center gap-2 text-on-surface-variant font-body-sm text-body-sm mt-2">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>Free standard shipping on orders over ₩50,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications / Info Tabs */}
      <div className="border-t border-outline-variant pt-12 mb-24">
        <h2 className="font-headline-md text-headline-md text-primary mb-8">Technical Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-body-md text-body-md text-on-surface">
          <div className="flex justify-between py-3 border-b border-surface-variant">
            <span className="text-on-surface-variant">Category</span>
            <span className="font-code-sm text-code-sm">{product.category}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-surface-variant">
            <span className="text-on-surface-variant">Product ID</span>
            <span className="font-code-sm text-code-sm">{product.id}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-surface-variant">
            <span className="text-on-surface-variant">In Stock</span>
            <span className="font-code-sm text-code-sm">{product.stock > 0 ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="border-t border-outline-variant pt-12" data-testid="pdp-reviews-section">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">Customer Reviews</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-secondary">
                {Array.from({length: 5}).map((_, i) => (
                  <span key={i} className={`material-symbols-outlined text-[24px] ${i < Math.floor(product.rating) ? 'fill-icon' : ''}`}>
                    {i < Math.floor(product.rating) ? 'star' : (i < product.rating ? 'star_half' : 'star')}
                  </span>
                ))}
              </div>
              <span className="font-body-md text-body-md text-primary font-medium">{product.rating} out of 5</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Based on {product.reviewCount} verified reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Write Review */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {(() => {
              const orders = JSON.parse(localStorage.getItem('orders') || '[]');
              const hasPurchased = orders.some((order: any) => 
                order.items.some((item: any) => item.productId === product.id)
              );

              return hasPurchased ? (
                <div className="bg-surface shadow-[0px_4px_12px_rgba(26,43,60,0.05)] border border-surface-variant p-6 rounded-xl">
                  <h3 className="font-label-md text-label-md text-primary mb-4">Write a Review</h3>
                  <form className="flex flex-col gap-4">
                    <div>
                      <label className="font-body-sm text-body-sm text-on-surface-variant block mb-2" htmlFor="reviewText">Your Review</label>
                      <textarea 
                        id="reviewText"
                        className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none resize-none" 
                        placeholder="Share your thoughts about this product..." 
                        rows={4}
                        data-testid="review-textarea"
                      />
                    </div>
                    <button 
                      className="bg-primary-container text-on-tertiary font-label-md text-label-md py-2 px-4 rounded hover:bg-primary transition-colors self-start" 
                      type="button"
                      onClick={() => alert('Review submitted! (Mock)')}
                      data-testid="submit-review-btn"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-surface-container-low border border-dashed border-outline-variant p-6 rounded-xl text-center opacity-70">
                  <span className="material-symbols-outlined text-outline text-[32px] mb-2">info</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Only verified purchasers can write reviews for this product.</p>
                </div>
              );
            })()}
          </div>

          {/* Right Column: Review List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-surface shadow-[0px_4px_12px_rgba(26,43,60,0.05)] border border-surface-variant p-6 rounded-lg" data-testid="mock-review-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label-md text-label-md text-primary">Test User</span>
                    <span className="bg-secondary-fixed text-secondary font-code-sm text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide">Verified</span>
                  </div>
                  <div className="flex items-center text-secondary mb-2">
                    <span className="material-symbols-outlined fill-icon text-[16px]">star</span>
                    <span className="material-symbols-outlined fill-icon text-[16px]">star</span>
                    <span className="material-symbols-outlined fill-icon text-[16px]">star</span>
                    <span className="material-symbols-outlined fill-icon text-[16px]">star</span>
                    <span className="material-symbols-outlined fill-icon text-[16px]">star</span>
                  </div>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Purchased 2 days ago</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                Great product! Exactly as described.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
