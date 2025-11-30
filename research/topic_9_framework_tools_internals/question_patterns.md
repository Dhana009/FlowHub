# Topic 9: Framework Tools Internals - Question Patterns

## Question Types Asked (Actual SDET Interview Questions)

### TestNG-Specific Questions

1. **"You have 5,000 test cases. Some depend on database state. How do you structure TestNG to run them efficiently in parallel without conflicts?"**
   - What they're testing: Parallel execution, thread safety, resource isolation

2. **"Explain the difference between @Factory and @DataProvider. When would you use each?"**
   - What they're testing: Understanding of parameterization strategies, performance implications

3. **"A test passes when run individually but fails in parallel execution. What's likely happening?"**
   - What they're testing: Thread safety, shared resource issues, synchronization

4. **"How do you handle test dependencies in TestNG? What are the risks?"**
   - What they're testing: dependsOnMethods, circular dependencies, test organization

5. **"Design a TestNG listener to capture screenshots on failure and send them to a reporting tool."**
   - What they're testing: ITestListener interface, custom reporting, integration

6. **"What's the execution order of TestNG annotations? Draw it out."**
   - What they're testing: Annotation hierarchy, lifecycle understanding

7. **"How do you skip tests conditionally based on environment variables in TestNG?"**
   - What they're testing: Conditional execution, environment awareness

8. **"Explain thread safety concerns when using @DataProvider with shared resources."**
   - What they're testing: Concurrency, resource management, test isolation

### Maven-Specific Questions

9. **"How do you configure Maven to run only smoke tests in CI and full regression locally?"**
   - What they're testing: Profiles, test groups, CI/CD integration

10. **"Explain Maven's dependency resolution strategy. What happens with version conflicts?"**
    - What they're testing: Dependency management, conflict resolution, transitive dependencies

11. **"How do you use Maven profiles for different environments? Show the structure."**
    - What they're testing: Profile configuration, environment-specific builds

12. **"What's the difference between plugin management and dependency management in POM?"**
    - What they're testing: POM hierarchy, plugin vs dependency concepts

13. **"A test passes locally but fails in CI. The only difference is Maven version. Why?"**
    - What they're testing: Version compatibility, build reproducibility, environment differences

14. **"How do you exclude transitive dependencies? When would you do this?"**
    - What they're testing: Dependency exclusions, conflict resolution strategies

15. **"Explain the Maven build lifecycle. What happens at each phase?"**
    - What they're testing: Lifecycle phases, plugin binding, build understanding

16. **"How do you configure MAVEN_OPTS for performance tuning in CI?"**
    - What they're testing: JVM tuning, build optimization, CI configuration

### Postman-Specific Questions

17. **"Design a Postman collection to test an API that requires token refresh every 30 minutes."**
    - What they're testing: Pre-request scripts, token management, automation logic

18. **"How do you handle environment-specific configurations in Postman?"**
    - What they're testing: Environments, variables, configuration management

19. **"Explain the difference between global variables, environment variables, and collection variables."**
    - What they're testing: Variable scoping, precedence, best practices

20. **"Write a pre-request script that generates a timestamp and includes it in every request."**
    - What they're testing: Pre-request scripting, dynamic variables, JavaScript knowledge

21. **"How do you chain requests in Postman? Show an example where request B depends on response from request A."**
    - What they're testing: Request chaining, response extraction, test scripts

22. **"How do you handle SSL certificate errors in Postman?"**
    - What they're testing: Certificate handling, SSL configuration, security

23. **"Design a test script that validates response status, headers, and body structure."**
    - What they're testing: Assertions, validation patterns, test scripting

24. **"How do you organize a large Postman collection for a microservices architecture?"**
    - What they're testing: Collection organization, scalability, architecture thinking

### Git-Specific Questions

25. **"Walk me through resolving a merge conflict in a shared feature branch."**
    - What they're testing: Conflict resolution, merge strategies, collaboration

26. **"Explain when you'd use git revert vs git reset in a team environment."**
    - What they're testing: History management, team safety, revert vs reset

27. **"Design a branching strategy for a team of 20 developers working on multiple features."**
    - What they're testing: Branching strategies, Git Flow, trunk-based development

28. **"How do you recover a commit that was accidentally reset?"**
    - What they're testing: reflog, history recovery, Git internals

## Question Structures

- **Scenario-based questions** - "You have 5,000 test cases...", "A test passes locally but..."
- **Comparison questions** - "What's the difference between...", "When would you use..."
- **Design questions** - "Design a...", "How would you organize..."
- **Explanation questions** - "Explain...", "Walk me through..."

## Follow-up Questions (Common Probing Patterns)

### After You Answer About TestNG

- "How do you differentiate between a flaky test and a genuinely broken test? What's your strategy?"
- "Can you retry only specific exceptions? How would you implement conditional retries?"
- "What's the performance impact of adding multiple listeners? How do you optimize?"
- "How do you handle test dependencies in parallel execution? What breaks?"
- "TestNG allows ordering, but should you use it? When is it anti-pattern?"
- "You mentioned parallel=true, but what about thread safety in your test data? How do you isolate?"
- "TestNG generates HTML reports, but how do you integrate with CI/CD dashboards? What's missing?"
- "How do you handle large datasets? What's the memory footprint? Should you use external data sources instead?"
- "When would you choose @Parameters over @DataProvider? Trade-offs?"

### After You Answer About Maven

