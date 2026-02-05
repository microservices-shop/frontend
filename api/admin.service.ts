import axios from 'axios';
import type { ApiProduct, ApiCategory } from './product.service';

// Используем отдельный axios instance для product-service на порту 8002
const PRODUCT_API_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:8002';
const productApi = axios.create({
    baseURL: PRODUCT_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================
// Типы для атрибутов
// ============================================

export interface ApiAttribute {
    id: number;
    category_id: number;
    title: string;
    type: string; // 'string' | 'number' | 'boolean' - может быть в любом регистре
    required: boolean;
}

export interface ProductCreatePayload {
    title: string;
    price: number;
    category_id: number;
    description?: string;
    images?: string[];
    stock?: number;
    attributes?: Record<string, string | number | boolean>;
}

// ============================================
// Admin Service Methods
// ============================================

const AdminService = {
    /**
     * Получить атрибуты категории
     */
    async getCategoryAttributes(categoryId: number): Promise<ApiAttribute[]> {
        const response = await productApi.get<ApiAttribute[]>(`/api/v1/categories/${categoryId}/attributes`);
        return response.data;
    },

    /**
     * Создать новый товар
     */
    async createProduct(data: ProductCreatePayload): Promise<ApiProduct> {
        const response = await productApi.post<ApiProduct>('/api/v1/products', data);
        return response.data;
    },

    /**
     * Обновить товар
     */
    async updateProduct(id: number, data: Partial<ProductCreatePayload>): Promise<ApiProduct> {
        const response = await productApi.patch<ApiProduct>(`/api/v1/products/${id}`, data);
        return response.data;
    },

    /**
     * Удалить товар
     */
    async deleteProduct(id: number): Promise<void> {
        await productApi.delete(`/api/v1/products/${id}`);
    },

    /**
     * Получить все категории
     */
    async getCategories(): Promise<ApiCategory[]> {
        const response = await productApi.get<ApiCategory[]>('/api/v1/categories');
        return response.data;
    },
};

export default AdminService;
