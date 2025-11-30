# Topic 6: Observability & Debugging - What to Know

## What Exactly You Need to Know (Interview-Critical Only)

### Distributed Tracing & Request Flow Analysis

1. **Tracing Concepts**
   - How to trace requests across multiple microservices
   - Identifying where failures occur
   - Reading trace data from tools (Jaeger, Zipkin)
   - Identifying latency bottlenecks
   - Correlating trace IDs across service boundaries

2. **Trace Analysis**
   - Connecting trace spans to test failures
   - Performance degradation identification
   - Request flow visualization
   - Service dependency mapping

### Log Analysis & Correlation

3. **Log Parsing**
   - Parsing logs from multiple services
   - Correlating events using timestamps
   - Request ID correlation
   - Log aggregation patterns

4. **Structured Logging**
   - Structured logging formats
   - Querying centralized logging systems (ELK Stack)
   - Log levels understanding
   - Error propagation tracking

5. **Root Cause Identification**
   - Identifying root causes from logs
   - Service dependencies from logs
   - Failure pattern recognition
   - Log correlation techniques

### Metrics-Driven Testing & SLA/SLO Validation

6. **Key Metrics Understanding**
   - Latency percentiles
   - Error rates
   - Throughput metrics
   - Programmatic validation

7. **Prometheus & Metrics**
   - Writing assertions against Prometheus metrics
   - Metric extraction queries
   - Metric validation approaches

8. **SLO Validation**
   - SLO compliance validation
   - Service level agreement understanding
   - SLO violation identification
   - Continuous SLO validation

### CI/CD Failure Debugging

9. **Flaky Test Debugging**
   - Debugging flaky tests in CI/CD
   - Correlating test execution logs with application logs
   - Identifying environmental factors
   - Distinguishing test issues vs service issues

10. **Production Failure Debugging**
    - Debugging production failures in CI/CD
    - Log correlation techniques
    - Environment comparison
    - Failure pattern analysis

### Service Mesh Observability

11. **Service Mesh Concepts**
    - Understanding service meshes (Istio, Linkerd)
    - Observability without code changes
    - Sidecar metrics extraction
    - Traffic pattern understanding

12. **Service Communication Debugging**
    - Debugging communication failures between services
    - Service mesh metrics usage
    - Inter-service communication analysis

### Performance Debugging & Bottleneck Identification

13. **Performance Analysis**
    - CPU profiling
    - Memory analysis
    - Database query performance
    - Network latency analysis

14. **Bottleneck Identification**
    - Identifying performance bottlenecks using observability data
    - Correlating slow tests with performance metrics
    - Production-like environment analysis

## Core Concepts (What Interviewers Test)

- **Distributed tracing** (Jaeger, Zipkin, trace IDs, spans)
- **Log analysis** (correlation, structured logging, ELK Stack)
- **Metrics collection** (Prometheus, key metrics, SLO validation)
- **CI/CD debugging** (flaky tests, log correlation, environmental factors)
- **Service mesh** (Istio, Linkerd, sidecar metrics)
- **Performance debugging** (CPU, memory, database, network)
- **OpenTelemetry** (standardization, instrumentation)
- **Chaos engineering** (failure conditions, observability data)
- **SLO-driven testing** (compliance validation, continuous monitoring)
- **Real-time observability** (streaming data, immediate issue detection)

