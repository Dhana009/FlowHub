# 18. Testing the System

## Core Concept

**Testing validates that your vector database system works correctly: embeddings are created, vectors are stored, and similarity search returns relevant results.**

Simple, systematic testing ensures everything functions as expected.

## The Testing Flow

### Complete Validation Process
```
1. Generate Embeddings
   ↓
2. Store in Vector DB
   ↓
3. Search with Query
   ↓
4. Verify Results
   ↓
5. Check Scores
```

## Basic Test Pattern

### Simple Validation Test
```python
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

# Initialize
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
client = QdrantClient(url="your-url", api_key="your-key")

# Test documents
documents = [
    "Playwright automates browsers",
    "Selenium is a browser automation tool",
    "Python is a programming language"
]

# Step 1: Generate embeddings
print("1. Generating embeddings...")
embeddings = model.encode(documents)
print(f"   ✅ Generated {len(embeddings)} embeddings")
print(f"   ✅ Embedding dimension: {embeddings[0].shape}")

# Step 2: Create collection
print("\n2. Creating collection...")
try:
    client.delete_collection("test_collection")
except:
    pass

client.create_collection(
    collection_name="test_collection",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)
print("   ✅ Collection created")

# Step 3: Store vectors
print("\n3. Storing vectors...")
points = [
    PointStruct(
        id=idx,
        vector=embeddings[idx].tolist(),
        payload={"text": documents[idx]}
    )
    for idx in range(len(documents))
]
client.upsert(collection_name="test_collection", points=points)
print(f"   ✅ Stored {len(points)} vectors")

# Step 4: Search
print("\n4. Testing search...")
query = "browser testing tool"
query_embedding = model.encode(query)

results = client.search(
    collection_name="test_collection",
    query_vector=query_embedding.tolist(),
    limit=3
)

print(f"   Query: '{query}'")
print(f"   ✅ Found {len(results)} results")

# Step 5: Verify results
print("\n5. Verifying results...")
for idx, result in enumerate(results, 1):
    print(f"\n   Result {idx}:")
    print(f"   - Score: {result.score:.4f}")
    print(f"   - Text: {result.payload['text']}")
    
    # Check if result is relevant
    if "browser" in result.payload['text'].lower() or "automation" in result.payload['text'].lower():
        print(f"   ✅ Relevant (contains browser/automation)")
    else:
        print(f"   ⚠️  May not be relevant")

print("\n" + "="*60)
print("TEST COMPLETE")
print("="*60)
```

## What to Test

### 1. Embedding Generation
**Test:** Can you create embeddings?

```python
embedding = model.encode("test text")
assert embedding.shape[0] == 1024  # Check dimension
print("✅ Embedding generation works")
```

### 2. Collection Creation
**Test:** Can you create collections?

```python
client.create_collection(
    collection_name="test",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)
collection_info = client.get_collection("test")
assert collection_info.config.params.vectors.size == 1024
print("✅ Collection creation works")
```

### 3. Vector Storage
**Test:** Can you store vectors?

```python
points = [PointStruct(id=1, vector=[...], payload={"text": "..."})]
client.upsert(collection_name="test", points=points)
collection_info = client.get_collection("test")
assert collection_info.points_count > 0
print("✅ Vector storage works")
```

### 4. Similarity Search
**Test:** Can you search and get results?

```python
results = client.search(
    collection_name="test",
    query_vector=[...],
    limit=5
)
assert len(results) > 0
print("✅ Search works")
```

### 5. Result Relevance
**Test:** Are results actually relevant?

```python
query = "browser automation"
results = client.search(...)

# Check top result
top_result = results[0]
assert top_result.score > 0.7  # High similarity
assert "browser" in top_result.payload["text"].lower() or "automation" in top_result.payload["text"].lower()
print("✅ Results are relevant")
```

## Expected Results

### Good Results
```
Query: "browser testing"
Results:
1. "Selenium is a browser automation tool" (score: 0.89) ✅
2. "Playwright automates browsers" (score: 0.85) ✅
3. "Python is a programming language" (score: 0.12) ⚠️
```

