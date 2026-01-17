# **Architecture Overview - Flow 2: Item Creation**

**Version:** 1.0  
**Date:** December 17, 2024  
**Technology Stack:** React (Frontend), FastAPI (Backend), MongoDB (Database)

---

## **1. Document Structure**

This architecture is split into focused sections for clarity:

1. **`01-database-schema.md`** - MongoDB collections, schemas, indexes
2. **`02-api-contract.md`** - API endpoints, request/response formats
3. **`03-backend-architecture.md`** - Backend structure, services, middleware
4. **`04-frontend-architecture.md`** - Frontend structure, components, state management

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
│   Form      │    │   File      │    │   File     │
│ Validation  │    │   Storage   │    │   System   │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Request Flow:**
1. User interacts with React form
2. Frontend validates fields (client-side)
3. Frontend calls FastAPI endpoint with multipart/form-data
4. FastAPI routes to Item Controller
5. Controller calls Item Service (business logic)
6. Service validates schema and business rules
7. Service handles file upload (if provided)
8. Service uses Models to interact with MongoDB
9. Response flows back: DB → Service → Controller → API → Frontend

---

## **3. Key Design Decisions**

### **3.1 Database: MongoDB**
- **Why:** Flexible schema, supports conditional fields, good for small apps
- **Collection:** `items`
- **Indexes:** Compound unique (name+category), category+item_type, created_by, tags

### **3.2 API: FastAPI with Multipart Form Data**
- **Why:** Native multipart support, async operations, automatic validation
- **Request Format:** multipart/form-data (JSON string + optional file)
- **Validation:** Pydantic models for schema validation

### **3.3 File Upload: Local Storage**
- **Why:** Simple for Phase B, can migrate to cloud later
- **Storage:** `uploads/` directory
- **Naming:** UUID-based (prevents conflicts, security)

### **3.4 Conditional Fields: Frontend + Backend Validation**
- **Frontend:** Dynamic show/hide based on item_type
- **Backend:** Pydantic validators enforce conditional requirements
- **Why:** Better UX + data integrity

---

## **4. Technology Choices**

### **Backend:**
- **Framework:** FastAPI (Python)
- **Database:** MongoDB with Motor (async driver)
- **Validation:** Pydantic models
- **File Handling:** aiofiles (async file operations)
- **Authentication:** JWT middleware (from Flow 1)

### **Frontend:**
- **Framework:** React 18
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form (or custom hooks)
- **Styling:** Tailwind CSS
- **State:** React Context API or useState

---

## **5. Security Considerations**

1. **Authentication:** JWT token required for all requests
2. **File Validation:** Whitelist file types, size limits
3. **Input Validation:** Backend validates all inputs (never trust frontend)
4. **File Storage:** UUID naming prevents path traversal
5. **Error Messages:** Generic messages (don't reveal system internals)

---

## **6. Implementation Checklist**

### **Backend:**
- [ ] Setup FastAPI app and MongoDB connection
- [ ] Create Item Pydantic models (base + conditional)
- [ ] Create Item MongoDB model/schema
- [ ] Implement file validation service
- [ ] Implement file storage service
- [ ] Implement business rule validation service
- [ ] Implement duplicate check service
- [ ] Create item service (create item logic)
- [ ] Create item controller (endpoint handler)
- [ ] Setup item routes
- [ ] Add error handling middleware
- [ ] Add authentication middleware

### **Frontend:**
- [ ] Setup React form component
- [ ] Create form validation utilities
- [ ] Create conditional field components
- [ ] Create file upload component
- [ ] Create API client for item creation
- [ ] Implement form state management
- [ ] Implement error display component
- [ ] Add semantic HTML attributes
- [ ] Add data-testid attributes for automation
- [ ] Implement loading states
- [ ] Implement success/error feedback

---

## **7. Next Steps**

1. Review all architecture sections
2. Start with database setup (01-database-schema.md)
3. Implement backend following 03-backend-architecture.md
4. Implement frontend following 04-frontend-architecture.md
5. Test each flow manually
6. Proceed to Step B5 (Code Implementation)

---

**See individual sections for detailed specifications.**

