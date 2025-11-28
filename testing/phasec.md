# **PHASE C — CLASSIC SDET AUTOMATION FRAMEWORK (MASTER DOCUMENT v1.0)**

**Purpose:** Define how Phase C will be taught, executed, structured, validated, and constrained to ensure a clean, senior-quality automation framework built on top of your Phase B application.

---

## **1. What Phase C Is**

Phase C is:

> **"The design and implementation of a production-like UI + API automation framework using Playwright + Python, using the Phase B app (FlowHub Core) as the SUT."**

This phase transforms you from:
* someone who "knows automation concepts" →
* someone who can "architect a clean, scalable framework."

This is the most important phase for your **résumé**, **interview prep**, and **real-world skill**.

---

## **2. Why Phase C Exists**

Phase C delivers three core outcomes:

### **1) You become an actual SDET (not a theory-only engineer).**
You build a real automation framework with:
* Utilities
* Config
* Page objects
* API wrappers
* Reporting
* CI pipeline

### **2) This becomes your strongest résumé project.**
Most candidates only "run test scripts."
Almost nobody can explain the architecture.

### **3) It prepares you for interviews across:**
* Product companies
* SaaS
* Fintech
* High-scale engineering teams

A strong framework = strong interview impression.

---

## **3. Goals of Phase C**

Phase C must deliver:

### **Deliverable 1 — Complete Framework Architecture**
* Folder structure
* Config system
* Utilities
* Page objects
* API client
* Logger
* Test data manager
* Env handling
* Reporting

### **Deliverable 2 — UI Automation (Playwright)**
* Semantic locators strategy
* Page Object Model
* Auto-wait usage
* Context/page lifecycle
* Assertions
* Test examples (all 6 flows from Phase B)

### **Deliverable 3 — API Automation**
* API client (Python Requests or Playwright API)
* Request builder
* Validation helpers
* Schema validation
* Error tests
* Positive + Negative + Edge cases

### **Deliverable 4 — CI/CD Integration**
* GitHub Actions (or Jenkins pipeline)
* Run tests on push/pull request
* Run UI + API suites
* Parallel execution
* Test retries

### **Deliverable 5 — Documentation**
* README
* How to run tests
* Folder-by-folder explanation
* CI/CD instructions
* Framework architecture explanation

### **Deliverable 6 — Résumé-ready Project**
A premium "Automation Framework Project" for interviews.

---

## **4. How Phase C Fits in the A → B → C Flow**

Phase C sits here:

**Phase A → Phase B → Résumé Blueprint → Phase C → Phase D**

Why?

Because **you cannot** build a framework (Phase C) without:
* A clear SDLC understanding (from Phase A)
* A real application to test (from Phase B)
* A solid architecture understanding (from Phase A)
* Real flows to automate (from Phase B)

Phase C is where you **apply** all Phase A knowledge to **automate** the Phase B application.

---

## **5. The Persona Used for Phase C**

When executing Phase C, the AI model must take the role of:

> **"Senior SDET Architect + Senior Automation Engineer"**

Responsibilities:
* Help design architecture
* Prevent over-engineering
* Ensure maintainability
* Enforce separation of concerns
* Explain trade-offs
* Produce clean, idiomatic code
* Set conventions
* Validate every layer

This persona switches from "teacher" (Phase A) to "architect mentor" (Phase C).

---

## **6. Scope & Boundary Rules**

### **6.1 What Phase C MUST Focus On (In-Scope)**

#### **✅ Test Architecture (Framework Skeleton)**
* Finalize folder structure
* Implement POM architecture (BasePage + per-page classes)
* Add fixtures (`test`, `page`, custom fixtures)
* Add config system (`dev`, `stage`, `prod`)
* Base test setup (beforeEach, environment setup)
* Centralized utilities (helpers, formatters, API client)
* Logging setup (console + file logs)
* Screenshots & video capture config
* Tagging tests (smoke, regression, e2e)

**Depth Level:** High — because this defines your "SDET identity." You must explain this in interviews.

