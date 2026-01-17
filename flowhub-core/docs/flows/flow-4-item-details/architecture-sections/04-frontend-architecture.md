# **Frontend Architecture - Flow 4: Item Details**

**Version:** 1.0  
**Date:** December 17, 2024  
**Technology:** React + Tailwind CSS

---

## **1. Folder Structure**

```
frontend/
├── src/
│   ├── components/
│   │   ├── items/
│   │   │   ├── ItemDetailsModal.jsx  # Main modal component
│   │   │   └── EmbeddedIframe.jsx   # iframe component
│   │   └── common/
│   │       ├── Modal.jsx            # Reusable modal wrapper
│   │       ├── LoadingSpinner.jsx   # Loading indicator
│   │       └── ErrorMessage.jsx     # Error display
│   ├── hooks/
│   │   └── useItemDetails.js        # Item data fetching hook
│   ├── services/
│   │   ├── api.js                   # API client (axios wrapper)
│   │   └── itemService.js           # Item API calls
│   ├── utils/
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

### **2.1 Item Details Modal**

**ItemDetailsModal.jsx - Required Elements:**

- **Modal Overlay:**
  - Dark background (semi-transparent)
  - Covers entire screen
  - Clickable to close
  - Semantic: `role="dialog"`, `aria-modal="true"`, `data-testid="item-details-modal"`

- **Modal Container:**
  - Centered on screen
  - Responsive width (max-width: 800px)
  - Scrollable content
  - Semantic: `data-testid="modal-container"`

- **Modal Header:**
  - Title: "Item Details" or item name
  - Close button (X)
  - Semantic: `role="banner"`, `data-testid="modal-title"`, `data-testid="close-button"`

- **Modal Content:**
  - Loading state
  - Error state
  - Item information
  - Embedded iframe (if available)
  - Semantic: `role="main"`, `data-testid="modal-content"`

---

### **2.2 Item Information Display**

**Required Fields with Semantic Attributes:**
- Name: `data-testid="item-name-{id}"`
- Description: `data-testid="item-description-{id}"`
- Status: `data-testid="item-status-{id}"` (badge)
- Category: `data-testid="item-category-{id}"`
- Price: `data-testid="item-price-{id}"`
- Created Date: `data-testid="item-created-{id}"`
- Tags: `data-testid="item-tags-{id}"`
- Conditional fields: `data-testid="item-{field}-{id}"`

---

### **2.3 Embedded Iframe Component**

**EmbeddedIframe.jsx - Required Props:**
- `embedUrl`: URL for iframe src
- `itemName`: Item name for iframe title
- `onError`: Error handler

**Required Elements:**
- iframe element
- Loading state
- Error state
- Semantic: `data-testid="embedded-iframe-{id}"`

---

## **3. State Management**

### **3.1 Item Details Hook** (`hooks/useItemDetails.js`)

**Purpose:** Manages item data fetching and state.

**State Variables:**
```javascript
const [item, setItem] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**Required Functions:**
- `fetchItem`: Fetch item from API
- `resetState`: Clear item state

**Implementation:**
```javascript
function useItemDetails(itemId) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!itemId) return;
    
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await itemService.getItemById(itemId);
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [itemId]);
  
  return { item, loading, error, refetch: fetchItem };
}
```

---

## **4. Modal Implementation**

### **4.1 Modal Component Structure**

```jsx
const ItemDetailsModal = ({ itemId, isOpen, onClose }) => {
  const { item, loading, error } = useItemDetails(itemId);
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="item-details-modal"
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-container"
      >
        <header className="modal-header">
          <h2 id="modal-title" data-testid="modal-title">
            {loading ? "Item Details" : item?.name || "Item Details"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            data-testid="close-button"
          >
            ×
          </button>
        </header>
        
        <main className="modal-content" role="main" data-testid="modal-content">
          {loading && <LoadingState />}
          {error && <ErrorState error={error} onRetry={refetch} />}
          {item && <ItemContent item={item} />}
        </main>
      </div>
    </div>
  );
};
```

---

### **4.2 Focus Management**

**On Open:**
- Move focus to modal (close button or first focusable element)
- Trap focus within modal

**On Close:**
- Return focus to trigger element (View button)
- Remove focus trap

**Implementation:**
```javascript
useEffect(() => {
  if (isOpen) {
    // Save current focus
    const previousFocus = document.activeElement;
    
    // Move focus to modal
    const closeButton = modalRef.current?.querySelector('[data-testid="close-button"]');
    closeButton?.focus();
    
    // Trap focus
    const handleTab = (e) => {
      // Focus trap logic
    };
    document.addEventListener('keydown', handleTab);
    
    return () => {
      document.removeEventListener('keydown', handleTab);
      previousFocus?.focus();
    };
  }
}, [isOpen]);
```

---

### **4.3 Keyboard Navigation**

**Escape Key:**
```javascript
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

---

## **5. iframe Implementation**

### **5.1 iframe Component**

```jsx
const EmbeddedIframe = ({ embedUrl, itemName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  return (
    <div className="iframe-container" data-testid="iframe-container">
      {loading && (
        <div role="status" aria-live="polite" data-testid="iframe-loading">
          Loading embedded content...
        </div>
      )}
      
      {error && (
        <div role="alert" data-testid="iframe-error">
          Embedded content failed to load
        </div>
      )}
      
      <iframe
        src={embedUrl}
        title={`Embedded content for ${itemName}`}
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        data-testid="embedded-iframe"
        style={{ display: error ? 'none' : 'block' }}
      />
    </div>
  );
};
```

---

## **6. Loading States**

### **6.1 Initial Load**

- Spinner in center of modal
- Message: "Loading item details..."
- Semantic: `aria-busy="true"`, `aria-live="polite"`, `data-testid="loading-state"`

### **6.2 iframe Load**

- Loading indicator for iframe
- Semantic: `aria-busy="true"`, `data-testid="iframe-loading"`

---

## **7. Error States**

### **7.1 Error Display**

- Error message in modal content area
- Retry button for recoverable errors
- Close modal button always available
- Semantic: `role="alert"`, `aria-live="assertive"`, `data-testid="error-state"`

---

## **8. Implementation Checklist**

### **Frontend Setup:**
- [ ] Setup React modal component
- [ ] Create ItemDetailsModal component
- [ ] Create EmbeddedIframe component
- [ ] Create useItemDetails hook
- [ ] Create item service (API calls)

### **Features:**
- [ ] Implement modal open/close
- [ ] Implement async loading
- [ ] Implement loading states
- [ ] Implement error states
- [ ] Implement iframe display
- [ ] Implement focus management
- [ ] Implement keyboard navigation (Escape)
- [ ] Implement focus trap
- [ ] Add semantic HTML attributes
- [ ] Add data-testid attributes for automation

---

**Document Version:** 1.0  
**Status:** ✅ Complete  
**Next:** Proceed to Step B5 (Code Implementation) or continue with Flow 5

