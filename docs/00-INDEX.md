# System Contract Documentation
## Backend & Frontend Reference for Web Automation

**Version:** 1.3  
**Last Updated:** 2025-01-05  
**Source:** Extracted directly from codebase (`flowhub-core/`)

This document captures the **complete system contract** extracted directly from the codebase.
It defines backend APIs, authentication, authorization, data schemas, UI behavior, and test hooks.

**There are no assumptions in this document.**  
This is the authoritative reference for automation framework design.

---

## Document Structure

This documentation is organized by feature into separate files:

### 📄 [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)
**Complete Authentication APIs with Request/Response Schemas**
- POST /auth/login
- POST /auth/refresh
- GET /auth/me ⭐ **Checkpoint endpoint**
- POST /auth/logout
- POST /auth/signup/request-otp
- POST /auth/signup/verify-otp
- POST /auth/signup
- POST /auth/forgot-password/request-otp
- POST /auth/forgot-password/verify-otp
- POST /auth/forgot-password/reset
- Token lifecycle and authentication model

### 📄 [02-ITEMS.md](./02-ITEMS.md)
**Complete Item APIs with Request/Response Schemas**
- POST /items (Create)
- GET /items (List with query params)
- GET /items/:id (Get single)
- PUT /items/:id (Update)
- DELETE /items/:id (Soft delete)
- PATCH /items/:id/activate (Activate)
- Ownership & authorization rules

### 📄 [03-INTERNAL.md](./03-INTERNAL.md)
**Internal/Automation Endpoints**
- POST /api/v1/internal/reset
- POST /api/v1/internal/seed
- GET /api/v1/internal/otp
- DELETE /api/v1/internal/users/:userId/data ⭐ **User data cleanup**
- GET /health

### 📄 [04-FRONTEND.md](./04-FRONTEND.md)
**Frontend UI Contracts**
- API usage map (which APIs each page calls)
- Role-based UI behavior (ADMIN, EDITOR, VIEWER)
- Routing & navigation
- UI test identifiers (all `data-testid` attributes)
- Iframe behavior

### 📄 [05-SCHEMAS.md](./05-SCHEMAS.md)
**Complete Data Schemas**
- Item model schema (all fields, constraints, defaults)
- Conditional fields by item_type
- Test data identification methods
- Minimal valid payload examples

### 📄 [06-REMAINING-QUESTIONS.md](./06-REMAINING-QUESTIONS.md)
**Framework Design Questions - Answered**
- Refresh token race conditions & rotation
- Bulk operations completion guarantees
- Internal reset vs DB reset preference
- Soft-deleted items visibility rules
- Iframe instability expectations
- User deactivation edge cases

### 📄 [07-FLOW2-UI-SELECTORS.md](./07-FLOW2-UI-SELECTORS.md)
**Flow 2: Create Item - UI Selectors Reference**
- Complete locator guide for Create Item page
- All `data-testid` attributes and CSS selectors
- Conditional fields (PHYSICAL, DIGITAL, SERVICE)
- File upload selectors
- Success/error handling verification

### 📄 [08-FLOW3-UI-SELECTORS.md](./08-FLOW3-UI-SELECTORS.md)
**Flow 3: Search & Discovery - UI Selectors Reference**
- Complete locator guide for Items page
- Search, filter, sort, pagination selectors
- Table rows and cell selectors
- Deterministic wait attributes
- Backend API query parameters
- Auto-refresh behavior

### 📄 [09-BACKEND-QA-FLOW3.md](./09-BACKEND-QA-FLOW3.md)
**Backend Q&A - Flow 3 Testing Issues**
- Category-item type compatibility rules
- RBAC filtering behavior (who sees what)
- Category normalization and validation
- Default pagination values
- Seed data creation fixes

### 📄 [10-SEED-DATA-MANAGEMENT.md](../flowhub-core/docs/automation/SEED_DATA_MANAGEMENT.md)
**Complete Seed Data Management Guide**
- Answers to all 7 categories of seed data questions
- Endpoint documentation with request/response schemas
- Performance optimization strategies
- Version management and schema migration
- Implementation examples and best practices

### 📄 [11-SEED-DATA-AGENT-INSTRUCTIONS.md](../flowhub-core/docs/automation/SEED_DATA_AGENT_INSTRUCTIONS.md)
**Quick Reference for Test Automation Agents**
- Recommended approach for seed data verification
- Step-by-step implementation guide
- Key concepts (identification, versioning, idempotency)
- Available endpoints summary
- Implementation checklist

### 📄 [12-TEST-DATA-CLEANUP.md](../flowhub-core/docs/automation/TEST_DATA_CLEANUP.md)
**Test Data Cleanup & Hard Delete - Complete Answers**
- Hard delete vs soft delete behavior
- Bulk delete operations
- Test data identification methods
- Cleanup endpoints and strategies
- Performance considerations
- Environment-specific behavior
- Implementation recommendations

