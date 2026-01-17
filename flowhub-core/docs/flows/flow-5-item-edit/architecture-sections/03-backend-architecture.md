# **Backend Architecture - Flow 5: Item Edit**

**Version:** 1.0  
**Date:** December 17, 2024  
**Technology:** Python + FastAPI + MongoDB

---

## **1. Folder Structure**

```
backend/
├── src/
│   ├── routers/
│   │   └── items.py                  # Item endpoints handlers
│   ├── services/
│   │   └── item_service.py          # Business logic (update item)
│   ├── models/
│   │   └── item.py                  # Item Pydantic models
│   ├── exceptions/
│   │   └── item_exceptions.py      # Custom exceptions
│   ├── middleware/
│   │   ├── auth.py                  # JWT token validation
│   │   └── error_handler.py         # Error handling middleware
│   ├── utils/
│   │   ├── validators.py            # ObjectId validation
│   │   └── logger.py                # Logging utility
│   ├── config/
│   │   ├── database.py              # MongoDB connection
│   │   └── settings.py              # Application settings
│   └── main.py                      # FastAPI app setup
├── .env
├── requirements.txt
└── README.md
```

---

## **2. Layer Separation**

### **Router Layer** (`routers/items.py`)
- Handles HTTP PUT requests
- Parses path parameter (item ID) and request body
- Calls service layer
- Returns HTTP responses
- **No business logic**

### **Service Layer** (`services/item_service.py`)
- Contains business logic
- Validates item ID format
- Checks item status (cannot edit deleted items)
- Checks version (optimistic locking)
- Validates update data
- Updates MongoDB
- Returns business objects (not HTTP responses)
- **No HTTP concerns**

---

## **3. Key Components**

### **3.1 Item Service** (`services/item_service.py`)

**Purpose:** Business logic for updating item by ID.

**Required Functions:**

1. **`get_item_by_id(item_id: str) -> Optional[dict]`**
   - **Input:** Item ID string
   - **Process:**
     - Validate ObjectId format
     - Query MongoDB by _id
     - Return item document or None
   - **Output:** Item dictionary or None
   - **Note:** Reuse from Flow 4 (Item Details)

2. **`update_item(item_id: str, update_data: dict, user_id: str) -> dict`**
   - **Input:** Item ID, update data dictionary, user ID
   - **Process:**
     - Validate ObjectId format
     - Fetch existing item
     - Check if item exists (404 if not)
     - Check if item is deleted (409 if deleted)
     - Check version match (409 if mismatch)
     - Validate update data (same as creation)
     - Update MongoDB document (increment version)
     - Return updated item document
   - **Output:** Updated item dictionary
   - **Raises:** ItemNotFoundError, ItemDeletedError, VersionMismatchError, ValidationError

```python
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from exceptions.item_exceptions import (
    ItemNotFoundError,
    ItemDeletedError,
    VersionMismatchError
)

async def update_item(
    item_id: str,
    update_data: dict,
    user_id: str,
    db: AsyncIOMotorDatabase
) -> dict:
    """Update item by ID with optimistic locking"""
    
    # Validate ObjectId format
    if not ObjectId.is_valid(item_id):
        raise ValueError("Invalid item ID format")
    
    # Fetch existing item
    existing_item = await db.items.find_one({ "_id": ObjectId(item_id) })
    
    if not existing_item:
        raise ItemNotFoundError(item_id)
    
    # Check if item is deleted
    if existing_item.get("status") == "deleted":
        raise ItemDeletedError(item_id)
    
    # Check version match (optimistic locking)
    expected_version = existing_item.get("version", 1)
    provided_version = update_data.get("version")
    
    if expected_version != provided_version:
        raise VersionMismatchError(
            expected=expected_version,
            provided=provided_version
        )
    
    # Validate update data (same validation as creation)
    # ... validation logic ...
    
    # Prepare update fields
    update_fields = {
        **update_data,
        "version": expected_version + 1,  # Increment version
        "updated_at": datetime.utcnow(),
        "updated_by": ObjectId(user_id)
    }
    
    # Remove version from update_fields (already handled)
    update_fields.pop("version", None)
    update_fields["version"] = expected_version + 1
    
    # Update document with version check
    result = await db.items.find_one_and_update(
        {
            "_id": ObjectId(item_id),
            "version": expected_version  # Optimistic locking
        },
        { "$set": update_fields },
        return_document=True
    )
    
    if not result:
        # Version changed between check and update
        raise VersionMismatchError(
            expected=expected_version,
            provided=provided_version
        )
    
    # Convert ObjectId to string for JSON serialization
    result["_id"] = str(result["_id"])
    if "created_by" in result:
        result["created_by"] = str(result["created_by"])
    if "updated_by" in result:
        result["updated_by"] = str(result["updated_by"])
    
    return result
```

