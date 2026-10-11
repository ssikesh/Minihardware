import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../types/product';
import { StockBadge } from './StockBadge';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

interface ProductCardProps {
  product: Product;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onToast }) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }

    if (isOutOfStock) return;

    setIsAdding(true);
    try {
      await addItem(product.id, 1);
      setIsSuccess(true);
      if (onToast) onToast(`Added "${product.name}" to cart!`, 'success');
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err: any) {
      if (onToast) onToast(err.message || 'Could not add product to cart.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop&q=60';

  return (
    <div className="group flex flex-col justify-between bg-white rounded-2xl border border-steel-200/80 hover:border-brand-500/30 hover:shadow-lg hover:shadow-steel-200/50 transition-all duration-200 overflow-hidden h-full">
      <Link to={`/products/${product.id}`} className="block relative bg-steel-100/50 overflow-hidden aspect-square">
        <img
          src={product.image_url || defaultImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="absolute top-2.5 right-2.5">
          <StockBadge status={product.stock_status} />
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-steel-400 mb-1">
            <span>{product.category?.name || 'Hardware'}</span>
            <span className="font-mono text-steel-500">{product.sku}</span>
          </div>

          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-steel-900 group-hover:text-brand-600 transition text-sm sm:text-base line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-steel-100 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-steel-400 font-medium">Price</span>
            <span className="text-lg font-bold text-steel-900">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-steel-500">
            <span>Available:</span>
            <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : 'text-steel-800'}`}>
              {product.stock_quantity} units
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition ${
              isOutOfStock
                ? 'bg-steel-100 text-steel-400 cursor-not-allowed border border-steel-200'
                : isSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/20 active:scale-[0.98]'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
