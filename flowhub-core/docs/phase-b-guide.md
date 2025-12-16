# **PHASE B — SDLC APP BUILDER (MASTER DOCUMENT v1.0)**

**Purpose:** This document defines exactly how Phase B will be executed, taught, controlled, and orchestrated.

---

## **1. What Phase B Is**

Phase B = **"AI-Assisted SDLC Simulator + Small Testable Application Project"**

You will:

* Use AI to generate:
  * PRD (Product Requirement Document)
  * Functional Specification (FS)
  * Architecture Diagram Description
* Build a small, clean, stable application with:
  * Simple frontend (dynamic UI with semantic locators)
  * Simple backend API (rich logic, not complex architecture)
  * Small database (SQLite or JSON)
* Ensure it is **testable** by Playwright UI + API tests in Phase C

This is NOT a big system; it is a **micro-product** built for learning + automation.

**Project Name:** FlowHub Core (SDET Edition)

**Note on Project Name:**
Your old FlowHub repo was attempting to build a **full production SaaS platform**, not just a testable learning app. It had 18 flows, WebSockets, notifications, emails, Redis, MongoDB, S3, SES, CI/CD, real-time chat, infrastructure across Fly.io/Vercel, multi-version UI, versioned API, and observability stack.

This is an **excellent** project for company engineering — but it is **overkill** for an SDET portfolio project.

For an SDET role, companies do **not** expect you to:
* Build 3 versions of UI
* Build a chat system
* Build a notification engine
* Build SES + SNS webhook system
* Build WebSockets
* Build full production infra
* Maintain 18 flows
* Run Docker + multi-region deployments

That is *real developer work*, not required for QA automation interviews.

**So we build FlowHub Core (SDET Edition):**
* 6 automation-rich flows (not 18)
* Simple monolithic backend (not microservices)
* SQLite database (not MongoDB + Redis)
* Local deployment (not multi-region)
* Focus on testability (not production scale)

This keeps the project:
* Realistic
* Small
* Testable
* Automation-focused
* Buildable within 1–2 months
* Easily explainable in interviews

And still extremely impressive.

---

## **2. Why Phase B Exists**

Phase B serves three core purposes:

### **1) You internalize SDLC deeply by actually doing it.**
Not theory — real creation. You experience SDLC phases: Requirements → Design → Development → Testing → Deployment.

### **2) You create the SUT (System Under Test)**
Your Phase C automation framework needs a real application to test. This app becomes your testing playground.

### **3) You create a professional résumé project**
This becomes one of the strongest items in your portfolio. It demonstrates SDLC understanding, engineering reasoning, and cross-layer knowledge.

---

## **3. Goals of Phase B**

Phase B must deliver:

### **Deliverable 1 — Complete PRD**
Clear business problem, workflows, goals, user roles, requirements.

### **Deliverable 2 — Complete Functional Specification**
User stories → acceptance criteria → API endpoints → screen specs → field validations → error cases → DB requirements.

### **Deliverable 3 — Architecture Document**
Frontend → API → Backend → DB flow diagrams described in text. Request/response flows, data flow, system architecture.

### **Deliverable 4 — Minimal Working Product (MWP)**
A small app with:
* 1–2 frontend screens (with dynamic UI behaviors)
* 6 API endpoints (with rich backend logic)
* Simple backend (but with validation, business rules, error handling)
* Small database (SQLite with proper schema)

### **Deliverable 5 — Documentation**
README.md + Architecture.md + API Documentation + Setup instructions + How to run + How to test manually.

### **Deliverable 6 — Testability**
App must be:
* Stable
* Deterministic
* Predictable
* Easy to automate

This is crucial for Phase C.

---

## **4. How Phase B Fits in the A → B → C Flow**

Phase B sits here:

**Phase A → Phase B → Résumé Blueprint → Phase C**

Why?