- "How do you handle transitive dependency conflicts? What's your resolution strategy?"
- "You said 'test' scope, but what about 'provided'? When does it matter in automation?"
- "Excluding dependencies is a code smell. What's the real problem you're solving?"
- "Your build takes 5 minutes. How do you optimize? Parallel builds? Incremental compilation?"
- "You're using maven-surefire-plugin, but have you benchmarked against maven-failsafe-plugin for integration tests?"
- "How do you handle circular dependencies between modules? What's your module structure philosophy?"
- "You hardcoded versions in child POMs. Why not use properties or BOM?"
- "Maven works locally, but how do you handle artifact repositories in enterprise? Nexus vs Artifactory trade-offs?"
- "Your build works today but fails in 6 months. How do you ensure reproducibility?"

### After You Answer About Postman

- "You're using JavaScript in Postman, but when should you move to RestAssured/Python? Why?"
- "Postman's test assertions are limited. How do you handle complex validations?"
- "You have 200 requests in one collection. How do you organize? Folders? Tags? What's scalable?"
- "You have dev, staging, prod environments. How do you prevent accidental prod testing?"
- "Global vs collection vs environment variables—when do you use each? What's the gotcha?"
- "Newman runs your Postman collection in CI, but how do you handle flaky API tests? Retries? Timeouts?"
- "Newman generates JSON reports. How do you visualize this for stakeholders?"
- "Postman tests APIs functionally, but what about performance? When do you switch to JMeter/Gatling?"
- "You assert response < 500ms, but is that realistic? How do you set baselines?"

### After You Answer About Git

- "Git Flow has many branches. Isn't this overhead? When do you use trunk-based development instead?"
- "You resolved a conflict, but how do you prevent them? Code review process?"
- "Rebase rewrites history. When is this dangerous? How do you handle shared branches?"
- "Your PR has 50 commits. Should you squash? When do you preserve history?"
- "How do you enforce code review before merge? What's your approval threshold?"
- "You have 10,000 commits. How do you find the culprit? git bisect? git blame limitations?"
- "Your commits say 'fix bug'. How do you enforce meaningful messages? Conventional commits?"
- "You have 500 developers. How do you scale Git? Monorepo vs polyrepo? GitHub vs GitLab vs Gitea?"
- "How do you prevent secrets in Git history? Pre-commit hooks? git-secrets?"

## What Interviewers Probe For

1. **Deep understanding** - Not just "what" but "why" and "when"
2. **Real-world scenarios** - Can you handle actual problems?
3. **Trade-off awareness** - Do you understand performance/maintainability trade-offs?
4. **Integration thinking** - Can you connect tools in CI/CD?
5. **Scalability** - Can you handle large-scale scenarios?
6. **Best practices** - Do you know when to use what approach?

## Latest Trends (2024-2025)

### TestNG Trends

**CURRENT & CRITICAL:**
- Integration with Allure, ReportPortal, cloud dashboards (not just HTML reports)
- Smart scheduling, test impact analysis, ML-based optimization (beyond basic parallelism)
- Built-in flaky test detection, AI-driven retry policies (beyond manual IRetryAnalyzer)
- Hierarchical test organization, test suites as code (beyond flat structure)
- Native CI/CD pipeline integration, GitOps workflows (beyond standalone execution)

**Key Shift**: TestNG moving from isolated test execution to integrated observability platforms. Interviewers ask: "How do you correlate test failures with application metrics?"

### Maven Trends

**CURRENT & CRITICAL:**
- Parallel builds, incremental compilation, 2-3 minutes (not 10+ minutes sequential)
- Bill of Materials (BOM), dependency locking, supply chain security (beyond manual version management)
- Shift to build tools (Gradle, Bazel) for complex projects (Maven seen as legacy for new projects)
- Locked dependencies, reproducible builds, SBOM generation (beyond snapshot versions)
- Cloud-native registries (Artifactory Cloud, GitHub Packages) (beyond local repositories)

**Key Shift**: Maven seen as legacy for new projects. Interviewers ask: "Why Maven over Gradle? What's your migration strategy?"

### Postman Trends

**CURRENT & CRITICAL:**
- Move to code-based frameworks (RestAssured, Playwright API) (beyond JavaScript in Postman)
- OpenAPI/Swagger-first approach, auto-generated docs (beyond manual documentation)
- API governance, contract testing, API versioning (beyond shared collections)
- Integration with k6, Grafana, dedicated load testing tools (beyond functional testing)
- OAuth 2.0 flows, API security scanning, OWASP compliance (beyond basic auth/token testing)

**Key Shift**: Postman shifting from test automation to API governance. Interviewers ask: "How do you ensure API contract compliance? Have you heard of Pact or Spring Cloud Contract?"

### Git Trends

**CURRENT & CRITICAL:**
- Trunk-based development, GitHub Flow (simpler) (beyond complex Git Flow)
- Conventional commits, semantic versioning (beyond "fix bug" messages)
- Monorepo strategies, polyrepo trade-offs (beyond single repo)
- GitOps workflows, infrastructure as code (beyond basic branching)
- Security scanning, secret detection (beyond manual prevention)

**Key Shift**: Git moving from complex branching to simpler workflows. Interviewers ask: "Why trunk-based over Git Flow? How do you scale?"

## Outdated Information (Still Asked But Less Common)

- **TestNG HTML reports only** - Marked as outdated - Integration with observability platforms now standard
- **Maven sequential builds** - Marked as outdated - Parallel builds required
- **Postman as primary API testing tool** - Marked as outdated - Code-based frameworks preferred
- **Complex Git Flow** - Marked as outdated - Simpler workflows (trunk-based, GitHub Flow) preferred
- **Manual dependency management** - Marked as outdated - BOM and dependency locking standard

