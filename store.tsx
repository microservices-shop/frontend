import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, CartItem, Product } from './types';
import { MOCK_PRODUCTS } from './constants';
import AuthService from './api/auth.service';
import { setAccessToken } from './api/api';

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
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('shop_cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        quantity: 1,
        snapshotPrice: product.price, // Record price at time of addition
        product: product
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((sum, item) => sum + (item.snapshotPrice * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};