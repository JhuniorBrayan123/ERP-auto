# Design: Mejorar setup para cambio de cuenta

## Technical Approach

Add account-awareness to `setup-state.ts` and group CRT environments so switching accounts or CRT sub-envs triggers proper setup re-execution without unnecessary full reruns.

## Architecture Decisions

### Decision: Environment Grouping

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep raw env + separate group field | More fields, clearer but more state | Reject |
| Normalize in `detectEnvironment()` | Single field, backward compat via mismatch | **Accept** — old `"crt"` vs new `"crt-group"` naturally invalidates |

### Decision: Account Tracking

| Option | Tradeoff | Decision |
|--------|----------|----------|
| New `account` field in `SetupState` | Simple, optional field | **Accept** |
| Hash `USER_EMAIL` | More secure but unnecessary for dev tooling | Reject |

### Decision: Account Check Order

**Choice**: Account check after env-group check, before completed check.
**Rationale**: Env change is a stronger invalidation signal (different tenant). Account change within same env is next. Completed status is last.

## Data Flow

```
shouldSkipSetup("punto-venta-items"):
  ├─ SKIP env var set? → skip (exit early)
  ├─ load setup-state.json
  ├─ entry exists? → No → run setup
  ├─ environment group changed?
  │   └─ Yes → run setup
  ├─ account changed? (USER_EMAIL mismatch)
  │   └─ Yes → run setup
  ├─ entry.completed === true? → skip
  └─ default → run setup
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/utils/setup-state.ts` | Modify | Extend SetupState, add detectAccount/detectEnvironmentGroup, update shouldSkip/markComplete |

## Interfaces / Contracts

```typescript
export interface SetupState {
    environment: string;           // "crt-group" | "prd" (was raw APP_ENV)
    account?: string;              // NEW
    setups: Record<string, SetupEntry>;
}
```

New internals:
```typescript
function detectEnvironmentGroup(): string {
    const env = (process.env.APP_ENV ?? '').trim().toLowerCase();
    return env === 'prd' ? 'prd' : 'crt-group';
}

function detectAccount(): string {
    return (process.env.USER_EMAIL ?? '').trim().toLowerCase() || 'unknown';
}
```

Backward compatibility: old state without `account` → `state.account` is `undefined` → `detectAccount()` returns a string → mismatch → fresh setup. No migration needed.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `detectEnvironmentGroup()` with various APP_ENV | Assert crt/crt-2/crt-3/crt-4 → `"crt-group"`, prd → `"prd"`, empty → `"crt-group"` |
| Unit | `detectAccount()` with/without USER_EMAIL | Assert email normalized, empty → `"unknown"` |
| Unit | `shouldSkipSetup()` account mismatch | Mock USER_EMAIL change → returns false |
| Unit | `shouldSkipSetup()` env group match | Mock crt-2→crt-3 → same group → doesn't invalidate |
| Unit | Old state without `account` | Missing field → no skip (runs setup) |

## Migration / Rollout

No migration required. First run after deploy reads old `setup-state.json` — `account` is `undefined` → mismatch → setups re-execute. On completion, saves new format.

## Open Questions

None.
