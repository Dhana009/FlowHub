# Topic 7: Real-World Scenario-Based Questions - Question Patterns

## Question Types Asked (Actual SDET Interview Questions)

### Scenario 1: Payment Processing

**"We have a payment API that returns 200 OK, but sometimes the transaction amount in the response doesn't match the request. How would you test this? What would you check?"**

**What They're Testing:**
- Your ability to think beyond HTTP status codes
- Understanding data validation
- Identifying root causes
- Testing approach for financial transactions

### Scenario 2: Async Order Flow

**"An order goes through these steps: order created → payment processed → inventory updated → confirmation email sent. Each step is async. How would you automate testing this entire flow? What could go wrong?"**

**What They're Testing:**
- Understanding of async patterns
- Timeout strategies
- Failure handling
- Test design for complex flows

### Scenario 3: Flaky Test Investigation

**"Your E2E test passes 95% of the time but fails randomly. The test clicks a button, waits for a modal, and fills a form. What are the possible causes? How would you fix it?"**

**What They're Testing:**
- Debugging skills
- Understanding of synchronization issues
- Practical problem-solving
- Wait strategy knowledge

### Scenario 4: Test Data Isolation

**"You're running 50 tests in parallel, each creating a user and placing an order. Tests are interfering with each other. How would you solve this?"**

**What They're Testing:**
- Understanding of test isolation
- Data management
- Scalability thinking
- Parallel execution challenges

### Scenario 5: Third-Party Integration

**"Your application integrates with Stripe for payments. How would you test this integration without hitting the real Stripe API in your test environment?"**

**What They're Testing:**
- Mocking strategies
- Integration testing approach
- Practical DevOps thinking
- Test environment design

### Scenario 6: Dynamic Element Handling

**"A web page uses React and dynamically generates element IDs. The same element has different IDs on each page load. How would you locate and interact with it reliably?"**

**What They're Testing:**
- Selector strategies
- Framework knowledge
- Handling modern web applications
- Dynamic element synchronization

## Question Structures

- **Scenario-based questions** - "We have a situation...", "An order goes through..."
- **Problem-solving questions** - "How would you test...", "What would you check..."
- **Debugging questions** - "What are the possible causes...", "How would you fix..."
- **Design questions** - "How would you automate...", "How would you solve..."

## Follow-up Questions (Common Probing Patterns)

### "What if...?" Questions

- "What if the API times out?"
- "What if the database is slow?"
- "What if the third-party service is down?"
- "What if the element never appears?"
- "What if test data creation fails?"

### "How would you know...?" Questions

- "How would you know the test failed for the right reason?"
- "How would you detect a false positive?"
- "How would you know if it's a test issue or service issue?"
- "How would you know when async operation completes?"

### "What's your strategy for...?" Questions

- "...handling this in production?"
- "...scaling this to 1000 tests?"
- "...debugging this in CI/CD?"
- "...handling flaky tests?"
- "...managing test data at scale?"

### "Tell me about a time..." Questions

- "...you encountered this issue"
- "...you had to redesign your framework"
- "...a test was flaky"
- "...you debugged a complex failure"
- "...you handled async operation testing"

### "What are the trade-offs...?" Questions

- "...between API and E2E testing?"
- "...between speed and coverage?"
- "...between maintainability and flexibility?"
- "...between mocking and real services?"
- "...between parallel and sequential execution?"

## What Interviewers Probe For

1. **Problem-solving ability** - Can you think through complex scenarios?
2. **Systematic approach** - Do you have a methodical debugging process?
3. **Real-world experience** - Can you handle actual production scenarios?
4. **Trade-off analysis** - Do you understand engineering decisions?
5. **Scalability thinking** - Can you design for growth?
6. **Practical knowledge** - Can you apply theory to real problems?

## Latest Trends (2024-2025)

### CURRENT & CRITICAL

- **Shift-left testing** - Testing earlier in pipeline (interviewers expect this mindset)
- **Contract testing for microservices** - Growing importance in distributed systems
- **AI-powered test generation** - Emerging trend (awareness level)
- **Observability-driven testing** - Using observability data for test validation
- **Chaos engineering scenarios** - Testing system behavior under failure conditions

### EMERGING AREAS

- **Real-time test validation** - Immediate feedback during test execution
- **Risk-based test selection** - Prioritizing high-risk scenarios

## Outdated Information (Still Asked But Less Common)

- **Selenium IDE and basic record-playback** - Marked as outdated - Avoid mentioning this
- **Manual testing as primary skill** - Marked as outdated - Emphasize automation instead
- **Waterfall testing phases** - Marked as outdated - Agile/continuous approach now
- **Separate test and development** - Marked as outdated - Integrated approach now

