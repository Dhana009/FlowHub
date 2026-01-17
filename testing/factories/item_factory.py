"""
Item Factory for creating test items.

Provides methods to create items of different types (PHYSICAL, DIGITAL, SERVICE)
with valid schemas, business rules enforcement, and batch operations.
"""

import logging
from typing import Optional, Dict, Any, List

from .base_factory import BaseFactory
from .config import Config
from .helpers import (
    generate_unique_name,
    get_category_for_item_type,
    get_price_range_for_category,
    generate_valid_price,
    normalize_category,
    ensure_min_length,
    truncate_string
)

logger = logging.getLogger(__name__)


class ItemFactory(BaseFactory):
    """Factory for creating test items."""
    
    def __init__(self, base_url: Optional[str] = None, timeout: Optional[int] = None):
        """
        Initialize ItemFactory.
        
        Args:
            base_url: Optional base URL override
            timeout: Optional timeout override
        """
        super().__init__(base_url, timeout)
    
    def create_physical_item(
        self,
        name: Optional[str] = None,
        description: Optional[str] = None,
        category: Optional[str] = None,
        price: Optional[float] = None,
        weight: Optional[float] = None,
        dimensions: Optional[Dict[str, float]] = None,
        tags: Optional[List[str]] = None,
        embed_url: Optional[str] = None,
        **overrides
    ) -> Dict[str, Any]:
        """
        Create a PHYSICAL item with valid schema.
        
        Required fields for PHYSICAL:
        - name (3-100 chars)
        - description (10-500 chars)
        - item_type: "PHYSICAL"
        - price (0.01-999999.99)
        - category (1-50 chars)
        - weight (> 0)
        - dimensions: {length, width, height} (all > 0)
        
        Args:
            name: Item name (default: auto-generated unique name)
            description: Item description (default: auto-generated, min 10 chars)
            category: Category (default: "Electronics" for PHYSICAL)
            price: Price (default: valid price for category)
            weight: Weight in kg (default: 1.0)
            dimensions: Dict with length, width, height (default: {10, 5, 2})
            tags: Optional tags array (max 10, each 1-30 chars)
            embed_url: Optional embed URL
            **overrides: Additional fields to override
            
        Returns:
            Dictionary with item data ready for API request
        """
        # Generate unique name if not provided
        if name is None:
            name = generate_unique_name("Test Physical")
        
        # Generate description if not provided
        if description is None:
            description = ensure_min_length(
                f"Test physical item description for {name}",
                10
            )
        
        # Use Electronics category for PHYSICAL (business rule)
        if category is None:
            category = "Electronics"
        
        # Generate valid price for category
        if price is None:
            price = generate_valid_price(category)
        
        # Default weight
        if weight is None:
            weight = 1.0
        
        # Default dimensions
        if dimensions is None:
            dimensions = {
                "length": 10.0,
                "width": 5.0,
                "height": 2.0
            }
        
        # Build item data
        item_data = {
            "name": truncate_string(name, 100),
            "description": truncate_string(description, 500),
            "item_type": "PHYSICAL",
            "price": round(price, 2),
            "category": normalize_category(category),
            "weight": weight,
            "dimensions": dimensions
        }
        
        # Add optional fields
        if tags is not None:
            item_data["tags"] = tags[:10]  # Max 10 tags
        
        if embed_url is not None:
            item_data["embed_url"] = embed_url
        
        # Apply overrides
        item_data.update(overrides)
        
        return item_data
    
    def create_digital_item(
        self,
        name: Optional[str] = None,
        description: Optional[str] = None,
        category: Optional[str] = None,
        price: Optional[float] = None,
        download_url: Optional[str] = None,
        file_size: Optional[int] = None,
        tags: Optional[List[str]] = None,
        embed_url: Optional[str] = None,
        **overrides
    ) -> Dict[str, Any]:
        """
        Create a DIGITAL item with valid schema.
        
        Required fields for DIGITAL:
        - name (3-100 chars)
        - description (10-500 chars)
        - item_type: "DIGITAL"
        - price (0.01-999999.99)
        - category (1-50 chars)
        - download_url (valid URL)
        - file_size (>= 1)
        
        Args:
            name: Item name (default: auto-generated unique name)
            description: Item description (default: auto-generated, min 10 chars)
            category: Category (default: "Software" for DIGITAL)
            price: Price (default: valid price for category)
            download_url: Download URL (default: "https://example.com/download")
            file_size: File size in bytes (default: 1024)
            tags: Optional tags array (max 10, each 1-30 chars)
            embed_url: Optional embed URL
            **overrides: Additional fields to override
            
        Returns:
            Dictionary with item data ready for API request
        """
        # Generate unique name if not provided
        if name is None:
            name = generate_unique_name("Test Digital")
        
        # Generate description if not provided
        if description is None:
            description = ensure_min_length(
                f"Test digital item description for {name}",
                10
            )
        
        # Use Software category for DIGITAL (business rule)
        if category is None:
            category = "Software"
        
        # Generate valid price for category
        if price is None:
            price = generate_valid_price(category)
        
        # Default download URL
        if download_url is None:
            download_url = "https://example.com/download"
        
        # Default file size
        if file_size is None:
            file_size = 1024
        
        # Build item data
        item_data = {
            "name": truncate_string(name, 100),
            "description": truncate_string(description, 500),
            "item_type": "DIGITAL",
            "price": round(price, 2),
            "category": normalize_category(category),
            "download_url": download_url,
            "file_size": file_size
        }
        
        # Add optional fields
        if tags is not None:
            item_data["tags"] = tags[:10]  # Max 10 tags
        
        if embed_url is not None:
            item_data["embed_url"] = embed_url
        
        # Apply overrides
        item_data.update(overrides)
        
        return item_data
    
    def create_service_item(
        self,
        name: Optional[str] = None,
        description: Optional[str] = None,
        category: Optional[str] = None,
        price: Optional[float] = None,
        duration_hours: Optional[int] = None,
        tags: Optional[List[str]] = None,
        embed_url: Optional[str] = None,
        **overrides
    ) -> Dict[str, Any]:
        """
        Create a SERVICE item with valid schema.
        
        Required fields for SERVICE:
        - name (3-100 chars)
        - description (10-500 chars)
        - item_type: "SERVICE"
        - price (0.01-999999.99)
        - category (1-50 chars)
        - duration_hours (>= 1, integer)
        
        Args:
            name: Item name (default: auto-generated unique name)
            description: Item description (default: auto-generated, min 10 chars)
            category: Category (default: "Services" for SERVICE)
            price: Price (default: valid price for category)
            duration_hours: Duration in hours (default: 1)
            tags: Optional tags array (max 10, each 1-30 chars)
            embed_url: Optional embed URL
            **overrides: Additional fields to override
            
        Returns:
            Dictionary with item data ready for API request
        """
        # Generate unique name if not provided
        if name is None:
            name = generate_unique_name("Test Service")
        
        # Generate description if not provided
        if description is None:
            description = ensure_min_length(
                f"Test service item description for {name}",
                10
            )
        
        # Use Services category for SERVICE (business rule)
        if category is None:
            category = "Services"
        
        # Generate valid price for category
        if price is None:
            price = generate_valid_price(category)
        
        # Default duration
        if duration_hours is None:
            duration_hours = 1
        
        # Build item data
        item_data = {
            "name": truncate_string(name, 100),
            "description": truncate_string(description, 500),
            "item_type": "SERVICE",
            "price": round(price, 2),
            "category": normalize_category(category),
            "duration_hours": duration_hours
        }
        
        # Add optional fields
        if tags is not None:
            item_data["tags"] = tags[:10]  # Max 10 tags
        
        if embed_url is not None:
            item_data["embed_url"] = embed_url
        
        # Apply overrides
        item_data.update(overrides)
        
        return item_data
    
    def create_item(
        self,
        item_type: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generic method to create item of any type.
        
        Args:
            item_type: Item type - "PHYSICAL", "DIGITAL", or "SERVICE"
            **kwargs: Arguments passed to specific create method
            
        Returns:
            Dictionary with item data ready for API request
        """
        item_type = item_type.upper()
        
        if item_type == "PHYSICAL":
            return self.create_physical_item(**kwargs)
        elif item_type == "DIGITAL":
            return self.create_digital_item(**kwargs)
        elif item_type == "SERVICE":
            return self.create_service_item(**kwargs)
        else:
            raise ValueError(f"Invalid item_type: {item_type}. Must be PHYSICAL, DIGITAL, or SERVICE")
    
    def create_item_with_tags(
        self,
        tags: List[str],
        item_type: str = "DIGITAL",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create item with tags.
        
        Args:
            tags: List of tags (max 10, each 1-30 chars)
            item_type: Item type (default: "DIGITAL")
            **kwargs: Additional arguments
            
        Returns:
            Dictionary with item data
        """
        kwargs["tags"] = tags[:10]  # Max 10 tags
        return self.create_item(item_type, **kwargs)
    
    def create_item_with_price(
        self,
        price: float,
        item_type: str = "DIGITAL",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create item with specific price.
        
        Args:
            price: Price value
            item_type: Item type (default: "DIGITAL")
            **kwargs: Additional arguments
            
        Returns:
            Dictionary with item data
        """
        kwargs["price"] = price
        return self.create_item(item_type, **kwargs)
    
    def create_batch_items(
        self,
        count: int,
        item_type: str = "DIGITAL",
        **base_overrides
    ) -> List[Dict[str, Any]]:
        """
        Create multiple items of the same type.
        
        Args:
            count: Number of items to create
            item_type: Item type (default: "DIGITAL")
            **base_overrides: Base overrides applied to all items
            
        Returns:
            List of item data dictionaries
        """
        items = []
        for i in range(count):
            # Generate unique name for each item
            name = generate_unique_name(f"Test {item_type}", suffix=str(i))
            item = self.create_item(item_type, name=name, **base_overrides)
            items.append(item)
        
        return items
    
    def create_item_via_api(
        self,
        item_data: Dict[str, Any],
        token: str
    ) -> Dict[str, Any]:
        """
        Create item via API endpoint.
        
        Args:
            item_data: Item data dictionary
            token: JWT access token
            
        Returns:
            API response with created item
            
        Raises:
            requests.HTTPError: If creation fails
            ValueError: If response is invalid
        """
        headers = Config.get_auth_headers(token)
        response = self.post("/items", json_data=item_data, headers=headers)
        
        if response.status_code != 201:
            raise ValueError(f"Failed to create item: {response.text}")
        
        result = response.json()
        return result.get("data", {})
