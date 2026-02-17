import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { Product, mapApiProductToProduct } from '../types';
import ProductService, { ApiCategory, ProductFilters } from '../api/product.service';
import { Button, Select, Input } from '../components/UI';
import { SlidersHorizontal, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { StaggerContainer, StaggerItem, FadeIn } from '../components/Animations';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 9;

export const Catalog = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // URL parameters
    const categoryParam = searchParams.get('category');   // numeric category ID
    const searchParam = searchParams.get('search');
    const pageParam = searchParams.get('page');
    const sortParam = searchParams.get('sort');
    const priceMinParam = searchParams.get('price_min');
    const priceMaxParam = searchParams.get('price_max');

    const sortOrder = (sortParam as 'asc' | 'desc') || 'asc';
    const currentPage = pageParam ? parseInt(pageParam) : 1;

    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Price filter local state (for inputs before "Apply")
    const [priceMinInput, setPriceMinInput] = useState(priceMinParam || '');
    const [priceMaxInput, setPriceMaxInput] = useState(priceMaxParam || '');

    // API state
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка категорий (один раз)
    useEffect(() => {
        ProductService.getCategories()
            .then(setCategories)
            .catch(err => console.error('Failed to load categories:', err));
    }, []);

    // Build category label map: id -> title
    const categoryLabelMap = useMemo(() => {
        const map: Record<number, string> = {};
        categories.forEach(c => { map[c.id] = c.title; });
        return map;
    }, [categories]);

    // Resolve category param to numeric ID
    const activeCategoryId = categoryParam ? parseInt(categoryParam) : undefined;

    // Active category label for breadcrumbs & heading
    const activeCategoryLabel = activeCategoryId ? categoryLabelMap[activeCategoryId] : undefined;

    // Загрузка товаров — серверная фильтрация и пагинация
    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters: ProductFilters = {};
            if (searchParam) filters.search = searchParam;
            if (activeCategoryId) filters.categoryId = activeCategoryId;
            if (priceMinParam) filters.priceMin = Math.round(parseFloat(priceMinParam) * 100); // рубли -> копейки
            if (priceMaxParam) filters.priceMax = Math.round(parseFloat(priceMaxParam) * 100);

            const response = await ProductService.getProducts(
                currentPage,
                ITEMS_PER_PAGE,
                'price',
                sortOrder,
                filters
            );

            const mappedProducts = response.items.map(p => mapApiProductToProduct(p, categories));
            setProducts(mappedProducts);
            setTotalProducts(response.total);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError('Не удалось загрузить товары. Проверьте подключение к серверу.');
            console.error('Failed to load products:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchParam, activeCategoryId, priceMinParam, priceMaxParam, sortOrder, categories]);

    useEffect(() => {
        if (categories.length > 0) {
            loadProducts();
        }
    }, [loadProducts, categories]);

    // Sync local price inputs with URL params when they change externally
    useEffect(() => { setPriceMinInput(priceMinParam || ''); }, [priceMinParam]);
    useEffect(() => { setPriceMaxInput(priceMaxParam || ''); }, [priceMaxParam]);

    // --- Handlers ---

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
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePriceApply = () => {
        setSearchParams(prev => {
            if (priceMinInput) prev.set('price_min', priceMinInput);
            else prev.delete('price_min');
            if (priceMaxInput) prev.set('price_max', priceMaxInput);
            else prev.delete('price_max');
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePriceReset = () => {
        setPriceMinInput('');
        setPriceMaxInput('');
        setSearchParams(prev => {
            prev.delete('price_min');
            prev.delete('price_max');
            prev.set('page', '1');
            return prev;
        });
    };

    // --- Filter Sidebar Content (shared between desktop & mobile) ---
    const filterContent = (onClose?: () => void) => (
        <div className="space-y-6 border-t pt-6">
            {/* Категория */}
            <div>
                <h4 className="text-lg font-bold font-display mb-3">Категория</h4>
                <div className="space-y-2 flex flex-col text-gray-600">
                    <Link
                        to="/catalog"
                        className={!categoryParam ? 'text-black font-bold' : 'hover:text-black transition-colors'}
                        onClick={onClose}
                    >
                        Все товары
                    </Link>
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            to={`/catalog?category=${cat.id}`}
                            className={`hover:text-black transition-colors ${activeCategoryId === cat.id ? 'text-black font-bold' : ''
                                }`}
                            onClick={onClose}
                        >
                            {cat.title}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Цена */}
            <div>
                <h4 className="text-lg font-bold font-display mb-3">Цена (₽)</h4>
                <div className="flex gap-2 mb-3">
                    <input
                        type="number"
                        placeholder="от"
                        min="0"
                        value={priceMinInput}
                        onChange={e => setPriceMinInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border bg-shop-gray text-sm"
                    />
                    <input
                        type="number"
                        placeholder="до"
                        min="0"
                        value={priceMaxInput}
                        onChange={e => setPriceMaxInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border bg-shop-gray text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 text-sm h-9"
                        onClick={() => { handlePriceApply(); onClose?.(); }}
                    >
                        Применить
                    </Button>
                    {(priceMinParam || priceMaxParam) && (
                        <Button
                            variant="outline"
                            className="text-sm h-9 text-red-500"
                            onClick={() => { handlePriceReset(); onClose?.(); }}
                        >
                            Сброс
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    // --- Render ---

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
                <span className="text-black font-medium">{activeCategoryLabel || 'Каталог'}</span>
            </FadeIn>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Desktop Filters Sidebar */}
                <div className="hidden md:block md:w-64 shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold font-display">Фильтры</h3>
                    </div>
                    {filterContent()}
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
                            {filterContent(() => setShowMobileFilters(false))}
                            <Button className="w-full mt-8" onClick={() => setShowMobileFilters(false)}>Закрыть</Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Product Grid */}
                <div className="flex-1">
                    <FadeIn delay={0.1} className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl md:text-3xl font-display font-bold uppercase">
                            {searchParam
                                ? `Результаты для "${searchParam}"`
                                : (activeCategoryLabel || "Все товары")}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                {totalProducts > 0
                                    ? `Показано ${products.length} из ${totalProducts}`
                                    : ''}
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

                    {/* Loading overlay for filter changes */}
                    {loading && products.length > 0 && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    )}

                    {!loading && products.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl">
                            <p className="text-xl text-gray-500">Товары не найдены.</p>
                            <Link to="/catalog"><Button variant="outline" className="mt-4">Сбросить фильтры</Button></Link>
                        </div>
                    ) : !loading && (
                        <>
                            <div key={`${currentPage}-${sortOrder}-${categoryParam || ''}-${priceMinParam}-${priceMaxParam}`}>
                                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map(product => (
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
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};