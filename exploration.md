## Exploration: mira ahora sabes que tambien podemos mejorar cuando por ejemplo fallo 3 test de un ejemplo logsitca lo 87 casos para la busqueda por cad fallo tenemos que entrar a cada proyecto eso es fastidioso un plan que se estaba planeando era que cuando fallaba ciertos test estos al final despues de todo el resumen podria listarse listas para volver a ejecutar

### Current State
The erpperu2-automation codebase already has sophisticated test failure reporting through a custom Maven-style reporter (`src/utils/maven-reporter.ts`) that collects detailed failure information including functional metadata with categorization (AMBIENTE, DATOS, SCRIPT, DESCONOCIDO). The test runner (`scripts/test-runner.ts`) provides an interactive menu-driven interface for running tests by project, file, or specific tests using `--grep` filters. However, while the Maven reporter displays failure details, it doesn't provide actionable re-execution commands - users must manually navigate the test runner to re-run each failed test, which becomes tedious when multiple tests fail (e.g., 3 tests in logística or 87 cases for search by cad).

### Affected Areas
- `src/utils/maven-reporter.ts` — Primary reporter that needs extension to generate re-execution commands
- `scripts/test-runner.ts` — Test execution interface that could integrate failed test re-execution
- `src/utils/functional-error.ts` — Supports failure categorization that informs re-execution strategies
- `playwright.config.ts` — Configures reporters (though no changes needed here)

### Approaches

1. **Extend Maven Reporter with Re-execution Commands** — Modify the Maven reporter to collect file paths and tags for failed tests, then generate copy-pasteable re-execution commands in the `onEnd()` method
   - Pros: Leverages existing infrastructure, provides immediate actionable feedback, zero learning curve for users, works with current test runner
   - Cons: Commands need to be manually copied (though they're copy-paste ready)
   - Effort: Medium

2. **Add "Re-run Failed Tests" Menu Option to Test Runner** — Add a dedicated menu option that automatically re-runs all tests that failed in the last execution
   - Pros: One-click re-execution, fully automated, integrates naturally with existing workflow
   - Cons: Requires persisting failed test state between runs, more complex implementation
   - Effort: High

3. **Hybrid Approach: Generate Commands + Test Runner Integration** — Both extend the reporter to generate commands AND add a test runner option to execute those commands
   - Pros: Best of both worlds - immediate feedback plus optional automation
   - Cons: More complex than either approach alone
   - Effort: High

### Recommendation
**Extend Maven Reporter with Re-execution Commands** is the recommended approach because:
1. It provides immediate value with moderate implementation effort
2. The data needed (test title, file path, tags) is already available in the `onTestEnd` hook
3. It leverages the existing test runner's `--grep` functionality perfectly
4. Users can simply copy and paste the generated commands
5. It maintains backward compatibility and doesn't change existing workflows
6. It can be enhanced later with test runner integration if needed

### Risks
- **Command Length Limitations**: Generated commands might exceed shell limits if many tests fail (mitigate by grouping similar tests or providing summary)
- **Tag Escaping Issues**: Special characters in test titles might break `--grep` patterns (mitigate by using existing `escapeGrep` function from test runner)
- **Environment Variable Drift**: Generated commands might not reflect current SKIP_* environment variables (mitigate by documenting that users should check current setup state)

### Ready for Proposal
Yes - The exploration confirms the request is feasible, identifies the specific files to modify, and recommends a concrete approach that leverages existing infrastructure. The orchestrator should proceed to proposal phase.