**Interpretation:**
- Top 2 results are highly relevant (high scores, contain keywords)
- 3rd result is not relevant (low score, different topic)
- System is working correctly

### Poor Results
```
Query: "browser testing"
Results:
1. "Python is a programming language" (score: 0.45) ❌
2. "Selenium is a browser automation tool" (score: 0.40) ❌
3. "Playwright automates browsers" (score: 0.35) ❌
```

**Interpretation:**
- All scores are low
- Wrong result is first
- System may have issues (wrong model, poor embeddings, etc.)

## Test Scenarios

### Scenario 1: Exact Match
```python
# Store
documents = ["Playwright automates browsers"]
# Query
query = "Playwright automates browsers"  # Exact match
# Expected: Top result with high score (>0.9)
```

### Scenario 2: Semantic Match
```python
# Store
documents = ["Playwright automates browsers"]
# Query
query = "browser testing tool"  # Semantic match
# Expected: Top result with good score (>0.7)
```

### Scenario 3: No Match
```python
# Store
documents = ["Python is a programming language"]
# Query
query = "browser testing"  # Unrelated
# Expected: Low score (<0.3)
```

## Quick Validation Test

### Minimal Test (5 minutes)
```python
# 1. Encode
embedding = model.encode("test")
print(f"Embedding shape: {embedding.shape}")  # Should be (1024,)

# 2. Create collection
client.create_collection(
    collection_name="quick_test",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)

# 3. Insert
client.upsert(
    collection_name="quick_test",
    points=[PointStruct(id=1, vector=embedding.tolist(), payload={"text": "test"})]
)

# 4. Search
results = client.search(
    collection_name="quick_test",
    query_vector=embedding.tolist(),
    limit=1
)

# 5. Verify
assert len(results) > 0
assert results[0].score > 0.9  # Should be very similar
print("✅ System works!")
```

## What You Need to Recognize

### In Test Results
- **High scores (>0.7)** = Good, relevant results
- **Low scores (<0.3)** = Poor, irrelevant results
- **Top result relevance** = Most important check
- **Score distribution** = Should decrease (top result highest)

### In Code
```python
# Test embedding generation
embedding = model.encode("test")
assert embedding.shape[0] == expected_dimension

# Test search
results = client.search(...)
assert len(results) > 0
assert results[0].score > threshold
```

### In Discussions
- "Validation test" = Basic functionality check
- "Relevance test" = Results quality check
- "Score threshold" = Minimum similarity to accept
- "Top-K results" = Number of results to return

## Common Test Failures

### Failure 1: Dimension Mismatch
```
Error: Dimension mismatch
Cause: Collection size ≠ embedding size
Fix: Match collection size to model output
```

### Failure 2: No Results
```
Error: Empty results
Cause: No vectors stored or wrong collection
Fix: Check collection exists, vectors are stored
```

### Failure 3: Poor Relevance
```
Problem: Wrong results, low scores
Cause: Wrong model, poor embeddings, or wrong query
Fix: Use correct model, check embeddings, verify query
```

## How to Discuss This Confidently

### With Non-Technical People
"We test the system by storing some sample documents, asking a question, and checking if we get the right answers back. If the top results are relevant, the system is working."

### With Technical People
"We validate the system through a test pipeline: embedding generation, collection creation, vector storage, similarity search, and result relevance verification. We check embedding dimensions, search scores, and top-K result quality."

### With Architects
"Our testing strategy includes unit tests for each component (embedding generation, storage, search) and integration tests for end-to-end validation. We verify dimension consistency, search performance, and result relevance with score thresholds (>0.7 for high-quality results)."

## Practical Recognition

**You'll see testing when:**
- Validating new setup
- Debugging issues
- Verifying changes
- Performance checks

**You'll know you understand when:**
- You can write a complete test
- You can interpret test results
- You can identify failures
- You can validate system correctness

## Key Takeaways

1. **Test the complete flow** - encode → store → search → verify
2. **Check dimensions** - embedding size = collection size
3. **Verify relevance** - top results should be relevant
4. **Score thresholds** - use >0.7 for good results

---

**Next:** [19_Error_Types.md](19_Error_Types.md) - Common issues and solutions

