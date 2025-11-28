
"""
Thorough test suite for:
- BGE-base-en-v1.5 text embeddings
- Salesforce/codet5p-220m code embeddings (encoder-only)
- Basic Qdrant round-trip

Run:
    python embedding_model_tests.py
"""

from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, T5EncoderModel
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import numpy as np
import torch

# ---------------------------
# 1. Utility: cosine similarity
# ---------------------------

def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    a = np.asarray(a, dtype=np.float32)
    b = np.asarray(b, dtype=np.float32)
    num = np.dot(a, b)
    den = np.linalg.norm(a) * np.linalg.norm(b)
    if den == 0:
        return 0.0
    return float(num / den)


# ---------------------------
# 2. Load models
# ---------------------------

print("Loading text model (BGE-base-en-v1.5)...")
text_model = SentenceTransformer("BAAI/bge-base-en-v1.5")
text_dim = text_model.get_sentence_embedding_dimension()

print("Loading code model (CodeT5+ encoder)...")
code_tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5p-220m")
code_model = T5EncoderModel.from_pretrained("Salesforce/codet5p-220m")

# Infer code embedding dimension dynamically
with torch.no_grad():
    dummy_tokens = code_tokenizer("def foo(): pass", return_tensors="pt")
    dummy_out = code_model(**dummy_tokens)
code_dim = int(dummy_out.last_hidden_state.shape[-1])

print(f"Text embedding dim  = {text_dim}")
print(f"Code embedding dim  = {code_dim}")


# ---------------------------
# 3. Embedding helpers
# ---------------------------

def embed_text(sentences):
    return text_model.encode(sentences)

def embed_code(snippet: str) -> np.ndarray:
    tokens = code_tokenizer(
        snippet,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512,
    )
    with torch.no_grad():
        out = code_model(**tokens)
    emb = out.last_hidden_state.mean(dim=1).squeeze().numpy()
    return emb


# ---------------------------
# 4. Text embedding tests
# ---------------------------

def test_text_similarity_behaviour():
    s1 = "Playwright automates modern web browsers."
    s2 = "Playwright is used for browser automation in testing."
    s3 = "I like eating mangoes in the summer."

    e1, e2, e3 = embed_text([s1, s2, s3])

    sim_11 = cosine_sim(e1, e1)
    sim_12 = cosine_sim(e1, e2)
    sim_13 = cosine_sim(e1, e3)

    print("\n[TEXT] Similarities:")
    print("  sim(s1, s1) =", sim_11)
    print("  sim(s1, s2) =", sim_12)
    print("  sim(s1, s3) =", sim_13)

    # Assertions
    assert sim_11 > 0.99, "Self-similarity should be ~1"
    assert sim_12 > sim_13, "Paraphrase should be closer than unrelated sentence"
    assert sim_12 > 0.5, "Paraphrase similarity should be reasonably high"


def test_text_dim_and_empty():
    emb = embed_text(["some text"])
    assert emb.shape == (1, text_dim), "Unexpected text embedding shape"

    # Empty string should not crash and should have correct dim
    emb_empty = embed_text([""])
    assert emb_empty.shape == (1, text_dim), "Empty text embedding has wrong shape"


# ---------------------------
# 5. Code embedding tests
# ---------------------------

def test_code_similarity_behaviour():
    code_add = "def add(a, b): return a + b"
    code_add_alt = "result = a + b"
    code_loop = "for i in range(10): print(i)"

    e_add = embed_code(code_add)
    e_add_alt = embed_code(code_add_alt)
    e_loop = embed_code(code_loop)

    sim_add_add = cosine_sim(e_add, e_add)
    sim_add_alt = cosine_sim(e_add, e_add_alt)
    sim_add_loop = cosine_sim(e_add, e_loop)

    print("\n[CODE] Similarities:")
    print("  sim(add, add)      =", sim_add_add)
    print("  sim(add, add_alt)  =", sim_add_alt)
    print("  sim(add, loop)     =", sim_add_loop)

    # Assertions: relative order is most important
    assert sim_add_add > 0.99, "Code self-similarity should be ~1"
    assert sim_add_alt > sim_add_loop, "Add-like code should be closer than unrelated loop"


