# 16. Important Tools

## Core Concept

**These are the essential tools and libraries you need to build vector-based AI systems.**

Master these tools, and you have everything needed for implementation.

## The Essential Stack

### 1. sentence-transformers
**Purpose:** Text embedding models (simplified API)  
**Library:** `sentence-transformers`  
**Use for:** Text embeddings

**Installation:**
```bash
pip install sentence-transformers
```

**Usage:**
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
embeddings = model.encode("your text here")
```

**Key Models:**
- `jinaai/jina-embeddings-v3-base-en` - Jina v3 (1024-dim)
- `thenlper/gte-large` - GTE-Large (1024-dim)

**Why it matters:** Simplest way to get text embeddings

---

### 2. transformers
**Purpose:** HuggingFace models (full control)  
**Library:** `transformers`  
**Use for:** Code embeddings, custom models

**Installation:**
```bash
pip install transformers torch
```

**Usage:**
```python
from transformers import AutoTokenizer, AutoModel
import torch

tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")
model = AutoModel.from_pretrained("Salesforce/codet5p-220m")

inputs = tokenizer("your code", return_tensors="pt", padding=True, truncation=True)
with torch.no_grad():
    outputs = model(**inputs)
embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
```

**Key Models:**
- `Salesforce/codet5p-220m` - CodeT5+ (768-dim)
- `microsoft/codebert-base` - CodeBERT (768-dim)

**Why it matters:** Required for code embeddings and advanced use cases

---

### 3. qdrant-client
**Purpose:** Qdrant vector database client  
**Library:** `qdrant-client`  
**Use for:** Vector storage and search

**Installation:**
```bash
pip install qdrant-client
```

**Usage:**
```python
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

# Connect
client = QdrantClient(url="your-url", api_key="your-key")

# Create collection
client.create_collection(
    collection_name="my_collection",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)

# Insert vectors
points = [PointStruct(id=1, vector=[...], payload={"text": "..."})]
client.upsert(collection_name="my_collection", points=points)

# Search
results = client.search(
    collection_name="my_collection",
    query_vector=[...],
    limit=5
)
```

**Why it matters:** Primary tool for vector database operations

---

### 4. HuggingFace
**Purpose:** Model repository and hub  
**Platform:** [huggingface.co](https://huggingface.co)  
**Use for:** Finding and downloading models

**Key Features:**
- Model repository (thousands of models)
- Model cards (documentation)
- Model versions
- API access

**Usage:**
```python
# Download models
from transformers import AutoModel
model = AutoModel.from_pretrained("model-name")

# Or via sentence-transformers
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("model-name")
```

**Why it matters:** Central repository for all embedding models

---

### 5. MCP (Model Context Protocol)
**Purpose:** Protocol for connecting AI systems  
**Concept:** Standardized way to connect components  
**Use for:** System integration

**Key Concepts:**
- Standardized interfaces
- Component communication
- System architecture

**Why it matters:** Enables clean integration of vector DBs, LLMs, and other components

---

## Tool Comparison

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **sentence-transformers** | Text embeddings | All text embedding needs |
| **transformers** | Code embeddings | Code embeddings, custom models |
| **qdrant-client** | Vector database | All vector storage/search |
| **HuggingFace** | Model repository | Finding/downloading models |
| **MCP** | Integration protocol | System architecture |

## Complete Stack Example

```python
# ============================================
# COMPLETE STACK IMPLEMENTATION
# ============================================

# 1. Text Embeddings (sentence-transformers)
from sentence_transformers import SentenceTransformer
text_model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")

# 2. Code Embeddings (transformers)
from transformers import AutoTokenizer, AutoModel
code_tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")
code_model = AutoModel.from_pretrained("Salesforce/codet5p-220m")

# 3. Vector Database (qdrant-client)
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

client = QdrantClient(url="your-url", api_key="your-key")

# Create collections
client.create_collection(
    collection_name="text_embeddings",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)

client.create_collection(
    collection_name="code_embeddings",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE)
)

# Generate and store embeddings
text_embedding = text_model.encode("your text")
# ... code embedding generation ...

