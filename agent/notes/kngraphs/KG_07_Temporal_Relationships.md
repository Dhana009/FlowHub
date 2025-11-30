# KG 07. Temporal Relationships

## Core Concept

**Temporal relationships store timestamps to track when relationships were created, first seen, or last seen, enabling time-aware queries and history tracking.**

This is concept-level understanding - you need to know why, not deep implementation.

## Why Temporal Relationships Matter

### The Problem Without Time

**Scenario:** A bug impacts a service, then gets fixed, then impacts again later.

**Without timestamps:**
```
(Bug123)-[:IMPACTS]->(LoginService)
```

**Problem:**
- Can't tell when it first impacted
- Can't tell when it was fixed
- Can't tell if it impacts again
- Can't track history

**With timestamps:**
```
(Bug123)-[:IMPACTS {
  first_seen: "2024-01-15",
  last_seen: "2024-01-20",
  fixed_at: "2024-01-18"
}]->(LoginService)
```

**Benefits:**
- Know when it first happened
- Know when it was last seen
- Know when it was fixed
- Can track changes over time

---

## Storing Timestamps on Relationships

### Common Timestamp Properties

**first_seen:**
- When relationship was first observed
- First occurrence
- Historical record

**last_seen:**
- When relationship was last observed
- Most recent occurrence
- Current state

**created_at:**
- When relationship was created in graph
- System timestamp
- Audit trail

**fixed_at / resolved_at:**
- When issue was resolved
- For bug/service relationships
- Resolution tracking

**Example:**
```cypher
(:Bug {id: "bug_123"})-[:IMPACTS {
  first_seen: "2024-01-15T10:30:00Z",
  last_seen: "2024-01-20T14:22:00Z",
  fixed_at: "2024-01-18T09:15:00Z"
}]->(:Service {id: "service_login"})
```

---

## Why We Keep History Instead of Overwriting

### The Overwrite Problem

**Scenario:** Bug impacts service, then gets fixed, then impacts again.

**If we overwrite:**
```
Day 1: (Bug123)-[:IMPACTS {first_seen: "2024-01-15"}]->(Service)
Day 2: (Bug123)-[:IMPACTS {first_seen: "2024-01-16"}]->(Service)  // Overwrites!
```

**Problem:**
- Loses original first_seen date
- Can't see that it happened multiple times
- Can't track pattern (happened, fixed, happened again)
- No history

### The History Solution

**If we keep history:**
```
Day 1: (Bug123)-[:IMPACTS {
  first_seen: "2024-01-15",
  last_seen: "2024-01-15"
}]->(Service)

Day 2: Update last_seen only
(Bug123)-[:IMPACTS {
  first_seen: "2024-01-15",  // Keep original
  last_seen: "2024-01-16"    // Update
}]->(Service)

Day 3: Bug fixed
(Bug123)-[:IMPACTS {
  first_seen: "2024-01-15",
  last_seen: "2024-01-16",
  fixed_at: "2024-01-18"
}]->(Service)

Day 4: Bug impacts again
(Bug123)-[:IMPACTS {
  first_seen: "2024-01-15",     // Keep original
  last_seen: "2024-01-20",      // Update
  fixed_at: "2024-01-18",
  reoccurred_at: "2024-01-20"   // Track reoccurrence
}]->(Service)
```

**Benefits:**
- Preserves original first_seen
- Tracks all changes
- Can see patterns
- Complete history

---

## Concept-Level Understanding

### What You Need to Know

**1. Timestamps track when:**
- Relationship was first observed
- Relationship was last observed
- Relationship was created
- Issues were resolved

**2. Keep history by:**
- Updating last_seen (not first_seen)
- Adding new timestamp fields (fixed_at, reoccurred_at)
- Not deleting old relationships
- Preserving original dates

**3. Why it matters:**
- Track changes over time
- Understand patterns
- Audit trail
- Time-based queries

### What You Don't Need to Know (Yet)

- Complex temporal querying
- Time-series databases
- Advanced time modeling
- Temporal graph algorithms

**For 20% knowledge:** Concept-level understanding is enough.

---

## Practical Examples

### Example 1: Bug Impact Tracking
```cypher
// First occurrence
MERGE (b:Bug {id: "bug_123"})-[:IMPACTS {
  first_seen: "2024-01-15",
  last_seen: "2024-01-15"
}]->(s:Service {id: "service_login"})

// Update when seen again (keep first_seen, update last_seen)
MATCH (b:Bug {id: "bug_123"})-[r:IMPACTS]->(s:Service {id: "service_login"})
SET r.last_seen = "2024-01-20"
// first_seen stays "2024-01-15"
```

### Example 2: Work Assignment Tracking
```cypher
// Person starts working on bug
MERGE (p:Person {id: "person_alice"})-[:WORKS_ON {
  since: "2024-01-15",
  started_at: "2024-01-15"
}]->(b:Bug {id: "bug_123"})

// Update when still working (keep since, update current status)
MATCH (p:Person {id: "person_alice"})-[r:WORKS_ON]->(b:Bug {id: "bug_123"})
SET r.last_active = "2024-01-20"
// since stays "2024-01-15"
```

---

## What You Need to Recognize

### In Schema Design
- **Timestamp properties** = first_seen, last_seen, created_at
- **History preservation** = Keep first_seen, update last_seen
- **Resolution tracking** = fixed_at, resolved_at

### In Queries
```cypher
// Find relationships with recent activity
MATCH (a)-[r:IMPACTS]->(b)
WHERE r.last_seen > "2024-01-20"
RETURN a, b, r

// Find relationships that were fixed
MATCH (a)-[r:IMPACTS]->(b)
WHERE r.fixed_at IS NOT NULL
RETURN a, b, r.fixed_at
```

### In Discussions
- "Temporal relationships" = Relationships with timestamps
- "Keep history" = Preserve first_seen, update last_seen
- "Time-aware" = Track when things happened
- "Audit trail" = Complete history of changes

## Common Mistakes

❌ **Wrong:** Overwriting first_seen  
✅ **Right:** Keep first_seen, update last_seen

❌ **Wrong:** Deleting old relationships  
✅ **Right:** Update timestamps, keep history

❌ **Wrong:** Not tracking timestamps  
✅ **Right:** Store first_seen, last_seen, and relevant dates

## How to Discuss This Confidently

### With Non-Technical People
"We store timestamps on relationships to track when things happened - when a bug first impacted a service, when it was last seen, when it was fixed. This lets us see the history and patterns over time."

### With Technical People
"We implement temporal relationships by storing timestamp properties (first_seen, last_seen, fixed_at) on relationships. We preserve history by keeping first_seen constant and updating last_seen, enabling time-aware queries and change tracking."

### With Architects
"Our temporal relationship strategy stores first_seen (preserved), last_seen (updated), and domain-specific timestamps (fixed_at, resolved_at) on relationships. This enables history preservation, pattern analysis, and time-based queries without overwriting historical data."

## Practical Recognition

**You'll see temporal relationships when:**
- Tracking when relationships occur
- Preserving history
- Time-based queries
- Change tracking

**You'll know you understand when:**
- You understand why timestamps matter
- You know to preserve first_seen
- You can design temporal properties
- You understand history vs overwrite

## Key Takeaways

1. **Timestamps track when** - first_seen, last_seen, created_at
2. **Keep history** - Preserve first_seen, update last_seen
3. **Don't overwrite** - Update timestamps, keep original dates
4. **Concept-level is enough** - For 20% knowledge

---

**Next:** [KG_08_Graph_Retrieval_Patterns.md](KG_08_Graph_Retrieval_Patterns.md) - Common query patterns


