# KG 01. Core Graph Concepts

## Core Concept

**Graphs represent data as nodes (entities) connected by relationships (edges), enabling you to model and query complex connections between entities.**

Understanding these fundamental concepts is the foundation of all graph work.

## The Six Essential Concepts

### 1. Node

**Definition:** A node is an entity or thing in your graph - a single unit of data.

**Examples:**
- A person: `(Alice)`
- A bug: `(Bug123)`
- A service: `(LoginService)`
- A file: `(/src/auth.py)`
- A function: `(authenticate_user)`

**Visual:**
```
(Alice)    (Bug123)    (LoginService)
```

**Why it matters:** Nodes are the fundamental building blocks - everything in your graph is a node.

---

### 2. Relationship / Edge

**Definition:** A relationship connects two nodes, representing how they relate to each other.

**Examples:**
- `(Alice)-[:WORKS_ON]->(Bug123)` - Alice works on Bug123
- `(Bug123)-[:IMPACTS]->(LoginService)` - Bug123 impacts LoginService
- `(LoginService)-[:DEPENDS_ON]->(DatabaseService)` - LoginService depends on DatabaseService

**Visual:**
```
(Alice) --[:WORKS_ON]--> (Bug123)
(Bug123) --[:IMPACTS]--> (LoginService)
```

**Why it matters:** Relationships capture connections and dependencies - the power of graphs comes from these links.

---

### 3. Property

**Definition:** Properties are key-value pairs stored on nodes or relationships, providing additional information.

**Examples on Nodes:**
- `(Person {name: "Alice", age: 30, role: "Developer"})`
- `(Bug {id: "Bug123", severity: "High", status: "Open"})`
- `(Service {name: "LoginService", version: "2.1", status: "Active"})`

**Examples on Relationships:**
- `(Alice)-[:WORKS_ON {since: "2024-01-15", hours: 40}]->(Bug123)`
- `(Bug123)-[:IMPACTS {severity: "High", first_seen: "2024-01-20"}]->(LoginService)`

**Visual:**
```
(Person {name: "Alice", age: 30})
    |
    |--[:WORKS_ON {since: "2024-01-15"}]-->
    |
(Bug {id: "Bug123", severity: "High"})
```

**Why it matters:** Properties store the actual data - nodes and relationships without properties are just structure.

---

### 4. Label (Node Type)

**Definition:** Labels categorize nodes into types, allowing you to group similar entities.

**Examples:**
- `Person` - All person nodes
- `Bug` - All bug nodes
- `Service` - All service nodes
- `File` - All file nodes
- `Function` - All function nodes

**Visual:**
```
(:Person)    (:Bug)    (:Service)
```

**In Cypher:**
```cypher
(:Person {name: "Alice"})
(:Bug {id: "Bug123"})
(:Service {name: "LoginService"})
```

**Why it matters:** Labels enable type-based queries and schema organization - you can find all Person nodes, all Bug nodes, etc.

---

### 5. Relationship Type

**Definition:** Relationship types categorize relationships, defining what kind of connection exists.

**Examples:**
- `FRIEND_OF` - Social connections
- `DEPENDS_ON` - Dependency relationships
- `IMPACTS` - Impact relationships
- `CALLS` - Function calls
- `FIXED_BY` - Bug fixes
- `COVERS` - Test coverage

**Visual:**
```
(Alice) --[:FRIEND_OF]--> (Bob)
(ServiceA) --[:DEPENDS_ON]--> (ServiceB)
(Bug123) --[:FIXED_BY]--> (Fix456)
```

**In Cypher:**
```cypher
(Alice)-[:FRIEND_OF]->(Bob)
(ServiceA)-[:DEPENDS_ON]->(ServiceB)
(Bug123)-[:FIXED_BY]->(Fix456)
```

**Why it matters:** Relationship types define the semantics of connections - `DEPENDS_ON` means something different than `IMPACTS`.

---

### 6. Direction (A → B vs B → A)

**Definition:** Relationships have direction - they go from one node to another, creating a meaningful flow.

**Examples:**
- `(Alice)-[:WORKS_ON]->(Bug123)` - Alice works on Bug123 (one direction)
- `(Bug123)-[:IMPACTS]->(LoginService)` - Bug123 impacts LoginService (one direction)
- `(ServiceA)-[:DEPENDS_ON]->(ServiceB)` - ServiceA depends on ServiceB (one direction)

