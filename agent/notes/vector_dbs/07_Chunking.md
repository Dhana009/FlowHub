# 07. Chunking

## Core Concept

**Chunking is the process of splitting long documents into smaller, manageable pieces before creating embeddings.**

Each chunk becomes a separate vector in your database, enabling more precise and relevant search results.

## Why Chunking Matters

### The Problem Without Chunking
```
Document: "Playwright is a browser automation tool. It supports multiple browsers
including Chrome, Firefox, and Safari. You can write tests in Python, JavaScript,
or TypeScript. Playwright provides APIs for page interactions, network interception,
and screenshot capture. It's faster than Selenium and has better debugging tools."

Query: "How do I take screenshots with Playwright?"

Problem: The entire document is one vector. Even though it contains the answer,
the vector represents the WHOLE document, making it less relevant to the specific
question about screenshots.
```

### The Solution With Chunking
```
Chunk 1: "Playwright is a browser automation tool. It supports multiple browsers
including Chrome, Firefox, and Safari."

Chunk 2: "You can write tests in Python, JavaScript, or TypeScript. Playwright
provides APIs for page interactions, network interception, and screenshot capture."

Chunk 3: "It's faster than Selenium and has better debugging tools."

Query: "How do I take screenshots with Playwright?"

Result: Chunk 2 is highly relevant (mentions screenshot capture) and gets
retrieved, providing precise context about screenshots.
```

## Chunking Strategies

### 1. Fixed-Size Chunking
Split documents into chunks of fixed size (by characters or tokens).

**Example:**
```python
def chunk_text(text, chunk_size=500, overlap=50):
    """Split text into fixed-size chunks with overlap"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap  # Overlap to preserve context
    return chunks
```

**Pros:**
- Simple to implement
- Predictable chunk sizes
- Easy to process

**Cons:**
- May split sentences mid-way
- May lose context at boundaries

### 2. Sentence-Based Chunking
Split at sentence boundaries, then group sentences into chunks.

**Example:**
```python
import re

def chunk_by_sentences(text, sentences_per_chunk=5):
    """Split text into chunks of N sentences"""
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    chunks = []
    for i in range(0, len(sentences), sentences_per_chunk):
        chunk = ' '.join(sentences[i:i+sentences_per_chunk])
        chunks.append(chunk)
    return chunks
```

**Pros:**
- Preserves sentence integrity
- Better semantic coherence
- More natural boundaries

**Cons:**
- Variable chunk sizes
- May need to combine small chunks

### 3. Paragraph-Based Chunking
Split at paragraph boundaries.

**Example:**
```python
def chunk_by_paragraphs(text):
    """Split text into paragraphs"""
    paragraphs = text.split('\n\n')
    chunks = [p.strip() for p in paragraphs if p.strip()]
    return chunks
```

**Pros:**
- Preserves document structure
- Natural semantic units
- Good for structured documents

**Cons:**
- Paragraphs may be too large or too small
- Not suitable for all document types

### 4. Semantic Chunking (Advanced)
Split based on semantic similarity - keep related content together.

**Example:**
```python
# Uses embeddings to find natural break points
def semantic_chunk(text, model, max_chunk_size=500):
    """Split text based on semantic similarity"""
    sentences = split_sentences(text)
    embeddings = model.encode(sentences)
    
    # Find break points where similarity drops
    chunks = []
    current_chunk = [sentences[0]]
    
    for i in range(1, len(sentences)):
        similarity = cosine_similarity(
            embeddings[i-1].reshape(1, -1),
            embeddings[i].reshape(1, -1)
        )[0][0]
        
        if similarity < 0.7 or len(' '.join(current_chunk)) > max_chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = [sentences[i]]
        else:
            current_chunk.append(sentences[i])
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks
```

**Pros:**
- Keeps semantically related content together
- More intelligent splitting
- Better search relevance

**Cons:**
- More complex to implement
- Requires embedding model
- Slower processing

## Recommended Chunk Sizes

### By Token Count
- **Small chunks:** 100-300 tokens (for precise answers)
- **Medium chunks:** 300-1000 tokens (balanced)
- **Large chunks:** 1000-2000 tokens (for context-heavy content)

