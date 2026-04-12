import React, { useState, useEffect } from 'react';
import AdminService from '../../api/admin.service';
import { ApiCategory } from '../../api/product.service';
import { Button, Input, Modal } from '../../components/UI';
import { Plus, Trash2, Edit2, Loader2, AlertCircle } from 'lucide-react';

export const AdminCategories = () => {
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<ApiCategory> | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await AdminService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories:', err);
            setError('Не удалось загрузить категории');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm("Вы уверены? Удаление категории может повлиять на связанные товары и атрибуты.")) {
            try {
                await AdminService.deleteCategory(id);
                setCategories(prev => prev.filter(c => c.id !== id));
            } catch (err) {
                console.error('Failed to delete category:', err);
                alert('Ошибка при удалении категории. Возможно, в ней есть товары.');
            }
        }
    };

    const handleSave = async () => {
        if (!editingCategory?.title?.trim()) {
            setError('Введите название категории');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            if (editingCategory.id) {
                // Update
                const updated = await AdminService.updateCategory(editingCategory.id, { title: editingCategory.title.trim() });
                setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
            } else {
                // Create
                const created = await AdminService.createCategory({ title: editingCategory.title.trim() });
                setCategories(prev => [...prev, created]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save category:', err);
            setError('Ошибка при сохранении категории');
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        setError(null);
        setEditingCategory({ title: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (category: ApiCategory) => {
        setError(null);
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-500 font-medium">Загрузка категорий...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-display font-extrabold uppercase tracking-tight">Категории</h1>
                <Button onClick={openCreateModal} className="shrink-0">
                    <Plus size={20} /> Добавить категорию
                </Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold text-sm text-gray-900 w-24">ID</th>
                                <th className="p-4 font-bold text-sm text-gray-900">Название</th>
                                <th className="p-4 font-bold text-sm text-gray-900 text-right w-32">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-gray-500">{c.id}</td>
                                    <td className="p-4 font-medium text-gray-900">{c.title}</td>
                                    <td className="p-4 flex justify-end gap-2 text-right">
                                        <button 
                                            onClick={() => openEditModal(c)} 
                                            className="p-2 hover:bg-white border border-transparent hover:border-gray-200 shadow-sm hover:shadow rounded-lg text-blue-600 transition-all"
                                            title="Редактировать"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(c.id)} 
                                            className="p-2 hover:bg-white border border-transparent hover:border-red-100 shadow-sm hover:shadow rounded-lg text-red-600 transition-all"
                                            title="Удалить"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-500">
                                        Категории не найдены.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory?.id ? "Редактировать категорию" : "Новая категория"}
                footer={
                    <Button fullWidth onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <><Loader2 size={18} className="animate-spin" /> Сохранение...</>
                        ) : 'Сохранить'}
                    </Button>
                }
            >
                <div className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <Input
                        label="Название категории *"
                        value={editingCategory?.title || ''}
                        onChange={e => setEditingCategory(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Например: Смартфоны"
                        autoFocus
                    />
                </div>
            </Modal>
        </div>
    );
};