Because **you cannot** build a framework (Phase C) without:
* A clear SDLC understanding (from Phase A)
* A real application (from Phase B)
* A solid architecture (from Phase B)
* Real flows to test (from Phase B)
* A stable SUT (from Phase B)

Phase B is the **bridge** between theory (Phase A) and automation (Phase C).

---

## **5. The Persona Used for Phase B**

When executing Phase B, the AI model must take the role of:

> **"A Senior Full-Stack Engineer + Senior SDET Lead who guides the user through designing and building a clean, minimal, testable application."**

Responsibilities:
* Help make architectural decisions
* Prevent over-engineering
* Enforce minimalism
* Ensure consistency
* Ensure testability
* Explain why each choice matters
* Guide through clean code generation
* Support debugging
* Validate every piece

This is different from Phase A's "teacher" persona.

---

## **6. Scope & Boundary Rules**

### **6.1 What Phase B MUST Focus On (In-Scope)**

#### **✅ UI That Creates Automation Challenges**
The UI must be dynamic so Playwright semantic locators can shine.

Include:
* Conditional rendering (fields appear/disappear)
* Changing DOM structure (lists update, reordering)
* Pagination
* Search + filters
* Modals
* File upload
* Async content loading
* Editable tables or forms

This gives you the **real-life automation challenges**:
* Locator stability
* Auto-waiting
* DOM refresh
* Re-render cycles
* Flaky conditions
* Semantic targeting

#### **✅ Real Backend Logic (for real API automation)**
Backend must be small but rich.

Include:
* Validations (required fields, data types, business rules)
* Business rules (state-based logic, conditional rules)
* Error responses (400, 401, 404, 409, 422, 500)
* Success flows (200, 201)
* Authorization (simple JWT or session)
* Pagination logic
* Search/filter logic
* File upload backend

This gives the **API automation depth** you need.

#### **✅ API Contract That Supports Positive + Negative + Edge Cases**
Every endpoint must support:
* Positive flows
* Negative flows
* Boundary checks
* Error responses
* Data-based logic
* Conditional rules
* Invalid inputs
* Missing inputs
* Unauthorized access

This is what makes a REAL API automation suite.

#### **✅ Database That Supports Real E2E Behavior**
Keep the schema simple but real.

Include:
* Unique constraints
* Nullability
* Basic foreign key (optional)
* createdAt / updatedAt timestamps
* Status fields
* Soft delete flag
* Pagination-friendly fields

This allows:
* E2E validation
* Data consistency checks
* Setup/teardown
* Data-driven automation

#### **✅ Complete SDLC Documentation**
This is where your résumé becomes premium.

You must create (with AI assistance):
* PRD
* Functional Specification
* API Specification
* Architecture Diagram
* ER Diagram
* UI Flow Diagram
* Test Strategy
* Test Design Techniques usage
* Test Plan
* Detailed Test Cases

This shows you understand **how real products are built**.

---

### **6.2 What Phase B MUST NOT Focus On (Out-of-Scope)**

#### **❌ Fancy UI design / animations / cosmetic styling**
No one cares how pretty the UI is. You are here for **dynamic behavior**, not design.

#### **❌ Large number of features**
We do NOT need:
* 20 pages
* 10 user roles
* Dashboard analytics
* Admin systems
* Multi-tenant logic

SDET portfolios fail when people overbuild and drown in scope. Stick to **6 meaningful flows**, not heavy product development.

#### **❌ Complex backend architecture**
Unnecessary for your goal.

Choose **one simple monolithic backend**:
* Python FastAPI
* Node Express
* Spring Boot (if Java)

That's more than enough.

DO NOT build:
* Microservices
* Message queues (Kafka, RabbitMQ)
* Distributed systems
* Serverless architecture

#### **❌ Authentication complexity**
Use:
* Simple JWT
  or
* Simple session cookie

DO NOT build:
* OAuth
* Multiple roles
* RBAC systems
* SSO

Not needed for your level.

#### **❌ Perfect scalability, load testing, infra work**
This is Phase D or later — not Phase B.