# Store in Qdrant
client.upsert(
    collection_name="text_embeddings",
    points=[PointStruct(id=1, vector=text_embedding.tolist(), payload={"text": "..."})]
)

# Search
results = client.search(
    collection_name="text_embeddings",
    query_vector=text_embedding.tolist(),
    limit=5
)
```

## Installation Guide

### Complete Setup
```bash
# Core libraries
pip install sentence-transformers
pip install transformers torch
pip install qdrant-client

# Optional but recommended
pip install numpy
pip install requests
```

### Verify Installation
```python
# Test sentence-transformers
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
print("✅ sentence-transformers works")

# Test transformers
from transformers import AutoModel
model = AutoModel.from_pretrained("Salesforce/codet5p-220m")
print("✅ transformers works")

# Test qdrant-client
from qdrant_client import QdrantClient
print("✅ qdrant-client works")
```

## What You Need to Recognize

### In Code
```python
# sentence-transformers pattern
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("model-name")

# transformers pattern
from transformers import AutoModel, AutoTokenizer

# qdrant-client pattern
from qdrant_client import QdrantClient
```

### In Architecture
- **sentence-transformers** → Text embedding pipeline
- **transformers** → Code embedding pipeline
- **qdrant-client** → Vector storage and search
- **HuggingFace** → Model source
- **MCP** → Integration layer

### In Discussions
- "sentence-transformers for text" → Standard text embedding tool
- "transformers for code" → Code embedding tool
- "Qdrant client" → Vector database interface
- "HuggingFace models" → Model repository

## Common Patterns

### Pattern 1: Text RAG System
```python
# Tools: sentence-transformers + qdrant-client
text_model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
# ... Qdrant operations ...
```

### Pattern 2: Code Search System
```python
# Tools: transformers + qdrant-client
code_model = AutoModel.from_pretrained("Salesforce/codet5p-220m")
# ... Qdrant operations ...
```

### Pattern 3: Mixed System
```python
# Tools: sentence-transformers + transformers + qdrant-client
text_model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
code_model = AutoModel.from_pretrained("Salesforce/codet5p-220m")
# ... Qdrant operations for both ...
```

## Tool Selection Guide

### For Text Embeddings
```
Use: sentence-transformers
Model: jinaai/jina-embeddings-v3-base-en
Why: Simplest API, best performance
```

### For Code Embeddings
```
Use: transformers
Model: Salesforce/codet5p-220m
Why: Required for code, full control
```

### For Vector Storage
```
Use: qdrant-client
Why: Best performance, production-ready
```

## Common Mistakes

❌ **Wrong:** Using transformers for simple text embeddings  
✅ **Right:** Use sentence-transformers for text

❌ **Wrong:** Using sentence-transformers for code  
✅ **Right:** Use transformers for code

❌ **Wrong:** Not installing required dependencies  
✅ **Right:** Install all required libraries

## How to Discuss This Confidently

### With Non-Technical People
"We use specialized tools: one for converting text to numbers (sentence-transformers), one for code (transformers), and a database for storing and searching these numbers (Qdrant)."

### With Technical People
"Our stack uses sentence-transformers for text embeddings (Jina v3), transformers for code embeddings (CodeT5+), and qdrant-client for vector storage and similarity search. Models are sourced from HuggingFace."

### With Architects
"Our tooling stack consists of sentence-transformers (text embeddings), transformers (code embeddings), and qdrant-client (vector database operations). We source models from HuggingFace and follow MCP principles for system integration."

## Practical Recognition

**You'll see these tools when:**
- Setting up embedding pipelines
- Creating vector database connections
- Implementing RAG systems
- Building search functionality

**You'll know you understand when:**
- You can choose the right tool for each task
- You understand when to use which library
- You can set up the complete stack
- You can explain tool choices

## Key Takeaways

1. **sentence-transformers** - Text embeddings (simple)
2. **transformers** - Code embeddings (full control)
3. **qdrant-client** - Vector database operations
4. **HuggingFace** - Model repository
5. **MCP** - Integration protocol

---

**Next:** [17_Model_Selection.md](17_Model_Selection.md) - Choosing the right model

