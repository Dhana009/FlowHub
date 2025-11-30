# Real SDET Interview Questions Analysis

## Questions Source
Actual interview questions shared by candidates (3-8 years exp range)

## Question Categories & Patterns

### CATEGORY 1: Testing Fundamentals
**Questions:**
- Smoke, Sanity, Regression Testing (why we need them)
- Testing concepts (payment API scenarios, root cause analysis)

**Pattern:** Not just definitions - they want understanding of WHEN and WHY

---

### CATEGORY 2: Selenium WebDriver (Deep Technical)
**Questions:**
- Locators (types, XPath vs CSS, when to use)
- XPath axes (parent/child/node)
- Stale Element Exception (why, how to handle)
- JavaScript Executors (when to use)
- Browser notifications handling
- Invalid Certificate Exception
- Captcha validation (if possible)
- Dropdown value extraction and reuse

**Pattern:** Deep understanding of Selenium internals, not just basic usage

---

### CATEGORY 3: API Testing (Comprehensive)
**Questions:**
- HTTP request components
- HTTP response structure
- API vs Unit testing
- REST, SOAP, GraphQL
- 3-tier architecture
- Server-side validation
- Standalone vs 3rd-party API testing
- Postman: Collections, environments, variables, validation, auth, VPN handling

**Pattern:** End-to-end API knowledge, not just basic REST calls

---

### CATEGORY 4: Real-World Scenarios (Critical Pattern)
**Questions:**
1. **Payment API:** Amount debited but status pending
   - Root cause possibilities
   - 5+ test scenarios

2. **API Returns 200 but wrong data:**
   - Identify: UI caching vs backend caching vs stale data vs 3rd-party dependency

3. **Async Notifications:**
   - Negative + edge test cases for notification count

4. **Dynamic Dropdown:**
   - Synchronize automation after 2 API responses (no sleeps)

5. **Flight Booking Funnel:**
   - E2E automation strategy
   - Test data design

**Pattern:** Real-world problem-solving, not theoretical knowledge

---

### CATEGORY 5: Framework & Tools
**Questions:**
- TestNG: Execution order, @Factory vs @Dataprovider, XML parameters
- Maven: Environment variables, properties override
- Cucumber: Authentication handling
- Git: Stages, revert, stash, .gitignore

**Pattern:** Practical tool usage, not just "what is"

---

### CATEGORY 6: OOP & Programming
**Questions:**
- Method overloading (example from Selenium)
- Interface usage in framework
- Static methods in interface
- Changing interface variable values

**Pattern:** OOP applied to test automation context

---

### CATEGORY 7: CI/CD & Infrastructure
**Questions:**
- What happens when CI/CD jobs stop mid-execution?
- Managing pipeline when high-priority scenarios fail
- HTTPS, SSL, TLS differences

**Pattern:** Real-world CI/CD problem-solving

---

### CATEGORY 8: Coding Challenges
**Questions:**
- String manipulation: Find first/last occurrence with index
- SQL: Default join type

**Pattern:** Basic coding skills, not LeetCode hard

---

## Key Insights from Real Questions

### 1. **Scenario-Based Questions Dominate**
- Not "What is X?"
- But "How do you handle X scenario?"
- Real-world problem-solving

### 2. **Deep Technical Knowledge Required**
- Not just tool usage
- Understanding internals (Stale Element, XPath axes, HTTP components)

### 3. **System Thinking Critical**
- Payment API: Root cause analysis
- API 200 but wrong data: Multiple possibilities to investigate
- Async operations: Synchronization challenges

### 4. **Practical Framework Knowledge**
- TestNG execution order
- Maven configuration
- Real framework patterns (interfaces, method overloading)

### 5. **End-to-End Understanding**
- Flight booking funnel: Complete E2E strategy
- Test data design
- Automation strategy

---

## Missing from Our Original Research Plan

### Critical Gaps Identified:
1. **Real-World Scenario Questions** - Need to add this as separate category
2. **Root Cause Analysis** - Debugging mindset
3. **Test Data Design** - Not just management, but design strategy
4. **E2E Automation Strategy** - Complete test strategy thinking
5. **Tool-Specific Deep Dives** - TestNG, Maven, Postman internals
6. **Selenium Internals** - Stale Element, XPath axes, JS Executors
7. **Async/Synchronization** - Handling dynamic elements, multiple API responses

---

## Questions to Validate with Perplexity

1. Are these question patterns accurate for SDET interviews?
2. What's the depth expected for scenario-based questions?
3. How to prepare for real-world problem-solving questions?
4. What's the importance of tool internals (Selenium, TestNG, Maven)?
5. How to approach root cause analysis questions?

