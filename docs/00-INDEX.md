# System Contract Documentation
## Backend & Frontend Reference for Web Automation

**Version:** 1.0  
**Last Updated:** 2024-12-17  
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

**Internal/Automation:**
- `POST /api/v1/internal/reset` → [03-INTERNAL.md](./03-INTERNAL.md)
- `POST /api/v1/internal/seed` → [03-INTERNAL.md](./03-INTERNAL.md)
- `GET /api/v1/internal/otp` → [03-INTERNAL.md](./03-INTERNAL.md)
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

**Next Steps:**
- Framework design begins only after this document is frozen
- Any behavior outside this contract is a product or environment issue
- This document represents **Layer 1 (System Discovery)**

---

**End of Index**