#### **❌ Exhaustive domain modeling**
Keep model simple:
* Item
* User
* File

Not dozens of tables.

---

## **7. The 6 Core Flows (FlowHub Core — SDET Edition)**

Phase B will build exactly **6 automation-rich flows**:

### **Flow 1: Item Creation Flow**
**Components:** UI + API + DB

**Features:**
* Form with validation
* File upload
* Conditional fields (appear/disappear based on selection)
* Real-time validation feedback
* Success/error handling

**Backend Logic (Detailed):**
**API Endpoint:** `POST /items`

**Validation Rules:**
* Required fields missing → 400 Bad Request
  * Example: Missing `name` field
  * Response: `{ "error": "name is required" }`
* Invalid data → 400 Bad Request
  * Example: `name` is not a string, `status` is invalid enum value
  * Response: `{ "error": "Invalid data format" }`
* Invalid file type → 415 Unsupported Media Type
  * Example: Uploading `.exe` when only `.pdf`, `.jpg`, `.png` allowed
  * Response: `{ "error": "File type not supported" }`
* Name too short/long → 422 Unprocessable Entity
  * Example: `name` must be 3-100 characters
  * Response: `{ "error": "Name must be between 3 and 100 characters" }`
* User unauthorized → 401 Unauthorized
  * Example: No auth token or invalid token
  * Response: `{ "error": "Unauthorized" }`
* Business rule violation → 409 Conflict
  * Example: Item with same name already exists (unique constraint)
  * Response: `{ "error": "Item with this name already exists" }`
* Success → 201 Created
  * Response: `{ "id": 123, "name": "Item Name", "status": "active", "createdAt": "2024-01-01T00:00:00Z" }`

**Why This Matters:**
These rules give you **dozens** of API test scenarios:
* Positive flow: Valid data → 201
* Negative flows: Missing field → 400, Invalid data → 400, Invalid file → 415
* Boundary testing: Name too short → 422, Name too long → 422
* Auth testing: No token → 401, Invalid token → 401
* Business logic: Duplicate name → 409

**Automation Value:**
* Form validation testing (client-side + server-side)
* File upload testing (valid types, invalid types, size limits)
* Conditional rendering testing (fields appear/disappear)
* Error handling testing (all error codes)
* Positive + negative flows (comprehensive test coverage)

---

### **Flow 2: Item List Flow**
**Components:** Dynamic UI + Server-driven logic

**Features:**
* Pagination
* Sorting (by name, date, status)
* Filtering (by status, category)
* Search functionality
* Dynamic table updates

**Backend Logic (Detailed):**
**API Endpoint:** `GET /items`

**Query Parameters:**
* `search`: Search by name (partial match)
  * Example: `?search=test` → Returns items with "test" in name
* `status`: Filter by status
  * Example: `?status=active` → Returns only active items
* `sort`: Sort by field
  * Example: `?sort=name` or `?sort=-createdAt` (descending)
* `page`: Page number (for pagination)
  * Example: `?page=1&limit=10`
* `limit`: Items per page
  * Example: `?limit=20`

**Response Format:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Why This Matters:**
This gives you REAL combined testing like:
```
search + filter + sort + page = deep test combinations
```

**Test Scenarios:**
* Search only: `?search=test`
* Filter only: `?status=active`
* Sort only: `?sort=-createdAt`
* Pagination only: `?page=2&limit=10`
* Combined: `?search=test&status=active&sort=name&page=1&limit=20`

**Automation Value:**
* Pagination testing (test all pages, edge cases)
* Sorting testing (ascending, descending, multiple fields)
* Filtering testing (single filter, multiple filters)
* Search testing (exact match, partial match, no results)
* Combined scenarios (search + filter + sort + page = comprehensive testing)

---

### **Flow 3: Item Details Flow**
**Components:** Modal + Async load + Semantic roles

**Features:**
* Modal popup
* Async content loading
* Semantic HTML roles
* Loading states
* Error states

