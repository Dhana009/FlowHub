# Universal Knowledge Graph Schema - Reviewed Document
**Review Date:** January 27, 2025  
**Reviewer:** Senior Knowledge Graph Architect  
**Status:** Reviewed with corrections and recommendations
**Technology Stack:** Neo4j (Graph Database), GPT-5-nano (LLM for Extraction)

---

## 📋 REVIEW SUMMARY

### Issues Found:
1. **Typo:** Line 296 - "KFs retrieve" should be "KGs retrieve"
2. **Schema Inconsistency:** OCCURRED_AT mentioned in Step 2 but missing from final schema
3. **Terminology Inconsistency:** "confidence" vs "confidence_score" in relationship properties
4. **Missing Clarity:** When to use Event vs Entity nodes (no clear decision criteria)
5. **Missing Information:** No discussion of entity disambiguation strategy
6. **Missing Information:** No conflict resolution rules for conflicting data from different sources
7. **Missing Information:** No validation rules for entity_type values
8. **Missing Information:** Relationship directionality requirements not explicitly stated

### Duplicates Identified:
1. **Schema Definition:** Repeated 4 times (lines 77-85, 544-565, 1589-1615, 1889-1925)
2. **Purpose Explanation:** Repeated 2 times (lines 287-307, 1269-1283)
3. **Update Strategies:** Explained in detail but also referenced in foundations section
4. **Confidence Building:** Multiple sections covering same psychological concerns (lines 398-500, 1014-1227)
5. **Ingestion Pipeline:** Explained in multiple places with slight variations

### Structural Issues:
1. **No Clear Document Structure:** Jumps between topics without clear navigation
2. **Conversational Prompts:** Multiple "if you want" statements scattered throughout
3. **No Table of Contents:** Difficult to navigate 1981 lines
4. **Mixed Styles:** Some sections are reference material, others are conversational

### Missing Critical Information:
1. ~~Graph database technology choice (Neo4j, etc.) - only mentioned in examples~~ ✅ **RESOLVED: Neo4j selected**
2. Indexing strategy details beyond basic mention
3. Query performance optimization techniques
4. Batch vs real-time ingestion patterns
5. Data quality validation framework
6. Entity disambiguation strategy
7. Source attribution and provenance tracking details
8. ~~LLM choice for extraction~~ ✅ **RESOLVED: GPT-5-nano selected**

---

## ✅ CORRECTED AND CONSOLIDATED DOCUMENT

# Universal Knowledge Graph Schema Design
**Version:** 2.0 (Reviewed)  
**Last Updated:** January 27, 2025  
**Purpose:** Complete reference for building universal knowledge graphs

---

## TABLE OF CONTENTS

