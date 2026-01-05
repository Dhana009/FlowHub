"""
Edge case generators for test data.

Provides functions to generate edge case test data (boundaries, special characters, etc.).
"""

import copy
from typing import Dict, Any


def min_boundary_values() -> Dict[str, Any]:
    """
    Generate item with minimum boundary values.
    
    Returns:
        Dictionary with item data at minimum boundaries
    """
    from .item_factory import ItemFactory
    
    factory = ItemFactory()
    return {
        "name": "ABC",  # Min length: 3
        "description": "1234567890",  # Min length: 10
        "item_type": "DIGITAL",
        "price": 0.01,  # Min price
        "category": "Software",
        "download_url": "https://example.com/file.zip",
        "file_size": 1  # Min file size
    }


def max_boundary_values() -> Dict[str, Any]:
    """
    Generate item with maximum boundary values.
    
    Returns:
        Dictionary with item data at maximum boundaries
    """
    from .item_factory import ItemFactory
    
    factory = ItemFactory()
    return {
        "name": "A" * 100,  # Max length: 100
        "description": "A" * 500,  # Max length: 500
        "item_type": "DIGITAL",
        "price": 999999.99,  # Max price
        "category": "Software",
        "download_url": "https://example.com/file.zip",
        "file_size": 1000000000  # 1GB
    }


def special_characters() -> Dict[str, Any]:
    """
    Generate item with special characters in name and description.
    
    Returns:
        Dictionary with item data containing special characters
    """
    from .item_factory import ItemFactory
    
    factory = ItemFactory()
    base_item = factory.create_digital_item()
    
    return {
        **base_item,
        "name": "Test-Item_123 Special!@#",
        "description": "Description with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?"
    }


def unicode_characters() -> Dict[str, Any]:
    """
    Generate item with Unicode characters.
    
    Returns:
        Dictionary with item data containing Unicode characters
    """
    from .item_factory import ItemFactory
    
    factory = ItemFactory()
    base_item = factory.create_digital_item()
    
    return {
        **base_item,
        "name": "Test Item 测试 テスト тест",
        "description": "Description with Unicode: 测试 テスト тест 🚀 ✅ ❌"
    }


def category_case_variations() -> Dict[str, Dict[str, Any]]:
    """
    Generate items with category case variations (to test normalization).
    
    Returns:
        Dictionary with different case variations:
        {
            "lowercase": {...},
            "uppercase": {...},
            "mixed": {...}
        }
    """
    from .item_factory import ItemFactory
    
    factory = ItemFactory()
    base_item = factory.create_digital_item()
    
    return {
        "lowercase": {
            **base_item,
            "category": "software"
        },
        "uppercase": {
            **base_item,
            "category": "SOFTWARE"
        },
        "mixed": {
            **base_item,
            "category": "SoFtWaRe"
        }
    }


def price_boundary_cases() -> Dict[str, Dict[str, Any]]:
    """
    Generate items with price at various boundaries.
    
    Returns:
        Dictionary with price boundary cases:
        {
            "min_valid": {...},  # 0.01
            "max_valid": {...},  # 999999.99
            "just_below_min": {...},  # 0.00
            "just_above_max": {...},  # 1000000.00
        }
    """
    from .item_factory import ItemFactory
    
    factory = ItemFactory()
    base_item = factory.create_digital_item()
    
    return {
        "min_valid": {
            **base_item,
            "price": 0.01
        },
        "max_valid": {
            **base_item,
            "price": 999999.99
        },
        "just_below_min": {
            **base_item,
            "price": 0.00
        },
        "just_above_max": {
            **base_item,
            "price": 1000000.00
        }
    }


def tag_edge_cases() -> Dict[str, Dict[str, Any]]:
    """
    Generate items with tag edge cases.
    
    Returns:
        Dictionary with tag edge cases:
        {
            "max_tags": {...},  # 10 tags
            "empty_tags": {...},  # Empty array
            "single_tag": {...},  # 1 tag
            "tags_with_special_chars": {...}
        }
    """
    from .item_factory import ItemFactory
    
    factory = ItemFactory()
    base_item = factory.create_digital_item()
    
    return {
        "max_tags": {
            **base_item,
            "tags": [f"tag{i}" for i in range(10)]  # Max 10 tags
        },
        "empty_tags": {
            **base_item,
            "tags": []
        },
        "single_tag": {
            **base_item,
            "tags": ["test"]
        },
        "tags_with_special_chars": {
            **base_item,
            "tags": ["test-tag", "test_tag", "test.tag"]
        }
    }


def get_all_edge_cases() -> Dict[str, Any]:
    """
    Get all edge case test data.
    
    Returns:
        Dictionary with all edge case scenarios
    """
    return {
        "min_boundary": min_boundary_values(),
        "max_boundary": max_boundary_values(),
        "special_chars": special_characters(),
        "unicode": unicode_characters(),
        "category_cases": category_case_variations(),
        "price_boundaries": price_boundary_cases(),
        "tag_edges": tag_edge_cases()
    }
