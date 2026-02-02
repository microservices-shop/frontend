import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product, Category, CATEGORY_LABELS, mapApiProductToProduct } from '../types';
import ProductService, { ApiCategory } from '../api/product.service';
import { useCart } from '../store';
import { Button } from '../components/UI';
import { Minus, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '../components/Animations';

export const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, items } = useCart();
    const [qty, setQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    // API state
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isInCart = product ? items.find(i => i.productId === product.id) : false;

    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);
            try {
                const [productRes, categoriesRes] = await Promise.all([
                    ProductService.getProductById(Number(id)),
                    ProductService.getCategories()
                ]);
                setCategories(categoriesRes);
                setProduct(mapApiProductToProduct(productRes, categoriesRes));
            } catch (err) {
                setError('Товар не найден');
                console.error('Failed to load product:', err);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-500">Загрузка товара...</p>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg mx-auto">
                    <p className="text-red-600 font-medium mb-4">{error || 'Товар не найден'}</p>
                    <Link to="/catalog">
                        <Button>Вернуться в каталог</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (isInCart) {
            navigate('/cart');
        } else {
            addToCart(product);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <FadeIn className="flex items-center gap-2 text-sm text-gray-500 mb-6" delay={0.1}>
                <Link to="/" className="hover:text-black transition-colors">Главная</Link>
                <ChevronRight size={14} />
                <Link to="/catalog" className="hover:text-black transition-colors">Каталог</Link>
                {product?.category && (
                    <>
                        <ChevronRight size={14} />
                        <Link to={`/catalog?category=${product.category}`} className="hover:text-black transition-colors">
                            {CATEGORY_LABELS[product.category as Category] || product.category}
                        </Link>
                    </>
                )}
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                {/* Images */}
                <div className="flex flex-col-reverse md:flex-row gap-4">
                    <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
                        {product.images.map((img, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedImage(idx)}
                                className={`border rounded-2xl w-24 h-24 p-2 shrink-0 overflow-hidden ${selectedImage === idx ? 'border-black border-2' : 'border-gray-200'}`}
                                aria-label={`Посмотреть изображение ${idx + 1}`}
                            >
                                <img src={img} className="w-full h-full object-contain" alt="" />
                            </motion.button>
                        ))}
                    </div>
                    <motion.div
                        layoutId={`product-image-${product.id}`}
                        className="bg-shop-gray rounded-[20px] flex-1 flex items-center justify-center overflow-hidden aspect-square relative"
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={selectedImage}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Info */}
                <div>
                    <FadeIn delay={0.2}>
                        <h1 className="text-4xl font-display font-extrabold uppercase leading-tight mb-2">{product.name}</h1>
                    </FadeIn>



                    <FadeIn delay={0.4} className="flex items-center gap-4 mb-6">
                        <span className="text-3xl font-bold">₽{product.price.toLocaleString()}</span>

                    </FadeIn>

                    <FadeIn delay={0.5}>
                        <p className="text-gray-600 leading-relaxed mb-8 border-b pb-8">
                            {product.description}
                        </p>
                    </FadeIn>

                    {/* Dynamic Attributes Table */}
                    <FadeIn delay={0.6} className="mb-8">
                        <h3 className="font-bold text-lg mb-4">Технические характеристики</h3>
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                            {Object.entries(product.attributes).map(([key, value], idx) => (
                                <div key={key} className={`flex justify-between p-4 ${idx !== Object.keys(product.attributes).length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <span className="text-gray-500 font-medium">{key}</span>
                                    <span className="font-bold text-black">{value}</span>
                                </div>
                            ))}
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.7} className="flex gap-4 border-t pt-8">
                        {!isInCart && (
                            <div className="bg-shop-gray rounded-full px-4 py-3 flex items-center gap-4">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="hover:text-gray-600"
                                    aria-label="Уменьшить количество"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="font-medium w-4 text-center">{qty}</span>
                                <button
                                    onClick={() => setQty(qty + 1)}
                                    className="hover:text-gray-600"
                                    aria-label="Увеличить количество"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        )}
                        <Button
                            className="flex-1"
                            onClick={handleAddToCart}
                            disabled={!product.isActive || product.stock === 0}
                        >
                            {!product.isActive || product.stock === 0 ? "Нет в наличии" : (isInCart ? "Перейти в корзину" : "Добавить в корзину")}
                        </Button>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
};