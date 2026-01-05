"""
Pytest fixtures for test data factories.

Provides reusable fixtures for creating test data and managing cleanup
in pytest test suites.
"""

import pytest
import logging
from typing import Dict, Any, Generator, Callable, Optional

from .base_factory import BaseFactory
from .user_factory import UserFactory
from .item_factory import ItemFactory
from .cleanup_factory import CleanupFactory
from .config import Config

logger = logging.getLogger(__name__)


@pytest.fixture(scope="session")
def api_client() -> BaseFactory:
    """
    HTTP client fixture (session-scoped).
    
    Returns:
        BaseFactory instance with HTTP client
    """
    client = BaseFactory()
    yield client
    client.close()


@pytest.fixture(scope="function")
def user_factory(api_client: BaseFactory) -> UserFactory:
    """
    UserFactory fixture (function-scoped).
    
    Args:
        api_client: HTTP client fixture
        
    Returns:
        UserFactory instance
    """
    factory = UserFactory()
    factory.session = api_client.session  # Share session
    yield factory
    factory.close()


@pytest.fixture(scope="function")
def item_factory(api_client: BaseFactory) -> ItemFactory:
    """
    ItemFactory fixture (function-scoped).
    
    Args:
        api_client: HTTP client fixture
        
    Returns:
        ItemFactory instance
    """
    factory = ItemFactory()
    factory.session = api_client.session  # Share session
    yield factory
    factory.close()


@pytest.fixture(scope="function")
def cleanup_factory(api_client: BaseFactory) -> CleanupFactory:
    """
    CleanupFactory fixture (function-scoped).
    
    Args:
        api_client: HTTP client fixture
        
    Returns:
        CleanupFactory instance
    """
    factory = CleanupFactory()
    factory.session = api_client.session  # Share session
    yield factory
    factory.close()


@pytest.fixture(scope="function")
def test_user(user_factory: UserFactory, cleanup_factory: CleanupFactory) -> Generator[Dict[str, Any], None, None]:
    """
    Create a test editor user with automatic cleanup.
    
    Yields:
        Dictionary with user data and token:
        {
            "user": {...},
            "token": "JWT token",
            "email": "...",
            "password": "..."
        }
    """
    # Setup: Create user
    user = user_factory.create_editor()
    login_result = user_factory.login(user["email"], user["password"])
    token = login_result["token"]
    
    test_data = {
        "user": user,
        "token": token,
        "email": user["email"],
        "password": user["password"],
        "_id": user["_id"]
    }
    
    yield test_data
    
    # Teardown: Cleanup user data
    try:
        cleanup_factory.cleanup_user_data(user["_id"])
    except Exception as e:
        logger.warning(f"Failed to cleanup user {user['_id']}: {e}")


@pytest.fixture(scope="function")
def test_admin(user_factory: UserFactory, cleanup_factory: CleanupFactory) -> Generator[Dict[str, Any], None, None]:
    """
    Create a test admin user with automatic cleanup.
    
    Yields:
        Dictionary with admin user data and token
    """
    # Setup: Create admin
    user = user_factory.create_admin()
    login_result = user_factory.login(user["email"], user["password"])
    token = login_result["token"]
    
    test_data = {
        "user": user,
        "token": token,
        "email": user["email"],
        "password": user["password"],
        "_id": user["_id"]
    }
    
    yield test_data
    
    # Teardown: Cleanup user data
    try:
        cleanup_factory.cleanup_user_data(user["_id"])
    except Exception as e:
        logger.warning(f"Failed to cleanup admin {user['_id']}: {e}")


@pytest.fixture(scope="function")
def test_editor(user_factory: UserFactory, cleanup_factory: CleanupFactory) -> Generator[Dict[str, Any], None, None]:
    """
    Create a test editor user with automatic cleanup.
    
    Yields:
        Dictionary with editor user data and token
    """
    # Setup: Create editor
    user = user_factory.create_editor()
    login_result = user_factory.login(user["email"], user["password"])
    token = login_result["token"]
    
    test_data = {
        "user": user,
        "token": token,
        "email": user["email"],
        "password": user["password"],
        "_id": user["_id"]
    }
    
    yield test_data
    
    # Teardown: Cleanup user data
    try:
        cleanup_factory.cleanup_user_data(user["_id"])
    except Exception as e:
        logger.warning(f"Failed to cleanup editor {user['_id']}: {e}")


