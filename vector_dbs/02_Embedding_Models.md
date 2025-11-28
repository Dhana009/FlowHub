# 02. Embedding Models

## Core Concept

**Embedding models are neural networks trained to convert text or code into meaningful vector representations.**

They are the "engines" that produce embeddings. Without a model, you cannot create embeddings.

## What They Do

### The Process
```
Input: "Playwright automates browsers"
    ↓
[Embedding Model]
    ↓
Output: [0.12, -0.34, 0.56, 0.78, ..., 0.91]  (1024 numbers)
```

The model has learned (through training on millions of examples) how to represent meaning as numbers.

## Key Models You Must Know

### For Text Embeddings

#### 1. **Jina v3** (jina-embeddings-v3)
- **Dimension:** 1024
- **Best for:** All text embeddings (current SOTA)
- **Why:** Best performance on semantic similarity tasks
- **Usage:** Via API or local model

```python
# Via API
response = requests.post("https://api.jina.ai/v1/embeddings", ...)

# Local (if available)
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
```

#### 2. **GTE-Large** (gte-large)
- **Dimension:** 1024
- **Best for:** Text embeddings (strong alternative)
- **Why:** Good balance of quality and speed
- **Usage:** Via sentence-transformers

```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("thenlper/gte-large")
embedding = model.encode("your text")
```

### For Code Embeddings

#### 3. **CodeT5+** (Salesforce/codet5p-220m)
- **Dimension:** 768
- **Best for:** All code embeddings
- **Why:** Specifically trained on code, understands syntax and semantics
- **Usage:** Via transformers library

```python
from transformers import AutoTokenizer, AutoModel
tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")
model = AutoModel.from_pretrained("Salesforce/codet5p-220m")
```

## Critical Understanding: Model Output Size

### The Rule
**Every model has a FIXED output dimension.**

- Jina v3 → **1024 dimensions** (always)
- GTE-Large → **1024 dimensions** (always)
- CodeT5+ → **768 dimensions** (always)

### Why This Matters
Your vector database collection **MUST match** the model's output size.

```python
# ❌ WRONG - Dimension mismatch
model = SentenceTransformer("jina-embeddings-v3")  # outputs 1024
collection = create_collection(size=768)  # expects 768
# ERROR: Dimension mismatch!

# ✅ CORRECT - Matching dimensions
model = SentenceTransformer("jina-embeddings-v3")  # outputs 1024
collection = create_collection(size=1024)  # expects 1024
# Works!
```

## Model Selection Decision Tree

### For Text
```
Need text embeddings?
    ↓
Use Jina v3 (best quality)
    ↓
Dimension: 1024
```

### For Code
```
Need code embeddings?
    ↓
Use CodeT5+ (code-specific)
    ↓
Dimension: 768
```

### For Mixed Content
```
Have both text and code?
    ↓
Use separate models:
- Jina v3 for text (1024-dim)
- CodeT5+ for code (768-dim)
    ↓
Create separate collections
```

## How Models Work (High Level)

### Training Process
1. Model sees millions of text/code examples
2. Learns patterns: similar meanings → similar vectors
3. Adjusts internal weights to capture semantics
4. Outputs consistent vector representations

### Inference Process
1. You give model text/code
2. Model processes through neural network layers
3. Outputs fixed-size vector
4. Vector represents the input's meaning

## What You Need to Recognize

### In Code
```python
# Text model (sentence-transformers)
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
embedding = model.encode("text")  # Returns 1024-dim vector

# Code model (transformers)
from transformers import AutoModel, AutoTokenizer
model = AutoModel.from_pretrained("Salesforce/codet5p-220m")
# Requires tokenization + pooling to get embedding
```

### In Architecture Discussions
- "Which model should we use?" → Jina v3 for text, CodeT5+ for code
- "What's the embedding dimension?" → Must match collection size
- "Can we use the same model for text and code?" → No, use specialized models

### In Error Messages
- "Dimension mismatch" → Model output size ≠ collection size
- "Model not found" → Wrong HuggingFace model ID
- "CUDA out of memory" → Model too large for GPU

## Model Comparison Table

| Model | Type | Dimension | Best For | Library |
|-------|------|-----------|----------|---------|
| Jina v3 | Text | 1024 | All text | sentence-transformers / API |
| GTE-Large | Text | 1024 | Text (alternative) | sentence-transformers |
| CodeT5+ | Code | 768 | All code | transformers |

## Common Mistakes

❌ **Wrong:** Using text model for code  
✅ **Right:** Use CodeT5+ for code

❌ **Wrong:** Assuming all models output same size  
✅ **Right:** Check model documentation for dimension

❌ **Wrong:** Mixing models in same collection  
✅ **Right:** One model = one collection

## How to Discuss This Confidently

### With Non-Technical People
"Embedding models are AI systems trained to understand meaning. We use Jina v3 for text and CodeT5+ for code because they're specialized for each task."

### With Technical People
"We're using Jina v3 (1024-dim) for text embeddings via sentence-transformers, and CodeT5+ (768-dim) for code embeddings via transformers. Each model requires a matching collection dimension in Qdrant."

### With Architects
"Our embedding strategy uses specialized models: Jina v3 for semantic text understanding and CodeT5+ for code semantics. This requires separate collections (1024-dim for text, 768-dim for code) to maintain dimension consistency."

## Practical Recognition

**You'll see models when:**
- Loading: `SentenceTransformer("model-name")`
- Encoding: `model.encode(text)`
- Creating collections: Must match model dimension
- Error messages: "Dimension mismatch" = model/collection mismatch

**You'll know you understand when:**
- You can choose the right model for text vs code
- You understand why dimension matching is critical
- You can explain why specialized models are better
- You can identify model-related errors

## Key Takeaways

1. **Models create embeddings** - they're the engines
2. **Jina v3 for text, CodeT5+ for code** - use specialized models
3. **Fixed output dimensions** - must match collection size
4. **One model = one collection** - don't mix dimensions

---

**Next:** [03_Vector_Databases.md](03_Vector_Databases.md) - Where embeddings are stored

