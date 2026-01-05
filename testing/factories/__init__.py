"""
Test Data Factories Module

Provides factory classes for creating test data and managing cleanup operations.

Usage:
    from testing.factories import UserFactory, ItemFactory, CleanupFactory
    
    # Create a user
    user = UserFactory.create_editor()
    
    # Login and get token
    token = UserFactory.login(user["email"], user["password"])
    
    # Create an item
    item = ItemFactory.create_physical_item()
    
    # Cleanup
    CleanupFactory.cleanup_user_data(user["_id"])
"""

from .base_factory import BaseFactory
from .config import Config
from .helpers import (
    generate_unique_name,
    generate_unique_email,
    generate_timestamp,
    validate_object_id,
    normalize_category,
    generate_valid_password,
    get_category_for_item_type,
    get_price_range_for_category,
    generate_valid_price
)

# Import factory classes
from .user_factory import UserFactory
from .item_factory import ItemFactory
from .cleanup_factory import CleanupFactory

__all__ = [
    # Base classes
    "BaseFactory",
    "Config",
    
    # Helper functions
    "generate_unique_name",
    "generate_unique_email",
    "generate_timestamp",
    "validate_object_id",
    "normalize_category",
    "generate_valid_password",
    "get_category_for_item_type",
    "get_price_range_for_category",
    "generate_valid_price",
    
    # Factory classes
    "UserFactory",
    "ItemFactory",
    "CleanupFactory",
]

# Note: Pytest fixtures are in pytest_fixtures.py
# Import them separately: from testing.factories.pytest_fixtures import test_user

__version__ = "1.0.0"
