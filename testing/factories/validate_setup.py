"""
Setup Validation Script

Run this script to verify your test data factory setup is correct.
This helps identify issues before running tests.

Usage:
    python validate_setup.py
"""

"""
Setup Validation Script

Run this script to verify your test data factory setup is correct.
This helps identify issues before running tests.

Usage:
    python validate_setup.py
    
Or from project root:
    python testing/factories/validate_setup.py
"""

import sys
import os

# Add project root to path
# This allows imports to work from any directory
current_dir = os.path.dirname(os.path.abspath(__file__))
factories_dir = os.path.dirname(current_dir)
project_root = os.path.dirname(factories_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

def validate_imports():
    """Validate all imports work correctly."""
    print("🔍 Validating imports...")
    try:
        from testing.factories import (
            UserFactory, ItemFactory, CleanupFactory,
            BaseFactory, Config
        )
        from testing.factories.helpers import (
            generate_unique_name, generate_unique_email
        )
        print("✅ All imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Solution: Ensure you're running from project root or Python path is set")
        return False

def validate_dependencies():
    """Validate required dependencies are installed."""
    print("\n🔍 Validating dependencies...")
    missing = []
    
    try:
        import requests
        print("✅ requests library installed")
    except ImportError:
        missing.append("requests")
        print("❌ requests library not found")
    
    try:
        import pytest
        print("✅ pytest library installed (optional)")
    except ImportError:
        print("⚠️  pytest not installed (optional, needed for fixtures)")
    
    if missing:
        print(f"\n❌ Missing dependencies: {', '.join(missing)}")
        print("   Solution: Run 'pip install -r requirements.txt'")
        return False
    
    return True

def validate_config():
    """Validate configuration."""
    print("\n🔍 Validating configuration...")
    try:
        from testing.factories.config import Config
        
        print(f"   API Base URL: {Config.API_BASE_URL}")
        print(f"   Internal Key: {Config.INTERNAL_AUTOMATION_KEY[:20]}...")
        print(f"   Request Timeout: {Config.REQUEST_TIMEOUT}s")
        print("✅ Configuration loaded")
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def validate_factories():
    """Validate factory classes can be instantiated."""
    print("\n🔍 Validating factory classes...")
    try:
        from testing.factories import UserFactory, ItemFactory, CleanupFactory
        
        # Test instantiation
        user_factory = UserFactory()
        item_factory = ItemFactory()
        cleanup_factory = CleanupFactory()
        
        print("✅ All factory classes instantiated successfully")
        return True
    except Exception as e:
        print(f"❌ Factory instantiation error: {e}")
        return False

def validate_helpers():
    """Validate helper functions work."""
    print("\n🔍 Validating helper functions...")
    try:
        from testing.factories.helpers import (
            generate_unique_name,
            generate_unique_email,
            generate_valid_password,
            validate_object_id
        )
        
        # Test functions
        name = generate_unique_name()
        email = generate_unique_email()
        password = generate_valid_password()
        is_valid = validate_object_id("507f1f77bcf86cd799439011")
        
        assert len(name) > 0
        assert "@" in email
        assert len(password) >= 8
        assert is_valid is True
        
        print("✅ All helper functions work correctly")
        return True
    except Exception as e:
        print(f"❌ Helper function error: {e}")
        return False

def validate_item_factories():
    """Validate item factory methods."""
    print("\n🔍 Validating item factory methods...")
    try:
        from testing.factories import ItemFactory
        
        factory = ItemFactory()
        
        # Test all item types
        physical = factory.create_physical_item()
        digital = factory.create_digital_item()
        service = factory.create_service_item()
        
        # Validate schemas
        assert physical["item_type"] == "PHYSICAL"
        assert "weight" in physical
        assert "dimensions" in physical
        
        assert digital["item_type"] == "DIGITAL"
        assert "download_url" in digital
        assert "file_size" in digital
        
        assert service["item_type"] == "SERVICE"
        assert "duration_hours" in service
        
        print("✅ All item factory methods work correctly")
        return True
    except Exception as e:
        print(f"❌ Item factory error: {e}")
        return False

def validate_endpoints():
    """Validate endpoint paths are correct."""
    print("\n🔍 Validating endpoint paths...")
    try:
        from testing.factories.config import Config
        
        # Test endpoint URL construction
        endpoints = [
            "/auth/login",
            "/auth/signup",
            "/auth/me",
            "/items",
            "/items/count",
            "/items/batch",
            "/internal/reset",
            "/internal/otp",
            "/internal/users/507f1f77bcf86cd799439011/data",
            "/internal/users/507f1f77bcf86cd799439011/items",
            "/internal/items/507f1f77bcf86cd799439011/permanent"
        ]
        
        for endpoint in endpoints:
            url = Config.get_api_url(endpoint)
            assert url.startswith("http")
            assert "/api/v1" in url
        
        print("✅ All endpoint paths are valid")
        return True
    except Exception as e:
        print(f"❌ Endpoint validation error: {e}")
        return False

def main():
    """Run all validation checks."""
    print("=" * 60)
    print("Test Data Factory - Setup Validation")
    print("=" * 60)
    
    results = []
    
    results.append(("Imports", validate_imports()))
    results.append(("Dependencies", validate_dependencies()))
    results.append(("Configuration", validate_config()))
    results.append(("Factories", validate_factories()))
    results.append(("Helpers", validate_helpers()))
    results.append(("Item Factories", validate_item_factories()))
    results.append(("Endpoints", validate_endpoints()))
    
    print("\n" + "=" * 60)
    print("Validation Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nTotal: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 All validations passed! You're ready to use the factories.")
        return 0
    else:
        print("\n⚠️  Some validations failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
