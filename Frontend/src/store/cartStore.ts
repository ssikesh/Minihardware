import { create } from 'zustand';
import { cartApi } from '../api/cartApi';
import { Cart } from '../types/cart';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    // Only attempt if authenticated
    const token = localStorage.getItem('minihardware_token');
    if (!token) {
      set({ cart: null, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.getCart();
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addItem: async (productId: number, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.addToCart({ product_id: productId, quantity });
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateItem: async (itemId: number, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.updateCartItem(itemId, { quantity });
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  removeItem: async (itemId: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.removeCartItem(itemId);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.clearCart();
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  getItemCount: () => {
    const cart = get().cart;
    return cart?.total_items || 0;
  },

  clearError: () => set({ error: null }),
}));
