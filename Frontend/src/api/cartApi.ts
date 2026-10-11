import apiClient from './axios';
import { ApiResponse } from '../types/api';
import { AddToCartInput, Cart, UpdateCartItemInput } from '../types/cart';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<ApiResponse<Cart>>('/cart');
    return response.data.data;
  },

  addToCart: async (input: AddToCartInput): Promise<Cart> => {
    const response = await apiClient.post<ApiResponse<Cart>>('/cart/items', input);
    return response.data.data;
  },

  updateCartItem: async (itemId: number, input: UpdateCartItemInput): Promise<Cart> => {
    const response = await apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, input);
    return response.data.data;
  },

  removeCartItem: async (itemId: number): Promise<Cart> => {
    const response = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return response.data.data;
  },

  clearCart: async (): Promise<Cart> => {
    const response = await apiClient.delete<ApiResponse<Cart>>('/cart');
    return response.data.data;
  },
};