**Backend Logic:**
* GET /items/{id}
* Item not found → 404
* Success → 200 with item data

**Automation Value:**
* Modal handling
* Async waiting
* Semantic locator strategy
* Loading state handling
* Error state handling

---

### **Flow 4: Item Edit Flow**
**Components:** State-based rules + Validation

**Features:**
* Edit form
* Pre-populated fields
* Validation on edit
* Save/Cancel buttons
* Success/error feedback

**Backend Logic (Detailed):**
**API Endpoint:** `PUT /items/{id}`

**Validation Rules:**
* Item not found → 404 Not Found
  * Example: ID doesn't exist in database
  * Response: `{ "error": "Item not found" }`
* Cannot edit deleted item → 409 Conflict
  * Example: Item status is "deleted", cannot be edited
  * Response: `{ "error": "Cannot edit deleted item" }`
* Version mismatch → 409 Conflict
  * Example: Item was modified by another user (optimistic locking)
  * Response: `{ "error": "Item was modified. Please refresh and try again." }`
* Validation rules (same as creation)
  * Required fields, data types, length constraints
* Business rules
  * Example: Cannot change status from "archived" to "active" directly
  * Response: `{ "error": "Invalid status transition" }`
* Success → 200 OK
  * Response: `{ "id": 123, "name": "Updated Name", "status": "active", "updatedAt": "2024-01-01T00:00:00Z" }`

**Why This Matters:**
This gives rich negative testing scenarios:
* State-based logic testing (deleted items, locked items)
* Concurrency testing (version mismatch)
* Business rule testing (status transitions)
* Validation testing (same as creation)

**Automation Value:**
* Edit flow testing (update existing items)
* State-based testing (test different item states)
* Validation testing (client-side + server-side)
* Error handling testing (all error scenarios)
* API + UI consistency testing (verify UI reflects API state)

---

### **Flow 5: Item Delete Flow**
**Components:** Soft delete + Error states

**Features:**
* Delete confirmation modal
* Soft delete (item marked as deleted, not removed)
* Error states (cannot delete locked item, cannot delete item owned by another user)
* Success feedback

**Backend Logic:**
* DELETE /items/{id}
* Soft delete (update status, not remove from DB)
* Cannot delete locked item → 409
* Cannot delete item owned by another user → 403
* Child dependencies check → 409
* Success → 200

**Automation Value:**
* Delete flow testing
* Soft delete testing
* Error state testing
* State-based logic testing
* API negative testing

---

### **Flow 6: Auth Flow**
**Components:** JWT + Session + Invalid tokens

**Features:**
* Login form
* JWT token generation
* Session management
* Token validation
* Invalid token handling
* Logout functionality

**Backend Logic:**
* POST /auth/login
* Invalid credentials → 401
* Success → 200 with JWT token
* Token validation middleware
* Invalid token → 401
* Expired token → 401

**Automation Value:**
* Auth flow testing
* Token validation testing
* Session management testing
* Error handling testing
* Security testing basics

---

## **8. Step-by-Step Flow of Phase B**

Phase B must be executed in the following order with exact depth requirements:

---

### **Step B1 — Requirements (PRD)**

**Depth Level Required:** **Medium**

**Goal:** Create a clear, complete PRD that defines the problem, solution, and scope.

**What to learn/do:**
* Problem statement (what problem are we solving, why it matters)
* Business value (why build this, what value does it provide)
* Target user (who will use this, user personas)
* User journey (how users will interact with the app, step-by-step)
* Must-haves vs good-to-have (prioritization, scope boundaries)
* Constraints (technical constraints, time constraints, resource constraints)
* Milestones (key deliverables, timeline)
* Requirements review process (how to validate PRD is complete)

**What NOT to do:**
* Don't write code yet
* Don't design UI mockups yet
* Don't define API endpoints in detail yet
* Don't over-engineer the problem statement
* Don't add features that aren't needed for automation

**Deliverable:** Complete PRD document