---

### **3.2 Item Router** (`routers/items.py`)

**Purpose:** Handles HTTP PUT requests for item updates.

**Required Endpoint:**

```python
from fastapi import APIRouter, HTTPException, Depends, Path, Body
from services.item_service import update_item
from middleware.auth import get_current_user
from config.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from exceptions.item_exceptions import (
    ItemNotFoundError,
    ItemDeletedError,
    VersionMismatchError
)

router = APIRouter(prefix="/items", tags=["items"])

@router.put("/{item_id}")
async def update_item_endpoint(
    item_id: str = Path(..., description="Item ID (MongoDB ObjectId)"),
    update_data: dict = Body(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update item by ID.
    
    Error Codes:
    - 400: Validation errors
    - 404: Item not found
    - 409: Version mismatch or item deleted
    - 422: Invalid data format
    - 401: Authentication required
    """
    try:
        # Update item via service
        updated_item = await update_item(
            item_id,
            update_data,
            current_user["_id"],
            db
        )
        
        return updated_item
        
    except ItemNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except ItemDeletedError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e),
            headers={"X-Error-Code": "ITEM_DELETED"}
        )
    except VersionMismatchError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e),
            headers={"X-Error-Code": "VERSION_CONFLICT"}
        )
    except ValueError as e:
        # Invalid ObjectId format
        raise HTTPException(
            status_code=422,
            detail="Invalid item ID format. Expected 24-character hexadecimal string."
        )
    except Exception as e:
        # Unexpected error
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )
```

---

### **3.3 Custom Exceptions** (`exceptions/item_exceptions.py`)

**Purpose:** Custom exceptions for item operations.

```python
class ItemNotFoundError(Exception):
    def __init__(self, item_id: str):
        self.item_id = item_id
        self.message = f"Item with ID {item_id} not found"
        super().__init__(self.message)

class ItemDeletedError(Exception):
    def __init__(self, item_id: str):
        self.item_id = item_id
        self.message = f"Cannot edit deleted item {item_id}"
        super().__init__(self.message)

class VersionMismatchError(Exception):
    def __init__(self, expected: int, provided: int):
        self.expected = expected
        self.provided = provided
        self.message = f"Item was modified by another user. Expected version: {expected}, Provided: {provided}"
        super().__init__(self.message)
```

---

## **4. Error Handling**

### **4.1 Error Scenarios**

**404 Not Found:**
- Item ID doesn't exist in database
- Return 404 with clear message

**409 Conflict (Item Deleted):**
- Item status is "deleted"
- Return 409 with "ITEM_DELETED" error code
- Headers: `X-Error-Code: ITEM_DELETED`

**409 Conflict (Version Mismatch):**
- Version mismatch (concurrent edit)
- Return 409 with "VERSION_CONFLICT" error code
- Headers: `X-Error-Code: VERSION_CONFLICT`
- Include current_version and provided_version in response

**400 Bad Request:**
- Validation errors
- Return 400 with field-level errors

**422 Unprocessable Entity:**
- Invalid ObjectId format
- Invalid data format
- Return 422 with format requirements

**401 Unauthorized:**
- Missing/invalid JWT token
- Handled by authentication middleware

**500 Internal Server Error:**
- Database connection failure
- Unexpected errors
- Return generic error message

---

## **5. Implementation Checklist**

### **Backend Setup:**
- [ ] Setup FastAPI endpoint for PUT /api/items/{id}
- [ ] Create custom exceptions (ItemNotFoundError, ItemDeletedError, VersionMismatchError)
- [ ] Create item service (update logic with version check)
- [ ] Create item router (endpoint handler)
- [ ] Add state-based validation (deleted items)
- [ ] Add version conflict detection
- [ ] Add error handling (400, 401, 404, 409, 422, 500)
- [ ] Add authentication middleware
- [ ] Reuse validation logic from Flow 2 (Item Creation)

### **Testing:**
- [ ] Test with valid update data
- [ ] Test with invalid ObjectId format (422)
- [ ] Test with non-existent ObjectId (404)
- [ ] Test with deleted item (409 ITEM_DELETED)
- [ ] Test with version mismatch (409 VERSION_CONFLICT)
- [ ] Test without authentication (401)
- [ ] Test validation errors (400)
- [ ] Test error handling

---

**Next:** See `04-frontend-architecture.md` for frontend implementation details.

