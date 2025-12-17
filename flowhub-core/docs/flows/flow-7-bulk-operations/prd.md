# PRD: Flow 7 - Bulk Operations (The Scale & Efficiency Flow)

**Version:** 1.1 (Updated)  
**Status:** ✅ FINALIZED  
**SDET Value:** HIGH (Covers Polling, Scale, Resilience, and Concurrency)

---

## 1. Overview
FlowHub users need a way to manage large datasets without modifying items one by one. This flow allows users to select multiple items and perform **"Bulk Deactivate"** or **"Bulk Activate"**.

To work within **free-tier limits (Vercel/Render)**, this flow uses **Lazy processing via HTTP Polling**. The server processes a small batch of items during each status check, avoiding long-running request timeouts.

---

## 2. User Journey

### Phase 1: Selection
1. User navigates to the **Item List**.
2. User selects multiple items via **checkboxes**.
3. A **Bulk Actions Bar** appears at the bottom showing the count: *"3 items selected"*.
4. User clicks **"Bulk Deactivate"** or **"Bulk Activate"**.

### Phase 2: Processing (The Polling Phase)
1. The **Bulk Operation Modal** appears.
2. A **Progress Bar** (h-3, indigo) appears.
3. **Pre-Execution Analysis:** The system immediately identifies items already in the target state and marks them as "Skipped." The progress bar jumps forward instantly to reflect this.
4. **Polling starts:** Every 2 seconds, the frontend calls the status API.
5. The Progress Bar updates smoothly (e.g., 33% -> 66% -> 100%) as items are processed in batches of 2.

### Phase 3: Completion & Summary
1. Once polling returns `completed`, the modal shows a **Transparent Summary Report**:
   - ✅ **Actually Updated:** Count of items that changed state.
   - ⏭️ **Already in State (Skipped):** Count of items that were already correct.
   - ❌ **Failed:** Count of failed items with specific error details.
2. User clicks **"Done"** and the Item List **automatically refreshes**.

---

## 3. Technical Architecture (Resilience & Scalability)

### 3.1 Lazy Processing Strategy
Instead of a single long request, processing is distributed across multiple polling requests. Each `GET /status` request claims and processes **2 items**.

### 3.2 Concurrency & Safety
*   **Hard-Locking Atomic Queue:** Uses MongoDB `$addToSet` and `$pull` on an `inProgressIds` array to ensure no item is ever processed twice, even with aggressive polling.
*   **Idempotency:** Operations are success-oriented. If an item is already deactivated, a "Deactivate" request is considered a success (skipped), not a failure.
*   **Self-Healing Engine:** If an item gets stuck in `inProgressIds` (e.g., due to a server crash), the system automatically reclaims and re-processes it after a 10-second timeout.
*   **Security Deadlock Prevention:** If an Editor provides IDs of items they don't own, the system immediately marks them as "Skipped" (Inaccessible) to allow the job to complete while maintaining data isolation.

---

## 4. SDET Showcase (The Automation Plan)

1.  **The "Async Polling" Test:** Use Playwright’s `expect.poll()` to wait for 100% completion without using fixed `sleep()`.
2.  **The "Partial Failure" Test:** Use `page.route()` to inject a `500` error for one specific item ID and verify the failure report.
3.  **The "Race Condition" Test:** Trigger two polling loops simultaneously and verify that no item is processed twice (Atomic check).
4.  **The "Security Boundary" Test:** Try to include an Admin's item ID in an Editor's bulk job and verify it is correctly "Skipped" and not modified.

---

## 5. Success Criteria
*   Jobs reach 100% completion even if some items fail or are inaccessible.
*   Progress bar reflects real-time status accurately.
*   Database state matches the final summary report perfectly.
