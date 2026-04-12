import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, mapApiProductToProduct } from '../../types';
import ProductService, { ApiCategory } from '../../api/product.service';
import AdminService from '../../api/admin.service';
import { Button } from '../../components/UI';
import { Plus, Trash2, Edit2, Loader2, Search } from 'lucide-react';

export const AdminProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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
            console.error('Failed to load products list:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Вы уверены? Это действие удалит товар из базы.")) {
            try {
                await AdminService.deleteProduct(Number(id));
                setProducts(prev => prev.filter(p => p.id !== id));
            } catch (err) {
                console.error('Failed to delete product:', err);
                alert('Ошибка при удалении товара');
            }
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-500 font-medium">Загрузка товаров...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-display font-extrabold uppercase tracking-tight">Товары</h1>
                <Link to="/admin/products/new">
                    <Button className="shrink-0">
                        <Plus size={20} /> Добавить товар
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Поиск по названию..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold text-sm text-gray-900">Товар</th>
                                <th className="p-4 font-bold text-sm text-gray-900">Категория</th>
                                <th className="p-4 font-bold text-sm text-gray-900">Цена</th>
                                <th className="p-4 font-bold text-sm text-gray-900 text-center">Склад</th>
                                <th className="p-4 font-bold text-sm text-gray-900 text-center">Статус</th>
                                <th className="p-4 font-bold text-sm text-gray-900 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-shop-gray border border-gray-100 overflow-hidden flex items-center justify-center p-1 shrink-0">
                                            <img src={p.images[0]} alt={p.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 block">{p.name}</span>
                                            <span className="text-xs font-mono text-gray-500">ID: {p.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold whitespace-nowrap">₽{p.price.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className={`font-mono font-medium ${p.stock <= 5 ? 'text-red-500' : 'text-gray-900'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {p.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Активен
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                Архив
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 flex justify-end gap-2 text-right">
                                        <Link to={`/admin/products/${p.id}/edit`}>
                                            <button 
                                                className="p-2 hover:bg-white border border-transparent hover:border-gray-200 shadow-sm hover:shadow rounded-lg text-blue-600 transition-all"
                                                title="Редактировать"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(p.id)} 
                                            className="p-2 hover:bg-white border border-transparent hover:border-red-100 shadow-sm hover:shadow rounded-lg text-red-600 transition-all"
                                            title="Удалить"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        В каталоге пока нет товаров или они не найдены.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
