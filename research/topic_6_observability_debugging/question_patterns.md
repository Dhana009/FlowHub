# Topic 6: Observability & Debugging - Question Patterns

## Question Types Asked (Actual SDET Interview Questions)

### Distributed Tracing Questions

1. "Walk me through how you would debug a transaction that fails only in production. What observability data would you need?"
2. "How would you identify which microservice in a chain of 10 services is causing a 5-second latency increase?"
3. "Explain how trace context propagation works across services. What happens if a service doesn't propagate the trace ID?"
4. "You have a trace showing a request took 30 seconds. The individual service latencies only add up to 5 seconds. Where is the time going?"

### Log Analysis Questions

5. "Given logs from three services with different timestamps, how would you correlate them to understand what happened?"
6. "How do you distinguish between a test failure and an actual service failure using logs?"
7. "What information should be in every log line to make debugging easier?"
8. "A test passes locally but fails in CI. The application logs look identical. What else would you check?"

### Metrics & SLO Questions

9. "How would you validate that a service meets its 99.9% availability SLO?"
10. "What's the difference between monitoring and observability? Why does it matter for testing?"
11. "You notice test latency increased by 20%. How would you determine if it's a test issue or a service issue?"
12. "How would you set up alerts for SLO violations that trigger before users are impacted?"

### CI/CD Debugging Questions

13. "Your test is flaky—passes 80% of the time. How would you use observability to debug this?"
14. "How would you correlate a test failure with a specific deployment change?"
15. "A test fails in the staging environment but not in your local environment. Walk through your debugging approach."

### Service Mesh & Advanced Questions

16. "How would you use service mesh metrics to debug a circuit breaker triggering unexpectedly?"
17. "Explain how you'd validate that a canary deployment is working correctly using observability data."
18. "How would you detect if a service is experiencing cascading failures using observability?"

## Question Structures

- **Debugging scenario questions** - "Walk me through how you would debug...", "How would you identify..."
- **Explanation questions** - "Explain how...", "What's the difference between..."
- **Validation questions** - "How would you validate...", "How would you set up..."
- **Correlation questions** - "How would you correlate...", "Given logs from..."
- **Detection questions** - "How would you detect...", "How would you identify..."

## Follow-up Questions (Common Probing Patterns)

### After You Answer About Tracing

- "What if the trace ID isn't propagated to the database layer? How would you debug that?"
- "How would you handle tracing in asynchronous operations?"
- "What's the performance overhead of distributed tracing? How would you measure it?"

### After You Answer About Logs

- "How would you handle log volume at scale? What's your strategy for log retention?"
- "How do you prevent sensitive data from appearing in logs?"
- "What's the difference between structured and unstructured logging for debugging?"

### After You Answer About Metrics

- "How would you set up alerting on metrics without creating alert fatigue?"
- "What's the relationship between metrics, logs, and traces? How do they complement each other?"
- "How would you validate that your SLO definition is actually meaningful?"

### After You Answer About CI/CD

- "How would you automate the detection of flaky tests?"
- "What's your strategy for test result analysis across multiple runs?"
- "How would you correlate infrastructure changes with test failures?"

## What Interviewers Probe For

1. **Tracing ability** - Can you trace requests across services?
2. **Log correlation** - Can you correlate logs to find root cause?
3. **Metrics understanding** - Can you use metrics for validation?
4. **Debugging methodology** - Do you have systematic approach?
5. **Tool knowledge** - Do you know observability tools?
6. **Real-world problem solving** - Can you debug actual scenarios?

## Latest Trends (2024-2025)

### CURRENT & CRITICAL

- **Observability as a first-class requirement** - Tests must validate observability signals (traces, metrics, logs), not just functional outcomes
- **SLO-driven testing** - Validating SLO compliance is now part of test success criteria, not just monitoring
- **Chaos engineering integration** - Testing system behavior under failure conditions using observability data
- **OpenTelemetry standardization** - Understanding OTel for instrumentation is becoming standard knowledge
- **Real-time observability in CI/CD** - Streaming observability data during test execution to catch issues immediately
- **AI-driven anomaly detection** - Using ML to detect anomalies in observability data rather than static thresholds
- **Observability for AI/LLM systems** - New focus on tracing and monitoring agentic AI systems in production

### EMERGING AREAS

- **Continuous observability** - Always-on monitoring vs reactive
- **Observability-driven development** - Building with observability in mind

## Outdated Information (Still Asked But Less Common)

- **Manual log parsing and grep-based debugging** - Marked as outdated - Modern: structured logging, correlation tools
- **Monitoring without tracing** - Marked as outdated - Modern: three pillars (metrics, logs, traces)
- **SLA-only thinking** - Marked as outdated - Modern: SLO-driven approach
- **Centralized logging without structured logging** - Marked as outdated - Modern: structured logging formats
- **Reactive monitoring** - Marked as outdated - Modern: proactive, real-time observability
- **Single-tool observability** - Marked as outdated - Modern: integrated observability stack

