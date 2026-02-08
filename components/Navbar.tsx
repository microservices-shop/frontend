import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Search, Menu, X, LogIn, LayoutGrid, Package, Plus } from 'lucide-react';
import { useAuth } from '../store';
import { useCart } from '../store';
import { Button } from './UI';

export const Navbar = () => {
  const { user, login, logout, isLoading } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 text-xs font-medium px-4">
        Только оригинальная продукция с официальной гарантией производителя
      </div>

      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between gap-4">

          {/* Desktop Logo & Links Group */}
          <div className="flex items-center gap-6 lg:gap-10">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
              <Link to="/" className="text-2xl md:text-3xl font-display font-extrabold tracking-tighter uppercase whitespace-nowrap">
                SHOPX
              </Link>
            </div>

            <div className="hidden md:flex items-center">
              <Link to="/catalog">
                <Button variant="primary" className="px-8 py-2.5 h-11 text-base whitespace-nowrap flex items-center gap-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <LayoutGrid size={18} />
                  Каталог
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md bg-shop-gray rounded-full px-4 h-11 items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-black/5">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500 h-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Icons (Admin, Cart, Orders, Profile) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Кнопка добавления товара */}
            <Link
              to="/admin/products/new"
              className="hidden sm:flex items-center gap-2 px-4 h-11 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-colors"
              title="Добавить товар"
            >
              <Plus size={18} />
              <span className="hidden lg:inline">Добавить товар</span>
            </Link>

            {/* Кнопка админ-панели (пока видна всем) */}
            <a
              href="http://localhost:8002/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 h-11 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
            >
              <LayoutGrid size={18} />
              <span className="hidden lg:inline">Админ панель</span>
            </a>

            <Link
              to="/cart"
              className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-shop-gray transition-colors"
              aria-label="Корзина"
            >
              <ShoppingCart size={28} className="text-black" />
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-black text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {user && (
              <Link
                to="/orders"
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-shop-gray transition-colors"
                title="Мои заказы"
                aria-label="Мои заказы"
              >
                <Package size={28} className="text-black" />
              </Link>
            )}

            {user ? (
              <Link
                to="/profile"
                className="ml-2 flex items-center gap-2 hover:opacity-80 transition relative group"
                aria-label="Мой профиль"
              >
                <img
                  src={user.picture_url}
                  alt="Профиль"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full border border-gray-200 object-cover"
                />
              </Link>
            ) : (
              <button
                onClick={login}
                disabled={isLoading}
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-shop-gray transition-colors font-medium"
                aria-label="Войти"
              >
                {isLoading ? "..." : <UserIcon size={28} className="text-black" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search (Below header) */}
        <div className="md:hidden mt-4">
          <form onSubmit={handleSearch} className="flex bg-shop-gray rounded-full px-4 py-3 items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              className="bg-transparent border-none outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link to="/catalog" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium border-b pb-2">Каталог</Link>
          <Link
            to="/admin/products/new"
            onClick={() => setIsMenuOpen(false)}
            className="text-lg font-medium text-green-600"
          >
            + Добавить товар
          </Link>
          <a
            href="http://localhost:8002/admin"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="text-lg font-medium text-gray-700"
          >
            Админ панель
          </a>
        </div >
      )}
    </nav >
  );
};