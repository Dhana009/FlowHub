# Topic 9: Framework Tools Internals - What to Know

## What Exactly You Need to Know (Interview-Critical Only)

### TestNG Internals

1. **@Factory Annotation**
   - How it generates test instances dynamically
   - When to use vs @DataProvider
   - Performance implications with large datasets
   - Use case: 10,000+ test cases

2. **@DataProvider Annotation**
   - Return types (Object[][], Iterator)
   - Parameter passing mechanics
   - Scope (method vs class)
   - Lazy initialization behavior
   - Memory footprint with large datasets

3. **Execution Order**
   - Default ordering
   - @Test priority attribute
   - Dependency management with dependsOnMethods
   - Circular dependency handling
   - Annotation hierarchy: @BeforeSuite → @BeforeTest → @BeforeClass → @BeforeMethod → @Test → @AfterMethod → @AfterClass → @AfterTest → @AfterSuite

4. **Parallel Execution**
   - Modes: methods, tests, classes, instances
   - Thread safety implications
   - Resource contention scenarios
   - Database-dependent tests in parallel
   - Test data isolation

5. **Test Grouping**
   - Include/exclude groups
   - Group dependencies
   - Practical use cases in CI/CD pipelines
   - Conditional test execution

6. **Listeners and Reporters**
   - ITestListener interface
   - Custom reporting
   - Test result aggregation
   - Integration with CI/CD dashboards
   - Performance impact of multiple listeners

### Maven Internals

7. **Build Lifecycle Phases**
   - validate → compile → test → package → install → deploy
   - What happens at each phase
   - Skipping phases
   - Plugin binding to phases

8. **Properties and Profiles**
   - System properties vs project properties
   - Profile activation (OS, JDK, file existence, property values)
   - Environment-specific configurations
   - Dev/staging/prod profiles

9. **Dependency Management**
   - Transitive dependencies
   - Scope (compile, test, provided, runtime, system)
   - Version conflicts and resolution strategies
   - Exclusions
   - BOM (Bill of Materials) pattern

10. **POM Hierarchy**
    - Parent POM
    - Module aggregation
    - Inheritance vs composition
    - Version management strategies

11. **Environment Variables**
    - MAVEN_OPTS for JVM tuning
    - settings.xml configuration
    - Repository management
    - Credentials handling

12. **Plugin Execution**
    - Binding plugins to lifecycle phases
    - Plugin goals
    - Configuration inheritance
    - Plugin management vs dependency management
    - maven-surefire-plugin vs maven-failsafe-plugin

### Postman Internals

13. **Collections Structure**
    - Folder organization
    - Request inheritance
    - Pre-request scripts at collection level
    - Test scripts at collection level
    - Organizing large collections (200+ requests)

14. **Environments and Variables**
    - Global vs environment vs collection vs local variables
    - Variable scope and precedence
    - Dynamic variable generation
    - Preventing accidental prod testing

15. **Authentication Mechanisms**
    - Basic Auth (Base64 encoding)
    - Bearer tokens
    - OAuth 2.0 flow
    - API key headers
    - Certificate-based auth
    - Token refresh logic

16. **Pre-request Scripts**
    - Setting variables
    - Conditional logic
    - Timestamp generation
    - Request modification before sending

17. **Test Scripts**
    - Response validation
    - Assertion patterns
    - Extracting values for chaining requests
    - Error handling
    - Complex validations

18. **Advanced Features**
    - Custom headers
    - Request/response interceptors
    - VPN/proxy configuration
    - SSL certificate handling
    - Request timeout management
    - Collection sharing and versioning
    - Git integration

### Git Internals

19. **Staging Area Mechanics**
    - Working directory → staging → repository
    - git add behavior
    - Partial staging (git add -p)
    - Unstaging changes

20. **Revert vs Reset**
    - git revert (creates new commit)
    - git reset (moves HEAD)
    - Soft vs mixed vs hard reset
    - When to use each
    - Team environment considerations

21. **Stash Operations**
    - Saving work in progress
    - stash pop vs apply
    - Stash with untracked files
    - Stash branching

22. **Merge Conflict Resolution**
    - Conflict markers
    - Three-way merge
    - Merge strategies (recursive, resolve, ours, theirs)
    - Rebasing vs merging
    - Preventing conflicts

23. **.gitignore Patterns**
    - Negation patterns
    - Directory exclusion
    - Precedence rules
    - Global gitignore

24. **Branching Strategies**
    - Git Flow (develop, release, hotfix branches)
    - Trunk-based development
    - GitHub Flow
    - Feature branch naming conventions
    - Branch protection rules

25. **Rebase Mechanics**
    - Interactive rebase
    - Squashing commits
    - Rebase vs merge trade-offs
    - Force push implications
    - Shared branches considerations

## Core Concepts (What Interviewers Test)

- **TestNG**: @Factory vs @DataProvider, execution order, parallel execution, thread safety, listeners
- **Maven**: Build lifecycle, profiles, dependency resolution, POM hierarchy, plugin execution
- **Postman**: Collections, environments, variables, authentication, scripts, CI/CD integration
- **Git**: Staging, revert/reset, stash, merge conflicts, branching strategies, rebase