---

## Quick Reference

### All Endpoints

**Authentication:**
- `POST /api/v1/auth/login` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)
- `POST /api/v1/auth/refresh` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)
- `GET /api/v1/auth/me` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md) ⭐ **Checkpoint endpoint**
- `POST /api/v1/auth/logout` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)
- `POST /api/v1/auth/signup/request-otp` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)
- `POST /api/v1/auth/signup/verify-otp` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)
- `POST /api/v1/auth/signup` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)
- `POST /api/v1/auth/forgot-password/request-otp` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)
- `POST /api/v1/auth/forgot-password/verify-otp` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)
- `POST /api/v1/auth/forgot-password/reset` → [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)

**Items:**
- `POST /api/v1/items` → [02-ITEMS.md](./02-ITEMS.md)
- `GET /api/v1/items` → [02-ITEMS.md](./02-ITEMS.md)
- `GET /api/v1/items/:id` → [02-ITEMS.md](./02-ITEMS.md)
- `PUT /api/v1/items/:id` → [02-ITEMS.md](./02-ITEMS.md)
- `DELETE /api/v1/items/:id` → [02-ITEMS.md](./02-ITEMS.md)
- `PATCH /api/v1/items/:id/activate` → [02-ITEMS.md](./02-ITEMS.md)
- `GET /api/v1/items/count` → [10-SEED-DATA-MANAGEMENT.md](../flowhub-core/docs/automation/SEED_DATA_MANAGEMENT.md) ⭐ **New**
- `POST /api/v1/items/check-exists` → [10-SEED-DATA-MANAGEMENT.md](../flowhub-core/docs/automation/SEED_DATA_MANAGEMENT.md) ⭐ **New**
- `POST /api/v1/items/batch` → [10-SEED-DATA-MANAGEMENT.md](../flowhub-core/docs/automation/SEED_DATA_MANAGEMENT.md) ⭐ **New**
- `GET /api/v1/items/seed-status/:userId` → [10-SEED-DATA-MANAGEMENT.md](../flowhub-core/docs/automation/SEED_DATA_MANAGEMENT.md) ⭐ **New**

**Internal/Automation:**
- `POST /api/v1/internal/reset` → [03-INTERNAL.md](./03-INTERNAL.md)
- `POST /api/v1/internal/seed` → [03-INTERNAL.md](./03-INTERNAL.md)
- `GET /api/v1/internal/otp` → [03-INTERNAL.md](./03-INTERNAL.md)
- `DELETE /api/v1/internal/users/:userId/data` → [03-INTERNAL.md](./03-INTERNAL.md) ⭐ **User data cleanup**
- `GET /health` → [03-INTERNAL.md](./03-INTERNAL.md)

---

## Key Concepts

### Authentication Model

- **Type:** JWT-based
- **Access Token:** 15 minutes expiry, sent via `Authorization: Bearer <token>` header
- **Refresh Token:** 7-30 days expiry, stored in httpOnly cookie (`refreshToken`)
- **Storage:** Access token in React state (memory), NOT localStorage

### Roles & Authorization

- **ADMIN:** Full access, bypasses ownership checks
- **EDITOR:** Can create/edit/delete own items only
- **VIEWER:** Read-only, sees all items

### Ownership

- **Field:** `created_by` (ObjectId)
- **Enforcement:** Database query filter
- **Behavior:** EDITOR sees only own items, ADMIN/VIEWER see all

---

## Global Error Contract

All error responses follow this format:

```json
{
  "status": "error",
  "error_code": 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500,
  "error_type": "Error Type String",
  "message": "Human-readable error message",
  "timestamp": "2024-12-17T10:30:00Z",
  "path": "/api/v1/items"
}
```

---

## Document Status

✅ **Complete** - All information extracted from codebase  
✅ **Validated** - Cross-referenced with actual implementation  
✅ **No Assumptions** - Every detail confirmed from source code  
✅ **Organized by Feature** - Separate files for easy navigation  
✅ **Seed Data Management** - New optimized endpoints documented (2025-01-04)  
✅ **User Data Cleanup** - `DELETE /api/v1/internal/users/:userId/data` endpoint implemented (2025-01-05)

**Next Steps:**
- Framework design begins only after this document is frozen
- Any behavior outside this contract is a product or environment issue
- This document represents **Layer 1 (System Discovery)**
- ✅ **All remaining questions answered** - See [06-REMAINING-QUESTIONS.md](./06-REMAINING-QUESTIONS.md)
- ✅ **Seed data questions answered** - See [10-SEED-DATA-MANAGEMENT.md](../flowhub-core/docs/automation/SEED_DATA_MANAGEMENT.md)

---

**End of Index**
