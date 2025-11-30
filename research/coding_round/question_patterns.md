# SDET Coding Round - Question Patterns

## Question Types Asked (Actual SDET Coding Round Questions)

### Category 1: Framework Design (Most Common)

1. **"Design a test automation framework for an e-commerce application. Include page objects, test cases, and data management."**
   - What they're testing: Framework architecture, POM design, data management strategy

2. **"Build a framework that can run tests across Chrome, Firefox, and Safari with minimal code duplication."**
   - What they're testing: Multi-browser support, code reusability, configuration management

3. **"Create a framework that supports both UI and API testing with shared utilities."**
   - What they're testing: Hybrid framework design, code organization, utility design

### Category 2: Test Automation Logic

4. **"Write a test that validates a multi-step checkout flow with dynamic pricing and inventory checks."**
   - What they're testing: Complex workflow automation, dynamic data handling, validation logic

5. **"Automate a login flow that includes CAPTCHA handling, 2FA, and session management."**
   - What they're testing: Authentication flows, edge case handling, session management

6. **"Create tests for a real-time data dashboard that updates every 5 seconds."**
   - What they're testing: Dynamic content handling, timing synchronization, real-time data validation

7. **"Write a test that handles dynamic element IDs that change on every page load."**
   - What they're testing: Locator strategies, dynamic element handling, resilience

8. **"Create a solution for testing an application with inconsistent load times (2-30 seconds)."**
   - What they're testing: Wait strategies, timing issues, reliability

9. **"Write tests for an application that requires specific browser cookies or local storage state."**
   - What they're testing: Browser state management, cookie handling, local storage

### Category 3: API Testing

10. **"Write tests for a REST API that validate status codes, response schema, and data consistency across endpoints."**
    - What they're testing: API testing skills, validation strategies, data integrity

11. **"Test an OAuth 2.0 authentication flow including token refresh and expiration."**
    - What they're testing: OAuth understanding, token management, authentication flows

12. **"Validate API responses against a JSON schema and handle pagination."**
    - What they're testing: Schema validation, pagination handling, API testing patterns

### Category 4: Data-Driven Testing

13. **"Write parameterized tests that read test data from a CSV/JSON file and execute multiple scenarios."**
    - What they're testing: Data-driven testing, file reading, parameterization

14. **"Create a test that validates form validation with 50+ different input combinations."**
    - What they're testing: Combinatorial testing, data management, test design

### Category 5: Problem-Solving Under Constraints

15. **"Write a test that handles dynamic element IDs that change on every page load."**
    - What they're testing: Problem-solving, locator strategies, resilience

16. **"Create a solution for testing an application with inconsistent load times (2-30 seconds)."**
    - What they're testing: Wait strategies, reliability, timing handling

17. **"Write tests for an application that requires specific browser cookies or local storage state."**
    - What they're testing: Browser state, cookie management, setup requirements

### Category 6: Code Refactoring

18. **"Here's poorly written test code. Refactor it using design patterns and best practices."**
    - What they're testing: Code quality, refactoring skills, design patterns

19. **"Optimize this test suite that currently takes 45 minutes to run."**
    - What they're testing: Performance optimization, parallel execution, efficiency

### Category 7: Python-Specific Coding Problems (For Python Background)

20. **"Parse a log file and extract all error messages with their timestamps. Group them by error type."**
    - What they're testing: File I/O, regex, string manipulation, dictionary operations, log parsing

21. **"Validate a nested JSON API response against expected schema. Handle missing fields and null values gracefully."**
    - What they're testing: JSON parsing, dictionary navigation, error handling, data validation

22. **"Generate 1000 unique test user emails with specific domain patterns and validate their format."**
    - What they're testing: String manipulation, regex, data generation, validation logic

23. **"Read multiple test result files (CSV/JSON), merge them, and generate a summary report with pass/fail counts."**
    - What they're testing: File operations, data parsing, data aggregation, report generation

24. **"Parse test method names from a file and extract test parameters, categories, and priorities."**
    - What they're testing: String parsing, regex patterns, data extraction, list operations

25. **"Merge multiple configuration dictionaries with precedence rules (environment > test > default)."**
    - What they're testing: Dictionary operations, nested structures, merge logic, configuration management

26. **"Implement thread-safe collection of test results from parallel test workers using Python threading."**
    - What they're testing: Threading, concurrency, thread safety, synchronization, queue operations

27. **"Write a retry utility function with exponential backoff for flaky API calls."**
    - What they're testing: Function design, error handling, retry logic, time management, decorators

28. **"Extract and validate email addresses from a large text file containing test output."**
    - What they're testing: File I/O, regex, string operations, validation, memory efficiency

29. **"Flatten a nested dictionary structure to environment variable format (e.g., 'API_BASE_URL')."**
    - What they're testing: Dictionary traversal, recursion, string formatting, data transformation

30. **"Compare two test execution reports and identify differences in pass/fail status and execution times."**
    - What they're testing: File parsing, data comparison, dictionary operations, analysis logic

31. **"Filter and sort test results by execution time, showing only tests that took longer than threshold."**
    - What they're testing: List operations, filtering, sorting, data analysis, comprehension usage

