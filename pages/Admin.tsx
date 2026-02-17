import React, { useState, useEffect } from 'react';
import { useAuth } from '../store';
import { Navigate } from 'react-router-dom';
import { Product, mapApiProductToProduct } from '../types';
import ProductService, { ApiCategory } from '../api/product.service';
import AdminService from '../api/admin.service';
import { Button, Input, Modal } from '../components/UI';
import { Plus, Trash2, Edit2, Save, Loader2 } from 'lucide-react';

export const Admin = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [saving, setSaving] = useState(false);

    if (!user || user.role !== 'admin') return <Navigate to="/" />;

    // Load products and categories from API
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    ProductService.getProducts(1, 100, 'id', 'desc'),
                    ProductService.getCategories(),
                ]);
                setCategories(categoriesRes);
                setProducts(productsRes.items.map(p => mapApiProductToProduct(p, categoriesRes)));
            } catch (err) {
                console.error('Failed to load admin data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Вы уверены? Это действие удалит товар.")) {
            try {
                await AdminService.deleteProduct(Number(id));
                setProducts(prev => prev.filter(p => p.id !== id));
            } catch (err) {
                console.error('Failed to delete product:', err);
                alert('Ошибка при удалении товара');
            }
        }
    };

    const handleSave = async () => {
        if (!editingProduct) return;
        setSaving(true);

        try {
            // Find the category_id from category slug
            const categoryMatch = categories.find(c =>
                c.title === editingProduct.category || c.id.toString() === editingProduct.category
            );

            if (editingProduct.id) {
                // Update existing product
                const updatedApi = await AdminService.updateProduct(Number(editingProduct.id), {
                    title: editingProduct.name,
                    price: Math.round((editingProduct.price || 0) * 100), // рубли -> копейки
                    stock: editingProduct.stock,
                    category_id: categoryMatch?.id,
                    description: editingProduct.description,
                    images: editingProduct.images,
                    attributes: editingProduct.attributes,
                });
                const updated = mapApiProductToProduct(updatedApi, categories);
                setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
            } else {
                // Create new product
                if (!categoryMatch) {
                    alert('Пожалуйста, выберите категорию');
                    setSaving(false);
                    return;
                }
                const createdApi = await AdminService.createProduct({
                    title: editingProduct.name || 'Новый товар',
                    price: Math.round((editingProduct.price || 0) * 100),
                    stock: editingProduct.stock || 0,
                    category_id: categoryMatch.id,
                    description: editingProduct.description || '',
                    images: editingProduct.images || [],
                    attributes: editingProduct.attributes || {},
                });
                const created = mapApiProductToProduct(createdApi, categories);
                setProducts(prev => [created, ...prev]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save product:', err);
            alert('Ошибка при сохранении товара');
        } finally {
            setSaving(false);
        }
    };

    const handleAttributeChange = (key: string, value: string, oldKey?: string) => {
        const newAttrs = { ...(editingProduct?.attributes || {}) };
        if (oldKey && oldKey !== key) {
            delete newAttrs[oldKey];
        }
        newAttrs[key] = value;
        setEditingProduct(prev => ({ ...prev, attributes: newAttrs }));
    };

    const removeAttribute = (key: string) => {
        const newAttrs = { ...(editingProduct?.attributes || {}) };
        delete newAttrs[key];
        setEditingProduct(prev => ({ ...prev, attributes: newAttrs }));
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-500">Загрузка данных...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-extrabold uppercase">Панель управления</h1>
                <Button onClick={() => { setEditingProduct({ attributes: {}, images: [] }); setIsModalOpen(true); }}>
                    <Plus size={20} /> Добавить товар
                </Button>
            </div>

            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-bold text-sm">Товар</th>
                            <th className="p-4 font-bold text-sm">Категория</th>
                            <th className="p-4 font-bold text-sm">Цена</th>
                            <th className="p-4 font-bold text-sm">Склад</th>
                            <th className="p-4 font-bold text-sm">Статус</th>
                            <th className="p-4 font-bold text-sm text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 flex items-center gap-3">
                                    <img src={p.images[0]} className="w-10 h-10 object-contain" />
                                    <span className="font-medium">{p.name}</span>
                                </td>
                                <td className="p-4 text-sm">{p.category}</td>
                                <td className="p-4 font-bold">₽{p.price.toLocaleString()}</td>
                                <td className="p-4 text-sm">{p.stock}</td>
                                <td className="p-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.isActive ? 'Активен' : 'Архив'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 hover:bg-gray-200 rounded text-blue-600"><Edit2 size={16} /></button>
                                    {p.isActive && <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-gray-200 rounded text-red-600"><Trash2 size={16} /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct?.id ? "Редактировать товар" : "Новый товар"}
                footer={<Button fullWidth onClick={handleSave} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить изменения'}</Button>}
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <Input
                        label="Название товара"
                        value={editingProduct?.name || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <div className="flex gap-4">
                        <Input
                            type="number" label="Цена (₽)"
                            value={editingProduct?.price || ''}
                            onChange={e => setEditingProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                        />
                        <Input
                            type="number" label="Запас на складе"
                            value={editingProduct?.stock || ''}
                            onChange={e => setEditingProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Категория</label>
                        <select
                            className="w-full px-4 py-3 rounded-lg border bg-shop-gray"
                            value={editingProduct?.category || ''}
                            onChange={e => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.title}</option>)}
                        </select>
                    </div>

                    <Input
                        label="URL изображения"
                        value={editingProduct?.images?.[0] || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, images: [e.target.value] }))}
                    />

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold">Характеристики</label>
                            <button
                                onClick={() => handleAttributeChange("Новая хар-ка", "Значение")}
                                className="text-xs bg-black text-white px-2 py-1 rounded"
                            >
                                + Добавить
                            </button>
                        </div>
                        <div className="space-y-2 bg-gray-50 p-3 rounded-xl">
                            {Object.entries(editingProduct?.attributes || {}).map(([key, value], idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        className="w-1/3 p-2 text-sm border rounded"
                                        value={key}
                                        onChange={(e) => handleAttributeChange(e.target.value, value as string, key)}
                                    />
                                    <input
                                        className="flex-1 p-2 text-sm border rounded"
                                        value={value as string}
                                        onChange={(e) => handleAttributeChange(key, e.target.value)}
                                    />
                                    <button onClick={() => removeAttribute(key)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                        <XIcon size={16} />
                                    </button>
                                </div>
                            ))}
                            {Object.keys(editingProduct?.attributes || {}).length === 0 && <p className="text-xs text-gray-400 italic">Характеристики не добавлены.</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Описание</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg border bg-shop-gray min-h-[100px]"
                            value={editingProduct?.description || ''}
                            onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const XIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
)
