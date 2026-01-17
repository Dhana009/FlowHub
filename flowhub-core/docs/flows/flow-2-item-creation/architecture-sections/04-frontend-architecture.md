# **Frontend Architecture - Flow 2: Item Creation**

**Version:** 1.0  
**Date:** December 17, 2024  
**Technology:** React + Tailwind CSS

---

## **1. Folder Structure**

```
frontend/
├── src/
│   ├── pages/
│   │   └── CreateItemPage.jsx        # Create item page
│   ├── components/
│   │   ├── items/
│   │   │   ├── ItemCreationForm.jsx  # Main form component
│   │   │   ├── ConditionalFields.jsx  # Conditional fields component
│   │   │   └── FileUpload.jsx        # File upload component
│   │   └── common/
│   │       ├── Input.jsx             # Reusable input component
│   │       ├── Textarea.jsx           # Reusable textarea component
│   │       ├── Select.jsx            # Reusable select component
│   │       ├── Button.jsx             # Reusable button component
│   │       └── ErrorMessage.jsx      # Error message component
│   ├── services/
│   │   ├── api.js                    # API client (axios wrapper)
│   │   └── itemService.js            # Item API calls
│   ├── hooks/
│   │   ├── useItemForm.js            # Form handling hook
│   │   └── useFileUpload.js          # File upload hook
│   ├── utils/
│   │   ├── validation.js              # Client-side validation
│   │   └── formatters.js             # Data formatting utilities
│   ├── routes/
│   │   └── AppRoutes.jsx             # Route definitions
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

---

## **2. Component Structure**

### **2.1 Pages**

**CreateItemPage.jsx:**
- **Purpose:** Container page for item creation form
- **Structure:** Centered layout, renders ItemCreationForm component
- **No business logic** - just layout
- **Route:** `/items/create`
- **Protected:** Yes (requires authentication)

---

### **2.2 Item Components**

**ItemCreationForm.jsx - Required Elements:**

- **Form:** `<form role="form" aria-label="Create item form" encType="multipart/form-data">`
- **Name Input:**
  - `data-testid="item-name"`
  - `aria-label="Item Name"`
  - Validation on blur
  - Real-time error display
- **Description Textarea:**
  - `data-testid="item-description"`
  - `aria-label="Description"`
  - Validation on blur
- **Item Type Select:**
  - `data-testid="item-type"`
  - `aria-label="Item Type"`
  - Options: Physical, Digital, Service
  - On change: Show/hide conditional fields
- **Price Input:**
  - `data-testid="item-price"`
  - `aria-label="Price"`
  - Type: number, step: 0.01
  - Validation on blur
- **Category Input:**
  - `data-testid="item-category"`
  - `aria-label="Category"`
  - Validation on blur
- **Tags Input:**
  - `data-testid="item-tags"`
  - `aria-label="Tags"`
  - Comma-separated or multi-select
  - Optional field
- **ConditionalFields Component:**
  - Renders based on item_type selection
  - Physical: Weight, Dimensions
  - Digital: Download URL, File Size
  - Service: Duration Hours
- **FileUpload Component:**
  - `data-testid="item-file-upload"`
  - Optional file selection
  - File validation feedback
- **Submit Button:**
  - `data-testid="create-item-submit"`
  - `aria-label="Create Item"`
  - Loading state (spinner when submitting)
  - Disabled during API call
- **Cancel Button:**
  - `data-testid="create-item-cancel"`
  - `aria-label="Cancel"`
  - Navigate back on click
- **Error Message:**
  - `data-testid="create-item-error"`
  - `role="alert"` with `aria-live="assertive"`
  - Display below form on error

**ConditionalFields.jsx - Required Props:**
- `itemType`: Current item type selection
- `formData`: Current form data
- `onChange`: Change handler
- `errors`: Validation errors

**Required Behavior:**
- Show/hide fields based on `itemType`
- Clear conditional field values when type changes
- Validate conditional fields when visible
- Semantic attributes: `data-testid="physical-fields"`, `data-testid="digital-fields"`, `data-testid="service-fields"`

**FileUpload.jsx - Required Props:**
- `onFileSelect`: File selection handler
- `selectedFile`: Currently selected file
- `error`: File validation error
- `onRemove`: Remove file handler

**Required Elements:**
- File input: `data-testid="item-file-upload"`
- File display: `data-testid="selected-file"`
- Remove button: `data-testid="remove-file"`
- Error display: `data-testid="file-error"`

---

### **2.3 Common Components**

**Input.jsx - Required Props:**
- `type`: input type (text, number, email)
- `label`: label text
- `name`: field name
- `value`: field value
- `onChange`: change handler
- `error`: error message string (optional)
- `data-testid`: test identifier
- `required`: boolean

**Required Attributes:**
- `role="textbox"` or `role="spinbutton"` (for numbers)
- `aria-label={label}`
- `data-testid={data-testid}`
- `aria-invalid={!!error}`
- `aria-describedby` pointing to error element (if error exists)
- `aria-required={required}`

**Textarea.jsx - Required Props:**
- Same as Input.jsx but for textarea element
- `rows`: number of rows (default: 4)

**Select.jsx - Required Props:**
- `label`: label text
- `name`: field name
- `value`: selected value
- `onChange`: change handler
- `options`: array of {value, label} objects
- `error`: error message (optional)
- `data-testid`: test identifier

**Required Attributes:**
- `role="combobox"`
- `aria-label={label}`
- `data-testid={data-testid}`
- `aria-invalid={!!error}`

**Button.jsx - Required Props:**
- `type`: button type (button, submit)
- `loading`: boolean (shows spinner)
- `disabled`: boolean
- `data-testid`: test identifier
- `children`: button text

**Required Attributes:**
- `role="button"`
- `aria-label` with action description
- `data-testid={data-testid}`
- `aria-busy={loading}` when loading
- `disabled` when loading or disabled

**ErrorMessage.jsx - Required Props:**
- `message`: error message string
- `data-testid`: test identifier

**Required Attributes:**
- `role="alert"`
- `aria-live="polite"` or `"assertive"`
- `data-testid={data-testid}`

---

## **3. State Management**

### **3.1 Form State** (`hooks/useItemForm.js`)

**Purpose:** Manages form state and validation.

**State Variables:**
```javascript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  item_type: '',
  price: '',
  category: '',
  tags: [],
  // Conditional fields
  weight: '',
  dimensions: { length: '', width: '', height: '' },
  download_url: '',
  file_size: '',
  duration_hours: ''
});

