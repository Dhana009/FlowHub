# Topic 2: API Testing - Question Patterns

## Question Types Asked (Actual Interview Questions)

### Tier 1: Fundamental Questions (Always Asked)

1. "What must be checked when performing API testing?"
2. "What is the procedure to perform API testing?"
3. "What are the principles of API test design?"
4. "What are the major challenges faced in API testing?"
5. "What are the testing methods that come under API testing?"

### Tier 2: Intermediate Questions (Frequently Asked)

6. "How do you implement data-driven testing in API frameworks?"
7. "How do you perform API testing using Selenium?" (Integration question)
8. "How do you handle JWT token validation during API testing?"
9. "What is the best approach method to perform API testing?"
10. "How do you verify API responses against expected results?"

### Tier 3: Advanced Questions (Senior SDET Roles)

11. "How do you implement distributed testing across multiple environments?"
12. "How do you handle real-time applications testing?"
13. "How do you implement continuous testing with API frameworks?"
14. "How do you implement load balancing in test execution?"
15. "How do you handle microservices testing?"

## Question Structures

- **Fundamental questions** - "What must be checked...", "What is the procedure..."
- **How-to questions** - "How do you implement...", "How do you handle..."
- **Comparison questions** - "Difference between API and UI testing"
- **Design questions** - "What is the best approach...", "How do you structure..."
- **Challenge questions** - "What are the major challenges..."
- **Integration questions** - "How do you integrate...", "How do you combine..."

## Follow-up Questions (Common Probing Patterns)

### After You Answer "I validate status codes"

- "What specific status codes do you check and why?"
- "How do you handle unexpected status codes?"
- "What's the difference between 4xx and 5xx errors in your tests?"

### After You Answer "I use assertions"

- "What assertion library do you use?"
- "How do you structure your assertions for maintainability?"
- "What happens when an assertion fails in your framework?"

### After You Answer "I test authentication"

- "How do you handle token expiration in tests?"
- "How do you validate JWT signatures?"
- "How do you manage API keys securely in your test framework?"

### After You Answer "I do data-driven testing"

- "What data sources do you use?"
- "How do you handle test data cleanup?"
- "How do you manage test data across environments?"

### After You Answer "I integrate API with UI tests"

- "Why would you do this instead of separate test suites?"
- "How do you handle flakiness in integrated tests?"
- "What's your approach to test execution order?"

## What Interviewers Probe For

1. **Structured thinking** - Methodical approach with clear phases
2. **Security awareness** - JWT validation, authentication, authorization
3. **Data integrity focus** - Schema validation, data types, accuracy
4. **Integration mindset** - APIs don't exist in isolation
5. **Best practices knowledge** - Established patterns and why
6. **Real-world problem solving** - Parameter selection, call sequencing, output verification

## Latest Trends (2024-2025)

### CURRENT & CRITICAL

- **JWT token validation with signature verification** - Modern standard for API security testing
- **Microservices API testing** - Increasingly asked as architectures shift
- **Distributed testing across environments** - Cloud-native testing is now standard
- **Continuous testing integration** - CI/CD pipeline integration is expected
- **API documentation as test source** - Testing against OpenAPI/Swagger specs

### EMERGING (Ask if relevant to role)

- **AI-powered test optimization** - Growing trend
- **Real-time application testing** - For specific domains
- **Progressive Web App (PWA) testing** - Emerging area

## Outdated Information (Still Asked But Less Common)

- **Manual API testing without automation frameworks** - Marked as outdated - Automation is standard
- **Testing without schema validation** - Marked as outdated - Schema validation is critical
- **Ignoring security/authorization in API tests** - Marked as outdated - Security is non-negotiable
- **Treating API testing separately from UI testing** - Marked as outdated - Integration is now expected

## Critical Knowledge Gaps to Avoid

**Don't say this in interviews:**

- "Selenium is used for API testing" - Selenium is UI-focused; use RestAssured, HttpClient, or similar for API testing
- "I only check if the response is 200" - You must validate schema, data types, accuracy, and authorization
- "I don't worry about test data cleanup" - Cleanup is a required phase in API test design
- "I test APIs the same way I test UI" - API testing has distinct challenges: no GUI, parameter combination complexity, call sequencing

