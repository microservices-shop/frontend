import React from 'react';
import { useAuth } from '../store';
import { MOCK_ORDERS } from '../constants';
import { Badge } from '../components/UI';
import { Navigate } from 'react-router-dom';

export const Orders = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/" />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-display font-extrabold uppercase mb-8 text-center">История заказов</h1>

            <div className="space-y-4">
                {MOCK_ORDERS.map(order => (
                    <div key={order.id} className="bg-white border rounded-2xl p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start border-b pb-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Заказ #{order.id}</p>
                                <p className="font-bold text-sm">Оформлен {order.date}</p>
                            </div>
                            <div className="text-right">
                                <Badge variant="gray">{
                                    order.status === 'Processing' ? 'В обработке' :
                                        order.status === 'Shipped' ? 'Отправлен' :
                                            order.status === 'Delivered' ? 'Доставлен' : order.status
                                }</Badge>
                                <p className="font-bold mt-1">₽{order.total.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 border">
                                        <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{item.name}</h4>
                                        <p className="text-xs text-gray-500">Кол-во: {item.quantity}</p>
                                        <div className="flex gap-2 mt-1">
                                            {Object.entries(item.attributes).map(([k, v]) => (
                                                <span key={k} className="text-[10px] bg-gray-100 px-1 rounded text-gray-600">{k}: {v}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {MOCK_ORDERS.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-500">
                        Заказы не найдены.
                    </div>
                )}
            </div>
        </div>
    );
};
