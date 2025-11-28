# 11. Distance Metrics

## Core Concept

**Distance metrics are mathematical formulas that measure how "similar" or "different" two vectors are.**

The choice of distance metric determines which vectors are considered "closest" to your query vector.

## The Three Main Metrics

### 1. Cosine Similarity (Most Common)

**What it measures:** The angle between two vectors (direction, not magnitude)

**Formula:** `cos(θ) = (A · B) / (||A|| × ||B||)`

**Range:** -1 to 1
- **1.0** = Identical direction (most similar)
- **0.0** = Perpendicular (unrelated)
- **-1.0** = Opposite directions (most different)

**Visual:**
```
Vector A: →→→→→  (pointing right)
Vector B: →→→→→  (pointing right)
Cosine: 1.0 (same direction, very similar)

Vector A: →→→→→  (pointing right)
Vector C: ↑↑↑↑↑  (pointing up)
Cosine: 0.0 (perpendicular, unrelated)
```

**Why it's best for text/code:**
- Ignores vector magnitude (length)
- Focuses on direction (semantic meaning)
- Works well with normalized embeddings
- Most embeddings are optimized for cosine similarity

**Usage:**
```python
from qdrant_client.models import Distance

VectorParams(size=1024, distance=Distance.COSINE)
```

### 2. Euclidean Distance

**What it measures:** Straight-line distance between two vectors

**Formula:** `√Σ(Aᵢ - Bᵢ)²`

**Range:** 0 to ∞
- **0** = Identical vectors
- **Larger** = More different

**Visual:**
```
Vector A: [1, 2]
Vector B: [4, 6]
Euclidean: √((1-4)² + (2-6)²) = √(9 + 16) = 5
```

**When to use:**
- Coordinate-based data
- When magnitude matters
- Physical distances
- Less common for embeddings

**Usage:**
```python
VectorParams(size=1024, distance=Distance.EUCLIDEAN)
```

### 3. Dot Product

**What it measures:** How much vectors point in the same direction

**Formula:** `A · B = Σ(Aᵢ × Bᵢ)`

**Range:** -∞ to ∞
- **Positive** = Similar direction
- **Negative** = Opposite direction
- **Larger positive** = More similar

**When to use:**
- When vectors are normalized
- Specific ML use cases
- Less common for general embeddings

**Usage:**
```python
VectorParams(size=1024, distance=Distance.DOT)
```

## Comparison Table

| Metric | Range | Best For | Common Use |
|--------|-------|----------|------------|
| Cosine | -1 to 1 | Text, Code | ✅ Most common |
| Euclidean | 0 to ∞ | Coordinates | ❌ Rare for embeddings |
| Dot Product | -∞ to ∞ | Normalized vectors | ❌ Rare for embeddings |

## Why Cosine is Standard

### 1. Semantic Focus
Text embeddings capture meaning, not magnitude. Cosine focuses on meaning (direction).

### 2. Normalization Independence
Works well even if vectors have different magnitudes.

### 3. Model Optimization
Most embedding models (Jina v3, GTE-Large, CodeT5+) are optimized for cosine similarity.

### 4. Industry Standard
Almost all text/code embedding systems use cosine.

## Understanding Scores

### Cosine Similarity Scores
```python
results = client.search(...)

for result in results:
    score = result.score  # Cosine similarity score
    
    # Interpretation:
    # 0.9 - 1.0: Very similar (almost identical)
    # 0.7 - 0.9: Similar (relevant)
    # 0.5 - 0.7: Somewhat similar (maybe relevant)
    # 0.0 - 0.5: Not similar (probably not relevant)
    # < 0.0: Opposite (definitely not relevant)
```

### Score Thresholds
```python
# Only return highly relevant results
results = client.search(
    collection_name="my_collection",
    query_vector=query_embedding,
    score_threshold=0.7  # Minimum similarity
)
```

## What You Need to Recognize

### In Code
```python
# Setting distance metric
VectorParams(size=1024, distance=Distance.COSINE)

# Interpreting scores
score = result.score  # Cosine similarity (0-1 for normalized)
```

### In Architecture Discussions
- "Cosine similarity" = Standard for text/code embeddings
- "Distance metric" = How similarity is calculated
- "Score threshold" = Minimum similarity to return
- "Normalized vectors" = Required for cosine to work well

### In Error Messages
- "Distance metric mismatch" = Wrong metric for your use case
- "Low scores" = May need different metric or better embeddings

## Common Mistakes

❌ **Wrong:** Using Euclidean for text embeddings  
✅ **Right:** Use cosine for text/code

❌ **Wrong:** Not understanding score ranges  
✅ **Right:** Know what scores mean for your metric

❌ **Wrong:** Mixing metrics in same collection  
✅ **Right:** One metric per collection

## How to Discuss This Confidently

### With Non-Technical People
"Cosine similarity measures how similar two pieces of text are by comparing the direction of their 'meaning vectors', not their length. It's like comparing which direction two arrows point, not how long they are."

### With Technical People
"We use cosine similarity as our distance metric, which measures the angle between vectors. This is optimal for text embeddings as it focuses on semantic direction rather than magnitude, and most embedding models are optimized for cosine similarity."

### With Architects
"Our distance metric strategy uses cosine similarity for all text and code embeddings, as it's optimized for semantic similarity and aligns with our embedding models (Jina v3, CodeT5+). We apply score thresholds (0.7+) to filter low-relevance results."

## Practical Recognition

**You'll see distance metrics when:**
- Creating collections: `distance=Distance.COSINE`
- Interpreting scores: `result.score` (cosine: 0-1)
- Setting thresholds: `score_threshold=0.7`
- Comparing results: Higher score = more similar

**You'll know you understand when:**
- You know why cosine is standard
- You can interpret similarity scores
- You can set appropriate thresholds
- You understand when to use other metrics

## Key Takeaways

1. **Cosine similarity is standard** - for text/code embeddings
2. **Scores indicate similarity** - higher = more similar (for cosine)
3. **One metric per collection** - set when creating collection
4. **Use score thresholds** - filter low-relevance results

---

**Next:** [12_Embedding_Dimension.md](12_Embedding_Dimension.md) - Understanding vector sizes

