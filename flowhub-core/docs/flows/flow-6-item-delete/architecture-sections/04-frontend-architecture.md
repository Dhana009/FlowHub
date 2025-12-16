# **Frontend Architecture - Flow 6: Item Delete**

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
│   │   │   ├── ItemList.jsx         # Item list with delete button
│   │   │   └── DeleteConfirmModal.jsx # Confirmation modal
│   │   └── common/
│   │       ├── Modal.jsx            # Reusable modal wrapper
│   │       ├── LoadingSpinner.jsx   # Loading indicator
│   │       └── ErrorMessage.jsx     # Error display
│   ├── hooks/
│   │   └── useItemDelete.js         # Item delete hook
│   ├── services/
│   │   ├── api.js                   # API client (axios wrapper)
│   │   └── itemService.js           # Item API calls
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

### **2.1 Delete Confirmation Modal**

**DeleteConfirmModal.jsx - Required Elements:**

- **Modal Overlay:**
  - Dark background (semi-transparent)
  - Covers entire screen
  - Clickable to close (optional)
  - Semantic: `role="dialog"`, `aria-modal="true"`, `data-testid="delete-confirm-modal"`

- **Modal Container:**
  - Centered on screen
  - Responsive width (max-width: 400px)
  - Semantic: `data-testid="modal-container"`

- **Modal Content:**
  - Title: "Confirm Delete" or "Delete Item"
  - Message: "Are you sure you want to delete '{item name}'? This action cannot be undone."
  - Buttons:
    - Cancel: Close modal, no action
    - Delete: Confirm deletion, proceed with API call
  - Semantic: `data-testid="modal-title"`, `data-testid="delete-confirm-message"`, `data-testid="cancel-button"`, `data-testid="confirm-delete-button"`

---

### **2.2 Delete Button**

**Required Properties:**
- Location: In item row (next to Edit button)
- Label: "Delete" or icon (trash icon)
- Styling: Destructive/red color
- Semantic: `role="button"`, `aria-label="Delete item"`, `data-testid="delete-item-button-{id}"`

---

## **3. State Management**

### **3.1 Item Delete Hook** (`hooks/useItemDelete.js`)

**Purpose:** Manages item deletion operations.

**State Variables:**
```javascript
const [isDeleting, setIsDeleting] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(null);
```

**Required Functions:**
- `deleteItem`: Delete item via API
- `resetState`: Clear error/success state

**Implementation:**
```javascript
function useItemDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const deleteItem = async (itemId) => {
    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await itemService.deleteItem(itemId);
      setSuccess(response.message);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(false);
    }
  };
  
  const resetState = () => {
    setError(null);
    setSuccess(null);
  };
  
  return { deleteItem, isDeleting, error, success, resetState };
}
```

---

## **4. Modal Implementation**

### **4.1 Delete Confirmation Modal Component**

```jsx
const DeleteConfirmModal = ({ 
  isOpen, 
  itemName, 
  itemId, 
  onConfirm, 
  onCancel 
}) => {
  const { deleteItem, isDeleting, error } = useItemDelete();
  
  const handleConfirm = async () => {
    const result = await deleteItem(itemId);
    if (result.success) {
      onConfirm(); // Close modal and refresh list
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="delete-confirm-modal"
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
            Confirm Delete
          </h2>
        </header>
        
        <main className="modal-content" role="main">
          <p data-testid="delete-confirm-message">
            Are you sure you want to delete "{itemName}"? This action cannot be undone.
          </p>
          
          {error && (
            <div role="alert" data-testid="delete-error">
              <ErrorMessage error={error} />
            </div>
          )}
        </main>
        
        <footer className="modal-footer">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            data-testid="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="btn-delete"
            data-testid="confirm-delete-button"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </footer>
      </div>
    </div>
  );
};
```

---

### **4.2 Focus Management**

**On Open:**
- Move focus to modal (Cancel button)
- Trap focus within modal

**On Close:**
- Return focus to trigger element (Delete button)
- Remove focus trap

**Implementation:**
```javascript
useEffect(() => {
  if (isOpen) {
    // Save current focus
    const previousFocus = document.activeElement;
    
    // Move focus to modal
    const cancelButton = modalRef.current?.querySelector('[data-testid="cancel-button"]');
    cancelButton?.focus();
    
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
      onCancel();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onCancel]);
```

---

## **5. List Refresh After Delete**

### **5.1 Refresh Behavior**

**After Successful Delete:**
- Close confirmation modal
- Refresh item list (fetch updated list from API)
- Deleted item no longer appears (filtered by status)
- Show success toast/notification

**Implementation:**
```javascript
const handleDeleteSuccess = async () => {
  // Close modal
  setIsDeleteModalOpen(false);
  
  // Refresh list
  await fetchItems();
  
  // Show success message
  showToast("Item deleted successfully", "success");
};
```

---

## **6. Error Handling**

### **6.1 Error States**

**400 Bad Request:**
- Error message: "Invalid item ID"
- Close modal, show error toast
- Semantic: `data-testid="invalid-id-error"`

**404 Not Found:**
- Error message: "Item not found"
- Close modal, show error toast
- Refresh list (item may have been deleted by another user)
- Semantic: `data-testid="not-found-error"`

**409 Conflict (Already Deleted):**
- Error message: "Item is already deleted"
- Close modal, show error toast
- Refresh list (item already removed)
- Semantic: `data-testid="already-deleted-error"`

**500 Server Error:**
- Error message: "Something went wrong. Please try again."
- Keep modal open, show error message
- Show retry button
- Semantic: `data-testid="server-error"`

---

## **7. Implementation Checklist**

### **Frontend Setup:**
- [ ] Setup React confirmation modal component
- [ ] Create DeleteConfirmModal component
- [ ] Create useItemDelete hook
- [ ] Implement delete item API call
- [ ] Implement list refresh after delete
- [ ] Implement loading states
- [ ] Implement error states
- [ ] Implement focus management
- [ ] Implement keyboard navigation (Escape)
- [ ] Add semantic HTML attributes
- [ ] Add data-testid attributes for automation

---

**Document Version:** 1.0  
**Status:** ✅ Complete  
**Next:** Proceed to Step B5 (Code Implementation) - All 6 flows documented!

