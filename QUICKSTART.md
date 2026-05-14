# 🚀 Guía Rápida — ERP Perú 2 Automation

> **Para el equipo QA:** Esta guía responde las 3 preguntas más frecuentes:
> ¿Qué está automatizado? · ¿Cómo lo ejecuto? · ¿Qué hago si falla?

---

## 📋 ¿Qué casos están automatizados?

### 🔐 Login / Autenticación

| ID           | Descripción                                                                 | Estado |
|:-------------|:----------------------------------------------------------------------------|:------:|
| `auth.setup` | Login y guardado de sesión (se ejecuta automáticamente antes de cada suite) |   ✅    |

---

### 📦 Logística — Movimientos de Almacén

| ID              | Descripción                                                        | Tag      |
|:----------------|:-------------------------------------------------------------------|:---------|
| `MS-1`          | Registrar ingreso de almacén y verificar aumento de stock + Kardex | `@MS-1`  |
| `MS-2`          | Registrar salida de almacén y verificar descuento de stock         | `@MS-2`  |
| `MS-3`          | Ajuste de stock (positivo y negativo)                              | `@MS-3`  |
| `MS-4`          | Traslado entre almacenes                                           | `@MS-4`  |
| `MS-5`          | Edición de movimiento registrado                                   | `@MS-5`  |
| `MS-6`          | Clonación de movimiento                                            | `@MS-6`  |
| `MS-7`          | Movimiento masivo (Excel)                                          | `@MS-7`  |
| `MS-8`          | Acciones de impresión                                              | `@MS-8`  |
| `MS-9`          | Eliminación de movimiento                                          | `@MS-9`  |
| `MS-10 / MS-11` | Exportaciones                                                      | `@MS-10` |
| `MS-12`         | Movimientos rápidos                                                | `@MS-12` |

---

### 🏷️ Logística — Productos & Stock

| ID     | Descripción                                                  | Tag     |
|:-------|:-------------------------------------------------------------|:--------|
| `PS-2` | Carga masiva de productos (Excel)                            | `@PS-2` |
| `PS-3` | Creación de ítems (producto, servicio, combo, receta, lista) | `@PS-3` |
| `PS-4` | Editar ítem existente                                        | `@PS-4` |
| `PS-5` | Clonar ítem                                                  | `@PS-5` |
| `PS-6` | Actualización masiva de ítems (Excel)                        | `@PS-6` |
| `PS-7` | Actualización masiva de stock (Excel)                        | `@PS-7` |
| `PS-8` | Exportar lista de ítems                                      | `@PS-8` |

---

### 🛒 Punto de Venta — Emisiones

| ID      | Descripción                                                       | Comprobantes    | Tag      |
|:--------|:------------------------------------------------------------------|:----------------|:---------|
| `PV-01` | Emisión con control de stock, datos adicionales, validación SUNAT | Boleta, Factura | `@PV-01` |
| `PV-03` | Equivalencias, variantes y descuentos por ítem                    | Boleta, Factura | `@PV-03` |
| `PV-04` | Nota de venta con descuento por ítem                              | Nota de Venta   | `@PV-04` |
| `PV-14` | Retención                                                         | —               | `@PV-14` |
| `PV-15` | Adelanto                                                          | —               | `@PV-15` |
| `PV-16` | Exportación con receta                                            | —               | `@PV-16` |
| `PV-17` | Detracción                                                        | —               | `@PV-17` |
| `PV-18` | Selección y edición de ítem en caja                               | —               | `@PV-18` |

---

### 🩺 Health Checks (Estado del Ambiente) — ⚠️ PENDIENTE DE IMPLEMENTAR

| Descripción                     | Detalle                                           | Estado |
|:--------------------------------|:--------------------------------------------------|:------:|
| `health check - Seguridad`      | Verifica que el servicio de seguridad responde OK |   🚧   |
| `health check - Logística`      | Verifica que el servicio de logística responde OK |   🚧   |
| `health check - Finanzas`       | Verifica que el servicio de finanzas responde OK  |   🚧   |
| `health check - Punto de venta` | Verifica que el servicio de PdV responde OK       |   🚧   |

> ⚠️ **Los endpoints de health check aún no están configurados.** El comando `npx playwright test tests/health/` fallará
> siempre hasta que se configuren las URLs de cada servicio. Por ahora, omite el Paso 1 del flujo de diagnóstico e inicia
> directo en el Paso 2.

---

## ▶️ ¿Cómo ejecuto los tests?

### Opción 1 — Menú interactivo (recomendado para el equipo)

```bash
npm run test:menu
```

Se abre un menú en la terminal. Navega con las flechas del teclado:

```
ERP2 AUTO - TEST RUNNER
  📁 Explorar módulos / carpetas / archivos / tests   ← navega por módulo
  🔍 Buscar test específico por nombre o tag          ← busca "MS-1" o "boleta"
  🔍 Buscar archivo .spec.ts                          ← busca "ingreso" o "PV-01"
   ⚡ Ejecutar grep manual                            ← escribe @logistica o @PV-01
  🔓 Abrir Playwright UI                              ← interfaz gráfica
  ⏪ Salir
```