def test_code_dim_and_empty():
    emb = embed_code("def foo(x): return x * 2")
    assert emb.shape[-1] == code_dim, "Unexpected code embedding dim"

    emb_empty = embed_code("")
    assert emb_empty.shape[-1] == code_dim, "Empty code embedding has wrong dim"


# ---------------------------
# 6. Qdrant round-trip test (text + code)
# ---------------------------

def test_qdrant_roundtrip():
    print("\n[QDRANT] Starting round-trip test...")

    client = QdrantClient(
    url="https://6d95fddc-a14e-4879-bf92-4b822bdefae8.eu-west-2-0.aws.cloud.qdrant.io",
    api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.iRHhzvJ_Bu7ckxY2hNE9rQjhL0mOx6PyOtfijm1ixMk"
)

    TEXT_COLLECTION = "test_text_embeddings"
    CODE_COLLECTION = "test_code_embeddings"

    # Clean up if they exist
    for col in [TEXT_COLLECTION, CODE_COLLECTION]:
        try:
            client.delete_collection(col)
        except Exception:
            pass

    # Create collections with correct dims
    client.create_collection(
        collection_name=TEXT_COLLECTION,
        vectors_config=VectorParams(size=text_dim, distance=Distance.COSINE),
    )

    client.create_collection(
        collection_name=CODE_COLLECTION,
        vectors_config=VectorParams(size=code_dim, distance=Distance.COSINE),
    )

    # --- Text data
    text_docs = [
        "Playwright automates modern web browsers.",
        "Selenium is used for automated functional testing.",
        "Mangoes are my favourite fruit.",
    ]
    text_embs = embed_text(text_docs)

    text_points = [
        PointStruct(
            id=i,
            vector=text_embs[i].tolist(),
            payload={"text": text_docs[i]},
        )
        for i in range(len(text_docs))
    ]
    client.upsert(TEXT_COLLECTION, text_points)

    # Query
    q_text = "browser automation tool"
    q_emb = embed_text([q_text])[0]

    text_results = client.query_points(
        collection_name=TEXT_COLLECTION,
        query=q_emb.tolist(),
        limit=3,
    )

    print("\n[QDRANT][TEXT] Query:", q_text)
    for r in text_results.points:
        print(f"  Score={r.score:.4f} | Text={r.payload['text']}")

    top_text = text_results.points[0].payload["text"]
    assert "Playwright" in top_text or "Selenium" in top_text, \
        "Top text match should be one of the testing tools."

    # --- Code data
    code_snippets = [
        "def add(a, b): return a + b",
        "def multiply(a, b): return a * b",
        "for i in range(5): print(i)",
    ]
    code_embs = [embed_code(s) for s in code_snippets]

    code_points = [
        PointStruct(
            id=i,
            vector=code_embs[i].tolist(),
            payload={"code": code_snippets[i]},
        )
        for i in range(len(code_snippets))
    ]
    client.upsert(CODE_COLLECTION, code_points)

    q_code = "function that returns sum of two numbers"
    q_code_emb = embed_code(q_code)

    code_results = client.query_points(
        collection_name=CODE_COLLECTION,
        query=q_code_emb.tolist(),
        limit=3,
    )

    print("\n[QDRANT][CODE] Query:", q_code)
    for r in code_results.points:
        print(f"  Score={r.score:.4f} | Code={r.payload['code']}")

    top_code = code_results.points[0].payload["code"]
    assert "add" in top_code or "+" in top_code, \
        "Top code match should be the 'add' function."


# ---------------------------
# 7. Test Runner
# ---------------------------

if __name__ == "__main__":
    print("\n===== RUNNING EMBEDDING TEST SUITE =====")

    # Text tests
    test_text_similarity_behaviour()
    test_text_dim_and_empty()

    # Code tests
    test_code_similarity_behaviour()
    test_code_dim_and_empty()

    # Qdrant round-trip
    test_qdrant_roundtrip()

    print("\n✅ ALL TESTS PASSED")
