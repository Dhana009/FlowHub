# 13. RAG (Retrieval-Augmented Generation)

## Core Concept

**RAG is a technique where AI systems retrieve relevant context from a knowledge base before generating answers, making responses more accurate and grounded in your data.**

Instead of relying solely on the AI's training data, RAG gives the AI access to your specific documents, code, or knowledge.

## The RAG Process

### Without RAG (Standard LLM)
```
User Question: "How do I automate browsers with Playwright?"

AI Response: (Based only on training data)
- May be outdated
- May not know your specific setup
- May hallucinate information
- Generic answers
```

### With RAG (Retrieval-Augmented Generation)
```
User Question: "How do I automate browsers with Playwright?"

Step 1: Retrieve Context
  → Search vector database
  → Find relevant documents about Playwright
  → Get: "Playwright automates browsers. Install with: npm install playwright"

Step 2: Augment Prompt
  → Combine question + retrieved context
  → "Context: Playwright automates browsers. Install with: npm install playwright
      Question: How do I automate browsers with Playwright?"

Step 3: Generate Answer
  → AI uses context to answer accurately
  → Response: "To automate browsers with Playwright, first install it using
      'npm install playwright'. Then you can write scripts to control browsers..."
  → Grounded in your actual documentation
```

## Why RAG Matters

### 1. Reduces Hallucinations
AI answers are based on your actual data, not just training knowledge.

### 2. Up-to-Date Information
Your knowledge base can be updated without retraining the AI model.

### 3. Domain-Specific Answers
AI can answer questions about your specific codebase, documentation, or domain.

### 4. Traceability
You can see which documents the AI used to generate the answer.

## The Complete RAG Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                    RAG PIPELINE                          │
└─────────────────────────────────────────────────────────┘

PHASE 1: INDEXING (One-time setup)
─────────────────────────────────
Documents → Chunking → Embeddings → Vector Database

PHASE 2: RETRIEVAL (Every query)
─────────────────────────────────
User Question
    ↓
Query Embedding
    ↓
Similarity Search (Vector DB)
    ↓
Retrieve Top-K Relevant Chunks
    ↓
Combine Context + Question
    ↓
LLM Generation
    ↓
Answer to User
```

## Code Implementation

### Complete RAG System
```python
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
# from openai import OpenAI  # or your LLM provider

# Initialize
embedding_model = SentenceTransformer("jinaai/jina-embeddings-v3-base-en")
vector_db = QdrantClient(url="your-url", api_key="your-key")
# llm = OpenAI()  # Your LLM client

# ============================================
# PHASE 1: Indexing (One-time)
# ============================================
def index_documents(documents):
    """Index documents into vector database"""
    # Create collection
    vector_db.create_collection(
        collection_name="knowledge_base",
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
    )
    
    # Generate embeddings
    embeddings = embedding_model.encode(documents)
    
    # Store in vector DB
    points = [
        PointStruct(
            id=idx,
            vector=embeddings[idx].tolist(),
            payload={"text": documents[idx]}
        )
        for idx in range(len(documents))
    ]
    
    vector_db.upsert(collection_name="knowledge_base", points=points)
    print("✅ Documents indexed!")

# ============================================
# PHASE 2: RAG Query (Real-time)
# ============================================
def rag_query(user_question, top_k=3):
    """Answer question using RAG"""
    
    # Step 1: Retrieve relevant context
    query_embedding = embedding_model.encode(user_question)
    
    results = vector_db.search(
        collection_name="knowledge_base",
        query_vector=query_embedding.tolist(),
        limit=top_k
    )
    
    # Step 2: Extract context
    context = [result.payload["text"] for result in results]
    context_text = "\n\n".join(context)
    
    # Step 3: Augment prompt with context
    augmented_prompt = f"""Context from knowledge base:
{context_text}

Question: {user_question}

Answer based on the context above:"""
    
    # Step 4: Generate answer (pseudo-code)
    # answer = llm.generate(augmented_prompt)
    # return answer
    
    # For demonstration:
    return {
        "question": user_question,
        "context": context,
        "augmented_prompt": augmented_prompt
    }