#### **✅ UI Automation (Playwright)**
Automate the 6 core flows from Phase B:
1. Login
2. Create Item
3. Pagination & Filters
4. Edit Item
5. Delete Item
6. Full E2E flow (Login → Create → Edit → Delete → Validate)

**What to automate:**
* Semantic locators (very important for interviews)
* Auto-wait & stability
* Modal handling
* Table scanning
* Filtering/pagination logic
* Error messages
* Negative scenarios
* Retry logic for flaky tests
* Browser matrix (Chrome + Firefox + WebKit)

**Depth Level:** High — this is your main automation selling point.

#### **✅ API Automation (Backend Testing)**
**What to test:**
* Authentication APIs
* CRUD operations (create/list/edit/delete)
* Pagination APIs
* Search/filter
* Error responses
* Negative tests
* Schema validations

**What to build:**
* Python API client or Playwright API client
* Separate API test suite
* Positive + Negative + Edge cases
* Payload validation
* Schema validation
* Setup/teardown API calls for UI tests
* Request/response logging

**Depth Level:** Medium-High — enough for interviews + real work.

#### **✅ End-to-End Automation**
* Combine UI + API
* E2E flow: login → create item → edit → delete → verify
* Cross-check DB via API (if available)
* Data setup via API and validate via UI
* Data cleanup via API

**Depth Level:** Medium — important, but not too heavy.

#### **✅ Real-World Automation Engineering**
* Parallel execution (workers)
* Multi-browser matrix (Chrome, Firefox, WebKit)
* CI pipeline (GitHub Actions preferred)
* Test retries
* Video/screenshot on failure
* HTML or Allure reports
* Git branching workflow (feature → PR → merge)
* Code review-friendly structure
* Handling flaky tests
* Stability optimizations

**Depth Level:** High — this is what makes your framework "real."

---

### **6.2 What Phase C MUST NOT Focus On (Out-of-Scope)**

#### **❌ Over-engineered patterns**
* No strategy/factory patterns unless required
* No dependency injection frameworks
* No too many helpers
* No dynamic test generation
* No unnecessary complexity

#### **❌ Visual testing**
* Not needed for resume
* Can add later if time permits

#### **❌ Dozens of artificial flows**
* Stick to the 6 flows from Phase B
* No complex user journeys outside Phase B scope

#### **❌ Mobile automation**
* Not in scope for Phase C
* Focus on web automation

#### **❌ Performance testing**
* JMeter, Locust — not needed
* Belongs to SDET Level 2

#### **❌ Security testing**
* Not in scope
* Belongs to specialized security testing

#### **❌ Microservices-level distributed testing**
* Not needed for your level
* Keep it simple

#### **❌ Container orchestration**
* Docker compose optional
* Kubernetes — not needed
* BrowserStack/SauceLabs — optional, only if time permits

#### **❌ Advanced infrastructure**
* No cloud infra like AWS/GCP (not needed for interview)
* No observability stack (ELK, Prometheus)
* No multi-service distributed tracing

---

## **7. Step-by-Step Flow of Phase C**

Phase C must be executed in the following order with exact depth requirements:

---

### **Step C1 — Framework Architecture Design**

**Depth Level Required:** **High**

**Goal:** Design the framework architecture before writing any code.

**What to learn/do:**
* Folder structure (how to organize tests, pages, api, utils, config)
* Naming conventions (how to name files, classes, functions)
* Layers (tests / pages / api / utils / config, separation of concerns)
* Logger structure (how logging is organized, log levels, log files)
* Test data strategy (how to manage test data, data-driven tests, test data isolation)
* Env setup (how to handle different environments, config files)
* POM architecture (BasePage + per-page classes, why POM exists)
* Fixtures design (pytest fixtures, custom fixtures, when to use)
* Tagging strategy (how to tag tests: smoke, regression, e2e)

**What NOT to do:**
* Don't write code yet (architecture first, code second)
* Don't skip architecture (code without architecture leads to problems)
* Don't over-engineer (keep it simple, no unnecessary patterns)
* Don't create complex folder structures (keep it maintainable)
* Don't add unnecessary abstractions (YAGNI principle)

**Deliverable:** Framework architecture document

