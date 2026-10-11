import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { CartItem } from '../../types/cart';
import { QuantitySelector } from '../product/QuantitySelector';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, newQty: number) => void;
  onRemove: (itemId: number) => void;
  isUpdating?: boolean;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}) => {
  const defaultImage = 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200&auto=format&fit=crop&q=60';
  const itemId = item.item_id || item.product_id;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-steel-200/80 gap-4 shadow-sm">
      {/* Product Image and Title */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <Link
          to={`/products/${item.product_id}`}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-steel-100 flex-shrink-0 border border-steel-200"
        >
          <img
            src={defaultImage}
            alt={item.name}
            className="w-full h-full object-cover object-center"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={`/products/${item.product_id}`}
            className="font-semibold text-steel-900 hover:text-brand-600 transition text-sm sm:text-base line-clamp-1"
          >
            {item.name}
          </Link>
          <p className="text-xs text-steel-500 mt-0.5">
            Unit Price: <span className="font-semibold text-steel-800">${item.price.toFixed(2)}</span>
          </p>
          <p className="text-xs text-steel-400 mt-0.5">
            Available Stock: <span className="font-medium text-steel-600">{item.available_stock}</span>
          </p>
        </div>
      </div>

      {/* Controls & Subtotal */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 sm:space-x-6">
        <QuantitySelector
          quantity={item.quantity}
          maxStock={item.available_stock}
          onChange={(qty) => onUpdateQuantity(itemId, qty)}
          disabled={isUpdating}
          size="sm"
        />

        <div className="text-right min-w-[70px]">
          <span className="text-xs text-steel-400 block sm:hidden">Subtotal</span>
          <span className="font-bold text-steel-900 text-sm sm:text-base">
            ${item.subtotal.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(itemId)}
          disabled={isUpdating}
          className="p-2 rounded-lg text-steel-400 hover:text-red-600 hover:bg-red-50 transition"
          title="Remove from cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
