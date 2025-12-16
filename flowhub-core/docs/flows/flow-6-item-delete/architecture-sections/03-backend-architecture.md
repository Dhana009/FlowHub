# **Backend Architecture - Flow 6: Item Delete**

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
│   │   └── item_service.py          # Business logic (soft delete)
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
- Handles HTTP DELETE requests
- Parses path parameter (item ID)
- Calls service layer
- Returns HTTP responses
- **No business logic**

### **Service Layer** (`services/item_service.py`)
- Contains business logic
- Validates item ID format
- Checks if item exists
- Checks if item is already deleted
- Performs soft delete
- Returns business objects (not HTTP responses)
- **No HTTP concerns**

---

## **3. Key Components**

### **3.1 Item Service** (`services/item_service.py`)

**Purpose:** Business logic for soft deleting item by ID.

**Required Functions:**

1. **`soft_delete_item(item_id: str) -> dict`**
   - **Input:** Item ID string
   - **Process:**
     - Validate ObjectId format
     - Fetch existing item
     - Check if item exists (404 if not)
     - Check if item is already deleted (409 if deleted)
     - Update MongoDB document (status = "deleted")
     - Return success response
   - **Output:** Success response dictionary
   - **Raises:** ItemNotFoundError, ItemAlreadyDeletedError

```python
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from exceptions.item_exceptions import (
    ItemNotFoundError,
    ItemAlreadyDeletedError
)

async def soft_delete_item(
    item_id: str,
    db: AsyncIOMotorDatabase
) -> dict:
    """Soft delete item by ID (change status to deleted)"""
    
    # Validate ObjectId format
    if not ObjectId.is_valid(item_id):
        raise ValueError("Invalid item ID format")
    
    # Fetch existing item
    existing_item = await db.items.find_one({ "_id": ObjectId(item_id) })
    
    if not existing_item:
        raise ItemNotFoundError(item_id)
    
    # Check if already deleted
    if existing_item.get("status") == "deleted":
        raise ItemAlreadyDeletedError(item_id)
    
    # Perform soft delete
    update_result = await db.items.update_one(
        { "_id": ObjectId(item_id) },
        {
            "$set": {
                "status": "deleted",
                "deleted_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if update_result.modified_count == 0:
        # Update failed (should not happen after existence check)
        raise ItemNotFoundError(item_id)
    
    # Return success response
    return {
        "success": True,
        "message": "Item deleted successfully",
        "item_id": item_id,
        "deleted_at": datetime.utcnow().isoformat()
    }
```

---

### **3.2 Item Router** (`routers/items.py`)

**Purpose:** Handles HTTP DELETE requests for item deletion.

**Required Endpoint:**

```python
from fastapi import APIRouter, HTTPException, Depends, Path
from services.item_service import soft_delete_item
from middleware.auth import get_current_user
from config.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from exceptions.item_exceptions import (
    ItemNotFoundError,
    ItemAlreadyDeletedError
)

router = APIRouter(prefix="/items", tags=["items"])

@router.delete("/{item_id}")
async def delete_item_endpoint(
    item_id: str = Path(..., description="Item ID (MongoDB ObjectId)"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete item by ID (soft delete).
    
    Error Codes:
    - 404: Item not found
    - 409: Item already deleted
    - 400: Invalid item ID format
    - 401: Authentication required
    """
    try:
        # Soft delete item via service
        result = await soft_delete_item(item_id, db)
        
        return result
        
    except ItemNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except ItemAlreadyDeletedError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e),
            headers={"X-Error-Code": "ITEM_ALREADY_DELETED"}
        )
    except ValueError as e:
        # Invalid ObjectId format
        raise HTTPException(
            status_code=400,
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

class ItemAlreadyDeletedError(Exception):
    def __init__(self, item_id: str):
        self.item_id = item_id
        self.message = f"Item with ID {item_id} is already deleted"
        super().__init__(self.message)
```

---

## **4. Error Handling**

### **4.1 Error Scenarios**

**404 Not Found:**
- Item ID doesn't exist in database
- Return 404 with clear message

**409 Conflict (Already Deleted):**
- Item status is already "deleted"
- Return 409 with "ITEM_ALREADY_DELETED" error code
- Headers: `X-Error-Code: ITEM_ALREADY_DELETED`

**400 Bad Request:**
- Invalid ObjectId format
- Return 400 with format requirements

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
- [ ] Setup FastAPI endpoint for DELETE /api/items/{id}
- [ ] Create custom exceptions (ItemNotFoundError, ItemAlreadyDeletedError)
- [ ] Create item service (soft delete logic)
- [ ] Create item router (endpoint handler)
- [ ] Add status validation (cannot delete already deleted items)
- [ ] Add error handling (400, 401, 404, 409, 500)
- [ ] Add authentication middleware

### **Testing:**
- [ ] Test with valid item ID
- [ ] Test with invalid ObjectId format (400)
- [ ] Test with non-existent ObjectId (404)
- [ ] Test with already deleted item (409 ITEM_ALREADY_DELETED)
- [ ] Test without authentication (401)
- [ ] Test error handling

---

**Next:** See `04-frontend-architecture.md` for frontend implementation details.

