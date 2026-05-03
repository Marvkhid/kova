'use client';
// ============================================================
// KOVA — Cart Context
// Global cart state with localStorage persistence.
// Wrap the app in <CartProvider> inside layout.tsx.
// ============================================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '@/lib/types';
import { CART_STORAGE_KEY } from '@/lib/types/data/constants';
import { computeCartTotal } from '@/lib/utils';

// ── State & Actions ────────────────────────────────────────

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD';      product: Product }
  | { type: 'REMOVE';   productId: string }
  | { type: 'UPDATE';   productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE';  items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items };

    case 'ADD': {
      const exists = state.items.find(i => i.product.id === action.product.id);
      if (exists) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: 1 }] };
    }

    case 'REMOVE':
      return { items: state.items.filter(i => i.product.id !== action.productId) };

    case 'UPDATE':
      if (action.quantity < 1) {
        return { items: state.items.filter(i => i.product.id !== action.productId) };
      }
      return {
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };

    case 'CLEAR':
      return { items: [] };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────

interface CartContextValue {
  items:          CartItem[];
  itemCount:      number;
  total:          number;
  addItem:        (product: Product) => void;
  removeItem:     (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart:      () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        dispatch({ type: 'HYDRATE', items: parsed });
      }
    } catch {
      // corrupted storage — start fresh
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback((product: Product) => {
    dispatch({ type: 'ADD', product });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE', productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total     = computeCartTotal(state.items);

  return (
    <CartContext.Provider
      value={{ items: state.items, itemCount, total, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}