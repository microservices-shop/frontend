import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store';
import { Navigate, Link } from 'react-router-dom';
import { orderService } from '../api/order.service';
import { PaginatedOrders, formatPrice, formatDate, formatOrderId, OrderListItem } from '../types';
import { Button } from '../components/UI';
import { PackageOpen, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

const OrderCardSkeleton = () => (
    <div className="bg-white border rounded-2xl p-6 mb-4 animate-pulse">
        <div className="flex justify-between items-start mb-6">
            <div>
                <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-gray-200 rounded-xl"></div>
            ))}
        </div>
        <div className="flex justify-end">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
    </div>
);

const OrderCard: React.FC<{ order: OrderListItem }> = ({ order }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const [maxVisible, setMaxVisible] = useState(6);
    const width = useWindowWidth();

    useEffect(() => {
        if (!listRef.current) return;
        
        const observer = new ResizeObserver((entries) => {
            const rect = entries[0].contentRect;
            const isMobile = window.innerWidth < 768;
            const itemWidth = isMobile ? 80 : 100;
            const itemGap = 8;
            
            // Точный математический расчет на основе ФАКТИЧЕСКОЙ ширины DOM-узла
            const calculated = Math.max(1, Math.floor((rect.width + itemGap) / (itemWidth + itemGap)));
            setMaxVisible(calculated);
        });
        
        observer.observe(listRef.current);
        return () => observer.disconnect();
    }, [width]);

    const hiddenCount = order.items.length - maxVisible;
    const hasHidden = hiddenCount > 0;

    const displayedItems = hasHidden ? order.items.slice(0, Math.max(1, maxVisible - 1)) : order.items;
    const finalHiddenCount = hasHidden ? order.items.length - displayedItems.length : 0;

    return (
        <Link
            to={`/orders/${order.id}`}
            className="block bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-4 hover:border-black hover:shadow-md transition-all group"
        >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                        Заказ от {formatDate(order.created_at)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{formatOrderId(order.id)}</p>
                </div>
                {/* Status isn't strictly requested per requirements "Статусы: Только completed... не отображаются", 
                    but we keep the layout clean */}
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div 
                    ref={listRef} 
                    className="flex flex-nowrap gap-2 flex-1 min-w-0 overflow-hidden"
                >
                    {displayedItems.map((item, idx) => (
                        <div key={idx} className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {item.product_image ? (
                                <img src={item.product_image} alt="Товар" className="w-full h-full object-cover" />
                            ) : (
                                <ImageOff className="w-8 h-8 text-gray-300" />
                            )}
                        </div>
                    ))}
                    {hasHidden && (
                        <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-xl border border-gray-100 overflow-hidden shrink-0">
                            {/* Blur last item as background */}
                            {order.items[displayedItems.length]?.product_image ? (
                                <img
                                    src={order.items[displayedItems.length].product_image!}
                                    className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
                                    alt="Еще товары"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gray-100 opacity-50 blur-sm"></div>
                            )}
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <span className="text-base md:text-lg font-bold text-gray-800 bg-white/80 px-2 py-1 rounded-md">
                                    +{finalHiddenCount}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:text-right shrink-0">
                    <p className="text-sm text-gray-500 mb-1">Итого:</p>
                    <p className="text-xl md:text-2xl font-bold text-black">{formatPrice(order.total_price)}</p>
                </div>
            </div>
        </Link>
    );
};

export const Orders = () => {
    const { user } = useAuth();
    const [data, setData] = useState<PaginatedOrders | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await orderService.getOrders(page, 10);
                setData(result);
            } catch (err: any) {
                console.error("Failed to load orders", err);
                setError("Не удалось загрузить данные");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
        // Scroll to top on page change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page, user]);

    if (!user) return <Navigate to="/" />;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase mb-8">Мои заказы</h1>

            {/* Error State */}
            {error && (
                <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => setPage(page)} variant="outline">Попробовать снова</Button>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div className="space-y-4">
                    <OrderCardSkeleton />
                    <OrderCardSkeleton />
                    <OrderCardSkeleton />
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && data?.items.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                    <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-gray-700">У вас пока нет заказов</h3>
                    <p className="text-gray-500 mb-6">Сделайте свой первый заказ, чтобы он появился здесь.</p>
                    <Link to="/catalog">
                        <Button>В каталог</Button>
                    </Link>
                </div>
            )}

            {/* Orders List */}
            {!loading && !error && data && data.items.length > 0 && (
                <div className="space-y-4">
                    <div className="mb-4 text-sm text-gray-500">
                        Всего заказов: {data.total}
                    </div>
                    {data.items.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}

                    {/* Pagination */}
                    {data.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-gray-100">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="hidden sm:inline ml-1 font-medium">Назад</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${p === page
                                            ? 'bg-black text-white'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                                disabled={page === data.pages}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center"
                            >
                                <span className="hidden sm:inline mr-1 font-medium">Далее</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
