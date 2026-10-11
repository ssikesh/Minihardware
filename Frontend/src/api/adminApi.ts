import apiClient from './axios';
import { ApiResponse, PaginatedData } from '../types/api';
import { Category, CategoryCreateInput, CategoryUpdateInput } from '../types/category';
import {
  DashboardStats,
  InventoryFilterParams,
  InventoryItem,
  Product,
  ProductCreateInput,
  ProductUpdateInput
} from '../types/product';

export const adminApi = {
  // Dashboard
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return response.data.data;
  },

  // Products
  createProduct: async (input: ProductCreateInput): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/admin/products', input);
    return response.data.data;
  },

  updateProduct: async (id: number, input: ProductUpdateInput): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, input);
    return response.data.data;
  },

  deleteProduct: async (id: number): Promise<{ product_id: number; is_active: boolean }> => {
    const response = await apiClient.delete<ApiResponse<{ product_id: number; is_active: boolean }>>(
      `/admin/products/${id}`
    );
    return response.data.data;
  },

  // Stock
  updateStock: async (id: number, stockQuantity: number): Promise<{ product_id: number; stock_quantity: number; stock_status: string }> => {
    const response = await apiClient.patch<ApiResponse<{ product_id: number; stock_quantity: number; stock_status: string }>>(
      `/admin/products/${id}/stock`,
      { stock_quantity: stockQuantity }
    );
    return response.data.data;
  },

  adjustStock: async (
    id: number,
    quantity: number,
    operation: 'ADD' | 'REMOVE'
  ): Promise<{ product_id: number; stock_quantity: number; stock_status: string }> => {
    const response = await apiClient.patch<ApiResponse<{ product_id: number; stock_quantity: number; stock_status: string }>>(
      `/admin/products/${id}/stock/adjust`,
      { quantity, operation }
    );
    return response.data.data;
  },

  // Inventory
  getInventory: async (params?: InventoryFilterParams): Promise<PaginatedData<InventoryItem>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<InventoryItem>>>('/admin/inventory', {
      params,
    });
    return response.data.data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/admin/categories');
    return response.data.data;
  },

  createCategory: async (input: CategoryCreateInput): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/admin/categories', input);
    return response.data.data;
  },

  updateCategory: async (id: number, input: CategoryUpdateInput): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, input);
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<{ category_id: number; is_active: boolean }> => {
    const response = await apiClient.delete<ApiResponse<{ category_id: number; is_active: boolean }>>(
      `/admin/categories/${id}`
    );
    return response.data.data;
  },
};
