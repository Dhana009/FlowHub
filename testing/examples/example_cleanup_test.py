"""
Cleanup Test Example - Different cleanup strategies.

This example demonstrates:
- User data cleanup (preserves user)
- Items-only cleanup
- Single item cleanup
- Database reset (use with caution!)
"""

import pytest
from testing.factories import UserFactory, ItemFactory, CleanupFactory
from testing.factories.pytest_fixtures import test_user, make_item


def test_cleanup_user_data(test_user, make_item):
    """Test cleanup of all user data (preserves user record)."""
    item_factory = ItemFactory()
    cleanup_factory = CleanupFactory()
    
    # Create multiple items
    item1 = make_item(item_type="PHYSICAL", token=test_user["token"])
    item2 = make_item(item_type="DIGITAL", token=test_user["token"])
    
    # Cleanup all user data (preserves user)
    result = cleanup_factory.cleanup_user_data(test_user["_id"])
    
    # Assertions
    assert result["deleted"]["items"] >= 2
    assert result["preserved"]["user"] is True


def test_cleanup_user_items_only(test_user, make_item):
    """Test cleanup of only items (preserves other data)."""
    item_factory = ItemFactory()
    cleanup_factory = CleanupFactory()
    
    # Create items
    item1 = make_item(item_type="PHYSICAL", token=test_user["token"])
    item2 = make_item(item_type="DIGITAL", token=test_user["token"])
    
    # Cleanup only items
    result = cleanup_factory.cleanup_user_items(test_user["_id"])
    
    # Assertions
    assert result["deleted"]["items"] >= 2
    assert result["preserved"]["user"] is True
    assert result["preserved"]["bulk_jobs"] is True
    assert result["preserved"]["activity_logs"] is True
    assert result["preserved"]["otps"] is True


def test_cleanup_single_item(test_user):
    """Test cleanup of a single item."""
    item_factory = ItemFactory()
    cleanup_factory = CleanupFactory()
    
    # Create item
    item_data = item_factory.create_digital_item()
    created_item = item_factory.create_item_via_api(item_data, test_user["token"])
    item_id = created_item["_id"]
    
    # Cleanup single item
    result = cleanup_factory.cleanup_single_item(item_id)
    
    # Assertions
    assert result["deleted"]["item_deleted"] is True


def test_cleanup_with_options(test_user, make_item):
    """Test cleanup with options (preserve OTPs and activity logs)."""
    cleanup_factory = CleanupFactory()
    
    # Create items
    make_item(item_type="PHYSICAL", token=test_user["token"])
    make_item(item_type="DIGITAL", token=test_user["token"])
    
    # Cleanup without OTPs and activity logs
    result = cleanup_factory.cleanup_user_data(
        test_user["_id"],
        include_otp=False,
        include_activity_logs=False
    )
    
    # Assertions
    assert result["deleted"]["items"] >= 2
    assert result["preserved"]["user"] is True