32. **"Build a utility to deduplicate test data while preserving order and maintaining relationships."**
    - What they're testing: Set operations, list manipulation, data structures, deduplication logic

## Question Structures

- **Design questions** - "Design a framework...", "Build a framework...", "Create a framework..."
- **Implementation questions** - "Write a test that...", "Automate a flow that...", "Create tests for..."
- **Problem-solving questions** - "Write a test that handles...", "Create a solution for..."
- **Refactoring questions** - "Refactor this code...", "Optimize this test suite..."

## Follow-up Questions (Common Probing Patterns)

### After You Write Framework Code

- "Why did you choose this design pattern over alternatives?"
- "How would you handle 1000 test cases with this framework?"
- "What happens if the application changes its UI structure?"
- "How would you run these tests in parallel?"
- "How do you manage test data in a CI/CD pipeline?"
- "Can this framework support 10,000 tests?"

### After You Write Test Automation Logic

- "What happens if an element is not found? How do you handle it?"
- "How do you differentiate between a test failure and an automation issue?"
- "What's your retry strategy for flaky tests?"
- "How would you optimize test execution time?"
- "What's the difference between implicit and explicit waits in your framework?"

### After You Write API Tests

- "How do you handle API rate limiting?"
- "What's your strategy for testing APIs with authentication?"
- "How do you validate API responses for large datasets?"
- "How do you handle API versioning?"

### After You Write Data-Driven Tests

- "How do you ensure test data isolation?"
- "What's your approach to test data cleanup?"
- "How do you handle test data conflicts in parallel execution?"

### After You Refactor Code

- "How would you maintain this framework as the application evolves?"
- "What's your approach to test maintenance and updates?"
- "How do you handle deprecated locators?"
- "What design patterns did you apply and why?"

### After You Write Python Code

- "What's the time complexity of your solution? Can you optimize it?"
- "How would you handle this if the log file is 10GB instead of 10MB?"
- "What edge cases did you consider? (null values, empty files, malformed data)"
- "Why did you choose dictionary/list comprehension over loops?"
- "How would you make this function reusable across different test scenarios?"
- "What Python libraries would you use in production? (requests, pandas, etc.)"
- "How do you ensure thread safety in your concurrent solution?"
- "What's your approach to error handling for file operations?"
- "How would you test this utility function you just wrote?"
- "Can you explain the space complexity of your solution?"

### Real-World Scenario Probes

- "How would you test this feature in a production-like environment?"
- "What would you do if the test environment is down?"
- "How do you handle third-party integrations in tests?"
- "How do you ensure tests are reliable in CI/CD?"

## What Interviewers Probe For

1. **Design thinking** - Can you design scalable, maintainable frameworks?
2. **Problem-solving** - Can you handle real-world testing challenges?
3. **Code quality** - Do you write professional, maintainable code?
4. **Trade-off awareness** - Do you understand design decisions and alternatives?
5. **Scalability** - Can your solution handle large-scale scenarios?
6. **Communication** - Can you explain your decisions clearly?
7. **Time management** - Can you solve problems under time pressure?
8. **Best practices** - Do you follow industry standards and patterns?

## Latest Trends (2024-2025)

### CURRENT & CRITICAL

- **Playwright over Selenium** - For new projects (faster, better cross-browser support)
- **Python dominance** - In SDET roles (easier to learn, faster to write)
- **API-first testing** - Testing APIs before UI is ready
- **Cloud-based test execution** - BrowserStack, Sauce Labs integration
- **Shift-left testing** - Testing earlier in development cycle
- **Contract testing** - API contract validation between services
- **Python 3.10+ features** - Pattern matching, type hints, dataclasses in test code
- **Async/await patterns** - For concurrent test execution (asyncio, aiohttp)
- **Pytest fixtures and plugins** - Standard for Python test frameworks
- **Type hints** - Expected in professional Python test code

### EMERGING AREAS

- **AI-powered test generation** - Mentioned in interviews but not heavily tested yet
- **Playwright vs. Cypress comparison** - Growing discussion
- **BDD frameworks** - Cucumber, Behave (nice to mention)
- **Mobile automation** - Appium for native apps (specific roles)
- **Visual regression testing** - Growing adoption
- **Performance testing integration** - Combined with functional testing

## Outdated Information (Don't Spend Time Here)

- **UFT/QTP** - Marked as outdated - Legacy, rarely asked in 2025
- **Watir** - Marked as outdated - Outdated for new projects
- **Record-and-playback tools** - Marked as outdated - Considered anti-pattern
- **Manual test case documentation** - Marked as outdated - Replaced by automation
- **Selenium 3.x specifics** - Marked as outdated - Selenium 4.x is standard
- **Flash/Flex automation** - Marked as outdated - Deprecated technology

## Time Limits & Expectations

- **Typical coding round**: 60-90 minutes for 1-2 problems
- **Evaluation focus**: Maintainable, scalable test code (not just working code)
- **Communication**: Explain design decisions during coding
- **Time pressure**: Part of evaluation process

