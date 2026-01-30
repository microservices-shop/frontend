import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';
import { Category, CATEGORY_LABELS } from '../types';
import { Button, Select } from '../components/UI';
import { Star, SlidersHorizontal, ChevronRight, ChevronLeft } from 'lucide-react';
import { StaggerContainer, StaggerItem, FadeIn } from '../components/Animations';
import { motion, AnimatePresence } from 'framer-motion';

export const Catalog = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryParam, searchParam, sortOrder]);

    const filteredProducts = useMemo(() => {
        let result = MOCK_PRODUCTS.filter(p => p.isActive);

        if (categoryParam) {
            result = result.filter(p => p.category === categoryParam);
        }

        if (searchParam) {
            const q = searchParam.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q));
        }

        return result.sort((a, b) => {
            return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        });
    }, [categoryParam, searchParam, sortOrder]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        scrollToTop();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <FadeIn className="flex items-center gap-2 text-sm text-gray-500 mb-6" delay={0.1}>
                <Link to="/" className="hover:text-black transition-colors">Главная</Link> <ChevronRight size={14} />
                <span className="text-black font-medium">{categoryParam ? CATEGORY_LABELS[categoryParam as Category] : 'Каталог'}</span>
            </FadeIn>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="hidden md:block md:w-64 shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold font-display">Фильтры</h3>
                    </div>

                    <div className="space-y-6 border-t pt-6">
                        <div>
                            <h4 className="font-bold mb-3">Категория</h4>
                            <div className="space-y-2 flex flex-col text-gray-600">
                                {Object.values(Category).map(cat => (
                                    <Link
                                        key={cat}
                                        to={`/catalog?category=${cat}`}
                                        className={`hover:text-black transition-colors ${categoryParam === cat ? 'text-black font-bold' : ''}`}
                                    >
                                        {CATEGORY_LABELS[cat]}
                                    </Link>
                                ))}
                                <Link to="/catalog" className={!categoryParam ? 'text-black font-bold' : ''}>Все товары</Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3">Цена</h4>
                            <input type="range" min="0" max="500000" className="w-full accent-black cursor-pointer" />
                            <div className="flex justify-between text-xs font-medium mt-2">
                                <span>₽0</span>
                                <span>₽500,000+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Modal */}
                <AnimatePresence>
                    {showMobileFilters && (
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ ease: "easeOut", duration: 0.3 }}
                            className="fixed inset-0 z-50 bg-white p-6 overflow-y-auto md:hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold font-display">Фильтры</h3>
                                <button onClick={() => setShowMobileFilters(false)}><SlidersHorizontal /></button>
                            </div>
                            <div className="space-y-6 border-t pt-6">
                                <div>
                                    <h4 className="font-bold mb-3">Категория</h4>
                                    <div className="space-y-2 flex flex-col text-gray-600">
                                        {Object.values(Category).map(cat => (
                                            <Link
                                                key={cat}
                                                to={`/catalog?category=${cat}`}
                                                className={`hover:text-black ${categoryParam === cat ? 'text-black font-bold' : ''}`}
                                                onClick={() => setShowMobileFilters(false)}
                                            >
                                                {CATEGORY_LABELS[cat]}
                                            </Link>
                                        ))}
                                        <Link to="/catalog" className={!categoryParam ? 'text-black font-bold' : ''} onClick={() => setShowMobileFilters(false)}>Все товары</Link>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full mt-8" onClick={() => setShowMobileFilters(false)}>Применить</Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Product Grid */}
                <div className="flex-1">
                    <FadeIn delay={0.1} className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl md:text-3xl font-display font-bold uppercase">
                            {searchParam ? `Результаты для "${searchParam}"` : (categoryParam ? CATEGORY_LABELS[categoryParam as Category] : "Все товары")}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Показано {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} из {filteredProducts.length}
                            </span>
                            <div className="hidden md:flex items-center ml-4 z-20">
                                <span className="text-sm mr-2 text-gray-500">Сортировка:</span>
                                <div className="w-fit min-w-[170px]">
                                    <Select
                                        value={sortOrder}
                                        onChange={(val) => setSortOrder(val as 'asc' | 'desc')}
                                        options={[
                                            { label: 'Сначала дешевле', value: 'asc' },
                                            { label: 'Сначала дороже', value: 'desc' }
                                        ]}
                                    />
                                </div>
                            </div>
                            <button className="md:hidden p-2 bg-shop-gray rounded-full" onClick={() => setShowMobileFilters(true)}>
                                <SlidersHorizontal size={20} />
                            </button>
                        </div>
                    </FadeIn>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl">
                            <p className="text-xl text-gray-500">Товары не найдены.</p>
                            <Link to="/catalog"><Button variant="outline" className="mt-4">Сбросить фильтры</Button></Link>
                        </div>
                    ) : (
                        <>
                            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" key={currentPage + sortOrder + (categoryParam || '')}>
                                {displayedProducts.map(product => (
                                    <StaggerItem key={product.id}>
                                        <Link to={`/product/${product.id}`} className="group cursor-pointer block h-full">
                                            <div className="bg-shop-gray rounded-[20px] aspect-square mb-4 overflow-hidden relative transform-gpu">
                                                <motion.img
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.3 }}
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="font-bold text-lg leading-tight mb-1 truncate">{product.name}</h3>

                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-xl">₽{product.price.toLocaleString()}</span>

                                            </div>
                                        </Link>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-10 border-t pt-6">
                                    <Button
                                        variant="outline"
                                        className="px-4 py-2 text-sm h-10 gap-2"
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={16} /> Назад
                                    </Button>

                                    <div className="flex gap-2">
                                        {Array.from({ length: totalPages }).map((_, i) => {
                                            const pageNum = i + 1;
                                            const isActive = currentPage === pageNum;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${isActive
                                                        ? 'bg-black text-white'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="px-4 py-2 text-sm h-10 gap-2"
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Вперёд <ChevronRight size={16} />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};