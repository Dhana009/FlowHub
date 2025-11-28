# KG 06. Ingestion Pipeline Concepts

## Core Concept

**Ingestion pipelines convert data into graph format and store it in Neo4j. There are two main approaches: structured (direct mapping) and unstructured (LLM extraction).**

Understanding the flow is more important than implementation details.

## The Two Ingestion Approaches

### 1. Structured Ingestion

**Definition:** You already know the entities and relationships, so you directly write them to the graph using MERGE.

**When to Use:**
- Data is already structured
- Entities and relationships are known
- Direct mapping is possible
- Examples: APIs, databases, structured logs

**Process:**
```
Structured Data → Map to Graph → MERGE nodes/relationships → Neo4j
```

**Example:**
```python
# You have structured data
bug_data = {
    "id": "bug_123",
    "title": "Authentication failure",
    "reporter": "person_alice",
    "impacts": ["service_login"]
}

# Direct mapping to graph
cypher = """
MERGE (b:Bug {id: $bug_id})
SET b.title = $title

MERGE (p:Person {id: $reporter_id})
MERGE (p)-[:REPORTS]->(b)

MERGE (s:Service {id: $service_id})
MERGE (b)-[:IMPACTS]->(s)
"""
```

**Why It Matters:**
- Simple and direct
- No extraction needed
- Fast and reliable
- Use when possible

---

### 2. Unstructured Ingestion

**Definition:** Text doesn't have explicit structure, so you use an LLM to extract entities and relationships, then store them in the graph.

**When to Use:**
- Data is unstructured text
- Entities/relationships are implicit
- Need to extract from natural language
- Examples: Documentation, chat logs, emails, reports

**Process:**
```
Unstructured Text → LLM Extraction → Entities + Relationships → MERGE → Neo4j
```

**Example:**
```python
# You have unstructured text
text = "Rama fixed Bug123 in LoginService. The bug impacts authentication."

# LLM extracts structure
llm_response = {
    "entities": [
        {"text": "Rama", "type": "Person", "id": "person_rama"},
        {"text": "Bug123", "type": "Bug", "id": "bug_123"},
        {"text": "LoginService", "type": "Service", "id": "service_login"}
    ],
    "relationships": [
        {"from": "person_rama", "to": "bug_123", "type": "FIXED"},
        {"from": "bug_123", "to": "service_login", "type": "IMPACTS"}
    ]
}

# Map to graph
for entity in llm_response["entities"]:
    MERGE (n:{entity["type"]} {id: entity["id"]})
    SET n.name = entity["text"]

for rel in llm_response["relationships"]:
    MATCH (a {id: rel["from"]})
    MATCH (b {id: rel["to"]})
    MERGE (a)-[:{rel["type"]}]->(b)
```

**Why It Matters:**
- Enables graph extraction from text
- Handles natural language
- Automates structure discovery
- Essential for unstructured data

---

## JSON Structure for Extracted Graph Data

### Standard Format

**Structure:**
```json
{
  "entities": [
    {
      "text": "mention text",
      "type": "NodeType",
      "id": "unique_entity_id",
      "properties": {
        "name": "value",
        "other": "property"
      }
    }
  ],
  "relationships": [
    {
      "from": "entity_id_1",
      "to": "entity_id_2",
      "type": "RELATIONSHIP_TYPE",
      "properties": {
        "since": "2024-01-15",
        "confidence": 0.9
      }
    }
  ]
}
```

### Complete Example

**Input Text:**
```
"Rama fixed Bug123 in LoginService on 2024-01-15. The bug has high severity and impacts authentication."
```

**LLM Extraction (JSON):**
```json
{
  "entities": [
    {
      "text": "Rama",
      "type": "Person",
      "id": "person_rama",
      "properties": {
        "name": "Rama"
      }
    },
    {
      "text": "Bug123",
      "type": "Bug",
      "id": "bug_123",
      "properties": {
        "title": "Bug123",
        "severity": "High"
      }
    },
    {
      "text": "LoginService",
      "type": "Service",
      "id": "service_login",
      "properties": {
        "name": "LoginService"
      }
    }
  ],
  "relationships": [
    {
      "from": "person_rama",
      "to": "bug_123",
      "type": "FIXED",
      "properties": {
        "date": "2024-01-15"
      }
    },
    {
      "from": "bug_123",
      "to": "service_login",
      "type": "IMPACTS",
      "properties": {
        "severity": "High",
        "area": "authentication"
      }
    }
  ]
}
```

---

## The Complete Ingestion Flow

