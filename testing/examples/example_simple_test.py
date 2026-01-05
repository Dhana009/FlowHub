"""
Simple Test Example - Basic item creation and cleanup.

This example demonstrates the simplest way to use factories:
1. Create user
2. Login
3. Create item
4. Cleanup
"""

from testing.factories import UserFactory, ItemFactory, CleanupFactory


def test_create_item_simple():
    """Simple test without fixtures."""
    # Setup
    user_factory = UserFactory()
    item_factory = ItemFactory()
    cleanup_factory = CleanupFactory()
    
    # Create user
    user = user_factory.create_editor()
    
    # Login
    login_result = user_factory.login(user["email"], user["password"])
    token = login_result["token"]
    
    # Create item
    item_data = item_factory.create_digital_item()
    created_item = item_factory.create_item_via_api(item_data, token)
    
    # Assertions
    assert created_item["_id"] is not None
    assert created_item["name"] == item_data["name"]
    assert created_item["item_type"] == "DIGITAL"
    
    # Cleanup
    cleanup_factory.cleanup_user_data(user["_id"])


if __name__ == "__main__":
    test_create_item_simple()
    print("✅ Test passed!")
