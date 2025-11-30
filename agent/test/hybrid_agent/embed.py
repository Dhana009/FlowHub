from sentence_transformers import SentenceTransformer
import numpy as np

# Load BGE model (this is already tested and working on your system)
model = SentenceTransformer("BAAI/bge-base-en-v1.5")

def embed_text(text: str) -> np.ndarray:
    """
    Returns embedding vector as a numpy array.
    """
    return np.array(model.encode(text))
