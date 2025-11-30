# Topic 7: Real-World Scenario-Based Questions - What to Know

## What Exactly You Need to Know (Interview-Critical Only)

### Payment & Financial Transaction Scenarios

1. **Root Cause Analysis Patterns**
   - API returns HTTP 200 with incorrect transaction amount or status
   - Idempotency key handling failures causing duplicate charges
   - Race conditions between payment gateway and internal ledger updates
   - Timeout scenarios where payment succeeds but confirmation fails
   - Currency conversion mismatches in multi-currency transactions

2. **Root Cause Identification**
   - Identifying if issue is in API layer, database, or third-party integration
   - Approach to reproducing intermittent payment failures
   - Strategy for validating data consistency across multiple systems
   - Testing retry logic without creating duplicate transactions

### API Response Validation Beyond Status Codes

3. **Critical Scenarios**
   - API returns 200 but response body contains error messages or null values
   - Partial data responses (some fields missing, some incorrect)
   - Response schema validation failures (wrong data types, missing required fields)
   - Timestamp inconsistencies between request and response
   - Pagination token expiration or invalid cursor handling

4. **Validation Approaches**
   - Catching API returning 200 with 'failure' message in body
   - Handling API returning correct status but wrong user data
   - Validating response contracts in framework

### Asynchronous Operations & Event-Driven Testing

5. **Real-World Complexities**
   - Order placed → payment processed → inventory updated → notification sent (multiple async steps)
   - Message queue delays causing test flakiness
   - Webhook callbacks arriving out of order
   - Timeout determination for async operations (how long to wait?)
   - Polling vs. event-driven verification strategies

6. **Handling Strategies**
   - Handling variable latency in async operations
   - Timeout strategy (fixed, exponential backoff, or adaptive)
   - Testing scenarios where async operations fail silently

### Dynamic Element Synchronization

7. **Scenarios Beyond Basic Waits**
   - Elements that appear/disappear based on API responses
   - Shadow DOM elements in modern web applications
   - Elements rendered by JavaScript frameworks (React, Vue, Angular)
   - Stale element references after DOM re-renders
   - Elements that are visible but not clickable (covered by overlays)

8. **Synchronization Approaches**
   - Explicit vs. implicit waits and when each fails
   - Custom wait conditions for complex scenarios
   - Handling dynamic IDs and changing selectors
   - Detecting when an element is truly ready vs. just present in DOM

### End-to-End Automation Strategy

9. **Scope Definition**
   - Which scenarios warrant E2E vs. API vs. unit tests
   - Test data isolation in E2E flows (avoiding test pollution)
   - Environment-specific configurations (dev, staging, production)
   - Parallel execution challenges and data consistency
   - Rollback strategies when tests fail mid-flow

10. **Strategic Decisions**
    - Deciding what to automate end-to-end
    - Handling shared test data in parallel E2E tests
    - Approach to E2E tests that depend on external services

### Test Data Design & Management

11. **Real-World Complexity**
    - Creating reproducible test data without hardcoding
    - Handling PII (personally identifiable information) in test data
    - Test data cleanup and isolation between test runs
    - Data dependencies (user must exist before creating order)
    - Handling rate limits when creating bulk test data

12. **Management Strategies**
    - Managing test data for payment scenarios
    - Handling test data creation failures
    - Ensuring test data doesn't leak into production

## Core Concepts (What Interviewers Test)

- **Root cause analysis** (identifying failure points, data consistency)
- **API validation beyond status codes** (response body validation, schema validation)
- **Async operation handling** (timeout strategies, polling vs event-driven)
- **Dynamic element synchronization** (custom waits, selector strategies)
- **E2E automation strategy** (scope definition, test data isolation)
- **Test data design** (reproducibility, PII handling, cleanup)
- **Idempotency** (retry logic, duplicate prevention)
- **Third-party integration testing** (mocking strategies, integration approach)
- **Data consistency** (across microservices, eventual consistency)
- **Flaky test debugging** (timing issues, synchronization problems)