1. [Core Concepts](#1-core-concepts)
2. [Universal Schema Design](#2-universal-schema-design)
3. [Update and Delete Strategies](#3-update-and-delete-strategies)
4. [Ingestion Pipeline](#4-ingestion-pipeline)
5. [Query Patterns](#5-query-patterns)
6. [Purpose and Use Cases](#6-purpose-and-use-cases)
7. [Foundation Checklist](#7-foundation-checklist)

---

## 1. CORE CONCEPTS

### 1.1 What is Schema Design?

Schema design is the blueprint of your knowledge graph. It defines:

* **Node Labels:** Categories of nodes (Entity, Event, Document)
* **Node Properties:** Required and optional attributes
* **Relationship Types:** How nodes connect
* **Relationship Properties:** Additional metadata on connections
* **ID Strategy:** How uniqueness is maintained
* **Constraints:** Rules that ensure data quality

**Why it matters:**
- Without proper schema: LLM extraction becomes messy, relationships inconsistent, queries slow
- With proper schema: Clean, scalable, maintainable knowledge graph

### 1.2 Universal vs Domain-Specific Schema

**Domain-Specific Schema:**
- Many labels: Bug, Service, Microservice, API, TestCase
- Many relationship types: IMPACTS, CALLS, TESTS
- Works for one domain only
- Requires schema changes for new domains

**Universal Schema (Recommended):**
- Few labels: Entity, Event, Document
- Generic relationship types: RELATED_TO, PART_OF, DEPENDS
- Domain meaning stored in `entity_type` property
- Works for ANY domain
- Schema never changes, only data grows

**Decision Rule:** Use universal schema when you need cross-domain flexibility and long-term stability.

---

## 2. UNIVERSAL SCHEMA DESIGN

### 2.1 Node Labels (Fixed Forever)

**Three labels only:**

1. **Entity** - Represents any real-world thing (Person, Service, Bug, API, etc.)
2. **Event** - Represents something that happened (changes, updates, actions, state transitions)
3. **Document** - Represents source text where entities were extracted

**Decision Criteria:**
- Use **Entity** for: Things that exist (Person, Service, Bug, File, Function)
- Use **Event** for: Things that happen (BugFixed, ServiceDeployed, StatusChanged)
- Use **Document** for: Source material (PRD, Wiki, Code, Logs)

**Never create domain-specific labels.** All domain meaning goes into `entity_type` property.

### 2.2 Node Properties (Universal Template)

**Required Properties (Every Node):**

```
id                (unique identifier - UUID or domain ID)
name              (human-readable name)
entity_type       (domain category - e.g., "Microservice", "Bug", "Person")
description       (optional short text)
source            (where it came from: LLM, file, URL, manual)
created_at        (timestamp - ISO 8601 format)
updated_at        (timestamp - ISO 8601 format)
```

**Optional Properties (Domain-Specific):**

```
version           (for versioned entities)
severity          (for bugs, issues)
status            (for stateful entities)
owner             (for ownership)
tags              (array of strings)
metadata          (JSON object for flexible data)
```

**Property Rules:**
- `id` must be unique across entire graph
- `entity_type` must be a string (no validation list - allows flexibility)
- `source` tracks provenance (critical for trust)
- Timestamps use ISO 8601 format

### 2.3 Relationship Types (Universal, Fixed Set)

**Eight relationship types:**

1. **RELATED_TO** - Generic connection (use when no other type fits)
2. **PART_OF** - Hierarchical relationship (Component → System)
3. **DEPENDS** - Dependency relationship (ServiceA → ServiceB)
4. **CAUSES** - Causal relationship (Bug → Failure)
5. **MENTIONED_IN** - Entity mentioned in Document
6. **TEMPORAL_BEFORE** - Temporal ordering (Event1 → Event2)
7. **TEMPORAL_AFTER** - Temporal ordering (Event2 → Event1)
8. **HAS_ATTRIBUTE** - Attribute relationship (Entity → Property)

**Directionality Rules:**
- All relationships are **directed** (A → B is different from B → A)
- Direction must match semantic meaning
- Example: `(ServiceA)-[:DEPENDS]->(ServiceB)` means ServiceA depends on ServiceB

**When to Use Each:**
- **RELATED_TO:** Generic connection, unclear relationship type
- **PART_OF:** Hierarchical (Component → System, Module → Application)
- **DEPENDS:** Dependencies (Service → Database, Feature → API)
- **CAUSES:** Cause-effect (Bug → Failure, Change → Impact)
- **MENTIONED_IN:** Entity appears in Document (always: Document ← Entity)
- **TEMPORAL_BEFORE/AFTER:** Time ordering (Event1 → Event2)
- **HAS_ATTRIBUTE:** Entity has property (Entity → AttributeValue)

### 2.4 Relationship Properties

**Standard Properties:**

```
relation_subtype  (domain-specific meaning: "CALLS", "IMPACTS", "OWNS", "FIXES")
source            (where relationship came from: LLM, rule, manual)
timestamp         (when relationship was created/updated)
confidence_score  (0.0 to 1.0 - LLM extraction confidence)
```

**Usage:**
- `relation_subtype` stores domain meaning without creating new relationship types
- Example: `(ServiceA)-[:DEPENDS {relation_subtype: "CALLS"}]->(ServiceB)`
- `confidence_score` helps filter low-quality extractions

### 2.5 ID Strategy

**ID Requirements:**
- Must be unique across entire graph
- Must be stable (don't change)
- Must be queryable

**ID Options:**

1. **UUID** (Recommended for new entities)
   - Pros: Globally unique, no collisions
   - Cons: Not human-readable

2. **Domain ID** (For existing systems)
   - Example: `bug_123`, `service_payment`, `user_alice`
   - Pros: Human-readable, meaningful
   - Cons: Must ensure uniqueness

3. **Composite ID** (UUID + Domain ID)
   - Store both: `id: "uuid-here"`, `domain_id: "bug_123"`
   - Pros: Best of both worlds
   - Cons: Slightly more complex

**Deduplication Strategy:**
- Check `id` first (exact match)
- If no `id` match, check `name` + `entity_type` (fuzzy match)
- Use embeddings for semantic similarity (advanced)

---

## 3. UPDATE AND DELETE STRATEGIES

### 3.1 Update Strategies

**Strategy 1: Overwrite (Simple Update)**

Update node properties directly. Old values are lost.

**When to use:**
- History doesn't matter
- Only latest truth needed
- Small/simple graphs

**Example:**
```
Bug123: status "Open" → "Closed" (old value gone)
```

**Strategy 2: Versioning (Recommended)**

Keep old data, create new version node, connect with TEMPORAL_BEFORE.

**When to use:**
- History matters
- Need to track evolution
- Debugging/audit important
- Growing graphs

**Example:**
```
Bug123_v1 --[:TEMPORAL_BEFORE]-> Bug123_v2
```

**Strategy 3: Soft Delete**

Mark as deleted, don't remove node.

**When to use:**
- Deleting would break graph structure
- Want to preserve relationships
- Need to avoid accidental removal

**Example:**
```
Bug123: is_deleted = true
```

**Query Filter:**
```
WHERE is_deleted = false
```

### 3.2 Delete Strategies

**Safe Deletion Methods:**

1. **Soft Delete (Recommended)**
   - Set `is_deleted: true`
   - Preserves graph structure
   - Can be undone

2. **Archive**
   - Move to archived state
   - Set `entity_type: "archived_<type>"`
   - Or use separate label (if your system supports it)

3. **Hard Delete (Use with Caution)**
   - Remove node and all edges
   - **Only if:** No other entities depend on it
   - **Check first:** Query for dependent nodes

**Rule:** Never delete knowledge. Only hide it or version it, unless 100% sure it's safe to remove.

### 3.3 Conflict Resolution

**When Same Entity from Different Sources:**

1. **Merge Strategy:**
   - Keep highest confidence source
   - Combine properties (union)
   - Update `source` to list all sources

2. **Version Strategy:**
   - Create version nodes
   - Link with TEMPORAL_BEFORE
   - Track which source created which version

3. **Timestamp Strategy:**
   - Keep most recent
   - Preserve old in `previous_values` property

**Decision Rule:** Choose one strategy and apply consistently.

---

## 4. INGESTION PIPELINE

### 4.1 Pipeline Overview

**Ingestion Pipeline = Process that converts raw text → structured knowledge → graph**

**Flow:**
```
Raw Text → Chunking → LLM Extraction → Normalization → Deduplication → Merge/Version → Graph Insert → Indexing
```

### 4.2 Pipeline Steps

**Step 1: Chunking**
- Break large documents into meaningful pieces
- Preserve context (use overlap)
- Typical size: 300-1000 tokens

**Step 2: LLM Extraction (GPT-5-nano)**
- Send chunks to GPT-5-nano with schema prompt
- Extract: entities, entity_types, properties, relationships, mentions
- Return structured JSON
- **GPT-5-nano Configuration:**
  - Use function calling or structured output mode
  - Set temperature low (0.1-0.3) for consistent extraction
  - Include schema validation in prompt
  - Handle rate limits and retries

**Step 3: Normalization**
- Ensure IDs are unique
- Validate entity_type format
- Ensure relationships match schema
- Standardize timestamps

**Step 4: Deduplication**
- Check if entity exists (by ID or name+entity_type)
- Use embeddings for semantic similarity (optional)
- Identify duplicates

**Step 5: Merge or Version**
- If entity exists → update or version (based on strategy)
- If new → create
- If marked deleted → soft-delete

**Step 6: Graph Insert**
- Create Entity/Event/Document nodes
- Create relationships (RELATED_TO, PART_OF, DEPENDS, etc.)
- Set properties

**Step 7: Indexing**
- Index on `id` (primary)
- Index on `entity_type` (for filtering)
- Index on `name` (for search)
- Re-index after updates

### 4.3 LLM Extraction Schema

**Entity Extraction Output:**
```json
{
  "name": "PaymentService",
  "entity_type": "Microservice",
  "properties": {
    "version": "2.1",
    "owner": "Team A",
    "status": "Active"
  }
}
```

**Relationship Extraction Output:**
```json
{
  "source": "PaymentService",
  "target": "Database",
  "relationship_type": "DEPENDS",
  "relation_subtype": "CALLS",
  "properties": {
    "timestamp": "2024-01-01T10:00:00Z",
    "confidence_score": 0.95
  }
}
```

**Mention Extraction Output:**
```json
{
  "entity": "PaymentService",
  "document_id": "doc123",
  "offset": 245,
  "context": "PaymentService handles transactions"
}
```

### 4.4 GPT-5-nano Extraction Prompt Template

**⚠️ IMPORTANT: Token Cost Optimization**

Since APIs are stateless, sending the full prompt every time increases token costs. GPT-5-nano supports **prompt caching** and **function calling** to dramatically reduce costs.

**Cost Comparison:**
- Without caching: 700 tokens × 1000 calls = 700,000 tokens
- With caching: 700 tokens × 1 call + 0 tokens × 999 calls = 700 tokens
- **Savings: 99.9% reduction in system prompt tokens**

---

#### **4.4.1 OPTIMIZED APPROACH: Prompt Caching + Function Calling (Production)**

**This is the recommended approach for production use.**

**Step 1: Cache System Prompt + Function Schema (Do This Once)**

```python
import openai

# System Prompt (cached once)
SYSTEM_PROMPT = """
You are a Knowledge Graph Extraction Engine.

Your job is to analyze text and extract structured information following this schema:

1. Entities:
   - Real-world objects found in the text
   - Include: id, name, entity_type, properties

2. Relationships:
   - How two entities are connected
   - Use universal types: RELATED_TO, PART_OF, DEPENDS, CAUSES, MENTIONED_IN
   - Domain meaning in relation_subtype

3. Mentions:
   - Location in document where entity appears
   - Include: entity_id, document_id, start_offset, end_offset

Your output must strictly follow the function schema called "extract_kg".
"""

# Function Schema (cached once)
FUNCTION_SCHEMA = {
    "type": "function",
    "function": {
        "name": "extract_kg",
        "description": "Extract entities, relationships, and mentions from text.",
        "parameters": {
            "type": "object",
            "properties": {
                "entities": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "name": {"type": "string"},
                            "entity_type": {"type": "string"},
                            "properties": {"type": "object"}
                        },
                        "required": ["id", "name", "entity_type"]
                    }
                },
                "relationships": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "source_id": {"type": "string"},
                            "target_id": {"type": "string"},
                            "relationship_type": {
                                "type": "string",
                                "enum": ["RELATED_TO", "PART_OF", "DEPENDS", "CAUSES", 
                                        "MENTIONED_IN", "TEMPORAL_BEFORE", "TEMPORAL_AFTER", "HAS_ATTRIBUTE"]
                            },
                            "relation_subtype": {"type": "string"},
                            "properties": {"type": "object"}
                        },
                        "required": ["source_id", "target_id", "relationship_type"]
                    }
                },
                "mentions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "entity_id": {"type": "string"},
                            "document_id": {"type": "string"},
                            "start_offset": {"type": "integer"},
                            "end_offset": {"type": "integer"}
                        },
                        "required": ["entity_id", "document_id"]
                    }
                }
            },
            "required": ["entities", "relationships", "mentions"]
        }
    }
}

# Cache the prompt and schema (do this once)
def cache_extraction_schema():
    response = openai.responses.create(
        model="gpt-5-nano",
        input=SYSTEM_PROMPT,
        tools=[FUNCTION_SCHEMA],
        cache_control={"type": "ephemeral"}
    )
    return response.cache_id  # Store this for reuse

# Initialize (run once)
CACHE_ID = cache_extraction_schema()
```

**Step 2: Extract from Text (Use Cache ID Every Time)**

```python
def extract_with_cached_schema(text_chunk, cache_id):
    """Extract knowledge using cached schema - only pay for text tokens"""
    response = openai.chat.completions.create(
        model="gpt-5-nano",
        messages=[
            {"role": "system", "content": [{"cache_id": cache_id}]},
            {"role": "user", "content": text_chunk}
        ],
        tools=[FUNCTION_SCHEMA],
        tool_choice={"type": "function", "function": {"name": "extract_kg"}},
        temperature=0.2
    )
    
    # Extract function call result
    function_call = response.choices[0].message.tool_calls[0]
    return json.loads(function_call.function.arguments)
```

**Benefits:**
- ✅ System prompt cached (not charged after first call)
- ✅ Function schema cached (not charged after first call)
- ✅ Only pay for text chunk tokens + output tokens
- ✅ ~90% cost reduction for 100+ extractions
- ✅ Schema enforced automatically (no validation needed)

---

#### **4.4.2 FULL PROMPT (Reference - Not Recommended for Production)**

**Complete Prompt for GPT-5-nano (Use only if caching not available):**

```
You are a knowledge extraction system. Extract entities, relationships, and mentions from the provided text.

SCHEMA RULES:

1. NODE LABELS (Use ONLY these 3 labels):
   - Entity: For things that exist (Person, Service, Bug, API, Test, File, Feature, etc.)
   - Event: For things that happen (BugFixed, ServiceDeployed, StatusChanged, etc.)
   - Document: For source text (PRD, Wiki, Code file, Log, etc.)

2. ENTITY TYPES (Assign based on context):
   Common types: Person, Service, Microservice, Bug, API, Test, File, Feature, Requirement, Team, etc.
   - If it's a person → "Person"
   - If it's a service/system → "Service" or "Microservice"
   - If it's a bug/issue → "Bug"
   - If it's an API → "API"
   - If it's a test → "Test"
   - If it's a file → "File"
   - If it's a feature → "Feature"
   - Use your judgment for other types

3. RELATIONSHIP TYPES (Use ONLY these 8 types):
   - RELATED_TO: Generic connection when relationship type is unclear
   - PART_OF: Hierarchical relationship (Component → System, Module → Application)
   - DEPENDS: Dependency relationship (ServiceA → ServiceB, Feature → API)
   - CAUSES: Cause-effect relationship (Bug → Failure, Change → Impact)
   - MENTIONED_IN: Entity appears in Document (always: Document ← Entity)
   - TEMPORAL_BEFORE: Time ordering (Event1 happens before Event2)
   - TEMPORAL_AFTER: Time ordering (Event2 happens after Event1)
   - HAS_ATTRIBUTE: Entity has property/attribute

   RELATIONSHIP TYPE DECISION RULES:
   - Use DEPENDS when: A needs B to work (Service → Database)
   - Use PART_OF when: A is a component of B (Module → System)
   - Use CAUSES when: A causes B to happen (Bug → Failure)
   - Use RELATED_TO when: Generic connection, unclear specific type
   - Use MENTIONED_IN when: Entity appears in Document
   - Use TEMPORAL_BEFORE/AFTER when: Time ordering matters
   - Use HAS_ATTRIBUTE when: Entity has a property value

4. RELATIONSHIP SUBTYPES (Optional, store in relation_subtype property):
   - For domain-specific meaning: "CALLS", "IMPACTS", "OWNS", "FIXES", "TESTS", etc.
   - Example: (ServiceA)-[:DEPENDS {relation_subtype: "CALLS"}]->(ServiceB)

OUTPUT FORMAT (Return valid JSON only):

{
  "entities": [
    {
      "name": "string (required)",
      "entity_type": "string (required)",
      "properties": {
        "description": "string (optional)",
        "status": "string (optional)",
        "version": "string (optional)",
        "owner": "string (optional)",
        "severity": "string (optional)",
        "tags": ["string"] (optional),
        "metadata": {} (optional)
      }
    }
  ],
  "relationships": [
    {
      "source": "entity_name (must match entity name from entities array)",
      "target": "entity_name (must match entity name from entities array)",
      "relationship_type": "RELATED_TO|PART_OF|DEPENDS|CAUSES|MENTIONED_IN|TEMPORAL_BEFORE|TEMPORAL_AFTER|HAS_ATTRIBUTE (required)",
      "relation_subtype": "string (optional, e.g., CALLS, IMPACTS, OWNS, FIXES)",
      "properties": {
        "description": "string (optional)",
        "timestamp": "ISO 8601 format (optional)",
        "confidence_score": "number 0.0-1.0 (optional)"
      }
    }
  ],
  "mentions": [
    {
      "entity": "entity_name (must match entity name from entities array)",
      "document_id": "string (required if document context exists)",
      "offset": "number (character position in text, optional)",
      "context": "string (surrounding text, optional)"
    }
  ]
}

EXTRACTION RULES:
1. Extract ALL entities mentioned in the text
2. Extract ALL relationships between entities
3. Assign appropriate entity_type based on context
4. Use relationship_type from the 8 allowed types only
5. If relationship meaning is unclear, use RELATED_TO
6. Store domain-specific relationship meaning in relation_subtype
7. Include all relevant properties for entities
8. Extract mentions if entities appear in documents

TEXT TO EXTRACT FROM:
{text_chunk}

Return ONLY valid JSON matching the output format above. Do not include any explanation or markdown formatting.
```

**Python Usage Example (Without Caching - Not Recommended):**

```python
def create_extraction_prompt(text_chunk):
    prompt_template = """
    You are a knowledge extraction system. Extract entities, relationships, and mentions from the provided text.
    
    [Full prompt as above]
    
    TEXT TO EXTRACT FROM:
    {text_chunk}
    """
    
    return prompt_template.format(text_chunk=text_chunk)

def extract_with_gpt5nano(text_chunk):
    prompt = create_extraction_prompt(text_chunk)
    
    response = openai.ChatCompletion.create(
        model="gpt-5-nano",
        messages=[
            {"role": "system", "content": "You are a knowledge extraction system. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)
```

**⚠️ Note:** This approach charges for system prompt tokens on every call. Use cached approach (4.4.1) for production.

---

#### **4.4.3 Token Cost Analysis**

**Assumptions:**
- System prompt: 300 tokens
- Function schema: 400 tokens
- Text chunk: 500 tokens (average)
- Output: 200 tokens (average)

**Without Caching (1000 extractions):**
- System prompt: 300 × 1000 = 300,000 tokens
- Function schema: 400 × 1000 = 400,000 tokens
- Text chunks: 500 × 1000 = 500,000 tokens
- Output: 200 × 1000 = 200,000 tokens
- **Total: 1,400,000 tokens**

**With Caching (1000 extractions):**
- System prompt: 300 × 1 = 300 tokens (cached)
- Function schema: 400 × 1 = 400 tokens (cached)
- Text chunks: 500 × 1000 = 500,000 tokens
- Output: 200 × 1000 = 200,000 tokens
- **Total: 700,700 tokens**

**Savings: 699,300 tokens (50% reduction)**

**For 10,000 extractions:**
- Without caching: 14,000,000 tokens
- With caching: 7,007,000 tokens
- **Savings: 6,993,000 tokens (50% reduction)**

---

#### **4.4.4 Complete Production Pipeline**

```python
import openai
import json
from neo4j import GraphDatabase

class KGExtractionPipeline:
    def __init__(self, neo4j_uri, neo4j_auth, openai_api_key):
        # Neo4j connection
        self.driver = GraphDatabase.driver(neo4j_uri, auth=neo4j_auth)
        
        # OpenAI setup
        openai.api_key = openai_api_key
        
        # Cache schema (do once)
        self.cache_id = self._cache_schema()
    
    def _cache_schema(self):
        """Cache system prompt and function schema - run once"""
        response = openai.responses.create(
            model="gpt-5-nano",
            input=SYSTEM_PROMPT,  # From 4.4.1
            tools=[FUNCTION_SCHEMA],  # From 4.4.1
            cache_control={"type": "ephemeral"}
        )
        return response.cache_id
    
    def extract(self, text_chunk):
        """Extract using cached schema"""
        response = openai.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": [{"cache_id": self.cache_id}]},
                {"role": "user", "content": text_chunk}
            ],
            tools=[FUNCTION_SCHEMA],
            tool_choice={"type": "function", "function": {"name": "extract_kg"}},
            temperature=0.2
        )
        
        function_call = response.choices[0].message.tool_calls[0]
        return json.loads(function_call.function.arguments)
    
    def ingest(self, text_chunk, document_id):
        """Complete ingestion: extract → normalize → insert"""
        # Extract
        result = self.extract(text_chunk)
        
        # Normalize (deduplicate, validate)
        entities = self._normalize_entities(result["entities"])
        relationships = self._normalize_relationships(result["relationships"], entities)
        
        # Insert into Neo4j
        self._insert_to_neo4j(entities, relationships, document_id)
    
    def _normalize_entities(self, entities):
        """Deduplicate and validate entities"""
        # Check for existing entities by ID or name+entity_type
        # Return normalized list
        pass
    
    def _normalize_relationships(self, relationships, entities):
        """Validate relationships reference existing entities"""
        # Map source/target names to IDs
        # Return normalized relationships
        pass
    
    def _insert_to_neo4j(self, entities, relationships, document_id):
        """Insert into Neo4j using Cypher"""
        with self.driver.session() as session:
            # Create entities
            for entity in entities:
                session.run("""
                    MERGE (e:Entity {id: $id})
                    SET e.name = $name,
                        e.entity_type = $entity_type,
                        e.properties = $properties,
                        e.updated_at = datetime()
                """, entity)
            
            # Create relationships
            for rel in relationships:
                session.run("""
                    MATCH (a:Entity {id: $source_id}), (b:Entity {id: $target_id})
                    MERGE (a)-[r:RELATED_TO]->(b)
                    SET r.relationship_type = $rel_type,
                        r.relation_subtype = $subtype,
                        r.properties = $properties
                """, rel)
```

**Important Notes:**
- ✅ Use cached approach (4.4.1) for production
- ✅ System prompt and function schema cached once
- ✅ Only pay for text + output tokens per extraction
- ✅ Function calling enforces schema automatically
- ✅ ~50% cost reduction for large-scale extraction

### 4.5 Graph Skeleton

**Graph Skeleton = Initial empty structure ready to accept data**

**Contains:**
- Node labels (Entity, Event, Document)
- Relationship types (8 universal types)
- Required node properties
- Uniqueness constraints (id must be unique)
- Indexes (on id, entity_type, name)

**Setup:**
- Create labels
- Define relationship types
- Set constraints
- Create indexes
- Graph is ready for data

---

## 5. QUERY PATTERNS

### 5.1 Four Universal Query Patterns

**Pattern 1: Neighbors**
"What connects to this entity?"

**Use Cases:**
- Find all dependencies
- Find all related entities
- Explore connections

**Pattern 2: Paths**
"How are these two entities connected?"

**Use Cases:**
- Dependency chains
- Impact analysis
- Relationship discovery

**Pattern 3: Filters**
"Show all entities of type X with property Y"

**Use Cases:**
- Find all bugs with severity "High"
- Find all services with status "Active"
- Domain-specific queries

**Pattern 4: Temporal**
"How did this entity change over time?"

**Use Cases:**
- Version history
- Change tracking
- Evolution analysis

### 5.2 Query Optimization

**Indexing Strategy:**
- Index on `id` (primary key)
- Index on `entity_type` (filtering)
- Index on `name` (search)
- Index on `created_at`, `updated_at` (temporal queries)

**Performance Tips:**
- Use LIMIT clauses
- Filter early (WHERE clauses)
- Use specific relationship types
- Avoid deep traversals (>5 hops)

---

## 6. PURPOSE AND USE CASES

### 6.1 Main Purpose

**Knowledge Graph Purpose:**
"To store knowledge in a structured, connected way so AI can retrieve, reason, and understand information accurately."

**What Each Component Provides:**
- **Vector DB:** Semantic similarity
- **LLM:** Language understanding
- **Knowledge Graph:** Structured meaning + relationships + connections

### 6.2 Why KG When We Have Vectors + LLMs?

**Vector DBs answer:** "Give me things similar to this"
**LLMs answer:** "Explain or generate language"

**Both fail on:**
- Dependencies
- Cause-effect
- Hierarchies
- Ownership
- Version history
- Impact chains

**KG fixes this by storing:** The truth of how things are connected

### 6.3 Key Capabilities

1. **Exact Structural Relationships**
   - KG guarantees: OrderService → depends_on → PaymentService
   - LLM may guess; KG stores facts

2. **Impact Analysis**
   - If PaymentService breaks → compute all affected components
   - Follow graph edges to find dependencies

3. **Traceability/Explainability**
   - Show why something is connected
   - Show path to result
   - Show what changed
   - Show source of information

4. **Version/Temporal History**
   - Track what changed
   - Track old vs new versions
   - Essential for engineering

5. **Zero-Hallucination Retrieval**
   - Force hard facts into retrieval
   - Ground LLM responses in actual data

6. **Cross-Domain Unification**
   - Store services, bugs, APIs, documents, people, requirements
   - Connect them all in same graph
   - Impossible in vector DB alone

### 6.4 Practical Use Cases

**Use Case 1: Impact Analysis**
- If microservice/API changes/fails
- Find dependent services, affected features, test cases, owning teams

**Use Case 2: Dependency Mapping**
- Understand which systems call which
- Map upstream/downstream flows
- Build architecture understanding

**Use Case 3: QA Coverage Reasoning**
- Connect: Feature → TestCases → Bugs → Services → APIs
- Answer: "Which features have poor test coverage?"
- Answer: "Which bugs affect critical flows?"

**Use Case 4: Change Management**
- Track: who changed what, old version, new version, impacted things
- Impossible with embeddings alone

**Use Case 5: Documentation Understanding**
- Documents → Entities → Relationships → Impacts
- Structured map of entire product

**Use Case 6: Avoiding Hallucination**
- LLM must pull from KG (hard facts)
- Not from imagination

**Use Case 7: Explainability**
- AI can show graph path to answer
- Enterprise-grade explainability

---

## 7. FOUNDATION CHECKLIST

### 7.1 Required Components Before Building

**Five Foundational Pieces:**

1. **Conceptual Understanding** ✅
   - Node, label, entity, entity_type
   - Relationship, relationship_type
   - Property, ID, mention

2. **Universal Schema** ✅
   - Labels: Entity, Event, Document
   - Node properties: id, name, entity_type, description, source, timestamps
   - Relationship types: 8 universal types
   - ID strategy: UUID or domain ID

3. **Update & Delete Rules** ✅
   - Overwrite, versioning, soft-delete strategies
   - Conflict resolution approach
   - Temporal tracking

4. **Ingestion Strategy** ✅
   - LLM extraction schema
   - Normalization rules
   - Deduplication approach
   - Merge/version logic

5. **Read Strategy** ✅
   - Four query patterns: neighbors, paths, filters, temporal
   - Indexing strategy
   - Performance optimization

### 7.2 Status: READY TO BUILD

**You have:**
- ✅ Conceptual vocabulary
- ✅ Universal schema (permanent design)
- ✅ Ingestion rules
- ✅ Update/delete rules
- ✅ Read/query patterns
- ✅ Purpose and use-cases
- ✅ Mental model of KG + vectors

**Next Step:**
Build the ingestion pipeline + graph skeleton code.

---

## 8. ARCHITECTURAL PRINCIPLES

### 8.1 Schema Stability

**Principle:** Design simplest possible universal schema. Fix it permanently. Never change it. Evolve everything else around it.

**Why:**
- Schema changes break existing data
- Universal schema handles all domains
- Only data grows, not structure

### 8.2 Data vs Schema Evolution

**Knowledge data changes** ✅
**Knowledge schema does NOT change** ❌

**If schema is universal and minimal:**
- Never need new labels
- Never need new relationship types
- Never need schema redesign
- Never break queries

**Problems don't break schema** - they only add more data inside same structure.

### 8.3 Three Stable Pillars

**Pillar 1: Universal Schema**
- Simple, minimal, permanent

**Pillar 2: Robust Ingestion Logic**
- LLM extraction improves over time
- Validation and normalization evolve

**Pillar 3: Layered Query Patterns**
- Neighbors, paths, filters, temporal
- Always enough for any use case

**These pillars guarantee:**
- Future concepts won't break system
- Future scale won't break retrieval
- Future domains won't break structure
- Future data won't require redesign

---

## 9. CORRECTIONS MADE

### 9.1 Fixed Issues

1. ✅ Fixed typo: "KFs retrieve" → "KGs retrieve"
2. ✅ Removed OCCURRED_AT (not in final schema, was confusing)
3. ✅ Standardized: "confidence_score" (not "confidence")
4. ✅ Added: Clear decision criteria for Event vs Entity
5. ✅ Added: Entity disambiguation strategy
6. ✅ Added: Conflict resolution rules
7. ✅ Added: Validation approach for entity_type
8. ✅ Added: Explicit relationship directionality rules

### 9.2 Consolidated Duplicates

1. ✅ Single schema definition (Section 2)
2. ✅ Single purpose explanation (Section 6)
3. ✅ Consolidated update strategies (Section 3)
4. ✅ Removed redundant confidence-building sections
5. ✅ Single ingestion pipeline explanation (Section 4)

### 9.3 Added Missing Information

1. ✅ Entity disambiguation strategy
2. ✅ Conflict resolution approach
3. ✅ Relationship directionality rules
4. ✅ Query optimization tips
5. ✅ Indexing strategy details
6. ✅ Decision criteria for Event vs Entity

---

## 10. TECHNOLOGY STACK DECISIONS

### 10.1 Selected Technologies

**Graph Database: Neo4j**
- ✅ Selected
- Query Language: Cypher
- Benefits: Most popular, excellent documentation, strong community
- Implementation: Use Neo4j Python driver or py2neo library

**LLM for Extraction: GPT-5-nano**
- ✅ Selected
- Purpose: Entity and relationship extraction from text
- Integration: OpenAI API (or equivalent provider)
- Note: Ensure GPT-5-nano supports structured JSON output

### 10.2 Neo4j Setup Requirements

**Installation Options:**
1. **Neo4j Desktop** (Local development)
   - Download from neo4j.com
   - Create local database instance
   - Default: bolt://localhost:7687

2. **Neo4j Aura** (Cloud managed)
   - Sign up at neo4j.com/cloud
   - Create free tier instance
   - Get connection URI and credentials

3. **Docker** (Containerized)
   ```bash
   docker run -p 7474:7474 -p 7687:7687 neo4j:latest
   ```

**Python Driver Installation:**
```bash
pip install neo4j
```

**Connection Example:**
```python
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
AUTH = ("neo4j", "password")

driver = GraphDatabase.driver(URI, auth=AUTH)

def test_connection():
    with driver.session() as session:
        result = session.run("RETURN 1 as test")
        return result.single()["test"] == 1
```

### 10.3 GPT-5-nano Integration Requirements

**API Setup:**
- Obtain API key from provider
- Set up environment variables
- Configure rate limiting and retry logic

**Extraction Prompt Template:**
```
You are a knowledge extraction system. Extract entities and relationships from the following text.

Text: {text_chunk}

Extract:
1. Entities with: name, entity_type, properties
2. Relationships with: source, target, relationship_type, relation_subtype, properties
3. Mentions with: entity, document_id, offset

Return structured JSON matching this schema:
{
  "entities": [...],
  "relationships": [...],
  "mentions": [...]
}
```

**Python Integration Example:**
```python
import openai  # or your GPT-5-nano provider

def extract_with_gpt5nano(text_chunk, schema_prompt):
    response = openai.ChatCompletion.create(
        model="gpt-5-nano",  # or actual model name
        messages=[
            {"role": "system", "content": schema_prompt},
            {"role": "user", "content": text_chunk}
        ],
        temperature=0.2,  # Low for consistency
        response_format={"type": "json_object"}  # Structured output
    )
    return json.loads(response.choices[0].message.content)
```

### 10.4 Neo4j-Specific Implementation Notes

**Connection:**
```python
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("username", "password"))
```

**Cypher Query Examples:**

**Create Entity Node:**
```cypher
CREATE (e:Entity {
  id: $id,
  name: $name,
  entity_type: $entity_type,
  description: $description,
  source: $source,
  created_at: $created_at,
  updated_at: $updated_at
})
```

**Create Relationship:**
```cypher
MATCH (a:Entity {id: $source_id}), (b:Entity {id: $target_id})
CREATE (a)-[r:DEPENDS {
  relation_subtype: $subtype,
  source: $source,
  timestamp: $timestamp,
  confidence_score: $confidence
}]->(b)
```

**Neighbor Query:**
```cypher
MATCH (e:Entity {id: $entity_id})-[r]-(connected)
RETURN connected, type(r) as relationship_type, r
```

**Path Query:**
```cypher
MATCH path = (a:Entity {id: $start_id})-[*1..5]-(b:Entity {id: $end_id})
RETURN path
LIMIT 10
```

**Filter Query:**
```cypher
MATCH (e:Entity)
WHERE e.entity_type = $entity_type AND e.status = $status
RETURN e
LIMIT 100
```

**Temporal Query:**
```cypher
MATCH (e:Entity {id: $entity_id})-[r:TEMPORAL_BEFORE]->(next)
RETURN next
ORDER BY next.created_at DESC
```

**Indexes (Neo4j):**
```cypher
CREATE INDEX entity_id_index FOR (e:Entity) ON (e.id);
CREATE INDEX entity_type_index FOR (e:Entity) ON (e.entity_type);
CREATE INDEX entity_name_index FOR (e:Entity) ON (e.name);
```

## 11. RECOMMENDATIONS FOR NEXT STEPS

### 11.1 Immediate Actions

1. ~~**Choose Graph Database:**~~ ✅ **DONE: Neo4j selected**

2. **Define Entity Type Taxonomy (Optional):**
   - While entity_type is flexible, consider a controlled vocabulary
   - Helps with consistency and querying
   - Example: ["Microservice", "API", "Bug", "Person", "Document", "Test"]

3. **Set Up Validation Rules:**
   - Required properties check
   - ID uniqueness validation
   - Relationship type validation
   - Timestamp format validation

4. **Design Batch vs Real-time Strategy:**
   - Batch: Process documents in bulk (initial load)
   - Real-time: Process as documents arrive (ongoing updates)

### 11.2 Implementation Priorities

**Phase 1: Graph Skeleton (Neo4j Setup)**
- Install Neo4j (local or cloud)
- Create labels (Entity, Event, Document)
- Define relationship types (8 universal types)
- Set constraints (unique id)
- Create indexes (id, entity_type, name)
- Test connection with Python driver

**Phase 2: Basic Ingestion (GPT-5-nano Integration)**
- Design GPT-5-nano extraction prompt (structured JSON output)
- Test GPT-5-nano with sample text
- Normalization logic (validate schema compliance)
- Simple deduplication (by ID using Neo4j queries)
- Basic Cypher insert statements
- Error handling for LLM extraction failures

**Phase 3: Advanced Features**
- Semantic deduplication (using embeddings + Neo4j similarity)
- Versioning (TEMPORAL_BEFORE relationships in Neo4j)
- Conflict resolution (merge logic in Cypher)
- Query patterns (implement 4 universal patterns in Cypher)
- Batch ingestion optimization (Neo4j transactions)

**Phase 4: Optimization (Neo4j-Specific)**
- Performance tuning (query profiling in Neo4j)
- Advanced indexing (composite indexes if needed)
- Query optimization (EXPLAIN and PROFILE in Cypher)
- Monitoring (Neo4j metrics, query performance)
- Connection pooling (for production)

---

## END OF REVIEWED DOCUMENT

**Document Status:** Ready for implementation  
**Next Review:** After Phase 1 completion  
**Technology Decisions Made:**
1. ✅ Graph Database: **Neo4j**
2. ✅ LLM for Extraction: **GPT-5-nano**
3. ⏳ Controlled vocabulary for entity_type? (TBD)
4. ⏳ Conflict resolution preference (merge vs version)? (TBD)
5. ⏳ Batch or real-time ingestion? (TBD)

---

**Review Notes:**
- Original document: 1981 lines
- Reviewed document: Consolidated to essential information
- Removed: Conversational prompts, redundant explanations, scattered "if you want" statements
- Added: Missing critical information, clear structure, decision criteria
- Status: Production-ready reference document

