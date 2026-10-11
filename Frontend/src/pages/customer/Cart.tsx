import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { CartItemRow } from '../../components/cart/CartItemRow';
import { CartSummary } from '../../components/cart/CartSummary';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Toast, ToastType } from '../../components/common/Toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const Cart: React.FC = () => {
  const { cart, isLoading, error, fetchCart, updateItem, removeItem, clearCart, clearError } = useCartStore();
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  const handleUpdateQuantity = async (itemId: number, newQty: number) => {
    setUpdatingItemId(itemId);
    clearError();
    try {
      await updateItem(itemId, newQty);
    } catch (err: any) {
      showToast(err.message || 'Could not update item quantity.', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItemId(itemId);
    try {
      await removeItem(itemId);
      showToast('Item removed from cart.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not remove item.', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleConfirmClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      setClearDialogOpen(false);
      showToast('Your shopping cart has been cleared.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not clear cart.', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your hardware cart..." />
      </div>
    );
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast id={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Confirmation Dialog for Clear Cart */}
      <ConfirmDialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleConfirmClearCart}
        title="Clear Entire Cart?"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Yes, Clear Cart"
        isDestructive
        isLoading={isClearing}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-900 tracking-tight flex items-center space-x-3">
            <ShoppingCart className="w-7 h-7 text-brand-600" />
            <span>Shopping Cart</span>
          </h1>
          <p className="text-sm text-steel-500 mt-1">
            {hasItems ? `You have ${cart?.total_items || 0} item(s) ready for checkout` : 'Review your selected items'}
          </p>
        </div>

        <Link
          to="/products"
          className="hidden sm:inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Continue Shopping
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!hasItems ? (
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added any hardware items to your cart yet. Explore our screws, bolts, and brackets to find what you need."
          actionText="Continue Shopping"
          actionLink="/products"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.item_id || item.product_id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                isUpdating={updatingItemId === (item.item_id || item.product_id)}
              />
            ))}
          </div>

          {/* Cart Summary Card */}
          <div className="lg:col-span-1 sticky top-24">
            <CartSummary
              totalItems={cart?.total_items || 0}
              totalPrice={cart?.total_price || 0}
              onClearCart={() => setClearDialogOpen(true)}
              isClearing={isClearing}
            />
          </div>
        </div>
      )}
    </div>
  );
};