**Direction Matters:**
```
(Alice)-[:WORKS_ON]->(Bug123)  ✅ Correct: Alice works on bug
(Bug123)-[:WORKS_ON]->(Alice)  ❌ Wrong: Bug works on Alice (doesn't make sense)
```

**Bidirectional Relationships:**
If you need both directions, create two relationships:
```cypher
(Alice)-[:FRIEND_OF]->(Bob)
(Bob)-[:FRIEND_OF]->(Alice)
```

**Why it matters:** Direction captures causality and flow - `A DEPENDS_ON B` is different from `B DEPENDS_ON A`.

---

## Complete Example

### A Real Graph
```
(:Person {name: "Alice", role: "Developer"})
    |
    |--[:WORKS_ON {since: "2024-01-15"}]-->
    |
(:Bug {id: "Bug123", severity: "High", status: "Open"})
    |
    |--[:IMPACTS {severity: "High"}]-->
    |
(:Service {name: "LoginService", version: "2.1"})
    |
    |--[:DEPENDS_ON]-->
    |
(:Service {name: "DatabaseService", version: "1.5"})
```

**In Cypher:**
```cypher
(:Person {name: "Alice", role: "Developer"})
  -[:WORKS_ON {since: "2024-01-15"}]->
(:Bug {id: "Bug123", severity: "High", status: "Open"})
  -[:IMPACTS {severity: "High"}]->
(:Service {name: "LoginService", version: "2.1"})
  -[:DEPENDS_ON]->
(:Service {name: "DatabaseService", version: "1.5"})
```

---

## What You Need to Recognize

### In Visual Diagrams
- **Circles/Ovals** = Nodes
- **Arrows/Lines** = Relationships
- **Labels on nodes** = Node types (Person, Bug, Service)
- **Labels on arrows** = Relationship types (WORKS_ON, IMPACTS)
- **Arrow direction** = Relationship direction

### In Cypher Queries
```cypher
// Node with label and properties
(:Person {name: "Alice"})

// Relationship with type
-[:WORKS_ON]->

// Complete pattern
(:Person {name: "Alice"})-[:WORKS_ON]->(:Bug {id: "Bug123"})
```

### In Discussions
- "Node" = Entity/thing in the graph
- "Relationship" = Connection between nodes
- "Property" = Data stored on nodes/relationships
- "Label" = Node type
- "Relationship type" = Kind of connection
- "Direction" = Which way the relationship flows

## Common Mistakes

❌ **Wrong:** Nodes without labels (can't query by type)  
✅ **Right:** Always use labels to categorize nodes

❌ **Wrong:** Relationships without types (can't distinguish connections)  
✅ **Right:** Always specify relationship types

❌ **Wrong:** Ignoring direction (loses meaning)  
✅ **Right:** Use direction to capture causality and flow

❌ **Wrong:** Storing everything in properties (loses graph structure)  
✅ **Right:** Use relationships to model connections, properties for attributes

## How to Discuss This Confidently

### With Non-Technical People
"Graphs represent things (nodes) and how they connect (relationships). For example, a person node connects to a bug node with a 'works on' relationship. This lets us see who's working on what, what depends on what, and how things are connected."

### With Technical People
"Graphs model data as nodes (entities with labels and properties) connected by directed relationships (edges with types and properties). This enables querying complex connections and dependencies that would be difficult in relational or document databases."

### With Architects
"Our graph model uses labeled nodes (Person, Bug, Service) with properties (id, name, status) connected by typed, directed relationships (WORKS_ON, IMPACTS, DEPENDS_ON). This structure enables efficient traversal queries and dependency analysis."

## Practical Recognition

**You'll see these concepts when:**
- Designing graph schemas
- Writing Cypher queries
- Visualizing graphs
- Discussing graph architecture

**You'll know you understand when:**
- You can identify nodes, relationships, and properties in any graph
- You understand why direction matters
- You can design node labels and relationship types
- You can explain the difference between structure (nodes/relationships) and data (properties)

## Key Takeaways

1. **Node** = Entity/thing (with label and properties)
2. **Relationship** = Connection between nodes (with type, direction, and optional properties)
3. **Property** = Key-value data on nodes/relationships
4. **Label** = Node type/category
5. **Relationship Type** = Kind of connection
6. **Direction** = Flow/causality (A → B is different from B → A)

---

**Next:** [KG_02_Entity_and_Mention_Concepts.md](KG_02_Entity_and_Mention_Concepts.md) - Entities vs mentions for LLM integration


