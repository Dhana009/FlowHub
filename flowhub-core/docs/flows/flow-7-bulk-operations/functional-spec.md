# Functional Specification: Flow 7 - Bulk Operations

**Version:** 1.0  
**Status:** ✅ FINALIZED  
**Implementation Strategy:** Lazy processing via HTTP Polling

---

## 1. Overview
This document defines the technical implementation of bulk operations (Delete and Update) in FlowHub Core. It is designed to work in serverless environments (Vercel) by utilizing a "request-triggered" background job simulation.

## 2. API Endpoints

### 2.1 Start Bulk Job
- **Endpoint:** `POST /api/v1/bulk-operations`
- **Auth:** Required (JWT)
- **Request Body:**
  ```json
  {
    "operation": "delete" | "update_category",
    "item_ids": ["id1", "id2", ...],
    "payload": { "category": "Electronics" } // Only for update
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "job_id": "job_uuid_123",
    "status": "pending",
    "total_items": 10
  }
  ```

### 2.2 Poll Job Status
- **Endpoint:** `GET /api/v1/bulk-operations/:jobId`
- **Auth:** Required (JWT)
- **Technical Logic (Lazy Processing):** 
  Every time this endpoint is called, the server will process the next **2 items** in the queue before responding. This simulates progress over time.
- **Response (200 OK):**
  ```json
  {
    "status": "processing" | "completed",
    "progress": 60,
    "summary": {
      "total": 10,
      "success": 6,
      "failed": 0
    },
    "failures": [
      { "id": "id_99", "error": "Item not found" }
    ]
  }
  ```

---

## 3. Database Schema (MongoDB)

### Collection: `bulk_jobs`
- `_id`: ObjectId
- `userId`: ObjectId (Owner of the job)
- `operation`: String
- `itemIds`: Array of ObjectIds
- `processedIds`: Array of ObjectIds (Successfully processed)
- `failedItems`: Array of Objects `{ id, error }`
- `status`: String (`pending`, `processing`, `completed`)
- `createdAt`: Date (TTL index: Auto-delete after 24 hours)

---

## 4. UI Components

### 4.1 Selection Bar
- A floating bar that appears when `selectedItems.length > 0`.
- Shows count: "X items selected".
- Buttons: [Bulk Delete] [Bulk Update].

### 4.2 Processing Modal
- **State 1: Progress.** Shows a progress bar linked to the `progress` field from the API.
- **State 2: Results.** Shows a summary of success vs. failure.
- **Polling Loop:**
  - Uses `setTimeout` recursively (safer than `setInterval`).
  - Interval: 2 seconds.
  - Stops when `status === 'completed'`.

---

## 5. Automation Showcase Points (For Resume)

| Feature | Automation Challenge | Senior SDET Skill |
| :--- | :--- | :--- |
| **Polling Loop** | Synchronizing test with a 0-100% bar. | Use Playwright `expect.poll()` with custom intervals. |
| **Partial Failure** | Injecting a 500 error for 1 specific item ID. | Use `page.route()` to modify API response JSON on the fly. |
| **Data Scale** | Deleting 50 items at once. | Write a loop to verify database state for all 50 IDs. |

---

## 6. Error Handling
- **Invalid IDs:** If an ID in the list is invalid, add it to `failedItems` and continue.
- **Unauthorized:** Users can only poll jobs they created.
- **Serverless Timeout:** If processing takes too long (>10s), the server returns the current state and lets the next poll continue the work.

