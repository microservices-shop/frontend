import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from './types';
import AuthService from './api/auth.service';
import { setAccessToken } from './api/api';
import { CartService, ApiCartItem } from './api/cart.service';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string }) => Promise<void>;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isCheckingAuth = React.useRef(false);

  const checkAuth = useCallback(async () => {
    if (isCheckingAuth.current) {
      return;
    }
    isCheckingAuth.current = true;
    setIsLoading(true);
    try {
      // Try to refresh token on mount to restore session if cookie exists
      const { access_token } = await AuthService.refresh();
      setAccessToken(access_token);
      const userData = await AuthService.getMe();
      setUser(userData);
    } catch (error) {
      console.log('No active session or session expired');
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false;
    }
  }, []);

  // Set up event listener for session expiration
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);
    checkAuth();

    return () => {
      window.removeEventListener('auth-session-expired', handleSessionExpired);
    };
  }, [checkAuth]);

  const login = () => {
    AuthService.loginWithGoogle();
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name: string }) => {
    setIsLoading(true);
    try {
      const updatedUser = await AuthService.updateMe(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error; // Let the component handle display error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Cart Context ---
interface CartContextType {
  items: ApiCartItem[];
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  toggleSelection: (itemId: string, is_selected: boolean) => Promise<void>;
  toggleSelectAll: (is_selected: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  totalPrice: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ApiCartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotalPrice(0);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await CartService.getCart();
      setItems(response.items);
      setTotalPrice(response.total_price / 100); // копейки → рубли
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
      setError('Не удалось загрузить корзину');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      const existingItem = items.find(i => Number(i.product_id) === productId);
      if (existingItem) {
        await CartService.updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        await CartService.addItem(productId, quantity);
      }
      await refreshCart();
    } catch (err: any) {
      setError('Ошибка при добавлении в корзину');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    const previousItems = [...items];
    setItems(items.filter(i => i.id !== itemId));
    setError(null);
    try {
      await CartService.removeItem(itemId);
    } catch (err: any) {
      setError('Ошибка при удалении товара');
      setItems(previousItems);
      console.error(err);
    }
    // Перезагружаем, чтобы получить актуальный total_price с бэкенда
    await refreshCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;
    const previousItems = [...items];
    setItems(items.map(i => i.id === itemId ? { ...i, quantity } : i));
    setError(null);
    try {
      await CartService.updateQuantity(itemId, quantity);
    } catch (err: any) {
      setError('Ошибка при изменении количества');
      setItems(previousItems);
      console.error(err);
    }
    await refreshCart();
  };

  const clearCart = async () => {
    if (!user) return;
    const previousItems = [...items];
    setItems([]);
    setTotalPrice(0);
    setError(null);
    try {
      await CartService.clearCart();
    } catch (err: any) {
      setError('Ошибка при очистке корзины');
      setItems(previousItems);
      console.error(err);
    }
  };

  const toggleSelection = async (itemId: string, is_selected: boolean) => {
    if (!user) return;
    // Оптимистичное обновление флага
    const previousItems = [...items];
    setItems(items.map(i => i.id === itemId ? { ...i, is_selected } : i));
    setError(null);
    try {
      await CartService.selectItem(itemId, is_selected);
    } catch (err: any) {
      setError('Ошибка при изменении выбора товара');
      setItems(previousItems);
      console.error(err);
    }
    // Синхронизируем total_price с бэкенда (не пересчитываем локально)
    await refreshCart();
  };

  const toggleSelectAll = async (is_selected: boolean) => {
    if (!user) return;
    const previousItems = [...items];
    // Оптимистично: выбираем только доступные товары при is_selected=true
    setItems(items.map(i =>
      (!is_selected || (!i.out_of_stock && !i.product_deleted))
        ? { ...i, is_selected }
        : i
    ));
    setError(null);
    try {
      await CartService.selectAll(is_selected);
    } catch (err: any) {
      setError('Ошибка при массовом выборе товаров');
      setItems(previousItems);
      console.error(err);
    }
    await refreshCart();
  };

  // itemCount — только выбранные товары (зеркалит логику бэкенда)
  const itemCount = items
    .filter(i => i.is_selected && !i.out_of_stock && !i.product_deleted)
    .reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity,
      toggleSelection, toggleSelectAll, clearCart,
      totalPrice, itemCount, isLoading, error, refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};