import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useCart } from '../store';
import { orderService } from '../api/order.service';
import { formatPrice, OrderItemDetail } from '../types';
import { Button } from '../components/UI';
import { Loader2, AlertCircle, CheckCircle2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CheckoutState =
    | 'RESERVING'
    | 'READY_TO_PAY'
    | 'ERROR'
    | 'PAYING'
    | 'SUCCESS';

export const Checkout = () => {
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { refreshCart } = useCart();

    const [state, setState] = useState<CheckoutState>('RESERVING');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [items, setItems] = useState<OrderItemDetail[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [errorAction, setErrorAction] = useState<{ label: string; to: string } | null>(null);

    // Store key in ref so it survives re-renders but doesn't trigger them
    const idempotencyKey = useRef<string>('');

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/');
            return;
        }

        // Generate key once
        if (!idempotencyKey.current) {
            idempotencyKey.current = crypto.randomUUID();
            performCheckout();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate, authLoading]);

    const performCheckout = async () => {
        setState('RESERVING');
        try {
            const data = await orderService.checkout(idempotencyKey.current);
            setOrderId(data.order_id);
            setTotalPrice(data.total_price);
            setItems(data.items || []);
            setState('READY_TO_PAY');
        } catch (err: any) {
            const status = err.response?.status;
            let detail = err.response?.data?.detail || 'Произошла непредвиденная ошибка';

            if (detail === 'Item out of stock') {
                detail = 'Недостаточно товара на складе';
            }

            setErrorMsg(detail);

            if (status === 400) {
                // Out of stock or empty cart
                setErrorAction({ label: 'Вернуться в корзину', to: '/cart' });
            } else if (status === 409) {
                setErrorMsg('Ваш заказ уже оформляется. Пожалуйста, подождите.');
                setErrorAction({ label: 'Мои заказы', to: '/orders' });
            } else {
                setErrorAction({ label: 'Попробовать снова', to: '/cart' });
            }
            setState('ERROR');
        }
    };

    const handlePay = async () => {
        if (!orderId) return;

        setState('PAYING');
        try {
            await orderService.pay(orderId);
            await refreshCart(); // RabbitMQ listener on backend clears the db, we just refresh local state
            setState('SUCCESS');
        } catch (err: any) {
            const status = err.response?.status;
            // E.g. 400 if already paid or canceled
            setErrorMsg(err.response?.data?.detail || 'Ошибка при оплате. Пожалуйста, попробуйте позже.');
            setErrorAction({ label: 'Мои заказы', to: '/orders' });
            setState('ERROR');
        }
    };

    // ------------- Renders based on state ------------- //

    if (state === 'RESERVING') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <Loader2 className="w-16 h-16 animate-spin text-gray-400 mb-6" />
                <h2 className="text-2xl font-bold font-display text-gray-800">Резервирование товаров...</h2>
                <p className="text-gray-500 mt-2 text-center max-w-sm">Пожалуйста, подождите, мы проверяем наличие товаров на складе.</p>
            </div>
        );
    }

    if (state === 'ERROR') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">Оформление не удалось</h2>
                <p className="text-gray-600 mb-8 max-w-md">{errorMsg}</p>
                {errorAction && (
                    <Link to={errorAction.to}>
                        <Button variant="outline">{errorAction.label}</Button>
                    </Link>
                )}
            </div>
        );
    }

    if (state === 'SUCCESS') {
        const containerVariants = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.3
                }
            }
        };

        const itemVariants = {
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: 'spring', stiffness: 100, damping: 15 }
            }
        };

        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                {/* Эффект импульса (Ripple) */}
                <motion.div
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className="absolute w-64 h-64 bg-green-200 rounded-full z-0 pointer-events-none"
                    style={{ top: '35%', left: '50%', x: '-50%', y: '-50%' }}
                />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 flex flex-col items-center"
                >
                    <motion.div
                        variants={itemVariants}
                        className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-10 shadow-lg shadow-green-100"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 260,
                                damping: 20,
                                delay: 0.2
                            }}
                        >
                            <CheckCircle2 className="w-12 h-12" />
                        </motion.div>
                    </motion.div>

                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl sm:text-5xl font-extrabold font-display text-gray-900 mb-4 tracking-tight"
                    >
                        🎉 СПАСИБО ЗА ЗАКАЗ!
                    </motion.h2>

                    <motion.p
                        variants={itemVariants}
                        className="text-gray-500 mb-10 text-lg sm:text-xl max-w-md font-medium"
                    >
                        Заказ {orderId ? (
                            <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">
                                #{orderId.slice(0, 8)}
                            </span>
                        ) : ''} <br className="hidden sm:block" />
                        успешно оформлен и оплачен.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link to="/orders" className="w-full sm:w-auto">
                            <Button className="w-full sm:px-8 py-4 text-lg shadow-md hover:shadow-lg transition-all active:scale-95">
                                Посмотреть мои заказы
                            </Button>
                        </Link>
                        <Link to="/catalog" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:px-8 py-4 text-lg border-gray-200 hover:bg-gray-50 transition-all active:scale-95">
                                В каталог
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // state === 'READY_TO_PAY' || 'PAYING'
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white border hover:border-gray-300 transition-colors rounded-3xl p-8 max-w-xl w-full shadow-sm text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-8 h-8 text-gray-700" />
                </div>

                <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Оформление заказа</h2>
                <p className="text-gray-500 text-sm mb-8">Товары успешно зарезервированы и готовы к оплате.</p>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 font-display">Состав заказа</h3>
                    <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-50">
                                    {item.product_image ? (
                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between self-stretch">
                                    <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-tight line-clamp-2">{item.product_name}</h4>
                                    <div className="mt-auto pt-2">
                                        <p className="text-sm font-medium text-gray-500">{item.quantity} шт. × {formatPrice(item.unit_price)}</p>
                                    </div>
                                </div>
                                <div className="text-lg sm:text-xl font-extrabold text-gray-900 whitespace-nowrap self-end pb-1">
                                    {formatPrice(item.unit_price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-2">
                        <div className="flex justify-between items-center text-lg font-medium text-gray-700 mb-1">
                            <span>К оплате:</span>
                            <span className="text-2xl font-bold text-black">{formatPrice(totalPrice)}</span>
                        </div>
                        {orderId && (
                            <div className="text-xs text-gray-500 text-left mt-2">
                                ID заказа: {orderId}
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    fullWidth
                    size="lg"
                    onClick={handlePay}
                    disabled={state === 'PAYING'}
                >
                    {state === 'PAYING' ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            ОБРАБОТКА...
                        </span>
                    ) : (
                        `ОПЛАТИТЬ ${formatPrice(totalPrice)}`
                    )}
                </Button>
            </div>
        </div>
    );
};
