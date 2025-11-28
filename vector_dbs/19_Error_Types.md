# 19. Error Types

## Core Concept

**Understanding common errors helps you quickly identify and fix issues in vector database systems.**

Most errors fall into a few categories with clear solutions.

## Common Error Categories

### 1. Dimension Mismatch

**Error Message:**
```
ValueError: Dimension mismatch: expected 1024, got 768
```
or
```
QdrantException: Wrong input: expected vector dimension 1024, got 768
```

**What it means:**
- Collection expects one dimension (e.g., 1024)
- Embedding has different dimension (e.g., 768)
- They don't match

**Common Causes:**
- Wrong model for collection (Jina v3 → 1024, but collection is 768)
- Wrong collection for model (CodeT5+ → 768, but collection is 1024)
- Model changed but collection not updated

**Solution:**
```python
# Check model dimension
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
embedding = model.encode("test")
print(f"Model dimension: {embedding.shape[0]}")  # Should be 1024

# Check collection dimension
collection_info = client.get_collection("my_collection")
collection_dim = collection_info.config.params.vectors.size
print(f"Collection dimension: {collection_dim}")

# Fix: Match them
# Option 1: Use correct model for collection
# Option 2: Create new collection with correct dimension
# Option 3: Delete and recreate collection
```

**Prevention:**
- Always check model output dimension
- Match collection size to model dimension
- Use consistent models per collection

---

### 2. Collection Not Found

**Error Message:**
```
QdrantException: Collection `my_collection` doesn't exist
```
or
```
NotFoundError: Collection not found
```

**What it means:**
- Trying to use a collection that doesn't exist
- Collection was deleted or never created
- Wrong collection name

**Common Causes:**
- Collection not created yet
- Collection was deleted
- Typo in collection name
- Wrong Qdrant instance/database

**Solution:**
```python
# Check if collection exists
collections = client.get_collections()
collection_names = [c.name for c in collections.collections]

if "my_collection" not in collection_names:
    # Create it
    client.create_collection(
        collection_name="my_collection",
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
    )
    print("✅ Collection created")
else:
    print("✅ Collection exists")
```

**Prevention:**
- Always create collection before use
- Check collection exists before operations
- Use consistent naming

---

### 3. Model Not Found

**Error Message:**
```
OSError: Can't load tokenizer for 'wrong-model-name'
```
or
```
ModelNotFoundError: Model 'wrong-model-name' not found
```

**What it means:**
- Model name is incorrect
- Model doesn't exist on HuggingFace
- Network issue downloading model
- Wrong library for model type

**Common Causes:**
- Typo in model name
- Model name changed
- Using wrong library (sentence-transformers vs transformers)
- Network/connection issue

**Solution:**
```python
# Verify model name
# Correct names:
# - "jinaai/jina-embeddings-v3-base-en" (sentence-transformers)
# - "Salesforce/codet5p-220m" (transformers)

# Test loading
try:
    model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
    print("✅ Model loaded")
except Exception as e:
    print(f"❌ Error: {e}")
    # Check: Is model name correct?
    # Check: Is it a sentence-transformers model?
    # Check: Network connection?
```

**Prevention:**
- Use exact model names from documentation
- Verify model exists on HuggingFace
- Check library compatibility

---

### 4. Connection Error

**Error Message:**
```
ConnectionError: Failed to connect to Qdrant
```
or
```
QdrantException: Connection refused
```

**What it means:**
- Can't connect to Qdrant instance
- Wrong URL or API key
- Network issue
- Qdrant service down

**Common Causes:**
- Wrong Qdrant URL
- Invalid or expired API key
- Network/firewall blocking
- Qdrant service not running (local)
- Wrong region/endpoint

**Solution:**
```python
# Verify connection
try:
    client = QdrantClient(url="your-url", api_key="your-key")
    collections = client.get_collections()  # Test connection
    print("✅ Connection works")
except Exception as e:
    print(f"❌ Connection error: {e}")
    # Check: Is URL correct?
    # Check: Is API key valid?
    # Check: Network connectivity?
    # Check: Qdrant service running?
```

**Prevention:**
- Store credentials securely
- Test connection on startup
- Handle connection errors gracefully

---

### 5. Empty Results

**Error Message:**
```
# No error, but results list is empty
results = []  # Empty!
```

**What it means:**
- Search returned no results
- No vectors in collection
- Query too different from stored vectors
- Score threshold too high

**Common Causes:**
- Collection is empty (no vectors stored)
- Query embedding very different from stored vectors
- Score threshold filters out all results
- Wrong collection searched

