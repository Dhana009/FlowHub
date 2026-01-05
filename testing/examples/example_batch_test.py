"""
Batch Operations Test Example.

This example demonstrates:
- Batch item creation
- Batch cleanup
- Efficient test data management
"""

import pytest
from testing.factories import ItemFactory, CleanupFactory
from testing.factories.pytest_fixtures import test_user


def test_batch_item_creation(test_user):
    """Test creating multiple items in batch."""
    item_factory = ItemFactory()
    
    # Create batch of items
    batch_items = item_factory.create_batch_items(
        count=10,
        item_type="DIGITAL"
    )
    
    # Create items via API
    created_items = []
    for item_data in batch_items:
        created_item = item_factory.create_item_via_api(
            item_data,
            test_user["token"]
        )
        created_items.append(created_item)
    
    # Assertions
    assert len(created_items) == 10
    assert all(item["_id"] is not None for item in created_items)
    assert all(item["item_type"] == "DIGITAL" for item in created_items)
    
    # Cleanup (using cleanup_factory)
    cleanup_factory = CleanupFactory()
    cleanup_factory.cleanup_user_items(test_user["_id"])


def test_batch_with_variations(test_user):
    """Test batch creation with different variations."""
    item_factory = ItemFactory()
    
    # Create batch with different prices
    items = []
    for i in range(5):
        item_data = item_factory.create_digital_item(
            price=10.00 + (i * 10.00)
        )
        created_item = item_factory.create_item_via_api(
            item_data,
            test_user["token"]
        )
        items.append(created_item)
    
    # Assertions
    assert len(items) == 5
    prices = [item["price"] for item in items]
    assert prices == [10.00, 20.00, 30.00, 40.00, 50.00]
    
    # Cleanup
    cleanup_factory = CleanupFactory()
    cleanup_factory.cleanup_user_items(test_user["_id"])
