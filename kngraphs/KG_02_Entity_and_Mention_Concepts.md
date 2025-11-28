# KG 02. Entity and Mention Concepts

## Core Concept

**Entities are unique things in your knowledge graph, while mentions are specific occurrences of those entities in text. Mapping mentions to entities enables deduplication and linking.**

This distinction is critical when extracting graph data from unstructured text using LLMs.

## The Two Concepts

### Entity

**Definition:** An entity is a unique, canonical representation of a thing in your knowledge graph.

**Characteristics:**
- **Unique:** One entity per real-world thing
- **Canonical:** The "official" representation
- **Persistent:** Exists across multiple documents/texts
- **Has identity:** Can be uniquely identified

**Examples:**
- Entity: `Rama` (the person, regardless of how they're mentioned)
- Entity: `LoginService` (the service, regardless of how it's referenced)
- Entity: `Bug123` (the bug, regardless of how it's described)

**In the Graph:**
```cypher
(:Person {id: "person_rama", name: "Rama"})
(:Service {id: "service_login", name: "LoginService"})
(:Bug {id: "bug_123", title: "Authentication failure"})
```

**Why it matters:** Entities are the nodes in your graph - they're what you store and query.

---

### Mention

**Definition:** A mention is a specific occurrence or reference to an entity within a piece of text.

**Characteristics:**
- **Occurrence:** A specific instance in text
- **Variable:** Can appear in different forms
- **Temporary:** Exists only in that text
- **Needs linking:** Must be mapped to an entity

**Examples:**
- Text: "Rama fixed the login bug"
  - Mentions: "Rama", "login bug"
- Text: "The LoginService is down"
  - Mentions: "LoginService", "The LoginService"
- Text: "Bug #123 needs attention"
  - Mentions: "Bug #123", "123"

**Why it matters:** Mentions are what LLMs extract from text - you need to link them to entities.

---

## The Key Difference

### Entity vs Mention

| Aspect | Entity | Mention |
|--------|--------|---------|
| **Nature** | Unique thing | Text occurrence |
| **Persistence** | Permanent in graph | Temporary in text |
| **Uniqueness** | One per real thing | Many per entity |
| **Form** | Canonical | Variable |
| **Location** | Graph database | Source text |

### Example: Same Entity, Multiple Mentions

**Text 1:** "Rama fixed the login issue"
- Mention: "Rama" → Entity: `(:Person {id: "person_rama", name: "Rama"})`

**Text 2:** "Rama is working on authentication"
- Mention: "Rama" → Entity: `(:Person {id: "person_rama", name: "Rama"})` (same entity!)

**Text 3:** "The developer fixed it"
- Mention: "The developer" → Entity: `(:Person {id: "person_rama", name: "Rama"})` (same entity, different mention!)

**Result:** One entity (`person_rama`), three mentions ("Rama", "Rama", "The developer")

---

## Why We Map Mentions → Entities

### Problem Without Mapping

**Scenario:** Multiple texts mention the same person differently

```
Text 1: "Rama fixed the bug"
Text 2: "Rama is working on it"
Text 3: "The developer fixed it"  (refers to Rama)
```

**Without mapping:**
- Creates 3 separate nodes: `Rama`, `Rama`, `The developer`
- Duplicate data
- Can't connect all work to the same person
- Loses relationships

**With mapping:**
- All mentions → One entity: `(:Person {id: "person_rama", name: "Rama"})`
- Single source of truth
- All relationships connect to one node
- Complete picture

### Benefits of Mapping

**1. Deduplication**
- Multiple mentions → One entity
- Prevents duplicate nodes
- Single source of truth

**2. Linking**
- Connect all mentions to same entity
- Build complete relationship picture
- Track entity across documents

**3. Consistency**
- Canonical representation
- Standardized properties
- Reliable queries

---

## The Mapping Process

### Step 1: Extract Mentions (LLM)
```
Input Text: "Rama fixed Bug123 in LoginService"

LLM Extraction:
{
  "entities": [
    {"text": "Rama", "type": "Person"},
    {"text": "Bug123", "type": "Bug"},
    {"text": "LoginService", "type": "Service"}
  ],
  "relationships": [
    {"from": "Rama", "to": "Bug123", "type": "FIXED"},
    {"from": "Bug123", "to": "LoginService", "type": "IMPACTS"}
  ]
}
```

### Step 2: Link Mentions to Entities
```
Mention "Rama" → Entity lookup → (:Person {id: "person_rama"})
Mention "Bug123" → Entity lookup → (:Bug {id: "bug_123"})
Mention "LoginService" → Entity lookup → (:Service {id: "service_login"})
```

### Step 3: Create/Merge Entities
```cypher
// If entity doesn't exist, create it
MERGE (p:Person {id: "person_rama"})
SET p.name = "Rama"

// If entity exists, update it (or do nothing)
MERGE (b:Bug {id: "bug_123"})
SET b.title = "Authentication failure"
```

### Step 4: Create Relationships
```cypher
// Use entity IDs, not mentions
MATCH (p:Person {id: "person_rama"})
MATCH (b:Bug {id: "bug_123"})
MERGE (p)-[:FIXED]->(b)
```

---

## Entity Resolution Strategies

### Strategy 1: Exact Match
**Rule:** Mention text exactly matches entity name

```python
mention = "Rama"
entity = find_entity_by_name("Rama")  # Exact match
```

**Pros:** Simple, fast  
**Cons:** Misses variations ("The developer", "Rama K.")

### Strategy 2: Fuzzy Match
**Rule:** Mention text similar to entity name

```python
mention = "The developer"
entity = find_entity_by_fuzzy_match("The developer", candidates=["Rama", "Bob"])
# Might match "Rama" if context suggests it
```

**Pros:** Handles variations  
**Cons:** Can create false matches

### Strategy 3: Context-Based
**Rule:** Use surrounding text to disambiguate

```python
mention = "The developer"
context = "The developer fixed Bug123. Rama is the developer."
# Context suggests "The developer" = "Rama"
```

**Pros:** More accurate  
**Cons:** More complex

### Strategy 4: Unique Identifiers
**Rule:** Use IDs/codes for exact matching

```python
mention = "Bug123"
entity = find_entity_by_id("bug_123")  # Exact ID match
```

**Pros:** Most reliable  
**Cons:** Requires structured identifiers

---

## What You Need to Recognize

### In LLM Extraction
```json
{
  "entities": [
    {"text": "Rama", "type": "Person"}  // This is a MENTION
  ]
}
```

### In Graph Storage
```cypher
(:Person {id: "person_rama", name: "Rama"})  // This is an ENTITY
```

### In Processing Pipeline
```
Text → LLM extracts mentions → Map mentions to entities → Store entities in graph
```

### In Discussions
- "Entity" = Unique thing in graph
- "Mention" = Text occurrence
- "Entity resolution" = Mapping mentions to entities
- "Deduplication" = Multiple mentions → one entity

## Common Mistakes

❌ **Wrong:** Storing mentions directly as nodes  
✅ **Right:** Map mentions to entities first

❌ **Wrong:** Creating new entity for each mention  
✅ **Right:** Link mentions to existing entities

❌ **Wrong:** Not using unique identifiers  
✅ **Right:** Use IDs for reliable entity matching

❌ **Wrong:** Ignoring entity resolution  
✅ **Right:** Always resolve mentions to entities

## How to Discuss This Confidently

### With Non-Technical People
"When we extract information from text, we find mentions like 'Rama' or 'the developer'. But we need to link these to unique entities in our database - so 'Rama' and 'the developer' both point to the same person entity. This prevents duplicates and connects all related information."

### With Technical People
"We distinguish between mentions (text occurrences) and entities (canonical graph nodes). Our pipeline extracts mentions via LLM, resolves them to entities using fuzzy matching and context, then stores entities in Neo4j. This enables deduplication and proper relationship linking."

### With Architects
"Our entity resolution pipeline maps LLM-extracted mentions to canonical entities using a combination of exact matching (for IDs), fuzzy matching (for names), and context disambiguation. Entities are stored with unique identifiers, enabling reliable MERGE operations and preventing duplicates."

## Practical Recognition

**You'll see entities when:**
- Storing nodes in Neo4j
- Querying the graph
- Designing schemas

**You'll see mentions when:**
- LLM extraction output
- Processing text
- Entity resolution

**You'll know you understand when:**
- You can explain the difference between entity and mention
- You understand why mapping is necessary
- You can design an entity resolution strategy
- You can identify when duplicates occur

## Key Takeaways

1. **Entity** = Unique thing in graph (canonical, persistent)
2. **Mention** = Text occurrence (temporary, variable)
3. **Mapping is essential** = Prevents duplicates, enables linking
4. **Use unique IDs** = For reliable entity resolution

---

**Next:** [KG_03_Knowledge_Graph_vs_Other_Storages.md](KG_03_Knowledge_Graph_vs_Other_Storages.md) - When to use graphs


