# Topic 5: Programming/DSA - Question Patterns

## Question Types Asked (Actual SDET Interview Questions)

### Design & Architecture Questions

1. "Design a test framework for an e-commerce application. How would you structure your Page Objects? What base classes would you create?"
2. "How would you implement a Page Object Model that handles both web and mobile applications?"
3. "Describe how you would design a test data factory for creating complex user scenarios."
4. "How do you handle dynamic elements in your Page Objects? Show me your approach."
5. "Design a logging and reporting utility for your test framework. What would you include?"

### OOP & Design Pattern Questions

6. "Explain how you use inheritance in your test framework. When would you use abstract classes vs. interfaces?"
7. "Tell me about a time you refactored test code using design patterns. What pattern did you use and why?"
8. "How do you implement the Singleton pattern for WebDriver management? What are the thread-safety considerations?"
9. "Describe your approach to handling test data setup. Do you use Builder pattern? Why or why not?"
10. "How would you design a test framework that supports multiple browsers? What design pattern would you use?"

### Collections & Data Structure Questions

11. "You need to validate that API responses contain specific users. How would you structure your test data? Why that choice?"
12. "How do you handle test data that needs to be shared across multiple test cases? What data structure would you use?"
13. "Describe a scenario where you chose a Set over a List for test data. What was the reason?"
14. "How do you manage test parameters for data-driven testing? What collection types do you use?"

### API & Response Parsing Questions

15. "Walk me through how you parse and validate a complex JSON API response in your tests."
16. "How do you extract nested data from an XML response for assertion?"
17. "Describe your approach to handling dynamic values in API responses (timestamps, IDs, etc.)."
18. "How do you validate API response structure and data types?"

### String & Text Validation Questions

19. "How do you validate error messages that contain dynamic content?"
20. "Describe a scenario where you used regex in your tests. What was the use case?"
21. "How do you handle case-insensitive string comparisons in assertions?"
22. "Walk me through extracting a confirmation code from an email or response."

### Algorithm & Optimization Questions

23. "How do you optimize test execution when you have hundreds of test cases? What approach do you take?"
24. "Describe how you would sort test results for reporting. What's your approach?"
25. "How do you filter test data to run only relevant scenarios for a specific feature?"

## Question Structures

- **Design questions** - "Design a...", "How would you structure..."
- **Implementation questions** - "How do you implement...", "Show me your approach..."
- **Explanation questions** - "Explain how you use...", "Describe your approach..."
- **Choice questions** - "Why did you choose...", "What would you use..."
- **Optimization questions** - "How do you optimize...", "What's your approach..."

## Follow-up Questions (Common Probing Patterns)

### After You Describe Your Approach

- "Why did you choose that design pattern over alternatives?"
- "How would you handle [edge case] with your current design?"
- "What would you do differently if requirements changed to [scenario]?"
- "How would you test this code? What unit tests would you write?"
- "What are the limitations of your approach?"
- "How would you scale this to handle 10x more test cases?"
- "Walk me through a specific example from your past projects."
- "How do you handle thread safety in your implementation?"
- "What's the performance impact of your design choice?"
- "How would you refactor this if you had to support [new requirement]?"

### Validation Questions

- "Can you explain this code line-by-line?"
- "What would happen if [input/scenario] occurred?"
- "How would you debug if this test failed?"
- "What assumptions are you making in your design?"

## What Interviewers Probe For

1. **Practical coding ability** - Can you write maintainable test code?
2. **Design pattern knowledge** - Do you understand when to use patterns?
3. **OOP understanding** - Can you apply OOP principles to test frameworks?
4. **Problem-solving** - Can you handle real-world scenarios?
5. **Code quality** - Do you write DRY, maintainable code?
6. **Performance awareness** - Can you optimize test code?

## Latest Trends (2024-2025)

### CURRENT & CRITICAL

- **API-First Testing** - Heavy emphasis on REST/GraphQL API testing over UI-only automation
- **Cloud-Native Frameworks** - Understanding containerized test execution and distributed testing
- **AI/ML in Testing** - Familiarity with intelligent test selection and failure prediction (awareness level)
- **Infrastructure as Code** - Test environment setup using Terraform/CloudFormation concepts
- **Async/Concurrent Testing** - Handling asynchronous operations and parallel test execution
- **Test Observability** - Structured logging, tracing, and metrics in test code
- **Shift-Left Testing** - Unit test integration with automation frameworks
- **Framework Agnosticism** - Ability to work with multiple frameworks (Pytest, TestNG, Jest, etc.)

### EMERGING AREAS

- **Functional programming patterns** - For test data transformation
- **Reactive programming** - For async test scenarios

## Outdated Information (Still Asked But Less Common)

- **Heavy focus on Selenium-only testing** - Marked as outdated - Now: multi-tool approach
- **Manual test case documentation** - Marked as outdated - Now: test code as documentation
- **Waterfall testing phases** - Marked as outdated - Now: continuous testing in CI/CD
- **Record-and-playback automation** - Marked as outdated - Now: code-based frameworks
- **Separate QA and development teams** - Marked as outdated - Now: SDETs embedded with dev teams
- **Test coverage as primary metric** - Marked as outdated - Now: risk-based testing focus

## Critical Distinctions for SDET Interviews

### What Interviewers DON'T Ask

- LeetCode-style algorithm problems (reverse linked lists, binary tree traversal, etc.)
- Complex data structure implementations from scratch
- Theoretical computer science concepts
- Competitive programming challenges

### What Interviewers DO Ask

- Practical coding in test automation context
- Design patterns for test frameworks
- OOP principles applied to testing
- Real-world problem solving
- Code quality and maintainability

