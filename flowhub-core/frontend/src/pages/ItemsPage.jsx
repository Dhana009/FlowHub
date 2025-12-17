import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getItems } from '../services/itemService';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import Input from '../components/common/Input';
import ItemDetailsModal from '../components/items/ItemDetailsModal';

/**
 * Items Page - Flow 3 Implementation
 * 
 * Displays items in a table with search, filter, sort, and pagination.
 * Implements auto-refresh every 30 seconds.
 */
export default function ItemsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
    if (index === -1) return '—';
    return sortOrder[index] === 'asc' ? '↑' : '↓';
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

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm" role="banner" aria-label="Items page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">F</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">FlowHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/items/create')}
                variant="primary"
                dataTestid="create-item-button"
              >
                Create Item
              </Button>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="secondary"
                dataTestid="logout-button"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Page Title */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Items</h2>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search items by name or description..."
                value={search}
                onChange={handleSearchChange}
                role="searchbox"
                aria-label="Search items"
                dataTestid="item-search"
                className="pl-10 pr-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  data-testid="search-clear"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4" role="group" aria-label="Filters">
              {/* Status Filter */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setStatus('all');
                      setCategory('all');
                      handleSearchChange('');
                    }}
                    variant="secondary"
                    dataTestid="clear-filters"
                  >
                    Clear Filters
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
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading items...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && !error && (
            <div className="text-center py-12" role="status" data-testid="empty-state">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {search || status !== 'all' || category !== 'all'
                  ? 'No items match your filters'
                  : 'No items found'}
              </h3>
              <p className="text-gray-600 mb-4">
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
                  className="min-w-full divide-y divide-gray-200"
                  role="table"
                  aria-label="Items table"
                  data-testid="items-table"
                >
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                        role="button"
                        aria-label="Sort by name"
                        data-testid="sort-name"
                      >
                        Name {getSortIndicator('name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('category')}
                        role="button"
                        aria-label="Sort by category"
                        data-testid="sort-category"
                      >
                        Category {getSortIndicator('category')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('price')}
                        role="button"
                        aria-label="Sort by price"
                        data-testid="sort-price"
                      >
                        Price {getSortIndicator('price')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                        role="button"
                        aria-label="Sort by created date"
                        data-testid="sort-created"
                      >
                        Created {getSortIndicator('createdAt')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`item-name-${item._id}`}>
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500" data-testid={`item-description-${item._id}`} title={item.description}>
                          {truncateDescription(item.description)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-testid={`item-status-${item._id}`}>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`item-category-${item._id}`}>
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`item-price-${item._id}`}>
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-testid={`item-created-${item._id}`}>
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-testid={`item-actions-${item._id}`}>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => handleViewItem(item._id, e)}
                              className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                              role="button"
                              aria-label={`View details for ${item.name}`}
                              data-testid={`view-item-${item._id}`}
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/items/${item._id}/edit`)}
                              className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-2 py-1"
                              role="button"
                              aria-label={`Edit ${item.name}`}
                              data-testid={`edit-item-${item._id}`}
                            >
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
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
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span> of{' '}
                        <span className="font-medium">{pagination.total}</span> items
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Items per page:</label>
                        <select
                          value={pagination.limit}
                          onChange={(e) => handleLimitChange(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
        </div>
      </main>

      {/* Item Details Modal (Flow 4) */}
      <ItemDetailsModal
        isOpen={modalItemId !== null}
        itemId={modalItemId}
        onClose={handleModalClose}
        triggerElement={modalTriggerElement}
      />
    </div>
  );
}