**Validation:** Architecture must be reviewed and approved before coding.

---

### **Step C2 — Environment & Config Layer**

**Depth Level Required:** **Medium**

**Goal:** Build config system that supports multiple environments.

**What to learn/do:**
* Config loader (how to load config from files, environment variables)
* Env files (`.env` files, how to manage different environments)
* Base URLs (how to switch between dev/stage/prod URLs)
* Switching between envs (how to select environment, CLI parameters)
* CLI parameters (how to pass environment via command line)
* Config validation (how to validate config is correct)
* Secrets management (how to handle API keys, passwords safely)

**What NOT to do:**
* Don't hardcode URLs or credentials
* Don't commit secrets to Git
* Don't create overly complex config systems
* Don't skip environment validation

**Deliverable:** Working config system

**Validation:** Config system works, can switch between environments.

---

### **Step C3 — Utilities Layer**

**Depth Level Required:** **Medium**

**Goal:** Build reusable utilities that support tests.

**What to learn/do:**
* Logger (how to log test execution, log levels, log files)
* Retry helper (how to retry flaky operations, retry logic)
* Data generator (how to generate test data, random data, test data builders)
* Date utils (how to handle dates, timestamps, date formatting)
* JSON/YAML loader (how to load test data from files)
* File utilities (how to read/write files, file operations)
* String utilities (how to format strings, generate unique strings)
* Wait utilities (custom wait helpers, when to use)

**What NOT to do:**
* Don't create too many utilities (only what's needed)
* Don't duplicate Playwright functionality (use Playwright's built-in features)
* Don't create utilities that are used only once (reusability matters)
* Don't skip documentation (utilities must be documented)

**Deliverable:** Utilities module with reusable helpers

**Validation:** Utilities are modular, reusable, and documented.

---

### **Step C4 — Playwright Setup**

**Depth Level Required:** **High**

**Goal:** Set up Playwright infrastructure for UI automation.

**What to learn/do:**
* Base page class (common functionality, why it exists, inheritance pattern)
* Page object structure (how to organize page objects, per-page classes)
* Locator strategy (semantic locators, when to use each type, locator best practices)
* Wait strategy (how to handle waits, explicit waits, when to use auto-wait)
* Screenshot capturing (when to capture, how to configure, failure screenshots)
* Browser/context lifecycle management (how to manage browser instances, contexts, pages)
* Fixtures setup (pytest fixtures for browser, context, page)
* Browser options (headless, viewport, user agent, browser args)

**What NOT to do:**
* Don't use brittle locators (CSS/XPath that break easily)
* Don't skip semantic locators (critical for stability)
* Don't over-use explicit waits (let Playwright auto-wait when possible)
* Don't create too many browser instances (manage lifecycle properly)

**Deliverable:** Playwright infrastructure (BasePage, fixtures, config)

**Validation:** Playwright setup works, can create pages, locators work.

---

### **Step C5 — UI Test Suite**

**Depth Level Required:** **High**

**Goal:** Build UI automation tests for all 6 flows from Phase B.

**What to learn/do:**
* Test setup (pytest fixtures, before/after hooks, test isolation)
* Example UI tests (test all 6 flows: Login, Create, List, Edit, Delete, E2E)
* Navigations (how to navigate between pages, URL handling)
* Assertions (how to assert, what to assert, assertion best practices)
* Waits (how to wait for elements, when to use explicit waits)
* Reusability patterns (how to reuse code, avoid duplication)
* Semantic locators (use getByRole, getByLabel, getByText, getByTestId)
* Modal handling (how to handle modals, dialogs, popups)
* Table scanning (how to interact with tables, find rows, verify data)
* Filtering/pagination logic (how to test filters, pagination)
* Error message verification (how to verify error messages)
* Negative scenarios (test invalid inputs, error cases)

**What NOT to do:**
* Don't write tests without Page Objects (use POM)
* Don't use brittle locators (use semantic locators)
* Don't skip negative tests (they're important)
* Don't create flaky tests (ensure stability)
* Don't duplicate code (use Page Objects and utilities)

**Deliverable:** Complete UI test suite (all 6 flows automated)

