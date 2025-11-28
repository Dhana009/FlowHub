# 06. Sentence Transformers vs Transformers

## Core Concept

**These are two different Python libraries for working with embedding models, each optimized for different use cases.**

Understanding when to use which library is critical for efficient implementation.

## The Two Libraries

### 1. sentence-transformers
**Purpose:** Simplified interface for text embedding models  
**Best for:** Text embeddings (quick and easy)  
**Library:** `sentence-transformers`

### 2. transformers
**Purpose:** Full access to HuggingFace models (including code models)  
**Best for:** Code embeddings, custom models, advanced use cases  
**Library:** `transformers`

## Key Differences

### sentence-transformers

**What it does:**
- Wraps embedding models in a simple API
- Handles tokenization, encoding, and pooling automatically
- Optimized for text embeddings

**Usage:**
```python
from sentence_transformers import SentenceTransformer

# Load model
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")

# Encode text (one line!)
embeddings = model.encode("your text here")
# Returns: numpy array of embeddings
```

**Advantages:**
- ✅ Simple API (one line to encode)
- ✅ Automatic tokenization and pooling
- ✅ Optimized for text
- ✅ Easy to use

**Limitations:**
- ❌ Limited to text models
- ❌ Less control over the process
- ❌ Not ideal for code embeddings

### transformers

**What it does:**
- Direct access to HuggingFace models
- Full control over tokenization and model outputs
- Works with any model (text, code, vision, etc.)

**Usage:**
```python
from transformers import AutoTokenizer, AutoModel
import torch

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")
model = AutoModel.from_pretrained("Salesforce/codet5p-220m")

# Manual process
inputs = tokenizer("your code here", return_tensors="pt", padding=True, truncation=True)
with torch.no_grad():
    outputs = model(**inputs)

# Manual pooling (get embedding)
embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
```

**Advantages:**
- ✅ Works with any model (text, code, etc.)
- ✅ Full control over the process
- ✅ Access to model internals
- ✅ Best for code embeddings

**Limitations:**
- ❌ More code required
- ❌ Manual tokenization and pooling
- ❌ More complex API

## Decision Tree

### For Text Embeddings
```
Need text embeddings?
    ↓
Use sentence-transformers
    ↓
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
embeddings = model.encode(texts)
```

### For Code Embeddings
```
Need code embeddings?
    ↓
Use transformers
    ↓
tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")
model = AutoModel.from_pretrained("Salesforce/codet5p-220m")
# ... manual encoding process
```

### For Custom Models
```
Need custom model or advanced control?
    ↓
Use transformers
    ↓
Full access to model architecture and outputs
```

## Practical Examples

### Example 1: Text Embeddings (sentence-transformers)
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")

# Single text
embedding = model.encode("Playwright automates browsers")
print(embedding.shape)  # (1024,)

# Multiple texts (batch)
texts = [
    "Playwright automates browsers",
    "Selenium is a browser automation tool"
]
embeddings = model.encode(texts)
print(embeddings.shape)  # (2, 1024)
```

### Example 2: Code Embeddings (transformers)
```python
from transformers import AutoTokenizer, AutoModel
import torch

tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")
model = AutoModel.from_pretrained("Salesforce/codet5p-220m")

# Single code snippet
code = "def add(a, b): return a + b"
inputs = tokenizer(code, return_tensors="pt", padding=True, truncation=True, max_length=512)

with torch.no_grad():
    outputs = model(**inputs)

# Mean pooling to get embedding
embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
print(embedding.shape)  # (768,)
```

## What You Need to Recognize

### In Code
```python
# sentence-transformers pattern
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("model-name")
embeddings = model.encode(texts)  # Simple!

# transformers pattern
from transformers import AutoTokenizer, AutoModel
tokenizer = AutoTokenizer.from_pretrained("model-name")
model = AutoModel.from_pretrained("model-name")
# ... manual encoding
```

### In Architecture Discussions
- "Use sentence-transformers for text" → Quick text embeddings
- "Use transformers for code" → Code-specific models
- "sentence-transformers is a wrapper" → Simplifies transformers for text

### In Error Messages
- "Model not found in sentence-transformers" → Use transformers instead
- "Tokenization error" → Check tokenizer configuration (transformers)
- "Dimension mismatch" → Check pooling method (transformers)

## Common Patterns

### Pattern 1: Text RAG System
```python
# Use sentence-transformers
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
embeddings = model.encode(documents)
```

### Pattern 2: Code Search System
```python
# Use transformers
from transformers import AutoTokenizer, AutoModel
tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")
model = AutoModel.from_pretrained("Salesforce/codet5p-220m")
# ... manual encoding
```

### Pattern 3: Mixed System
```python
# Use both!
text_model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")  # For text
code_tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")  # For code
code_model = AutoModel.from_pretrained("Salesforce/codet5p-220m")
```

## Why This Distinction Matters

### 1. Right Tool for Right Job
- Text → sentence-transformers (easier)
- Code → transformers (required)

### 2. Performance
- sentence-transformers is optimized for text
- transformers gives you control for optimization

### 3. Model Availability
- Some models only in transformers
- sentence-transformers has curated text models

## Common Mistakes

❌ **Wrong:** Using sentence-transformers for code  
✅ **Right:** Use transformers for code embeddings

❌ **Wrong:** Using transformers when sentence-transformers would work  
✅ **Right:** Use sentence-transformers for simpler text embeddings

❌ **Wrong:** Not understanding the difference  
✅ **Right:** Know when to use which library

## How to Discuss This Confidently

### With Non-Technical People
"We use different tools for text and code. For text, we use a simplified library. For code, we need more control, so we use a more advanced library."

### With Technical People
"We use sentence-transformers for text embeddings (Jina v3) due to its simplified API and automatic pooling. For code embeddings (CodeT5+), we use transformers directly for full control over tokenization and mean pooling."

### With Architects
"Our embedding strategy uses sentence-transformers for text (simplified API, optimized for text) and transformers for code (full control, required for code models). This separation allows us to optimize each use case independently."

## Practical Recognition

**You'll see sentence-transformers when:**
- `from sentence_transformers import SentenceTransformer`
- `model.encode(text)` - simple one-liner
- Text embedding pipelines

**You'll see transformers when:**
- `from transformers import AutoTokenizer, AutoModel`
- Manual tokenization and pooling
- Code embedding pipelines
- Custom model usage

**You'll know you understand when:**
- You can choose the right library for the task
- You understand why code needs transformers
- You can explain the trade-offs
- You can identify which library is being used in code

## Key Takeaways

1. **sentence-transformers = text embeddings (simple)**
2. **transformers = code embeddings (full control)**
3. **Choose based on use case** - text vs code
4. **Both are valid** - just different tools for different jobs

---

**Next:** [07_Chunking.md](07_Chunking.md) - How to split documents for better search

