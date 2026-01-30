export enum Category {
  SMARTPHONES = "smartphones",
  LAPTOPS = "laptops",
  HEADPHONES = "headphones",
  WEARABLES = "wearables"
}

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.SMARTPHONES]: "Смартфоны",
  [Category.LAPTOPS]: "Ноутбуки",
  [Category.HEADPHONES]: "Наушники",
  [Category.WEARABLES]: "Носимые устройства"
};

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  category: Category | string;
  rating: number;
  images: string[];
  stock: number; // For inventory check
  isActive: boolean; // For soft delete check
  attributes: Record<string, string>; // JSONB equivalent
}

export interface CartItem {
  productId: string;
  quantity: number;
  snapshotPrice: number; // Price when added to cart
  product: Product; // Hydrated product data (simulating join or fetch)
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture_url: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered';
  total: number;
  items: {
    name: string;
    price: number;
    quantity: number;
    image: string;
    attributes: Record<string, string>; // Snapshot of attributes
  }[];
}