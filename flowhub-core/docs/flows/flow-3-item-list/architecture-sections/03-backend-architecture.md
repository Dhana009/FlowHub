# **Backend Architecture - Flow 3: Item List**

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
│   │   ├── item_service.py          # Business logic (get items)
│   │   └── query_builder.py         # MongoDB query construction
│   ├── models/
│   │   ├── item.py                  # Item Pydantic models
│   │   └── query_params.py          # Query parameter models
│   ├── middleware/
│   │   ├── auth.py                  # JWT token validation
│   │   └── error_handler.py         # Error handling middleware
│   ├── utils/
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
- Parses query parameters
- Calls service layer
- Returns HTTP responses
- **No business logic**

### **Service Layer** (`services/item_service.py`)
- Contains business logic
- Calls query builder to construct queries
- Executes MongoDB queries
- Formats response data
- Returns business objects (not HTTP responses)
- **No HTTP concerns**

### **Query Builder Layer** (`services/query_builder.py`)
- Constructs MongoDB filter queries
- Constructs MongoDB sort queries
- Handles search, filter, sort logic
- **No database operations**

---

## **3. Key Components**

### **3.1 Query Parameter Models** (`models/query_params.py`)

**Purpose:** Validate and parse query parameters.

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from enum import Enum

class StatusEnum(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"

class ItemQueryParams(BaseModel):
    search: Optional[str] = Field(None, max_length=100)
    status: Optional[StatusEnum] = None
    category: Optional[str] = Field(None, max_length=50)
    sort_by: List[str] = Field(default=["created_at"])
    sort_order: List[str] = Field(default=["desc"])
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    
    @validator('sort_by')
    def validate_sort_fields(cls, v):
        valid_fields = ["name", "status", "category", "price", "created_at"]
        for field in v:
            if field not in valid_fields:
                raise ValueError(f"Invalid sort field: {field}. Valid: {valid_fields}")
        return v
    
    @validator('sort_order')
    def validate_sort_orders(cls, v):
        valid_orders = ["asc", "desc"]
        for order in v:
            if order.lower() not in valid_orders:
                raise ValueError(f"Invalid sort order: {order}. Valid: {valid_orders}")
        return [o.lower() for o in v]
```

---

### **3.2 Query Builder** (`services/query_builder.py`)

**Purpose:** Constructs MongoDB queries from parameters.

**Required Functions:**

1. **`build_filter(search: Optional[str], status: Optional[str], category: Optional[str]) -> dict`**
   - **Input:** search term, status, category
   - **Process:** Build MongoDB filter query
   - **Output:** Filter dictionary

```python
def build_filter(self, search: Optional[str], status: Optional[str], category: Optional[str]) -> dict:
    filter_query = {}
    
    # Search filter
    if search:
        search_term = search.strip()
        if search_term:
            filter_query["$or"] = [
                {"name": {"$regex": search_term, "$options": "i"}},
                {"description": {"$regex": search_term, "$options": "i"}}
            ]
    
    # Status filter
    if status:
        if status == "active":
            filter_query["is_active"] = True
        elif status == "inactive":
            filter_query["is_active"] = False
        # Handle "pending" if needed
    
    # Category filter
    if category:
        filter_query["category"] = category
    
    return filter_query
```

2. **`build_sort(sort_by: List[str], sort_order: List[str]) -> List[tuple]`**
   - **Input:** sort fields, sort orders
   - **Process:** Build MongoDB sort query
   - **Output:** Sort list

```python
def build_sort(self, sort_by: List[str], sort_order: List[str]) -> List[tuple]:
    sort_list = []
    
    for i, field in enumerate(sort_by):
        order = sort_order[i] if i < len(sort_order) else "desc"
        direction = -1 if order.lower() == "desc" else 1
        sort_list.append((field, direction))
    
    return sort_list
```

---

### **3.3 Item Service** (`services/item_service.py`)

**Purpose:** Business logic for retrieving items.

**Required Functions:**

1. **`get_items(query_params: ItemQueryParams) -> dict`**
   - **Input:** Query parameters
   - **Process:**
     - Build filter query
     - Build sort query
     - Execute count query (for pagination)
     - Execute find query with pagination
     - Format response
   - **Output:** Response dictionary with items and pagination

```python
async def get_items(self, query_params: ItemQueryParams) -> dict:
    # Build queries
    query_builder = QueryBuilder()
    filter_query = query_builder.build_filter(
        query_params.search,
        query_params.status.value if query_params.status else None,
        query_params.category
    )
    sort_list = query_builder.build_sort(
        query_params.sort_by,
        query_params.sort_order
    )
    
    # Calculate pagination
    skip = (query_params.page - 1) * query_params.limit
    
    # Execute queries
    total = await self.collection.count_documents(filter_query)
    cursor = self.collection.find(filter_query)
    
    # Apply sort
    if sort_list:
        cursor = cursor.sort(sort_list)
    
    # Apply pagination
    cursor = cursor.skip(skip).limit(query_params.limit)
    
    # Get items
    items = await cursor.to_list(length=query_params.limit)
    
    # Calculate pagination metadata
    total_pages = math.ceil(total / query_params.limit)
    has_next = query_params.page < total_pages
    has_prev = query_params.page > 1
    
    return {
        "items": items,
        "pagination": {
            "page": query_params.page,
            "limit": query_params.limit,
            "total": total,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_prev": has_prev
        }
    }
```

---

### **3.4 Item Router** (`routers/items.py`)

**Purpose:** Handles HTTP GET requests for item list.

**Required Endpoint:**

```python
from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Optional, List
from models.query_params import ItemQueryParams
from services.item_service import ItemService
from middleware.auth import get_current_user
from config.database import get_database

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/")
async def get_items(
    search: Optional[str] = Query(None, description="Search in name/description"),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort_by: List[str] = Query(["created_at"], description="Sort fields"),
    sort_order: List[str] = Query(["desc"], description="Sort orders"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get items with filtering, sorting, and pagination.
    
    Supports:
    - Search by name/description
    - Filter by status/category
    - Sort by multiple fields
    - Pagination
    """
    try:
        # Validate and parse query parameters
        query_params = ItemQueryParams(
            search=search,
            status=status,
            category=category,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            limit=limit
        )
        
        # Get items via service
        item_service = ItemService(db)
        result = await item_service.get_items(query_params)
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
```

---

## **4. Error Handling**

### **4.1 Validation Errors**

- Invalid query parameters → 400 Bad Request
- Invalid sort fields → 400 Bad Request with list of valid fields
- Invalid sort orders → 400 Bad Request
- Invalid page/limit → 400 Bad Request

### **4.2 Database Errors**

- Connection failure → 500 Internal Server Error
- Query timeout → 500 Internal Server Error
- Index missing → Log warning, continue with slower query

---

## **5. Performance Optimization**

### **5.1 Index Usage**

- Ensure all indexes are created (see 01-database-schema.md)
- Use `.explain()` to verify index usage
- Monitor query execution time

### **5.2 Query Optimization**

- Use projection to limit returned fields
- Always use limit (max 100)
- Use indexes for all filter/sort operations

### **5.3 Caching (Optional)**

- Cache frequently accessed queries
- Cache total count (with TTL)
- Invalidate cache on item create/update/delete

---

## **6. Implementation Checklist**

### **Backend Setup:**
- [ ] Setup FastAPI endpoint for GET /api/items
- [ ] Create query parameter Pydantic models
- [ ] Implement query builder utility
- [ ] Create item service (get items logic)
- [ ] Create item router (endpoint handler)
- [ ] Add MongoDB indexes (see 01-database-schema.md)
- [ ] Add error handling
- [ ] Add authentication middleware

### **Testing:**
- [ ] Test search functionality
- [ ] Test filter functionality
- [ ] Test sort functionality
- [ ] Test pagination
- [ ] Test combined queries
- [ ] Test edge cases (empty results, invalid params)
- [ ] Test performance with large datasets

---

**Next:** See `04-frontend-architecture.md` for frontend implementation details.

