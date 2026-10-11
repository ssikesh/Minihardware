import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { Product, ProductFilterParams } from '../../types/product';
import { Category } from '../../types/category';
import { ProductGrid } from '../../components/product/ProductGrid';
import { SearchBar } from '../../components/common/SearchBar';
import { Toast, ToastType } from '../../components/common/Toast';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  // Read URL query params
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!, 10) : undefined;
  const currentMinPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
  const currentMaxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
  const currentInStock = searchParams.get('in_stock') === 'true';

  // Load Categories once
  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch Products based on current URL params
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: ProductFilterParams = {
        page: currentPage,
        limit: 12,
        search: currentSearch || undefined,
        category_id: currentCategory,
        min_price: currentMinPrice,
        max_price: currentMaxPrice,
        in_stock: currentInStock ? true : undefined,
      };

      const res = await productApi.getProducts(params);
      setProducts(res.items);
      setTotalItems(res.pagination.total_items);
      setTotalPages(res.pagination.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentSearch, currentCategory, currentMinPrice, currentMaxPrice, currentInStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 on filter changes unless changing page
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast id={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-900 tracking-tight">
            Hardware Catalog
          </h1>
          <p className="text-sm text-steel-500 mt-1">
            Browse our full stock of fasteners, steel bolts, fittings, and workshop supplies
          </p>
        </div>

        <div className="w-full md:w-96">
          <SearchBar
            value={currentSearch}
            onSearch={(query) => updateParam('search', query)}
            placeholder="Search by bolt size, screw, SKU..."
          />
        </div>
      </div>

      {/* Filter and Content Row */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 bg-white p-6 rounded-2xl border border-steel-200 shadow-sm flex-shrink-0 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-steel-100">
            <div className="flex items-center space-x-2 text-steel-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </div>
            {(currentCategory || currentSearch || currentMinPrice || currentMaxPrice || currentInStock) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => updateParam('category_id', undefined)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentCategory === undefined
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-steel-600 hover:bg-steel-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateParam('category_id', cat.id.toString())}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    currentCategory === cat.id
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-steel-600 hover:bg-steel-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-steel-100">
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-2">
              Price Range ($)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Min"
                value={currentMinPrice ?? ''}
                onChange={(e) => updateParam('min_price', e.target.value)}
                className="w-full px-3 py-1.5 bg-steel-50 border border-steel-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Max"
                value={currentMaxPrice ?? ''}
                onChange={(e) => updateParam('max_price', e.target.value)}
                className="w-full px-3 py-1.5 bg-steel-50 border border-steel-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* In Stock Only Filter */}
          <div className="pt-4 border-t border-steel-100">
            <label className="flex items-center space-x-2 text-xs font-semibold text-steel-700 cursor-pointer">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : undefined)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-steel-300"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <div className="lg:hidden w-full flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-steel-200 text-sm font-semibold text-steel-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filter Options</span>
          </button>
          <span className="text-xs text-steel-500">{totalItems} products found</span>
        </div>

        {/* Main Product Area */}
        <div className="flex-1 w-full space-y-6">
          {error && <ErrorMessage message={error} onRetry={fetchProducts} />}

          {/* Active Filter Chips */}
          <div className="flex flex-wrap items-center justify-between text-xs text-steel-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-steel-700">Showing {products.length} of {totalItems} items</span>
              {currentSearch && (
                <span className="bg-steel-200 px-2 py-0.5 rounded-full text-steel-700">
                  Search: "{currentSearch}"
                </span>
              )}
              {currentCategory && (
                <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                  Category: {categories.find((c) => c.id === currentCategory)?.name || currentCategory}
                </span>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onToast={showToast}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-8">
              <button
                type="button"
                onClick={() => updateParam('page', (currentPage - 1).toString())}
                disabled={currentPage <= 1 || isLoading}
                className="p-2 rounded-xl border border-steel-200 text-steel-600 hover:bg-steel-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-semibold text-steel-700 px-4">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => updateParam('page', (currentPage + 1).toString())}
                disabled={currentPage >= totalPages || isLoading}
                className="p-2 rounded-xl border border-steel-200 text-steel-600 hover:bg-steel-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
