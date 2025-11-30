# Topic 6: Observability & Debugging - Success Criteria

## If You Can Do These, You're Interview-Ready

### Distributed Tracing

- ✅ Explain how to trace a failed transaction across 5+ microservices using only trace IDs and logs
- ✅ Identify which microservice in a chain of 10 services is causing latency increase
- ✅ Explain how trace context propagation works across services
- ✅ Identify where time is going when trace shows 30 seconds but individual services only add up to 5 seconds
- ✅ Describe how to set up distributed tracing in a microservices test environment

### Log Analysis

- ✅ Identify the root cause of a test failure given mixed application and test logs from multiple services
- ✅ Correlate logs from three services with different timestamps to understand what happened
- ✅ Distinguish between a test failure and an actual service failure using logs
- ✅ Identify what information should be in every log line to make debugging easier
- ✅ Debug test that passes locally but fails in CI using logs

### Metrics & SLO Validation

- ✅ Write a query to extract specific metrics from Prometheus and validate SLO compliance
- ✅ Validate that a service meets its 99.9% availability SLO
- ✅ Explain the difference between monitoring and observability
- ✅ Determine if latency increase is test issue or service issue using metrics
- ✅ Set up alerts for SLO violations that trigger before users are impacted

### CI/CD Debugging

- ✅ Debug a flaky test by correlating CI logs with application metrics and identifying environmental factors
- ✅ Correlate a test failure with a specific deployment change
- ✅ Debug test that fails in staging but not locally
- ✅ Automate detection of flaky tests using observability

### Advanced Capabilities

- ✅ Explain the difference between eventual consistency failures and actual bugs using observability data
- ✅ Use service mesh metrics to debug inter-service communication failures
- ✅ Identify performance bottlenecks using CPU, memory, and latency metrics
- ✅ Correlate test execution time with actual service latency metrics
- ✅ Validate that a Saga pattern transaction completed correctly using logs and events
- ✅ Use service mesh metrics to debug circuit breaker triggering unexpectedly
- ✅ Validate canary deployment using observability data
- ✅ Detect cascading failures using observability

## Readiness Indicators

**You're ready if you can:**
1. Trace requests across multiple microservices
2. Correlate logs from multiple services to find root cause
3. Extract and validate metrics from Prometheus
4. Debug flaky tests using observability data
5. Set up distributed tracing in test environment
6. Use service mesh metrics for debugging
7. Identify performance bottlenecks
8. Correlate test execution with service metrics
9. Validate SLO compliance
10. Distinguish test issues from service issues

