# Topic 3: System Understanding - What to Know

## What Exactly You Need to Know (Interview-Critical Only)

### Core Flow Understanding (90% of interviews)

1. **Request Flow Tracing**
   - UI → Load Balancer → API Gateway → Service → Database
   - How requests move through system layers
   - Testing points at each layer

2. **API Contract Understanding**
   - REST/GraphQL endpoints
   - Request/response validation
   - Contract testing approaches

3. **Data Flow**
   - How data moves between layers
   - Transformation points
   - Data consistency across services

4. **Authentication Flow**
   - Token validation across services
   - Session management
   - Security headers

5. **Error Propagation**
   - How failures cascade through system layers
   - Error handling at each layer
   - Failure impact analysis

### Distributed Systems Knowledge (80% of interviews)

6. **Service Communication**
   - Sync vs Async communication
   - When each is used
   - Testing implications

7. **Data Consistency**
   - Eventual consistency patterns
   - Transaction boundaries
   - Testing consistency scenarios

8. **Service Dependencies**
   - Upstream/downstream impact analysis
   - Dependency testing
   - Service isolation

9. **Failure Modes**
   - Network partitions
   - Service unavailability
   - Timeout scenarios
   - Testing failure scenarios

### Testing Integration Points (95% of interviews)

10. **API Testing Strategy**
    - Contract testing
    - Integration testing approaches
    - API versioning impact

11. **Database Testing**
    - Data setup/teardown
    - Test data isolation
    - Database interaction patterns

12. **Environment Dependencies**
    - How services interact across test environments
    - Environment configuration
    - Test environment setup

13. **Mock/Stub Strategy**
    - When to mock vs real service calls
    - Mocking patterns
    - Service virtualization

## Core Concepts (What Interviewers Test)

- **Request flow tracing** (UI→API→Backend→DB)
- **Microservices architecture** (service communication, dependencies)
- **Event-driven architecture** (message queues, event sourcing)
- **Circuit breaker patterns** (failure handling, resilience)
- **Load balancing** (routing logic, distribution)
- **Caching strategies** (cache invalidation, cache testing)
- **API contract testing** (OpenAPI, AsyncAPI)
- **Database testing** (data isolation, setup/teardown)
- **Service mesh** (Istio/Envoy proxy testing)
- **Kubernetes testing** (pod lifecycle, service discovery)
- **GraphQL federation** (schema stitching, testing challenges)
- **Serverless testing** (Lambda cold starts, function composition)
- **Distributed tracing** (request correlation, debugging)
- **Observability** (traces, metrics, logs for testing)

