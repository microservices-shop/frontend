import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../store';
import { MOCK_PRODUCTS } from '../constants';
import { Button, Modal, Alert, Input } from '../components/UI';
import { Trash2, ArrowRight, Minus, Plus } from 'lucide-react';

export const Cart = () => {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Re-hydrate items with current catalog data to check for price changes/availability
    const smartItems = items.map(item => {
        const liveProduct = MOCK_PRODUCTS.find(p => p.id === item.productId);

        // Fallback if product completely deleted from DB (shouldn't happen with soft delete, but safety first)
        if (!liveProduct) {
            return {
                ...item,
                isDeleted: true,
                livePrice: item.snapshotPrice,
                liveProduct: null,
                isPriceChanged: false,
                isUnavailable: true,
                stockLimit: 0
            };
        }

        return {
            ...item,
            liveProduct,
            livePrice: liveProduct.price,
            isPriceChanged: liveProduct.price !== item.snapshotPrice,
            isUnavailable: !liveProduct.isActive || liveProduct.stock === 0,
            stockLimit: liveProduct.stock,
            isDeleted: false
        };
    });

    const hasUnavailableItems = smartItems.some(i => i.isUnavailable || (i.isDeleted));
    const deliveryFee = 500;
    const finalTotal = cartTotal + deliveryFee; // Note: In real app, calculate total based on LIVE prices, here using snapshot for simplicity unless updated

    const handleCheckout = async () => {
        setCheckoutError(null);

        // 1. Auth Check
        if (!user) {
            await login(); // Prompt login
            return;
        }

        // 2. Stock Validation (Mocking Order Service 400 Bad Request)
        // Let's assume if any item quantity > liveProduct.stock, we throw error
        const stockErrorItem = smartItems.find(item =>
            item.liveProduct && item.quantity > item.liveProduct.stock
        );

        if (stockErrorItem) {
            setCheckoutError(`К сожалению, товар "${stockErrorItem.product.name}" остался в количестве ${stockErrorItem.stockLimit} шт.`);
            return;
        }

        if (hasUnavailableItems) {
            setCheckoutError("Некоторые товары в вашей корзине больше не доступны. Пожалуйста, удалите их.");
            return;
        }

        // 3. Success
        setIsSuccess(true);
        clearCart();
    };

    if (items.length === 0 && !isSuccess) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-display font-bold mb-4">ВАША КОРЗИНА ПУСТА</h2>
                <p className="text-gray-500 mb-8">Похоже, вы еще ничего не добавили в корзину.</p>
                <div className="flex justify-center">
                    <Link to="/catalog"><Button>Начать покупки</Button></Link>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="container mx-auto px-4 py-20 text-center animate-in zoom-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckIcon size={40} />
                </div>
                <h2 className="text-4xl font-display font-bold mb-4 uppercase">Спасибо за ваш заказ!</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Ваш заказ успешно оформлен. Вы получите подтверждение по электронной почте в ближайшее время.</p>
                <div className="flex justify-center gap-4">
                    <Link to="/orders"><Button variant="outline">Посмотреть заказ</Button></Link>
                    <Link to="/catalog"><Button>Продолжить покупки</Button></Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase mb-8">Корзина</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="flex-1 space-y-4">
                    {smartItems.map((item) => (
                        <div
                            key={item.productId}
                            className={`flex gap-4 p-4 rounded-2xl border transition-all ${item.isUnavailable || item.isDeleted ? 'bg-gray-100 opacity-70 border-gray-200' :
                                item.isPriceChanged ? 'bg-yellow-50 border-yellow-200 ring-1 ring-yellow-200' : 'bg-white border-gray-200'
                                }`}
                        >
                            <Link to={`/product/${item.productId}`} className="w-24 h-24 bg-white rounded-xl shrink-0 border border-gray-100 overflow-hidden group">
                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </Link>

                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Link to={`/product/${item.productId}`}>
                                            <h3 className="font-bold text-lg leading-tight transition-colors">{item.product.name}</h3>
                                        </Link>
                                        <p className="text-sm text-gray-500">
                                            {Object.entries(item.product.attributes).slice(0, 1).map(([k, v]) => `${k}: ${v}`)}
                                        </p>

                                        {/* Warnings */}
                                        {item.isPriceChanged && (
                                            <p className="text-xs text-yellow-700 font-bold mt-1">
                                                Цена изменилась: было ₽{item.snapshotPrice.toLocaleString()} → стало ₽{item.livePrice.toLocaleString()}
                                            </p>
                                        )}
                                        {(item.isUnavailable || item.isDeleted) && (
                                            <p className="text-xs text-red-600 font-bold mt-1">Товар больше не доступен</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                        aria-label="Удалить из корзины"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-end mt-2">
                                    <h4 className="text-xl font-bold">₽{item.livePrice.toLocaleString()}</h4>

                                    {!item.isUnavailable && !item.isDeleted && (
                                        <div className="bg-shop-gray rounded-full px-3 py-1 flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.productId, -1)}
                                                className="hover:text-black text-gray-600"
                                                aria-label="Уменьшить количество"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, 1)}
                                                className="hover:text-black text-gray-600"
                                                aria-label="Увеличить количество"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:w-96 shrink-0">
                    <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-24">
                        <h3 className="text-xl font-bold font-display mb-6">Детали заказа</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Сумма</span>
                                <span className="font-bold text-black">₽{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Доставка</span>
                                <span className="font-bold text-black">₽{deliveryFee.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between text-xl font-bold">
                                <span>Итого</span>
                                <span>₽{finalTotal.toLocaleString()}</span>
                            </div>
                        </div>



                        <Button fullWidth onClick={handleCheckout} disabled={hasUnavailableItems}>
                            Оформить заказ <ArrowRight size={20} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            <Modal
                isOpen={!!checkoutError}
                onClose={() => setCheckoutError(null)}
                title="Внимание"
            >
                <div className="text-center py-4">
                    <AlertCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-700 text-lg mb-6">{checkoutError}</p>
                    <Button fullWidth onClick={() => setCheckoutError(null)}>Обновить корзину</Button>
                </div>
            </Modal>
        </div>
    );
};

const CheckIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
)

const AlertCircleIcon = ({ className }: { className: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>

)