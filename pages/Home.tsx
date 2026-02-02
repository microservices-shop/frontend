import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, mapApiProductToProduct } from '../types';
import ProductService, { ApiCategory } from '../api/product.service';
import { Button } from '../components/UI';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/Animations';
import VantaBackground from '../components/VantaBackground';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <StaggerItem className="h-full">
        <Link to={`/product/${product.id}`} className="group cursor-pointer block h-full">
            {/* Optimized Image Container: Reduced hover scale complexity */}
            <div className="bg-shop-gray rounded-[20px] aspect-square mb-4 overflow-hidden relative transform-gpu">
                <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                />
                {!product.isActive && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">НЕДОСТУПНО</span>
                    </div>
                )}
            </div>
            <h3 className="font-bold text-lg leading-tight mb-1 truncate">{product.name}</h3>

            <div className="flex items-center gap-3">
                <span className="font-bold text-xl">₽{product.price.toLocaleString()}</span>

            </div>
        </Link>
    </StaggerItem>
);

export const Home = () => {
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    ProductService.getProducts(1, 4),
                    ProductService.getCategories()
                ]);
                setCategories(categoriesRes);
                const mapped = productsRes.items.map(p => mapApiProductToProduct(p, categoriesRes));
                setNewArrivals(mapped.filter(p => p.isActive).slice(0, 4));
            } catch (err) {
                console.error('Failed to load products:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="pb-20 overflow-hidden">
            {/* Hero Section with Vanta.js 3D Animation */}
            <VantaBackground className="pt-10 md:pt-20 pb-10 md:pb-20 px-4">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 mb-10 md:mb-0 space-y-6 z-10">
                        <FadeIn delay={0.1}>
                            <h1 className="text-4xl md:text-6xl font-display font-extrabold uppercase leading-none text-black">
                                МАГАЗИН ЭЛЕКТРОНИКИ <br /> АКТУАЛЬНЫЙ КАТАЛОГ <br /> ГАРАНТИЯ КАЧЕСТВА
                            </h1>
                        </FadeIn>
                        <FadeIn delay={0.2}>
                            <p className="text-gray-600 max-w-md">
                                Широкий ассортимент компьютерных комплектующих, периферии и мобильных устройств. Все необходимые гаджеты для работы и дома в одном каталоге.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.4} className="flex gap-8 pt-6">
                            <div>
                                <p className="text-2xl font-bold text-black">200+</p>
                                <p className="text-xs text-gray-500">Брендов</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-black">2k+</p>
                                <p className="text-xs text-gray-500">Товаров</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-black">30k+</p>
                                <p className="text-xs text-gray-500">Клиентов</p>
                            </div>
                        </FadeIn>
                    </div>
                    <div className="md:w-1/2 relative h-[400px] md:h-[600px] w-full">
                        {/* Static decorative stars (removed animation loop for performance) */}

                        <FadeIn direction="none" delay={0.2} className="h-full">
                            {/* Reliable Unsplash ID for Tech/Laptop */}
                            <img
                                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1600"
                                alt="Главная Электроника"
                                className="w-full h-full object-cover rounded-[30px] md:rounded-[50px]"
                            />
                        </FadeIn>
                    </div>
                </div>
            </VantaBackground>

            {/* Brands Strip */}
            <section className="bg-black py-8 overflow-hidden">
                <StaggerContainer className="container mx-auto flex justify-between items-center text-white opacity-60 text-2xl font-display font-bold px-4 flex-wrap gap-6 md:flex-nowrap">
                    {['APPLE', 'SAMSUNG', 'SONY', 'ASUS', 'XIAOMI'].map((brand, i) => (
                        <StaggerItem key={i}><span>{brand}</span></StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            {/* New Arrivals */}
            <section className="container mx-auto py-16 px-4">
                <FadeIn direction="up">
                    <h2 className="text-3xl md:text-5xl font-display font-extrabold text-center uppercase mb-12">Новинки</h2>
                </FadeIn>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newArrivals.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </StaggerContainer>
                )}

                <FadeIn direction="up" delay={0.4} className="flex justify-center mt-10">
                    <Link to="/catalog">
                        <Button variant="outline" className="px-12 w-full md:w-auto">Смотреть все</Button>
                    </Link>
                </FadeIn>
            </section>


        </div>
    );
};