**Solution:**
```python
# Check collection has vectors
collection_info = client.get_collection("my_collection")
print(f"Points in collection: {collection_info.points_count}")

if collection_info.points_count == 0:
    print("❌ Collection is empty - need to insert vectors")
    # Insert vectors...

# Check search without threshold
results = client.search(
    collection_name="my_collection",
    query_vector=query_embedding,
    limit=10  # Increase limit
    # Remove score_threshold to see all results
)

if len(results) == 0:
    print("❌ No results - query may be too different")
    # Try different query or check stored vectors
```

**Prevention:**
- Verify vectors are stored
- Check collection before searching
- Use appropriate score thresholds
- Test with known similar queries

---

### 6. Payload Key Error

**Error Message:**
```
KeyError: 'text'
```
or
```
AttributeError: Payload missing key 'text'
```

**What it means:**
- Trying to access payload field that doesn't exist
- Payload structure different than expected
- Missing required metadata

**Common Causes:**
- Wrong payload key name
- Payload not stored with vector
- Inconsistent payload structure

**Solution:**
```python
# Check payload structure
result = results[0]
print(f"Payload keys: {result.payload.keys()}")

# Safe access
text = result.payload.get("text", "No text available")
# Or
if "text" in result.payload:
    text = result.payload["text"]
else:
    print("⚠️  Payload missing 'text' key")
```

**Prevention:**
- Use consistent payload structure
- Always store required fields
- Check payload keys before access

---

## Error Diagnosis Flowchart

```
Error occurred?
    ↓
What type?
    │
    ├─ Dimension mismatch
    │   → Check model dimension
    │   → Check collection dimension
    │   → Match them
    │
    ├─ Collection not found
    │   → Check collection exists
    │   → Create if missing
    │   → Check collection name
    │
    ├─ Model not found
    │   → Verify model name
    │   → Check HuggingFace
    │   → Check library compatibility
    │
    ├─ Connection error
    │   → Check URL
    │   → Check API key
    │   → Test network
    │
    ├─ Empty results
    │   → Check collection has vectors
    │   → Lower score threshold
    │   → Check query similarity
    │
    └─ Payload error
        → Check payload structure
        → Verify keys exist
        → Use safe access
```

## Quick Error Reference

| Error | Cause | Quick Fix |
|-------|-------|-----------|
| Dimension mismatch | Model ≠ Collection size | Match dimensions |
| Collection not found | Collection doesn't exist | Create collection |
| Model not found | Wrong model name | Check HuggingFace |
| Connection error | Wrong URL/key | Verify credentials |
| Empty results | No vectors or low similarity | Insert vectors or adjust query |
| Payload error | Missing key | Check payload structure |

## What You Need to Recognize

### In Error Messages
- "Dimension mismatch" → Size problem
- "Collection not found" → Missing collection
- "Model not found" → Wrong model name
- "Connection error" → Network/credentials
- "Empty results" → No vectors or low similarity

### In Code
```python
# Dimension check
assert embedding.shape[0] == collection_dim

# Collection check
if collection_name not in existing_collections:
    create_collection(...)

# Connection check
try:
    client.get_collections()
except:
    # Handle connection error
```

### In Debugging
- **Check dimensions first** - most common issue
- **Verify collections exist** - before operations
- **Test connections** - on startup
- **Validate results** - after search

## How to Discuss This Confidently

### With Non-Technical People
"Common errors include dimension mismatches (when the database expects a different size), missing collections (when the database isn't set up), and connection issues (when credentials are wrong). Each has a clear solution."

### With Technical People
"Common error categories include dimension mismatches (model output ≠ collection size), collection not found (missing or wrong name), model loading errors (wrong name or library), connection issues (URL/API key), and empty results (no vectors or low similarity). Each has diagnostic steps and solutions."

### With Architects
"Our error handling strategy covers dimension validation (prevent mismatches), collection existence checks (fail-fast), connection retry logic, and result validation. We implement comprehensive error handling with clear diagnostics for each error category."

## Practical Recognition

**You'll see these errors when:**
- Setting up new systems
- Changing models or collections
- Network/connection issues
- Debugging search problems

**You'll know you understand when:**
- You can identify error types quickly
- You know the solution for each error
- You can prevent common errors
- You can debug systematically

## Key Takeaways

1. **Dimension mismatch** - Most common, match model to collection
2. **Collection not found** - Create before use
3. **Model not found** - Verify model name
4. **Connection error** - Check URL and API key
5. **Empty results** - Check vectors exist and similarity

---

**Next:** [20_Explaining_to_Seniors.md](20_Explaining_to_Seniors.md) - How to communicate confidently