const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});
```

**Required Functions:**
- `handleChange`: Update form data
- `handleBlur`: Mark field as touched, validate
- `validateField`: Validate single field
- `validateForm`: Validate entire form
- `handleSubmit`: Submit form to API
- `resetForm`: Clear form data

### **3.2 File Upload State** (`hooks/useFileUpload.js`)

**Purpose:** Manages file upload state.

**State Variables:**
```javascript
const [selectedFile, setSelectedFile] = useState(null);
const [fileError, setFileError] = useState('');
const [uploadProgress, setUploadProgress] = useState(0);
```

**Required Functions:**
- `handleFileSelect`: Validate and set selected file
- `handleFileRemove`: Clear selected file
- `validateFile`: Check file type and size

---

## **4. API Integration**

### **4.1 API Client** (`services/api.js`)

**Purpose:** Axios wrapper with interceptors.

**Required Configuration:**
- Base URL: `http://localhost:8000/api`
- Request interceptor: Add JWT token to headers
- Response interceptor: Handle errors globally
- Error handling: Parse error responses

### **4.2 Item Service** (`services/itemService.js`)

**Purpose:** Item API calls.

**Required Functions:**

1. **`createItem(formData, file)`**
   - **Input:** FormData object, optional file
   - **Process:**
     - Create FormData object
     - Append `item_data` as JSON string
     - Append `file` if provided
     - Call `POST /api/items`
     - Handle response/errors
   - **Output:** Created item data or throw error

**Example:**
```javascript
async function createItem(formData, file) {
  const data = new FormData();
  data.append('item_data', JSON.stringify(formData));
  if (file) {
    data.append('file', file);
  }
  
  const response = await api.post('/items', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
}
```

---

## **5. Validation**

### **5.1 Client-Side Validation** (`utils/validation.js`)

**Purpose:** Real-time form validation.

**Required Functions:**

1. **`validateName(name)`**
   - Min: 3 chars, Max: 100 chars
   - Pattern: Alphanumeric + spaces, hyphens, underscores
   - Return: Error message or null

2. **`validateDescription(description)`**
   - Min: 10 chars, Max: 500 chars
   - Return: Error message or null

3. **`validatePrice(price)`**
   - Min: 0.01, Max: 999999.99
   - Must be valid number
   - Return: Error message or null

4. **`validateCategory(category)`**
   - Min: 1 char, Max: 50 chars
   - Return: Error message or null

5. **`validateTags(tags)`**
   - Max: 10 tags
   - Each tag: 1-30 chars
   - No duplicates
   - Return: Error message or null

