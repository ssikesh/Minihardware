import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { Product } from '../../types/product';
import { StockBadge } from '../../components/product/StockBadge';
import { QuantitySelector } from '../../components/product/QuantitySelector';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Toast, ToastType } from '../../components/common/Toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const prod = await productApi.getProductById(parseInt(id, 10));
        setProduct(prod);
        setQuantity(prod.stock_quantity > 0 ? 1 : 0);
      } catch (err: any) {
        setError(err.message || 'Product not found.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }

    if (product.stock_quantity <= 0) return;

    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
      setIsSuccess(true);
      showToast(`Added ${quantity} × "${product.name}" to your cart!`, 'success');
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err: any) {
      showToast(err.message || 'Could not add to cart.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&auto=format&fit=crop&q=60';

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product specifications..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorMessage
          message={error || 'Product not found.'}
          onRetry={() => navigate('/products')}
        />
        <div className="mt-4">
          <Link
            to="/products"
            className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast id={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-steel-500">
        <Link to="/" className="hover:text-steel-800 transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-steel-800 transition">Products</Link>
        <span>/</span>
        <Link to={`/products?category_id=${product.category?.id}`} className="hover:text-steel-800 transition">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-steel-900 font-semibold truncate max-w-[200px] sm:max-w-md">{product.name}</span>
      </nav>

      {/* Main Product Showcase Card */}
      <div className="bg-white rounded-3xl border border-steel-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-10">
        {/* Product Image Stage */}
        <div className="relative aspect-square rounded-2xl bg-steel-100 overflow-hidden border border-steel-200 flex items-center justify-center">
          <img
            src={product.image_url || defaultImage}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
          <div className="absolute top-4 right-4">
            <StockBadge status={product.stock_status} quantity={product.stock_quantity} showQuantity />
          </div>
        </div>

        {/* Product Details & Purchase Form */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-steel-500">
              <span className="px-2.5 py-1 bg-steel-100 rounded-md font-medium text-steel-700">
                {product.category?.name || 'Uncategorized'}
              </span>
              <span className="font-mono bg-steel-50 px-2 py-0.5 rounded border border-steel-200 text-steel-600">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-black text-steel-900">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-steel-400 font-medium">/ unit (tax included)</span>
            </div>

            <div className="pt-4 border-t border-steel-100">
              <h3 className="text-xs font-bold text-steel-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-steel-600 leading-relaxed whitespace-pre-line">
                {product.description || 'Precision-crafted industrial hardware built to strict mechanical tolerances.'}
              </p>
            </div>

            {/* Inventory Status Panel */}
            <div className="p-4 rounded-xl bg-steel-50 border border-steel-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-steel-500">Inventory Status</p>
                <p className="text-sm font-bold text-steel-900">
                  {isOutOfStock ? 'Currently Unavailable' : `${product.stock_quantity} Available in Warehouse`}
                </p>
              </div>
              <StockBadge status={product.stock_status} />
            </div>
          </div>

          {/* Quantity and Add to Cart Section */}
          <div className="pt-6 border-t border-steel-100 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-semibold text-steel-600">Select Quantity</span>
                <QuantitySelector
                  quantity={quantity}
                  maxStock={product.stock_quantity}
                  onChange={setQuantity}
                  disabled={isOutOfStock}
                  size="md"
                />
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <span className="text-xs text-steel-400 mb-1">
                  Subtotal: <strong className="text-steel-900">${(product.price * quantity).toFixed(2)}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-sm active:scale-[0.99] ${
                    isOutOfStock
                      ? 'bg-steel-200 text-steel-400 cursor-not-allowed'
                      : isSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Sold Out</span>
                  ) : isSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-steel-500">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>Fast dispatch from warehouse</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>Verified physical stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
