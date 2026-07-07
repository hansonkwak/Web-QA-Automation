import { MOCK_PRODUCTS } from '../data/mockProducts';
import type { Product } from '../data/mockProducts';

const DELAY_MS = 500; // Simulated network delay for testing tools (e.g. Playwright) to wait for spinners

// Utility to simulate network request
export const withDelay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), DELAY_MS));
};

export const MockDb = {
  // Reset all local storage data to initial state (Useful for E2E tests `beforeEach`)
  reset: () => {
    localStorage.clear();
    localStorage.setItem('products', JSON.stringify(MOCK_PRODUCTS));
    
    // Seed default test user
    localStorage.setItem('users', JSON.stringify([{
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    }]));
    
    console.log('[MockDB] Reset to initial state with default test user.');
  },

  // Initialize if not present
  init: () => {
    if (!localStorage.getItem('products')) {
      MockDb.reset();
    }
    
    // Seed default test user if users array is empty
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      users.push({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
  },

  getProducts: async (
    page = 1,
    limit = 12,
    query = '',
    category = '',
    sort = 'newest'
  ): Promise<{ items: Product[], total: number }> => {
    const raw = localStorage.getItem('products');
    let products: Product[] = raw ? JSON.parse(raw) : MOCK_PRODUCTS;
    
    // Apply search query
    if (query) {
      const q = query.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Apply category filter
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Apply sorting
    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'popular') {
      products.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    // 'newest' is default (relying on initial order or could add explicit date field)

    const total = products.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return withDelay({
      items: products.slice(start, end),
      total
    });
  },

  getProductById: async (id: string): Promise<Product | null> => {
    const raw = localStorage.getItem('products');
    const products: Product[] = raw ? JSON.parse(raw) : MOCK_PRODUCTS;
    const product = products.find(p => p.id === id);
    return withDelay(product || null);
  },
};

// Global hook for E2E tests to trigger a reset
if (typeof window !== 'undefined') {
  (window as any).__resetMockData = MockDb.reset;
}
