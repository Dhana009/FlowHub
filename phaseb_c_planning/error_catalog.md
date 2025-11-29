# **FlowHub — Error Catalog & Minimum Requirements**

**Purpose:** Define all error types and minimum requirements for Frontend and Backend. AI must implement these automatically.

---

## **BACKEND ERRORS (7 Types)**

| Error Type | When Occurs | HTTP Code | Example |
|------------|-------------|-----------|---------|
| **Validation** | Missing/invalid input | 400, 422 | "Email is required", "Invalid email format" |
| **Business Logic** | Rule violation | 409 | "Item name already exists", "Cannot edit deleted item" |
| **Database** | Connection/query/constraint | 409, 500 | "Database connection failed", "Duplicate entry" |
| **Auth/Authorization** | Missing/invalid token, no permission | 401, 403 | "Unauthorized", "Forbidden" |
| **External Service** | Third-party API failure | 502, 503, 504 | "External service unavailable" |
| **System** | Server crash, memory, config | 500 | "Internal server error" |
| **Data** | Missing/corrupted data | 404, 500 | "Item not found", "Data format error" |

**Minimum Requirements:**
- ✅ Validate all inputs (required, type, format)
- ✅ Handle business logic errors explicitly
- ✅ Check null/undefined before accessing
- ✅ Return clear error messages (not generic 500)
- ✅ Handle database errors gracefully

---

## **FRONTEND ERRORS (18 Types)**

### **Technical Errors (13 Types)**

| Component | Error Type | When Occurs | Example |
|-----------|------------|-------------|---------|
| **Forms** | Validation | Empty/invalid fields | "Email is required", "Invalid format" |
| **Forms** | Conditional Fields | Fields appear/disappear | Validation not triggered, data not cleared |
| **Forms** | File Upload | Type/size/network | "File type not supported", "Upload failed" |
| **API** | Network/HTTP | API calls fail | 400, 401, 404, 500, network error |
| **Rendering** | Null/Undefined | Data not loaded | `user.name` when `user` is undefined |
| **State** | Async/Race | Component renders before data | State inconsistency |
| **Dropdown** | Single/Multi/Cascading | Selection, loading | Options not loading, selection not working |
| **Dropdown** | Autosuggestion | Search while typing | Suggestions not showing, wrong results |
| **Radio** | Selection | Required group, conditional | No option selected, fields not showing |
| **Checkbox** | Selection | Required group, state | No checkbox selected, state not persisting |
| **Table** | Rendering/Sorting | Data load, interactions | Empty state, sorting not working |
| **Table** | Pagination | Next/prev, page numbers | Pagination not working, wrong total pages |
| **Search/Filter** | Debounce/Combined | Typing, applying filters | Search not triggering, filters not working together |
| **Modal** | Open/Close/Content | Interactions, async load | Modal not opening, content not loading |
| **iframe** | Loading/CORS | Content load, interactions | iframe not loading, CORS error |
| **File Upload** | Selection/Progress | File picker, upload process | File not selected, progress not showing |

### **Design/UX Errors (5 Types)**

| Category | Error Type | When Occurs | Example |
|----------|-----------|-------------|---------|
| **Layout** | Responsive/Alignment | Different screen sizes | Buttons overlapping, text cut off |
| **Visual Feedback** | Loading/Success/Error | API calls, actions | Loading not showing, error not displayed |
| **Accessibility** | Keyboard/Screen Reader | Navigation, form interaction | Tab order broken, labels missing |
| **Interaction** | Click/Hover/Form | User interactions | Button not clickable, form not submitting |
| **State Management** | Component/Form State | State updates, persistence | State not updating, form data lost |

