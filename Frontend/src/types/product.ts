import { CategorySimple } from './category';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  sku: string;
  price: number;
  stock_quantity: number;
  available: boolean;
  stock_status: StockStatus;
  category: CategorySimple;
  image_url?: string | null;
  low_stock_threshold?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  category_id: number;
  image_url?: string;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  category_id?: number;
  image_url?: string;
  is_active?: boolean;
  low_stock_threshold?: number;
  stock_quantity?: number;
}

export interface InventoryItem {
  product_id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  current_stock: number;
  low_stock_threshold: number;
  status: StockStatus;
}

export interface InventoryFilterParams {
  page?: number;
  limit?: number;
  status?: StockStatus;
}

export interface DashboardStats {
  total_products: number;
  total_categories: number;
  low_stock_products: number;
  out_of_stock_products: number;
}
