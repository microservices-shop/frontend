import api from './api';
import { OrderListItem, PaginatedOrders, OrderDetail, CheckoutResponse, PayResponse } from '../types';

export const orderService = {
  /**
   * Получить список заказов пользователя с пагинацией
   */
  async getOrders(page: number = 1, pageSize: number = 10): Promise<PaginatedOrders> {
    const response = await api.get('/api/v1/orders', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  /**
   * Получить детали конкретного заказа
   */
  async getOrderById(orderId: string): Promise<OrderDetail> {
    const response = await api.get(`/api/v1/orders/${orderId}`);
    return response.data;
  },

  /**
   * Оформить заказ (создать новый заказ из текущей корзины пользователя)
   */
  async checkout(idempotencyKey: string): Promise<CheckoutResponse> {
    const response = await api.post(
      '/api/v1/orders/checkout',
      {},
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    return response.data;
  },

  /**
   * Оплатить заказ
   */
  async pay(orderId: string): Promise<PayResponse> {
    const response = await api.post(`/api/v1/orders/${orderId}/pay`);
    return response.data;
  }
};
