# **UI Journey Catalog: Playwright Automation Guide**

**Target Audience:** SDET / UI Automation Engineers  
**Frontend URL:** `https://testing-box.vercel.app`

---

## **Journey 1: The New User Onboarding (End-to-End)**
*   **Persona:** New Customer
*   **Flow:** Landing → Signup Form → Request OTP → **Backdoor GET /otp** → Verify OTP → Dashboard.
*   **Key Assertions:**
    *   Validation messages for weak passwords.
    *   Toast success on account creation.
    *   Redirection to `/dashboard`.

## **Journey 2: Granular RBAC Masking (Security)**
*   **Persona:** `VIEWER` Role
*   **Flow:** Login as Viewer → Navigate to Items Table.
*   **Key Assertions:**
    *   "Create Item" button must NOT exist.
    *   "Edit" and "Deactivate" buttons in the table must be hidden.
    *   Attempting to visit `/items/create` via URL should snap back to `/dashboard`.

## **Journey 3: Conditional Form Logic (Dynamic UI)**
*   **Persona:** `EDITOR` Role
*   **Flow:** Click "Create Item" → Select "Physical" → Verify weight/dimension fields appear → Select "Digital" → Verify URL/File size fields appear.
*   **Key Assertions:**
    *   UI state changes instantly based on dropdown selection.
    *   Schema error toasts if "Physical" is selected but dimensions are empty.

## **Journey 4: The Bulk Control Plane (Async UI)**
*   **Persona:** `ADMIN` Role
*   **Flow:** Select 5 items → Click "Bulk Deactivate" → Watch Progress Bar → Wait for Completion.
*   **Key Assertions:**
    *   Progress bar increments from 0% to 100%.
    *   "Bulk Operation Success" toast appears.
    *   Items in table update status to "Inactive" without page refresh.

---

## **Selector Strategy**
We use `data-testid` for ALL interactive elements.
*   **Generic:** `[data-testid="item-name"]`
*   **Dynamic Rows:** `[data-testid="item-row-{id}"]`
*   **Action Specific:** `[data-testid="edit-item-{id}"]`

