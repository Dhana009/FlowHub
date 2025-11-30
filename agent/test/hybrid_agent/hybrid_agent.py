import numpy as np

class HybridAgent:
    def __init__(self, vector_client, graph_client, router, embed_fn):
        self.vector = vector_client
        self.graph = graph_client
        self.router = router
        self.embed = embed_fn

    def ingest(self, content: str):
        plan = self.router.decide_storage(content)

        # Vector store path
        if plan["store_in_vector"]:
            vec = self.embed(content)
            self.vector.add(vec.tolist(), {"content": content})

        # Knowledge graph path
        if plan["store_in_graph"]:
            self.graph.create_entities_and_relationships(
                plan["graph_entities"],
                plan["graph_relationships"],
            )

        return plan

    def query(self, question: str):
        plan = self.router.decide_query_route(question)

        results = {"vector_hits": [], "graph_hits": [], "plan": plan}

        # Vector search path
        if plan["use_vector"]:
            q_vec = self.embed(question)
            v_hits = self.vector.search(q_vec.tolist(), limit=3)
            results["vector_hits"] = v_hits

        # Graph search path
        if plan["use_graph"] and plan["graph_query"]:
            g_hits = self.graph.query(plan["graph_query"])
            results["graph_hits"] = g_hits

        return results
