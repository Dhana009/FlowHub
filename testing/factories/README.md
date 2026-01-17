# Test Data Factories - Quick Start

**Version:** 1.0.0  
**Purpose:** Plug-and-play test data factories for API automation testing

---

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install requests pytest
```

### 2. Verify Installation

```python
from testing.factories import UserFactory, ItemFactory, CleanupFactory
print("✅ Factories ready to use!")
```

---

## Quick Start (5 Minutes)

### Basic Usage

```python
from testing.factories import UserFactory, ItemFactory, CleanupFactory

# 1. Create user
user_factory = UserFactory()
user = user_factory.create_editor()

# 2. Login
login_result = user_factory.login(user["email"], user["password"])
token = login_result["token"]

# 3. Create item
item_factory = ItemFactory()
item_data = item_factory.create_digital_item()
created_item = item_factory.create_item_via_api(item_data, token)

# 4. Cleanup
cleanup_factory = CleanupFactory()
cleanup_factory.cleanup_user_data(user["_id"])
```

### Using Pytest Fixtures (Recommended)

```python
import pytest
from testing.factories.pytest_fixtures import test_user, test_item

def test_create_item(test_user, test_item):
    # Automatic setup and cleanup!
    assert test_item["_id"] is not None
```

---

## Configuration

### Environment Variables (Optional)

Set these if your API is not at default location:

```bash
export API_BASE_URL="http://localhost:3000/api/v1"
export INTERNAL_AUTOMATION_KEY="flowhub-secret-automation-key-2025"
export REQUEST_TIMEOUT="30"
```

**Defaults:**
- `API_BASE_URL`: `http://localhost:3000/api/v1`
- `INTERNAL_AUTOMATION_KEY`: `flowhub-secret-automation-key-2025`
- `REQUEST_TIMEOUT`: `30` seconds

---

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'testing'"

**Solution:** Ensure you're running from the project root directory:
```bash
cd d:\testing-box
python your_test.py
```

Or add to Python path:
```python
import sys
sys.path.insert(0, 'd:\\testing-box')
```

### Issue: "Connection refused" or "Failed to connect"

**Solution:** 
1. Check if backend server is running
2. Verify `API_BASE_URL` environment variable
3. Check firewall/network settings

### Issue: "401 Unauthorized: Invalid or missing Internal Safety Key"

**Solution:**
1. Set `INTERNAL_AUTOMATION_KEY` environment variable
2. Or update `config.py` with correct key

### Issue: "Failed to get OTP from internal endpoint"

**Solution:**
- This is expected if internal endpoint is not accessible
- Factory will try to get OTP from signup response (development mode)
- Ensure `INTERNAL_AUTOMATION_KEY` is set correctly

---

## File Structure

```
testing/
├── factories/
│   ├── __init__.py          # Module exports
│   ├── config.py             # Configuration
│   ├── helpers.py            # Utility functions
│   ├── base_factory.py       # Base HTTP client
│   ├── user_factory.py      # User creation & auth
│   ├── item_factory.py       # Item creation
│   ├── cleanup_factory.py   # Data cleanup
│   ├── pytest_fixtures.py   # Pytest fixtures
│   ├── negative_generators.py # Negative test data
│   ├── edge_generators.py   # Edge case data
│   ├── requirements.txt      # Dependencies
│   └── README.md            # This file
└── examples/
    ├── example_simple_test.py
    ├── example_fixture_test.py
    ├── example_batch_test.py
    ├── example_cleanup_test.py
    └── example_parallel_test.py
```

---

## Validation

**Before first use, run validation:**
```bash
python testing/factories/validate_setup.py
```

This verifies:
- ✅ All imports work
- ✅ Dependencies installed
- ✅ Configuration loaded
- ✅ Factory classes instantiate
- ✅ Helper functions work
- ✅ Endpoint paths valid

---

## Support

For complete documentation, see:
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup guide
- [TEST_DATA_FACTORY_GUIDE.md](../../docs/TEST_DATA_FACTORY_GUIDE.md) - Full guide
- [P0-ENDPOINTS.md](../../docs/P0-ENDPOINTS.md) - API endpoints reference
- [DELIVERY_SUMMARY.md](./DELIVERY_SUMMARY.md) - What's included

---

**Ready to use!** 🚀
