# **Frontend Architecture - Flow 3: Item List**

**Version:** 1.0  
**Date:** December 17, 2024  
**Technology:** React + Tailwind CSS

---

## **1. Folder Structure**

```
frontend/
├── src/
│   ├── pages/
│   │   └── ItemListPage.jsx         # Item list page
│   ├── components/
│   │   ├── items/
│   │   │   ├── ItemTable.jsx        # Main table component
│   │   │   ├── SearchBar.jsx        # Search input component
│   │   │   ├── Filters.jsx          # Filter dropdowns component
│   │   │   ├── TableSort.jsx        # Sort functionality
│   │   │   └── Pagination.jsx        # Pagination controls
│   │   └── common/
│   │       ├── LoadingSpinner.jsx   # Loading indicator
│   │       └── ErrorMessage.jsx     # Error display
│   ├── hooks/
│   │   ├── useItems.js              # Items data fetching hook
│   │   └── useDebounce.js           # Debounce utility hook
│   ├── services/
│   │   ├── api.js                   # API client (axios wrapper)
│   │   └── itemService.js           # Item API calls
│   ├── utils/
│   │   ├── queryParams.js           # URL query parameter utilities
│   │   └── formatters.js            # Data formatting (currency, dates)
│   ├── routes/
│   │   └── AppRoutes.jsx            # Route definitions
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

---

## **2. Component Structure**

### **2.1 Pages**

**ItemListPage.jsx:**
- **Purpose:** Container page for item list
- **Structure:** Layout with header, search, filters, table, pagination
- **Route:** `/items` or `/items/list`
- **Protected:** Yes (requires authentication)
- **No business logic** - orchestrates components

---

### **2.2 Item Components**

**ItemTable.jsx - Required Elements:**

- **Table Element:**
  - `<table role="table" aria-label="Items table" data-testid="items-table">`
  - Responsive design (horizontal scroll on mobile)

- **Table Header:**
  - Sortable column headers
  - Visual sort indicators (↑ ↓)
  - Click handlers for sorting
  - Semantic: `data-testid="column-{name}"`, `data-testid="sort-{name}"`

- **Table Body:**
  - One row per item
  - Row hover effect
  - Semantic: `data-testid="item-row-{id}"`

- **Table Cells:**
  - Name: `data-testid="item-name-{id}"`
  - Description: `data-testid="item-description-{id}"` (truncated)
  - Status: `data-testid="item-status-{id}"` (badge)
  - Category: `data-testid="item-category-{id}"`
  - Price: `data-testid="item-price-{id}"` (formatted)
  - Created: `data-testid="item-created-{id}"` (formatted)
  - Actions: `data-testid="item-actions-{id}"` (View, Edit, Delete buttons)

**SearchBar.jsx - Required Props:**
- `value`: Current search value
- `onChange`: Change handler
- `onClear`: Clear handler
- `loading`: Loading state

**Required Elements:**
- Input: `data-testid="item-search"`
- Clear button: `data-testid="search-clear"`
- Semantic: `role="searchbox"`, `aria-label="Search items"`

**Filters.jsx - Required Props:**
- `filters`: Current filter values
- `onFilterChange`: Filter change handler
- `onClear`: Clear all filters handler

**Required Elements:**
- Status dropdown: `data-testid="filter-status"`
- Category dropdown: `data-testid="filter-category"`
- Clear button: `data-testid="clear-filters"`
- Semantic: `role="group"`, `aria-label="Filters"`

**Pagination.jsx - Required Props:**
- `pagination`: Pagination metadata object
- `onPageChange`: Page change handler
- `onLimitChange`: Limit change handler

**Required Elements:**
- Previous button: `data-testid="pagination-prev"`
- Next button: `data-testid="pagination-next"`
- Page numbers: `data-testid="pagination-page-{number}"`
- Limit selector: `data-testid="pagination-limit"`
- Page info: `data-testid="pagination-info"`
- Semantic: `role="navigation"`, `aria-label="Pagination"`

---

## **3. State Management**

### **3.1 Query State** (`hooks/useItems.js`)

**Purpose:** Manages query parameters and data fetching.

**State Variables:**
```javascript
const [queryParams, setQueryParams] = useState({
  search: '',
  status: '',
  category: '',
  sort_by: ['created_at'],
  sort_order: ['desc'],
  page: 1,
  limit: 20
});

const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**Required Functions:**
- `updateQueryParams`: Update query parameters
- `fetchItems`: Fetch items from API
- `resetFilters`: Reset all filters to default
- `handleSearch`: Handle search input with debounce
- `handleFilter`: Handle filter changes
- `handleSort`: Handle column sort
- `handlePageChange`: Handle pagination

---

### **3.2 URL State Management** (`utils/queryParams.js`)

**Purpose:** Sync query parameters with URL.

**Required Functions:**

1. **`getQueryParamsFromURL()`**
   - Parse URL query parameters
   - Return query params object
   - Default values for missing params

2. **`updateURLQueryParams(params)`**
   - Update URL with new query parameters
   - Preserve other URL params
   - Use browser history API

3. **`buildQueryString(params)`**
   - Build query string from params object
   - Handle arrays (sort_by, sort_order)
   - Encode special characters

---

### **3.3 Debounced Search** (`hooks/useDebounce.js`)

