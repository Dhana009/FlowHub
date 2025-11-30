# Vector Databases - Critical Points Summary

## Core Concepts (One Critical Point Per Document)

1. **Embeddings**: Convert text/code to numerical vectors that capture meaning; similar meanings = similar vectors in space.

2. **Model Dimensions**: Every embedding model has a FIXED output dimension; collection size MUST match model output (1024 for Jina v3, 768 for CodeT5+).

3. **Vector Databases**: Search by semantic similarity (not keywords); collections are dimension-specific and cannot mix sizes.

4. **Similarity Search**: Cosine similarity is the standard metric for text/code embeddings; measures angle between vectors, not magnitude.

5. **Retrieval Pipeline**: Complete flow - Documents → Chunking → Embeddings → Vector DB → Query Embedding → Search → Context → LLM → Answer (MOST IMPORTANT).

6. **Libraries**: sentence-transformers for text embeddings (simple API), transformers for code embeddings (full control).

7. **Chunking**: Split documents into 300-1000 token chunks with 10-20% overlap to preserve context at boundaries.

8. **Metadata/Payload**: Always store original text in payload; required for retrieval and context reconstruction.

9. **Collections**: One collection per embedding dimension; cannot mix different dimensions in same collection.

10. **Indexing**: HNSW indexing enables fast similarity search (O(log n)); happens automatically on vector insertion.

11. **Distance Metrics**: Cosine similarity is standard for text/code; higher score = more similar (range: -1 to 1).

12. **Dimension Matching**: Collection dimension MUST equal embedding dimension; this is a critical rule that cannot be violated.

13. **RAG**: Retrieval-Augmented Generation = Retrieve context from Vector DB + Generate with LLM; reduces hallucinations by grounding in data.

14. **Vector DB vs Knowledge Graph**: Vector DB for semantic search (unstructured text/code), Knowledge Graph for explicit relationships (structured entities).

15. **LLM + Vector DB**: LLM = brain (reasoning/generation), Vector DB = memory (context retrieval); together = complete RAG system.

16. **Essential Tools**: sentence-transformers (text), transformers (code), qdrant-client (vector DB), HuggingFace (models).

17. **Model Selection**: Jina v3 for text (1024-dim, SOTA), CodeT5+ for code (768-dim, code-specific); use specialized models.

18. **Testing**: Validate complete flow - embedding generation → storage → search → verify relevance (scores >0.7 for good results).

19. **Common Errors**: Dimension mismatch is most common; always match model output to collection size before operations.

20. **Communication**: Master the complete pipeline explanation (indexing + retrieval phases) to confidently explain to seniors.

---

**Key Rule**: Collection dimension = Model output dimension (cannot be violated)
**Key Pattern**: Documents → Embeddings → Vector DB → Search → Context → LLM → Answer
**Key Metric**: Cosine similarity for text/code embeddings
**Key Architecture**: RAG (Retrieval-Augmented Generation)

