# **Backend Architecture - Flow 4: Item Details**

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
│   │   └── item_service.py          # Business logic (get item by ID)
│   ├── models/
│   │   └── item.py                  # Item Pydantic models
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
- Handles HTTP GET requests
- Parses path parameter (item ID)
- Calls service layer
- Returns HTTP responses
- **No business logic**

### **Service Layer** (`services/item_service.py`)
- Contains business logic
- Validates item ID format
- Queries MongoDB
- Returns business objects (not HTTP responses)
- **No HTTP concerns**

---

## **3. Key Components**

### **3.1 Item Service** (`services/item_service.py`)

**Purpose:** Business logic for retrieving item by ID.

**Required Functions:**

1. **`get_item_by_id(item_id: str) -> Optional[dict]`**
   - **Input:** Item ID string
   - **Process:**
     - Validate ObjectId format
     - Query MongoDB by _id
     - Return item document or None
   - **Output:** Item dictionary or None

```python
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

async def get_item_by_id(item_id: str, db: AsyncIOMotorDatabase) -> Optional[dict]:
    """Get item by ID from MongoDB"""
    
    # Validate ObjectId format
    if not ObjectId.is_valid(item_id):
        raise ValueError("Invalid item ID format")
    
    # Query database
    item = await db.items.find_one({ "_id": ObjectId(item_id) })
    
    if item:
        # Convert ObjectId to string for JSON serialization
        item["_id"] = str(item["_id"])
        if "created_by" in item:
            item["created_by"] = str(item["created_by"])
        return item
    
    return None
```

---

### **3.2 Item Router** (`routers/items.py`)

**Purpose:** Handles HTTP GET requests for item details.

**Required Endpoint:**

```python
from fastapi import APIRouter, HTTPException, Depends, Path
from services.item_service import get_item_by_id
from middleware.auth import get_current_user
from config.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/{item_id}")
async def get_item(
    item_id: str = Path(..., description="Item ID (MongoDB ObjectId)"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get item details by ID.
    
    Error Codes:
    - 404: Item not found
    - 422: Invalid item ID format
    - 401: Authentication required
    """
    try:
        # Get item via service
        item = await get_item_by_id(item_id, db)
        
        if not item:
            raise HTTPException(
                status_code=404,
                detail=f"Item with ID {item_id} not found"
            )
        
        return item
        
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

### **3.3 ObjectId Validator** (`utils/validators.py`)

**Purpose:** Validate MongoDB ObjectId format.

```python
from bson import ObjectId

def validate_objectid(item_id: str) -> bool:
    """Validate if string is valid MongoDB ObjectId"""
    try:
        ObjectId(item_id)
        return True
    except:
        return False
```

---

## **4. Error Handling**

### **4.1 Error Scenarios**

**404 Not Found:**
- Item ID doesn't exist in database
- Return 404 with clear message

**422 Unprocessable Entity:**
- Invalid ObjectId format
- Validate before querying database
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
- [ ] Setup FastAPI endpoint for GET /api/items/{id}
- [ ] Create ObjectId validator utility
- [ ] Create item service (get by ID logic)
- [ ] Create item router (endpoint handler)
- [ ] Add error handling (404, 422, 500)
- [ ] Add authentication middleware

### **Testing:**
- [ ] Test with valid ObjectId
- [ ] Test with invalid ObjectId format
- [ ] Test with non-existent ObjectId (404)
- [ ] Test without authentication (401)
- [ ] Test error handling

---

**Next:** See `04-frontend-architecture.md` for frontend implementation details.

