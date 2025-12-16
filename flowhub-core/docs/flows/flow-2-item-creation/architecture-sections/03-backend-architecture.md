# **Backend Architecture - Flow 2: Item Creation**

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
│   │   ├── item_service.py          # Business logic (create item)
│   │   ├── validation_service.py    # Schema + business rule validation
│   │   ├── file_service.py          # File upload handling
│   │   └── duplicate_service.py     # Duplicate checking
│   ├── models/
│   │   ├── item.py                  # Item Pydantic models
│   │   └── database.py              # MongoDB item model
│   ├── middleware/
│   │   ├── auth.py                  # JWT token validation
│   │   └── error_handler.py         # Error handling middleware
│   ├── utils/
│   │   ├── exceptions.py            # Custom exceptions
│   │   └── logger.py                # Logging utility
│   ├── config/
│   │   ├── database.py              # MongoDB connection
│   │   └── settings.py              # Application settings
│   └── main.py                      # FastAPI app setup
├── uploads/                          # File upload directory
├── .env                              # Environment variables
├── requirements.txt
└── README.md
```

---

## **2. Layer Separation**

### **Router Layer** (`routers/items.py`)
- Handles HTTP requests/responses
- Parses multipart/form-data
- Calls service layer
- Returns HTTP responses
- **No business logic**

### **Service Layer** (`services/item_service.py`)
- Contains business logic
- Calls validation services
- Calls file service for uploads
- Calls database model for persistence
- Returns business objects (not HTTP responses)
- **No HTTP concerns**

### **Model Layer** (`models/item.py`, `models/database.py`)
- Pydantic models for validation
- MongoDB document models
- Database operations (CRUD)
- **No business logic**

### **Middleware Layer**
- Authentication middleware (JWT validation)
- Error handling middleware
- Request size validation

---

## **3. Key Components**

### **3.1 Item Service** (`services/item_service.py`)

**Purpose:** Contains all business logic for item creation.

**Required Functions:**

1. **`create_item(item_data: dict, file: Optional[UploadFile], user_id: str) -> dict`**
   - **Input:** 
     - `item_data`: Parsed item data dictionary
     - `file`: Optional uploaded file
     - `user_id`: Current user ID from JWT
   - **Process:**
     - Validate schema using Pydantic models
     - Validate business rules (category-item type, price limits)
     - Check for duplicates (name + category)
     - Check for similar items (3+ similar in same category)
     - Process file upload (if provided)
     - Create item document in MongoDB
     - Return created item
   - **Output:** Item document dictionary or raise exception

2. **`validate_item_schema(item_data: dict) -> ItemCreateSchema`**
   - **Input:** Item data dictionary
   - **Process:** Validate against Pydantic model
   - **Output:** Validated Pydantic model or raise ValidationError

3. **`check_duplicate(name: str, category: str) -> bool`**
   - **Input:** name, category
   - **Process:** Query MongoDB for existing item with same name+category
   - **Output:** True if duplicate exists, False otherwise

4. **`check_similar_items(name: str, category: str, limit: int = 3) -> bool`**
   - **Input:** name (first 5 chars), category, limit
   - **Process:** Query MongoDB for items with similar name prefix in same category
   - **Output:** True if count >= limit, False otherwise

---

### **3.2 Validation Service** (`services/validation_service.py`)

**Purpose:** Handles schema and business rule validation.

**Required Functions:**

1. **`validate_schema(item_data: dict, item_type: str) -> dict`**
   - **Input:** item_data dictionary, item_type
   - **Process:**
     - Validate base fields (name, description, price, category)
     - Validate conditional fields based on item_type
     - Return validated data or raise ValidationError
   - **Output:** Validated data dictionary

2. **`validate_business_rules(item_data: dict) -> None`**
   - **Input:** item_data dictionary
   - **Process:**
     - Check category-item type compatibility
     - Check price limits by category
     - Raise BusinessRuleError if violated
   - **Output:** None or raise exception

3. **`validate_category_item_type(category: str, item_type: str) -> None`**
   - **Input:** category, item_type
   - **Process:**
     - Electronics → must be PHYSICAL
     - Software → must be DIGITAL
     - Services → must be SERVICE
   - **Output:** None or raise BusinessRuleError

4. **`validate_price_by_category(price: float, category: str) -> None`**
   - **Input:** price, category
   - **Process:**
     - Electronics: $10.00 - $50,000.00
     - Books: $5.00 - $500.00
     - Services: $25.00 - $10,000.00
   - **Output:** None or raise BusinessRuleError

---

### **3.3 File Service** (`services/file_service.py`)

**Purpose:** Handles file upload validation and storage.

**Required Functions:**

1. **`validate_file(file: UploadFile) -> None`**
   - **Input:** UploadFile object
   - **Process:**
     - Check file extension (allowed: .jpg, .jpeg, .png, .pdf, .doc, .docx)
     - Check file size (1 KB - 5 MB)
     - Raise UnsupportedMediaError if invalid type
     - Raise PayloadTooLargeError if too large
   - **Output:** None or raise exception

2. **`save_file(file: UploadFile) -> str`**
   - **Input:** UploadFile object
   - **Process:**
     - Validate file first
     - Generate UUID for filename
     - Save to `uploads/` directory
     - Return file path
   - **Output:** File path string (e.g., "uploads/uuid.pdf")

3. **`get_file_metadata(file: UploadFile, file_path: str) -> dict`**
   - **Input:** UploadFile object, file_path
   - **Process:** Extract metadata (original_name, content_type, size)
   - **Output:** Metadata dictionary

---

### **3.4 Duplicate Service** (`services/duplicate_service.py`)

**Purpose:** Handles duplicate and similar item checking.

**Required Functions:**

1. **`check_duplicate(name: str, category: str, db) -> bool`**
   - **Input:** name, category, database connection
   - **Process:** Query MongoDB for existing item with same name+category
   - **Output:** True if duplicate exists

2. **`check_similar_items(name: str, category: str, db, limit: int = 3) -> bool`**
   - **Input:** name, category, database connection, limit
   - **Process:**
     - Extract first 5 characters of name
     - Query MongoDB for items with similar name prefix in same category
     - Count results
   - **Output:** True if count >= limit

---

### **3.5 Item Models** (`models/item.py`)

**Purpose:** Pydantic models for request validation.

**Required Models:**

1. **`ItemType` (Enum)**
   ```python
   class ItemType(str, Enum):
       PHYSICAL = "PHYSICAL"
       DIGITAL = "DIGITAL"
       SERVICE = "SERVICE"
   ```

2. **`ItemCreateSchema` (BaseModel)**
   ```python
   class ItemCreateSchema(BaseModel):
       name: str = Field(..., min_length=3, max_length=100)
       description: str = Field(..., min_length=10, max_length=500)
       item_type: ItemType
       price: float = Field(..., ge=0.01, le=999999.99)
       category: str = Field(..., min_length=1, max_length=50)
       tags: Optional[List[str]] = Field(default=[], max_items=10)
       is_active: bool = Field(default=True)
       
       # Conditional fields
       weight: Optional[float] = None
       dimensions: Optional[Dict[str, float]] = None
       download_url: Optional[str] = None
       file_size: Optional[int] = None
       duration_hours: Optional[int] = None
       
       @root_validator
       def validate_conditional_fields(cls, values):
           item_type = values.get('item_type')
           # Validate based on item_type
           return values
   ```

---

### **3.6 Item Router** (`routers/items.py`)

**Purpose:** Handles HTTP requests for item creation.

**Required Endpoint:**

```python
@router.post("/items", status_code=201)
async def create_item(
    item_data: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new item with validation and optional file upload.
    
    Error Codes:
    - 400: Business rule validation failed
    - 401: Authentication required
    - 409: Duplicate item exists
    - 413: File size exceeds limit
    - 415: Unsupported file type
    - 422: Schema validation failed
    """
    try:
        # Parse JSON from form field
        parsed_data = json.loads(item_data)
        
        # Create item via service
        item_service = ItemService(db)
        created_item = await item_service.create_item(
            item_data=parsed_data,
            file=file,
            user_id=current_user["id"]
        )
        
        return {
            "status": "success",
            "message": "Item created successfully",
            "data": created_item,
            "item_id": str(created_item["_id"])
        }
        
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DuplicateItemError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except UnsupportedMediaError as e:
        raise HTTPException(status_code=415, detail=str(e))
    except PayloadTooLargeError as e:
        raise HTTPException(status_code=413, detail=str(e))
```

---

## **4. Error Handling**

### **4.1 Custom Exceptions** (`utils/exceptions.py`)

```python
class BusinessRuleError(Exception):
    """Raised when business rule validation fails"""
    pass

class DuplicateItemError(Exception):
    """Raised when duplicate item detected"""
    pass

class UnsupportedMediaError(Exception):
    """Raised when file type not supported"""
    pass

class PayloadTooLargeError(Exception):
    """Raised when file size exceeds limit"""
    pass
```

### **4.2 Error Handler Middleware** (`middleware/error_handler.py`)

```python
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardized error response format"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error_code": exc.status_code,
            "error_type": get_error_type(exc.status_code),
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )
```

---

## **5. Database Operations**

### **5.1 MongoDB Connection** (`config/database.py`)

```python
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DB_NAME]

async def get_database():
    return db
```

### **5.2 Item Document Model** (`models/database.py`)

```python
from datetime import datetime
from typing import Optional, Dict, List

class ItemDocument:
    """MongoDB document structure for items"""
    
    @staticmethod
    def create_item_document(item_data: dict, user_id: str, file_path: Optional[str] = None) -> dict:
        """Create item document for MongoDB insertion"""
        return {
            **item_data,
            "created_by": user_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "file_path": file_path
        }
```

---

## **6. Implementation Checklist**

### **Backend Setup:**
- [ ] Setup FastAPI app with CORS
- [ ] Configure MongoDB connection (Motor async driver)
- [ ] Create uploads directory
- [ ] Setup environment variables (.env)

### **Models:**
- [ ] Create ItemType enum
- [ ] Create ItemCreateSchema Pydantic model
- [ ] Add conditional field validation
- [ ] Create ItemDocument helper

### **Services:**
- [ ] Implement file validation service
- [ ] Implement file storage service
- [ ] Implement validation service (schema + business rules)
- [ ] Implement duplicate service
- [ ] Implement item service (create item logic)

### **Router:**
- [ ] Create items router
- [ ] Implement POST /items endpoint
- [ ] Add authentication middleware
- [ ] Add error handling

### **Middleware:**
- [ ] Add authentication middleware (JWT validation)
- [ ] Add error handler middleware
- [ ] Add request size validation

---

**Next:** See `04-frontend-architecture.md` for frontend implementation details.

