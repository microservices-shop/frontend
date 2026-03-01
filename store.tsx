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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, checkAuth }}>
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
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ApiCartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await CartService.getCart();
      setItems(response.items);
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
      // API возвращает один CartItem, а не всю корзину — перезагружаем корзину
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
    // Оптимистичное удаление
    const previousItems = [...items];
    setItems(items.filter(i => i.id !== itemId));
    setError(null);
    try {
      await CartService.removeItem(itemId);
      // API возвращает 204 No Content — оптимистичное обновление уже применено
    } catch (err: any) {
      setError('Ошибка при удалении товара');
      setItems(previousItems);
      console.error(err);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;
    // Оптимистичное обновление
    const previousItems = [...items];
    setItems(items.map(i => i.id === itemId ? { ...i, quantity } : i));
    setError(null);
    try {
      await CartService.updateQuantity(itemId, quantity);
      // API возвращает один CartItem — оптимистичное обновление уже применено
    } catch (err: any) {
      setError('Ошибка при изменении количества');
      setItems(previousItems);
      console.error(err);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    // Оптимистичная очистка
    const previousItems = [...items];
    setItems([]);
    setError(null);
    try {
      await CartService.clearCart();
      // API возвращает 204 No Content — оптимистичное обновление уже применено
    } catch (err: any) {
      setError('Ошибка при очистке корзины');
      setItems(previousItems);
      console.error(err);
    }
  };

  const cartTotal = items.reduce((sum, item) => sum + (Number(item.current_price ?? item.product_price) / 100 * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, itemCount, isLoading, error, refreshCart
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