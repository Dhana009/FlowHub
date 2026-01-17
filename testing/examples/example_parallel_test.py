"""
Parallel Execution Test Example.

This example demonstrates:
- User isolation for parallel execution
- Unique identifiers
- Safe parallel cleanup
"""

import pytest
from testing.factories import UserFactory, ItemFactory, CleanupFactory
from testing.factories.helpers import generate_unique_email


def test_parallel_user_isolation():
    """
    Test user isolation for parallel execution.
    
    Each test gets a unique user with unique email.
    """
    user_factory = UserFactory()
    item_factory = ItemFactory()
    cleanup_factory = CleanupFactory()
    
    # Create unique user (factories auto-generate unique emails)
    user = user_factory.create_editor()
    login_result = user_factory.login(user["email"], user["password"])
    token = login_result["token"]
    
    # Create item with unique name (factories auto-generate)
    item_data = item_factory.create_digital_item()
    created_item = item_factory.create_item_via_api(item_data, token)
    
    # Assertions
    assert user["_id"] is not None
    assert created_item["_id"] is not None
    assert "@" in user["email"]  # Valid email format
    
    # Cleanup
    cleanup_factory.cleanup_user_data(user["_id"])


def test_unique_identifiers():
    """Test that factories generate unique identifiers."""
    user_factory = UserFactory()
    item_factory = ItemFactory()
    cleanup_factory = CleanupFactory()
    
    # Create multiple users
    user1 = user_factory.create_editor()
    user2 = user_factory.create_editor()
    user3 = user_factory.create_editor()
    
    # Assertions - all emails should be unique
    emails = [user1["email"], user2["email"], user3["email"]]
    assert len(emails) == len(set(emails))  # All unique
    
    # Create multiple items
    item1 = item_factory.create_digital_item()
    item2 = item_factory.create_digital_item()
    item3 = item_factory.create_digital_item()
    
    # Assertions - all names should be unique
    names = [item1["name"], item2["name"], item3["name"]]
    assert len(names) == len(set(names))  # All unique
    
    # Cleanup
    cleanup_factory.cleanup_user_data(user1["_id"])
    cleanup_factory.cleanup_user_data(user2["_id"])
    cleanup_factory.cleanup_user_data(user3["_id"])


@pytest.mark.parametrize("item_type", ["PHYSICAL", "DIGITAL", "SERVICE"])
def test_parallel_item_types(item_type, test_user):
    """
    Parameterized test for parallel execution.
    
    Each parameterized test gets its own test_user fixture.
    """
    item_factory = ItemFactory()
    cleanup_factory = CleanupFactory()
    
    # Create item of specified type
    item_data = item_factory.create_item(item_type)
    created_item = item_factory.create_item_via_api(item_data, test_user["token"])
    
    # Assertions
    assert created_item["item_type"] == item_type
    assert created_item["_id"] is not None
    
    # Cleanup handled by test_user fixture