Al seleccionar cualquier opción, el menú te preguntará:

```
¿Ejecutar setups automáticos (crear datos)?
  → Responde NO si ya corriste los tests antes hoy (más rápido)
  → Responde SÍ si es la primera ejecución del día o si los datos fueron eliminados
```

---

### Opción 2 — Comandos directos por módulo

```bash
# ── Todo Logística ─────────────────────────────────────────────────
npx playwright test --grep "@logistica"

# ── Solo Movimientos ───────────────────────────────────────────────
npx playwright test --grep "@movimientos"

# ── Solo Productos & Stock ─────────────────────────────────────────
npx playwright test --grep "@productos-stock"

# ── Todo Punto de Venta ────────────────────────────────────────────
npx playwright test --grep "@punto-venta"

# ── Solo Boletas ───────────────────────────────────────────────────
npx playwright test --grep "@boleta"

# ── Un caso específico (ej: MS-1) ──────────────────────────────────
npx playwright test --grep "@MS-1"
npx playwright test --grep "@PV-01"

# ── Un archivo específico ──────────────────────────────────────────
npx playwright test tests/Logistica/Movimientos/MS-1_ingreso/MS-1-ingreso.spec.ts

# ── Health checks del ambiente ─────────────────────────────────────
npx playwright test tests/health/erp2-service.spec.ts --project=chromium

# ── Todos los tests (con setups automáticos) ───────────────────────
npx playwright test
```

---

### Opción 3 — Interfaz gráfica de Playwright

```bash
npx playwright test --ui
```

Abre una ventana visual donde puedes ver los tests, ejecutarlos uno por uno, ver screenshots y traces en tiempo real.

---

### Cambiar de entorno (CRT / PRD)

Edita el archivo `config/environment.env` y cambia la variable `APP_ENV`:

```env
# ── Producción ──────────────────────────────────────────
APP_ENV=prd          # → https://app.smartclic.pe/

# ── CRT (5 sub-entornos disponibles) ────────────────────
APP_ENV=crt          # → https://erpperu2-crt.smartclic.pe/
APP_ENV=crt-2        # → https://erpperu2-crt-2.smartclic.pe/
APP_ENV=crt-3        # → https://erpperu2-crt-3.smartclic.pe/
APP_ENV=crt-4        # → https://erpperu2-crt-4.smartclic.pe/
```

> Cada sub-entorno CRT es independiente: Pero los datos y setup comparten entre ellos. Si corres en `crt-2`, los datos
> que crearon los setup projects en `crt`  estarán disponibles allí.

---

### Ver reportes después de la ejecución

```bash
# Reporte HTML con detalle de cada test (screenshots, pasos, duración)
npx playwright show-report

# Resumen rápido en consola (estilo Maven)
npm run report:summary

# Reporte Allure (más visual, con historial)
npx allure serve allure-results
```

---

## 🔥 ¿Qué hago si falla un test?

Sigue este flujo de diagnóstico. Empieza siempre por el Paso 1 cuando los health checks estén disponibles — por ahora *
*inicia en el Paso 2**.

```
¿Falló el test?
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  PASO 1 — ¿Es un problema de AMBIENTE?                   │
│  ⚠️  PENDIENTE — health checks aún no configurados.     │
│     Sáltate este paso por ahora e inicia en el Paso 2.   │
│                                                          │
│  (Cuando estén listos, el comando será:)                 │
│  npx playwright test tests/health/ --project=chromium    │
│                                                          │
│  ✅ Todos OK → ve al Paso 2                              │
│  ❌ Alguno falla → el ambiente está caído, avisa al equipo│
│     PRD  → https://app.smartclic.pe/                     │
│     CRT  → https://erpperu2-crt.smartclic.pe/            │
│     CRT-2 → https://erpperu2-crt-2.smartclic.pe/         │
│     CRT-3 → https://erpperu2-crt-3.smartclic.pe/         │
│     CRT-4 → https://erpperu2-crt-4.smartclic.pe/         │
└──────────────────────────────────────────────────────────┘
       │ (por ahora, empieza aquí)
       ▼
┌──────────────────────────────────────────────────────────┐
│  PASO 2 — ¿Es un problema de DATOS?                      │
│  Vuelve a correr los setup projects:                     │
│  npx playwright test --project=pv-datos-setup            │
│  npx playwright test --project=pv-items-setup            │
│  npx playwright test --project=datos-setup               │
│                                                          │
│  Los setups son idempotentes (seguros de re-ejecutar).   │
│  Si el test pasa ahora → eran datos faltantes.           │
│  Si sigue fallando → ve al Paso 3.                       │
└──────────────────────────────────────────────────────────┘
       │ (datos OK)
       ▼
┌──────────────────────────────────────────────────────────┐
│  PASO 3 — ¿Es un problema del SCRIPT?                    │
│  Abre el reporte HTML:                                   │
│  npx playwright show-report                              │
│                                                          │
│  Revisa en el test fallido:                              │
│  • 📸 Screenshot → ¿qué mostraba la UI en el fallo?     │
│  • 🎥 Video → ¿en qué paso exacto se rompió?            │
│  • 🔍 Trace → npx playwright show-trace <archivo.zip>   │
│                                                          │
│  Causas comunes:                                         │
│  - Selector desactualizado (cambió algo en la UI)        │
│  - Timeout (la página tardó más de lo esperado)          │
│  - Credenciales vencidas en config/environment.env       │
└──────────────────────────────────────────────────────────┘
```

