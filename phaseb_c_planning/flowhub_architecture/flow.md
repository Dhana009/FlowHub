# **FlowHub — Development & Testing Flow**

**Purpose:** Define the correct sequence of activities from requirements to test execution.

---

## **CORRECT FLOW FOR FLOWHUB**

### **Step 1: Functional Requirements (FS)** ✅

**Status:** Complete  
**Document:** `flow_1_auth_fs.md`

**Contains:**
- User stories
- Functional requirements
- Acceptance criteria
- API endpoints
- Database requirements
- Error cases

---

### **Step 2: Architecture Design** ⏳

**Status:** Next Step  
**Needed Before:** Test Strategy

**What to Design:**
- **Database Schema:**
  - Tables/Collections structure
  - Relationships
  - Indexes
  - Constraints

- **API Contract:**
  - Exact endpoints (URL, method)
  - Request/response formats
  - Status codes
  - Error responses

- **Backend Architecture:**
  - Folder structure
  - Layer separation (controllers, services, models)
  - Business logic organization
  - Validation organization

- **Frontend Architecture:**
  - Folder structure
  - Component structure
  - Page structure
  - State management

**Why Needed Before Test Strategy:**
- Test strategy needs to know what to test (API endpoints, database, UI components)
- Test strategy needs to know architecture to plan test approach

---

### **Step 3: Test Strategy** ⏳

**Status:** After Architecture Design

**Based On:**
- Requirements (FS)
- Architecture Design

**What It Defines:**
- **Test Scope:** What to test, what not to test
- **Test Types:** UI testing, API testing, E2E testing
- **Test Levels:** Unit, Integration, System
- **Test Approach:** How to test (manual, automation)
- **Test Design Techniques:** Which techniques to use (BVA, EP, State Transition, etc.)
- **Test Environment:** Where to test
- **Test Data Strategy:** How to manage test data
- **Entry/Exit Criteria:** When to start/stop testing
- **Deliverables:** What documents to create

---

### **Step 4: Test Scenarios** ⏳

**Status:** After Test Strategy

**Derived From:**
- Requirements (Acceptance Criteria)
- Functional Requirements

**What They Are:**
- High-level descriptions of what to test
- Example: "Verify user can log in with valid credentials"
- Grouped by flow (Login, Sign-Up, Password Reset, Logout)

**Coverage:**
- Positive scenarios (happy path)
- Negative scenarios (error cases)
- Edge cases (boundary conditions)

---

### **Step 5: Test Cases** ⏳

**Status:** After Test Scenarios

**Derived From:**
- Test Scenarios
- **Using:** Test Design Techniques

**Test Design Techniques Used:**
- **Boundary Value Analysis (BVA):** Test boundary values (email length: 0, 1, 100, 101)
- **Equivalence Partitioning (EP):** Group similar inputs (valid email, invalid email)
- **State Transition Testing:** Test state changes (not logged in → logged in)
- **Decision Table:** Test complex business rules (account lockout logic)
- **Error Guessing:** Test error scenarios (network failure, database error)

**What They Contain:**
- Detailed step-by-step instructions
- Test data (from BVA/EP)
- Expected results
- Preconditions
- Postconditions

---

### **Step 6: Development** ⏳

**Status:** After Test Strategy (can start in parallel with test case writing)

**Activities:**
- Code implementation (frontend, backend, database)
- Unit tests (written during development)
- Integration tests (written during development)
- Code review
- Bug fixes

**Parallel Activities:**
- Test case writing (can happen during development)
- Test data preparation
- Test environment setup

---

### **Step 7: Test Execution** ⏳

**Status:** After Development + Test Cases Complete

**Activities:**
- Execute test cases
- UI testing (Playwright)
- API testing (Postman/Requests)
- E2E testing (Playwright)
- Defect reporting
- Retest fixes
- Test summary report

---

## **KEY PRINCIPLES**

1. **Architecture Before Test Strategy:** Need to know what to test before planning how to test
2. **Test Scenarios from Requirements:** High-level scenarios derived from acceptance criteria
3. **Test Cases from Scenarios + Techniques:** Detailed cases using test design techniques
4. **Development Can Start After Architecture:** Don't need to wait for all test cases
5. **Test Execution After Development:** Execute tests when code is ready

---

---

## **ROLE-BASED PERSPECTIVES & DEPENDENCIES**

**Purpose:** Show what each role needs and when they can start working.

---

### **Example: Login Flow**

**Flow:** Authentication (Login, Sign-Up, Password Reset, Logout)

---

### **Role 1: Software Architect**

**When Can Start:** After Functional Requirements (FS) ✅