# Usage
documents = [
    "Playwright automates browsers. Install with: npm install playwright",
    "Selenium is a browser automation tool for web testing",
    "Python is a programming language used for automation"
]

# Index documents
index_documents(documents)

# Ask question
result = rag_query("How do I automate browsers?")
print(result)
```

## RAG Components

### 1. Retrieval System
- Vector database (Qdrant)
- Embedding model (Jina v3)
- Similarity search

### 2. Generation System
- LLM (GPT-4, Claude, Llama, etc.)
- Prompt engineering
- Context formatting

### 3. Integration Layer
- Combines retrieval + generation
- Manages context window
- Formats responses

## RAG Variations

### Simple RAG
```
Question → Retrieve → Generate
```

### Advanced RAG
```
Question → Retrieve → Re-rank → Filter → Generate
```

### Multi-Step RAG
```
Question → Retrieve → Generate → Follow-up Retrieve → Generate
```

## What You Need to Recognize

### In Architecture
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Vector   │ →   │ Context  │ →   │   LLM    │
│ Database │     │ Retrieval│     │ Generator│
└──────────┘     └──────────┘     └──────────┘
```

### In Code
- **Indexing:** Documents → Embeddings → Vector DB
- **Retrieval:** Question → Embedding → Search → Context
- **Generation:** Context + Question → LLM → Answer

### In Discussions
- "RAG system" = Retrieval + Generation
- "Context retrieval" = Finding relevant documents
- "Augmented generation" = LLM with context
- "Knowledge base" = Your vector database

## Common Patterns

### Pattern 1: Q&A System
```
User asks question → Retrieve docs → LLM answers with context
```

### Pattern 2: Code Assistant
```
User asks about code → Retrieve code snippets → LLM explains with examples
```

### Pattern 3: Documentation Chatbot
```
User asks about docs → Retrieve relevant sections → LLM summarizes
```

## Best Practices

### 1. Quality Retrieval
- Use good embedding models (Jina v3)
- Proper chunking (300-1000 tokens)
- Score thresholds (filter low relevance)

### 2. Context Management
- Limit context size (fit LLM window)
- Top-K retrieval (3-10 chunks)
- Remove duplicates

### 3. Prompt Engineering
- Clear context formatting
- Explicit instructions
- Source attribution

## Common Mistakes

❌ **Wrong:** Not retrieving context  
✅ **Right:** Always retrieve before generating

❌ **Wrong:** Too much context (overwhelms LLM)  
✅ **Right:** Limit to top-K most relevant chunks

❌ **Wrong:** Poor chunking (loses context)  
✅ **Right:** Use proper chunking strategy

## How to Discuss This Confidently

### With Non-Technical People
"RAG works like a research assistant - it first looks up relevant information from your documents, then uses that information to answer your question accurately."

### With Technical People
"We implement RAG using Jina v3 for embeddings, Qdrant for vector storage, and similarity search to retrieve top-K relevant chunks. The LLM receives this context along with the user query for grounded generation."

### With Architects
"Our RAG architecture uses a two-phase approach: indexing (documents → embeddings → Qdrant) and retrieval-augmented generation (query → embedding → similarity search → top-K context → LLM). We apply score thresholds and context window management to ensure quality responses."

## Practical Recognition

**You'll see RAG when:**
- Building Q&A systems
- Creating documentation chatbots
- Implementing code assistants
- Any system that retrieves context before generating

**You'll know you understand when:**
- You can explain the complete RAG flow
- You can design a RAG system
- You understand retrieval vs generation
- You can optimize RAG performance

## Key Takeaways

1. **RAG = Retrieve + Generate** - context before answers
2. **Reduces hallucinations** - grounded in your data
3. **Two phases** - indexing (setup) and retrieval (queries)
4. **Industry standard** - used in most enterprise AI systems

---

**Next:** [14_Vector_DB_vs_Knowledge_Graph.md](14_Vector_DB_vs_Knowledge_Graph.md) - When to use which

