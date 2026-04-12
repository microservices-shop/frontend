import React, { useState, useEffect } from 'react';
import AdminService, { ApiAttribute, AttributeCreatePayload } from '../../api/admin.service';
import { ApiCategory } from '../../api/product.service';
import { Button, Input, Modal, Select } from '../../components/UI';
import { Plus, Trash2, Edit2, Loader2, AlertCircle } from 'lucide-react';

export const AdminAttributes = () => {
    const [attributes, setAttributes] = useState<ApiAttribute[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<Partial<ApiAttribute> | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [attrsData, catsData] = await Promise.all([
                AdminService.getAttributes(),
                AdminService.getCategories()
            ]);
            setAttributes(attrsData);
            setCategories(catsData);
        } catch (err) {
            console.error('Failed to load attributes data:', err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm("Вы уверены? Удаление атрибута навсегда уберёт его требование при создании товаров.")) {
            try {
                await AdminService.deleteAttribute(id);
                setAttributes(prev => prev.filter(a => a.id !== id));
            } catch (err) {
                console.error('Failed to delete attribute:', err);
                alert('Ошибка при удалении атрибута.');
            }
        }
    };

    const handleSave = async () => {
        if (!editingAttribute?.title?.trim()) {
            setError('Введите название атрибута');
            return;
        }
        if (!editingAttribute.category_id) {
            setError('Выберите категорию');
            return;
        }
        if (!editingAttribute.type) {
            setError('Выберите тип данных');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            if (editingAttribute.id) {
                // Update
                const payload = {
                    title: editingAttribute.title.trim(),
                    type: editingAttribute.type,
                    required: editingAttribute.required,
                    category_id: editingAttribute.category_id
                };
                const updated = await AdminService.updateAttribute(editingAttribute.id, payload);
                setAttributes(prev => prev.map(a => a.id === updated.id ? updated : a));
            } else {
                // Create
                const payload: AttributeCreatePayload = {
                    title: editingAttribute.title.trim(),
                    type: editingAttribute.type,
                    required: editingAttribute.required || false,
                    category_id: editingAttribute.category_id
                };
                const created = await AdminService.createAttribute(payload);
                setAttributes(prev => [...prev, created]);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('Failed to save attribute:', err);
            setError(err.response?.data?.detail || 'Ошибка при сохранении атрибута');
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        setError(null);
        setEditingAttribute({ title: '', type: 'STRING', required: false });
        setIsModalOpen(true);
    };

    const openEditModal = (attr: ApiAttribute) => {
        setError(null);
        setEditingAttribute(attr);
        setIsModalOpen(true);
    };

    const getCategoryName = (categoryId: number) => {
        return categories.find(c => c.id === categoryId)?.title || 'Неизвестно';
    };

    const typeOptions = [
        { value: 'STRING', label: 'Текст (String)' },
        { value: 'NUMBER', label: 'Число (Number)' },
        { value: 'BOOLEAN', label: 'Да/Нет (Boolean)' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-500 font-medium">Загрузка атрибутов...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-display font-extrabold uppercase tracking-tight">Атрибуты</h1>
                <Button onClick={openCreateModal} className="shrink-0">
                    <Plus size={20} /> Добавить атрибут
                </Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold text-sm text-gray-900 w-20">ID</th>
                                <th className="p-4 font-bold text-sm text-gray-900">Категория</th>
                                <th className="p-4 font-bold text-sm text-gray-900">Название</th>
                                <th className="p-4 font-bold text-sm text-gray-900">Тип</th>
                                <th className="p-4 font-bold text-sm text-gray-900">Обяз.</th>
                                <th className="p-4 font-bold text-sm text-gray-900 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attributes.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-gray-500">{a.id}</td>
                                    <td className="p-4 text-sm font-medium">
                                        <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs">
                                            {getCategoryName(a.category_id)}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{a.title}</td>
                                    <td className="p-4 text-sm text-gray-600">{a.type}</td>
                                    <td className="p-4">
                                        {a.required ? (
                                            <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">Да</span>
                                        ) : (
                                            <span className="text-gray-400 font-medium text-xs bg-gray-50 px-2 py-1 rounded">Нет</span>
                                        )}
                                    </td>
                                    <td className="p-4 flex justify-end gap-2 text-right">
                                        <button 
                                            onClick={() => openEditModal(a)} 
                                            className="p-2 hover:bg-white border border-transparent hover:border-gray-200 shadow-sm hover:shadow rounded-lg text-blue-600 transition-all"
                                            title="Редактировать"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(a.id)} 
                                            className="p-2 hover:bg-white border border-transparent hover:border-red-100 shadow-sm hover:shadow rounded-lg text-red-600 transition-all"
                                            title="Удалить"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {attributes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Атрибуты не найдены.
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
                title={editingAttribute?.id ? "Редактировать атрибут" : "Новый атрибут"}
                footer={
                    <Button fullWidth onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <><Loader2 size={18} className="animate-spin" /> Сохранение...</>
                        ) : 'Сохранить'}
                    </Button>
                }
            >
                <div className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Категория *</label>
                        <select
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black bg-shop-gray transition-all cursor-pointer"
                            value={editingAttribute?.category_id || ''}
                            onChange={e => setEditingAttribute(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>

                    <Input
                        label="Название атрибута *"
                        value={editingAttribute?.title || ''}
                        onChange={e => setEditingAttribute(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Например: Объем памяти"
                    />

                    <Select
                        label="Тип данных *"
                        value={editingAttribute?.type || 'STRING'}
                        onChange={(val) => setEditingAttribute(prev => ({ ...prev, type: val }))}
                        options={typeOptions}
                    />

                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={editingAttribute?.required || false}
                            onChange={e => setEditingAttribute(prev => ({ ...prev, required: e.target.checked }))}
                            className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <div>
                            <div className="font-medium text-sm text-gray-900">Обязательный атрибут</div>
                            <div className="text-xs text-gray-500">Товар нельзя сохранить без этого атрибута</div>
                        </div>
                    </label>
                </div>
            </Modal>
        </div>
    );
};
