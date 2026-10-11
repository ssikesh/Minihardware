import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import { InventoryItem, StockStatus } from '../../types/product';
import { StockBadge } from '../../components/product/StockBadge';
import { StockModal } from '../../components/admin/StockModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Toast, ToastType } from '../../components/common/Toast';
import { Search, ChevronLeft, ChevronRight, Boxes, SlidersHorizontal } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StockStatus | ''>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stock edit modal
  const [selectedItemForStock, setSelectedItemForStock] = useState<InventoryItem | null>(null);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getInventory({
        page,
        limit: 15,
        status: statusFilter ? statusFilter : undefined,
      });

      // Optional client-side search filter over returned paginated batch
      let filtered = res.items;
      if (search.trim()) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (i) => i.name.toLowerCase().includes(query) || i.sku.toLowerCase().includes(query)
        );
      }

      setItems(filtered);
      setTotalItems(res.pagination.total_items);
      setTotalPages(res.pagination.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  const handleStockUpdated = (newStock: number, newStatus: string) => {
    if (!selectedItemForStock) return;
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === selectedItemForStock.product_id
          ? { ...item, current_stock: newStock, status: newStatus as any }
          : item
      )
    );
    showToast(`Stock updated to ${newStock} units for ${selectedItemForStock.name}.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast id={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Stock Update Modal */}
      {selectedItemForStock && (
        <StockModal
          isOpen={!!selectedItemForStock}
          onClose={() => setSelectedItemForStock(null)}
          productId={selectedItemForStock.product_id}
          productName={selectedItemForStock.name}
          currentStock={selectedItemForStock.current_stock}
          onStockUpdated={handleStockUpdated}
        />
      )}

      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-steel-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory by title or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-steel-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition shadow-sm"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-steel-200 shadow-sm text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === ''
                ? 'bg-steel-900 text-white shadow-sm'
                : 'text-steel-600 hover:text-steel-900 hover:bg-steel-50'
            }`}
          >
            All Stock
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('IN_STOCK');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'IN_STOCK'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            In Stock
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('LOW_STOCK');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'LOW_STOCK'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Low Stock
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('OUT_OF_STOCK');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'OUT_OF_STOCK'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchInventory} />}

      {/* Inventory Table Card */}
      <div className="bg-white rounded-2xl border border-steel-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text="Retrieving live stock metrics..." />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-steel-500">
            No inventory records found for the selected status filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-steel-50 text-steel-500 text-xs uppercase font-semibold border-b border-steel-200">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Current Stock</th>
                  <th className="py-3.5 px-6">Low Stock Threshold</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Update Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {items.map((item) => (
                  <tr key={item.product_id} className="hover:bg-steel-50/70 transition">
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-steel-900">{item.name}</p>
                      <span className="text-xs text-steel-500">{item.category}</span>
                    </td>

                    <td className="py-3.5 px-6 font-mono text-xs text-steel-600">{item.sku}</td>

                    <td className="py-3.5 px-6 font-bold text-steel-900">
                      <span
                        className={`text-base ${
                          item.status === 'OUT_OF_STOCK'
                            ? 'text-red-600 font-extrabold'
                            : item.status === 'LOW_STOCK'
                            ? 'text-amber-600 font-bold'
                            : 'text-steel-900'
                        }`}
                      >
                        {item.current_stock}
                      </span>{' '}
                      <span className="text-xs font-normal text-steel-500">units</span>
                    </td>

                    <td className="py-3.5 px-6 font-medium text-steel-600">{item.low_stock_threshold} units</td>

                    <td className="py-3.5 px-6">
                      <StockBadge status={item.status} />
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedItemForStock(item)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-steel-200 hover:border-brand-500 hover:bg-brand-50 text-xs font-bold text-brand-700 transition"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-steel-100 flex items-center justify-between text-xs text-steel-500">
            <span>Showing page {page} of {totalPages} ({totalItems} total items)</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || isLoading}
                className="p-1.5 rounded-lg border border-steel-200 text-steel-600 hover:bg-steel-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages || isLoading}
                className="p-1.5 rounded-lg border border-steel-200 text-steel-600 hover:bg-steel-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
