import apiClient from './axios';
import { ApiResponse, PaginatedData } from '../types/api';
import { Product, ProductFilterParams } from '../types/product';

export const productApi = {
  getProducts: async (params?: ProductFilterParams): Promise<PaginatedData<Product>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<Product>>>('/products', {
      params,
    });
    return response.data.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },
};
