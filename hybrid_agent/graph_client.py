from neo4j import GraphDatabase

class GraphClient:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_entities_and_relationships(self, entities, relationships):
        with self.driver.session() as session:

            # Create entity nodes
            for e in entities:
                session.run(
                    "MERGE (n:`%s` {name: $name})" % e["label"],
                    {"name": e["name"]},
                )

            # Create relationship edges
            for r in relationships:
                session.run(
                    """
                    MATCH (a {name: $from}), (b {name: $to})
                    MERGE (a)-[:%s]->(b)
                    """ % r["type"],
                    {"from": r["from"], "to": r["to"]}
                )

    def query(self, cypher, params=None):
        with self.driver.session() as session:
            result = session.run(cypher, params or {})
            return [record.data() for record in result]
