import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Github, Facebook } from 'lucide-react';
import { Button } from './UI';

export const Footer = () => {
    return (
        <footer className="bg-shop-gray pt-16 pb-8">
            {/* Newsletter Strip */}
            <div className="container mx-auto px-4 mb-12">
                <div className="bg-black text-white rounded-[20px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <h2 className="text-3xl md:text-4xl font-display font-extrabold uppercase leading-none text-center md:text-left">
                        Будьте в курсе <br /> наших последних предложений
                    </h2>
                    <div className="w-full md:w-80 space-y-3 text-center">
                        <input type="email" placeholder="Введите ваш email" className="w-full px-6 py-3 rounded-full text-black outline-none text-center" />
                        <Button variant="secondary" className="w-full font-bold">Подписаться на рассылку</Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 border-b pb-12 border-gray-200">
                <div>
                    <h3 className="text-3xl font-display font-extrabold uppercase mb-4">SHOPX</h3>
                    <p className="text-gray-600 text-sm mb-6 max-w-xs">
                        Специализированный магазин электроники. В наличии смартфоны, ноутбуки и аксессуары от ведущих мировых производителей с гарантией качества.
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-white p-2 rounded-full border hover:bg-black hover:text-white transition"><Twitter size={18} /></div>
                        <div className="bg-white p-2 rounded-full border hover:bg-black hover:text-white transition"><Facebook size={18} /></div>
                        <div className="bg-white p-2 rounded-full border hover:bg-black hover:text-white transition"><Instagram size={18} /></div>
                        <div className="bg-white p-2 rounded-full border hover:bg-black hover:text-white transition"><Github size={18} /></div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold uppercase tracking-widest mb-4">Компания</h4>
                    <ul className="space-y-3 text-gray-600 text-sm">
                        <li><Link to="#">О нас</Link></li>
                        <li><Link to="#">Особенности</Link></li>
                        <li><Link to="#">Работа</Link></li>
                        <li><Link to="#">Карьера</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold uppercase tracking-widest mb-4">Помощь</h4>
                    <ul className="space-y-3 text-gray-600 text-sm">
                        <li><Link to="#">Поддержка</Link></li>
                        <li><Link to="#">Детали доставки</Link></li>
                        <li><Link to="#">Условия использования</Link></li>
                        <li><Link to="#">Политика конфиденциальности</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold uppercase tracking-widest mb-4">FAQ</h4>
                    <ul className="space-y-3 text-gray-600 text-sm">
                        <li><Link to="#">Аккаунт</Link></li>
                        <li><Link to="#">Управление доставками</Link></li>
                        <li><Link to="#">Заказы</Link></li>
                        <li><Link to="#">Платежи</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                <p>Shop.co © 2000-2023, Все права защищены</p>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <div className="w-10 h-6 bg-white border rounded flex items-center justify-center text-[8px] font-bold text-gray-400">VISA</div>
                    <div className="w-10 h-6 bg-white border rounded flex items-center justify-center text-[8px] font-bold text-gray-400">MC</div>
                    <div className="w-10 h-6 bg-white border rounded flex items-center justify-center text-[8px] font-bold text-gray-400">PAYPAL</div>
                    <div className="w-10 h-6 bg-white border rounded flex items-center justify-center text-[8px] font-bold text-gray-400">APPLE</div>
                </div>
            </div>
        </footer>
    );
};