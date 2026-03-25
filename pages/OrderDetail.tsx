import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store';
import { orderService } from '../api/order.service';
import { OrderDetail as OrderDetailType, formatPrice, formatDate, formatOrderId } from '../types';
import { Button } from '../components/UI';
import { ArrowLeft, ImageOff, PackageX } from 'lucide-react';

const OrderItemSkeleton = () => (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 animate-pulse">
        <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-gray-200 rounded-xl shrink-0"></div>
        <div className="flex-1">
            <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
    </div>
);

export const OrderDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [order, setOrder] = useState<OrderDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!user || !id) return;

        const loadOrderDetail = async () => {
            setLoading(true);
            setError(null);
            setNotFound(false);
            try {
                const data = await orderService.getOrderById(id);
                setOrder(data);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setError("Не удалось загрузить данные заказа");
                }
            } finally {
                setLoading(false);
            }
        };

        loadOrderDetail();
        window.scrollTo(0, 0);
    }, [id, user]);

    // Error states handling
    if (!user) return null; // handled via route/App.tsx later or redirect

    if (notFound) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
                <PackageX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-3xl font-display font-bold mb-2">Заказ не найден</h2>
                <p className="text-gray-500 mb-8">Возможно, вы ввели неверную ссылку или заказ был удален.</p>
                <Link to="/orders">
                    <Button>Вернуться к заказам</Button>
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
                <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Ошибка</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <Button 
                            onClick={() => window.location.reload()} 
                            variant="outline"
                        >
                            Попробовать снова
                        </Button>
                        <Link to="/orders">
                            <Button>К заказам</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header / Back */}
            <button 
                onClick={() => navigate('/orders')} 
                className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors font-medium group"
            >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                К списку заказов
            </button>

            {loading ? (
                <div>
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
                    <div className="bg-white border rounded-3xl p-6 md:p-8">
                        <OrderItemSkeleton />
                        <OrderItemSkeleton />
                        <div className="mt-8 flex justify-end">
                            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ) : order ? (
                <>
                    <h1 className="text-3xl font-display font-extrabold mb-8">
                        Заказ от {formatDate(order.created_at)}
                    </h1>

                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden relative shadow-sm">
                        {/* Items list */}
                        <div className="p-6 md:p-8">
                            <div className="space-y-0">
                                {order.items.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`flex gap-3 sm:gap-4 py-6 ${
                                            idx !== order.items.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                    >
                                        {/* Image */}
                                        <Link 
                                            to={`/product/${item.product_id}`} 
                                            className="w-20 h-20 sm:w-[100px] sm:h-[100px] bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0 group flex items-center justify-center"
                                        >
                                            {item.product_image ? (
                                                <img 
                                                    src={item.product_image} 
                                                    alt={item.product_name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <ImageOff className="w-8 h-8 text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                                            )}
                                        </Link>
                                        
                                        {/* Content */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <Link 
                                                    to={`/product/${item.product_id}`}
                                                    className="text-base sm:text-lg font-bold text-gray-900 hover:underline line-clamp-2"
                                                >
                                                    {item.product_name}
                                                </Link>
                                            </div>
                                            
                                            <div className="flex flex-wrap justify-between items-end gap-2 mt-2">
                                                <div className="text-sm text-gray-700 font-medium bg-gray-50 px-3 py-1 rounded-lg w-fit">
                                                    {formatPrice(item.unit_price)} <span className="text-gray-400 font-normal mx-1">×</span> {item.quantity} шт.
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-lg text-black">
                                                        {formatPrice(item.unit_price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total Section */}
                        <div className="bg-gray-50 border-t border-gray-100 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
                            <div className="text-gray-500 text-sm">
                                Номер заказа: <span className="text-black font-medium text-base ml-1">{formatOrderId(order.id)}</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-display font-bold text-black border-none">
                                <span className="text-base text-gray-500 mr-2 font-normal tracking-normal">Итого:</span> 
                                {formatPrice(order.total_price)}
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};
