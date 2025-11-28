# 03. Vector Databases

## Core Concept

**Vector databases are specialized databases designed to store and search high-dimensional vectors (embeddings) efficiently.**

Unlike traditional databases that search by exact matches or keywords, vector databases search by **similarity** - finding vectors that are "close" to your query vector.

## What They Do

### Traditional Database
```
Query: "browser testing"
Result: Only exact matches containing "browser" AND "testing"
```

### Vector Database
```
Query: "browser testing" → [0.1, -0.2, 0.3, ...]
Search: Find vectors closest to query vector
Result: "Playwright automates browsers", "Selenium testing", "web automation tools"
       (all semantically similar, even without exact keywords)
```

## Key Vector Databases

### 1. **Qdrant** (Recommended)
- **Type:** Open-source, cloud, or self-hosted
- **Best for:** Production systems, high performance
- **Features:** 
  - HNSW indexing (fast similarity search)
  - Metadata/payload storage
  - Filtering capabilities
  - REST API and Python client

```python
from qdrant_client import QdrantClient
client = QdrantClient(url="your-url", api_key="your-key")
```

### 2. **Pinecone**
- **Type:** Managed cloud service
- **Best for:** Quick setup, no infrastructure management
- **Features:**
  - Fully managed
  - Auto-scaling
  - Pay-per-use pricing

### 3. **Weaviate**
- **Type:** Open-source, self-hosted or cloud
- **Best for:** GraphQL integration, hybrid search
- **Features:**
  - GraphQL API
  - Built-in vectorization
  - Multi-tenancy

## Core Concepts

### Collections
A collection is like a table in a traditional database, but for vectors.

```python
# Create a collection
client.create_collection(
    collection_name="text_embeddings",
    vectors_config=VectorParams(
        size=1024,           # Must match embedding dimension
        distance=Distance.COSINE  # Similarity metric
    )
)
```

**Key Points:**
- Each collection stores vectors of the **same dimension**
- Collections are **separate** (can't mix 1024-dim and 768-dim)
- Collections have a **distance metric** (how similarity is calculated)

### Points
A point is a single vector entry in the database.

```python
PointStruct(
    id=1,                              # Unique identifier
    vector=[0.1, -0.2, 0.3, ...],     # The embedding vector
    payload={"text": "your text"}      # Metadata (the original text)
)
```

**Key Points:**
- **id:** Unique identifier (like primary key)
- **vector:** The actual embedding
- **payload:** Metadata (text, filename, tags, etc.)

### Search Operation
```python
results = client.search(
    collection_name="text_embeddings",
    query_vector=[0.1, -0.2, 0.3, ...],  # Your query embedding
    limit=5                                # Top 5 results
)
```

Returns points with highest similarity scores.

## Why Vector Databases Matter

### 1. Semantic Search
Find content by **meaning**, not keywords.

**Example:**
- Query: "automated browser testing"
- Finds: "Playwright", "Selenium", "browser automation", "E2E testing"
- Even if documents don't contain exact words

### 2. Performance
Vector databases use specialized indexing (HNSW) for fast similarity search.

**Traditional approach:**
- Compare query to every vector → O(n) complexity
- Slow for large datasets

**Vector database:**
- HNSW indexing → O(log n) complexity
- Fast even with millions of vectors

### 3. Scalability
Designed to handle millions of high-dimensional vectors efficiently.

## Architecture Pattern

```
┌─────────────┐
│ Embedding   │
│ Model       │──→ Creates embeddings
└─────────────┘
       │
       ↓
┌─────────────┐
│ Vector      │──→ Stores vectors + metadata
│ Database    │──→ Searches by similarity
└─────────────┘
       │
       ↓
┌─────────────┐
│ Your App   │──→ Retrieves relevant context
└─────────────┘
```

## What You Need to Recognize

### In Code
```python
# Creating collection
client.create_collection(
    collection_name="my_collection",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)

# Inserting vectors
client.upsert(collection_name="my_collection", points=points)

# Searching
results = client.search(
    collection_name="my_collection",
    query_vector=query_embedding,
    limit=5
)
```

### In Architecture Discussions
- "We need a vector database" → For semantic search
- "Collection dimension" → Must match embedding model output
- "Similarity search" → Finding closest vectors, not exact matches
- "Metadata storage" → Payload stores original text/data

### In Error Messages
- "Collection not found" → Collection doesn't exist, need to create it
- "Dimension mismatch" → Collection size ≠ embedding size
- "Connection error" → Wrong URL/API key or network issue

## Qdrant-Specific Features

### Payload (Metadata)
Store original data alongside vectors:

```python
PointStruct(
    id=1,
    vector=embedding,
    payload={
        "text": "original text",
        "filename": "doc.pdf",
        "timestamp": "2024-01-01",
        "tags": ["python", "testing"]
    }
)
```

When you search, you get back both the vector AND the payload.

### Filtering
Search with metadata filters:

```python
results = client.search(
    collection_name="my_collection",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[
            FieldCondition(key="tags", match=MatchValue(value="python"))
        ]
    ),
    limit=5
)
```

## Common Mistakes

❌ **Wrong:** Using same collection for different embedding dimensions  
✅ **Right:** One collection per embedding model (dimension)

❌ **Wrong:** Storing only vectors without metadata  
✅ **Right:** Always store payload with original text/data

❌ **Wrong:** Using traditional database for similarity search  
✅ **Right:** Use vector database for semantic search

## How to Discuss This Confidently

### With Non-Technical People
"Vector databases store information as numbers (vectors) and find similar content by comparing these numbers. It's like finding similar songs by comparing their 'musical fingerprint' rather than searching for exact song titles."

### With Technical People
"We're using Qdrant as our vector database with HNSW indexing for fast similarity search. Collections are dimension-specific (1024 for text, 768 for code), and we store metadata in payloads for context retrieval."

### With Architects
"Our vector database architecture uses Qdrant with separate collections per embedding model dimension. We leverage HNSW indexing for sub-linear search complexity and payload filtering for hybrid search capabilities."

## Practical Recognition

**You'll see vector databases when:**
- Creating collections: `create_collection(size=1024)`
- Inserting: `upsert(points=[...])`
- Searching: `search(query_vector=...)`
- Retrieving: Results include vectors + payloads

**You'll know you understand when:**
- You can explain why vector DBs are better than keyword search
- You understand collection dimension requirements
- You can design a multi-collection architecture
- You can identify when to use vector DB vs traditional DB

## Key Takeaways

1. **Vector DBs search by similarity, not keywords**
2. **Collections must match embedding dimensions**
3. **Store metadata (payload) with vectors**
4. **Qdrant is recommended for production systems**

---

**Next:** [04_Similarity_Search.md](04_Similarity_Search.md) - How similarity search works