6. **`validateConditionalFields(itemType, formData)`**
   - Validate based on item_type
   - Physical: weight, dimensions
   - Digital: download_url, file_size
   - Service: duration_hours
   - Return: Error object or null

7. **`validateFile(file)`**
   - Check file type (allowed extensions)
   - Check file size (1 KB - 5 MB)
   - Return: Error message or null

---

## **6. Form Submission Flow**

### **6.1 Submission Process**

1. **User clicks "Create Item" button**
2. **Client-side validation:**
   - Validate all fields
   - Validate conditional fields
   - Validate file (if provided)
   - If errors: Display errors, prevent submission
3. **If valid:**
   - Disable button, show loading
   - Create FormData object
   - Append item_data (JSON string)
   - Append file (if provided)
   - Call API: `POST /api/items`
4. **On Success (201):**
   - Show success message
   - Redirect to Item List page
   - Clear form
5. **On Error:**
   - Parse error response
   - Display appropriate error message
   - Re-enable button
   - Clear loading state

---

## **7. Conditional Fields Logic**

### **7.1 Field Visibility**

**Physical Item (item_type = "PHYSICAL"):**
- Show: Weight, Dimensions (length, width, height)
- Hide: Download URL, File Size, Duration Hours

**Digital Item (item_type = "DIGITAL"):**
- Show: Download URL, File Size
- Hide: Weight, Dimensions, Duration Hours

**Service Item (item_type = "SERVICE"):**
- Show: Duration Hours
- Hide: Weight, Dimensions, Download URL, File Size

### **7.2 Implementation**

```javascript
const renderConditionalFields = () => {
  switch (formData.item_type) {
    case 'PHYSICAL':
      return <PhysicalFields formData={formData} onChange={handleChange} errors={errors} />;
    case 'DIGITAL':
      return <DigitalFields formData={formData} onChange={handleChange} errors={errors} />;
    case 'SERVICE':
      return <ServiceFields formData={formData} onChange={handleChange} errors={errors} />;
    default:
      return null;
  }
};
```

---

## **8. Error Handling**

### **8.1 Error Display**

**Field-Level Errors:**
- Display below each input field
- `role="alert"`, `aria-live="polite"`
- `data-testid="{fieldName}-error"`

**Form-Level Errors:**
- Display at top of form
- `role="alert"`, `aria-live="assertive"`
- `data-testid="create-item-error"`

**Error Messages:**
- **400:** Display message from API
- **401:** "Authentication required. Please log in."
- **409:** "Item with same name and category already exists"
- **413:** "File too large. Max size: 5MB"
- **415:** "File type not supported"
- **422:** Display validation errors from API
- **500:** "Something went wrong. Please try again."
- **Network:** "Connection failed. Please check your internet and try again."

---

## **9. Implementation Checklist**

### **Frontend Setup:**
- [ ] Setup React app with routing
- [ ] Configure API client (axios)
- [ ] Setup authentication context (from Flow 1)

### **Components:**
- [ ] Create common components (Input, Textarea, Select, Button, ErrorMessage)
- [ ] Create ConditionalFields component
- [ ] Create FileUpload component
- [ ] Create ItemCreationForm component
- [ ] Create CreateItemPage component

### **Hooks:**
- [ ] Create useItemForm hook
- [ ] Create useFileUpload hook

### **Services:**
- [ ] Create itemService (API calls)
- [ ] Configure API client with interceptors

### **Utils:**
- [ ] Create validation utilities
- [ ] Create formatters utilities

### **Features:**
- [ ] Implement form state management
- [ ] Implement real-time validation
- [ ] Implement conditional field show/hide
- [ ] Implement file upload with validation
- [ ] Implement form submission
- [ ] Implement error handling
- [ ] Add semantic HTML attributes
- [ ] Add data-testid attributes for automation
- [ ] Implement loading states
- [ ] Implement success/error feedback

---

## **10. Semantic HTML & Accessibility**

### **10.1 Required Attributes**

**Form:**
- `role="form"`
- `aria-label="Create item form"`
- `encType="multipart/form-data"`

**Inputs:**
- `role="textbox"` or `role="spinbutton"`
- `aria-label` with descriptive label
- `aria-invalid={!!error}`
- `aria-describedby` pointing to error element
- `data-testid` for automation

**Buttons:**
- `role="button"`
- `aria-label` with action description
- `aria-busy={loading}` when loading
- `data-testid` for automation

**Error Messages:**
- `role="alert"`
- `aria-live="polite"` (field errors) or `"assertive"` (form errors)
- `data-testid` for automation

---

**Document Version:** 1.0  
**Status:** ✅ Complete  
**Next:** Proceed to Step B5 (Code Implementation)

