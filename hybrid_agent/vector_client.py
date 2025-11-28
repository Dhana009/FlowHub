from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import uuid

class VectorStoreClient:
    def __init__(self, url, api_key, collection, dim):
        self.client = QdrantClient(url=url, api_key=api_key)
        self.collection = collection
        self.dim = dim

        # Ensure collection exists
        self.client.recreate_collection(
            collection_name=self.collection,
            vectors_config=VectorParams(size=self.dim, distance=Distance.COSINE),
        )

    def add(self, vector, payload):
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload=payload
        )
        self.client.upsert(self.collection, [point])

    def search(self, vector, limit=5):
        result = self.client.query_points(
            collection_name=self.collection,
            query=vector,
            limit=limit,
        )
        return [
            {
                "score": p.score,
                "payload": p.payload
            }
            for p in result.points
        ]
