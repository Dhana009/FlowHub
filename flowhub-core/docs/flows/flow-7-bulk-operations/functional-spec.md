# Functional Specification: Flow 7 - Bulk Operations

**Version:** 1.1 (Updated)  
**Status:** ✅ FINALIZED  
**Implementation Strategy:** Lazy processing via HTTP Polling with Atomic Locking

---

## 1. Overview
This document defines the technical implementation of bulk operations (Deactivate and Activate) in FlowHub Core. It is designed to work in serverless environments by utilizing a "request-triggered" background job simulation.

## 2. API Endpoints

### 2.1 Start Bulk Job
- **Endpoint:** `POST /api/v1/bulk-operations`
- **Auth:** Required (JWT)
- **Roles:** ADMIN, EDITOR
- **Request Body:**
  ```json
  {
    "operation": "activate" | "deactivate",
    "item_ids": ["id1", "id2", ...]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "job_id": "job_uuid_123",
    "job_progress": 20 // Initial progress from skipped items
  }
  ```

### 2.2 Poll Job Status
- **Endpoint:** `GET /api/v1/bulk-operations/:jobId`
- **Auth:** Required (JWT)
- **Technical Logic (Lazy Processing):** 
  Every time this endpoint is called, the server will process the next **2 items** in the queue before responding.
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "status": "processing" | "completed",
      "progress": 60,
      "summary": {
        "total": 10,
        "success": 4,
        "failed": 2
      },
      "skippedIds": ["id_1", "id_2"],
      "failures": [
        { "id": "id_99", "error": "Item busy (version conflict)" }
      ]
    }
  }
  ```

---

## 3. Database Schema (MongoDB)

### Collection: `BulkJob`
- `userId`: ObjectId (Owner of the job)
- `operation`: String (`activate`, `deactivate`)
- `itemIds`: Array of ObjectIds (Items to be processed)
- `inProgressIds`: Array of ObjectIds (Items currently being processed - Atomic Lock)
- `processedIds`: Array of ObjectIds (Successfully processed)
- `skippedIds`: Array of ObjectIds (Already in state or inaccessible)
- `failedItems`: Array of Objects `{ id, error }`
- `totalItems`: Number (Original count)
- `progress`: Number (0-100)
- `status`: String (`pending`, `processing`, `completed`)
- `createdAt`: Date (TTL index: Auto-delete after 24 hours)

---

## 4. Technical Mechanisms

### 4.1 Atomic Locking (Concurrency Control)
To prevent multiple requests from processing the same item (dual-poll race condition), we use MongoDB's `$addToSet` and `$pull` on the `inProgressIds` array. A request must "claim" an item by adding its ID to this array before processing.

### 4.2 Pre-Execution Analysis
On job creation, the system performs a bulk query to find:
1.  **Inaccessible Items:** IDs provided that don't belong to the user (unless Admin).
2.  **Redundant Items:** Items already in the target state.
These are moved to `skippedIds` immediately.

### 4.3 Self-Healing Engine
If a server crashes while processing, items remain in `inProgressIds`. On the next poll, if `updatedAt` is > 10s old, the system reclaims one "zombie" item for processing.

---

## 5. UI Logic (Frontend)

### 5.1 Selection Bar (`BulkActionsBar.jsx`)
- Floating bar appearing when `selectedItems.length > 0`.
- Buttons: [Bulk Deactivate] [Bulk Activate].

### 5.2 Processing Modal (`BulkOperationModal.jsx`)
- **Polling Loop:** Recursive `setTimeout` every 2 seconds.
- **Progress Bar:** High-fidelity component with inner shadow and gradient.
- **Summary Report:** Transparent breakdown of Success, Skipped, and Failed items.

---

## 6. SDET Integration
This flow is the primary showcase for **Asynchronous Synchronization** testing. Automation must use polling assertions and network interception to validate partial failure scenarios.
