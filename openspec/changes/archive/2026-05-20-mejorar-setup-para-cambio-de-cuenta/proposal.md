# Proposal: Mejorar setup para cambio de cuenta

## Intent

Setup-state tracks only `APP_ENV`, not user identity. When `USER_EMAIL` changes but `APP_ENV` stays the same (e.g., another QA takes over, testing with different account), `shouldSkipSetup()` returns `true` — setups are skipped but dynamic items from the previous account's tenant don't exist. Tests fail with confusing errors.

## Scope

### In Scope
1. Add `account` field to `SetupState` in `setup-state.ts`
2. In `shouldSkipSetup()`, check `USER_EMAIL` change → invalidate
3. In `markSetupComplete()`, save current `USER_EMAIL`
4. Group CRT environments (`crt`, `crt-2`, `crt-3`, `crt-4`) so they don't invalidate each other

### Out of Scope
- PRD item existence verification (deferred — explore recommended combo approach)
- Module-level JSON reloading in helpers
- Hardcoded RUN_ID collision in PRD JSON

## Capabilities

### New Capabilities
- `account-aware-setup-state`: Track user identity in setup persistence so account changes trigger re-execution

### Modified Capabilities
None — pure internal refactor, no spec-level behavior changes.

## Approach

1. Extend `SetupState` interface: add `account?: string`
2. New `detectAccount()` function reads `process.env.USER_EMAIL`
3. Environment grouping: normalize `crt`, `crt-2`, `crt-3`, `crt-4` → `crt-group` in `detectEnvironment()` (PRD stays isolated)
4. In `shouldSkipSetup()`: after env check, compare `state.account` to `detectAccount()` — if mismatch, return `false` (no skip)
5. In `markSetupComplete()`: persist `detectAccount()` alongside environment
6. State changes propagate automatically — no migration needed (old state without `account` field triggers fresh setup)

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/utils/setup-state.ts` | Modified | Extend `SetupState`, `detectEnvironment()`, `shouldSkipSetup()`, `markSetupComplete()` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `USER_EMAIL` not set at setup-state eval time | Low | `detectAccount()` returns `'unknown'` — accounts won't match, but setup runs (safe) |
| CRT group normalization breaks isolated tenant needs | Low | PRD is the only isolated env; all CRT sub-envs share same DB/tenant |

## Rollback Plan

Revert changes to `src/utils/setup-state.ts` — everything else stays. Old `setup-state.json` without `account` field is fully backward compatible.

## Dependencies

- None

## Success Criteria

- [ ] Changing `USER_EMAIL` with same `APP_ENV` triggers setup re-execution
- [ ] Same `USER_EMAIL` + same `APP_ENV` reuses cached state (no re-execution)
- [ ] Switching between `crt`, `crt-2`, `crt-3`, `crt-4` with same email does NOT re-execute
- [ ] Switching `prd` ↔ any CRT re-executes regardless of email
- [ ] Existing state without `account` field causes fresh setup (not crash)
