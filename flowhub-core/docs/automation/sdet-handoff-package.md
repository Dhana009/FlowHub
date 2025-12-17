# **SDET Handoff Package: FlowHub Core Testability Contract**

**Version:** 1.0  
**Status:** ✅ READY FOR AUTOMATION  
**Role:** Developer to Tester Handover

---

## **1. Automation Control Plane (The "Setup" Layer)**
The framework should call these endpoints via an API client *before* or *after* UI interactions to ensure deterministic state.

### **Authentication & Safety**
*   **Base URL:** `http://localhost:3000/api/v1`
*   **Header Required:** `X-Internal-Key: flowhub-secret-automation-key-2025`

### **Endpoints**
| Purpose | Method | Path | Payload / Notes |
| :--- | :--- | :--- | :--- |
| **Clean Slate** | `POST` | `/internal/reset` | Wipes ALL data. Use in `globalSetup`. |
| **Get Secret OTP** | `GET` | `/internal/otp?email={e}` | Returns `{ otp: "123456" }`. No more reading logs. |
| **Instant Data** | `POST` | `/internal/seed` | `{ userId: "...", count: 50 }`. Injects items in < 1s. |

---

## **2. Selector Strategy (`data-testid`)**
We follow a **Functional Naming Convention** for all test IDs. 

### **Standard Patterns:**
*   **Buttons:** `data-testid="{action}-button"` (e.g., `create-item-button`)
*   **Inputs:** `data-testid="{field}-input"` (e.g., `email-input`)
*   **Tables:** `data-testid="items-table"`
*   **Rows:** `data-testid="item-row-{id}"`
*   **Toasts:** `data-testid="toast-{type}"` (success, error, info)

---

## **3. Machine-Readable Error Contract**
For negative testing, do NOT assert on string messages (they change). Assert on these stable **`error_code`** values:

| Scenario | HTTP Code | `error_code` / `error_type` |
| :--- | :---: | :--- |
| **Invalid Login** | 401 | `Unauthorized` |
| **Account Locked** | 401 | `Unauthorized - Account Locked` |
| **Duplicate Item** | 409 | `CONFLICT_ERROR` |
| **Version Conflict** | 409 | `VERSION_CONFLICT` |
| **RBAC Violation** | 403 | `Forbidden` |
| **IDOR / Not Found** | 404 | `Not Found` |

---

## **4. State Machine Observability**
For Flow 7 (Bulk Operations), the framework must poll the status.

### **Polling Response Schema:**
```json
{
  "status": "success",
  "data": {
    "status": "processing" | "completed",
    "progress": 0-100,
    "summary": { "total": X, "success": Y, "failed": Z },
    "skippedIds": [],
    "failures": [{ "id": "...", "error": "..." }]
  }
}
```
**Tester Note:** The progress bar in the UI is linked directly to the `progress` integer. Use Playwright `expect.poll` to await `status === 'completed'`.

---

## **5. Known "Pain Points" for Automation**
*   **Silent Refresh:** The app calls `/auth/refresh` on every page load. Intercept this in Playwright to mock session expiry.
*   **Debounced Search:** The search box has a **300ms debounce**. Ensure your tests wait for the API call to trigger after typing.
*   **Modals:** All modals use a **300ms transition**. Use Web-First assertions (`toBeVisible()`) to handle the animation delay automatically.

