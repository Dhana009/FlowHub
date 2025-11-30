# Topic 4: SQL/Database Testing - What to Know

## What Exactly You Need to Know (Interview-Critical Only)

### Core SQL Competencies for SDET Roles

1. **Data Validation Queries**
   - Writing SELECT statements to verify test data exists
   - Checking correct values
   - Maintaining referential integrity
   - Cross-table validation

2. **Test Data Setup/Teardown**
   - Transaction control
   - Rollback mechanisms
   - Data isolation between test runs
   - Test environment reset

3. **Query Performance Impact on Tests**
   - Recognizing slow queries
   - Identifying test environment issues
   - Data problems detection
   - Performance optimization

4. **Data Consistency Checks**
   - Detecting duplicate records
   - Finding orphaned data
   - Constraint violations
   - Data quality validation

5. **Join Operations for Cross-Table Validation**
   - Verifying relationships between entities
   - Users, orders, transactions relationships
   - Matching application expectations

### MongoDB-Specific Testing

6. **Document Structure Validation**
   - Nested fields validation
   - Arrays validation
   - Embedded documents validation
   - Flexible schema handling

7. **Query Operators for Test Assertions**
   - find with $eq, $in, $gt, $exists
   - Array querying ($elemMatch)
   - Document matching

8. **Index Impact on Test Execution**
   - Index impact on speed
   - When to add/remove indexes
   - Index tradeoffs (read vs write)

9. **TTL (Time-to-Live) Index Behavior**
   - Test cleanup using TTL
   - Time-based data expiration

### Database Integration Testing

10. **Connection Pooling and Transaction Isolation**
    - Affecting test reliability
    - Isolation levels understanding
    - ACID properties

11. **Identifying Flaky Tests**
    - Uncommitted data issues
    - Race conditions
    - Data pollution

12. **Replication Lag in Distributed Database Testing**
    - Eventual consistency
    - Replication testing

13. **Backup/Restore Procedures**
    - Test environment reset
    - Data restoration

## Core Concepts (What Interviewers Test)

- **SQL queries** (SELECT, JOIN, WHERE, GROUP BY, HAVING)
- **Transaction control** (COMMIT, ROLLBACK, BEGIN TRANSACTION)
- **Data isolation** (ACID properties, isolation levels)
- **DELETE vs TRUNCATE** (test data cleanup differences)
- **Indexes** (performance impact, when to use)
- **CTEs and window functions** (complex validations)
- **MongoDB queries** (find, $elemMatch, array operations)
- **Time-based filtering** (timezone handling, timestamp issues)
- **Connection pooling** (test reliability)
- **Query optimization** (EXPLAIN, execution plans)
- **Data validation patterns** (duplicates, orphans, constraints)
- **Test data management** (setup, teardown, isolation)

