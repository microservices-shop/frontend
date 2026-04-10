import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, mapApiProductToProduct } from '../types';
import ProductService, { ApiCategory } from '../api/product.service';
import { Button } from '../components/UI';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/Animations';

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
                setNewArrivals(mapped.filter(p => p.isActive && p.stock > 0).slice(0, 4));
            } catch (err) {
                console.error('Failed to load products:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="pb-20 bg-white">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    display: flex;
                    width: max-content;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* Full-screen Initialization Wrapper (Hero + Brands) */}
            {/* Guarantees that upon entry, the Hero taking up the space pushes the Brands ribbon perfectly to the bottom of the viewport edge */}
            <div className="flex flex-col min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-130px)]">
                {/* Full-width Hero Section (flex-1 makes it auto-expand to fill available vertical space) */}
                <section className="relative w-full flex-1 flex items-center justify-center bg-gray-900 overflow-hidden min-h-[450px]">
                    {/* High-Quality Background Image from Unsplash (Macbook workspace) */}
                    {/* object-[center_45%] guarantees that the laptop screen anchors precisely at 45% origin regardless of scaling/cropping */}
                    <img
                        src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=2560"
                        alt="Современная электроника"
                        loading="eager"
                        className="absolute inset-0 w-full h-full object-cover object-[center_45%] grayscale-[90%] brightness-[0.95] contrast-[1.10]"
                    />

                    {/* Cinematic Environmental Shadows for Ultra-Premium feel */}
                    {/* Bottom grounding shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/30 to-transparent opacity-65 mix-blend-multiply"></div>
                    {/* Top ambient shadow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>
                    {/* Dramatic spotlight vignette targeting the laptop screen precisely at the 45% math anchor */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(0,0,0,0)_15%,rgba(0,0,0,0.65)_100%)] pointer-events-none"></div>

                    {/* Content Container (Mapped physically inside the laptop screen in the photo) */}
                    <div
                        className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center text-center"
                        style={{ width: 'clamp(240px, 38vw, 800px)' }}
                    >
                        <FadeIn delay={0.1}>
                            <h1
                                className="font-display font-extrabold uppercase tracking-tight text-gray-200/90 leading-[1.05] drop-shadow-md whitespace-nowrap"
                                style={{ fontSize: 'clamp(26px, 4.6vw, 100px)', marginBottom: 'clamp(8px, 1.2vw, 24px)' }}
                            >
                                МАГАЗИН<br />ЭЛЕКТРОНИКИ
                            </h1>
                        </FadeIn>
                        <FadeIn delay={0.2} className="w-full">
                            <p
                                className="text-gray-300 font-medium w-full mx-auto leading-relaxed"
                                style={{ fontSize: 'clamp(11px, 1.2vw, 20px)', marginBottom: 'clamp(16px, 2.5vw, 48px)' }}
                            >
                                Широкий ассортимент компьютерных комплектующих. Все необходимые гаджеты в одном месте.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <Link to="/catalog">
                                <button
                                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 rounded-full font-semibold flex items-center justify-center"
                                    style={{
                                        fontSize: 'clamp(11px, 1.1vw, 20px)',
                                        padding: 'clamp(8px, 1vw, 20px) clamp(16px, 2.2vw, 44px)',
                                        gap: 'clamp(6px, 0.6vw, 12px)',
                                    }}
                                >
                                    Смотреть каталог
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 'clamp(12px, 1.2vw, 22px)', height: 'clamp(12px, 1.2vw, 22px)' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </button>
                            </Link>
                        </FadeIn>
                    </div>
                </section>

                {/* Seamless Infinite Brands Marquee (Apple-Style Minimalism) */}
                {/* shrink-0 ensures the ribbon is never compressed by flex container calculations */}
                <section className="bg-white py-6 md:py-8 border-b border-gray-100 overflow-hidden relative flex shrink-0">
                    {/* Узкие маски на мобильном, чтобы не скрывать весь текст */}
                    <div className="absolute top-0 bottom-0 left-0 w-8 md:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute top-0 bottom-0 right-0 w-8 md:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

                    <div className="animate-marquee gap-8 md:gap-40 items-center flex-nowrap pl-8 md:pl-40 group/marquee pointer-events-none">
                        {/* Render the brand list 4 times for a flawless infinite 50% loop regardless of screen width */}
                        {[...Array(4)].map((_, arrayIndex) => (
                            <React.Fragment key={arrayIndex}>
                                {['APPLE', 'SAMSUNG', 'SONY', 'ASUS', 'XIAOMI', 'LENOVO', 'MSI', 'LOGITECH'].map((brand, i) => (
                                    <span
                                        key={`${arrayIndex}-${i}`}
                                        className="pointer-events-auto text-gray-300 transition-all duration-500 text-2xl md:text-[36px] font-display font-medium tracking-widest cursor-pointer shrink-0 group-hover/marquee:blur-[5px] group-hover/marquee:opacity-30 hover:!blur-none hover:!opacity-100 hover:!text-black hover:scale-[1.03]"
                                    >
                                        {brand}
                                    </span>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </section>
            </div>

            {/* New Arrivals */}
            <section className="container mx-auto py-16 px-4 relative z-10">
                <FadeIn direction="up">
                    <h2 className="text-3xl md:text-5xl font-display font-extrabold text-center uppercase mb-12 tracking-tight block w-full">НОВИНКИ</h2>
                </FadeIn>

                {loading ? (
                    <div className="flex justify-center py-12 w-full">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newArrivals.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </StaggerContainer>
                )}

                <FadeIn direction="up" delay={0.4} className="flex justify-center mt-12 w-full">
                    <Link to="/catalog">
                        <Button variant="outline" className="px-14 py-4 rounded-full w-full md:w-auto font-semibold border-gray-300 text-gray-700 hover:text-black hover:border-black text-lg">
                            Смотреть все новинки
                        </Button>
                    </Link>
                </FadeIn>
            </section>
        </div>
    );
};