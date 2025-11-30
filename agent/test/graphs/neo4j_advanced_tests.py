"""
Advanced end-to-end testing for Neo4j Knowledge Graph

This suite validates:
- multi-label nodes
- multiple relationship types
- relationship properties
- node properties
- MERGE vs CREATE behavior
- cycles, deep paths, negative cases
- querying with filters and variable-length paths
- deletion, detach, and cleanup
"""

from neo4j import GraphDatabase

URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "password123")

driver = GraphDatabase.driver(URI, auth=AUTH)


# ------------------------------
# Utility
# ------------------------------
def run(tx, query, params=None):
    return tx.run(query, params or {})


# ------------------------------
# 1. Clean database before tests
# ------------------------------
def reset_graph():
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")


# ------------------------------
# 2. Complex graph creation
# ------------------------------

def create_complex_graph():
    with driver.session() as session:
        # Multi-label nodes + properties
        session.run("""
        CREATE
            (p:Person:Engineer {name:'Alice', age:30}),
            (q:Person:Manager {name:'Bob', age:40}),
            (t:Tool {name:'Playwright', type:'Automation'}),
            (s:Tool {name:'Selenium', type:'Automation'}),
            (c:Concept {name:'Browser Automation'}),
            (f:Concept {name:'Functional Testing'}),
            (d:Department {name:'QA'}),
            (o:Organization {name:'TechCorp'})
        """)

        # Different relationship types + properties
        session.run("""
        MATCH (p:Person {name:'Alice'}), (d:Department {name:'QA'})
        CREATE (p)-[:WORKS_IN {since: 2020}]->(d)
        """)

        session.run("""
        MATCH (q:Person {name:'Bob'}), (d:Department {name:'QA'})
        CREATE (q)-[:MANAGES {level:'Senior'}]->(d)
        """)

        session.run("""
        MATCH (p:Person {name:'Alice'}), (t:Tool {name:'Playwright'})
        CREATE (p)-[:USES {frequency:'daily'}]->(t)
        """)

        session.run("""
        MATCH (q:Person {name:'Bob'}), (s:Tool {name:'Selenium'})
        CREATE (q)-[:USES {frequency:'weekly'}]->(s)
        """)

        # Tool -> Concepts
        session.run("""
        MATCH (t:Tool {name:'Playwright'}), (c:Concept {name:'Browser Automation'})
        CREATE (t)-[:ENABLES]->(c)
        """)

        session.run("""
        MATCH (s:Tool {name:'Selenium'}), (f:Concept {name:'Functional Testing'})
        CREATE (s)-[:ENABLES]->(f)
        """)

        # Organization relationships
        session.run("""
        MATCH (d:Department {name:'QA'}), (o:Organization {name:'TechCorp'})
        CREATE (d)-[:PART_OF]->(o)
        """)

        # Add cycle intentionally
        session.run("""
        MATCH (p:Person {name:'Alice'}), (q:Person {name:'Bob'})
        CREATE (p)-[:COLLABORATES_WITH]->(q),
               (q)-[:COLLABORATES_WITH]->(p)
        """)


# ------------------------------
# 3. Advanced tests
# ------------------------------

def test_multi_label_nodes():
    with driver.session() as session:
        result = session.run("""
            MATCH (p:Person:Engineer)
            RETURN p.name AS name
        """)
        names = [row["name"] for row in result]
        assert "Alice" in names, "Multi-label node test failed."


def test_relationship_properties():
    with driver.session() as session:
        result = session.run("""
            MATCH (:Person {name:'Alice'})-[r:WORKS_IN]->(:Department)
            RETURN r.since AS since
        """).single()

        assert result["since"] == 2020, "Relationship property not stored correctly."


def test_variable_length_paths():
    with driver.session() as session:
        result = session.run("""
            MATCH p = (a:Person {name:'Alice'})-[:COLLABORATES_WITH*1..3]->(b)
            RETURN count(p) AS paths
        """).single()

        assert result["paths"] >= 1, "Variable-length traversal failed."


def test_deep_reasoning_query():
    with driver.session() as session:
        result = session.run("""
            MATCH (p:Person {name:'Alice'})-[:USES]->(:Tool)-[:ENABLES]->(c:Concept)
            RETURN c.name AS concept
        """).single()

        assert result["concept"] == "Browser Automation", \
            "Deep reasoning chain failed."


def test_negative_missing_node():
    with driver.session() as session:
        result = session.run("""
            MATCH (x:Person {name:'Nonexistent'})
            RETURN x
        """).single()

        assert result is None, "Negative test failed: nonexistent node returned something."


def test_merge_vs_create():
    with driver.session() as session:
        # MERGE should not create duplicates
        session.run("""
            MERGE (:Tool {name:'Playwright'})
        """)

        result = session.run("""
            MATCH (t:Tool {name:'Playwright'})
            RETURN count(t) AS cnt
        """).single()

        assert result["cnt"] == 1, "MERGE created duplicates."


def test_cycle_query():
    with driver.session() as session:
        result = session.run("""
            MATCH p = (a:Person {name:'Alice'})-[:COLLABORATES_WITH]->(:Person)
            RETURN length(p) AS len
        """).single()

        assert result["len"] == 1, "Cycle relationship incorrect."


def test_delete_behavior():
    with driver.session() as session:
        session.run("MATCH (n:Tool {name:'Selenium'}) DETACH DELETE n")

        result = session.run("""
            MATCH (t:Tool {name:'Selenium'})
            RETURN t
        """).single()

        assert result is None, "DELETE did not work correctly."


# ------------------------------
# Test runner
# ------------------------------
if __name__ == "__main__":
    print("\n===== RESETTING GRAPH =====")
    reset_graph()

    print("\n===== CREATING COMPLEX GRAPH =====")
    create_complex_graph()

    print("\n===== RUNNING ADVANCED TESTS =====")

    test_multi_label_nodes()
    test_relationship_properties()
    test_variable_length_paths()
    test_deep_reasoning_query()
    test_negative_missing_node()
    test_merge_vs_create()
    test_cycle_query()
    test_delete_behavior()

    print("\n🎉 ALL ADVANCED KNOWLEDGE GRAPH TESTS PASSED SUCCESSFULLY!")