**Validation:** All UI tests pass, tests are stable, use semantic locators.

---

### **Step C6 — API Client Layer**

**Depth Level Required:** **Medium-High**

**Goal:** Build API client for API automation.

**What to learn/do:**
* Base request class (common request functionality, why it exists)
* Request wrapper (how to wrap requests, add common headers, handle auth)
* Auth handling (how to handle JWT tokens, session cookies, token refresh)
* Schema validation (how to validate API responses against schemas)
* Error-handling logic (how to handle API errors, error responses)
* Request builder (how to build requests, add headers, params, body)
* Response parser (how to parse responses, extract data)
* Retry logic (how to retry failed requests)

**What NOT to do:**
* Don't hardcode API endpoints (use config)
* Don't skip error handling (APIs can fail)
* Don't forget auth (most APIs need authentication)
* Don't skip schema validation (ensures API contract)

**Deliverable:** API client module

**Validation:** API client works, can make requests, handles errors.

---

### **Step C7 — API Test Suite**

**Depth Level Required:** **Medium-High**

**Goal:** Build API automation tests for all Phase B endpoints.

**What to learn/do:**
* Success flows (test all positive scenarios)
* Failure flows (test all negative scenarios, error cases)
* Validation (test input validation, response validation)
* Edge cases (test boundary conditions, edge values)
* Negative tests (test invalid inputs, missing fields, unauthorized access)
* Schema validation (validate response structure, data types)
* Status code verification (verify correct HTTP status codes)
* Response time checks (optional, basic performance awareness)
* Data-driven tests (test with different data sets)

**What NOT to do:**
* Don't skip negative tests (they're critical)
* Don't forget edge cases (boundary testing is important)
* Don't skip schema validation (ensures API contract)
* Don't test only happy paths (test failures too)

**Deliverable:** Complete API test suite (all endpoints tested)

**Validation:** All API tests pass, cover positive + negative + edge cases.

---

### **Step C8 — Reporting**

**Depth Level Required:** **Medium**

**Goal:** Set up test reporting for visibility and debugging.

**What to learn/do:**
* Playwright HTML report (how to generate, configure, view reports)
* Pytest HTML report (how to generate HTML reports from pytest)
* Screenshot attachments (attach screenshots to reports, failure screenshots)
* Video capture (capture videos on failure, how to configure)
* Test metrics (pass rate, failure rate, execution time)
* Failure analysis (how to analyze failures from reports)

**What NOT to do:**
* Don't skip reporting (critical for debugging and interviews)
* Don't capture videos for all tests (only on failure, or it's too heavy)
* Don't forget screenshot attachments (very helpful for debugging)

**Deliverable:** Working reporting system

**Validation:** Reports generate correctly, include screenshots/videos, show metrics.

---

### **Step C9 — CI/CD Integration**

**Depth Level Required:** **High**

**Goal:** Set up CI/CD pipeline for automated test execution.

**What to learn/do:**
* GitHub Actions workflow (how to create workflow files, triggers)
* Steps: checkout → install → run UI tests → run API tests
* Parallel execution (how to run tests in parallel, workers)
* Test retries (how to retry failed tests)
* Artifact collection (how to collect reports, screenshots, videos)
* Environment setup (how to set up test environment in CI)
* Reproducibility (ensure tests run the same way every time)
* Fast feedback (optimize for speed, parallel execution)

**What NOT to do:**
* Don't skip CI/CD (critical for real-world SDET work)
* Don't create slow pipelines (optimize for speed)
* Don't forget artifact collection (reports must be accessible)
* Don't hardcode secrets (use GitHub Secrets)

**Deliverable:** Working CI/CD pipeline

**Validation:** CI pipeline runs successfully, tests execute, reports are generated.

---

### **Step C10 — Documentation**

**Depth Level Required:** **Low–Medium**

**Goal:** Create complete documentation for the framework.

**What to learn/do:**
* Full README (project overview, setup, how to run)
* Framework overview (architecture explanation, design decisions)
* Running instructions (how to run tests, command-line options)
* Folder-by-folder explanation (what each folder contains, why it exists)
* CI/CD explanation (how CI works, how to trigger, how to view results)
* Test execution guide (how to run specific tests, tags, filters)