**What They Need:**
- ✅ Functional Requirements (FS) - to understand what to build
- ⏳ (No other dependencies)

**What They Create:**
- Database Schema (exact structure)
- API Contract (exact endpoints, request/response)
- Backend Architecture (folder structure, layers)
- Frontend Architecture (folder structure, components)

**Output Documents:**
- `flow_1_auth_architecture.md` (Database, API, Backend, Frontend)

**When Complete:** Architecture Design locked → Other roles can start

---

### **Role 2: Backend Engineer**

**When Can Start:** After Architecture Design ✅

**What They Need:**
- ✅ Functional Requirements (FS) - what to build, business rules
- ✅ Architecture Design - database schema, API contract, backend structure
- ⏳ Detailed Specifications - exact validation logic, exact error handling

**What They Create:**
- Backend code (controllers, services, models)
- API endpoints (exact implementation)
- Database setup (collections, indexes)
- Business logic (validation, authentication, token generation)

**Source of Truth:**
- **FS:** Business rules, acceptance criteria
- **Architecture:** Database schema, API contract, code structure
- **Detailed Specs:** Exact validation, exact error messages

**Can Work In Parallel With:**
- Frontend Engineer (once API contract is defined)
- QA (once architecture is defined)

---

### **Role 3: Frontend Engineer**

**When Can Start:** After Architecture Design ✅

**What They Need:**
- ✅ Functional Requirements (FS) - what UI to build, user journeys
- ✅ Architecture Design - frontend structure, API contract (to know what to call)
- ⏳ Detailed Specifications - exact validation timing, exact UI behavior

**What They Create:**
- Frontend code (pages, components)
- UI forms (login, sign-up, password reset)
- API integration (calling backend endpoints)
- State management (token storage, user session)

**Source of Truth:**
- **FS:** User journeys, UI requirements, acceptance criteria
- **Architecture:** Frontend structure, API contract (endpoints to call)
- **Detailed Specs:** Exact validation timing, exact error display, exact UI behavior

**Can Work In Parallel With:**
- Backend Engineer (once API contract is defined)
- QA (once architecture is defined)

---

### **Role 4: QA / Tester**

**When Can Start:** After Architecture Design ✅

**What They Need:**
- ✅ Functional Requirements (FS) - what to test, acceptance criteria
- ✅ Architecture Design - what to test (API endpoints, database, UI components)
- ⏳ Detailed Specifications - exact test scenarios, exact test data

**What They Create:**
- Test Strategy (how to test)
- Test Scenarios (what to test - from acceptance criteria)
- Test Cases (detailed steps - using test design techniques)
- Test Execution (run tests, report defects)

**Source of Truth:**
- **FS:** Acceptance criteria, functional requirements (for test scenarios)
- **Architecture:** API endpoints, database schema (for test strategy)
- **Detailed Specs:** Exact test scenarios, exact test data

**Can Work In Parallel With:**
- Backend Engineer (writing test cases while backend is being built)
- Frontend Engineer (writing test cases while frontend is being built)

---

## **PHASED WORK FLOW (Example: Login Flow)**

### **PHASE 1: Requirements & Design**

**Timeline:** Week 1-2  
**Goal:** Complete all design documents so all roles can start

**Activities:**
- ✅ Functional Requirements (FS) - Complete
- ⏳ Architecture Design - In Progress
  - **Role:** Software Architect
  - Creates: Database schema, API contract, Backend/Frontend architecture
  - Output: `flow_1_auth_architecture.md`
- ⏳ Detailed Specifications - After Architecture
  - **Role:** Senior Developer / Business Analyst
  - Creates: Validation specs, Business logic specs, UI/UX specs, Error handling specs
  - Output: `flow_1_auth_detailed_specs.md`

**Dependencies:**
- Architecture needed before: Detailed Specs, Backend Engineer, Frontend Engineer, QA
- Detailed Specs needed before: Developers can implement details

**Phase 1 Complete When:**
- ✅ Architecture Design locked
- ✅ Detailed Specifications locked
- ✅ All roles have their source of truth documents

---

### **PHASE 2: Test Planning (QA First)**

**Timeline:** Week 3-4  
**Goal:** Complete all test planning documents before development starts

**Activities (QA Perspective):**

**Step 1: Test Strategy**
- **Role:** QA / SDET Lead
- **Reads:** FS + Architecture
- **Creates:** Test Strategy document
  - Test scope, test types, test levels
  - Test design techniques to use
  - Test environment, test data strategy
  - Entry/exit criteria
- **Output:** `flow_1_auth_test_strategy.md`

