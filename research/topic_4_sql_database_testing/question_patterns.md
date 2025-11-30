# Topic 4: SQL/Database Testing - Question Patterns

## Question Types Asked (Actual SDET Interview Questions)

### Scenario-Based Questions (Most Common)

1. **"Your test creates an order, validates it in the database, then deletes it. The test passes locally but fails in CI/CD. Walk me through how you'd debug this."**
   - Expected focus: Transaction isolation level, committed data, race conditions, timezone handling

2. **"Write a query to find all users who made purchases but have no corresponding invoice records. How would you use this in a test?"**
   - Expected focus: LEFT JOIN with NULL check, data validation, catching application bugs

3. **"How do you ensure test data doesn't interfere with other tests running in parallel?"**
   - Expected focus: Transactions with rollback, unique identifiers, separate test databases, data isolation

4. **"Your MongoDB test inserts a document with nested arrays. How do you validate the array contents match expected values?"**
   - Expected focus: find() with $elemMatch, array index notation, querying array presence vs specific values

5. **"A test that validates customer data takes 45 seconds to run. The query joins 5 tables. How would you optimize?"**
   - Expected focus: Missing indexes on join keys, EXPLAIN usage, filter pushdown, index tradeoffs

6. **"How do you handle test data with time-based conditions (e.g., 'orders from the last 10 minutes')?"**
   - Expected focus: Timezone differences, database server time, daylight saving transitions, timestamp format

7. **"Your test needs to verify that a budget forecast correctly labels projects as 'overbudget' or 'within budget'. Write the validation query."**
   - Expected focus: JOIN projects to expenditures, compare actual_spend > budget, CASE statement, edge cases

## Question Type Patterns

### Pattern 1: Data Validation
- "Write a query to verify X exists and has correct values"
- Interviewers want to see: JOIN logic, WHERE clauses, GROUP BY for aggregation, HAVING for filtering groups

### Pattern 2: Data Isolation
- "How do you ensure test data doesn't pollute other tests?"
- Interviewers want to see: Understanding of transactions, rollback, unique identifiers, test environment design

### Pattern 3: Performance Diagnosis
- "This test is slow. How do you fix it?"
- Interviewers want to see: EXPLAIN usage, index awareness, query optimization thinking, not just "add an index"

### Pattern 4: Edge Case Handling
- "What if the data has X edge case?"
- Interviewers want to see: NULL handling, zero values, missing relationships, timezone issues, duplicate records

### Pattern 5: Tool/Framework Agnostic
- "How would you do this in MongoDB instead of SQL?"
- Interviewers want to see: Adaptability, understanding of document vs relational models, not memorized syntax

## Follow-up Questions (Common Probing Patterns)

### After Your Answer About Data Validation

- "How would you handle users/records with edge cases?" (e.g., null values, zero amounts, missing foreign keys)
- Shows if you think about data quality and defensive coding

### After Your Answer About Performance

- "What if the query runs slowly on production data? How would you diagnose it?"
- Tests knowledge of EXPLAIN, execution plans, and performance analysis tools

### After Your Answer About Test Design

- "How do you ensure this test is maintainable? What if the schema changes?"
- Assesses test design maturity and awareness of technical debt

### After Your Answer About Test Data Setup

- "Walk me through your test data setup. How do you know the data is in the right state before the test runs?"
- Reveals understanding of test preconditions and data validation

### After Your Answer About Database Choice

- "What's the difference between your approach in SQL Server vs. PostgreSQL vs. MongoDB?"
- Tests adaptability and awareness that syntax/capabilities vary

## What Interviewers Probe For

1. **Practical SQL skills** - Can you write queries for validation?
2. **Transaction understanding** - Do you understand ACID properties?
3. **Test design maturity** - Can you design isolated test data?
4. **Performance awareness** - Can you optimize slow queries?
5. **Adaptability** - Can you work with different database types?
6. **Edge case thinking** - Do you consider data quality issues?

## Latest Trends (2024-2025)

### CURRENT & CRITICAL

- **Data observability in tests** - Monitoring data quality metrics during test execution, not just pass/fail results
- **Containerized databases for test isolation** - Docker containers with ephemeral databases for parallel test execution
- **GraphQL + database testing** - Validating data through GraphQL queries instead of direct SQL (emerging in modern stacks)
- **Event-driven test validation** - Querying event logs/message queues to validate side effects instead of just database state
- **AI-generated test data** - Using synthetic data generation tools; understanding how to validate synthetic data quality
- **Database-as-a-service (DBaaS) testing** - Testing against managed databases (AWS RDS, Azure Cosmos) with different constraints than on-premise

### EMERGING AREAS

- **NoSQL testing patterns** - Beyond MongoDB, understanding DynamoDB, Cassandra testing
- **Time-series database testing** - For IoT, monitoring applications

## Outdated Information (Still Asked But Less Common)

- **Stored procedures for test setup** - Marked as outdated - Replaced by application-level setup or infrastructure-as-code
- **Manual database backup/restore for test reset** - Marked as outdated - Replaced by containerization and ephemeral databases
- **Detailed normalization theory (3NF, BCNF)** - Marked as outdated - Still relevant for design but not heavily tested in SDET interviews
- **SQL Server-specific features** - Marked as outdated - Cloud databases (PostgreSQL, MongoDB) now more common in modern companies
- **Complex recursive CTEs for test data** - Marked as outdated - Simpler approaches preferred; CTEs still useful but not a primary focus

## Critical Distinctions for SDET Interviews

### What Matters
- Writing queries to validate test data
- Understanding transaction isolation for test reliability
- Designing test data setup/teardown
- Identifying and fixing flaky tests
- Query optimization for test performance

### What Doesn't Matter
- Memorizing all SQL functions
- Deep database administration knowledge
- Complex stored procedure writing
- Database design theory (normalization depth)
- Vendor-specific syntax memorization

