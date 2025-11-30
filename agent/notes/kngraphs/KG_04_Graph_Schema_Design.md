# KG 04. Graph Schema Design

## Core Concept

**Graph schema design defines the structure of your graph: what types of nodes exist, what relationships connect them, and what properties store the data.**

A well-designed schema enables efficient queries and clear data organization.

## The Four Schema Components

### 1. Node Types (Labels)

**Definition:** Node types categorize entities into groups with similar properties and relationships.

**Common Node Types:**
- `Person` - People in the system
- `Bug` - Bug reports/issues
- `Module` - Code modules/components
- `Service` - Services/microservices
- `TestCase` - Test cases
- `File` - Source files
- `Function` - Functions/methods

**Design Principles:**
- **Semantic grouping:** Group similar entities
- **Query needs:** Design for how you'll query
- **Clear boundaries:** Each type should be distinct

**Example Schema:**
```cypher
(:Person)      // People
(:Bug)         // Bugs/issues
(:Service)     // Services
(:File)        // Files
(:Function)    // Functions
(:TestCase)    // Test cases
```

---

### 2. Relationship Types

**Definition:** Relationship types define what kind of connections exist between nodes.

**Common Relationship Types:**
- `FRIEND_OF` - Social connections
- `DEPENDS_ON` - Dependencies
- `IMPACTS` - Impact relationships
- `CALLS` - Function calls
- `FIXED_BY` - Bug fixes
- `COVERS` - Test coverage
- `WORKS_ON` - Work assignments
- `CONTAINS` - Containment (file contains function)

**Design Principles:**
- **Semantic clarity:** Name describes the relationship
- **Direction matters:** A → B is different from B → A
- **Specific types:** Avoid generic "RELATED_TO"

**Example Schema:**
```cypher
(:Person)-[:WORKS_ON]->(:Bug)
(:Person)-[:FRIEND_OF]->(:Person)
(:Bug)-[:IMPACTS]->(:Service)
(:Service)-[:DEPENDS_ON]->(:Service)
(:Function)-[:CALLS]->(:Function)
(:Bug)-[:FIXED_BY]->(:Person)
(:TestCase)-[:COVERS]->(:Function)
(:File)-[:CONTAINS]->(:Function)
```

---

### 3. Key Properties

**Definition:** Properties store the actual data on nodes and relationships.

**Common Node Properties:**
- `id` - Unique identifier (CRITICAL)
- `name` - Display name
- `timestamp` - When created/updated
- `severity` - For bugs (High, Medium, Low)
- `version` - For services/modules
- `tags` - Categories/labels
- `status` - Current state (Open, Closed, Active, etc.)

**Common Relationship Properties:**
- `since` - When relationship was created
- `first_seen` - First occurrence
- `last_seen` - Last occurrence
- `severity` - Impact severity
- `confidence` - How certain the relationship is

**Design Principles:**
- **Unique IDs:** Every node needs a unique identifier
- **Essential data:** Store what you need to query
- **Avoid redundancy:** Don't duplicate data in relationships

**Example Schema:**
```cypher
(:Person {
  id: "person_123",        // Unique ID
  name: "Alice",
  role: "Developer",
  email: "alice@example.com"
})

(:Bug {
  id: "bug_456",
  title: "Authentication failure",
  severity: "High",
  status: "Open",
  created_at: "2024-01-15"
})

(:Service {
  id: "service_login",
  name: "LoginService",
  version: "2.1",
  status: "Active"
})

(:Person)-[:WORKS_ON {
  since: "2024-01-15",
  hours: 40
}]->(:Bug)
```

---

### 4. Unique Identifier Per Node Type

**Definition:** Each node type needs a unique identifier property for reliable MERGE operations.

**Why It Matters:**
- Prevents duplicate nodes
- Enables reliable MERGE
- Enables entity resolution
- Enables relationship creation

**Identifier Strategies:**

**Strategy 1: Type-Specific IDs**
```cypher
(:Person {person_id: "person_123"})
(:Bug {bug_id: "bug_456"})
(:Service {service_id: "service_login"})
```

**Strategy 2: Generic ID with Type**
```cypher
(:Person {id: "person_123", type: "Person"})
(:Bug {id: "bug_456", type: "Bug"})
(:Service {id: "service_login", type: "Service"})
```

**Strategy 3: Composite Key**
```cypher
(:Person {id: "person_123"})  // id is unique across all types
(:Bug {id: "bug_456"})         // or use UUIDs
```

**Best Practice:**
```cypher
// Use consistent naming
(:Person {id: "person_123"})    // Prefix with type
(:Bug {id: "bug_456"})          // Makes IDs clear
(:Service {id: "service_login"}) // And unique
```

---

## Complete Schema Example

### Project: Bug Tracking System

**Node Types:**
```cypher
(:Person)      // Developers, testers, managers
(:Bug)         // Bug reports
(:Service)     // Services affected by bugs
(:Module)      // Code modules
(:TestCase)    // Test cases
(:File)        // Source files
```