**Step 2: Test Scenarios**
- **Role:** QA / Tester
- **Reads:** FS (Acceptance Criteria)
- **Creates:** Test Scenarios document
  - Derived from acceptance criteria
  - Positive, negative, edge cases
  - Grouped by flow (Login, Sign-Up, Password Reset, Logout)
- **Output:** `flow_1_auth_test_scenarios.md`

**Step 3: Test Cases**
- **Role:** QA / Tester
- **Reads:** Test Scenarios + Test Design Techniques
- **Creates:** Test Cases document
  - Detailed step-by-step test cases
  - Using: BVA, EP, State Transition, Decision Table
  - Test data, expected results
  - Separate test cases for: UI, API, E2E
- **Output:** `flow_1_auth_test_cases.md`

**Phase 2 Complete When:**
- ✅ Test Strategy locked
- ✅ Test Scenarios locked
- ✅ Test Cases ready (not executed yet)

**After Phase 2:**
- Backend Engineer can start (has all documents)
- Frontend Engineer can start (has all documents)
- Test cases are ready for execution (when code is ready)

---

### **PHASE 3: Development & Test Execution**

**Timeline:** Week 5-8

**Activities (Parallel):**

**Backend Engineer:**
- **Role:** Backend Developer
- **Reads:** FS + Architecture + Detailed Specs
- **Implements:**
  - API endpoints (POST /auth/login, etc.)
  - Database setup (collections, indexes)
  - Business logic (validation, authentication, token generation)
  - Error handling
- **Creates:** Backend code

**Frontend Engineer:**
- **Role:** Frontend Developer
- **Reads:** FS + Architecture + Detailed Specs
- **Implements:**
  - UI components (Login page, Sign-up page, etc.)
  - Forms with validation
  - API integration (calling backend)
  - State management (token storage)
- **Creates:** Frontend code

**QA (Test Execution):**
- **Role:** QA / Tester
- **Reads:** Test Cases (from Phase 2)
- **Executes:**
  - UI tests (Playwright)
  - API tests (Postman/Requests)
  - E2E tests (Playwright)
- **Activities:**
  - Execute test cases
  - Report defects
  - Retest fixes
  - Test summary report

**Dependencies:**
- Development needs: FS + Architecture + Detailed Specs ✅ (from Phase 1)
- Test execution needs: Code complete + Test cases ready ✅ (from Phase 2)

**Phase 3 Complete When:**
- ✅ Backend code complete
- ✅ Frontend code complete
- ✅ All test cases executed
- ✅ All defects fixed
- ✅ Test summary report complete

---

## **SOURCE OF TRUTH SUMMARY**

### **For Backend Engineer:**
1. **FS** - What to build, business rules
2. **Architecture** - Database schema, API contract, code structure
3. **Detailed Specs** - Exact validation, exact error handling

### **For Frontend Engineer:**
1. **FS** - What UI to build, user journeys
2. **Architecture** - Frontend structure, API contract
3. **Detailed Specs** - Exact validation timing, exact UI behavior

### **For QA:**
1. **FS** - What to test, acceptance criteria
2. **Architecture** - What to test (endpoints, database, UI)
3. **Detailed Specs** - Exact test scenarios, test data

### **For Architect:**
1. **FS** - What to design (requirements)

---

## **KEY INSIGHTS**

1. **Architecture is the bridge:** Once architecture is done, all roles can work in parallel
2. **Detailed Specs needed for implementation:** Developers need detailed specs for exact implementation
3. **QA can start early:** QA can create test strategy and scenarios once architecture is ready
4. **Parallel work possible:** Backend, Frontend, QA can work simultaneously after architecture
5. **Multiple documents = Complete source of truth:** No single document is enough

---

## **CURRENT STATUS**

**Phase 1: Requirements & Design**
- ✅ Functional Requirements (FS) - Complete
- ⏳ Architecture Design - Next Step
  - **Role:** Software Architect
  - **Needs:** FS ✅
  - **Creates:** Architecture documents
- ⏳ Detailed Specifications - After Architecture
  - **Role:** Senior Developer / Business Analyst
  - **Needs:** FS ✅ + Architecture ⏳
  - **Creates:** Detailed specification documents

**Phase 2: Test Planning (QA First)**
- ⏳ Test Strategy - After Phase 1 Complete
- ⏳ Test Scenarios - After Test Strategy
- ⏳ Test Cases - After Test Scenarios

**Phase 3: Development & Test Execution**
- ⏳ Backend Development - After Phase 1 + Phase 2 Complete
- ⏳ Frontend Development - After Phase 1 + Phase 2 Complete
- ⏳ Test Execution - After Development Complete

---

**Document Version:** 2.0  
**Last Updated:** November 30, 2024
