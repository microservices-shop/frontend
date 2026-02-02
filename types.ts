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

// ============================================
// API Types & Mapping
// ============================================

import type { ApiProduct, ApiCategory } from './api/product.service';

/**
 * Маппинг категории API -> локальный формат
 */
export function getCategorySlug(categoryId: number, categories: ApiCategory[]): string {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return 'unknown';

  // Маппинг названий на слаги
  const slugMap: Record<string, string> = {
    'Смартфоны': 'smartphones',
    'Ноутбуки': 'laptops',
    'Наушники': 'headphones',
    'Носимые устройства': 'wearables',
  };
  return slugMap[category.title] || category.title.toLowerCase();
}

/**
 * Преобразует товар из API формата в формат фронтенда
 */
export function mapApiProductToProduct(
  apiProduct: ApiProduct,
  categories: ApiCategory[] = []
): Product {
  return {
    id: String(apiProduct.id),
    name: apiProduct.title,
    price: apiProduct.price / 100, // конвертируем копейки в рубли
    description: apiProduct.description || '',
    category: getCategorySlug(apiProduct.category_id, categories),
    rating: apiProduct.rating,
    images: apiProduct.images.length > 0
      ? apiProduct.images
      : [getPlaceholderImage(apiProduct.category_id)],
    stock: apiProduct.stock,
    isActive: apiProduct.status === 'active',
    attributes: apiProduct.attributes,
  };
}

/**
 * Fallback изображение если images пустой
 */
function getPlaceholderImage(categoryId: number): string {
  const images: Record<number, string> = {
    1: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    2: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800',
    3: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
    4: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
  };
  return images[categoryId] || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800';
}

