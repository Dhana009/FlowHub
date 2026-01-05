"""
Helper utilities for test data factories.

Provides utility functions for generating unique identifiers, validating data,
and other common operations used across factory classes.
"""

import time
import random
import string
import re
from typing import Optional, Tuple
from datetime import datetime


def generate_unique_name(prefix: str = "Test", suffix: Optional[str] = None) -> str:
    """
    Generate a unique name for test items.
    
    Args:
        prefix: Prefix for the name (default: "Test")
        suffix: Optional suffix (default: None, uses timestamp)
        
    Returns:
        Unique name string (e.g., "Test Item 1704456000_abc123")
    """
    if suffix is None:
        timestamp = int(time.time())
        random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        suffix = f"{timestamp}_{random_suffix}"
    
    return f"{prefix} {suffix}"


def generate_unique_email(prefix: str = "test", domain: str = "test.com") -> str:
    """
    Generate a unique email address for test users.
    
    Args:
        prefix: Email prefix (default: "test")
        domain: Email domain (default: "test.com")
        
    Returns:
        Unique email string (e.g., "test_1704456000_abc123@test.com")
    """
    timestamp = int(time.time())
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"{prefix}_{timestamp}_{random_suffix}@{domain}"


def generate_timestamp() -> str:
    """
    Generate ISO 8601 timestamp string.
    
    Returns:
        ISO 8601 formatted timestamp (e.g., "2025-01-05T16:50:00Z")
    """
    return datetime.utcnow().isoformat() + "Z"


def validate_object_id(object_id: str) -> bool:
    """
    Validate MongoDB ObjectId format (24 hex characters).
    
    Args:
        object_id: ObjectId string to validate
        
    Returns:
        True if valid ObjectId format, False otherwise
    """
    if not object_id or not isinstance(object_id, str):
        return False
    
    # MongoDB ObjectId is exactly 24 hexadecimal characters
    pattern = r'^[0-9a-fA-F]{24}$'
    return bool(re.match(pattern, object_id))


def normalize_category(category: str) -> str:
    """
    Normalize category to Title Case (as backend does).
    
    Args:
        category: Category string (e.g., "electronics", "Electronics", "ELECTRONICS")
        
    Returns:
        Title Case category (e.g., "Electronics")
    """
    if not category:
        return category
    
    # Convert to title case (first letter uppercase, rest lowercase)
    return category.title()


def generate_random_string(length: int = 10, chars: str = string.ascii_letters + string.digits) -> str:
    """
    Generate a random string of specified length.
    
    Args:
        length: Length of the string (default: 10)
        chars: Character set to use (default: alphanumeric)
        
    Returns:
        Random string
    """
    return ''.join(random.choices(chars, k=length))


def generate_valid_password() -> str:
    """
    Generate a valid password meeting requirements:
    - Minimum 8 characters
    - Contains uppercase, lowercase, number, and special character
    
    Returns:
        Valid password string
    """
    # Ensure we meet all requirements
    uppercase = random.choice(string.ascii_uppercase)
    lowercase = random.choice(string.ascii_lowercase)
    digit = random.choice(string.digits)
    special = random.choice("!@#$%^&*")
    
    # Fill remaining length with random characters
    remaining_length = 8 - 4  # Minimum 8, we have 4 already
    remaining = ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=remaining_length))
    
    # Shuffle all characters
    password_chars = list(uppercase + lowercase + digit + special + remaining)
    random.shuffle(password_chars)
    
    return ''.join(password_chars)


def get_category_for_item_type(item_type: str) -> str:
    """
    Get a valid category for the given item_type based on business rules.
    
    Business Rules:
    - Electronics → must be PHYSICAL
    - Software → must be DIGITAL
    - Services → must be SERVICE
    
    Args:
        item_type: Item type (PHYSICAL, DIGITAL, or SERVICE)
        
    Returns:
        Valid category for the item type
    """
    category_map = {
        "PHYSICAL": "Electronics",
        "DIGITAL": "Software",
        "SERVICE": "Services"
    }
    
    return category_map.get(item_type.upper(), "General")


def get_price_range_for_category(category: str) -> Tuple[float, float]:
    """
    Get valid price range for a category based on business rules.
    
    Business Rules:
    - Electronics: $10.00 - $50,000.00
    - Books: $5.00 - $500.00
    - Services: $25.00 - $10,000.00
    - Other categories: $0.01 - $999,999.99
    
    Args:
        category: Category name
        
    Returns:
        Tuple of (min_price, max_price)
    """
    category = normalize_category(category)
    
    price_ranges = {
        "Electronics": (10.00, 50000.00),
        "Books": (5.00, 500.00),
        "Services": (25.00, 10000.00),  # Services range: $25-$10,000
        "Software": (0.01, 999999.99)
    }
    
    return price_ranges.get(category, (0.01, 999999.99))


def generate_valid_price(category: Optional[str] = None) -> float:
    """
    Generate a valid price within the range for the category.
    
    Args:
        category: Optional category to determine price range
        
    Returns:
        Valid price (rounded to 2 decimal places)
    """
    if category:
        min_price, max_price = get_price_range_for_category(category)
    else:
        min_price, max_price = (0.01, 999999.99)
    
    # Generate random price within range
    price = random.uniform(min_price, max_price)
    return round(price, 2)


def truncate_string(text: str, max_length: int) -> str:
    """
    Truncate string to maximum length.
    
    Args:
        text: String to truncate
        max_length: Maximum length
        
    Returns:
        Truncated string
    """
    if len(text) <= max_length:
        return text
    return text[:max_length]


def ensure_min_length(text: str, min_length: int, fill_char: str = "x") -> str:
    """
    Ensure string meets minimum length requirement.
    
    Args:
        text: String to check
        min_length: Minimum required length
        fill_char: Character to use for padding
        
    Returns:
        String with minimum length
    """
    if len(text) >= min_length:
        return text
    
    padding_needed = min_length - len(text)
    return text + (fill_char * padding_needed)
