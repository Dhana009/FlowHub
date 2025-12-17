# PRD: Flow 7 - Bulk Operations (The Scale & Efficiency Flow)

**Version:** 1.0 (Initial Draft)  
**Status:** 🏗️ DRAFTING  
**SDET Value:** HIGH (Covers Polling, Scale, and Resilience)

---

## 1. Overview
FlowHub users need a way to manage large datasets without modifying items one by one. This flow allows users to select multiple items and perform "Bulk Delete" or "Bulk Category Update." 

To work within **free-tier limits (Vercel/Render)**, this flow uses **HTTP Polling**. The UI will "ask" the server for status updates rather than maintaining a constant WebSocket connection.

---

## 2. User Story
**As a** power user with many items,  
**I want to** update or delete multiple items at once,  
**So that** I can save time and keep my workspace organized.

---

## 3. User Journey

### Phase 1: Selection
1. User navigates to the **Item List**.
2. User selects multiple items via **checkboxes** in each row.
3. A **Bulk Actions Bar** appears at the top (or bottom) showing the count: *"3 items selected"*.
4. User clicks **"Bulk Delete"** or **"Update Category"**.

### Phase 2: Configuration & Confirmation
1. **If Bulk Delete:** A confirmation modal appears: *"Are you sure you want to delete 3 items?"*
2. **If Bulk Update:** A modal appears asking the user to select the **New Category**.
3. User clicks **"Start Process"**.

### Phase 3: Processing (The Polling Phase)
1. The modal changes to a **Progress State**.
2. A **Progress Bar** appears (0%).
3. The frontend calls the API to start the job and receives a `job_id`.
4. **Polling starts:** Every 2 seconds, the frontend calls `/api/bulk-operations/{job_id}/status`.
5. The Progress Bar updates (e.g., 33% -> 66% -> 100%).

### Phase 4: Completion & Summary
1. Once polling returns `completed`, the modal shows a **Summary Report**:
   - ✅ **Success:** Count of successful items.
   - ❌ **Failed:** Count of failed items (if any).
2. User clicks "Close" and the Item List **automatically refreshes**.

---

## 4. Technical Logic (Polling Strategy)

### API Endpoints:
1.  `POST /api/bulk-operations`: Starts the job. Returns `job_id`.
2.  `GET /api/bulk-operations/{job_id}/status`: Returns the current progress.
    ```json
    {
      "status": "processing",
      "progress_percent": 60,
      "completed_count": 6,
      "total_count": 10,
      "failed_items": []
    }
    ```

### Error Handling:
-   **Partial Failure:** If 10 items are selected and 1 fails, the job continues. The final report will show 9 success and 1 failure.
-   **Timeout:** If polling takes longer than 60 seconds, the frontend shows a "Taking longer than expected" message with a retry option.

---

## 5. SDET Showcase (The Automation Plan)

When we automate this, we will write **3 specific tests** that will look amazing on your resume:

1.  **The "Async Polling" Test:** Use Playwright’s `expect.poll()` to wait for the progress bar to reach 100% without using a single `sleep()`.
2.  **The "Partial Failure" Test:** Use `page.route()` to intercept the polling API and **inject a failure** for one item. Verify that the UI correctly shows *"1 item failed"*.
3.  **The "Data Integrity" Test:** 
    - Create 20 items via API.
    - Bulk Delete them via UI.
    - Call the API one last time to verify the total count is exactly 0.

---

## 6. Out of Scope
-   Bulk Edit of descriptions (only Category and Delete for now).
-   Bulk File Upload (too complex for free tier).
-   Canceling a job halfway (we will add this in Phase C if needed).

---

**Next Step:** I will now create the Functional Specification (FS) for the backend developers (you!) to implement these endpoints. Shall we proceed?

