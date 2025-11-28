# 08. Metadata and Payload

## Core Concept

**Metadata (payload) is additional information stored alongside vectors in a vector database, allowing you to retrieve the original content and context when searching.**

Vectors represent meaning, but metadata provides the actual text, source, and other contextual information needed to reconstruct answers.

## Why Metadata Matters

### The Problem Without Metadata
```
Vector: [0.12, -0.34, 0.56, ...]  (just numbers)
Query: "What tools automate browsers?"

Search Result: Vector with score 0.89
Problem: You have the vector, but what was the original text?
You can't answer the question without the original content!
```

### The Solution With Metadata
```
Vector: [0.12, -0.34, 0.56, ...]
Payload: {
    "text": "Playwright automates browsers",
    "filename": "playwright_docs.md",
    "section": "Introduction",
    "timestamp": "2024-01-15"
}

Query: "What tools automate browsers?"

Search Result: 
- Vector with score 0.89
- Payload with original text: "Playwright automates browsers"
- Now you can use this text to answer the question!
```

## What is Payload (Qdrant Term)

In Qdrant, **payload** is the term for metadata stored with each vector point.

```python
PointStruct(
    id=1,
    vector=[0.12, -0.34, 0.56, ...],  # The embedding
    payload={                           # The metadata
        "text": "original text",
        "filename": "doc.pdf",
        "tags": ["python", "testing"]
    }
)
```

## Common Metadata Fields

### 1. Original Content
**Purpose:** Store the text/code that was embedded

```python
payload = {
    "text": "Playwright automates browsers"  # The original text
}
```

**Why:** You need the original text to show users or feed to AI

### 2. Source Information
**Purpose:** Track where the content came from

```python
payload = {
    "filename": "playwright_docs.md",
    "url": "https://playwright.dev/docs",
    "source": "documentation"
}
```

**Why:** Users need to know the source, and you can link back to it

### 3. Chunk Information
**Purpose:** Track chunk position in larger documents

```python
payload = {
    "text": "chunk content...",
    "document_id": "doc_123",
    "chunk_id": 2,
    "total_chunks": 10,
    "chunk_index": 2
}
```

**Why:** Reconstruct full context or navigate to specific sections

### 4. Timestamps
**Purpose:** Track when content was indexed

```python
payload = {
    "text": "content...",
    "indexed_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:22:00Z"
}
```

**Why:** Filter by recency, track updates, manage stale content

### 5. Tags and Categories
**Purpose:** Categorize content for filtering

```python
payload = {
    "text": "content...",
    "tags": ["python", "testing", "automation"],
    "category": "documentation",
    "language": "en"
}
```

**Why:** Enable hybrid search (similarity + metadata filtering)

### 6. Custom Fields
**Purpose:** Store any domain-specific information

```python
payload = {
    "text": "content...",
    "author": "John Doe",
    "department": "Engineering",
    "project": "Browser Automation",
    "priority": "high"
}
```

**Why:** Support business-specific filtering and organization

## Complete Example

### Storing with Metadata
```python
from qdrant_client.models import PointStruct

# Document to index
document = "Playwright automates browsers"
filename = "playwright_intro.md"
tags = ["automation", "testing"]

# Create embedding
embedding = model.encode(document)

# Create point with payload
point = PointStruct(
    id=1,
    vector=embedding.tolist(),
    payload={
        "text": document,           # Original content
        "filename": filename,       # Source
        "tags": tags,               # Categories
        "indexed_at": "2024-01-15", # Timestamp
        "chunk_id": 0               # Position
    }
)

# Store in Qdrant
client.upsert(collection_name="knowledge_base", points=[point])
```

### Retrieving with Metadata
```python
# Search
results = client.search(
    collection_name="knowledge_base",
    query_vector=query_embedding,
    limit=5
)

# Access metadata
for result in results:
    score = result.score                    # Similarity score
    text = result.payload["text"]          # Original text
    filename = result.payload["filename"]  # Source file
    tags = result.payload["tags"]          # Categories
    
    print(f"Score: {score}")
    print(f"Text: {text}")
    print(f"Source: {filename}")
    print(f"Tags: {tags}")
```

