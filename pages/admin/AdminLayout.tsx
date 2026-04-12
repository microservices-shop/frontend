import React, { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../store';
import { LayoutGrid, Package, Settings, Tags, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLayout = () => {
    const { user, isLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-black rounded-full mb-4"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const navigation = [
        { name: 'Товары', to: '/admin', icon: Package, end: true },
        { name: 'Категории', to: '/admin/categories', icon: LayoutGrid },
        { name: 'Атрибуты', to: '/admin/attributes', icon: Tags },
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <div className={`
                fixed md:sticky top-0 md:top-[80px] h-[100vh] md:h-[calc(100vh-80px)] 
                w-64 bg-white border-r border-gray-100 shadow-sm z-50 md:z-10
                transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 md:p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-8 md:hidden">
                        <span className="font-display font-bold text-xl uppercase">Меню</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-8 hidden md:block">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Управление</h2>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                end={item.end}
                                onClick={() => setIsSidebarOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                                    ${isActive 
                                        ? 'bg-black text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-shop-gray hover:text-black'
                                    }
                                `}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Mobile Header indicator */}
                <div className="md:hidden bg-white p-4 border-b flex items-center justify-between sticky top-0 z-30">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-shop-gray rounded-full"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="font-display font-bold uppercase text-sm">Панель управления</span>
                    <div className="w-8"></div> {/* Spacer for centering */}
                </div>

                <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
