# Topic 9: Framework Tools Internals - Success Criteria

## If You Can Do These, You're Interview-Ready

### TestNG Mastery

- ✅ Explain why @Factory is better than @DataProvider for 10,000 test cases
- ✅ Describe execution order with 5+ annotations
- ✅ Design parallel execution strategy for database-dependent tests
- ✅ Handle 5,000 test cases in parallel without conflicts
- ✅ Explain difference between @Factory and @DataProvider
- ✅ Handle test dependencies in TestNG
- ✅ Design TestNG listener for screenshots on failure
- ✅ Explain thread safety concerns with @DataProvider and shared resources
- ✅ Skip tests conditionally based on environment variables
- ✅ Differentiate between flaky test and genuinely broken test
- ✅ Implement conditional retries with IRetryAnalyzer
- ✅ Optimize performance impact of multiple listeners

### Maven Mastery

- ✅ Configure profiles for dev/staging/prod
- ✅ Resolve transitive dependency conflicts
- ✅ Explain why test fails in CI but passes locally (environment variable issue)
- ✅ Configure Maven to run only smoke tests in CI and full regression locally
- ✅ Explain Maven's dependency resolution strategy
- ✅ Use Maven profiles for different environments
- ✅ Explain difference between plugin management and dependency management
- ✅ Exclude transitive dependencies when needed
- ✅ Explain Maven build lifecycle phases
- ✅ Configure MAVEN_OPTS for performance tuning in CI
- ✅ Handle circular dependencies between modules
- ✅ Ensure reproducible builds

### Postman Mastery

- ✅ Build collection with token refresh logic (every 30 minutes)
- ✅ Chain requests using response data
- ✅ Set up environment-specific configurations
- ✅ Handle SSL certificate errors
- ✅ Design collection structure for microservices architecture
- ✅ Explain difference between global, environment, collection, and local variables
- ✅ Write pre-request script that generates timestamp for every request
- ✅ Design test script that validates response status, headers, and body structure
- ✅ Organize large Postman collection (200+ requests)
- ✅ Prevent accidental prod testing
- ✅ Handle flaky API tests with retries and timeouts
- ✅ Integrate Newman with CI/CD reporting

### Git Mastery

- ✅ Resolve complex merge conflict with multiple branches
- ✅ Explain when to rebase vs merge
- ✅ Recover lost commits using reflog
- ✅ Design branching strategy for a team
- ✅ Walk through resolving merge conflict in shared feature branch
- ✅ Explain when to use git revert vs git reset in team environment
- ✅ Handle PR with 50 commits (squash vs preserve history)
- ✅ Find culprit in 10,000 commits using git bisect
- ✅ Prevent secrets in Git history
- ✅ Scale Git for 500 developers (monorepo vs polyrepo)
- ✅ Explain Git Flow vs trunk-based development trade-offs
- ✅ Handle rebase on shared branches safely

### Integration Mastery

- ✅ Design complete test automation framework using all four tools
- ✅ Explain how TestNG, Maven, Postman, and Git interact in CI/CD pipeline
- ✅ Integrate TestNG reports with CI/CD dashboards
- ✅ Configure Maven for artifact repositories (Nexus vs Artifactory)
- ✅ Integrate Postman collections with CI/CD (Newman)
- ✅ Design Git workflow for test automation team

## Readiness Indicators

**You're ready if you can:**
1. Explain @Factory vs @DataProvider for large-scale testing
2. Configure Maven profiles and resolve dependency conflicts
3. Design Postman collections with token refresh and environment management
4. Resolve Git merge conflicts and design branching strategies
5. Integrate all tools in a CI/CD pipeline
6. Handle parallel execution with thread safety
7. Optimize builds and test execution
8. Design scalable test automation frameworks
9. Handle real-world scenarios (CI vs local failures, token refresh, merge conflicts)
10. Explain trade-offs and best practices

