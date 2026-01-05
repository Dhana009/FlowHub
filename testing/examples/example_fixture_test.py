"""
Fixture Test Example - Using pytest fixtures for automatic cleanup.

This example demonstrates using pytest fixtures:
- Automatic setup and teardown
- No manual cleanup required
- Clean, readable test code
"""

import pytest
from testing.factories.pytest_fixtures import test_user, test_item, make_item


def test_create_item_with_fixture(test_user, test_item):
    """
    Test using fixtures - automatic cleanup.
    
    test_user: Editor user with token (auto-created and cleaned up)
    test_item: Digital item (auto-created and cleaned up)
    """
    # Assertions
    assert test_item["_id"] is not None
    assert test_item["name"] is not None
    assert test_item["item_type"] == "DIGITAL"
    assert test_user["token"] is not None


def test_multiple_items_with_fixture(make_item, test_user):
    """
    Test using factory as fixture pattern.
    
    make_item: Factory function to create multiple items
    test_user: User with token
    """
    # Create multiple items
    item1 = make_item(item_type="PHYSICAL", token=test_user["token"])
    item2 = make_item(item_type="DIGITAL", token=test_user["token"])
    item3 = make_item(item_type="SERVICE", token=test_user["token"])
    
    # Assertions
    assert item1["_id"] != item2["_id"]
    assert item2["_id"] != item3["_id"]
    assert item1["item_type"] == "PHYSICAL"
    assert item2["item_type"] == "DIGITAL"
    assert item3["item_type"] == "SERVICE"
    
    # All items automatically cleaned up after test


def test_different_user_roles(test_admin, test_editor, test_viewer):
    """
    Test with different user roles.
    
    All users automatically created and cleaned up.
    """
    # Assertions
    assert test_admin["user"]["role"] == "ADMIN"
    assert test_editor["user"]["role"] == "EDITOR"
    assert test_viewer["user"]["role"] == "VIEWER"
    
    # All users have tokens
    assert test_admin["token"] is not None
    assert test_editor["token"] is not None
    assert test_viewer["token"] is not None