### By Character Count
- **Small chunks:** 200-500 characters
- **Medium chunks:** 500-1500 characters
- **Large chunks:** 1500-3000 characters

### Rule of Thumb
**300-1000 tokens per chunk** is a good starting point for most use cases.

## Overlap Strategy

### Why Overlap?
Overlap ensures context isn't lost at chunk boundaries.

**Example:**
```
Chunk 1: "...Playwright provides APIs for page interactions, network
interception, and screenshot capture. It's faster than Selenium..."

Chunk 2: "...and screenshot capture. It's faster than Selenium and has
better debugging tools. You can use it for end-to-end testing..."

Notice: "screenshot capture" appears in both chunks, preserving context.
```

**Recommended Overlap:**
- **10-20% of chunk size** is typical
- **50-100 tokens** overlap for medium chunks

## Practical Implementation

### Simple Chunking Function
```python
def chunk_document(text, chunk_size=500, overlap=50):
    """Simple fixed-size chunking with overlap"""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start = end - overlap
    
    return chunks

# Usage
document = "Your long document text here..."
chunks = chunk_document(document, chunk_size=500, overlap=50)
```

### Chunking with Metadata
```python
def chunk_with_metadata(text, filename, chunk_size=500):
    """Chunk document and preserve metadata"""
    chunks = chunk_document(text, chunk_size)
    
    chunked_data = []
    for idx, chunk in enumerate(chunks):
        chunked_data.append({
            "text": chunk,
            "filename": filename,
            "chunk_id": idx,
            "total_chunks": len(chunks)
        })
    
    return chunked_data
```

## What You Need to Recognize

### In Code
```python
# Chunking before embedding
chunks = chunk_document(document)
embeddings = model.encode(chunks)  # One embedding per chunk

# Storing chunks
for idx, chunk in enumerate(chunks):
    points.append(PointStruct(
        id=idx,
        vector=embeddings[idx],
        payload={"text": chunk, "chunk_id": idx}
    ))
```

### In Architecture Discussions
- "Chunk size" = How big each piece is
- "Overlap" = How much chunks share at boundaries
- "Chunking strategy" = How documents are split
- "Chunk metadata" = Tracking which chunk came from which document

### In Error Messages
- "Chunk too large" = Exceeds model's max input length
- "Empty chunks" = Chunking produced empty strings
- "Poor search results" = Chunks may be too large/small

## Common Mistakes

❌ **Wrong:** Not chunking long documents  
✅ **Right:** Always chunk documents > 1000 tokens

❌ **Wrong:** Chunks too large (lose precision)  
✅ **Right:** Use 300-1000 tokens per chunk

❌ **Wrong:** No overlap (lose context)  
✅ **Right:** Use 10-20% overlap

❌ **Wrong:** Splitting mid-sentence  
✅ **Right:** Split at sentence/paragraph boundaries when possible

## How to Discuss This Confidently

### With Non-Technical People
"We break long documents into smaller pieces so we can find the exact relevant section when you ask a question, rather than searching through the entire document."

### With Technical People
"We use sentence-based chunking with 500-token chunks and 50-token overlap. This preserves semantic coherence while enabling precise retrieval of relevant sections."

### With Architects
"Our chunking strategy uses semantic boundaries (sentence/paragraph) with 300-1000 token chunks and 10-20% overlap. We preserve chunk metadata (source document, chunk ID) for traceability and context reconstruction."

## Practical Recognition

**You'll see chunking when:**
- Processing documents before embedding
- Splitting text into smaller pieces
- Creating multiple vectors from one document
- Storing chunk metadata in payloads

**You'll know you understand when:**
- You can choose appropriate chunk sizes
- You understand why overlap matters
- You can implement a chunking strategy
- You can identify when chunking is needed

## Key Takeaways

1. **Chunking splits long documents** - into manageable pieces
2. **300-1000 tokens per chunk** - good starting point
3. **Use overlap** - 10-20% to preserve context
4. **Preserve metadata** - track chunk source and position

---

**Next:** [08_Metadata_and_Payload.md](08_Metadata_and_Payload.md) - Storing context with vectors

