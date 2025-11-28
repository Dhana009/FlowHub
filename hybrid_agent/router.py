class HybridRouter:

    def decide_storage(self, content: str):
        text = content.lower()

        # Very simple rule:
        store_in_graph = False
        entities = []
        relations = []

        # Example rule: if content contains "works in"
        if "works in" in text:
            store_in_graph = True
            entities = [
                {"label": "Person", "name": "Alice"},
                {"label": "Department", "name": "QA"},
            ]
            relations = [
                {"from": "Alice", "type": "WORKS_IN", "to": "QA"}
            ]

        # Everything goes to vector store
        store_in_vector = True

        return {
            "store_in_vector": store_in_vector,
            "store_in_graph": store_in_graph,
            "graph_entities": entities,
            "graph_relationships": relations
        }

    def decide_query_route(self, question: str):
        q = question.lower()

        use_graph = "who" in q or "relationship" in q or "works" in q
        use_vector = True  # always true for now

        return {
            "use_vector": use_vector,
            "use_graph": use_graph,
            "graph_query": """
                MATCH (p:Person)-[:WORKS_IN]->(d:Department)
                RETURN p.name AS person, d.name AS department
            """ if use_graph else None
        }
