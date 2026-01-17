# **Frontend Architecture - Flow 5: Item Edit**

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
│   │   │   ├── ItemEditForm.jsx     # Main edit form component
│   │   │   └── ItemFormFields.jsx   # Reusable form fields (from creation)
│   │   └── common/
│   │       ├── LoadingSpinner.jsx   # Loading indicator
│   │       └── ErrorMessage.jsx     # Error display
│   ├── hooks/
│   │   ├── useItemEdit.js           # Item edit hook (fetch + update)
│   │   └── useFormValidation.js    # Form validation (reuse from creation)
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

### **2.1 Item Edit Form**

**ItemEditForm.jsx - Required Elements:**

- **Form Container:**
  - Form element with submit handler
  - Loading state while fetching item data
  - Error state if fetch fails
  - Semantic: `role="form"`, `data-testid="item-edit-form"`

- **Form Fields:**
  - Same fields as creation form (reuse ItemFormFields component)
  - All fields pre-populated with existing item data
  - Conditional fields show/hide based on item type
  - Semantic: Same as creation form

- **Hidden Version Field:**
  - Hidden input: Store current item version
  - Include in update request
  - Semantic: `data-testid="item-version"` (hidden)

- **Update Button:**
  - Submit button
  - Disabled: While submitting or if form invalid
  - Loading state: "Updating item..."
  - Semantic: `role="button"`, `data-testid="update-item-button"`

- **Cancel Button:**
  - Navigate back or close modal
  - Semantic: `role="button"`, `data-testid="cancel-button"`

---

### **2.2 Form Pre-population**

**Required Behavior:**
- Fetch item data on form load: `GET /api/items/{id}`
- Pre-populate all form fields with existing data
- Store version field (hidden)
- Handle loading and error states

---

## **3. State Management**

### **3.1 Item Edit Hook** (`hooks/useItemEdit.js`)

**Purpose:** Manages item data fetching and update operations.

**State Variables:**
```javascript
const [item, setItem] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Required Functions:**
- `loadItem`: Fetch item from API (for pre-population)
- `updateItem`: Update item via API
- `resetState`: Clear item state

**Implementation:**
```javascript
function useItemEdit(itemId) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load item data on mount
  useEffect(() => {
    if (!itemId) return;
    
    const loadItem = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await itemService.getItemById(itemId);
        setItem(data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    
    loadItem();
  }, [itemId]);
  
  // Update item
  const updateItem = async (updateData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Include version in update data
      const data = await itemService.updateItem(itemId, {
        ...updateData,
        version: item.version  // Include current version
      });
      
      setItem(data);
      return data;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { item, loading, error, updateItem, isSubmitting };
}
```

---

### **3.2 Form Validation Hook** (`hooks/useFormValidation.js`)

**Purpose:** Manages form validation (reuse from creation).

**Note:** Same validation logic as Flow 2 (Item Creation). Reuse existing hook.

---

## **4. Form Implementation**

### **4.1 Item Edit Form Component**

```jsx
const ItemEditForm = ({ itemId, onSuccess, onCancel }) => {
  const { item, loading, error, updateItem, isSubmitting } = useItemEdit(itemId);
  const { formData, errors, validateField, isValid } = useFormValidation(item);
  
  // Pre-populate form when item loads
  useEffect(() => {
    if (item) {
      // Initialize form data with item data
      setFormData({
        name: item.name,
        description: item.description,
        item_type: item.item_type,
        category_id: item.category_id,
        subcategory_id: item.subcategory_id,
        status: item.status,
        tags: item.tags || [],
        price: item.price,
        // Conditional fields based on item_type
        ...(item.item_type === "PHYSICAL" && {
          weight: item.weight,
          dimensions: item.dimensions
        }),
        ...(item.item_type === "DIGITAL" && {
          download_url: item.download_url,
          file_size: item.file_size
        }),
        ...(item.item_type === "SERVICE" && {
          duration_hours: item.duration_hours
        })
      });
    }
  }, [item]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValid) return;
    
    try {
      const updatedItem = await updateItem(formData);
      onSuccess(updatedItem);
    } catch (err) {
      // Error handling in hook
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading item data..." />;
  }
  
  if (error && !item) {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }
  
  return (
    <form onSubmit={handleSubmit} role="form" data-testid="item-edit-form">
      {/* Hidden version field */}
      <input type="hidden" name="version" value={item?.version} data-testid="item-version" />
      
      {/* Form fields (reuse from creation) */}
      <ItemFormFields
        formData={formData}
        errors={errors}
        onChange={handleFieldChange}
        onValidate={validateField}
      />
      
      {/* Error display */}
      {error && (
        <div role="alert" data-testid="update-error">
          <ErrorMessage error={error} />
          {error.includes("Version mismatch") && (
            <button onClick={handleRefresh} data-testid="refresh-button">
              Refresh and Reload
            </button>
          )}
        </div>
      )}
      
      {/* Form actions */}
      <div className="form-actions">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          data-testid="update-item-button"
        >
          {isSubmitting ? "Updating..." : "Update Item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          data-testid="cancel-button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
```

---

### **4.2 Version Conflict Handling**

**Required Behavior:**
- Detect version conflict error (409 VERSION_CONFLICT)
- Show error message: "Item was modified by another user. Please refresh and try again."
- Provide "Refresh and Reload" button
- Reload item data and re-populate form

**Implementation:**
```javascript
const handleRefresh = async () => {
  // Reload item data
  const refreshedItem = await itemService.getItemById(itemId);
  setItem(refreshedItem);
  
  // Re-populate form
  setFormData({
    ...refreshedItem,
    version: refreshedItem.version
  });
  
  setError(null);
};
```

---

## **5. Error Handling**

### **5.1 Error States**

**400 Bad Request:**
- Display field-level validation errors
- Highlight invalid fields
- Semantic: `data-testid="validation-errors"`

**409 Conflict (Item Deleted):**
- Error message: "Cannot edit deleted item"
- Disable form fields
- Hide update button
- Semantic: `data-testid="item-deleted-error"`

**409 Conflict (Version Mismatch):**
- Error message: "Item was modified by another user. Please refresh and try again."
- Provide refresh button
- Semantic: `data-testid="version-conflict-error"`

**404 Not Found:**
- Error message: "Item not found"
- Option to navigate back
- Semantic: `data-testid="not-found-error"`

---

## **6. Implementation Checklist**

### **Frontend Setup:**
- [ ] Setup React edit form component
- [ ] Create ItemEditForm component
- [ ] Create useItemEdit hook (fetch + update)
- [ ] Reuse form validation hook from creation
- [ ] Reuse form fields component from creation
- [ ] Implement form pre-population
- [ ] Implement conditional fields (reuse from creation)
- [ ] Implement version conflict handling
- [ ] Implement state-based error handling (deleted items)
- [ ] Implement loading states
- [ ] Implement error states
- [ ] Add semantic HTML attributes
- [ ] Add data-testid attributes for automation

---

**Document Version:** 1.0  
**Status:** ✅ Complete  
**Next:** Proceed to Step B5 (Code Implementation) or continue with Flow 6

