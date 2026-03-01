import api from './api';

export interface ApiCartItem {
    id: string;
    product_id: number;
    quantity: number;
    product_name: string;
    product_price: number;
    product_image: string | null;
    price_changed: boolean;
    current_price: number | null;
    out_of_stock: boolean;
    product_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface ApiCartResponse {
    items: ApiCartItem[];
    total_price: number;
    total_items: number;
}

export const CartService = {
    /**
     * Получить текущую корзину пользователя
     */
    async getCart(): Promise<ApiCartResponse> {
        const response = await api.get<ApiCartResponse>('/api/cart');
        return response.data;
    },

    /**
     * Добавить товар в корзину
     */
    async addItem(productId: number, quantity: number = 1): Promise<ApiCartItem> {
        const response = await api.post<ApiCartItem>('/api/cart/items', {
            product_id: productId,
            quantity: quantity,
        });
        return response.data;
    },

    /**
     * Обновить количество товара в корзине
     */
    async updateQuantity(itemId: string, quantity: number): Promise<ApiCartItem> {
        const response = await api.patch<ApiCartItem>(`/api/cart/items/${itemId}`, {
            quantity: quantity,
        });
        return response.data;
    },

    /**
     * Удалить товар из корзины
     */
    async removeItem(itemId: string): Promise<void> {
        await api.delete(`/api/cart/items/${itemId}`);
    },

    /**
     * Очистить корзину полностью
     */
    async clearCart(): Promise<void> {
        await api.delete('/api/cart');
    },
};