**Minimum Requirements:**
- ✅ Handle all API errors (network, all HTTP status codes)
- ✅ Check null/undefined before rendering
- ✅ Show loading states (forms, tables, modals)
- ✅ Validate all forms (client-side + sync with server)
- ✅ Handle async state properly
- ✅ Handle all component errors (dropdown, radio, checkbox, table, modal, iframe, file upload)
- ✅ Handle layout errors (responsive, alignment)
- ✅ Handle visual feedback (loading, success, error states)
- ✅ Handle accessibility (keyboard, screen reader, focus)
- ✅ Handle interaction errors (click, hover, form)
- ✅ Handle state management (component, form state)

---

## **FLOWHUB COMPONENTS (By Flow)**

### **Flow 1: Auth (Login)**
- Email input (validation: required, format)
- Password input (validation: required, on submit only)
- Sign In button (API call, loading state, error handling)
- Remember Me checkbox (state persistence)
- Forgot Password link (navigation)

**Errors to Handle:**
- Form validation errors
- API errors (401 invalid credentials, network error)
- State errors (token storage, redirect)

### **Flow 2: Item Creation**
- Name input (validation: required, 3-100 chars)
- Description textarea (validation: optional, max length)
- File upload (validation: type, size, progress)
- Conditional fields (appear/disappear based on selection)
- Submit button (API call, loading, error handling)

**Errors to Handle:**
- Form validation errors
- Conditional field errors
- File upload errors (type, size, network)
- API errors (400, 409, 422)

### **Flow 3: Item List**
- Table (rendering, sorting, pagination)
- Search input (debounce, autosuggestion)
- Filter dropdowns (status, category, multi-select)
- Pagination controls (next/prev, page numbers)
- Dynamic table updates

**Errors to Handle:**
- Table errors (empty state, sorting, pagination)
- Search errors (debounce, results)
- Filter errors (selection, combined filters)
- API errors (400, 500)
- State errors (data not loading)

### **Flow 4: Item Details**
- Modal (open/close, content)
- iframe (loading, CORS, interactions)
- Async content loading
- Loading states
- Error states

**Errors to Handle:**
- Modal errors (opening, closing, content)
- iframe errors (loading, CORS)
- Async loading errors
- API errors (404, 500)

### **Flow 5: Item Edit**
- Pre-populated form (name, description)
- Dropdowns (cascading: category → subcategory)
- Radio buttons (status selection, conditional fields)
- Checkboxes (tags, categories)
- Submit button (API call, loading, error handling)

**Errors to Handle:**
- Form validation errors
- Dropdown errors (cascading, selection)
- Radio button errors (selection, conditional)
- Checkbox errors (selection, state)
- API errors (404, 409, 422)

### **Flow 6: Item Delete**
- Confirmation modal (open/close)
- Delete button (API call, loading, error handling)
- Success/error feedback

**Errors to Handle:**
- Modal errors (opening, closing)
- API errors (404, 409, 403)
- State errors (item not removed from list)

---

## **ERROR HANDLING PATTERNS**

### **Backend Pattern**
```
1. Validate input → Return 400/422 if invalid
2. Check business rules → Return 409 if violated
3. Check auth → Return 401/403 if unauthorized
4. Process request → Handle database errors (409, 500)
5. Return success → 200/201 with data
```

### **Frontend Pattern**
```
1. Validate form (client-side) → Show errors
2. Call API → Show loading state
3. Handle response:
   - Success → Show success message, update state, redirect
   - Error → Show error message, keep form data
4. Check null/undefined → Before rendering
5. Handle async state → Wait for data before rendering
```

---

## **AI INSTRUCTION RULES**

**When building any component:**
1. Always implement minimum requirements (error handling, validation, loading states)
2. Always check for null/undefined before rendering
3. Always handle all error types for that component
4. Always show loading/success/error states
5. Always validate inputs (client-side + sync with server)

**When building any API endpoint:**
1. Always validate inputs (required, type, format)
2. Always handle business logic errors explicitly
3. Always check null/undefined before accessing
4. Always return clear error messages
5. Always handle database errors gracefully

---

**Status:** ✅ Complete Error Catalog  
**Usage:** Reference this when building any component/endpoint

