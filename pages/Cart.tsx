import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart, useAuth } from '../store';
import { Button, Modal } from '../components/UI';
import { Trash2, ArrowRight, Minus, Plus, Loader2, ArrowDown, ArrowUp } from 'lucide-react';
import type { ApiCartItem } from '../api/cart.service';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartItemCardProps {
    item: ApiCartItem;
    isPending: boolean;
    onToggle: (id: string, selected: boolean) => void;
    onRemove: (id: string) => void;
    onQuantity: (id: string, qty: number) => void;
    unavailable?: boolean;
}

// ─── CartItemCard ─────────────────────────────────────────────────────────────
const CartItemCard = React.memo(({
    item,
    isPending,
    onToggle,
    onRemove,
    onQuantity,
    unavailable = false,
}: CartItemCardProps) => {
    const actualPrice = Number(item.current_price ?? item.product_price) / 100;
    const oldPrice = Number(item.product_price) / 100;
    const priceDiff = actualPrice - oldPrice;
    const isPriceLower = priceDiff < 0;

    return (
        <div
            className={`flex gap-4 p-4 rounded-2xl border transition-all ${unavailable
                ? 'bg-gray-50 border-gray-200'
                : item.is_selected
                    ? 'bg-white border-gray-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
        >
            {/* Чекбокс */}
            {!unavailable && (
                <div className="flex items-center shrink-0">
                    <CartCheckbox
                        checked={item.is_selected}
                        disabled={isPending}
                        onChange={(checked) => onToggle(item.id, checked)}
                        ariaLabel={`Выбрать ${item.product_name}`}
                    />
                </div>
            )}

            {/* Фото */}
            <Link
                to={`/product/${item.product_id}`}
                className="w-24 h-24 bg-white rounded-xl shrink-0 border border-gray-100 overflow-hidden group"
            >
                {item.product_image ? (
                    <img
                        src={item.product_image}
                        alt={item.product_name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${unavailable ? 'grayscale opacity-60' : 'group-hover:scale-105'
                            }`}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        Нет фото
                    </div>
                )}
            </Link>

            {/* Контент */}
            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <Link to={`/product/${item.product_id}`}>
                            <h3
                                className={`font-bold text-lg leading-tight hover:underline ${unavailable ? 'text-gray-400' : ''
                                    }`}
                            >
                                {item.product_name}
                            </h3>
                        </Link>

                        {unavailable && (
                            <p className="text-xs text-red-500 font-semibold mt-1">Закончился</p>
                        )}
                    </div>

                    <button
                        onClick={() => onRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        aria-label="Удалить из корзины"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="flex justify-between items-end mt-2">
                    <div>
                        {item.price_changed && !unavailable && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-400 line-through">
                                    ₽{oldPrice.toLocaleString()}
                                </span>
                                <span
                                    className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${isPriceLower
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-600'
                                        }`}
                                    title="Цена изменилась с момента добавления в корзину"
                                >
                                    {isPriceLower ? <ArrowDown size={12} strokeWidth={3} /> : <ArrowUp size={12} strokeWidth={3} />}
                                    {Math.abs(priceDiff).toLocaleString()} ₽
                                </span>
                            </div>
                        )}
                        <h4
                            className={`text-xl font-bold ${unavailable ? 'text-gray-400' : ''}`}
                        >
                            ₽{actualPrice.toLocaleString()}
                        </h4>
                    </div>

                    {!unavailable && (
                        <div className="bg-shop-gray rounded-full px-3 py-1 flex items-center gap-3">
                            <button
                                onClick={() => onQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="hover:text-black text-gray-600 transition-colors"
                                aria-label="Уменьшить количество"
                                disabled={item.quantity <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <span className="font-medium text-sm w-4 text-center">
                                {item.quantity}
                            </span>
                            <button
                                onClick={() => onQuantity(item.id, item.quantity + 1)}
                                className="hover:text-black text-gray-600 transition-colors"
                                aria-label="Увеличить количество"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
CartItemCard.displayName = 'CartItemCard';

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const Cart = () => {
    const { items, removeFromCart, updateQuantity, toggleSelection, toggleSelectAll, totalPrice, clearCart, isLoading } = useCart();
    const { user, login } = useAuth();
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [pendingItems, setPendingItems] = useState<Set<string>>(new Set());

    // Один проход — O(n) без промежуточных массивов
    const { availableItems, unavailableItems } = useMemo(() => {
        const availableItems: typeof items = [];
        const unavailableItems: typeof items = [];
        for (const item of items) {
            if (item.out_of_stock || item.product_deleted) {
                unavailableItems.push(item);
            } else {
                availableItems.push(item);
            }
        }
        return { availableItems, unavailableItems };
    }, [items]);

    const totalAvailableQuantity = useMemo(
        () => availableItems.reduce((sum, item) => sum + item.quantity, 0),
        [availableItems]
    );

    const selectedAvailableCount = useMemo(
        () => availableItems.reduce((acc, i) => acc + (i.is_selected ? 1 : 0), 0),
        [availableItems]
    );

    const hasSelectedItems = selectedAvailableCount > 0;
    const allAvailableSelected =
        availableItems.length > 0 && selectedAvailableCount === availableItems.length;

    const handleToggleSelection = async (itemId: string, is_selected: boolean) => {
        setPendingItems((prev) => new Set(prev).add(itemId));
        await toggleSelection(itemId, is_selected);
        setPendingItems((prev) => {
            const s = new Set(prev);
            s.delete(itemId);
            return s;
        });
    };

    const handleSelectAll = (checked: boolean) => toggleSelectAll(checked);

    const handleCheckout = async () => {
        setCheckoutError(null);
        if (!user) { login(); return; }
        if (!hasSelectedItems) {
            setCheckoutError('Выберите хотя бы один товар для оформления заказа.');
            return;
        }
        setIsSuccess(true);
        clearCart();
    };

    const deliveryFee = 100;
    const finalTotal = totalPrice + deliveryFee;

    // ─── Loading ───────────────────────────────────────────────────────────────
    if (isLoading && items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-500">Загрузка корзины...</p>
            </div>
        );
    }

    // ─── Empty ─────────────────────────────────────────────────────────────────
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

    // ─── Success ───────────────────────────────────────────────────────────────
    if (isSuccess) {
        return (
            <div className="container mx-auto px-4 py-20 text-center animate-in zoom-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckIcon size={40} />
                </div>
                <h2 className="text-4xl font-display font-bold mb-4 uppercase">Спасибо за ваш заказ!</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Ваш заказ успешно оформлен. Вы получите подтверждение по электронной почте в ближайшее время.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/orders"><Button variant="outline">Посмотреть заказ</Button></Link>
                    <Link to="/catalog"><Button>Продолжить покупки</Button></Link>
                </div>
            </div>
        );
    }

    // ─── Main ──────────────────────────────────────────────────────────────────
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase mb-8">Корзина</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Левая колонка: товары */}
                <div className="flex-1 space-y-4">

                    {/* ── Секция: Доступны для заказа ── */}
                    {availableItems.length > 0 && (
                        <section aria-label="Доступны для заказа">
                            {/* Выбрать все - в стиле отдельного блока */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between mb-4 shadow-sm">
                                <label className="flex items-center gap-4 cursor-pointer select-none group">
                                    <CartCheckbox
                                        checked={allAvailableSelected}
                                        onChange={handleSelectAll}
                                        ariaLabel="Выбрать все доступные товары"
                                    />
                                    <span className="text-[15px] font-medium text-gray-800 group-hover:text-black transition-colors">
                                        Выбрать все
                                    </span>
                                </label>
                            </div>

                            {/* Заголовок секции */}
                            <div className="flex items-center justify-between bg-gray-100 rounded-2xl px-5 py-4 mb-3">
                                <h2 className="text-base font-semibold text-gray-700">
                                    Доступны для заказа
                                    <span className="ml-2 text-gray-400 font-normal text-sm">
                                        {totalAvailableQuantity}
                                    </span>
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {availableItems.map((item) => (
                                    <CartItemCard
                                        key={item.id}
                                        item={item}
                                        isPending={pendingItems.has(item.id)}
                                        onToggle={handleToggleSelection}
                                        onRemove={removeFromCart}
                                        onQuantity={updateQuantity}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Секция: Недоступны для заказа ── */}
                    {unavailableItems.length > 0 && (
                        <section aria-label="Недоступны для заказа" className="pt-2">
                            {/* Заголовок секции-разделителя в стиле Ozon */}
                            <div className="flex items-center justify-between bg-gray-100 rounded-2xl px-5 py-4 mb-3">
                                <h2 className="text-base font-semibold text-gray-700">
                                    Недоступны для заказа
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {unavailableItems.map((item) => (
                                    <CartItemCard
                                        key={item.id}
                                        item={item}
                                        isPending={false}
                                        onToggle={handleToggleSelection}
                                        onRemove={removeFromCart}
                                        onQuantity={updateQuantity}
                                        unavailable
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Правая колонка: сводка заказа */}
                <div className="lg:w-96 shrink-0">
                    <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-24">
                        <h3 className="text-xl font-bold font-display mb-6">Детали заказа</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Сумма выбранных</span>
                                <span className="font-bold text-black">₽{totalPrice.toLocaleString()}</span>
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

                        <Button fullWidth onClick={handleCheckout} disabled={!hasSelectedItems}>
                            Оформить заказ <ArrowRight size={20} />
                        </Button>

                        {!hasSelectedItems && (
                            <p className="text-xs text-center text-gray-400 mt-3">
                                Выберите товары для оформления заказа
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            <Modal isOpen={!!checkoutError} onClose={() => setCheckoutError(null)} title="Внимание">
                <div className="text-center py-4">
                    <AlertCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-700 text-lg mb-6">{checkoutError}</p>
                    <Button fullWidth onClick={() => setCheckoutError(null)}>Закрыть</Button>
                </div>
            </Modal>
        </div>
    );
};

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

const CartCheckbox = ({
    checked,
    onChange,
    disabled = false,
    ariaLabel,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    ariaLabel?: string;
}) => (
    <div
        className={`relative flex items-center justify-center shrink-0 transition-opacity duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
    >
        <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="peer appearance-none cursor-pointer w-[22px] h-[22px] md:w-[24px] md:h-[24px] rounded-[6px] border-2 border-gray-300 bg-white hover:border-gray-400 checked:bg-black checked:border-black checked:hover:border-black transition-all duration-300 disabled:cursor-not-allowed m-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label={ariaLabel}
        />
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-300"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    </div>
);

const CheckIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const AlertCircleIcon = ({ className }: { className: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
);