**What NOT to do:**
* Don't skip documentation (critical for interviews and maintenance)
* Don't write incomplete docs (must be clear and complete)
* Don't forget architecture explanation (interviewers will ask)

**Deliverable:** Complete documentation set

**Validation:** Documentation is complete, clear, and sufficient for interviews.

---

## **8. Chain-of-Thought / Reasoning Rules for Phase C**

The AI must internally use:
* LLD reasoning (Low-Level Design)
* Architecture trade-off evaluation
* Maintainability checks
* Testability checks
* Readability checks
* Consistency validation

But must show:
* Only cleaned reasoning
* Only final actionable decisions

Not raw chain-of-thought.

---

## **9. Guardrails Against Hallucination**

AI must:
* Propose minimal known structures
* Justify libraries
* Avoid unknown tools
* Check consistency across layers
* Ask for confirmation before generating large files
* Avoid overly complex patterns

---

## **10. Phase C Completion Criteria**

Phase C is complete when:
* Framework architecture is stable and documented
* UI automation works (all 6 flows automated)
* API automation works (all endpoints tested)
* Utilities + config layers are complete
* Reporting works (HTML reports, screenshots, videos)
* CI pipeline runs successfully
* Project is fully documented
* User can explain the framework in interviews
* User understands every folder/layer

Only then:
→ Move to **Phase D (Interview Mastery).**

---

## **11. What Phase C Adds to the Résumé**

This phase adds a premium project:

### **Project: Full UI + API Automation Framework**

**Key Points:**
* Playwright (Python) with semantic locators
* POM design (Page Object Model architecture)
* API client design (Python Requests or Playwright API)
* Config layers (environment management)
* Utilities (reusable helpers)
* Logging (comprehensive logging system)
* Reporting (HTML reports, screenshots, videos)
* CI/CD pipeline (GitHub Actions)

This becomes your **primary SDET résumé highlight**.

---

## **12. Depth Summary**

### **Learn very deeply (High depth):**
* Test Architecture (C1)
* Playwright Setup (C4)
* UI Test Suite (C5)
* CI/CD Integration (C9)

### **Learn moderately (Medium depth):**
* Environment & Config (C2)
* Utilities Layer (C3)
* API Client Layer (C6)
* API Test Suite (C7)
* Reporting (C8)

### **Learn lightly (Low depth):**
* Documentation (C10)

### **Skip completely (for now):**
* Performance testing
* Security testing
* Visual testing
* Mobile automation
* Container orchestration
* Advanced infrastructure

---

## **13. What You WILL 100% Learn (Guaranteed Mastery)**

✔ Playwright automation (deep)
✔ API testing (deep enough for interviews)
✔ Framework architecture
✔ Parallel testing
✔ Multi-browser execution
✔ E2E flows
✔ Semantic locator strategy
✔ POM
✔ Logging + Reporting
✔ CI/CD
✔ Test data setup/teardown
✔ Test isolation
✔ Debugging and root cause analysis

This is exactly what companies expect for an SDET with 2.5–3.5 years experience.

---

## **14. Layer-Based Scope (Detailed Breakdown)**

Think of Phase C as testing FlowHub Core like a real company would test a real application.

### **LAYER 1 — Test Architecture (Framework Skeleton)**

**What we do:**
✔ Finalize folder structure
✔ Implement POM architecture (BasePage + per-page classes)
✔ Add fixtures (`test`, `page`, custom fixtures)
✔ Add config system (`dev`, `stage`, `prod`)
✔ Base test setup (beforeEach, environment setup)
✔ Centralized utilities (helpers, formatters, API client)
✔ Logging setup (console + file logs)
✔ Screenshots & video capture config
✔ Tagging tests (smoke, regression, e2e)

**Depth Level:** High — because this defines your "SDET identity." You must explain this in interviews.

**What we do NOT do:**
❌ No over-engineered patterns (no strategy/factory patterns unless required)
❌ No multi-language framework
❌ No Docker containers (optional for Phase C)
❌ No cloud infra like AWS/GCP (not needed for interview)

