# Topic 1: Framework Design - Question Patterns

## Question Types Asked (Actual Interview Questions)

### Framework Architecture Questions

1. "Explain the architecture of Selenium WebDriver"
2. "How do you implement Page Object Model (POM) in Selenium?"
3. "What is an automation testing framework and what are its types?"
4. "How do you structure your test automation project for maintainability?"
5. "Design a framework that can handle 500+ test cases without performance degradation"

### Wait & Synchronization Questions

6. "Explain the difference between implicit and explicit waits"
7. "What is Fluent Wait in Selenium and when would you use it?"
8. "How do you implement custom wait conditions?"
9. "How do you handle dynamic elements that change attributes during execution?"

### Integration & Execution Questions

10. "How do you integrate Selenium with TestNG? Explain the setup process."
11. "Explain how to run tests in parallel using Selenium Grid"
12. "How do you implement data-driven testing in Selenium?"
13. "How do you integrate Selenium with Docker containers?"

### Modern Web Testing Questions

14. "How can you handle shadow-DOM elements in Selenium?"
15. "How do you handle SSL certificates in Selenium?"
16. "How do you implement cross-browser testing in your framework?"

### BDD & Business Alignment Questions

17. "How do you integrate BDD frameworks like Cucumber with Selenium?"
18. "Write feature files in Gherkin language and explain step definitions mapping"

### Real-World Problem Questions

19. "How do you handle browser crashes during test execution?"
20. "Write a code snippet to verify broken links on a webpage"
21. "Write a code snippet to perform form submission and validate success message"
22. "How do you handle SSL certificates in your framework?"

## Question Structures

- **Architecture explanation questions** - "Explain/Describe how..."
- **Design questions** - "Design a framework that..."
- **Implementation questions** - "How do you implement..."
- **Comparison questions** - "Difference between..."
- **Problem-solving questions** - "How do you handle..."
- **Justification questions** - "Why did you choose..."

## Follow-up Questions (Common Probing Patterns)

### After You Answer About POM

- "What happens when the application UI changes significantly? How does your framework adapt?"
- "How do you handle common elements across multiple pages?"
- "Can you show me how you'd structure a complex page with nested components?"
- "How do you prevent duplicate locators across page objects?"

### After You Answer About Waits

- "Why not just use implicit waits everywhere?"
- "How do you handle cases where explicit waits aren't sufficient?"
- "What's the performance impact of your wait strategy?"
- "How do you debug flaky tests caused by timing issues?"

### After You Answer About Parallel Execution

- "How do you ensure test isolation in parallel execution?"
- "What's your strategy for shared resources (databases, APIs)?"
- "How do you handle test interdependencies?"
- "What's the maximum parallelization you've achieved?"

### After You Answer About Data-Driven Testing

- "How do you manage test data across environments?"
- "What's your approach to sensitive data in test automation?"
- "How do you handle data cleanup after test execution?"

### After You Answer About Framework Design

- "How would you migrate this framework to a different tool (e.g., Playwright)?"
- "What metrics do you use to measure framework effectiveness?"
- "How do you handle framework maintenance as the team grows?"
- "What's your strategy for framework documentation?"

## What Interviewers Probe For

1. **Scalability thinking** - Can you design for growth?
2. **Maintainability awareness** - How do you handle changes?
3. **Problem-solving ability** - Real-world challenges
4. **Modern practices** - Current industry standards
5. **Architecture understanding** - Deep technical knowledge
6. **Trade-off analysis** - Why this approach over others?

## Latest Trends (2024-2025)

### CURRENT & CRITICAL

- **Shadow DOM handling with JavaScriptExecutor** - Modern web applications use Web Components; essential now
- **Containerized testing environments** - Docker integration for consistent, scalable infrastructure
- **Cloud-based testing platforms** - RemoteWebDriver with cloud services for parallel execution
- **BDD framework integration** - Gherkin-based testing for stakeholder alignment remains relevant
- **Fluent waits with custom conditions** - More sophisticated than basic explicit waits; increasingly expected
- **Framework-agnostic design** - Ability to switch between Selenium, Playwright, Cypress
- **API testing integration** - Modern frameworks combine UI and API testing
- **Performance-aware frameworks** - Monitoring test execution time, identifying bottlenecks, optimization strategies

## Outdated Information (Still Asked But Less Common)

- **Implicit waits as primary strategy** - Marked as outdated - Considered anti-pattern; explicit waits are standard
- **Hardcoded waits (Thread.sleep)** - Marked as outdated - Deprecated; use proper synchronization mechanisms
- **Monolithic test classes** - Marked as outdated - POM is now the baseline expectation, not an advanced topic
- **Manual test data management** - Marked as outdated - External data sources and parameterization are standard
- **Single-browser focus** - Marked as outdated - Cross-browser testing is now standard expectation

