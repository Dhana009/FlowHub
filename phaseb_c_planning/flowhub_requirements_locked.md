# **FlowHub — Locked Requirements & Scope (v1.0)**

**Date:** 2024  
**Purpose:** Define the locked requirements, scope, and three-dimensional purpose of FlowHub project.

---

## **1. Project Purpose (Four-Dimensional)**

FlowHub serves **four distinct purposes** in one project:

### **Dimension 1: SDLC Skills Showcase**
- Demonstrate complete SDLC understanding (Requirements → Design → Development → Testing → Deployment)
- Show ability to identify ambiguities, analyze requirements, design architecture
- Complete SDLC documentation (PRD, FS, Architecture, Test Strategy, Test Cases)
- Understand layer interconnection (Frontend → API → Backend → DB)

### **Dimension 2: UI Automation Skills Showcase**
- Use FlowHub as System Under Test (SUT) for comprehensive UI automation
- Demonstrate Playwright skills with semantic locators
- Cover major UI automation challenges: iframes, pop-ups, dropdowns, tables, forms, file uploads, dynamic content
- Show stability, error handling, negative scenarios

### **Dimension 3: API Automation Skills Showcase**
- Use FlowHub APIs for comprehensive API automation
- Demonstrate positive, negative, edge case testing
- Show validation testing, error codes, business rules, schema validation
- Comprehensive request library and test coverage

### **Dimension 4: Semantic Representation Proof**
- Use semantic HTML/ARIA attributes (not XPath/CSS)
- Add data-testid attributes for automation
- Prove that UI can change but semantic meaning stays
- Show that automation remains stable when UI changes
- XPath/CSS = last resort only

**One project = Four checkmarks in four different perspectives**

---

## **2. Core Principles**

- **Production-quality application** (not a toy/demo)
- **Focused scope** (not overwhelming, not too simple)
- **Balance point** (enough complexity for automation showcase, manageable to build)
- **CRUD-based** (foundational operations everyone understands)
- **Rich behavior** (validation, business rules, error handling, dynamic UI)
- **SDLC-complete** (full documentation, proper process)

---

## **3. Scope: 6 Core Flows**

### **Flow 1: Auth Flow**
- Login form (validation, error messages)
- Token management
- Logout functionality

### **Flow 2: Item Creation**
- Complex form (conditional fields, multi-step)
- File upload (validation, file type checks)
- Real-time validation feedback
- Success/error handling

### **Flow 3: Item List**
- Table with sorting (multiple columns)
- Pagination (next/prev, page numbers)
- Search (real-time)
- Filters (dropdown filters, multi-select)
- Dynamic table updates

### **Flow 4: Item Details**
- Modal popup (open/close)
- iframe content (embedded details)
- Async content loading
- Loading states

### **Flow 5: Item Edit**
- Pre-populated form
- Dropdowns (cascading)
- Radio buttons (status selection)
- Checkboxes (tags/categories)
- Validation on edit
- State-based rules

### **Flow 6: Item Delete**
- Confirmation popup
- Soft delete
- Error states

---

## **4. UI Automation Coverage (From 6-7 Flows)**

Each flow provides multiple UI automation challenges:
- **Forms** (Flow 2, 5)
- **iframes** (Flow 4)
- **Pop-ups/Modals** (Flow 4, 6)
- **Dropdowns** (Flow 3, 5)
- **Radio Buttons** (Flow 5)
- **Checkboxes** (Flow 5)
- **Tables** (Flow 3)
- **File Uploads** (Flow 2)
- **Dynamic Content** (Flow 3, 4)
- **Pagination** (Flow 3)
- **Search/Filter** (Flow 3)

**One flow = Multiple UI automation skills**

---

## **5. API Automation Depth**

- 6-7 endpoints (Auth, Create, List, Details, Edit, Delete)
- Each endpoint with rich validation, business rules, error scenarios
- Positive, negative, edge case coverage
- Schema validation, status code verification
- Auth flows, state-based logic

---

## **6. Success Criteria**

**When reviewers see:**
- **UI automation test suite** → "This person knows UI automation in and out"
- **API automation framework** → "This person is solid in API automation"
- **SDLC documentation** → "This person understands SDLC deeply"

**One project = Three checkmarks**

---

## **7. Timeline & Quality**

- **Timeline:** 2-3 months (buildable, not overwhelming)
- **Quality:** Production-level (code, architecture, documentation, practices)
- **Complexity:** Balance point (enough for showcase, manageable to complete)

---

**Status:** ✅ LOCKED  
**Next Step:** Revise Phase B master document with these requirements

