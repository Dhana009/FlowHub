# Topic 4: SQL/Database Testing - Success Criteria

## If You Can Do These, You're Interview-Ready

### Core Requirements

- ✅ Write a query to detect duplicate records in a transactions table and explain how duplicates break test assertions
- ✅ Explain the difference between DELETE and TRUNCATE in the context of test data cleanup and why it matters
- ✅ Design a test data setup that uses transactions to ensure rollback on test failure, preventing data pollution
- ✅ Identify why a test passes locally but fails in CI/CD (common scenario: uncommitted data, timezone issues, missing indexes)
- ✅ Query MongoDB to validate nested document structure and array contents match expected test data
- ✅ Explain indexing strategy impact on test execution time and when to add/remove indexes for testing
- ✅ Describe how to handle test data with time-based filtering (e.g., "created in last 10 minutes") accounting for timezone inconsistencies
- ✅ Write a query using CTEs or window functions to validate cumulative data (e.g., user signup counts over time)

### Scenario-Based Capabilities

- ✅ Debug test failures related to database issues (transaction isolation, race conditions, timezone)
- ✅ Write queries to find data inconsistencies (orphaned records, missing relationships)
- ✅ Ensure test data doesn't interfere with parallel test execution
- ✅ Validate MongoDB documents with nested arrays and embedded documents
- ✅ Optimize slow queries in test execution (EXPLAIN, indexes, query structure)
- ✅ Handle edge cases in test data (NULL values, zero amounts, missing foreign keys)

## Readiness Indicators

**You're ready if you can:**
1. Write validation queries to check test data
2. Explain transaction control for test isolation
3. Design test data setup/teardown with rollback
4. Debug CI/CD test failures related to database
5. Query MongoDB for document validation
6. Explain indexing impact on test performance
7. Handle time-based filtering with timezone awareness
8. Use CTEs/window functions for complex validations
9. Identify and fix flaky tests caused by database issues
10. Optimize slow queries in test execution

