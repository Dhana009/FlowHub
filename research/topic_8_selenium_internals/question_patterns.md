# Topic 8: Selenium Internals & Advanced Concepts - Question Patterns

## Question Types Asked (Actual SDET Interview Questions)

### Scenario-Based Questions (Most Common)

1. **"You have a test that works 90% of the time but randomly fails with StaleElementReferenceException. The element is in a table that refreshes every 5 seconds. How would you fix this?"**
   - What they're testing: Root cause analysis, retry logic, understanding of DOM mutations

2. **"Your XPath locator `//button[contains(text(), 'Submit')]` breaks when the button text changes. How would you make it more resilient?"**
   - What they're testing: Locator strategy, XPath axes knowledge, maintainability thinking

3. **"An element is visible but Selenium's click() fails. JavaScript click works. Why might this happen?"**
   - What they're testing: Understanding of event handling, DOM interactions, JavaScript executor knowledge

4. **"How would you locate an element inside a shadow DOM without using JavaScript executor?"**
   - What they're testing: Selenium 4 features, shadow DOM knowledge, modern web app handling

5. **"Your test needs to accept a geolocation prompt before proceeding. How would you handle this?"**
   - What they're testing: Browser capabilities, permission handling, configuration knowledge

### Root Cause Questions

6. **"What causes Stale Element Exception? Give me specific scenarios."**
7. **"Why does an element become stale in a React application?"**
8. **"What's the difference between element not found and stale element exception?"**

### Handling Strategy Questions

9. **"How would you handle elements that appear/disappear based on API responses?"**
10. **"What's your approach to handling dynamic IDs that change on every page load?"**
11. **"How do you synchronize automation when a dropdown is rendered only after two API responses arrive?"**

## Question Structures

- **Scenario-based questions** - "You have a test that...", "An element is..."
- **Root cause questions** - "What causes...", "Why does..."
- **How-to questions** - "How would you...", "What's your approach..."
- **Comparison questions** - "What's the difference between...", "When would you use..."

## Follow-up Questions (Common Probing Patterns)

### After You Answer About Stale Element Exception

- "How would you handle SEE in a table where rows are dynamically added?"
- "What's the difference between SEE in a static page vs. a SPA?"
- "Can you prevent SEE entirely, or only handle it?"
- "How does implicit wait affect SEE occurrence?"

### After You Answer About XPath

- "Write an XPath to find a button inside a modal that appears after clicking another button"
- "How would you locate an element when its ID changes on every page load?"
- "Can you use XPath axes to make your locators more maintainable?"

### After You Answer About JavaScript Executor

- "When would you use JavaScript executor instead of Selenium's native methods?"
- "What's the difference between `execute_script()` and `execute_async_script()`?"
- "How do you handle JavaScript errors during execution?"
- "Can you access browser console logs from your test?"

### After You Answer About Browser Handling

- "How would you automate a test that requires accepting a geolocation prompt?"
- "What's the difference between handling browser alerts vs. OS-level dialogs?"
- "Can you pre-configure browser permissions in your test setup?"

### After You Answer About Certificates

- "How would you handle a staging environment with a self-signed certificate?"
- "What's the difference between `acceptInsecureCerts` and `acceptSslCerts`?"
- "How do you ensure your tests work across environments with different certificate configurations?"

### After You Answer About Advanced Locators

- "How would you locate an element inside a shadow DOM?"
- "What's a relative locator and when would you use it?"
- "How do you make your locators resilient to UI changes?"

### After You Answer About DOM Interactions

- "Why might a JavaScript click work when Selenium's click() fails?"
- "How do you handle elements that require focus before interaction?"
- "What's the difference between clicking an element and triggering its click event?"

## What Interviewers Probe For

1. **Deep understanding** - Not just "what" but "why" and "when"
2. **Root cause analysis** - Can you explain why things fail?
3. **Practical problem-solving** - Can you handle real-world scenarios?
4. **Modern web app knowledge** - Can you handle React, Angular, shadow DOM?
5. **Judgment** - Do you know when to use what approach?
6. **Trade-off awareness** - Do you understand performance/maintainability trade-offs?

## Latest Trends (2024-2025)

### CURRENT & CRITICAL

- **Shadow DOM & Selenium 4 features** - Modern web applications use Web Components
- **Relative locators** - Selenium 4+ feature for resilient locators
- **BiDi (Bidirectional) protocol** - Modern Selenium architecture
- **Modern web frameworks** - React, Vue, Angular handling
- **Event-driven synchronization** - Beyond basic waits

### EMERGING AREAS

- **Playwright migration** - Some companies moving from Selenium
- **Component testing** - Testing individual components

## Outdated Information (Still Asked But Less Common)

- **Selenium IDE record-playback** - Marked as outdated - Code-based frameworks now standard
- **Basic CSS/XPath only** - Marked as outdated - Need advanced locator strategies
- **Hardcoded waits (Thread.sleep)** - Marked as outdated - Proper synchronization required
- **Ignoring browser capabilities** - Marked as outdated - Configuration is critical
- **Single browser focus** - Marked as outdated - Cross-browser is standard

