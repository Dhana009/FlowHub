# KG 08. Graph Retrieval Patterns

## Core Concept

**Graph retrieval patterns are common query types: finding neighbors, paths, and impacts. Knowing these patterns lets you design queries even if someone else writes the exact Cypher.**

You need to understand the patterns, not advanced querying.

## The Three Essential Patterns

### 1. Neighbors (Direct Connections)

**Pattern:** "Who/what is directly connected to X?"

**Use Cases:**
- Find all bugs a person works on
- Find all services a bug impacts
- Find all people connected to a service

**Conceptual Query:**
```
Given node X, find all nodes directly connected to X
```

**Examples:**

**Find bugs a person works on:**
```cypher
MATCH (p:Person {id: "person_123"})-[:WORKS_ON]->(b:Bug)
RETURN b
```

**Find services a bug impacts:**
```cypher
MATCH (b:Bug {id: "bug_123"})-[:IMPACTS]->(s:Service)
RETURN s
```

**Find all connections:**
```cypher
MATCH (p:Person {id: "person_123"})-[r]->(connected)
RETURN type(r) AS relationship_type, connected
```

**Why It Matters:**
- Most common query pattern
- Foundation for other patterns
- Enables direct relationship queries

---

### 2. Paths (Multi-Hop)

**Pattern:** "What is the path from A to B?" or "What connects A to B?"

**Use Cases:**
- Find dependency chains
- Trace impact propagation
- Find connection paths
- Multi-hop relationships

**Conceptual Query:**
```
Find a path (sequence of relationships) from node A to node B
```

**Examples:**

**Find dependency chain:**
```cypher
MATCH path = (s1:Service {id: "service_a"})-[:DEPENDS_ON*]->(s2:Service {id: "service_b"})
RETURN path
```

**Find any path between nodes:**
```cypher
MATCH path = (a:Person {id: "person_123"})-[*1..5]-(b:Bug {id: "bug_456"})
RETURN path
```

**Find shortest path:**
```cypher
MATCH path = shortestPath(
  (a:Service {id: "service_a"})-[*]-(b:Service {id: "service_b"})
)
RETURN path
```

**Why It Matters:**
- Enables dependency analysis
- Traces impact propagation
- Finds indirect connections
- Multi-hop traversal

---

### 3. Impact Analysis

**Pattern:** "What is impacted if we change X?" or "What depends on X?"

**Use Cases:**
- Dependency analysis
- Impact assessment
- Change propagation
- Risk analysis

**Conceptual Query:**
```
Starting from node X, find all nodes reachable through specific relationship types
```

**Examples:**

**What depends on a service:**
```cypher
MATCH (dependent:Service)-[:DEPENDS_ON*]->(s:Service {id: "service_login"})
RETURN dependent
```

**What is impacted by a bug:**
```cypher
MATCH (b:Bug {id: "bug_123"})-[:IMPACTS*]->(impacted)
RETURN impacted
```

**What services are affected if we change Service A:**
```cypher
MATCH (s:Service {id: "service_a"})<-[:DEPENDS_ON*]-(dependent:Service)
RETURN dependent
```

**Why It Matters:**
- Critical for dependency management
- Enables impact assessment
- Supports change planning
- Risk analysis

---

## Pattern Combinations

### Pattern 1: Neighbors + Filter
**Find neighbors with specific properties:**
```cypher
MATCH (p:Person {id: "person_123"})-[:WORKS_ON]->(b:Bug)
WHERE b.status = "Open"
RETURN b
```

### Pattern 2: Path + Limit Depth
**Find paths up to N hops:**
```cypher
MATCH path = (a:Service)-[:DEPENDS_ON*1..3]->(b:Service)
RETURN path
```

### Pattern 3: Impact + Temporal
**Find recent impacts:**
```cypher
MATCH (b:Bug)-[r:IMPACTS]->(s:Service)
WHERE r.last_seen > "2024-01-20"
RETURN b, s
```

---

## What You Need to Recognize

### In Query Design
- **Neighbors pattern** = Direct connections
- **Path pattern** = Multi-hop traversal
- **Impact pattern** = Dependency/impact analysis

### In Use Cases
- "Who works on this?" → Neighbors pattern
- "What's the dependency chain?" → Path pattern
- "What will break if we change this?" → Impact pattern

### In Discussions
- "Direct connections" = Neighbors pattern
- "Multi-hop queries" = Path pattern
- "Impact analysis" = Impact pattern
- "Dependency traversal" = Impact pattern

## Common Patterns in Practice

### Pattern 1: Find All Related
```cypher
// Find everything connected to a node
MATCH (n {id: "node_id"})-[r]-(connected)
RETURN type(r), connected
```

### Pattern 2: Find Specific Relationship Type
```cypher
// Find all nodes with specific relationship
MATCH (a)-[:DEPENDS_ON]->(b)
RETURN a, b
```

### Pattern 3: Find Reachable Nodes
```cypher
// Find all nodes reachable through relationships
MATCH (start {id: "start_id"})-[*]->(reachable)
RETURN reachable
```

## Common Mistakes

❌ **Wrong:** Only looking at direct neighbors  
✅ **Right:** Consider multi-hop for complete picture

❌ **Wrong:** Not limiting path depth  
✅ **Right:** Use depth limits to prevent infinite paths

❌ **Wrong:** Ignoring relationship direction  
✅ **Right:** Direction matters for dependencies/impacts

## How to Discuss This Confidently

### With Non-Technical People
"Graph queries have three main patterns: finding direct connections (neighbors), finding paths between things (multi-hop), and understanding impacts (what depends on or is affected by something). These patterns let us answer questions about relationships and dependencies."

### With Technical People
"We use three core retrieval patterns: neighbors (direct connections via MATCH with single relationship), paths (multi-hop traversal with variable-length patterns), and impact analysis (reachability queries for dependencies and impacts). Each pattern serves different query needs."

### With Architects
"Our graph retrieval strategy uses three essential patterns: neighbors (direct relationship queries), paths (variable-length traversal for dependency chains), and impact analysis (reachability queries for change propagation). We apply depth limits and relationship type filters to optimize performance."

## Practical Recognition

**You'll see these patterns when:**
- Designing queries
- Analyzing dependencies
- Understanding impacts
- Tracing connections

**You'll know you understand when:**
- You can identify which pattern to use
- You can describe the query conceptually
- You can guide query design
- You understand when to use each pattern

## Key Takeaways

1. **Neighbors** = Direct connections (most common)
2. **Paths** = Multi-hop traversal (dependency chains)
3. **Impact Analysis** = Reachability queries (dependencies/impacts)
4. **Know patterns** = You can guide design even without writing Cypher

---

**Next:** [KG_09_Neo4j_as_the_Engine.md](KG_09_Neo4j_as_the_Engine.md) - Neo4j basics


