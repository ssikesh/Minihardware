import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Boxes,
  ExternalLink,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import { Product } from '../../types/product';
import { StockBadge } from '../../components/product/StockBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast, ToastType } from '../../components/common/Toast';
import { StockModal } from '../../components/admin/StockModal';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Dialog States
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productApi.getProducts({
        page,
        limit: 15,
        search: search || undefined,
      });
      setProducts(res.items);
      setTotalPages(res.pagination.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteProduct(productToDelete.id);
      showToast(`Product "${productToDelete.name}" deactivated successfully.`, 'info');
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate product.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStockUpdated = (newStock: number, newStatus: string) => {
    if (!selectedProductForStock) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProductForStock.id
          ? { ...p, stock_quantity: newStock, stock_status: newStatus as any }
          : p
      )
    );
    showToast(`Stock updated to ${newStock} units.`, 'success');
  };

  const defaultImage = 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&auto=format&fit=crop&q=60';

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast id={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Stock Update Modal */}
      {selectedProductForStock && (
        <StockModal
          isOpen={!!selectedProductForStock}
          onClose={() => setSelectedProductForStock(null)}
          productId={selectedProductForStock.id}
          productName={selectedProductForStock.name}
          currentStock={selectedProductForStock.stock_quantity}
          onStockUpdated={handleStockUpdated}
        />
      )}

      {/* Deactivate Product Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Deactivate Product?"
        message={`Are you sure you want to deactivate "${productToDelete?.name}"? It will be hidden from customer store browsing.`}
        confirmText="Yes, Deactivate"
        isDestructive
        isLoading={isDeleting}
      />

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-steel-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter products by title, SKU..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-steel-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition shadow-sm"
          />
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Product</span>
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchProducts} />}

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-steel-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text="Loading product inventory..." />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-sm text-steel-500">
            No products match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-steel-50 text-steel-500 text-xs uppercase font-semibold border-b border-steel-200">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-steel-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.image_url || defaultImage}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-steel-100 border border-steel-200 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultImage;
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-steel-900 truncate max-w-xs">{p.name}</p>
                          <Link
                            to={`/products/${p.id}`}
                            target="_blank"
                            className="text-[11px] text-brand-600 hover:text-brand-700 flex items-center mt-0.5"
                          >
                            <span>Storefront link</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-steel-600">{p.sku}</td>
                    <td className="py-3 px-4 text-steel-600">{p.category?.name || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-steel-900">${Number(p.price).toFixed(2)}</td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedProductForStock(p)}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-steel-200 hover:border-brand-500 hover:bg-brand-50 font-bold text-steel-800 transition"
                        title="Click to adjust stock"
                      >
                        <Boxes className="w-3.5 h-3.5 text-steel-400" />
                        <span>{p.stock_quantity}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <StockBadge status={p.stock_status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-1.5 rounded-lg text-steel-500 hover:text-steel-800 hover:bg-steel-100 transition"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg text-steel-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Deactivate Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
