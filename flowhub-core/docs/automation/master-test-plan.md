# **FlowHub Core: Master Automation Strategy & Test Plan**

**Version:** 1.1 (Updated)  
**Status:** ✅ FINALIZED  
**Objective:** Architect a high-scale, multi-layered automation suite (500+ cases) to showcase Senior SDET Lead expertise.

---

## **1. Executive Summary**
This document defines the end-to-end automation strategy for FlowHub Core. Instead of basic "UI clicking," this plan utilizes a **Shift-Left** approach, combining API-level logic verification with high-fidelity UI synchronization tests. It is designed to handle **Real-World Senior Pain Points** like asynchronous polling, concurrency race conditions, and granular RBAC security.

---

## **2. The Testing Pyramid (Architectural Distribution)**

| Layer | Weight | Focus Area | Tools |
| :--- | :---: | :--- | :--- |
| **UI (E2E)** | 20% | User journeys, Visual regression, RBAC Masking, Async UI. | Playwright |
| **API (Integration)** | 50% | Business rules, Data integrity, Error codes, Permission Matrix. | Playwright API / Axios |
| **Component/Unit** | 30% | Input validation, Modal state machines, Form behavior. | Vitest / Playwright |

---

## **3. Test Case Volume Breakdown (Reaching 500+)**

To achieve the 500+ goal, we use a **Combinatorial Matrix**. Instead of 500 individual scripts, we build smart engines that iterate through datasets.

| Journey ID | E2E (UI) Cases | API Logic Cases | Total | Showcase Detail |
| :--- | :---: | :---: | :---: | :--- |
| **E2E-01: Onboarding** | 15 | 25 | **40** | Field validation (Name regex, Password strength). |
| **E2E-02: Productivity** | 40 | 60 | **100** | **Search/Filter Matrix**: 6 Cats x 3 Status x 5 Sorts. |
| **E2E-03: Scale Cleanup** | 20 | 30 | **50** | **State Machine**: Mixed batches (Success/Skip/Fail). |
| **E2E-04: Security (RBAC)** | 60 | 120 | **180** | **Permission Matrix**: 3 Roles x 15 Features x (Allow/IDOR). |
| **E2E-05: Observability** | 30 | 40 | **70** | **Event Correlation**: UI Action → API Log Verification. |
| **E2E-06: Recovery** | 10 | 20 | **30** | OTP expiry, Resend logic, Rate limits. |
| **Global Integrity** | 0 | 30 | **30** | Schema validation, XSS, DB constraints. |
| **TOTAL** | **175** | **325** | **500+** | |

---

## **4. Hybrid API Testing Strategy**

We utilize a dual-mode approach to simulate an enterprise-grade automation environment:

### **Mode A: Playwright Inbuilt (`request`)**
*   **Purpose:** **Utility & State Setup.**
*   **Usage:** Used *inside* UI tests for "Instant Setup" (e.g., seeding 20 items before a Bulk test) or verifying background state.
*   **Benefit:** Native synchronization between the browser context and API.

### **Mode B: Structured API Framework (Axios/Dedicated)**
*   **Purpose:** **Hard Regression & Security.**
*   **Usage:** Standalone testing of endpoints. This is where we run the **120+ RBAC checks** and **IDOR attacks** at high speed.
*   **Benefit:** Execution speed (200 API tests in < 15s) and independent scalability.

---

## **5. Integration Points (The Senior Layer)**

We focus on validating the "seams" where the UI and API layers interact:
1.  **State Sync:** Verifying that a manual API modification instantly invalidates the UI's **Optimistic Lock** (version conflict).
2.  **Token Resilience:** Manually expiring a JWT via API and verifying the UI performs a **Silent Refresh** without user logout.
3.  **Cross-Session Revocation:** Admin deactivating a user via API; the user's active UI session must return 401/403 on the very next action.

---

## **6. Playwright E2E User Flows (The User Journeys)**

While the API handles the logic, Playwright focuses on these **6 Critical User Journeys**.

| Journey ID | Flow Name | Description | Key Playwright Skill |
| :--- | :--- | :--- | :--- |
| **E2E-01** | **The Onboarding Journey** | Signup (3-step) → Login → Dashboard → Create first item. | Multi-page navigation & redirect validation. |
| **E2E-02** | **The Productivity Loop** | Dashboard → Search → Filter → View Details → Edit → Refresh. | Complex UI synchronization & Modal states. |
| **E2E-03** | **The Scale Cleanup** | Select 20 items → Bulk Deactivate → Monitor Progress → Verify. | **Async Polling** & progress bar validation. |
| **E2E-04** | **The Security Boundary** | Admin Login → Demote Editor → Login as Editor → Verify Masking. | **Multi-Browser Contexts** (Side-by-side roles). |
| **E2E-05** | **The Observability Audit** | Action → Navigate to Activity Logs → Verify correlation. | Table data verification & Event correlation. |
| **E2E-06** | **The Credential Recovery** | Forgot Password → OTP flow → Reset → Login. | Email/OTP flow simulation. |

---

## **7. Automation Infrastructure (Internal APIs)**

To support a 500+ case suite with zero flakiness, we have implemented a dedicated **Automation Control Plane**. These endpoints work in both Dev and Prod but are secured via a **Safety Key**.

| Hook Name | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| **Global Reset** | `POST /internal/reset` | Wipes all DB collections for a clean test start. | `X-Internal-Key` required. |
| **OTP Fetch** | `GET /internal/otp` | Returns the latest active OTP for a given email. | `X-Internal-Key` required. |
| **Fast Seed** | `POST /internal/seed` | Instantly injects 50-100 items into the DB. | `X-Internal-Key` required. |

---

## **8. Framework Technical Stack**
*   **Engine:** Playwright (Node.js)
*   **Pattern:** Page Object Model (POM) + Component-based decomposition.
*   **Reporting:** Allure / HTML Reporter with Trace & Video capture.
*   **CI/CD:** GitHub Actions with parallel execution (4-8 Workers).

---

## **9. Success Metrics**
*   **Execution Time:** < 5 minutes for 500+ cases (Parallelized).
*   **Flakiness Rate:** < 1% (Zero `sleep()`, all Web-First Assertions).
*   **Traceability:** 1:1 mapping between Test IDs and PRD Requirements.