**Validation:** PRD must be reviewed and approved before moving to FS.

---

### **Step B2 — Functional Specification (FS)**

**Depth Level Required:** **Medium**

**Goal:** Create detailed functional spec that defines exactly what will be built.

**What to learn/do:**
* User stories (As a... I want... So that... format)
* Acceptance criteria (how to know a feature is complete, testable criteria)
* UI elements (what UI components exist, their behavior)
* Field validations (what fields are required, validation rules, error messages)
* API endpoints (endpoint URLs, HTTP methods, request/response formats)
* Input/output examples (sample requests, sample responses)
* Error cases (all error scenarios, error codes, error messages)
* DB requirements (what data needs to be stored, relationships, constraints)

**What NOT to do:**
* Don't write code yet
* Don't design database schema in detail yet
* Don't implement features yet
* Don't skip error cases (they're critical for automation)
* Don't forget edge cases

**Deliverable:** Complete Functional Specification document

**Validation:** FS must be reviewed and approved before moving to Architecture.

---

### **Step B3 — Architecture Design**

**Depth Level Required:** **High**

**Goal:** Design the system architecture before writing any code.

**What to learn/do:**
* Frontend structure (how frontend is organized, components, pages)
* Backend routing (how requests are routed, controller structure)
* API layer (API design, request/response flow, middleware)
* DB structure (database schema, tables, relationships, indexes)
* Request flow (how requests flow: UI → API → Backend → DB)
* Response flow (how responses flow: DB → Backend → API → UI)
* Deployment approach (local development setup, how to run the app)
* Technology choices (which frameworks, libraries, why chosen)

**What NOT to do:**
* Don't write code yet (architecture first, code second)
* Don't skip architecture (code without architecture leads to problems)
* Don't over-engineer (keep it simple, monolithic backend is fine)
* Don't design for scale (not needed for Phase B)
* Don't add unnecessary abstractions

**Deliverable:** Architecture document (text-based, can include diagrams)

**Validation:** Architecture must be locked and documented before coding.

---

### **Step B4 — Coding Sequence Plan**

**Depth Level Required:** **Medium**

**Goal:** Plan the implementation order before writing code.

**What to learn/do:**
* File structure (how files are organized, folder structure)
* Implementation order (what to build first, dependencies)
* Naming conventions (how to name files, functions, variables)
* Testability rules (how to write testable code, what makes code testable)
* Minimalism constraints (keep it simple, avoid over-engineering)

**What NOT to do:**
* Don't write code yet (plan first, code second)
* Don't skip planning (leads to messy code)
* Don't create complex folder structures (keep it simple)
* Don't add unnecessary patterns (YAGNI principle)

**Deliverable:** Coding plan document

**Validation:** Coding plan must be approved before implementation starts.

---

### **Step B5 — Code Implementation**

**Depth Level Required:** **High**

**Goal:** Build the working application with all 6 flows.

**What to learn/do:**
* Frontend implementation (with dynamic UI behaviors, semantic HTML)
* Backend implementation (with rich logic, validation, error handling)
* API implementation (with proper endpoints, request/response handling)
* DB implementation (with proper schema, migrations, seed data)
* Config files (environment config, dependencies, setup files)
* Code quality (minimal, readable, modular, testable, deterministic)

**What NOT to do:**
* Don't over-engineer (keep it simple)
* Don't skip error handling (critical for automation)
* Don't forget validation (frontend + backend)
* Don't create flaky code (must be deterministic)
* Don't add unnecessary features (stick to 6 flows)

**Deliverable:** Working application (all 6 flows functional)

**Validation:** App must run locally, all endpoints work, all flows function.

---

### **Step B6 — Validation & Testing**

**Depth Level Required:** **Medium**

**Goal:** Verify the application works correctly and is ready for automation.