## Using Metadata for Filtering

### Filter by Tags
```python
from qdrant_client.models import Filter, FieldCondition, MatchValue

results = client.search(
    collection_name="knowledge_base",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[
            FieldCondition(
                key="tags",
                match=MatchValue(value="python")
            )
        ]
    ),
    limit=5
)
```

### Filter by Date
```python
from qdrant_client.models import Range

results = client.search(
    collection_name="knowledge_base",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[
            FieldCondition(
                key="indexed_at",
                range=Range(gte="2024-01-01")
            )
        ]
    ),
    limit=5
)
```

### Combined Filters
```python
results = client.search(
    collection_name="knowledge_base",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[
            FieldCondition(key="tags", match=MatchValue(value="python")),
            FieldCondition(key="category", match=MatchValue(value="documentation"))
        ]
    ),
    limit=5
)
```

## Best Practices

### 1. Always Store Original Text
```python
# ✅ GOOD
payload = {"text": original_text}

# ❌ BAD - No way to retrieve original content
payload = {"filename": "doc.pdf"}  # Missing text!
```

### 2. Include Source Information
```python
# ✅ GOOD
payload = {
    "text": text,
    "filename": filename,
    "url": url,
    "source": "documentation"
}
```

### 3. Track Chunk Relationships
```python
# ✅ GOOD
payload = {
    "text": chunk_text,
    "document_id": "doc_123",
    "chunk_id": 2,
    "total_chunks": 10
}
```

### 4. Use Consistent Field Names
```python
# ✅ GOOD - Consistent across all points
payload = {
    "text": "...",
    "filename": "...",
    "tags": [...]
}

# ❌ BAD - Inconsistent naming
payload = {"text": "...", "file": "...", "tag": [...]}  # Mixed naming
```

## What You Need to Recognize

### In Code
```python
# Storing payload
PointStruct(
    id=1,
    vector=embedding,
    payload={"text": text, "filename": filename}  # Metadata
)

# Retrieving payload
result.payload["text"]      # Access metadata
result.payload["filename"]  # Access source
```

### In Architecture Discussions
- "Payload stores metadata" = Additional info with vectors
- "Original text in payload" = Required for retrieval
- "Metadata filtering" = Hybrid search (similarity + filters)
- "Payload structure" = Schema for stored metadata

### In Error Messages
- "Payload key not found" = Accessing non-existent metadata field
- "Filter error" = Invalid filter on payload field
- "Missing text in payload" = Can't retrieve original content

## Common Mistakes

❌ **Wrong:** Not storing original text in payload  
✅ **Right:** Always store the original text/code

❌ **Wrong:** Storing only vectors  
✅ **Right:** Store vectors + metadata (payload)

❌ **Wrong:** Inconsistent payload structure  
✅ **Right:** Use consistent field names across all points

❌ **Wrong:** Not including source information  
✅ **Right:** Store filename, URL, or source identifier

## How to Discuss This Confidently

### With Non-Technical People
"We store the original text along with each 'meaning fingerprint' (vector), so when we find relevant content, we can show you the actual text, not just numbers."

### With Technical People
"We store metadata in Qdrant payloads including original text, source information, and chunk metadata. This enables hybrid search combining similarity search with metadata filtering, and allows context reconstruction for RAG."

### With Architects
"Our payload schema includes original content (text), source tracking (filename, URL), chunk relationships (document_id, chunk_id), and domain metadata (tags, timestamps). This supports hybrid search, context reconstruction, and traceability."

## Practical Recognition

**You'll see payload when:**
- Creating points: `PointStruct(..., payload={...})`
- Retrieving results: `result.payload["text"]`
- Filtering: `query_filter=Filter(...)`
- Accessing metadata: `payload["field_name"]`

**You'll know you understand when:**
- You always store original text in payload
- You understand why metadata is essential
- You can design a payload schema
- You can use metadata for filtering

## Key Takeaways

1. **Payload = metadata** - stored with each vector
2. **Always store original text** - required for retrieval
3. **Include source information** - for traceability
4. **Enable hybrid search** - combine similarity + filtering

---

**Next:** [09_Collections.md](09_Collections.md) - Database structure and organization