**Purpose:** Debounce search input to reduce API calls.

```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
```

**Usage:**
```javascript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  // Fetch items with debouncedSearch
}, [debouncedSearch]);
```

---

## **4. API Integration**

### **4.1 Item Service** (`services/itemService.js`)

**Purpose:** Item API calls.

**Required Functions:**

1. **`getItems(queryParams)`**
   - **Input:** Query parameters object
   - **Process:**
     - Build query string from params
     - Call `GET /api/items` with query string
     - Handle response/errors
   - **Output:** Items data with pagination

```javascript
async function getItems(queryParams) {
  const queryString = buildQueryString(queryParams);
  const response = await api.get(`/items?${queryString}`);
  return response.data;
}
```

---

## **5. Component Implementation**

### **5.1 ItemTable Component**

**Structure:**
```jsx
const ItemTable = ({ items, onSort, sortConfig }) => {
  return (
    <table role="table" aria-label="Items table" data-testid="items-table">
      <thead>
        <tr>
          <th onClick={() => onSort('name')} data-testid="sort-name">
            Name {getSortIcon('name')}
          </th>
          {/* Other columns */}
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item._id} data-testid={`item-row-${item._id}`}>
            <td data-testid={`item-name-${item._id}`}>{item.name}</td>
            {/* Other cells */}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

### **5.2 SearchBar Component**

**Structure:**
```jsx
const SearchBar = ({ value, onChange, onClear, loading }) => {
  return (
    <div role="search" aria-label="Search items">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search items by name or description..."
        role="searchbox"
        aria-label="Search items"
        data-testid="item-search"
        aria-busy={loading}
      />
      {value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          data-testid="search-clear"
        >
          ×
        </button>
      )}
    </div>
  );
};
```

---

### **5.3 Filters Component**

**Structure:**
```jsx
const Filters = ({ filters, onFilterChange, onClear }) => {
  return (
    <div role="group" aria-label="Filters">
      <select
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value)}
        aria-label="Filter by status"
        data-testid="filter-status"
      >
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="pending">Pending</option>
      </select>
      
      <select
        value={filters.category}
        onChange={(e) => onFilterChange('category', e.target.value)}
        aria-label="Filter by category"
        data-testid="filter-category"
      >
        {/* Category options */}
      </select>
      
      <button
        onClick={onClear}
        aria-label="Clear all filters"
        data-testid="clear-filters"
      >
        Clear Filters
      </button>
    </div>
  );
};
```

---

### **5.4 Pagination Component**

**Structure:**
```jsx
const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
  return (
    <nav role="navigation" aria-label="Pagination">
      <button
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={!pagination.has_prev}
        aria-label="Previous page"
        data-testid="pagination-prev"
      >
        Previous
      </button>
      
      {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
          data-testid={`pagination-page-${page}`}
          className={page === pagination.page ? 'active' : ''}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={!pagination.has_next}
        aria-label="Next page"
        data-testid="pagination-next"
      >
        Next
      </button>
      
      <select
        value={pagination.limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        aria-label="Items per page"
        data-testid="pagination-limit"
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
      
      <div role="status" aria-live="polite" data-testid="pagination-info">
        Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
      </div>
    </nav>
  );
};
```

---

## **6. Real-time Updates**

### **6.1 Auto-refresh Implementation**

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    // Only refresh if user is not actively interacting
    if (!isUserInteracting) {
      fetchItems();
    }
  }, 30000); // 30 seconds
  
  return () => clearInterval(interval);
}, [queryParams]);
```

**Pause Conditions:**
- User is typing in search box
- User is changing filters
- User is interacting with table
- User is on different page/tab

---

## **7. Loading and Error States**

### **7.1 Loading State**

- Skeleton loader for table rows
- Loading spinner in search box
- Disable interactions during load
- Semantic: `aria-busy="true"`, `data-testid="loading-items"`

### **7.2 Error State**

- Error message above table
- Retry button
- Semantic: `role="alert"`, `aria-live="assertive"`, `data-testid="error-message"`

### **7.3 Empty State**

- "No items found" message
- Illustration or icon
- Suggest clearing filters
- Semantic: `role="status"`, `data-testid="empty-state"`

---

## **8. Implementation Checklist**

### **Frontend Setup:**
- [ ] Setup React page component
- [ ] Create API client with interceptors
- [ ] Create item service (API calls)

### **Components:**
- [ ] Create ItemTable component
- [ ] Create SearchBar component
- [ ] Create Filters component
- [ ] Create Pagination component
- [ ] Create LoadingSpinner component
- [ ] Create ErrorMessage component

### **Hooks:**
- [ ] Create useItems hook
- [ ] Create useDebounce hook

### **Utils:**
- [ ] Create queryParams utilities
- [ ] Create formatters (currency, dates)

### **Features:**
- [ ] Implement search with debounce
- [ ] Implement filter functionality
- [ ] Implement sort functionality
- [ ] Implement pagination
- [ ] Implement URL state management
- [ ] Implement auto-refresh
- [ ] Implement loading states
- [ ] Implement error handling
- [ ] Add semantic HTML attributes
- [ ] Add data-testid attributes for automation

---

**Document Version:** 1.0  
**Status:** ✅ Complete  
**Next:** Proceed to Step B5 (Code Implementation) or continue with Flow 4

