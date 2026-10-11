export interface Category {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategorySimple {
  id: number;
  name: string;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  is_active?: boolean;
}
