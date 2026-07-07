export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  colors?: string[];
  sizes?: string[];
}

const CATEGORIES = ['Clothing', 'Electronics', 'Home & Garden', 'Sports', 'Toys'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green'];
const SIZES = ['S', 'M', 'L', 'XL'];

export const generateMockProducts = (): Product[] => {
  return Array.from({ length: 100 }).map((_, index) => {
    const id = `prod-${index + 1}`;
    const category = CATEGORIES[index % CATEGORIES.length];
    
    // Simulate some out-of-stock items (every 10th item is out of stock)
    const stock = index % 10 === 0 ? 0 : Math.floor(Math.random() * 50) + 1;
    
    return {
      id,
      name: `${category} Item ${index + 1}`,
      price: (Math.floor(Math.random() * 100) + 10) * 1000, // 10,000 to 110,000 won
      category,
      image: `https://picsum.photos/seed/${id}/400/400`,
      description: `This is a detailed description for ${category} Item ${index + 1}. It has high quality and great reviews.`,
      stock,
      rating: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
      reviewCount: Math.floor(Math.random() * 500),
      isNew: index % 5 === 0, // Every 5th item is new
      colors: category === 'Clothing' ? COLORS : undefined,
      sizes: category === 'Clothing' ? SIZES : undefined,
    };
  });
};

export const MOCK_PRODUCTS = generateMockProducts();
