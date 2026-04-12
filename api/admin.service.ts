import api from './api';
import type { ApiProduct, ApiCategory } from './product.service';

// ============================================
// Типы для атрибутов и категорий
// ============================================

export interface ApiAttribute {
    id: number;
    category_id: number;
    title: string;
    type: string; // 'string' | 'number' | 'boolean'
    required: boolean;
    category?: ApiCategory;
}

export interface CategoryCreatePayload {
    title: string;
}

export interface AttributeCreatePayload {
    category_id: number;
    title: string;
    type: string;
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
    // --- Products ---
    async createProduct(data: ProductCreatePayload): Promise<ApiProduct> {
        const response = await api.post<ApiProduct>('/api/products', data);
        return response.data;
    },

    async updateProduct(id: number, data: Partial<ProductCreatePayload>): Promise<ApiProduct> {
        const response = await api.patch<ApiProduct>(`/api/products/${id}`, data);
        return response.data;
    },

    async deleteProduct(id: number): Promise<void> {
        await api.delete(`/api/products/${id}`);
    },

    // --- Categories ---
    async getCategories(): Promise<ApiCategory[]> {
        const response = await api.get<ApiCategory[]>('/api/categories');
        return response.data;
    },

    async createCategory(data: { title: string }): Promise<ApiCategory> {
        const response = await api.post<ApiCategory>('/api/categories', data);
        return response.data;
    },

    async updateCategory(id: number, data: { title: string }): Promise<ApiCategory> {
        const response = await api.patch<ApiCategory>(`/api/categories/${id}`, data);
        return response.data;
    },

    async deleteCategory(id: number): Promise<void> {
        await api.delete(`/api/categories/${id}`);
    },

    // --- Attributes ---
    async getAttributes(categoryId?: number): Promise<ApiAttribute[]> {
        const params = categoryId ? { category_id: categoryId } : {};
        const response = await api.get<ApiAttribute[]>('/api/attributes', { params });
        return response.data;
    },

    async getCategoryAttributes(categoryId: number): Promise<ApiAttribute[]> {
        const response = await api.get<ApiAttribute[]>(`/api/categories/${categoryId}/attributes`);
        return response.data;
    },

    async createAttribute(data: AttributeCreatePayload): Promise<ApiAttribute> {
        const response = await api.post<ApiAttribute>('/api/attributes', data);
        return response.data;
    },

    async updateAttribute(id: number, data: Partial<AttributeCreatePayload>): Promise<ApiAttribute> {
        const response = await api.patch<ApiAttribute>(`/api/attributes/${id}`, data);
        return response.data;
    },

    async deleteAttribute(id: number): Promise<void> {
        await api.delete(`/api/attributes/${id}`);
    },
};

export default AdminService;
