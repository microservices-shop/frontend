import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useCart } from '../store';
import { orderService } from '../api/order.service';
import { formatPrice } from '../types';
import { Button } from '../components/UI';
import { Loader2, AlertCircle, CheckCircle2, ShoppingCart } from 'lucide-react';

type CheckoutState = 
    | 'RESERVING' 
    | 'READY_TO_PAY' 
    | 'ERROR' 
    | 'PAYING' 
    | 'SUCCESS';

export const Checkout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    
    const [state, setState] = useState<CheckoutState>('RESERVING');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [errorAction, setErrorAction] = useState<{ label: string; to: string } | null>(null);
    
    // Store key in ref so it survives re-renders but doesn't trigger them
    const idempotencyKey = useRef<string>('');

    useEffect(() => {
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
    }, [user, navigate]);

    const performCheckout = async () => {
        setState('RESERVING');
        try {
            const data = await orderService.checkout(idempotencyKey.current);
            setOrderId(data.order_id);
            setTotalPrice(data.total_price);
            setState('READY_TO_PAY');
        } catch (err: any) {
            const status = err.response?.status;
            setErrorMsg(err.response?.data?.detail || 'Произошла непредвиденная ошибка');
            
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
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-bold font-display text-gray-900 mb-4 uppercase">🎉 Спасибо за заказ!</h2>
                <p className="text-gray-600 mb-8 text-lg max-w-md">
                    Заказ {orderId ? `#${orderId.slice(0, 8)}` : ''} успешно оформлен и оплачен. 
                    Информация о доставке отправлена на вашу почту.
                </p>
                <div className="flex gap-4">
                    <Link to="/orders">
                        <Button>Посмотреть мои заказы</Button>
                    </Link>
                    <Link to="/catalog">
                        <Button variant="outline">В каталог</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // state === 'READY_TO_PAY' || 'PAYING'
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white border hover:border-gray-300 transition-colors rounded-3xl p-8 max-w-md w-full shadow-sm text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-8 h-8 text-gray-700" />
                </div>
                
                <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Оформление заказа</h2>
                <p className="text-gray-500 text-sm mb-8">Товары успешно зарезервированы и готовы к оплате.</p>
                
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
                    <div className="flex justify-between items-center text-lg font-medium text-gray-700 mb-2">
                        <span>К оплате:</span>
                        <span className="text-2xl font-bold text-black">{formatPrice(totalPrice)}</span>
                    </div>
                    {orderId && (
                        <div className="text-xs text-gray-500 text-left mt-4 border-t border-gray-200 pt-4">
                            ID заказа: {orderId}
                        </div>
                    )}
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
                        `ОПЛАТИТЬ — ${formatPrice(totalPrice)}`
                    )}
                </Button>
            </div>
        </div>
    );
};