---

### Mensajes de error comunes y qué significan

| Mensaje                                                     | Causa probable                               | Solución                                                                 |
|:------------------------------------------------------------|:---------------------------------------------|:-------------------------------------------------------------------------|
| `Error: Falta la variable de entorno: APP_ENV`              | No existe `config/environment.env`           | Crea el archivo con `APP_ENV`, `USER_EMAIL` y `USER_PASSWORD`            |
| `Error: Falta la variable de entorno: USER_EMAIL`           | El `.env` está incompleto                    | Agrega las variables faltantes al archivo                                |
| `Timeout 240000ms exceeded`                                 | La app no respondió o el ambiente está lento | Verifica manualmente que el entorno (`APP_ENV`) responde en el navegador |
| `storageState: "playwright/.auth/user.json" does not exist` | La sesión no fue generada                    | Corre `npx playwright test --project=setup`                              |
| `Locator not found` / `strict mode violation`               | Un selector cambió en la UI                  | Revisar trace → el paso fallido muestra el elemento                      |
| `expect(received).toBe(expected)` en stock o kardex         | Los datos del ambiente no coinciden          | Re-ejecuta los setup projects                                            |
| `net::ERR_NAME_NOT_RESOLVED`                                | URL de entorno incorrecta o sin red          | Verifica `APP_ENV` en `environment.env`                                  |

---

### Cómo ver el trace de un test fallido

```bash
# 1. Corre el test (el trace se guarda automáticamente en fallos)
npx playwright test --grep "@MS-1"

# 2. Abre el reporte HTML
npx playwright show-report

# 3. Haz clic en el test fallido → en la sección "Traces" → abre el archivo .zip
#    O directamente:
npx playwright show-trace test-results/<carpeta-del-test>/trace.zip
```

---

## ⚙️ Configuración inicial (primera vez)

```bash
# 1. Instalar dependencias
npm install

# 2. Instalar navegadores
npx playwright install

# 3. Crear el archivo de configuración
# Crea config/environment.env con este contenido:

APP_ENV=crt
USER_EMAIL=tu-correo@empresa.com
USER_PASSWORD=tu-contraseña

# 4. Verificar que el login funciona
npx playwright test --project=setup
```

Si el paso 4 pasa ✅, todo está configurado correctamente.

---

## 🗂️ Estructura resumida del proyecto

```
erpperu2-automation/
├── config/
│   └── environment.env          ← 🔧 TU CONFIGURACIÓN (no se sube a Git)
├── tests/
│   ├── auth.setup.ts            ← 🔐 Login automático
│   ├── health/                  ← 🩺 Health checks del ambiente
│   ├── Login/                   ← (en construcción)
│   ├── Logistica/
│   │   ├── Movimientos/         ← MS-1 al MS-12
│   │   └── Productos-Stock/     ← PS-2 al PS-8
│   └── Emisiones/
│       └── PuntoVenta/          ← PV-01, PV-03 al PV-18
├── src/
│   ├── pages/                   ← Page Object Model (no tocar si no eres QA Automation)
│   ├── helpers/                 ← Lógica reutilizable por módulo
│   └── fixtures/                ← Inyección de dependencias
├── scripts/
│   └── test-runner.ts           ← Menú interactivo (npm run test:menu)
└── playwright.config.ts         ← Configuración central de Playwright
```

---

## ❓ Preguntas frecuentes

**¿Puedo correr los tests mientras otro compañero los está corriendo?**
Sí, si apuntan a entornos distintos (`APP_ENV=crt` vs `APP_ENV=crt-2`). En el mismo entorno puede haber conflictos de
datos.

**¿Los setup projects borran datos existentes?**
No. Usan el patrón "Find or Create": si el dato ya existe, lo omiten. Son seguros de ejecutar N veces.

**¿Por qué el test de Login está vacío?**
El login automatizado ya existe en `auth.setup.ts` y se ejecuta automáticamente. El archivo `Login/Login.spec.ts` está
pendiente de implementar una suite de regresión de login (casos negativos, validaciones de error, etc.).

**¿Cómo agrego un test nuevo?**
Sigue la convención `<ID>-<descripcion>.spec.ts` en la carpeta del módulo correspondiente. Mira cualquier spec existente
como referencia de estructura.

**¿Dónde están los screenshots y videos de ejecución?**
En la carpeta `test-results/` y visibles en `npx playwright show-report`.

---

*Última actualización: Mayo 2026 — Equipo QA Automatización ERP Perú 2*
