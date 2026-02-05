import api from './api';
import type { ApiProduct, ApiCategory } from './product.service';

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
        const response = await api.get<ApiAttribute[]>(`/api/v1/categories/${categoryId}/attributes`);
        return response.data;
    },

    /**
     * Создать новый товар
     */
    async createProduct(data: ProductCreatePayload): Promise<ApiProduct> {
        const response = await api.post<ApiProduct>('/api/v1/products', data);
        return response.data;
    },

    /**
     * Обновить товар
     */
    async updateProduct(id: number, data: Partial<ProductCreatePayload>): Promise<ApiProduct> {
        const response = await api.patch<ApiProduct>(`/api/v1/products/${id}`, data);
        return response.data;
    },

    /**
     * Удалить товар
     */
    async deleteProduct(id: number): Promise<void> {
        await api.delete(`/api/v1/products/${id}`);
    },

    /**
     * Получить все категории
     */
    async getCategories(): Promise<ApiCategory[]> {
        const response = await api.get<ApiCategory[]>('/api/v1/categories');
        return response.data;
    },
};

export default AdminService;
