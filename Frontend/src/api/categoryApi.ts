import apiClient from './axios';
import { ApiResponse } from '../types/api';
import { Category } from '../types/category';

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },
};
