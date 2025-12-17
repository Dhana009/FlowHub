import { useState } from 'react';
import Button from '../common/Button';

/**
 * Bulk Category Update Modal - Flow 7
 */
export default function BulkCategoryModal({ isOpen, onConfirm, onCancel, categories }) {
  const [selectedCategory, setSelectedCategory] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Update Category</h3>
          <p className="text-sm text-slate-600 mb-6">
            Select a new category for the selected items.
          </p>

          <div className="space-y-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
              data-testid="bulk-category-select"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="flex space-x-3 pt-2">
              <Button
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
                dataTestid="cancel-bulk-category"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => onConfirm(selectedCategory)}
                disabled={!selectedCategory}
                className="flex-1"
                dataTestid="confirm-bulk-category"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

