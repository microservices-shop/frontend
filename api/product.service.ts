import api from './api';
import axios from 'axios';

// TODO: TEMPORARY - Direct connection to Product Service (No Gateway)
const PRODUCT_API_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:8002';
const productApi = axios.create({
    baseURL: PRODUCT_API_URL,
    withCredentials: true,
});

// ============================================
// API Response Types (соответствуют бэкенду)
// ============================================

export interface ApiCategory {
    id: number;
    title: string;
}

export interface ApiProduct {
    id: number;
    title: string;
    price: number;  // в копейках
    category_id: number;
    description: string | null;
    images: string[];
    stock: number;
    status: 'active' | 'archived';
    attributes: Record<string, string>;
    created_at: string;
    updated_at: string;
    category?: ApiCategory;
}

export interface ApiProductListResponse {
    items: ApiProduct[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

// ============================================
// Service Methods
// ============================================

const ProductService = {
    /**
     * Получить список товаров с пагинацией и сортировкой
     */
    async getProducts(
        page: number = 1,
        pageSize: number = 20,
        sortBy: 'price' | 'id' | 'title' | 'created_at' = 'id',
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<ApiProductListResponse> {
        const response = await productApi.get<ApiProductListResponse>('/api/v1/products', {
            params: { page, page_size: pageSize, sort_by: sortBy, sort_order: sortOrder }
        });
        return response.data;
    },

    /**
     * Получить товар по ID
     */
    async getProductById(id: number): Promise<ApiProduct> {
        const response = await productApi.get<ApiProduct>(`/api/v1/products/${id}`);
        return response.data;
    },

    /**
     * Получить все категории
     */
    async getCategories(): Promise<ApiCategory[]> {
        const response = await productApi.get<ApiCategory[]>('/api/v1/categories');
        return response.data;
    },
};

export default ProductService;
