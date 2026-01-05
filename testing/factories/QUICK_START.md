# Quick Start - Test Data Factories

**Get started in 5 minutes!**

---

## Step 1: Install Dependencies

```bash
pip install requests pytest
```

Or from requirements file:
```bash
pip install -r testing/factories/requirements.txt
```

---

## Step 2: Validate Setup

```bash
python testing/factories/validate_setup.py
```

Expected output:
```
✅ All validations passed! You're ready to use the factories.
```

---

## Step 3: Run Your First Test

### Option A: Simple Test (No Fixtures)

Create `test_simple.py`:

```python
from testing.factories import UserFactory, ItemFactory, CleanupFactory

def test_create_item():
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
    
    # Assert
    assert created_item["_id"] is not None
    
    # Cleanup
    cleanup_factory.cleanup_user_data(user["_id"])

if __name__ == "__main__":
    test_create_item()
    print("✅ Test passed!")
```

Run:
```bash
python test_simple.py
```

### Option B: Using Pytest Fixtures (Recommended)

Create `test_with_fixtures.py`:

```python
import pytest
from testing.factories.pytest_fixtures import test_user, test_item

def test_create_item(test_user, test_item):
    # Automatic setup and cleanup!
    assert test_item["_id"] is not None
    assert test_user["token"] is not None
```

Run:
```bash
pytest test_with_fixtures.py -v
```

---

## Step 4: Configure (If Needed)

If your API is not at `http://localhost:3000/api/v1`, set environment variables:

```bash
# Windows PowerShell
$env:API_BASE_URL="http://your-api-url/api/v1"
$env:INTERNAL_AUTOMATION_KEY="your-internal-key"

# Linux/Mac
export API_BASE_URL="http://your-api-url/api/v1"
export INTERNAL_AUTOMATION_KEY="your-internal-key"
```

---

## Common Patterns

### Pattern 1: Create Multiple Items

```python
from testing.factories.pytest_fixtures import make_item, test_user

def test_multiple_items(make_item, test_user):
    item1 = make_item(item_type="PHYSICAL", token=test_user["token"])
    item2 = make_item(item_type="DIGITAL", token=test_user["token"])
    # All automatically cleaned up
```

### Pattern 2: Different User Roles

```python
from testing.factories.pytest_fixtures import test_admin, test_editor, test_viewer

def test_roles(test_admin, test_editor, test_viewer):
    assert test_admin["user"]["role"] == "ADMIN"
    assert test_editor["user"]["role"] == "EDITOR"
    assert test_viewer["user"]["role"] == "VIEWER"
```

### Pattern 3: Batch Operations

```python
from testing.factories import ItemFactory

item_factory = ItemFactory()
batch_items = item_factory.create_batch_items(count=10, item_type="DIGITAL")
```

---

## Next Steps

- Read [TEST_DATA_FACTORY_GUIDE.md](../../docs/TEST_DATA_FACTORY_GUIDE.md) for complete documentation
- Check [examples/](../examples/) for more patterns
- See [P0-ENDPOINTS.md](../../docs/P0-ENDPOINTS.md) for API reference

---

**That's it! You're ready to start testing.** 🚀
