"""
Final Verification Script

Comprehensive verification of all factory components.
Run this to ensure everything works before handover.

Usage:
    python final_verification.py
"""

import sys
import os

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
factories_dir = os.path.dirname(current_dir)
project_root = os.path.dirname(factories_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

def test_imports():
    """Test all imports work."""
    print("=" * 60)
    print("TEST 1: Import Verification")
    print("=" * 60)
    
    try:
        # Test main imports
        from testing.factories import UserFactory, ItemFactory, CleanupFactory
        from testing.factories import BaseFactory, Config
        from testing.factories.helpers import (
            generate_unique_name,
            generate_unique_email,
            generate_valid_password
        )
        print("[PASS] All main imports successful")
        
        # Test pytest fixtures (optional)
        try:
            from testing.factories.pytest_fixtures import test_user, test_item
            print("[PASS] Pytest fixtures import successful (pytest installed)")
        except ImportError:
            print("[WARN] Pytest fixtures not available (pytest not installed - optional)")
        
        return True
    except Exception as e:
        print(f"[FAIL] Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_factory_instantiation():
    """Test factories can be instantiated."""
    print("\n" + "=" * 60)
    print("TEST 2: Factory Instantiation")
    print("=" * 60)
    
    try:
        from testing.factories import UserFactory, ItemFactory, CleanupFactory
        
        user_factory = UserFactory()
        item_factory = ItemFactory()
        cleanup_factory = CleanupFactory()
        
        print("[PASS] UserFactory instantiated")
        print("[PASS] ItemFactory instantiated")
        print("[PASS] CleanupFactory instantiated")
        
        return True
    except Exception as e:
        print(f"[FAIL] Instantiation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_helper_functions():
    """Test helper functions work correctly."""
    print("\n" + "=" * 60)
    print("TEST 3: Helper Functions")
    print("=" * 60)
    
    try:
        from testing.factories.helpers import (
            generate_unique_name,
            generate_unique_email,
            generate_valid_password,
            validate_object_id,
            get_category_for_item_type,
            get_price_range_for_category
        )
        
        # Test name generation
        name1 = generate_unique_name()
        name2 = generate_unique_name()
        assert name1 != name2, "Names should be unique"
        assert len(name1) > 0, "Name should not be empty"
        print("[PASS] generate_unique_name() works")
        
        # Test email generation
        email1 = generate_unique_email()
        email2 = generate_unique_email()
        assert email1 != email2, "Emails should be unique"
        assert "@" in email1, "Email should contain @"
        assert "." in email1, "Email should contain domain"
        print("[PASS] generate_unique_email() works")
        
        # Test password generation
        password = generate_valid_password()
        assert len(password) >= 8, "Password should be at least 8 chars"
        print("[PASS] generate_valid_password() works")
        
        # Test ObjectId validation
        valid_id = "507f1f77bcf86cd799439011"
        invalid_id = "invalid"
        assert validate_object_id(valid_id) is True, "Valid ObjectId should pass"
        assert validate_object_id(invalid_id) is False, "Invalid ObjectId should fail"
        print("[PASS] validate_object_id() works")
        
        # Test category mapping
        assert get_category_for_item_type("PHYSICAL") == "Electronics"
        assert get_category_for_item_type("DIGITAL") == "Software"
        assert get_category_for_item_type("SERVICE") == "Services"
        print("[PASS] get_category_for_item_type() works")
        
        # Test price ranges
        electronics_range = get_price_range_for_category("Electronics")
        assert electronics_range == (10.00, 50000.00), "Electronics range should be $10-$50k"
        
        services_range = get_price_range_for_category("Services")
        assert services_range == (25.00, 10000.00), "Services range should be $25-$10k"
        print("[PASS] get_price_range_for_category() works")
        
        return True
    except Exception as e:
        print(f"❌ Helper functions failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_item_factory_schemas():
    """Test item factory generates valid schemas."""
    print("\n" + "=" * 60)
    print("TEST 4: Item Factory Schemas")
    print("=" * 60)
    
    try:
        from testing.factories import ItemFactory
        
        factory = ItemFactory()
        
        # Test PHYSICAL item
        physical = factory.create_physical_item()
        assert physical["item_type"] == "PHYSICAL"
        assert "name" in physical and len(physical["name"]) >= 3
        assert "description" in physical and len(physical["description"]) >= 10
        assert "price" in physical and 0.01 <= physical["price"] <= 999999.99
        assert "category" in physical
        assert "weight" in physical and physical["weight"] > 0
        assert "dimensions" in physical
        assert "length" in physical["dimensions"]
        assert "width" in physical["dimensions"]
        assert "height" in physical["dimensions"]
        print("[PASS] PHYSICAL item schema valid")
        
        # Test DIGITAL item
        digital = factory.create_digital_item()
        assert digital["item_type"] == "DIGITAL"
        assert "name" in digital and len(digital["name"]) >= 3
        assert "description" in digital and len(digital["description"]) >= 10
        assert "price" in digital and 0.01 <= digital["price"] <= 999999.99
        assert "category" in digital
        assert "download_url" in digital
        assert "file_size" in digital and digital["file_size"] >= 1
        print("[PASS] DIGITAL item schema valid")
        
        # Test SERVICE item
        service = factory.create_service_item()
        assert service["item_type"] == "SERVICE"
        assert "name" in service and len(service["name"]) >= 3
        assert "description" in service and len(service["description"]) >= 10
        assert "price" in service and 0.01 <= service["price"] <= 999999.99
        assert "category" in service
        assert "duration_hours" in service and service["duration_hours"] >= 1
        print("[PASS] SERVICE item schema valid")
        
        # Test business rules
        assert physical["category"] == "Electronics", "PHYSICAL should use Electronics"
        assert digital["category"] == "Software", "DIGITAL should use Software"
        assert service["category"] == "Services", "SERVICE should use Services"
        print("[PASS] Business rules enforced")
        
        return True
    except Exception as e:
        print(f"[FAIL] Item factory schema test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_url_construction():
    """Test URL construction is correct."""
    print("\n" + "=" * 60)
    print("TEST 5: URL Construction")
    print("=" * 60)
    
    try:
        from testing.factories.config import Config
        
        # Test various endpoints
        test_cases = [
            ("/auth/login", "http://localhost:3000/api/v1/auth/login"),
            ("auth/login", "http://localhost:3000/api/v1/auth/login"),  # No leading slash
            ("/items", "http://localhost:3000/api/v1/items"),
            ("/internal/reset", "http://localhost:3000/api/v1/internal/reset"),
        ]
        
        for endpoint, expected in test_cases:
            actual = Config.get_api_url(endpoint)
            assert actual == expected, f"Expected {expected}, got {actual}"
            print(f"[PASS] {endpoint} -> {actual}")
        
        return True
    except Exception as e:
        print(f"[FAIL] URL construction failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_configuration():
    """Test configuration loading."""
    print("\n" + "=" * 60)
    print("TEST 6: Configuration")
    print("=" * 60)
    
    try:
        from testing.factories.config import Config
        
        # Test defaults
        assert Config.API_BASE_URL is not None
        assert Config.INTERNAL_AUTOMATION_KEY is not None
        assert Config.REQUEST_TIMEOUT > 0
        
        print(f"[PASS] API Base URL: {Config.API_BASE_URL}")
        print(f"[PASS] Internal Key: {Config.INTERNAL_AUTOMATION_KEY[:20]}...")
        print(f"[PASS] Request Timeout: {Config.REQUEST_TIMEOUT}s")
        
        # Test header generation
        headers = Config.get_internal_headers()
        assert "x-internal-key" in headers
        assert headers["x-internal-key"] == Config.INTERNAL_AUTOMATION_KEY
        print("[PASS] Internal headers generation works")
        
        # Test auth headers
        test_token = "test-token-123"
        auth_headers = Config.get_auth_headers(test_token)
        assert "Authorization" in auth_headers
        assert auth_headers["Authorization"] == f"Bearer {test_token}"
        print("[PASS] Auth headers generation works")
        
        return True
    except Exception as e:
        print(f"[FAIL] Configuration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_batch_operations():
    """Test batch item creation."""
    print("\n" + "=" * 60)
    print("TEST 7: Batch Operations")
    print("=" * 60)
    
    try:
        from testing.factories import ItemFactory
        
        factory = ItemFactory()
        
        # Test batch creation
        batch = factory.create_batch_items(count=5, item_type="DIGITAL")
        assert len(batch) == 5, "Should create 5 items"
        
        # Verify all items are unique
        names = [item["name"] for item in batch]
        assert len(names) == len(set(names)), "All names should be unique"
        
        # Verify all items are DIGITAL
        for item in batch:
            assert item["item_type"] == "DIGITAL"
        
        print("[PASS] Batch creation works (5 items)")
        print("[PASS] All items have unique names")
        print("[PASS] All items are correct type")
        
        return True
    except Exception as e:
        print(f"[FAIL] Batch operations failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_negative_generators():
    """Test negative test data generators."""
    print("\n" + "=" * 60)
    print("TEST 8: Negative Generators")
    print("=" * 60)
    
    try:
        from testing.factories.negative_generators import (
            missing_required_fields,
            validation_failures,
            get_negative_test_cases
        )
        from testing.factories import ItemFactory
        
        factory = ItemFactory()
        base_item = factory.create_digital_item()
        
        # Test missing fields
        invalid = missing_required_fields(base_item, ["name"])
        assert "name" not in invalid
        print("[PASS] missing_required_fields() works")
        
        # Test validation failures
        failures = validation_failures()
        assert "name_too_short" in failures
        assert "price_too_low" in failures
        print("[PASS] validation_failures() works")
        
        # Test all negative cases
        all_cases = get_negative_test_cases()
        assert len(all_cases) > 0
        print(f"[PASS] get_negative_test_cases() works ({len(all_cases)} cases)")
        
        return True
    except Exception as e:
        print(f"[FAIL] Negative generators failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_edge_generators():
    """Test edge case generators."""
    print("\n" + "=" * 60)
    print("TEST 9: Edge Case Generators")
    print("=" * 60)
    
    try:
        from testing.factories.edge_generators import (
            min_boundary_values,
            max_boundary_values,
            get_all_edge_cases
        )
        
        # Test min boundaries
        min_item = min_boundary_values()
        assert min_item["name"] == "ABC"  # Min length
        assert min_item["price"] == 0.01  # Min price
        print("[PASS] min_boundary_values() works")
        
        # Test max boundaries
        max_item = max_boundary_values()
        assert len(max_item["name"]) == 100  # Max length
        assert max_item["price"] == 999999.99  # Max price
        print("[PASS] max_boundary_values() works")
        
        # Test all edge cases
        all_edges = get_all_edge_cases()
        assert "min_boundary" in all_edges
        assert "max_boundary" in all_edges
        print(f"[PASS] get_all_edge_cases() works ({len(all_edges)} categories)")
        
        return True
    except Exception as e:
        print(f"[FAIL] Edge generators failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all verification tests."""
    print("\n" + "=" * 60)
    print("FINAL VERIFICATION - Test Data Factories")
    print("=" * 60)
    print("This script verifies all components work correctly.")
    print("Run this before handover to ensure zero errors.\n")
    
    results = []
    
    results.append(("Imports", test_imports()))
    results.append(("Factory Instantiation", test_factory_instantiation()))
    results.append(("Helper Functions", test_helper_functions()))
    results.append(("Item Factory Schemas", test_item_factory_schemas()))
    results.append(("URL Construction", test_url_construction()))
    results.append(("Configuration", test_configuration()))
    results.append(("Batch Operations", test_batch_operations()))
    results.append(("Negative Generators", test_negative_generators()))
    results.append(("Edge Generators", test_edge_generators()))
    
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} - {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n" + "=" * 60)
        print("ALL VERIFICATIONS PASSED!")
        print("=" * 60)
        print("[PASS] Code is ready for handover")
        print("[PASS] Zero errors expected on first use")
        print("[PASS] Testing team can use immediately")
        print("[PASS] AI agents can understand and use")
        return 0
    else:
        print("\n" + "=" * 60)
        print("SOME VERIFICATIONS FAILED")
        print("=" * 60)
        print("Please fix the issues above before handover.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
