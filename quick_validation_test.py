
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, T5EncoderModel
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import numpy as np
import torch


# ------------------------------------------------------
# 1. Load Embedding Models (Local, Open Source, Free)
# ------------------------------------------------------

print("Loading text embedding model (BGE)...")
text_model = SentenceTransformer("BAAI/bge-base-en-v1.5")     # 768 dims

print("Loading code embedding model (CodeT5+ encoder)...")
code_tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")
code_model = T5EncoderModel.from_pretrained("Salesforce/codet5p-220m")   # Encoder-only


# ------------------------------------------------------
# 2. Connect to Qdrant (Cloud or Local)
# ------------------------------------------------------

client = QdrantClient(
    url="https://6d95fddc-a14e-4879-bf92-4b822bdefae8.eu-west-2-0.aws.cloud.qdrant.io",
    api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.iRHhzvJ_Bu7ckxY2hNE9rQjhL0mOx6PyOtfijm1ixMk"
)
TEXT_COLLECTION = "demo_text"
CODE_COLLECTION = "demo_code"

# Safe delete if exists
for col in [TEXT_COLLECTION, CODE_COLLECTION]:
    try:
        client.delete_collection(col)
    except Exception:
        pass

# Create text collection (768 dims)
client.create_collection(
    collection_name=TEXT_COLLECTION,
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)

# Create code collection (768 dims)
client.create_collection(
    collection_name=CODE_COLLECTION,
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)


# ------------------------------------------------------
# 3. Sample Data
# ------------------------------------------------------

text_docs = [
    "Playwright automates modern web browsers.",
    "Selenium is used for automated functional testing.",
]

code_snippets = [
    "def add(a, b): return a + b",
    "def multiply(a, b): return a * b",
]


# ------------------------------------------------------
# 4. Embedding Functions
# ------------------------------------------------------

print("Embedding text...")

def embed_text(sentences):
    """Embed text using BGE"""
    return text_model.encode(sentences)

print("Embedding code...")

def embed_code(snippet: str) -> np.ndarray:
    """Embed code using CodeT5+ encoder"""
    tokens = code_tokenizer(
        snippet,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512
    )
    with torch.no_grad():
        output = code_model(**tokens)
    embedding = output.last_hidden_state.mean(dim=1).squeeze().numpy()
    return embedding


# Generate embeddings
text_embeddings = embed_text(text_docs)
code_embeddings = np.array([embed_code(snippet) for snippet in code_snippets])


# ------------------------------------------------------
# 5. Insert Embeddings into Qdrant
# ------------------------------------------------------

print("Inserting text embeddings...")
text_points = [
    PointStruct(
        id=i,
        vector=text_embeddings[i].tolist(),
        payload={"text": text_docs[i]}
    )
    for i in range(len(text_docs))
]
client.upsert(TEXT_COLLECTION, text_points)

print("Inserting code embeddings...")
code_points = [
    PointStruct(
        id=i,
        vector=code_embeddings[i].tolist(),
        payload={"code": code_snippets[i]}
    )
    for i in range(len(code_snippets))
]
client.upsert(CODE_COLLECTION, code_points)

# ------------------------------------------------------
# 6. Search Section - Text (using query_points)
# ------------------------------------------------------

print("\n==============================")
print("TEXT SEARCH")
print("==============================")

text_query = "browser automation tool"
text_query_emb = embed_text([text_query])[0]

text_results = client.query_points(
    collection_name=TEXT_COLLECTION,
    query=text_query_emb.tolist(),
    limit=2,
)

print(f"\nQuery: {text_query}")
for r in text_results.points:   # <- use .points
    print(f"Score={r.score:.4f} | Text={r.payload['text']}")


# ------------------------------------------------------
# 7. Search Section - Code (using query_points)
# ------------------------------------------------------

print("\n==============================")
print("CODE SEARCH")
print("==============================")

code_query = "function to add two numbers"
code_query_emb = embed_code(code_query)

code_results = client.query_points(
    collection_name=CODE_COLLECTION,
    query=code_query_emb.tolist(),
    limit=2,
)

print(f"\nQuery: {code_query}")
for r in code_results.points:   # <- use .points
    print(f"Score={r.score:.4f} | Code={r.payload['code']}")


print("\n==============================")
print("VALIDATION COMPLETE")
print("==============================")
