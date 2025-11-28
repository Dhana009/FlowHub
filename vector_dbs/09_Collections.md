# 09. Collections

## Core Concept

**Collections are the database structure in vector databases - like tables in traditional databases, but specifically designed to store vectors of the same dimension.**

Each collection is isolated and contains vectors that share the same size and distance metric.

## What Collections Are

### Traditional Database Analogy
```
Traditional DB:
  Database
    └── Table (users)
    └── Table (products)
    └── Table (orders)

Vector DB:
  Qdrant Instance
    └── Collection (text_embeddings)  - 1024 dimensions
    └── Collection (code_embeddings)  - 768 dimensions
    └── Collection (image_embeddings)  - 512 dimensions
```

### Key Characteristics
- **Fixed dimension:** All vectors in a collection must have the same size
- **Fixed distance metric:** All vectors use the same similarity measure
- **Isolated:** Collections are separate - can't mix different dimensions
- **Named:** Each collection has a unique name

## Creating Collections

### Basic Collection
```python
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

client = QdrantClient(url="your-url", api_key="your-key")

client.create_collection(
    collection_name="text_embeddings",
    vectors_config=VectorParams(
        size=1024,              # Must match embedding dimension
        distance=Distance.COSINE  # Similarity metric
    )
)
```

### Collection Parameters

**collection_name:** Unique identifier
```python
collection_name="text_embeddings"  # Must be unique
```

**size:** Vector dimension (CRITICAL)
```python
size=1024  # Must match your embedding model output
# Jina v3 → 1024
# CodeT5+ → 768
# GTE-Large → 1024
```

**distance:** Similarity metric
```python
distance=Distance.COSINE    # Most common for text/code
distance=Distance.EUCLIDEAN # For coordinate-based data
distance=Distance.DOT       # For normalized vectors
```

## The Dimension Rule

### Critical Understanding
**One collection = One embedding dimension**

You **cannot** mix different dimensions in the same collection.

```python
# ❌ WRONG - Mixing dimensions
collection = create_collection(size=1024)  # Expects 1024
embedding_1024 = model_text.encode(text)   # 1024 dimensions ✅
embedding_768 = model_code.encode(code)    # 768 dimensions ❌
# ERROR: Dimension mismatch!

# ✅ CORRECT - Separate collections
text_collection = create_collection(size=1024)   # For text
code_collection = create_collection(size=768)   # For code
```

### Multi-Model Architecture
```
┌─────────────────────────────────────┐
│        Qdrant Instance             │
├─────────────────────────────────────┤
│ Collection: text_embeddings         │
│   Dimension: 1024                  │
│   Model: Jina v3                   │
│   Content: All text documents      │
├─────────────────────────────────────┤
│ Collection: code_embeddings         │
│   Dimension: 768                   │
│   Model: CodeT5+                    │
│   Content: All code snippets       │
└─────────────────────────────────────┘
```

## Collection Management

### Create Collection
```python
client.create_collection(
    collection_name="my_collection",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)
```

### Check if Collection Exists
```python
collections = client.get_collections()
collection_names = [c.name for c in collections.collections]

if "my_collection" in collection_names:
    print("Collection exists")
else:
    print("Collection does not exist")
```

### Delete Collection
```python
client.delete_collection(collection_name="my_collection")
```

### Get Collection Info
```python
collection_info = client.get_collection("my_collection")
print(f"Dimension: {collection_info.config.params.vectors.size}")
print(f"Distance: {collection_info.config.params.vectors.distance}")
print(f"Points count: {collection_info.points_count}")
```

## Naming Conventions

### Good Collection Names
```python
# Descriptive and clear
"text_embeddings"           # Text content
"code_embeddings"           # Code content
"documentation_embeddings"  # Specific domain
"user_queries"              # Specific use case
```

### Bad Collection Names
```python
# Too vague
"collection1"              # What is it?
"data"                     # Too generic
"embeddings"               # Not specific enough
```

### Recommended Pattern
```
{content_type}_{embedding_type}
Examples:
- text_jina_v3
- code_codet5p
- docs_gte_large
```

## Collection Strategy

### Strategy 1: One Collection Per Model
```
Model: Jina v3 (1024-dim) → Collection: text_jina_v3
Model: CodeT5+ (768-dim)  → Collection: code_codet5p
```

**Pros:**
- Clear separation
- Easy to manage
- No dimension conflicts

**Cons:**
- More collections to manage
- Separate queries for different content types

### Strategy 2: One Collection Per Content Type
```
Text content → Collection: text_embeddings (1024-dim)
Code content → Collection: code_embeddings (768-dim)
```

**Pros:**
- Logical grouping
- Content-based organization

**Cons:**
- Must ensure dimension consistency
- Need to track which model was used

### Strategy 3: One Collection Per Domain
```
Documentation → Collection: docs_embeddings (1024-dim)
User queries  → Collection: queries_embeddings (1024-dim)
Code snippets  → Collection: code_embeddings (768-dim)
```

**Pros:**
- Domain-specific organization
- Easy to filter by domain

**Cons:**
- More collections
- Must maintain dimension consistency

## What You Need to Recognize

### In Code
```python
# Creating collection
client.create_collection(
    collection_name="name",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)

# Using collection
client.upsert(collection_name="name", points=points)
client.search(collection_name="name", query_vector=vector)
```

### In Architecture Discussions
- "Collection dimension" = Must match embedding size
- "One collection per model" = Common pattern
- "Collection naming" = Important for organization
- "Dimension mismatch" = Wrong size for collection

### In Error Messages
- "Collection not found" = Collection doesn't exist, need to create
- "Dimension mismatch" = Vector size ≠ collection size
- "Collection already exists" = Need to delete or use different name

## Common Mistakes

❌ **Wrong:** Mixing dimensions in same collection  
✅ **Right:** One dimension per collection

❌ **Wrong:** Not checking if collection exists  
✅ **Right:** Check before creating or using

❌ **Wrong:** Vague collection names  
✅ **Right:** Use descriptive, clear names

❌ **Wrong:** Creating collection with wrong dimension  
✅ **Right:** Match collection size to model output

## How to Discuss This Confidently

### With Non-Technical People
"Collections are like separate filing cabinets - one for text documents, one for code. Each cabinet only holds items of the same size."

### With Technical People
"We use separate collections per embedding model dimension - text_embeddings (1024-dim for Jina v3) and code_embeddings (768-dim for CodeT5+). This ensures dimension consistency and enables model-specific optimization."

### With Architects
"Our collection strategy uses one collection per embedding model dimension to maintain consistency. Collections are named by content type and model (text_jina_v3, code_codet5p) for clear organization and dimension tracking."

## Practical Recognition

**You'll see collections when:**
- Creating: `create_collection(collection_name="...", vectors_config=...)`
- Using: `client.search(collection_name="...", ...)`
- Managing: `get_collections()`, `delete_collection()`
- Errors: "Collection not found", "Dimension mismatch"

**You'll know you understand when:**
- You can design a multi-collection architecture
- You understand dimension requirements
- You can choose collection names
- You can identify collection-related errors

## Key Takeaways

1. **Collections = database structure** - like tables
2. **One dimension per collection** - cannot mix sizes
3. **Match dimension to model** - 1024 for Jina v3, 768 for CodeT5+
4. **Use descriptive names** - for organization and clarity

---

**Next:** [10_Indexing.md](10_Indexing.md) - How vector databases make search fast

