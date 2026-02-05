import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, Check, AlertCircle } from 'lucide-react';
import AdminService, { ApiAttribute, ProductCreatePayload } from '../../api/admin.service';
import type { ApiCategory } from '../../api/product.service';
import { Button } from '../../components/UI';

export const ProductForm = () => {
    const navigate = useNavigate();

    // Состояние формы
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState('');
    const [stock, setStock] = useState('0');
    const [attributes, setAttributes] = useState<Record<string, string>>({});

    // Данные с сервера
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [categoryAttributes, setCategoryAttributes] = useState<ApiAttribute[]>([]);

    // UI состояние
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingAttributes, setLoadingAttributes] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Загрузка категорий при монтировании
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await AdminService.getCategories();
                setCategories(data);
            } catch (err) {
                setError('Не удалось загрузить категории');
            } finally {
                setLoadingCategories(false);
            }
        };
        loadCategories();
    }, []);

    // Загрузка атрибутов при смене категории
    useEffect(() => {
        if (!categoryId) {
            setCategoryAttributes([]);
            setAttributes({});
            return;
        }

        const loadAttributes = async () => {
            setLoadingAttributes(true);
            console.log('[ProductForm] Loading attributes for category:', categoryId);
            try {
                const data = await AdminService.getCategoryAttributes(categoryId);
                console.log('[ProductForm] Received attributes:', data);
                setCategoryAttributes(data);
                // Инициализируем пустые значения для атрибутов
                const initialAttrs: Record<string, string> = {};
                data.forEach(attr => {
                    initialAttrs[attr.title] = '';
                });
                setAttributes(initialAttrs);
            } catch (err) {
                console.error('[ProductForm] Failed to load attributes:', err);
                setCategoryAttributes([]);
            } finally {
                setLoadingAttributes(false);
            }
        };
        loadAttributes();
    }, [categoryId]);

    const handleAttributeChange = (attrTitle: string, value: string) => {
        setAttributes(prev => ({ ...prev, [attrTitle]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!title.trim()) {
            setError('Введите название товара');
            return;
        }
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            setError('Введите корректную цену');
            return;
        }
        if (!categoryId) {
            setError('Выберите категорию');
            return;
        }

        // Проверяем обязательные атрибуты
        for (const attr of categoryAttributes) {
            if (attr.required && !attributes[attr.title]?.trim()) {
                setError(`Заполните обязательный атрибут: ${attr.title}`);
                return;
            }
        }

        setLoading(true);

        try {
            // Конвертируем атрибуты по типу
            const convertedAttributes: Record<string, string | number | boolean> = {};
            console.log('[ProductForm] categoryAttributes:', categoryAttributes);
            console.log('[ProductForm] attributes before conversion:', attributes);

            for (const key of Object.keys(attributes)) {
                const value = attributes[key];
                if (!value.trim()) continue;
                const attrDef = categoryAttributes.find(a => a.title === key);
                const attrType = attrDef?.type?.toUpperCase();
                console.log(`[ProductForm] Converting "${key}": attrDef=`, attrDef, 'type=', attrType);
                if (attrType === 'NUMBER') {
                    convertedAttributes[key] = parseFloat(value) || 0;
                    console.log(`[ProductForm] "${key}" converted to number:`, convertedAttributes[key]);
                } else if (attrType === 'BOOLEAN') {
                    convertedAttributes[key] = value.toLowerCase() === 'true' || value === '1';
                } else {
                    convertedAttributes[key] = value;
                }
            }

            console.log('[ProductForm] convertedAttributes:', convertedAttributes);

            const payload: ProductCreatePayload = {
                title: title.trim(),
                price: parseInt(price) || 0, // Цена уже в копейках
                category_id: categoryId,
                description: description.trim() || undefined,
                images: images.trim() ? images.split(',').map(s => s.trim()) : [],
                stock: parseInt(stock) || 0,
                attributes: convertedAttributes,
            };

            console.log('[ProductForm] Sending payload:', payload);

            await AdminService.createProduct(payload);
            setSuccess(true);

            // Очищаем форму через 2 секунды
            setTimeout(() => {
                setTitle('');
                setPrice('');
                setCategoryId(null);
                setDescription('');
                setImages('');
                setStock('0');
                setAttributes({});
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            console.error('[ProductForm] Error creating product:', err.response?.data);
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                // Показываем детальные ошибки валидации
                const errorMessages = data.errors.map((e: { field?: string; message?: string }) =>
                    e.message || e.field || 'Неизвестная ошибка'
                ).join('; ');
                setError(`${data.detail}: ${errorMessages}`);
            } else {
                setError(data?.detail || 'Ошибка при создании товара');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">Добавить товар</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    {/* Название */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Название товара *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                            placeholder="iPhone 15 Pro Max"
                        />
                    </div>

                    {/* Цена */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Цена (копейки) *
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                            placeholder="13500000"
                            min="0"
                            step="1"
                        />
                        <p className="text-xs text-gray-500 mt-1">135000₽ = 13500000 копеек</p>
                    </div>

                    {/* Категория */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Категория *
                        </label>
                        {loadingCategories ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="animate-spin" size={20} />
                                Загрузка категорий...
                            </div>
                        ) : (
                            <select
                                value={categoryId || ''}
                                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Динамические атрибуты */}
                    {categoryId && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">
                                Атрибуты категории
                                {loadingAttributes && (
                                    <Loader2 className="inline ml-2 animate-spin" size={18} />
                                )}
                            </h3>

                            {categoryAttributes.length === 0 && !loadingAttributes ? (
                                <p className="text-gray-500 text-sm">
                                    Для этой категории нет определённых атрибутов.
                                    Можете добавить их в <a href="http://localhost:8002/admin" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SQLAdmin</a>.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {categoryAttributes.map(attr => (
                                        <div key={attr.id}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {attr.title}
                                                {attr.required && <span className="text-red-500 ml-1">*</span>}
                                                <span className="text-gray-400 text-xs ml-2">({attr.type})</span>
                                            </label>
                                            <input
                                                type={attr.type === 'NUMBER' ? 'number' : 'text'}
                                                value={attributes[attr.title] || ''}
                                                onChange={(e) => handleAttributeChange(attr.title, e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                                                placeholder={`Введите ${attr.title.toLowerCase()}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Описание */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Описание
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors min-h-[100px]"
                            placeholder="Подробное описание товара..."
                        />
                    </div>

                    {/* Изображения */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Изображения (URL через запятую)
                        </label>
                        <input
                            type="text"
                            value={images}
                            onChange={(e) => setImages(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                        />
                    </div>

                    {/* Количество */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Количество на складе
                        </label>
                        <input
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                            min="0"
                        />
                    </div>

                    {/* Ошибки и успех */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl">
                            <Check size={20} />
                            Товар успешно создан!
                        </div>
                    )}

                    {/* Кнопка отправки */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-4 text-lg flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Создание...
                            </>
                        ) : (
                            <>
                                <Plus size={20} />
                                Создать товар
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};
