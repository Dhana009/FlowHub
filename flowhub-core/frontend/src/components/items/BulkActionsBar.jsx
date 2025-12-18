import Button from '../common/Button';

/**
 * Bulk Actions Bar - Flow 7
 * 
 * Floating bar that appears when items are selected.
 */
export default function BulkActionsBar({ selectedCount, onBulkDeactivate, onBulkActivate, onClearSelection }) {
  if (selectedCount === 0) return null;

  return (
    <div 
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up"
      role="region"
      aria-label="Bulk actions toolbar"
      data-testid="bulk-actions-bar"
    >
      <div className="bg-slate-900 text-white rounded-full shadow-2xl px-6 py-3 flex items-center space-x-6 border border-slate-700/50 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center space-x-2 border-r border-slate-700 pr-6 mr-2">
          <span 
            className="bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center" 
            data-testid="selected-count-badge"
            aria-label={`${selectedCount} items selected`}
          >
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-slate-300" aria-hidden="true">items selected</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onBulkActivate}
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors duration-150 px-3 py-1 rounded-md hover:bg-emerald-900/20"
            aria-label="Bulk activate selected items"
            data-testid="bulk-activate-button"
          >
            Activate
          </button>

          <button
            onClick={onBulkDeactivate}
            className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors duration-150 px-3 py-1 rounded-md hover:bg-red-900/20"
            aria-label="Bulk deactivate selected items"
            data-testid="bulk-deactivate-button"
          >
            Deactivate
          </button>

          <button
            onClick={onClearSelection}
            className="text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors duration-150 ml-2"
            aria-label="Clear selection"
            data-testid="bulk-clear-selection"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

