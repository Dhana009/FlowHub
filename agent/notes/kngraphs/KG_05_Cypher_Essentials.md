# KG 05. Cypher Essentials

## Core Concept

**Cypher is the query language for Neo4j. You only need three operations for 80% of graph work: MERGE (create-if-not-exists), MATCH (find), and RETURN (return data).**

Master these three, and you can build and query graphs effectively.

## The Three Essential Operations

### 1. MERGE (Create-If-Not-Exists)

**Definition:** MERGE creates a node or relationship if it doesn't exist, or matches it if it does. This prevents duplicates.

**Syntax:**
```cypher
MERGE (node:Label {property: "value"})
```

**For Nodes:**
```cypher
// Create person if doesn't exist, match if exists
MERGE (p:Person {id: "person_123"})
SET p.name = "Alice"
RETURN p
```

**For Relationships:**
```cypher
// Create relationship if doesn't exist
MATCH (a:Person {id: "person_123"})
MATCH (b:Bug {id: "bug_456"})
MERGE (a)-[:WORKS_ON]->(b)
```

**Why It Matters:**
- Prevents duplicate nodes
- Idempotent operations (safe to run multiple times)
- Essential for entity resolution

**Key Points:**
- **Always use unique identifier** in MERGE pattern
- **SET properties** after MERGE (updates if exists)
- **MERGE on relationships** requires MATCH first

---

### 2. MATCH (Find)

**Definition:** MATCH finds nodes and relationships that match a pattern.

**Syntax:**
```cypher
MATCH (node:Label {property: "value"})
```

**Basic Patterns:**

**Find by ID:**
```cypher
MATCH (p:Person {id: "person_123"})
RETURN p
```

**Find by Property:**
```cypher
MATCH (b:Bug {status: "Open"})
RETURN b
```

**Find Relationships:**
```cypher
MATCH (p:Person)-[:WORKS_ON]->(b:Bug)
RETURN p, b
```

**Find Neighbors:**
```cypher
MATCH (p:Person {id: "person_123"})-[:WORKS_ON]->(b:Bug)
RETURN b
```

**Why It Matters:**
- Core query operation
- Enables all graph queries
- Foundation for traversal

**Key Points:**
- **Use unique identifiers** for precise matching
- **Specify direction** for relationships
- **Can chain** multiple MATCH clauses

---

### 3. RETURN (Return Data)

**Definition:** RETURN specifies what data to return from a query.

**Syntax:**
```cypher
RETURN variable1, variable2
```

**Examples:**

**Return Node:**
```cypher
MATCH (p:Person {id: "person_123"})
RETURN p
```

**Return Properties:**
```cypher
MATCH (p:Person {id: "person_123"})
RETURN p.name, p.role
```

**Return Multiple:**
```cypher
MATCH (p:Person)-[:WORKS_ON]->(b:Bug)
RETURN p.name, b.title, b.status
```

**Return with Alias:**
```cypher
MATCH (p:Person {id: "person_123"})
RETURN p.name AS person_name, p.role AS person_role
```

**Why It Matters:**
- Controls query output
- Enables data extraction
- Required in most queries

**Key Points:**
- **Return what you need** (not everything)
- **Use aliases** for clarity
- **Can return** nodes, properties, or computed values

---

## Complete Examples

### Example 1: Create Node
```cypher
MERGE (p:Person {id: "person_123"})
SET p.name = "Alice", p.role = "Developer"
RETURN p
```

**What it does:**
1. Looks for Person with id="person_123"
2. Creates if doesn't exist, matches if exists
3. Sets/updates name and role
4. Returns the node

---

### Example 2: Create Relationship
```cypher
MATCH (p:Person {id: "person_123"})
MATCH (b:Bug {id: "bug_456"})
MERGE (p)-[:WORKS_ON]->(b)
RETURN p, b
```

**What it does:**
1. Finds Person with id="person_123"
2. Finds Bug with id="bug_456"
3. Creates WORKS_ON relationship if doesn't exist
4. Returns both nodes

---

### Example 3: Find Neighbors
```cypher
MATCH (p:Person {id: "person_123"})-[:WORKS_ON]->(b:Bug)
RETURN b.title, b.status
```

