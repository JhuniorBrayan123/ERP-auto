# Tasks: Mejorar setup para cambio de cuenta

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~25 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | exception-ok (single file, trivial) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Foundation — Types & Internal Functions

- [x] 1.1 Rename `detectEnvironment()` → `detectEnvironmentGroup()` normalizing crt/crt-2/crt-3/crt-4 → `"crt-group"`, prd → `"prd"` in `src/utils/setup-state.ts`
- [x] 1.2 Add `detectAccount()` reading `USER_EMAIL`, normalizing empty/missing → `"unknown"` in `src/utils/setup-state.ts`
- [x] 1.3 Add optional `account?: string` field to `SetupState` interface in `src/utils/setup-state.ts`

## Phase 2: Core Logic — Integration

- [x] 2.1 Add account-mismatch check in `shouldSkipSetup()` after env-group check, before completed check in `src/utils/setup-state.ts`
- [x] 2.2 Update `markSetupComplete()` to persist `account` from `detectAccount()` in `src/utils/setup-state.ts`
- [x] 2.3 Update `defaultState()` and `getSetupStateSummary()` to include account field in `src/utils/setup-state.ts`
- [x] 2.4 Update `areAllSetupsComplete()` to check account match in `src/utils/setup-state.ts`

## Phase 3: Verification

- [x] 3.1 Run `npx tsc --noEmit` — confirm zero type errors
- [x] 3.2 Run existing setup tests or manual verify by running setups with different APP_ENV/USER_EMAIL combos
