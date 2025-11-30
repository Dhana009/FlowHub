# Topic 7: Real-World Scenario-Based Questions - Success Criteria

## If You Can Do These, You're Interview-Ready

### Root Cause Analysis

- ✅ Explain how you'd debug an API returning 200 with wrong data without seeing the code
- ✅ Identify if issue is in API layer, database, or third-party integration
- ✅ Reproduce intermittent payment failures
- ✅ Validate data consistency across multiple systems

### Async Operations

- ✅ Design a test strategy for an async payment flow with multiple failure points
- ✅ Handle variable latency in async operations
- ✅ Determine timeout strategy (fixed, exponential backoff, or adaptive)
- ✅ Test scenarios where async operations fail silently

### Flaky Test Handling

- ✅ Describe your approach to handling flaky tests caused by timing issues
- ✅ Debug test that passes 95% of the time but fails randomly
- ✅ Identify possible causes of flaky tests (synchronization, timing, data)
- ✅ Fix flaky tests with proper wait strategies

### Test Strategy

- ✅ Articulate when to use API tests vs. E2E tests vs. unit tests
- ✅ Design a framework that's maintainable for 500+ test cases
- ✅ Explain your approach to testing third-party API integrations
- ✅ Discuss how you'd validate data consistency across microservices

### Test Data Management

- ✅ Explain test data isolation strategy for parallel test execution
- ✅ Handle shared test data in parallel E2E tests
- ✅ Manage test data for payment scenarios
- ✅ Ensure test data doesn't leak into production

### Advanced Scenarios

- ✅ Discuss idempotency and retry logic in payment scenarios
- ✅ Handle dynamic elements that change selectors between page loads
- ✅ Test third-party integration without hitting real API
- ✅ Handle test data creation failures

## Readiness Indicators

**You're ready if you can:**
1. Debug API issues beyond status codes
2. Design test strategy for async flows
3. Handle flaky tests systematically
4. Articulate test strategy decisions (API vs E2E vs unit)
5. Design test data isolation for parallel execution
6. Explain idempotency and retry logic
7. Handle dynamic elements with changing selectors
8. Design maintainable framework for large test suites
9. Test third-party integrations properly
10. Validate data consistency across services

