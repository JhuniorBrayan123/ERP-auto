# Test Failure Reporting Enhancement Exploration

## Problem Statement
When tests fail in the ERP2 automation suite (e.g., 3 tests failing in logística or 87 cases for search by cad), users must manually enter each project to re-run failed tests. This process is tedious and error-prone when dealing with multiple failures.

## Current State Analysis

### Test Execution Infrastructure
1. **Interactive Test Runner** (`scripts/test-runner.ts`)
   - Provides menu-driven test execution
   - Supports running by project, folder, file, or specific tests
   - Uses `--grep` for filtering tests by title/tag
   - Handles setup skipping via environment variables

2. **Reporters** (`playwright.config.ts`)
   - Maven reporter (`src/utils/maven-reporter.ts`) - Console output with functional failure summaries
   - JSON reporter - Machine-readable results
   - JUnit reporter - CI/CD integration
   - HTML reporter - Detailed visual reports
   - Discord reporter (`src/utils/discord-reporter.ts`) - Notification summaries

3. **Failure Tracking** (Maven Reporter)
   - Collects `qaFailures` array with test details
   - Groups failures by category (AMBIENTE, DATOS, SCRIPT, DESCONOCIDO)
   - Prints functional failure summary at end of test run
   - Already captures: caseName, failedStep, userMessage, failureCategory

### User Workflow Pain Points
1. After test run, users see summary but no actionable re-execution commands
2. Must manually navigate test runner menus to re-run specific failed tests
3. No centralized list of failed tests with direct re-execution capability
4. Tag-based filtering requires manual input of each tag/grep pattern

## Opportunity Areas

### Enhancement 1: Failed Test Listing in Maven Reporter
Extend the Maven reporter to generate re-executable commands at the end of test runs:
- Collect detailed failed test information (title, file path, tags)
- Generate `npx playwright test` commands with appropriate `--grep` or file specifications
- Output commands that can be easily copied and executed

### Enhancement 2: Integrated Re-execution Menu Option
Add a menu option in the test runner:
- "Re-run failed tests from last execution"
- Automatically generates and runs appropriate test selection command
- Preserves context (project, environment, etc.)

### Enhancement 3: Persistent Failed Test State
Store failed test information between runs:
- Save failed test details to a JSON file
- Allow re-running failed tests across different sessions
- Include metadata (timestamp, environment, etc.)

## Technical Feasibility

### Data Availability
The Maven reporter already collects sufficient data:
```typescript
this.qaFailures.push({
    caseName: summary.caseName ?? test.title,
    failedStep: summary.failedStep,
    userMessage: summary.userMessage,
    failureCategory: category,
});
```

To generate re-executable commands, we need:
- Test title (already available)
- Test file path (available via `test` parameter)
- Test tags (available via `test.tags`)

### Implementation Approach
1. **Extend Maven Reporter**
   - Add collection of test file paths and tags for failed tests
   - Generate re-execution commands in `onEnd()` method
   - Output format: `npx playwright test --grep "test-title" --project=ProjectName`

2. **Test Runner Integration**
   - Add menu option to re-run last failed tests
   - Read from persistent state or last reporter output
   - Execute appropriate test selection command

3. **Persistence Layer** (Optional)
   - Save failed test details to `playwright/.auth/failed-tests.json`
   - Load and display in test runner menu
   - Clear after successful re-execution

## Benefits
1. **Time Savings**: Eliminate manual navigation for each failed test
2. **Accuracy**: Reduce errors in manual test selection
3. **Discoverability**: Make failed tests obvious and actionable
4. **Consistency**: Standardize re-execution process across team
5. **Integration**: Leverage existing infrastructure (reporters, test runner)

## Next Steps
1. Design detailed specification for failed test listing enhancement
2. Implement Maven reporter extension to generate re-execution commands
3. Test with various failure scenarios (single/multiple failures, different projects)
4. Gather feedback from QA team on usability
5. Consider advanced features like persistent state and integrated re-execution menu

## Files to Modify
1. `src/utils/maven-reporter.ts` - Primary enhancement location
2. Potentially `scripts/test-runner.ts` - For integrated re-execution option
3. Documentation updates in AGENTS.md if needed

## Dependencies
- None - builds on existing reporter and test runner infrastructure
- Compatible with all existing reporters and configurations