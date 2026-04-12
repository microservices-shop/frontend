import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, Check, AlertCircle, Save } from 'lucide-react';
import AdminService, { ApiAttribute, ProductCreatePayload } from '../../api/admin.service';
import ProductService, { ApiCategory } from '../../api/product.service';
import { Button } from '../../components/UI';

export const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;

    // Form state
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState('');
    const [stock, setStock] = useState('0');
    const [attributes, setAttributes] = useState<Record<string, string>>({});

    // Server data
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [categoryAttributes, setCategoryAttributes] = useState<ApiAttribute[]>([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [loadingInit, setLoadingInit] = useState(true);
    const [loadingAttributes, setLoadingAttributes] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Initial data loading (categories + optional product data)
    useEffect(() => {
        const initData = async () => {
            setLoadingInit(true);
            try {
                const cats = await AdminService.getCategories();
                setCategories(cats);

                if (isEditing) {
                    const product = await ProductService.getProductById(Number(id));
                    setTitle(product.title);
                    setPrice(product.price.toString());
                    setCategoryId(product.category_id);
                    setDescription(product.description || '');
                    setImages((product.images || []).join(', '));
                    setStock(product.stock.toString());
                    
                    // We need to fetch attributes for this category to populate the form fields
                    const catAttrs = await AdminService.getCategoryAttributes(product.category_id);
                    setCategoryAttributes(catAttrs);
                    
                    // Prepare attributes state (convert DB values to strings as inputs expect strings)
                    const stringifiedAttrs: Record<string, string> = {};
                    if (product.attributes) {
                        for (const [k, v] of Object.entries(product.attributes)) {
                            stringifiedAttrs[k] = String(v);
                        }
                    }
                    setAttributes(stringifiedAttrs);
                }
            } catch (err) {
                console.error('Failed to init form:', err);
                setError('Не удалось загрузить данные формы');
            } finally {
                setLoadingInit(false);
            }
        };

        initData();
    }, [id, isEditing]);

    // Load category attributes when category changes (only when NOT initializing from edit)
    useEffect(() => {
        if (!categoryId) {
            setCategoryAttributes([]);
            if (!isEditing) setAttributes({});
            return;
        }

        // If we are editing and this is the first category load, we skip resetting attributes
        // The init effect handles the initial category attributes and values.
        // We only trigger this if the admin actively changes the category.
        let isInitialLoadForEdit = false;

        const loadAttributes = async () => {
            setLoadingAttributes(true);
            try {
                const data = await AdminService.getCategoryAttributes(categoryId);
                setCategoryAttributes(data);
                
                // Only reset values if not editing, or if editing but changing to a NEW category
                // This is a naive check; a more robust way is to use a ref to track if user changed it.
                // For simplicity: we reset if not editing.
                if (!isEditing) {
                    const initialAttrs: Record<string, string> = {};
                    data.forEach(attr => {
                        initialAttrs[attr.title] = '';
                    });
                    setAttributes(initialAttrs);
                }
            } catch (err) {
                console.error('Failed to load attributes:', err);
                setCategoryAttributes([]);
            } finally {
                setLoadingAttributes(false);
            }
        };

        if (!loadingInit) loadAttributes();
    }, [categoryId, loadingInit, isEditing]);

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
            const convertedAttributes: Record<string, string | number | boolean> = {};

            for (const key of Object.keys(attributes)) {
                const value = attributes[key];
                if (!value.trim()) continue;
                const attrDef = categoryAttributes.find(a => a.title === key);
                const attrType = attrDef?.type?.toUpperCase();
                
                if (attrType === 'NUMBER') {
                    convertedAttributes[key] = parseFloat(value) || 0;
                } else if (attrType === 'BOOLEAN') {
                    convertedAttributes[key] = value.toLowerCase() === 'true' || value === '1';
                } else {
                    convertedAttributes[key] = value;
                }
            }

            const payload: ProductCreatePayload = {
                title: title.trim(),
                price: parseInt(price) || 0,
                category_id: categoryId,
                description: description.trim() || undefined,
                images: images.trim() ? images.split(',').map(s => s.trim()) : [],
                stock: parseInt(stock) || 0,
                attributes: convertedAttributes,
            };

            if (isEditing) {
                await AdminService.updateProduct(Number(id), payload);
                setSuccess(true);
                setTimeout(() => navigate('/admin'), 1500);
            } else {
                await AdminService.createProduct(payload);
                setSuccess(true);
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
            }
        } catch (err: any) {
            console.error('Error saving product:', err.response?.data);
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                const errorMessages = data.errors.map((e: { field?: string; message?: string }) =>
                    e.message || e.field || 'Неизвестная ошибка'
                ).join('; ');
                setError(`${data.detail}: ${errorMessages}`);
            } else {
                setError(data?.detail || 'Ошибка при сохранении товара');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loadingInit) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            <div className="max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 hover:bg-white rounded-full transition-colors drop-shadow-sm"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-display font-extrabold uppercase tracking-tight">
                        {isEditing ? 'Редактировать товар' : 'Добавить товар'}
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                    {/* Название */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Название товара *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                            placeholder="iPhone 15 Pro Max"
                        />
                    </div>

                    {/* Цена & Количество */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Цена (копейки) *</label>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">На складе</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Категория */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Категория *</label>
                        <select
                            value={categoryId || ''}
                            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors bg-white cursor-pointer"
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Динамические атрибуты */}
                    {categoryId && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                Атрибуты категории
                                {loadingAttributes && <Loader2 className="ml-2 animate-spin text-gray-400" size={18} />}
                            </h3>

                            {categoryAttributes.length === 0 && !loadingAttributes ? (
                                <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">
                                    Для этой категории нет определённых атрибутов. Можете добавить их в разделе "Атрибуты".
                                </p>
                            ) : (
                                <div className="space-y-4 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100">
                                    {categoryAttributes.map(attr => (
                                        <div key={attr.id}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {attr.title}
                                                {attr.required && <span className="text-red-500 ml-1">*</span>}
                                                <span className="text-gray-400 text-xs ml-2 font-mono">({attr.type})</span>
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
                    <div className="border-t pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors min-h-[120px] resize-y"
                            placeholder="Подробное описание товара..."
                        />
                    </div>

                    {/* Изображения */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Изображения (URL через запятую)</label>
                        <textarea
                            value={images}
                            onChange={(e) => setImages(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                            rows={3}
                        />
                    </div>

                    {/* Ошибки и успех */}
                    {error && (
                        <div className="flex items-start gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                            <Check size={20} className="shrink-0" />
                            {isEditing ? 'Товар успешно обновлен!' : 'Товар успешно создан!'}
                        </div>
                    )}

                    {/* Кнопка отправки */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-4 text-base sm:text-lg flex items-center justify-center gap-2 mt-4"
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin" size={20} /> Сохранение...</>
                        ) : isEditing ? (
                            <><Save size={20} /> Сохранить изменения</>
                        ) : (
                            <><Plus size={20} /> Создать товар</>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};
