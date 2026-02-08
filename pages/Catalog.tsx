import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { Product, Category, CATEGORY_LABELS, mapApiProductToProduct } from '../types';
import ProductService, { ApiCategory } from '../api/product.service';
import { Button, Select } from '../components/UI';
import { SlidersHorizontal, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { StaggerContainer, StaggerItem, FadeIn } from '../components/Animations';
import { motion, AnimatePresence } from 'framer-motion';

export const Catalog = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const pageParam = searchParams.get('page');
    const sortParam = searchParams.get('sort');

    const sortOrder = (sortParam as 'asc' | 'desc') || 'asc';
    const currentPage = pageParam ? parseInt(pageParam) : 1;

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const ITEMS_PER_PAGE = 9;

    // API state
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка категорий
    useEffect(() => {
        ProductService.getCategories()
            .then(setCategories)
            .catch(err => console.error('Failed to load categories:', err));
    }, []);

    // Загрузка товаров
    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Загружаем все товары для клиентской фильтрации
            // TODO: переместить фильтрацию на бэкенд для оптимизации
            const response = await ProductService.getProducts(
                1,
                1000,  // Загружаем много товаров для клиентской фильтрации
                'price',
                sortOrder
            );
            const mappedProducts = response.items.map(p => mapApiProductToProduct(p, categories));

            // Фильтрация на клиенте
            let filtered = mappedProducts.filter(p => p.isActive);

            if (categoryParam) {
                filtered = filtered.filter(p => p.category === categoryParam);
            }

            if (searchParam) {
                const q = searchParam.toLowerCase();
                filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
            }

            setProducts(filtered);
            setTotalProducts(filtered.length);  // Используем реальное количество отфильтрованных товаров
        } catch (err) {
            setError('Не удалось загрузить товары. Проверьте подключение к серверу.');
            console.error('Failed to load products:', err);
        } finally {
            setLoading(false);
        }
    }, [categoryParam, searchParam, sortOrder, categories]);

    useEffect(() => {
        if (categories.length > 0) {
            loadProducts();
        }
    }, [loadProducts, categories]);

    // Reset to page 1 when filters change (ONLY if not already on page 1)
    useEffect(() => {
        if (currentPage !== 1 && (categoryParam || searchParam)) {
            // This effect might need to be smarter to avoid resetting when just paginating
            // But since we use URL params now, we handle resets in the setters mostly
            // Actually, if category changes, we SHOULD reset to page 1 if not done by the Link
        }
    }, [categoryParam, searchParam]);


    // Pagination Logic - клиентская пагинация
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageChange = (page: number) => {
        setSearchParams(prev => {
            prev.set('page', page.toString());
            return prev;
        });
        scrollToTop();
    };

    const handleSortChange = (val: 'asc' | 'desc') => {
        setSearchParams(prev => {
            prev.set('sort', val);
            prev.set('page', '1'); // Reset to first page on sort
            return prev;
        });
    };

    // Loading state
    if (loading && products.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-500">Загрузка товаров...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg mx-auto">
                    <p className="text-red-600 font-medium mb-4">{error}</p>
                    <Button onClick={loadProducts}>Попробовать снова</Button>
                </div>
            </div>
        );
    }

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
                                Показано {displayedProducts.length} из {totalProducts}
                            </span>
                            <div className="hidden md:flex items-center ml-4 z-20">
                                <span className="text-sm mr-2 text-gray-500">Сортировка:</span>
                                <div className="w-fit min-w-[170px]">
                                    <Select
                                        value={sortOrder}
                                        onChange={(val) => handleSortChange(val as 'asc' | 'desc')}
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

                    {displayedProducts.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl">
                            <p className="text-xl text-gray-500">Товары не найдены.</p>
                            <Link to="/catalog"><Button variant="outline" className="mt-4">Сбросить фильтры</Button></Link>
                        </div>
                    ) : (
                        <>
                            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" key={currentPage + sortOrder + (categoryParam || '')}>
                                {displayedProducts.map(product => (
                                    <StaggerItem key={product.id}>
                                        <Link
                                            to={`/product/${product.id}`}
                                            state={{ from: location }}
                                            className="group cursor-pointer block h-full"
                                        >
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