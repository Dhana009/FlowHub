"""
Negative test data generators.

Provides functions to generate invalid test data for negative test cases.
"""

import copy
from typing import Dict, Any, List, Optional


def missing_required_fields(
    base_data: Dict[str, Any],
    fields_to_remove: List[str]
) -> Dict[str, Any]:
    """
    Remove required fields from base data for negative testing.
    
    Args:
        base_data: Valid base data dictionary
        fields_to_remove: List of field names to remove
        
    Returns:
        Dictionary with specified fields removed
    """
    invalid_data = copy.deepcopy(base_data)
    
    for field in fields_to_remove:
        if field in invalid_data:
            del invalid_data[field]
    
    return invalid_data


def invalid_data_types(
    base_data: Dict[str, Any],
    field: str,
    invalid_type: Any
) -> Dict[str, Any]:
    """
    Replace a field with invalid data type.
    
    Args:
        base_data: Valid base data dictionary
        field: Field name to modify
        invalid_type: Invalid value to set
        
    Returns:
        Dictionary with invalid type for specified field
    """
    invalid_data = copy.deepcopy(base_data)
    invalid_data[field] = invalid_type
    return invalid_data


def validation_failures() -> Dict[str, Dict[str, Any]]:
    """
    Get pre-built validation failure test cases.
    
    Returns:
        Dictionary with validation failure scenarios:
        {
            "name_too_short": {...},
            "name_too_long": {...},
            "description_too_short": {...},
            "price_too_low": {...},
            "price_too_high": {...},
            ...
        }
    """
    from .item_factory import ItemFactory
    
    factory = ItemFactory()
    base_item = factory.create_digital_item()
    
    return {
        "name_too_short": {
            **base_item,
            "name": "AB"  # Min is 3 chars
        },
        "name_too_long": {
            **base_item,
            "name": "A" * 101  # Max is 100 chars
        },
        "description_too_short": {
            **base_item,
            "description": "Short"  # Min is 10 chars
        },
        "description_too_long": {
            **base_item,
            "description": "A" * 501  # Max is 500 chars
        },
        "price_too_low": {
            **base_item,
            "price": 0.00  # Min is 0.01
        },
        "price_too_high": {
            **base_item,
            "price": 1000000.00  # Max is 999999.99
        },
        "invalid_item_type": {
            **base_item,
            "item_type": "INVALID"
        },
        "missing_weight_physical": {
            **factory.create_physical_item(),
            "weight": None
        },
        "missing_dimensions_physical": {
            **factory.create_physical_item(),
            "dimensions": None
        },
        "missing_download_url_digital": {
            **base_item,
            "download_url": None
        },
        "missing_file_size_digital": {
            **base_item,
            "file_size": None
        },
        "missing_duration_service": {
            **factory.create_service_item(),
            "duration_hours": None
        },
        "invalid_category_item_type": {
            **base_item,
            "item_type": "DIGITAL",
            "category": "Electronics"  # Electronics must be PHYSICAL
        },
        "tags_too_many": {
            **base_item,
            "tags": [f"tag{i}" for i in range(11)]  # Max is 10
        },
        "tags_duplicate": {
            **base_item,
            "tags": ["test", "test"]  # Must be unique
        },
        "invalid_url": {
            **base_item,
            "download_url": "not-a-valid-url"
        }
    }


def boundary_values(field: str, boundary_type: str = "min") -> Dict[str, Any]:
    """
    Generate boundary values for a field.
    
    Args:
        field: Field name
        boundary_type: "min" or "max"
        
    Returns:
        Dictionary with boundary value for the field
    """
    from .item_factory import ItemFactory
    
    factory = ItemFactory()
    base_item = factory.create_digital_item()
    
    boundaries = {
        "name": {
            "min": "ABC",  # 3 chars (min)
            "max": "A" * 100  # 100 chars (max)
        },
        "description": {
            "min": "1234567890",  # 10 chars (min)
            "max": "A" * 500  # 500 chars (max)
        },
        "price": {
            "min": 0.01,  # Minimum price
            "max": 999999.99  # Maximum price
        },
        "weight": {
            "min": 0.01,  # Minimum weight
            "max": 1000.0  # Reasonable max
        },
        "file_size": {
            "min": 1,  # Minimum file size
            "max": 1000000000  # 1GB (reasonable max)
        },
        "duration_hours": {
            "min": 1,  # Minimum duration
            "max": 8760  # 1 year (reasonable max)
        }
    }
    
    if field not in boundaries:
        raise ValueError(f"Unknown field for boundary values: {field}")
    
    if boundary_type not in ["min", "max"]:
        raise ValueError(f"boundary_type must be 'min' or 'max', got: {boundary_type}")
    
    result = copy.deepcopy(base_item)
    result[field] = boundaries[field][boundary_type]
    
    return result


def get_negative_test_cases() -> Dict[str, Dict[str, Any]]:
    """
    Get all negative test cases.
    
    Returns:
        Dictionary with all negative test case scenarios
    """
    failures = validation_failures()
    
    # Add missing field cases
    from .item_factory import ItemFactory
    factory = ItemFactory()
    base_item = factory.create_digital_item()
    
    failures["missing_name"] = missing_required_fields(base_item, ["name"])
    failures["missing_description"] = missing_required_fields(base_item, ["description"])
    failures["missing_item_type"] = missing_required_fields(base_item, ["item_type"])
    failures["missing_price"] = missing_required_fields(base_item, ["price"])
    failures["missing_category"] = missing_required_fields(base_item, ["category"])
    
    # Add invalid type cases
    failures["invalid_price_type"] = invalid_data_types(base_item, "price", "not-a-number")
    failures["invalid_name_type"] = invalid_data_types(base_item, "name", 123)
    failures["invalid_item_type_type"] = invalid_data_types(base_item, "item_type", 123)
    
    return failures
