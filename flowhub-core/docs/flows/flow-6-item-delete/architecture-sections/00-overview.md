# **Architecture Overview - Flow 6: Item Delete**

**Version:** 1.0  
**Date:** December 17, 2024  
**Technology Stack:** React (Frontend), FastAPI (Backend), MongoDB (Database)

---

## **1. Document Structure**

This architecture is split into focused sections for clarity:

1. **`01-database-schema.md`** - MongoDB update operations, status field, soft delete
2. **`02-api-contract.md`** - API endpoints (DELETE), request/response formats
3. **`03-backend-architecture.md`** - Backend structure, services, soft delete logic
4. **`04-frontend-architecture.md`** - Frontend structure, components, confirmation modal

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
│ Confirmation│    │   Status     │    │   Update     │
│   Modal     │    │   Check      │    │   Operation  │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Request Flow:**
1. User clicks "Delete" button on item row
2. Frontend opens confirmation modal
3. User confirms deletion
4. Frontend calls `DELETE /api/items/{id}`
5. Backend validates item exists and is not already deleted
6. Backend updates MongoDB document (status = "deleted")
7. Response flows back: DB → Service → Controller → API → Frontend
8. Frontend closes modal and refreshes list

---

## **3. Key Design Decisions**

### **3.1 Soft Delete**
- **Why:** Preserve data for audit/recovery
- **Implementation:** Change status to "deleted" instead of physical deletion
- **Benefit:** Data safety and audit trail

### **3.2 Confirmation Modal**
- **Why:** Prevent accidental deletions
- **Implementation:** Client-side confirmation before API call
- **Benefit:** Better UX and reduced server load

### **3.3 Status Validation**
- **Why:** Prevent duplicate delete operations
- **Implementation:** Check status before allowing deletion
- **Benefit:** Data integrity and clear error messages

---

## **4. Technology Choices**

### **Backend:**
- **Framework:** FastAPI (Python)
- **Database:** MongoDB with Motor (async driver)
- **Update:** updateOne with status change
- **Validation:** Check item existence and status

### **Frontend:**
- **Framework:** React 18
- **HTTP Client:** Axios
- **Modal:** Custom modal component or react-modal library
- **State Management:** React hooks (useState, useEffect)
- **Styling:** Tailwind CSS

---

## **5. Security Considerations**

1. **Authentication:** JWT token required
2. **Authorization:** Users can only delete their own items (or with permission)
3. **Input Validation:** Validate item ID format
4. **Status Check:** Prevent deleting already deleted items

---

## **6. Implementation Checklist**

### **Backend:**
- [ ] Setup FastAPI endpoint for DELETE /api/items/{id}
- [ ] Create item service (soft delete logic)
- [ ] Create item controller (endpoint handler)
- [ ] Add status validation (cannot delete already deleted items)
- [ ] Add error handling (400, 401, 404, 409, 500)
- [ ] Add authentication middleware

### **Frontend:**
- [ ] Setup React confirmation modal component
- [ ] Create DeleteConfirmModal component
- [ ] Implement delete item hook
- [ ] Implement list refresh after delete
- [ ] Implement loading states
- [ ] Implement error states
- [ ] Add semantic HTML attributes
- [ ] Add data-testid attributes

---

## **7. Next Steps**

1. Review all architecture sections
2. Start with database update operations (01-database-schema.md)
3. Implement backend following 03-backend-architecture.md
4. Implement frontend following 04-frontend-architecture.md
5. Test each feature manually
6. Proceed to Step B5 (Code Implementation)

---

**See individual sections for detailed specifications.**

