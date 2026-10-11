import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { Category } from '../../types/category';
import { ProductUpdateInput } from '../../types/product';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductUpdateInput>({
    name: '',
    sku: '',
    description: '',
    category_id: 0,
    price: 0,
    is_active: true,
    image_url: '',
    low_stock_threshold: 10,
    stock_quantity: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [cats, prod] = await Promise.all([
          categoryApi.getCategories(),
          productApi.getProductById(parseInt(id, 10)),
        ]);
        setCategories(cats);
        setFormData({
          name: prod.name,
          sku: prod.sku,
          description: prod.description || '',
          category_id: prod.category.id,
          price: prod.price,
          is_active: prod.is_active ?? true,
          image_url: prod.image_url || '',
          low_stock_threshold: prod.low_stock_threshold || 10,
          stock_quantity: prod.stock_quantity,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load product data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setIsSaving(true);

    try {
      await adminApi.updateProduct(parseInt(id, 10), {
        ...formData,
        sku: formData.sku?.toUpperCase().trim(),
        image_url: formData.image_url?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/products');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update product.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading product details..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          to="/admin/products"
          className="p-2 rounded-xl bg-white border border-steel-200 text-steel-600 hover:text-steel-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-steel-900">Edit Hardware Item</h1>
          <p className="text-xs text-steel-500">Update specifications, category assignment, or activation status</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Product updated successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-steel-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              SKU *
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition uppercase"
            />
          </div>

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

          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Low Stock Warning Threshold
            </label>
            <input
              type="number"
              min="0"
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Product Active Status
            </label>
            <div className="flex items-center space-x-3 mt-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-steel-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-steel-300"
                />
                <span>Active (visible to customers)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition resize-y"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-steel-100 flex items-center justify-end space-x-3">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-steel-200 text-steel-600 hover:bg-steel-50 font-semibold text-sm transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || success}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center space-x-2 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Update Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
