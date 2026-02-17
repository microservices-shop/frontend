import { Order } from './types';

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-123",
    date: "2023-10-15",
    status: 'Delivered',
    total: 170000,
    items: [
      {
        name: "iPhone 15 Pro Max",
        price: 135000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800",
        attributes: { "Память": "256ГБ" }
      },
      {
        name: "Sony WH-1000XM5",
        price: 35000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
        attributes: { "Тип": "Полноразмерные" }
      }
    ]
  }
];