**What to learn/do:**
* Endpoint validation (test all API endpoints, verify responses)
* Flow validation (test all 6 flows end-to-end manually)
* Local execution (app runs locally without errors)
* Log verification (logs are clean, no errors in logs)
* Error handling verification (errors handled gracefully, proper error messages)
* Edge case testing (test boundary conditions, error scenarios)
* Manual testing (test all features manually before automation)

**What NOT to do:**
* Don't write automated tests yet (that's Phase C)
* Don't skip manual testing (must verify manually first)
* Don't ignore errors (fix all errors before Phase C)
* Don't skip edge cases (they're important for automation)

**Deliverable:** Validated application (all flows tested and working)

**Validation:** App is stable, deterministic, predictable, ready for automation.

---

### **Step B7 — Documentation Creation**

**Depth Level Required:** **Low–Medium**

**Goal:** Create complete documentation for the application.

**What to learn/do:**
* README.md (project overview, setup instructions, how to run)
* Architecture.md (system architecture, design decisions, flow diagrams)
* API Documentation (all endpoints, request/response formats, examples)
* Setup instructions (how to install dependencies, configure, run)
* How to run the app (step-by-step instructions)
* How to test manually (manual testing guide)

**What NOT to do:**
* Don't skip documentation (critical for Phase C and interviews)
* Don't write incomplete docs (must be clear and complete)
* Don't forget API docs (essential for API automation in Phase C)

**Deliverable:** Complete documentation set

**Validation:** Documentation is complete, clear, and sufficient for Phase C.

---

## **9. Chain-of-Thought / Reasoning Rules for Phase B**

The AI must internally use:
* **Architectural decision tree reasoning**
* **Stepwise refinement**
* **Minimal viable design evaluation**
* **Testability-first evaluation**

But must NOT reveal raw chain-of-thought.

It should show:
* Clean decisions
* Concise reasoning
* Senior-level clarity

---

## **10. Guardrails Against Hallucination**

To avoid hallucinations, the AI must:
* Use simple, known libraries
* Explain library choices
* Avoid unknown or unstable packages
* Avoid generating complex boilerplate
* Explain file structures first
* Validate consistency before coding
* Ask for approval before major steps

---

## **11. Phase B Completion Criteria**

Phase B is considered complete when:
* PRD is reviewed and approved
* FS is reviewed and approved
* Architecture is locked and documented
* App is fully implemented (all 6 flows working)
* App runs locally without errors
* Documentation is complete (README, Architecture, API docs)
* User understands the system flow (UI → API → Backend → DB)
* System is ready for automation (stable, deterministic, testable)

Only then you can move to:

**Résumé Blueprint → Phase C**

---

## **12. What Phase B Produces for Your Résumé**

You will add:

### **Project: FlowHub Core (SDET Edition) — AI-Assisted SDLC Simulator App**

**Key Points:**
* PRD + FS + Architecture (complete SDLC documentation)
* Small testable frontend + backend system (6 automation-rich flows)
* Built using iterative AI-assisted development
* Used as SUT for Phase C automation
* Shows SDLC understanding (experienced all phases)
* Shows engineering reasoning (architectural decisions)
* Shows cross-layer knowledge (UI → API → Backend → DB)

This becomes a premium résumé project.

---

## **13. The REAL Goal of Phase B (Super Clear)**

Phase B's purpose is NOT to build a big product.