---

### **LAYER 2 — UI Automation (Playwright)**

**What we automate:**
We take the 6 core flows from Phase B and automate them:
1. Login
2. Create Item
3. Pagination & Filters
4. Edit Item
5. Delete Item
6. Full E2E flow (Login → Create → Edit → Delete → Validate)

**What we do:**
✔ Semantic locators (very important for interviews)
✔ Auto-wait & stability
✔ Modal handling
✔ Table scanning
✔ Filtering/pagination logic
✔ Error messages
✔ Negative scenarios
✔ Retry logic for flaky tests
✔ Browser matrix (Chrome + Firefox + WebKit)

**Depth Level:** High — this is your main automation selling point.

**What we do NOT do:**
❌ No visual testing (not needed for resume)
❌ No dozens of artificial flows
❌ No complex user journeys outside our Phase B scope
❌ No mobile automation

---

### **LAYER 3 — API Automation (Backend Testing)**

**What we test:**
* Authentication APIs
* CRUD operations (create/list/edit/delete)
* Pagination APIs
* Search/filter
* Error responses
* Negative tests
* Schema validations

**What we do:**
✔ Build Python API client or Playwright API client
✔ Write separate API test suite
✔ Positive + Negative + Edge cases
✔ Payload validation
✔ Schema validation
✔ Setup/teardown API calls for UI tests
✔ Request/response logging

**Depth Level:** Medium-High — enough for interviews + real work.

**What we do NOT do:**
❌ No microservices-level distributed testing
❌ No performance testing
❌ No security testing
❌ No load testing
❌ No multi-tenant complex API scenarios

---

### **LAYER 4 — End-to-End Automation**

**What we do:**
✔ Combine UI + API
✔ E2E flow: login → create item → edit → delete → verify
✔ Cross-check DB via API (if available)
✔ Data setup via API and validate via UI
✔ Data cleanup via API

**Depth Level:** Medium — important, but not too heavy.

**What we do NOT do:**
❌ No ultra-heavy multi-step flows
❌ No domain-specific business simulations
❌ No integration with external tools

---

### **LAYER 5 — Real-World Automation Engineering**

**What we do:**
✔ Parallel execution (workers)
✔ Multi-browser matrix (Chrome, Firefox, WebKit)
✔ CI pipeline (GitHub Actions preferred)
✔ Test retries
✔ Video/screenshot on failure
✔ HTML or Allure reports
✔ Git branching workflow (feature → PR → merge)
✔ Code review-friendly structure
✔ Handling flaky tests
✔ Stability optimizations

**Depth Level:** High — this is what makes your framework "real."

**What we do NOT do:**
❌ No container orchestration (Docker compose optional)
❌ No Kubernetes
❌ No cross-device testing
❌ No BrowserStack/SauceLabs (optional, only if time permits)

---

### **LAYER 6 — Interview Presentation Prep (Extra Critical)**

**What we do:**
✔ Prepare 2–3 "Framework Explanation Scripts"
✔ Prepare "Design Decisions Justification"
✔ Prepare "How I ensure stability" answers
✔ Prepare "How I handle flaky tests"
✔ Prepare "Parallel execution + fixtures explanation"
✔ Prepare "Semantic locators vs brittle locators explanation"
✔ Prepare "API automation design explanation"

**What we do NOT do:**
❌ We do NOT memorize buzzwords
❌ We do NOT fake microservices knowledge
❌ We do NOT pretend to handle security/performance levels

---

## **15. Overall Depth Summary Table**

| Layer                 | Depth       | Why                       |
| --------------------- | ----------- | ------------------------- |
| Test Architecture     | High        | Interview core            |
| UI Automation         | High        | Your strongest skill      |
| API Automation        | Medium-High | Completes SDET profile    |
| E2E                   | Medium      | Shows real-world thinking |
| Real-world Automation | High        | Makes you look senior     |
| Interview Prep        | High        | Converts skills → job     |

---

# ✔ END OF PHASE C MASTER DOCUMENT (v1.0)