**What it does:**
1. Finds Person with id="person_123"
2. Follows WORKS_ON relationships
3. Returns connected Bug titles and statuses

---

### Example 4: Find by Property
```cypher
MATCH (b:Bug {status: "Open"})
RETURN b.id, b.title, b.severity
```

**What it does:**
1. Finds all Bugs with status="Open"
2. Returns id, title, and severity

---

## Common Patterns

### Pattern 1: Create or Update Node
```cypher
MERGE (p:Person {id: "person_123"})
SET p.name = "Alice",
    p.role = "Developer",
    p.updated_at = datetime()
RETURN p
```

### Pattern 2: Create Relationship Between Existing Nodes
```cypher
MATCH (a:Person {id: "person_123"})
MATCH (b:Bug {id: "bug_456"})
MERGE (a)-[:WORKS_ON {since: "2024-01-15"}]->(b)
RETURN a, b
```

### Pattern 3: Find All Connected Nodes
```cypher
MATCH (p:Person {id: "person_123"})-[r]->(connected)
RETURN type(r) AS relationship_type, labels(connected) AS node_type, connected
```

### Pattern 4: Find Nodes by Relationship
```cypher
MATCH (b:Bug)<-[:IMPACTS]-(service:Service)
RETURN b.title, service.name
```

---

## What You Need to Recognize

### In Code
```cypher
// MERGE pattern
MERGE (n:Label {id: "unique_id"})

// MATCH pattern
MATCH (n:Label {property: "value"})

// RETURN pattern
RETURN n.property1, n.property2
```

### In Queries
- **MERGE** = Create if not exists
- **MATCH** = Find nodes/relationships
- **RETURN** = Specify output

### In Discussions
- "MERGE operation" = Create-if-not-exists
- "MATCH query" = Find pattern
- "RETURN clause" = Output specification

## Common Mistakes

❌ **Wrong:** Using CREATE instead of MERGE (creates duplicates)  
✅ **Right:** Use MERGE to prevent duplicates

❌ **Wrong:** MERGE without unique identifier  
✅ **Right:** Always use unique ID in MERGE pattern

❌ **Wrong:** Forgetting RETURN clause  
✅ **Right:** Always RETURN what you need

❌ **Wrong:** MATCH without WHERE (when needed)  
✅ **Right:** Use WHERE for complex conditions

## Advanced (Optional - Not Required for 20%)

These are nice-to-know but not essential:

- **WHERE** - Filter conditions
- **WITH** - Chain queries
- **UNWIND** - Expand lists
- **OPTIONAL MATCH** - Optional patterns
- **ORDER BY** - Sort results
- **LIMIT** - Limit results

**You can learn these later** - the three essentials (MERGE, MATCH, RETURN) cover 80% of use cases.

## How to Discuss This Confidently

### With Non-Technical People
"Cypher has three main operations: MERGE creates things if they don't exist (prevents duplicates), MATCH finds things in the graph, and RETURN specifies what data to get back. With just these three, you can build and query graphs."

### With Technical People
"We use Cypher's three essential operations: MERGE for idempotent node/relationship creation (using unique identifiers), MATCH for pattern matching and traversal, and RETURN for data extraction. These cover 80% of graph operations."

### With Architects
"Our Cypher usage focuses on three core operations: MERGE with unique identifiers for entity resolution and duplicate prevention, MATCH for graph traversal and pattern matching, and RETURN for result specification. This minimal set enables efficient graph operations while maintaining simplicity."

## Practical Recognition

**You'll see these operations when:**
- Creating nodes and relationships
- Querying the graph
- Building ingestion pipelines
- Writing graph queries

**You'll know you understand when:**
- You can write MERGE statements correctly
- You can write MATCH queries for common patterns
- You can use RETURN to get needed data
- You can combine all three in complete queries

## Key Takeaways

1. **MERGE** = Create-if-not-exists (prevents duplicates)
2. **MATCH** = Find nodes/relationships (core query operation)
3. **RETURN** = Specify output (required in most queries)
4. **That's it!** - These three cover 80% of graph work

---

**Next:** [KG_06_Ingestion_Pipeline_Concepts.md](KG_06_Ingestion_Pipeline_Concepts.md) - How data flows into graphs


