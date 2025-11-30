from vector_client import VectorStoreClient
from graph_client import GraphClient
from router import HybridRouter
from hybrid_agent import HybridAgent
from sentence_transformers import SentenceTransformer
import numpy as np

# ---------------- Setup ----------------
text_model = SentenceTransformer("BAAI/bge-base-en-v1.5")

def embed(text):
    return np.array(text_model.encode(text))

vector = VectorStoreClient(
    url="https://6d95fddc-a14e-4879-bf92-4b822bdefae8.eu-west-2-0.aws.cloud.qdrant.io",
    api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.iRHhzvJ_Bu7ckxY2hNE9rQjhL0mOx6PyOtfijm1ixMk",
    collection="hybrid_test",
    dim=768
    
)

graph = GraphClient(
    uri="neo4j://localhost:7687",
    user="neo4j",
    password="password123"
)

router = HybridRouter()
agent = HybridAgent(vector, graph, router, embed)

# ---------------- Test ingest ----------------
print("\n=== INGEST TEST ===")
content = "Alice works in QA department"
plan = agent.ingest(content)
print("Plan:", plan)

# ---------------- Test query ----------------
print("\n=== QUERY TEST ===")
question = "Who works in which department?"
results = agent.query(question)
print("Results:", results)