@pytest.fixture(scope="function")
def test_viewer(user_factory: UserFactory, cleanup_factory: CleanupFactory) -> Generator[Dict[str, Any], None, None]:
    """
    Create a test viewer user with automatic cleanup.
    
    Yields:
        Dictionary with viewer user data and token
    """
    # Setup: Create viewer
    user = user_factory.create_viewer()
    login_result = user_factory.login(user["email"], user["password"])
    token = login_result["token"]
    
    test_data = {
        "user": user,
        "token": token,
        "email": user["email"],
        "password": user["password"],
        "_id": user["_id"]
    }
    
    yield test_data
    
    # Teardown: Cleanup user data
    try:
        cleanup_factory.cleanup_user_data(user["_id"])
    except Exception as e:
        logger.warning(f"Failed to cleanup viewer {user['_id']}: {e}")


@pytest.fixture(scope="function")
def test_item(
    item_factory: ItemFactory,
    test_user: Dict[str, Any],
    cleanup_factory: CleanupFactory
) -> Generator[Dict[str, Any], None, None]:
    """
    Create a test item with automatic cleanup.
    
    Requires:
        test_user fixture (provides token)
    
    Yields:
        Dictionary with created item data
    """
    # Setup: Create item
    item_data = item_factory.create_digital_item()
    created_item = item_factory.create_item_via_api(item_data, test_user["token"])
    
    yield created_item
    
    # Teardown: Cleanup item
    try:
        item_id = created_item.get("_id")
        if item_id:
            cleanup_factory.cleanup_single_item(item_id)
    except Exception as e:
        logger.warning(f"Failed to cleanup item {created_item.get('_id')}: {e}")


@pytest.fixture(scope="function")
def make_user(user_factory: UserFactory, cleanup_factory: CleanupFactory) -> Callable:
    """
    Factory as fixture pattern - returns a function to create users.
    
    Usage:
        def test_something(make_user):
            user1 = make_user(role="ADMIN")
            user2 = make_user(role="EDITOR")
            # Users automatically cleaned up after test
    
    Returns:
        Function that creates users with automatic cleanup
    """
    created_users = []
    
    def _make_user(
        first_name: str = "Test",
        last_name: str = "User",
        email: Optional[str] = None,
        password: Optional[str] = None,
        role: str = "EDITOR"
    ) -> Dict[str, Any]:
        """Create user and track for cleanup."""
        user = user_factory.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            role=role
        )
        login_result = user_factory.login(user["email"], user["password"])
        
        user_data = {
            "user": user,
            "token": login_result["token"],
            "email": user["email"],
            "password": user["password"],
            "_id": user["_id"]
        }
        
        created_users.append(user_data)
        return user_data
    
    yield _make_user
    
    # Teardown: Cleanup all created users
    for user_data in created_users:
        try:
            cleanup_factory.cleanup_user_data(user_data["_id"])
        except Exception as e:
            logger.warning(f"Failed to cleanup user {user_data['_id']}: {e}")


@pytest.fixture(scope="function")
def make_item(item_factory: ItemFactory, cleanup_factory: CleanupFactory) -> Callable:
    """
    Factory as fixture pattern - returns a function to create items.
    
    Usage:
        def test_something(make_item, test_user):
            item1 = make_item(item_type="PHYSICAL", token=test_user["token"])
            item2 = make_item(item_type="DIGITAL", token=test_user["token"])
            # Items automatically cleaned up after test
    
    Returns:
        Function that creates items with automatic cleanup
    """
    created_items = []
    
    def _make_item(
        item_type: str = "DIGITAL",
        token: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Create item and track for cleanup."""
        if not token:
            raise ValueError("Token is required to create item via API")
        
        item_data = item_factory.create_item(item_type, **kwargs)
        created_item = item_factory.create_item_via_api(item_data, token)
        
        created_items.append(created_item)
        return created_item
    
    yield _make_item
    
    # Teardown: Cleanup all created items
    for item in created_items:
        try:
            item_id = item.get("_id")
            if item_id:
                cleanup_factory.cleanup_single_item(item_id)
        except Exception as e:
            logger.warning(f"Failed to cleanup item {item.get('_id')}: {e}")
