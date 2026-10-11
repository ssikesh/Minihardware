export interface CartItem {
  item_id?: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  available_stock: number;
  subtotal: number;
}

export interface Cart {
  cart_id: number;
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface AddToCartInput {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}
