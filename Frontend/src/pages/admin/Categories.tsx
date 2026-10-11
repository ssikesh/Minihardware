import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { Category, CategoryCreateInput, CategoryUpdateInput } from '../../types/category';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Toast, ToastType } from '../../components/common/Toast';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete / Deactivate Confirm Dialog State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsActive(cat.is_active);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      if (editingCategory) {
        const updateData: CategoryUpdateInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          is_active: isActive,
        };
        await adminApi.updateCategory(editingCategory.id, updateData);
        showToast(`Category "${name}" updated successfully.`, 'success');
      } else {
        const createData: CategoryCreateInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          is_active: isActive,
        };
        await adminApi.createCategory(createData);
        showToast(`Category "${name}" created successfully.`, 'success');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteCategory(categoryToDelete.id);
      showToast(`Category "${categoryToDelete.name}" deactivated or removed.`, 'info');
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate category.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast id={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Delete / Deactivate Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Deactivate Category?"
        message={`Are you sure you want to deactivate "${categoryToDelete?.name}"? If products belong to this category, it will be soft-deactivated.`}
        confirmText="Yes, Deactivate"
        isDestructive
        isLoading={isDeleting}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Washers & Spacers"
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-steel-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the department, products included, or specifications..."
              className="w-full px-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition resize-y"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-steel-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-steel-300"
              />
              <span>Active (visible in public category list)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-steel-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-steel-200 text-steel-600 hover:bg-steel-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
            >
              {isSaving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">Product Categories Directory</h2>
          <p className="text-xs text-steel-500 mt-0.5">Manage department classifications for all hardware items</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Category</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCategories} />}

      {/* Categories Table Card */}
      <div className="bg-white rounded-2xl border border-steel-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text="Loading categories list..." />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-sm text-steel-500">
            No categories created yet. Click "New Category" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-steel-50 text-steel-500 text-xs uppercase font-semibold border-b border-steel-200">
                <tr>
                  <th className="py-3.5 px-6">Category Name</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-steel-50/70 transition">
                    <td className="py-4 px-6 font-bold text-steel-900">{cat.name}</td>
                    <td className="py-4 px-6 text-steel-600 text-xs max-w-sm truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-steel-100 text-steel-500 border-steel-200'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-lg text-steel-500 hover:text-steel-800 hover:bg-steel-100 transition"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1.5 rounded-lg text-steel-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Deactivate Category"
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
