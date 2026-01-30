import React, { useState } from 'react';
import { useAuth } from '../store';
import { Navigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';
import { Product, Category, CATEGORY_LABELS } from '../types';
import { Button, Input, Modal } from '../components/UI';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';

export const Admin = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

    if (!user || user.role !== 'admin') return <Navigate to="/" />;

    const handleDelete = (id: string) => {
        if (confirm("Вы уверены? Это действие временно удалит товар.")) {
            setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
        }
    };

    const handleSave = () => {
        // Save logic would go to API here
        if (editingProduct?.id) {
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct as Product : p));
        } else {
            const newProduct = { ...editingProduct, id: `p${Date.now()}`, isActive: true } as Product;
            setProducts(prev => [...prev, newProduct]);
        }
        setIsModalOpen(false);
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
                                <td className="p-4 text-sm">{CATEGORY_LABELS[p.category as Category] || p.category}</td>
                                <td className="p-4 font-bold">₽{p.price.toLocaleString()}</td>
                                <td className="p-4 text-sm">{p.stock}</td>
                                <td className="p-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.isActive ? 'Активен' : 'Удален'}
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
                footer={<Button fullWidth onClick={handleSave}>Сохранить изменения</Button>}
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
                            {Object.values(Category).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
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
