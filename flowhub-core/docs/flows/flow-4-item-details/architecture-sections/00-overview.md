# **Architecture Overview - Flow 4: Item Details**

**Version:** 1.0  
**Date:** December 17, 2024  
**Technology Stack:** React (Frontend), FastAPI (Backend), MongoDB (Database)

---

## **1. Document Structure**

This architecture is split into focused sections for clarity:

1. **`01-database-schema.md`** - MongoDB query patterns, indexes
2. **`02-api-contract.md`** - API endpoints, request/response formats
3. **`03-backend-architecture.md`** - Backend structure, services
4. **`04-frontend-architecture.md`** - Frontend structure, components, modal implementation

---

## **2. System Overview**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   React     │───▶│   FastAPI   │───▶│   Item      │───▶│  MongoDB    │
│  Frontend   │    │    API      │    │  Service    │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                    │                   │
      │                    │                   │
      ▼                    ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Modal    │    │   Error     │    │   Index     │
│   Component│    │   Handler   │    │   (_id)     │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Request Flow:**
1. User clicks "View" button on item row
2. Frontend opens modal, shows loading state
3. Frontend calls FastAPI endpoint: `GET /api/items/{id}`
4. FastAPI routes to Item Controller
5. Controller calls Item Service (get by ID)
6. Service queries MongoDB by _id
7. Response flows back: DB → Service → Controller → API → Frontend
8. Frontend displays item details in modal
9. If embed_url exists, load iframe

---

## **3. Key Design Decisions**

### **3.1 Modal Pattern**
- **Why:** Keeps user on list page, better UX
- **Implementation:** React modal component with overlay
- **Benefit:** No page navigation, maintains context

### **3.2 Async Loading**
- **Why:** Better UX, shows loading state immediately
- **Implementation:** API call triggered on modal open
- **Benefit:** Perceived performance improvement

### **3.3 iframe for Embedded Content**
- **Why:** Supports rich embedded content
- **Security:** sandbox attribute for safety
- **Benefit:** Flexible content display

### **3.4 Focus Management**
- **Why:** Accessibility and keyboard navigation
- **Implementation:** Focus trap, return focus on close
- **Benefit:** WCAG compliance, better UX

---

## **4. Technology Choices**

### **Backend:**
- **Framework:** FastAPI (Python)
- **Database:** MongoDB with Motor (async driver)
- **Query:** Simple findOne by _id
- **Validation:** Pydantic models

### **Frontend:**
- **Framework:** React 18
- **HTTP Client:** Axios
- **Modal:** Custom modal component or react-modal library
- **State Management:** React hooks (useState, useEffect)
- **Styling:** Tailwind CSS

---

## **5. Security Considerations**

1. **Authentication:** JWT token required
2. **iframe Security:** sandbox attribute, minimal permissions
3. **Input Validation:** Validate item ID format
4. **XSS Prevention:** Sanitize embed_url before rendering

---

## **6. Implementation Checklist**

### **Backend:**
- [ ] Setup FastAPI endpoint for GET /api/items/{id}
- [ ] Create item service (get by ID logic)
- [ ] Create item controller (endpoint handler)
- [ ] Add error handling (404, 422, 500)
- [ ] Add authentication middleware

### **Frontend:**
- [ ] Setup React modal component
- [ ] Create ItemDetailsModal component
- [ ] Implement async loading hook
- [ ] Implement iframe component
- [ ] Implement loading states
- [ ] Implement error states
- [ ] Implement focus management
- [ ] Add keyboard navigation
- [ ] Add semantic HTML attributes
- [ ] Add data-testid attributes

---

## **7. Next Steps**

1. Review all architecture sections
2. Start with database query (01-database-schema.md)
3. Implement backend following 03-backend-architecture.md
4. Implement frontend following 04-frontend-architecture.md
5. Test each feature manually
6. Proceed to Step B5 (Code Implementation)

---

**See individual sections for detailed specifications.**