The purpose is to build a **realistic playground** so that Phase C:
* UI automation (semantic locators, dynamic UI)
* API automation (positive, negative, edge cases)
* E2E flows (end-to-end testing)
* Negative tests (error handling)
* Edge-case tests (boundary conditions)
* Semantic-locator automation (DOM changes don't break tests)
* Framework validation (proves framework robustness)

… becomes **industry-level**.

**Phase B is the world. Phase C is your superpower.**

---

## **13.1 Key Principle: "Small in Size but Rich in Behavior"**

This is what product teams do in real SaaS products.

The magic is not in the size, but the **logic density**.

You don't need 18 features.
You need **6 powerful behaviors** inside 4–5 features.

**Example:**
Instead of building 20 simple CRUD endpoints, build 6 endpoints with:
* Rich validation logic
* Business rules
* State-based logic
* Error handling
* Edge cases

This gives you **full-strength SDET API automation**:
* Positive flows
* Negative flows
* Boundary conditions
* Data-driven testing
* Chained API calls
* Auth validation
* Error response structure
* Schema validation
* Concurrency edge cases

---

## **13.2 Why Semantic Locators Matter**

**The Problem:**
DOM changes = the UI structure / layout / HTML composition changes

**The Issue:**
If you rely on CSS/XPath selectors → tests break when DOM changes

**The Solution:**
If you rely on semantic meaning → tests stay stable

This is EXACTLY why Playwright invented:
* `getByRole()` - Find by accessibility role
* `getByLabel()` - Find by label text
* `getByPlaceholder()` - Find by placeholder text
* `getByText()` - Find by visible text
* `getByTestId()` - Find by test ID

**Everything we build in Phase B should support this single line:**

**"I can automate dynamic UI with semantic locators so DOM changes don't break tests."**

This is premium SDET stuff.

---

## **13.3 What Makes Good API Automation**

A real SDET project must allow:

### ✔ Positive cases
* Valid requests → Success responses
* Proper status codes (200, 201)
* Correct response structure

### ✔ Negative cases
* Invalid requests → Error responses
* Proper error codes (400, 401, 404, 409, 422, 500)
* Meaningful error messages

### ✔ Edge cases
* Boundary conditions (min/max values)
* Empty/null values
* Special characters
* Very long strings

### ✔ Validation logic
* Required fields
* Data types
* Format validation
* Business rules

### ✔ Error handling
* Graceful error responses
* Proper HTTP status codes
* Error message structure

### ✔ Forbidden cases
* Unauthorized access → 401
* Forbidden actions → 403
* Resource not found → 404

### ✔ Auth failures
* Missing token → 401
* Invalid token → 401
* Expired token → 401

### ✔ State-based logic
* Cannot edit deleted items
* Cannot delete locked items
* Status transitions

### ✔ Data dependency
* Foreign key constraints
* Unique constraints
* Referential integrity

### ✔ Multi-step flows
* Create → Update → Delete
* Login → Create → List → Delete

### ✔ Backend-driven decision logic
* Business rules enforced by backend
* Conditional responses based on state
* Dynamic behavior based on data

This is EXACTLY what companies test in interviews.

---

## **14. Depth Guide**

### **🎯 Depth Required (MUST learn/do)**
* Real UI behavior (dynamic, conditional rendering)
* Real API behavior (validation, business rules, error handling)
* Real DB state flow (CRUD operations, data consistency)
* Real validation logic (frontend + backend)
* Real error handling (proper status codes, error messages)
* Real async behavior (API calls, UI updates)
* Real SDLC documents (PRD, FS, Architecture, Test docs)
* Real CRUD + search/filter (all 6 flows)
* File upload flow (with validation)
* State transitions (item states, user states)
* Form validation (client-side + server-side)

This is your interview depth.

---

### **⚠️ Depth NOT Required (can ignore)**
* Distributed systems
* Microservice architecture
* SSO/OAuth
* Advanced caching
* Complex indexing
* WebSockets
* Serverless architecture
* Multi-region deployments
* Kafka/RabbitMQ
* Complex state machines

These topics are NOT expected from a 2.5-year SDET.

---

## **15. Final Summary**

**Phase B builds a small but dynamic, realistic application with enough UI complexity, backend logic, and API behavior to demonstrate strong SDET automation skills in Phase C.**

**Key Principle:** "Your backend should be small in size but rich in behavior."

**The 6 Flows:** Item Creation, Item List, Item Details, Item Edit, Item Delete, Auth Flow.

**The Goal:** Build a realistic playground for Phase C automation, not a production SaaS platform.

---

# ✔ END OF PHASE B MASTER DOCUMENT (v1.0)

