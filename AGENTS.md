# AGENTS.md — erpperu2-automation

## Commands

| Command | Use |
|---------|-----|
| `npm run test:menu` | Interactive test runner (flechas + enter) |
| `npx playwright test --ui` | Playwright UI mode |
| `npx playwright test --grep "@MS-1"` | Run by tag |
| `npx playwright test tests/Logistica/Movimientos/MS-1_ingreso/MS-1-ingreso.spec.ts` | Single file |
| `npx playwright test --project=PuntoVenta` | Module project |
| `npx playwright show-report` | HTML report after run |
| `npx tsc --noEmit` | TypeScript check |
| `npm run report:summary` | Console summary (Maven-style) |

## Config & Environment

- **Env file**: `config/environment.env` (NOT `.env`). Variables: `APP_ENV`, `USER_EMAIL`, `USER_PASSWORD`.
- `APP_ENV=prd` → `https://app.smartclic.pe/`. Any other value → `https://erpperu2-{env}.smartclic.pe/`
- Sub-entornos: `crt`, `crt-2`, `crt-3`, `crt-4`
- URLs built automatically in `config/env.ts` — do not hardcode URLs.

## Architecture

- **Dual pattern**: Logística uses POM only. PuntoVenta uses POM base + Screenplay (Actor `Cajero`, Tasks, Questions).
- **Fixtures** (from `@fixtures/*`): inject Page Objects and API services via `base.extend()`. Don't instantiate pages manually in tests.
- **TypeScript path aliases**: `@fixtures/*`, `@helpers/*`, `@pages/*`, `@services/*`, `@utils/*`, `@factories/*`, `@task/*`, `@question/*`, `@flows/*`, `@data/*`, `@app-types/*`
- **Test naming**: `<ID>-<descripcion>.spec.ts` (e.g., `MS-1-ingreso.spec.ts`). Tags: `@logistica`, `@punto-venta`, `@movimientos`, `@MS-1`, `@PV-01`.
- **Helpers**: High-level helpers (`@helpers/Logistica/verificaciones-movimientos.helper`) orchestrate multiple POM steps. Tests import helpers, not pages directly.
- **Services** (`@services/*`): API calls using `request` context (KardexApi, ComprobanteApi, SunatEstadoApi).

## Setup Projects (4)

| Project | File | Creates |
|---------|------|---------|
| `setup` | `auth.setup.ts` | Login session → `playwright/.auth/user.json` |
| `datos-setup` | `datos-adicionales.setup.ts` | Proveedor, campos adicionales Logística |
| `pv-datos-setup` | `punto-venta-datos.setup.ts` | Vendedor, campos caja, clientes DNI/RUC |
| `pv-items-setup` | `punto-venta-items.setup.ts` | 17+ items dinámicos |

Projects `PuntoVenta` and `Logistica` depend only on `setup` in `playwright.config.ts` — items setup is auto-skipped via state system.

## Setup State Persistence (auto-skip)

`src/utils/setup-state.ts` manages `playwright/.auth/setup-state.json`:
- `shouldSkipSetup(name)` — checks SKIP_* env var (priority), then environment match, then completed status
- `markSetupComplete(name)` — persists completion
- `areAllSetupsComplete()` — used by test-runner to auto-respond prompts

Active SKIP env vars (backward compatible):
- `SKIP_PV_SETUP`, `SKIP_PV_ITEMS_SETUP`, `SKIP_DATOS_SETUP`

**PRD mode**: `playwright/dynamic-items.prd.json` (committed to repo) provides fixed item codes. On `APP_ENV=prd`, `punto-venta-items.setup.ts` copies this file to `.auth/dynamic-items.json` and skips item creation.

## Dynamic Items

`src/factories/item-factory.ts` generates unique RUN_ID (5-digit timestamp suffix) per execution. Codes like `111111-{RUN_ID}`. Static items (no RUN_ID suffix) are hardcoded for shared items: ISC, ICBPER, sin-stock, selectors.

The code map is stored in `playwright/.auth/dynamic-items.json`. Helpers (`emision-data.helper.ts`, `movimiento-data.helper.ts`) load it at module import time and override base codes transparently.

Checkpoint system (`setup-checkpoint.ts`) preserves RUN_ID across crashes — only resumes uncreated items.

## Error Classification

`src/utils/functional-error.ts` categorizes failures by pattern matching on error message (in order):
- **AMBIENTE**: timeout, 503/502/504, net::ERR, `quedó bloqueada`
- **DATOS**: expect failures, `not found`, `storagestate`, falto variables, stock/kardex mismatch
- **SCRIPT**: locator/selector errors, `strict mode violation`, TypeError
- **DESCONOCIDO**: unmatched

`src/utils/functional-catalog.ts` has pre-categorized presets per business step (e.g., `emitirComprobante` → AMBIENTE).

## Gotchas

- **Module-level JSON loading**: Helpers `emision-data.helper.ts` and `movimiento-data.helper.ts` load `dynamic-items.json` at module import time (via `require`-like sync read). Changes to the JSON take effect only on next Playwright session/worker.
- **Dynamic codes always via helper**: Never hardcode item codes in tests. Use `ITEMS_PV.XXX.codigo` / `ITEMS_TEST.XXX.codigo` which resolve to the dynamic code.
- **ERP codes without hyphen**: The ERP stores codes without hyphens (`11111121726` not `111111-21726`). The resolver in `setup-checkpoint.ts` strips hyphens before search.
- **Vue.js IDs are complex**: Locators use `getByRole()` as primary strategy; `locator('[id="..."]')` only as fallback for deeply nested Vue components.
- **CSS text truncation**: Item names may be truncated in UI. Use `.first()` matcher and partial text matching.
- **Kardex debounce**: The ERP has inherent debounce behavior — `esperarDebounce()` may be needed in some flows.
- **Allure reports**: `npx allure serve allure-results` (requires Allure CLI installed).
- **playwright/.auth/** is gitignored — user.json, dynamic-items.json, setup-state.json are runtime artifacts not committed.
