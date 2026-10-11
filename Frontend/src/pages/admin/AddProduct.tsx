import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { categoryApi } from '../../api/categoryApi';
import { Category } from '../../types/category';
import { ProductCreateInput } from '../../types/product';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form State
  const [formData, setFormData] = useState<ProductCreateInput>({
    name: '',
    sku: '',
    description: '',
    category_id: 0,
    price: 0,
    stock_quantity: 50,
    low_stock_threshold: 10,
    image_url: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    categoryApi
      .getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: data[0].id }));
        }
      })
      .finally(() => setIsLoadingCategories(false));
  }, []);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU identifier is required';
    if (!formData.category_id) errors.category_id = 'Please choose a category';
    if (formData.price < 0) errors.price = 'Price cannot be negative';
    if (formData.stock_quantity < 0) errors.stock_quantity = 'Stock quantity cannot be negative';
    if (formData.low_stock_threshold < 0) errors.low_stock_threshold = 'Threshold cannot be negative';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await adminApi.createProduct({
        ...formData,
        sku: formData.sku.toUpperCase().trim(),
        image_url: formData.image_url?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/products');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create product.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCategories) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading form fields..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link
          to="/admin/products"
          className="p-2 rounded-xl bg-white border border-steel-200 text-steel-600 hover:text-steel-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-steel-900">Add New Product</h1>
          <p className="text-xs text-steel-500">Create a hardware item and assign initial warehouse stock</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Product created successfully! Redirecting to products list...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-steel-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. M6 Stainless Steel Hex Bolt (30mm)"
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
            {validationErrors.name && <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              SKU (Stock Keeping Unit) *
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. BOLT-M6-30-SS"
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition uppercase"
            />
            {validationErrors.sku && <p className="text-xs text-red-600 mt-1">{validationErrors.sku}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value, 10) })}
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Unit Price ($) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          {/* Initial Stock Quantity */}
          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Initial Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Low Stock Warning Threshold *
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Product Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide specifications, material grade (e.g. 304 Stainless Steel), thread pitch, and use cases..."
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition resize-y"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-steel-100 flex items-center justify-end space-x-3">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-steel-200 text-steel-600 hover:bg-steel-50 font-semibold text-sm transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || success}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center space-x-2 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Creating Product...' : 'Add Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
