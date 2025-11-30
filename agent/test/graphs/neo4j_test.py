"""
End-to-end test for Neo4j Knowledge Graph
- Connect to Neo4j
- Create nodes
- Create relationships
- Query graph
"""

from neo4j import GraphDatabase

URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "password123")

driver = GraphDatabase.driver(URI, auth=AUTH)

def create_data(tx):
    tx.run("MATCH (n) DETACH DELETE n")  # Clean DB

    tx.run("""
        CREATE (p:Tool {name: 'Playwright'})
        CREATE (s:Tool {name: 'Selenium'})
        CREATE (a:Concept {name: 'Browser Automation'})
        CREATE (f:Concept {name: 'Functional Testing'})
    """)

    tx.run("""
        MATCH (p:Tool {name: 'Playwright'}), (a:Concept {name: 'Browser Automation'})
        CREATE (p)-[:IS_TOOL_FOR]->(a)
    """)

    tx.run("""
        MATCH (s:Tool {name: 'Selenium'}), (f:Concept {name: 'Functional Testing'})
        CREATE (s)-[:IS_TOOL_FOR]->(f)
    """)

def query_data(tx):
    result = tx.run("""
        MATCH (t:Tool)-[r:IS_TOOL_FOR]->(c:Concept)
        RETURN t.name AS tool, c.name AS concept
    """)

    print("\n=== Knowledge Graph Output ===")
    for row in result:
        print(f"{row['tool']} → {row['concept']}")

if __name__ == "__main__":
    with driver.session() as session:
        print("Creating test data in Neo4j...")
        session.execute_write(create_data)

        print("Querying graph...")
        session.execute_read(query_data)

    print("\nValidation complete.")