**Relationship Types:**
```cypher
(:Person)-[:WORKS_ON]->(:Bug)
(:Person)-[:REPORTS]->(:Bug)
(:Bug)-[:IMPACTS]->(:Service)
(:Bug)-[:IMPACTS]->(:Module)
(:Bug)-[:FIXED_BY]->(:Person)
(:Service)-[:DEPENDS_ON]->(:Service)
(:TestCase)-[:COVERS]->(:Module)
(:File)-[:CONTAINS]->(:Module)
```

**Properties:**
```cypher
(:Person {
  id: "person_123",
  name: "Alice",
  role: "Developer",
  email: "alice@example.com"
})

(:Bug {
  id: "bug_456",
  title: "Authentication failure",
  severity: "High",
  status: "Open",
  created_at: "2024-01-15",
  description: "Users cannot log in"
})

(:Service {
  id: "service_login",
  name: "LoginService",
  version: "2.1",
  status: "Active"
})

(:Person)-[:WORKS_ON {
  since: "2024-01-15",
  hours: 40
}]->(:Bug)

(:Bug)-[:IMPACTS {
  severity: "High",
  first_seen: "2024-01-15"
}]->(:Service)
```

---

## Schema Design Process

### Step 1: Identify Entities
**Question:** What are the main things in your system?

**Example:**
- People (developers, testers)
- Bugs (issues, defects)
- Services (microservices)
- Code (modules, functions, files)

### Step 2: Identify Relationships
**Question:** How do entities connect?

**Example:**
- People work on bugs
- Bugs impact services
- Services depend on other services
- Tests cover modules

### Step 3: Define Properties
**Question:** What data do you need to store?

**Example:**
- Person: id, name, role, email
- Bug: id, title, severity, status, created_at
- Service: id, name, version, status

### Step 4: Choose Unique Identifiers
**Question:** How will you uniquely identify each entity?

**Example:**
- Person: `person_{uuid}` or `person_{email}`
- Bug: `bug_{id}` or `bug_{uuid}`
- Service: `service_{name}` or `service_{uuid}`

---

## What You Need to Recognize

### In Schema Design
- **Node types** = What entities exist
- **Relationship types** = How entities connect
- **Properties** = What data is stored
- **Unique IDs** = How to identify entities

### In Cypher Queries
```cypher
// Node type
(:Person)

// Relationship type
-[:WORKS_ON]->

// Properties
{id: "person_123", name: "Alice"}

// Unique identifier
MERGE (p:Person {id: "person_123"})
```

### In Discussions
- "Schema design" = Defining node types, relationships, properties
- "Node type" = Label/category
- "Relationship type" = Kind of connection
- "Unique identifier" = ID for MERGE operations

## Common Mistakes

❌ **Wrong:** No unique identifiers  
✅ **Right:** Always use unique IDs for MERGE

❌ **Wrong:** Too many node types (over-engineering)  
✅ **Right:** Start simple, add types as needed

❌ **Wrong:** Generic relationship types ("RELATED_TO")  
✅ **Right:** Use specific, semantic relationship types

❌ **Wrong:** Storing everything in properties  
✅ **Right:** Use relationships to model connections

## How to Discuss This Confidently

### With Non-Technical People
"We design the graph structure by defining what types of things exist (people, bugs, services), how they connect (works on, impacts, depends on), and what information we store about each (name, status, dates). Each thing needs a unique ID so we can reliably find and update it."

### With Technical People
"Our graph schema defines node types (Person, Bug, Service), relationship types (WORKS_ON, IMPACTS, DEPENDS_ON), and properties (id, name, status, timestamps). Each node type has a unique identifier property (person_id, bug_id) for reliable MERGE operations and entity resolution."

### With Architects
"Our schema design uses labeled nodes (Person, Bug, Service) with type-specific unique identifiers (person_id, bug_id, service_id), typed directed relationships (WORKS_ON, IMPACTS, DEPENDS_ON), and essential properties (id, name, status, timestamps). This structure enables efficient traversal queries and prevents duplicates through MERGE operations."

## Practical Recognition

**You'll see schema design when:**
- Starting a new graph project
- Defining data model
- Writing Cypher queries
- Discussing architecture

**You'll know you understand when:**
- You can design a schema for your project
- You understand why unique IDs are critical
- You can choose appropriate node and relationship types
- You can explain your schema design

## Key Takeaways

1. **Node types** = Categories of entities (Person, Bug, Service)
2. **Relationship types** = Kinds of connections (WORKS_ON, IMPACTS)
3. **Properties** = Data stored on nodes/relationships
4. **Unique IDs** = Critical for MERGE and entity resolution

---

**Next:** [KG_05_Cypher_Essentials.md](KG_05_Cypher_Essentials.md) - The only Cypher you need