### Flow Diagram
```
┌─────────────────────────────────────────────────┐
│           INGESTION PIPELINE                     │
└─────────────────────────────────────────────────┘

Input Data
    ↓
    ├─ Structured? → Direct Mapping → MERGE → Neo4j
    │
    └─ Unstructured? → LLM Extraction → JSON → Entity Resolution → MERGE → Neo4j
```

### Step-by-Step (Unstructured)

**Step 1: Extract with LLM**
```
Text → LLM → JSON with entities and relationships
```

**Step 2: Entity Resolution**
```
Mentions in JSON → Map to entities → Resolve duplicates
```

**Step 3: Create Nodes**
```cypher
FOR each entity in JSON:
    MERGE (n:EntityType {id: entity.id})
    SET n.property = value
```

**Step 4: Create Relationships**
```cypher
FOR each relationship in JSON:
    MATCH (a {id: relationship.from})
    MATCH (b {id: relationship.to})
    MERGE (a)-[:RelationshipType]->(b)
```

---

## What You Need to Recognize

### In Architecture
- **Structured ingestion** = Direct mapping, known structure
- **Unstructured ingestion** = LLM extraction, unknown structure
- **JSON format** = Standard extraction output
- **Entity resolution** = Map mentions to entities

### In Code
```python
# Structured
cypher = "MERGE (n:Type {id: $id}) SET n.property = $value"

# Unstructured
llm_output = extract_entities(text)  # Returns JSON
# Then process JSON to Cypher
```

### In Discussions
- "Structured ingestion" = Direct mapping
- "Unstructured ingestion" = LLM extraction
- "Extraction JSON" = Standard format
- "Entity resolution" = Mention to entity mapping

## Common Patterns

### Pattern 1: Structured API Data
```python
# API returns structured data
api_data = get_bug_data(bug_id)

# Direct mapping
MERGE (b:Bug {id: api_data["id"]})
SET b.title = api_data["title"]
```

### Pattern 2: Unstructured Documentation
```python
# Documentation text
doc_text = read_documentation()

# LLM extraction
extracted = llm.extract_entities(doc_text)  # Returns JSON

# Process JSON
process_extraction(extracted)  # Creates MERGE statements
```

### Pattern 3: Hybrid Approach
```python
# Some structured, some unstructured
structured_data = get_structured_data()
unstructured_text = get_unstructured_text()

# Process both
ingest_structured(structured_data)
ingest_unstructured(unstructured_text)
```

## Common Mistakes

❌ **Wrong:** Using LLM for structured data  
✅ **Right:** Use direct mapping for structured data

❌ **Wrong:** Not resolving entities (creates duplicates)  
✅ **Right:** Always map mentions to entities

❌ **Wrong:** Inconsistent JSON format  
✅ **Right:** Use standard entities/relationships format

❌ **Wrong:** Not handling extraction errors  
✅ **Right:** Validate LLM extraction before storing

## How to Discuss This Confidently

### With Non-Technical People
"We have two ways to add data to the graph: if the data is already structured (like from a database), we map it directly. If it's unstructured text (like documentation), we use AI to extract the entities and relationships, then store them."

### With Technical People
"Our ingestion pipeline supports two approaches: structured ingestion (direct mapping of known entities/relationships to MERGE operations) and unstructured ingestion (LLM extraction to JSON format, then entity resolution and MERGE). We use a standard JSON format with entities and relationships arrays."

### With Architects
"Our ingestion architecture supports structured ingestion (direct Cypher MERGE from known data structures) and unstructured ingestion (LLM extraction to standardized JSON, entity resolution for mention-to-entity mapping, then MERGE operations). We validate extraction output and handle errors before graph operations."

## Practical Recognition

**You'll see structured ingestion when:**
- Mapping API data
- Importing from databases
- Processing structured logs
- Direct data transformation

**You'll see unstructured ingestion when:**
- Processing documentation
- Extracting from chat logs
- Analyzing natural language
- LLM-based extraction

**You'll know you understand when:**
- You can choose the right approach
- You understand the JSON format
- You can design an ingestion pipeline
- You understand entity resolution

## Key Takeaways

1. **Structured ingestion** = Direct mapping (when structure is known)
2. **Unstructured ingestion** = LLM extraction (when structure is unknown)
3. **JSON format** = Standard extraction output (entities + relationships)
4. **Entity resolution** = Map mentions to entities (prevents duplicates)

---

**Next:** [KG_07_Temporal_Relationships.md](KG_07_Temporal_Relationships.md) - Time-aware memory


