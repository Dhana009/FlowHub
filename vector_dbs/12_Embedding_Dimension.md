# 12. Embedding Dimension

## Core Concept

**Embedding dimension is the number of numbers (values) in each embedding vector.**

Every embedding model outputs vectors of a fixed size, and your vector database collection must match this size exactly.

## What Dimension Means

### Visual Representation
```
Embedding Vector:
[0.12, -0.34, 0.56, 0.78, ..., 0.91]
 │     │      │      │         │
 │     │      │      │         └─ 1024th number
 │     │      │      └─ 4th number
 │     │      └─ 3rd number
 │     └─ 2nd number
 └─ 1st number

Total: 1024 numbers = 1024 dimensions
```

### Dimension = Vector Size
- **1024 dimensions** = Vector with 1024 numbers
- **768 dimensions** = Vector with 768 numbers
- **512 dimensions** = Vector with 512 numbers

## Model Dimensions (Critical to Know)

### Text Embedding Models
| Model | Dimension | Library |
|-------|-----------|---------|
| Jina v3 | **1024** | sentence-transformers |
| GTE-Large | **1024** | sentence-transformers |
| GTE-Base | **768** | sentence-transformers |
| all-MiniLM | **384** | sentence-transformers |

### Code Embedding Models
| Model | Dimension | Library |
|-------|-----------|---------|
| CodeT5+ (220m) | **768** | transformers |
| CodeBERT | **768** | transformers |
| GraphCodeBERT | **768** | transformers |

### Key Rule
**Every model has a FIXED output dimension that cannot be changed.**

## The Dimension Matching Rule

### Critical Understanding
**Collection dimension MUST equal embedding dimension**

```python
# ✅ CORRECT - Dimensions match
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
# Model outputs: 1024 dimensions

collection = client.create_collection(
    collection_name="text_collection",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)
# Collection expects: 1024 dimensions
# ✅ MATCH - Works!

# ❌ WRONG - Dimensions don't match
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
# Model outputs: 1024 dimensions

collection = client.create_collection(
    collection_name="text_collection",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE)
)
# Collection expects: 768 dimensions
# ❌ MISMATCH - Error!
```

## Common Dimension Values

### Why These Sizes?
- **384-512:** Smaller models, faster, less accurate
- **768:** Balanced (common for code models)
- **1024:** Larger models, slower, more accurate (current SOTA for text)

### Trade-offs
- **Higher dimension:** More expressive, better accuracy, slower, more memory
- **Lower dimension:** Less expressive, faster, less memory, may lose nuance

## Dimension in Practice

### Checking Model Dimension
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
embedding = model.encode("test")
print(embedding.shape)  # (1024,) - 1024 dimensions
```

### Creating Matching Collection
```python
# Jina v3 → 1024 dimensions
client.create_collection(
    collection_name="text_jina_v3",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)

# CodeT5+ → 768 dimensions
client.create_collection(
    collection_name="code_codet5p",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE)
)
```

### Multi-Dimension Architecture
```python
# Text collection (1024-dim)
text_collection = client.create_collection(
    collection_name="text_embeddings",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)

# Code collection (768-dim)
code_collection = client.create_collection(
    collection_name="code_embeddings",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE)
)
```

## What You Need to Recognize

### In Code
```python
# Embedding dimension
embedding = model.encode("text")
print(embedding.shape)  # (1024,) = 1024 dimensions

# Collection dimension
VectorParams(size=1024, ...)  # Must match embedding

# Error: Dimension mismatch
# Vector size 1024 != Collection size 768
```

### In Architecture Discussions
- "Embedding dimension" = Size of vector (1024, 768, etc.)
- "Dimension mismatch" = Vector size ≠ collection size
- "Model output size" = Fixed dimension from model
- "Collection size" = Must match model dimension

### In Error Messages
- "Dimension mismatch" = Vector size ≠ collection size
- "Expected 1024, got 768" = Wrong dimension
- "Vector size error" = Dimension problem

## Common Mistakes

❌ **Wrong:** Assuming all models have same dimension  
✅ **Right:** Check model documentation for dimension

❌ **Wrong:** Creating collection with wrong dimension  
✅ **Right:** Match collection size to model output

❌ **Wrong:** Mixing dimensions in same collection  
✅ **Right:** One dimension per collection

❌ **Wrong:** Not checking embedding shape  
✅ **Right:** Verify dimension before storing

## Dimension Verification

### Before Storing
```python
# Generate embedding
embedding = model.encode("text")
print(f"Embedding dimension: {embedding.shape}")  # Check dimension

# Verify collection matches
collection_info = client.get_collection("my_collection")
collection_dim = collection_info.config.params.vectors.size
print(f"Collection dimension: {collection_dim}")

if embedding.shape[0] != collection_dim:
    raise ValueError(f"Dimension mismatch: {embedding.shape[0]} != {collection_dim}")
```

## How to Discuss This Confidently

### With Non-Technical People
"Each embedding is a list of numbers. The length of that list (like 1024 numbers) is called the dimension. The database must be set up to store vectors of that exact size."

### With Technical People
"We use Jina v3 which outputs 1024-dimensional vectors, so our text collection is configured with size=1024. CodeT5+ outputs 768 dimensions, requiring a separate collection with size=768."

### With Architects
"Our dimension strategy uses model-specific collections: text_embeddings (1024-dim for Jina v3) and code_embeddings (768-dim for CodeT5+). We enforce dimension matching at collection creation and validate embeddings before insertion to prevent dimension mismatch errors."

## Practical Recognition

**You'll see dimensions when:**
- Checking embeddings: `embedding.shape` → `(1024,)`
- Creating collections: `VectorParams(size=1024, ...)`
- Error messages: "Dimension mismatch"
- Model documentation: "Output: 1024 dimensions"

**You'll know you understand when:**
- You can identify model dimensions
- You can match collection to model dimension
- You can explain dimension mismatches
- You can design multi-dimension architectures

## Key Takeaways

1. **Dimension = vector size** - number of values in embedding
2. **Models have fixed dimensions** - cannot be changed
3. **Collection must match model** - same dimension required
4. **Common sizes:** 384, 512, 768, 1024

---

**Next:** [13_RAG.md](13_RAG.md) - Retrieval-Augmented Generation

