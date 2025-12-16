# **Architecture Overview - Flow 5: Item Edit**

**Version:** 1.0  
**Date:** December 17, 2024  
**Technology Stack:** React (Frontend), FastAPI (Backend), MongoDB (Database)

---

## **1. Document Structure**

This architecture is split into focused sections for clarity:

1. **`01-database-schema.md`** - MongoDB update operations, version field, indexes
2. **`02-api-contract.md`** - API endpoints (GET for pre-population, PUT for update), request/response formats
3. **`03-backend-architecture.md`** - Backend structure, services, version conflict handling
4. **`04-frontend-architecture.md`** - Frontend structure, components, form pre-population

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
│   Form      │    │   Version   │    │   Update    │
│   Pre-pop   │    │   Check     │    │   Operation │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Request Flow:**
1. User clicks "Edit" button on item
2. Frontend calls `GET /api/items/{id}` to fetch existing data
3. Frontend pre-populates form with item data
4. User modifies fields
5. User submits form
6. Frontend calls `PUT /api/items/{id}` with updated data + version
7. Backend validates data and checks version
8. Backend updates MongoDB document (increments version)
9. Response flows back: DB → Service → Controller → API → Frontend
10. Frontend shows success message and redirects

---

## **3. Key Design Decisions**

### **3.1 Optimistic Locking**
- **Why:** Prevent concurrent edit conflicts
- **Implementation:** Version field increments on each update
- **Benefit:** Prevents data loss from simultaneous edits

### **3.2 Form Pre-population**
- **Why:** Better UX, saves user time
- **Implementation:** Fetch item data on form load
- **Benefit:** Immediate form availability with existing values

### **3.3 State-Based Validation**
- **Why:** Enforce business rules (cannot edit deleted items)
- **Implementation:** Check item status before allowing update
- **Benefit:** Data integrity and business rule enforcement

### **3.4 Same Validation as Creation**
- **Why:** Consistency and maintainability
- **Implementation:** Reuse validation logic from Flow 2
- **Benefit:** Single source of truth for validation rules

---

## **4. Technology Choices**

### **Backend:**
- **Framework:** FastAPI (Python)
- **Database:** MongoDB with Motor (async driver)
- **Update:** findOneAndUpdate with version check
- **Validation:** Pydantic models (same as creation)

### **Frontend:**
- **Framework:** React 18
- **HTTP Client:** Axios
- **Form Management:** React hooks (useState, useEffect)
- **Validation:** Same validation logic as creation form
- **Styling:** Tailwind CSS

---

## **5. Security Considerations**

1. **Authentication:** JWT token required
2. **Authorization:** Users can only edit their own items (or with permission)
3. **Input Validation:** Same validation as creation
4. **Version Conflict:** Prevents concurrent edit conflicts

---

## **6. Implementation Checklist**

### **Backend:**
- [ ] Setup FastAPI endpoint for GET /api/items/{id} (reuse from Flow 4)
- [ ] Setup FastAPI endpoint for PUT /api/items/{id}
- [ ] Create item service (update logic with version check)
- [ ] Create item controller (endpoint handler)
- [ ] Add state-based validation (deleted items)
- [ ] Add version conflict detection
- [ ] Add error handling (400, 401, 404, 409, 422, 500)
- [ ] Add authentication middleware

### **Frontend:**
- [ ] Setup React edit form component
- [ ] Create ItemEditForm component
- [ ] Implement form pre-population hook
- [ ] Implement update item hook
- [ ] Implement validation (reuse from creation)
- [ ] Implement conditional fields (reuse from creation)
- [ ] Implement loading states
- [ ] Implement error states (including version conflict)
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

