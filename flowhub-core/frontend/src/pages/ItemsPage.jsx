import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getItems, deleteItem, activateItem, startBulkOperation } from '../services/itemService';
import useAuth from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import Input from '../components/common/Input';
import ItemDetailsModal from '../components/items/ItemDetailsModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';
import Card from '../components/ui/Card';
import BulkActionsBar from '../components/items/BulkActionsBar';
import BulkOperationModal from '../components/items/BulkOperationModal';

/**
 * Items Page - Flow 3 Implementation
 * 
 * Displays items in a table with search, filter, sort, and pagination.
 * Implements auto-refresh every 30 seconds.
 */
export default function ItemsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canPerform } = useAuth();
  const { showToast } = useToast();

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });

  // Filter and sort state (synced with URL)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by')?.split(',') || ['createdAt']);
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order')?.split(',') || ['desc']);
  const [categories, setCategories] = useState([]);

  // Auto-refresh state
  const [isUserActive, setIsUserActive] = useState(false);
  const refreshIntervalRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Modal state (Flow 4)
  const [modalItemId, setModalItemId] = useState(null);
  const [modalTriggerElement, setModalTriggerElement] = useState(null);

  // Delete modal state (Flow 6)
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deleteModalTriggerElement, setDeleteModalTriggerElement] = useState(null);

  // Bulk operation state (Flow 7)
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkJobId, setBulkJobId] = useState(null);
  const [bulkInitialProgress, setBulkInitialProgress] = useState(0);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  /**
   * Toggle item selection
   */
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  /**
   * Toggle select all on current page
   * Selects all items regardless of status (PRD Section 5)
   */
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  };

  /**
   * Start a bulk operation
   */
  const handleStartBulkJob = async (operation, payload = {}) => {
    try {
      setLoading(true);
      const response = await startBulkOperation(operation, selectedItems, payload);
      setBulkJobId(response.job_id);
      setBulkInitialProgress(response.job_progress || 0);
      setIsBulkModalOpen(true);
    } catch (err) {
      showToast(err.message || 'Failed to start bulk operation', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bulk job complete handler
   */
  const handleBulkJobComplete = () => {
    setIsBulkModalOpen(false);
    setBulkJobId(null);
    setSelectedItems([]);
    fetchItems(); // Refresh the list
  };

  /**
   * Fetch items from API
   */
  const fetchItems = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const params = {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        category: category !== 'all' ? category : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: pagination.page,
        limit: pagination.limit,
        silent
      };

      const response = await getItems(params);
      
      setItems(response.items || []);
      setPagination(response.pagination || pagination);

      // Extract unique categories from items
      const uniqueCategories = [...new Set(response.items?.map(item => item.category).filter(Boolean) || [])];
      setCategories(prev => {
        const combined = [...new Set([...prev, ...uniqueCategories])];
        return combined.sort();
      });

    } catch (err) {
      if (!silent) {
        setError(err.message || 'Failed to load items');
      }
      console.error('Error fetching items:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [search, status, category, sortBy, sortOrder, pagination.page, pagination.limit]);

  /**
   * Update URL parameters
   */
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (category !== 'all') params.set('category', category);
    if (sortBy.length > 0 && sortBy[0] !== 'createdAt') {
      params.set('sort_by', sortBy.join(','));
    }
    if (sortOrder.length > 0 && sortOrder[0] !== 'desc') {
      params.set('sort_order', sortOrder.join(','));
    }
    if (pagination.page > 1) params.set('page', pagination.page.toString());
    if (pagination.limit !== 20) params.set('limit', pagination.limit.toString());
    
    setSearchParams(params, { replace: true });
  }, [search, status, category, sortBy, sortOrder, pagination.page, pagination.limit, setSearchParams]);

  /**
   * Debounced search handler
   */
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setIsUserActive(true);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setIsUserActive(false);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
    }, 2000); // Resume auto-refresh 2s after typing stops
  }, []);

  /**
   * Handle filter changes
   */
  const handleStatusChange = (value) => {
    setStatus(value);
    setIsUserActive(true);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    setTimeout(() => setIsUserActive(false), 2000);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setIsUserActive(true);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    setTimeout(() => setIsUserActive(false), 2000);
  };

  /**
   * Handle sort
   */
  const handleSort = (field) => {
    const currentIndex = sortBy.indexOf(field);
    let newSortBy = [...sortBy];
    let newSortOrder = [...sortOrder];

    if (currentIndex === -1) {
      // New field - add as primary sort
      newSortBy = [field, ...newSortBy].slice(0, 2);
      newSortOrder = ['asc', ...newSortOrder].slice(0, 2);
    } else {
      // Existing field - cycle: asc -> desc -> remove
      const currentOrder = newSortOrder[currentIndex];
      if (currentOrder === 'asc') {
        newSortOrder[currentIndex] = 'desc';
      } else {
        // Remove from sort
        newSortBy = newSortBy.filter((_, i) => i !== currentIndex);
        newSortOrder = newSortOrder.filter((_, i) => i !== currentIndex);
        // If no sorts, default to createdAt desc
        if (newSortBy.length === 0) {
          newSortBy = ['createdAt'];
          newSortOrder = ['desc'];
        }
      }
    }

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setIsUserActive(true);
    setTimeout(() => setIsUserActive(false), 2000);
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    setIsUserActive(true);
    setTimeout(() => setIsUserActive(false), 1000);
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: parseInt(newLimit), page: 1 }));
    setIsUserActive(true);
    setTimeout(() => setIsUserActive(false), 2000);
  };

  /**
   * Get sort indicator for column
   */
  const getSortIndicator = (field) => {
    const index = sortBy.indexOf(field);
    if (index === -1) {
      return (
        <svg className="w-4 h-4 inline-block ml-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    const isAsc = sortOrder[index] === 'asc';
    return (
      <span className="inline-flex items-center ml-1.5">
        {isAsc ? (
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    );
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  /**
   * Format price
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  /**
   * Truncate description
   */
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Initial fetch and URL sync
  useEffect(() => {
    fetchItems();
  }, [pagination.page, pagination.limit, status, category, sortBy, sortOrder]);

  // Update URL when filters change
  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Auto-refresh setup
  useEffect(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up auto-refresh (30 seconds)
    refreshIntervalRef.current = setInterval(() => {
      if (!isUserActive && !loading) {
        fetchItems(true); // Silent refresh
      }
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isUserActive, loading, fetchItems]);

  // Sync search with debounce (300ms as per PRD)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchItems();
    }, 300); // 300ms debounce as per PRD

    return () => clearTimeout(timeout);
  }, [search]);

  /**
   * Handle Delete button click (Flow 6)
   * PRD Section 5: User Journey - Click "Delete" button on item row
   */
  const handleDeleteItem = useCallback((item, event) => {
    // Store the trigger element for focus return (PRD Section 14.1: Focus Management)
    setDeleteModalTriggerElement(event.currentTarget);
    setDeleteModalItem(item);
  }, []);

  /**
   * Handle delete confirmation (Flow 6)
   * PRD Section 5: User Journey - User confirms deletion
   */
  const handleDeleteConfirm = useCallback(async (itemId, signal) => {
    try {
      // PRD Section 5: API Call - DELETE /api/items/{id}
      await deleteItem(itemId, signal);

      // PRD Section 10.1: After Successful Delete
      // Close modal (handled by parent)
      setDeleteModalItem(null);
      setDeleteModalTriggerElement(null);

      // PRD Section 12.1: Show success toast
      showToast('Item deactivated', 'success', 3000);

      // PRD Section 10.1: Refresh item list (fetch updated list from API)
      await fetchItems();

    } catch (error) {
      // PRD Section 11.2: Error Display Decision Matrix
      const nonRecoverableErrors = [400, 401, 404, 409];
      const isNonRecoverable = nonRecoverableErrors.includes(error.statusCode || error.error_code || 0);

      if (isNonRecoverable) {
        // PRD Section 11.1: Close modal, show error toast
        setDeleteModalItem(null);
        setDeleteModalTriggerElement(null);
        showToast(error.message || 'Deactivation failed', 'error', 5000);
      } else {
        // PRD Section 11.1: Keep modal open, show error in modal (recoverable errors)
        // Error will be handled by DeleteConfirmationModal component
        throw error; // Re-throw to let modal handle it
      }
    }
  }, [showToast, fetchItems]);

  /**
   * Handle delete modal cancel (Flow 6)
   * PRD Section 7.2: Cancel Button
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalItem(null);
    // Return focus to trigger element (PRD Section 14.1)
    if (deleteModalTriggerElement && typeof deleteModalTriggerElement.focus === 'function') {
      deleteModalTriggerElement.focus();
    }
    setDeleteModalTriggerElement(null);
  }, [deleteModalTriggerElement]);

  /**
   * Handle Activate button click (Flow 6 extension)
   * Activates (restores) a deleted item
   */
  const handleActivateItem = useCallback(async (item) => {
    if (!item || !item._id) return;

    try {
      // Activate item via API
      await activateItem(item._id);

      // Show success toast
      showToast('Item activated', 'success', 3000);

      // Refresh item list
      await fetchItems();

    } catch (error) {
      // Show error toast
      showToast(error.message || 'Activation failed', 'error', 5000);
    }
  }, [showToast, fetchItems]);

  /**
   * Handle View button click (Flow 4)
   * PRD Section 5: User Journey - Click "View" button on item row
   * PRD Section 16.1: URL Hash Management - Update hash when modal opens
   */
  const handleViewItem = (itemId, event) => {
    // Store the trigger element for focus return (PRD Section 10.2)
    setModalTriggerElement(event.currentTarget);
    setModalItemId(itemId);
    
    // Update URL hash for deep linking (PRD Section 16.1)
    const newHash = `#item/${itemId}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
    }
  };

  /**
   * Handle modal close (Flow 4)
   */
  const handleModalClose = () => {
    setModalItemId(null);
    setModalTriggerElement(null);
  };

  /**
   * Check URL hash on mount and when hash changes (Flow 4)
   * PRD Section 16.1: Deep linking support
   */
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#item/')) {
        const itemId = hash.substring(6); // Remove '#item/'
        if (itemId) {
          setModalItemId(itemId);
        }
      }
    };

    // Check on mount
    checkHash();

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Page Description */}
      <div className="mb-6">
        <p className="text-base text-slate-600 leading-relaxed">
          Manage and view all your items
        </p>
      </div>

      <Card variant="elevated">
          {/* Search and Filters - Single Row */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end" role="group" aria-label="Search and filters">
              {/* Search Bar - Takes more space */}
              <div className="flex-1 w-full sm:min-w-[300px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or description..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    role="searchbox"
                    aria-label="Search items"
                    data-testid="item-search"
                    className="w-full px-4 pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-slate-400 placeholder:text-slate-400 focus:outline-none"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {search && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                      data-testid="search-clear"
                      aria-label="Clear search"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-[160px]">
                <label className="block text-sm font-medium text-slate-700 mb-1.5 leading-normal">Status</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-slate-400"
                  role="combobox"
                  aria-label="Filter by status"
                  data-testid="filter-status"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-[160px]">
                <label className="block text-sm font-medium text-slate-700 mb-1.5 leading-normal">Category</label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-slate-400"
                  role="combobox"
                  aria-label="Filter by category"
                  data-testid="filter-category"
                >
                  <option value="all">All</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(status !== 'all' || category !== 'all' || search) && (
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 leading-normal opacity-0 pointer-events-none">Clear</label>
                  <Button
                    onClick={() => {
                      setStatus('all');
                      setCategory('all');
                      handleSearchChange('');
                    }}
                    variant="secondary"
                    dataTestid="clear-filters"
                    className="w-full sm:w-auto"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorMessage message={error} onRetry={() => fetchItems()} />
          )}

          {/* Loading State */}
          {loading && items.length === 0 && (
            <div className="text-center py-12" aria-busy="true" aria-live="polite" data-testid="loading-items">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-600 font-medium">Loading items...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && !error && (
            <div className="text-center py-12" role="status" data-testid="empty-state">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">
                {search || status !== 'all' || category !== 'all'
                  ? 'No items match your filters'
                  : 'No items found'}
              </h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {search || status !== 'all' || category !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Create your first item to get started.'}
              </p>
            </div>
          )}

          {/* Items Table */}
          {!loading && items.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table
                  className="min-w-full divide-y divide-slate-200"
                  role="table"
                  aria-label="Items table"
                  data-testid="items-table"
                >
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5 text-left">
                        <input
                          type="checkbox"
                          checked={items.length > 0 && selectedItems.length === items.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                          aria-label="Select all items"
                          data-testid="select-all-checkbox"
                        />
                      </th>
                      <th
                        className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 active:bg-slate-200 transition-colors group"
                        onClick={() => handleSort('name')}
                        role="button"
                        aria-label="Sort by name"
                        data-testid="sort-name"
                      >
                        <span className="flex items-center">
                          Name
                          {getSortIndicator('name')}
                        </span>
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th
                        className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 active:bg-slate-200 transition-colors group"
                        onClick={() => handleSort('category')}
                        role="button"
                        aria-label="Sort by category"
                        data-testid="sort-category"
                      >
                        <span className="flex items-center">
                          Category
                          {getSortIndicator('category')}
                        </span>
                      </th>
                      <th
                        className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 active:bg-slate-200 transition-colors group"
                        onClick={() => handleSort('price')}
                        role="button"
                        aria-label="Sort by price"
                        data-testid="sort-price"
                      >
                        <span className="flex items-center">
                          Price
                          {getSortIndicator('price')}
                        </span>
                      </th>
                      <th
                        className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 active:bg-slate-200 transition-colors group"
                        onClick={() => handleSort('createdAt')}
                        role="button"
                        aria-label="Sort by created date"
                        data-testid="sort-created"
                      >
                        <span className="flex items-center">
                          Created
                          {getSortIndicator('createdAt')}
                        </span>
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {items.map((item) => (
                      <tr key={item._id} className={`hover:bg-slate-50 transition-colors ${selectedItems.includes(item._id) ? 'bg-indigo-50/50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                            aria-label={`Select ${item.name}`}
                            data-testid={`select-item-${item._id}`}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900" data-testid={`item-name-${item._id}`}>
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 leading-relaxed" data-testid={`item-description-${item._id}`} title={item.description}>
                          {truncateDescription(item.description)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-testid={`item-status-${item._id}`}>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900" data-testid={`item-category-${item._id}`}>
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900" data-testid={`item-price-${item._id}`}>
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" data-testid={`item-created-${item._id}`}>
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-testid={`item-actions-${item._id}`}>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => handleViewItem(item._id, e)}
                              className="text-indigo-600 hover:text-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg px-3 py-1.5 transition-colors duration-150"
                              role="button"
                              aria-label={`View details for ${item.name}`}
                              data-testid={`view-item-${item._id}`}
                            >
                              View
                            </button>
                            {/* Only show Edit button if user has permission */}
                            {item.is_active && canPerform('edit', item) && (
                              <button
                                onClick={() => navigate(`/items/${item._id}/edit`)}
                                className="text-indigo-600 hover:text-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg px-3 py-1.5 transition-colors duration-150"
                                role="button"
                                aria-label={`Edit ${item.name}`}
                                data-testid={`edit-item-${item._id}`}
                              >
                                Edit
                              </button>
                            )}
                            {/* Show Deactivate button if user has permission */}
                            {item.is_active && canPerform('deactivate', item) ? (
                              <button
                                onClick={(e) => handleDeleteItem(item, e)}
                                className="text-red-600 hover:text-red-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg px-3 py-1.5 transition-colors duration-150"
                                role="button"
                                aria-label={`Deactivate ${item.name}`}
                                data-testid={`delete-item-${item._id}`}
                              >
                                Deactivate
                              </button>
                            ) : !item.is_active && canPerform('activate', item) ? (
                              <button
                                onClick={() => handleActivateItem(item)}
                                className="text-emerald-600 hover:text-emerald-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg px-3 py-1.5 transition-colors duration-150"
                                role="button"
                                aria-label={`Activate ${item.name}`}
                                data-testid={`activate-item-${item._id}`}
                              >
                                Activate
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 0 && (
                <div className="mt-6 flex items-center justify-between" role="navigation" aria-label="Pagination" data-testid="pagination-info">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.has_prev}
                      variant="secondary"
                      dataTestid="pagination-prev"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.has_next}
                      variant="secondary"
                      dataTestid="pagination-next"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700 leading-normal">
                        Showing <span className="font-semibold">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-semibold">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span> of{' '}
                        <span className="font-semibold">{pagination.total}</span> items
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-slate-700">Items per page:</label>
                        <select
                          value={pagination.limit}
                          onChange={(e) => handleLimitChange(e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                          role="combobox"
                          aria-label="Items per page"
                          data-testid="pagination-limit"
                        >
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={!pagination.has_prev}
                          variant="secondary"
                          dataTestid="pagination-prev"
                        >
                          Previous
                        </Button>
                        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.total_pages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.total_pages - 2) {
                            pageNum = pagination.total_pages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              variant={pagination.page === pageNum ? 'primary' : 'secondary'}
                              dataTestid={`pagination-page-${pageNum}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        <Button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={!pagination.has_next}
                          variant="secondary"
                          dataTestid="pagination-next"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
      </Card>

      {/* Item Details Modal (Flow 4) */}
      <ItemDetailsModal
        isOpen={modalItemId !== null}
        itemId={modalItemId}
        onClose={handleModalClose}
        triggerElement={modalTriggerElement}
      />

      {/* Delete Confirmation Modal (Flow 6) */}
      <DeleteConfirmationModal
        isOpen={deleteModalItem !== null}
        item={deleteModalItem}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        triggerElement={deleteModalTriggerElement}
      />

      {/* Bulk Operations Components (Flow 7) */}
      {canPerform('bulk') && (
        <BulkActionsBar 
          selectedCount={selectedItems.length}
          onBulkDeactivate={() => handleStartBulkJob('deactivate')}
          onBulkActivate={() => handleStartBulkJob('activate')}
          onClearSelection={() => setSelectedItems([])}
        />
      )}

      <BulkOperationModal
        isOpen={isBulkModalOpen}
        jobId={bulkJobId}
        initialProgress={bulkInitialProgress}
        onComplete={handleBulkJobComplete}
        onCancel={() => setIsBulkModalOpen(false)}
      />
    </div>
  );
}
