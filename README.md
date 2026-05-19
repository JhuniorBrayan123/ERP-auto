# 🚀 erpperu2-automation

![Playwright](https://img.shields.io/badge/Playwright-1.58.2-blue?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-ES2020-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)
![ExcelJS](https://img.shields.io/badge/ExcelJS-4.4.0-brightgreen)

## 📋 Índice

1. [Descripción del proyecto](#-1--descripción-del-proyecto)
2. [¿Qué casos están automatizados?](#-2--qué-casos-están-automatizados)
3. [Stack tecnológico](#-3--stack-tecnológico)
4. [Instalación y configuración](#-4--instalación-y-configuración)
5. [Estructura del proyecto](#-5--estructura-del-proyecto)
6. [Pipeline de ejecución (Setup Projects)](#-6--pipeline-de-ejecución-setup-projects)
7. [Cómo ejecutar los tests](#-7--cómo-ejecutar-los-tests)
8. [Reportes — ¿Qué información obtengo?](#-8--reportes--qué-información-obtengo)
9. [¿Qué hago si falla un test?](#-9--qué-hago-si-falla-un-test)
10. [Variables de entorno](#-10--variables-de-entorno)
11. [Convenciones y estándares](#-11--convenciones-y-estándares)
12. [Arquitectura](#-12--arquitectura)
13. [Preguntas frecuentes](#-13--preguntas-frecuentes)

---

## 📋 1 — Descripción del proyecto

Este proyecto contiene la automatización de pruebas End-to-End (E2E) para el sistema **ERP Perú 2**.
El foco principal actual de la automatización cubre los módulos de:

- **Logística**: Movimientos de almacén, ingresos, ajustes, traslados, edición, clonación, carga masiva.
- **Productos - Stock**: Creación de ítems, edición, clonación, exportación y actualización masiva mediante Excel.
- **Punto de Venta**: Emisión de comprobantes (Boleta, Factura, Nota de Venta), con setup automático de datos.
- **Login / Autenticación**: Acceso al sistema.

**Propósito general**: Validar de manera automatizada y robusta la integridad de las operaciones logísticas, de
inventario (Kardex, stock) y de punto de venta, combinando validaciones desde la UI con comprobaciones en la base de
datos a través de la API, asegurando la calidad antes de despliegues a producción.

**Arquitectura**: El proyecto utiliza **Page Object Model (POM)** como base en todos los módulos, con **Screenplay Pattern**
como capa de composición adicional en Punto de Venta para mejorar la legibilidad de escenarios complejos de emisión.

---

## 📋 2 — ¿Qué casos están automatizados?

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
| `PV-14` | Retención                                                         | Factura         | `@PV-14` |
| `PV-15` | Adelanto                                                          | —               | `@PV-15` |
| `PV-16` | Exportación con receta                                            | Factura         | `@PV-16` |
| `PV-17` | Detracción                                                        | —               | `@PV-17` |
| `PV-18` | Selección y edición de ítem en caja                               | —               | `@PV-18` |

---

### 🩺 Health Checks (Estado del Ambiente) — ⚠️ PENDIENTE

| Descripción                     | Detalle                                           | Estado |
|:--------------------------------|:--------------------------------------------------|:------:|
| `health check - Seguridad`      | Verifica que el servicio de seguridad responde OK |   🚧   |
| `health check - Logística`      | Verifica que el servicio de logística responde OK |   🚧   |
| `health check - Finanzas`       | Verifica que el servicio de finanzas responde OK  |   🚧   |
| `health check - Punto de venta` | Verifica que el servicio de PdV responde OK       |   🚧   |

---

## 🛠️ 3 — Stack tecnológico

| Tecnología           | Versión   | Propósito                                                                                           |
|:---------------------|:----------|:----------------------------------------------------------------------------------------------------|
| **@playwright/test** | `^1.58.2` | Core framework para automatización de pruebas End-to-End y control del navegador.                   |
| **@types/node**      | `^25.5.0` | Definiciones de tipos de TypeScript para Node.js.                                                   |
| **exceljs**          | `^4.4.0`  | Lectura, escritura y manipulación de archivos Excel (usado en tests de carga/actualización masiva). |
| **dotenv**           | `^17.3.1` | Gestión y carga de variables de entorno desde el archivo de configuración `.env`.                   |
| **@inquirer/prompts**| `^8.4.2`  | Menú interactivo de selección de tests en terminal.                                                 |
| **cross-spawn**      | `^7.0.6`  | Ejecución multiplataforma de comandos desde el menú interactivo.                                    |
| **tsx**              | `^4.21.0` | Ejecución directa de scripts TypeScript (menú, reportes).                                           |
| **allure-playwright**| `^3.7.2`  | Integración con Allure para reportes visuales avanzados.                                            |

---

## 🚀 4 — Instalación y configuración

Sigue estos pasos en orden para configurar tu entorno local:

**1. Clonar el repositorio**

```bash
git clone https://github.com/GU-CalidadTI/erpperu2-automation.git
cd erpperu2-automation
```

**2. Instalar dependencias del proyecto**

```bash
npm install
```

**3. Instalar browsers de Playwright**

```bash
npx playwright install
```

**4. Configurar variables de entorno**

Crea el archivo `config/environment.env` con tu configuración:

```env
# Entorno activo: crt | crt-2 | crt-3 | crt-4 | prd
APP_ENV=crt

# Credenciales de acceso
USER_EMAIL=tu-correo@ejemplo.com
USER_PASSWORD=tuContraseña
```

**5. Verificar que todo funciona**

```bash
# Ejecutar todos los tests (incluye los setup projects automáticos)
npx playwright test

# O usar el menú interactivo
npm run test:menu
```

Si el login del setup pasa ✅, todo está configurado correctamente.

---

## 📁 5 — Estructura del proyecto

La arquitectura combina dos patrones de diseño: **Page Object Model (POM)** como base en todos los módulos, y **Screenplay Pattern** como capa de composición adicional en Punto de Venta.

```text
erpperu2-automation/
├── config/                           # Variables de entorno y configuración
│   ├── env.ts                        # Centraliza la lectura de env vars
│   └── environment.env               # Variables de entorno (no se sube a Git)
├── src/                              # Core de automatización
│   ├── actors/                       # 🎬 Screenplay: actores (Cajero)
│   ├── abilities/                    # 🎬 Screenplay: habilidades (UsarNavegador)
│   ├── interactions/PuntoVenta/      # 🎬 Screenplay: acciones atómicas (12 archivos)
│   ├── task/PuntoVenta/              # 🎬 Screenplay: tareas de negocio (30 archivos)
│   ├── question/PuntoVenta/          # 🎬 Screenplay: observaciones (5 archivos)
│   ├── fixtures/                     # Inyectores personalizados de Playwright
│   │   ├── Logistica/                # Fixtures para módulo Logística
│   │   └── PuntoVenta/               # Fixtures para módulo Punto de Venta
│   ├── helpers/                      # Funciones reutilizables de lógica de negocio
│   │   ├── Logistica/                # Helpers de Logística (items, stock, kardex)
│   │   └── PuntoVenta/               # Helpers de PuntoVenta (emisión, descuentos)
│   ├── pages/                        # Clases del Page Object Model (POM)
│   │   ├── Logistica/                # POMs de Logística (22 archivos)
│   │   └── PuntoVenta/               # POMs de PuntoVenta (12 archivos)
│   ├── services/                     # Funciones para consumo de APIs
│   │   ├── Logistica/                # KardexApi, AlmacenesApi, MovimientoApi
│   │   └── PuntoVenta/               # ComprobanteApi, CajasApi, SunatEstadoApi
│   ├── factories/                    # 🏭 ItemFactory: generación de ítems dinámicos
│   │   └── item-factory.ts           # 18 templates con RUN_ID único por ejecución
│   ├── flows/PuntoVenta/             # 🔄 Orquestadores de flujos multi-página
│   ├── types/                        # 📝 Tipos centralizados de TypeScript
│   ├── data/                         # 📊 14 plantillas Excel para carga masiva
│   └── utils/                        # Utilidades (reportes, calculadora impuestos, waits)
├── tests/                            # Archivos de prueba (specs) por módulos
│   ├── auth.setup.ts                 # 🔐 Setup: autenticación (genera storageState)
│   ├── Login/                        # Tests de acceso
│   ├── Logistica/                    # Módulo logístico (Patrón POM)
│   │   ├── datos-adicionales.setup.ts# 📦 Setup: datos adicionales de Logística
│   │   ├── Movimientos/              # MS-1 al MS-12 (12 specs)
│   │   └── Productos-Stock/          # PS-2 al PS-8 (7 specs)
│   └── Emisiones/PuntoVenta/         # Módulo Punto de Venta (POM + Screenplay)
│       ├── setup/                    # Setup Projects de PdV
│       │   ├── punto-venta-datos.setup.ts  # 📦 Setup: vendedor, campos, clientes
│       │   └── punto-venta-items.setup.ts  # 📦 Setup: ítems ISC, ICBPER, recetas
│       ├── Boleta/                   # PV-01 al PV-03
│       ├── Factura/                  # PV-14 al PV-16
│       ├── NotaVenta/                # PV-03 al PV-15
│       └── General/                  # PV-17 al PV-18
├── scripts/                          # Scripts de utilidad
│   ├── test-runner.ts                # Menú interactivo de ejecución
│   └── summarize-results.ts          # Resumen de resultados estilo Maven
├── docs/                             # Documentación adicional
├── playwright.config.ts              # Configuración principal de Playwright
├── tsconfig.json                     # Configuración y paths alias de TypeScript
└── package.json                      # Dependencias y scripts npm
```

---

## 🔄 6 — Pipeline de ejecución (Setup Projects)

El proyecto utiliza **Playwright Setup Projects** para preparar datos de forma idempotente antes de ejecutar los tests de regresión. Esto garantiza que los datos necesarios existan sin importar el estado del entorno.

### Diagrama de dependencias

```text
                     ┌─────────────────┐
                     │   auth.setup    │  ← Autenticación (genera storageState)
                     └────────┬────────┘
                              │
             ┌────────────────┼────────────────┬───────────────────┐
             ▼                ▼                ▼                   ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  datos-setup    │ │ pv-datos     │ │ pv-items     │ │  (futuro)    │
    │  (Logística)    │ │ -setup       │ │ -setup       │ │              │
    └────────┬────────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
             │                 │                │                │
             └─────────────────┴────────────────┴────────────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │   Logistica     │               │   PuntoVenta    │
    │  workers: 1     │               │  workers: 1     │
    │  tests/Logistica│               │ tests/Emisiones │
    └─────────────────┘               └─────────────────┘
              ▲                                 ▲
              └────────────────┬────────────────┘
                    workers globales: 4 (ERP-safe)
```

### Detalle de cada Setup Project

| Proyecto | Archivo | Qué prepara |
|:---------|:--------|:------------|
| `setup` | `auth.setup.ts` | Autenticación. Guarda la sesión en `playwright/.auth/user.json` |
| `datos-setup` | `datos-adicionales.setup.ts` | Datos adicionales de Logística (campos, configuraciones) |
| `pv-datos-setup` | `punto-venta-datos.setup.ts` | **Vendedor**, **4 campos adicionales** de caja, **Cliente DNI** y **Cliente RUC** |
| `pv-items-setup` | `punto-venta-items.setup.ts` | **Producto ISC** (112211), **Producto ICBPER** (221122), **Receta** (332211), **Lista** (443444) |

### Lógica "Find or Create" (Idempotencia)

Todos los setup projects implementan el patrón **Find or Create**:
- Buscan el registro en la UI (por código, documento o nombre)
- Si **ya existe** → lo omiten con un log `✅ ya existe`
- Si **no existe** → lo crean automáticamente con un log `🔧 Creando...`

Esto permite ejecutar los setup **N veces** sin duplicar datos ni fallar.

### Saltar un setup (variables de entorno)

```bash
# Saltar solo el setup de datos PV
SKIP_PV_SETUP=1 npx playwright test

# Saltar solo el setup de ítems PV
SKIP_PV_ITEMS_SETUP=1 npx playwright test
```

---

## ▶️ 7 — Cómo ejecutar los tests

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

# ── Un caso específico ─────────────────────────────────────────────
npx playwright test --grep "@MS-1"
npx playwright test --grep "@PV-01"

# ── Un archivo específico ──────────────────────────────────────────
npx playwright test tests/Logistica/Movimientos/MS-1_ingreso/MS-1-ingreso.spec.ts

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

> Cada sub-entorno CRT es independiente, pero los datos y setup comparten entre ellos. Si corres en `crt-2`, los datos
> que crearon los setup projects en `crt` estarán disponibles allí.

---

## 📊 8 — Reportes — ¿Qué información obtengo?

Después de cada ejecución, el proyecto genera **6 tipos de reportes** que informan al equipo QA sobre el estado del proyecto:

### Reporte HTML (nativo de Playwright)

```bash
npx playwright show-report
```

**Qué muestra:**
- 📋 Lista completa de tests ejecutados con estado (✅ passed / ❌ failed / ⏭️ skipped)
- 📸 **Screenshot** de cada paso del test — ves exactamente qué mostraba la UI
- 🎥 **Video** de la ejecución completa — reproduce paso a paso dónde se rompió
- 🔍 **Trace** interactivo — viaja en el tiempo: ve el DOM, la red, las acciones de cada momento
- ⏱️ **Duración** de cada test — identifica cuáles son los más lentos
- 📊 **Resumen** al inicio: total, passed, failed, flaky, skipped

**Cuándo usarlo:** Para investigar cualquier fallo. Es el reporte más completo.

---

### Resumen Maven (consola)

```bash
npm run report:summary
```

**Qué muestra:**
- Tabla estilo Maven/Surefire con resultados en consola
- Total de tests, passed, failed, skipped
- Lista de tests fallidos con su duración
- Ideal para revisión rápida sin abrir navegador

**Cuándo usarlo:** Cuando necesitas un vistazo rápido desde la terminal o para logs de CI/CD.

---

### Allure (reporte visual avanzado)

```bash
npx allure serve allure-results
```

**Qué muestra:**
- Dashboard visual con gráficos de tendencias
- Historial de ejecuciones (si se acumulan resultados)
- Categorización de fallos
- Attachments: screenshots, videos, logs
- Filtros por severidad, suite, paquete

**Cuándo usarlo:** Para presentaciones al equipo o análisis de tendencias a lo largo del tiempo.

---

### JUnit XML

- **Ubicación:** `test-results/results.xml`
- **Uso:** Integración con CI/CD (Jenkins, GitLab CI, GitHub Actions)
- **Qué contiene:** Resultados estructurados en formato estándar JUnit

---

### JSON

- **Ubicación:** `test-results/results.json`
- **Uso:** Procesamiento programático, integración con herramientas externas

---

### Discord Reporter (webhook automático)

- Envía un resumen automático al canal de Discord del equipo al finalizar la ejecución
- Incluye: total de tests, passed, failed, duración total
- Configurado vía webhook en `config/environment.env`

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

## 🔥 9 — ¿Qué hago si falla un test?

Sigue este flujo de diagnóstico:

```
¿Falló el test?
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  PASO 1 — ¿Es un problema de AMBIENTE?                   │
│  ⚠️  Health checks aún no configurados.                 │
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
| `[movimiento-data] dynamic-items.json no encontrado`        | El archivo de ítems dinámicos no existe      | Ejecuta el setup de ítems primero: `npx playwright test --project=pv-items-setup` |

---

## 🔐 10 — Variables de entorno

La gestión de configuración ocurre centralizada en `config/env.ts` que lee desde `config/environment.env`.

| Variable               | Para qué sirve                                                                | Valores posibles                         | Obligatoria |
|:-----------------------|:------------------------------------------------------------------------------|:-----------------------------------------|:------------|
| `APP_ENV`              | Define a qué entorno de ERP Perú 2 apuntarán las pruebas.                    | `crt`, `crt-2`, `crt-3`, `crt-4`, `prd` | **Sí**      |
| `USER_EMAIL`           | Correo de la cuenta de pruebas.                                               | Un correo válido del sistema             | **Sí**      |
| `USER_PASSWORD`        | Contraseña del usuario.                                                       | Contraseña válida                        | **Sí**      |
| `BROWSER`              | Sobrescribe el navegador a usar.                                              | `chromium`, `firefox`, `webkit`          | Opcional    |
| `SKIP_PV_SETUP`        | Omite el setup de datos de Punto de Venta (vendedor, campos, clientes).       | `1` para omitir                          | Opcional    |
| `SKIP_PV_ITEMS_SETUP`  | Omite el setup de ítems de Punto de Venta (ISC, ICBPER, Receta, Lista).       | `1` para omitir                          | Opcional    |

---

## 📐 11 — Convenciones y estándares

A partir de la arquitectura actual se infieren las siguientes reglas:

- **Nomenclatura de archivos:** Sigue el patrón `<IdTicket>-<descripcion-corta>.spec.ts`. Ejemplo:
  `PS-6-edicion-masiva-servicios.spec.ts`.
- **Nomenclatura de clases POM:** Sigue `PascalCase` terminando en la palabra `Page`. Ejemplo: `KardexVerificacionPage`,
  `RegistroMovimientoPage`.
- **Nomenclatura de helpers:** Funciones exportadas en `camelCase` describiendo acciones. Ejemplo:
  `verificarStockYKardex`, `definirAlmacenYMotivo`.
- **Nomenclatura Screenplay (PuntoVenta):**
  - *Tasks:* `PascalCase` terminando en `.task.ts`. Ejemplo: `BuscarYAgregarItemSimple.task.ts`.
  - *Questions:* `PascalCase` que describen qué observan. Ejemplo: `TotalDeVenta`, `MensajeVisible`.
  - *Interactions:* `PascalCase` que describen la acción atómica. Ejemplo: `AbrirTotales`, `CerrarTotales`.
  - *Actor:* `Cajero` — usa `intentaRealizar()` para ejecutar tasks/questions.
- **Estructura de un test:** Todo el flujo se envuelve en `test.step()` de manera declarativa indicando intención de
  negocio (Given/When/Then o And). Ejemplo: `await test.step('And: abrir datos opcionales...', async () => {...})`.
- **Patrón AAA (Arrange, Act, Assert):** Especialmente notable al integrar API. Ejemplo:
    - *Arrange:* `await test.step('API kardex: antes...', async () => { saldoAfectadoApi = ... })`
    - *Act:* Acciones sobre la UI para realizar un movimiento de almacén.
    - *Assert:*
      `await test.step('Assert API: verificar kardex en DB', async () => { expect(saldoPosIngreso).toBe(saldoAfectadoApi + 150) })`.
- **Setup Projects (Find or Create):** Para datos base, usar el patrón idempotente: buscar por código/nombre en la UI,
  si existe → skip, si no → crear. Nunca hardcodear datos que deban existir previamente.
- **Uso de Helpers (Granular vs Alto nivel):**
    - *Helpers de Alto nivel:* Encapsulan varios pasos de una misma vista (`navegarAIngresosYNuevo`). Útiles para
      agilizar el Arrange.
    - *Helpers Granulares:* Realizan validaciones o clics específicos que se repiten con variaciones menores en
      diferentes flujos (`buscarYSeleccionarItem`).
- **Precios dinámicos:** Nunca hardcodear valores monetarios en tests. Usar `calcularTotalesDeItem('KEY')` desde
  `@utils/precio-item.helper` para obtener subtotal, IGV y total desde el factory.
- **Códigos dinámicos:** Los ítems creados por el setup tienen sufijo RUN_ID. En tests, usar siempre
  `ITEMS_PV.XXX.codigo` y `ITEMS_TEST.XXX.codigo` (que resuelven al código dinámico), nunca strings hardcodeados.

---

## 🏗️ 12 — Arquitectura

### Estrategia dual: POM + Screenplay

El proyecto utiliza **dos patrones de diseño** que coexisten de forma complementaria:

| Módulo | Patrón | Estado | Rationale |
|--------|--------|--------|-----------|
| **Logística** | POM puro | ✅ Maduro y estable | Ya funcionaba bien, no requiere cambio |
| **Punto de Venta** | POM como base + Screenplay como capa de composición | 🔄 En evolución | Screenplay mejora legibilidad en flujos complejos de emisión |

**¿Por qué dos patrones?** POM fue la base original y sigue siendo la mejor opción para encapsular selectores y acciones de UI. Screenplay se agregó como capa superior en Punto de Venta para crear abstracciones de negocio reutilizables (tasks) que componen múltiples POMs, mejorando la legibilidad de los tests a nivel de escenario.

### Capas funcionales (de abajo hacia arriba)

```text
Capa 6 — Screenplay (PuntoVenta)
     ↓ actors, tasks, questions
Capa 5 — Setup Projects (.setup.ts)
     ↓ preparan datos para
Capa 4 — Tests (.spec.ts)
     ↓ usan
Capa 3 — Helpers de alto nivel + Flows
     ↓ usan
Capa 2 — Helpers granulares + Service Layer (API)
     ↓ usan
Capa 1 — Page Objects (POM)
     ↓ usan
Capa 0 — Fixtures y configuración base
```

**Explicación de las capas:**

- **Capa 0 (Fixtures):** Inicializan dependencias como Pages y llamadas API, inyectándolas en las pruebas.
  *Ejemplo: `@fixtures/Logistica/movimientos-fixture`*.
- **Capa 1 (POM):** Encapsulan los localizadores web y acciones directas en la pantalla sin llevar aserciones de
  negocio. *Ejemplo: `RegistroMovimientoPage`, `EmisionPage`*.
- **Capa 2 (Granular / Service):** Realizan aserciones pequeñas y consultan directo al backend vía HTTP.
  *Ejemplo: `kardexApi.obtenerSaldoPorProducto`, `buscarYSeleccionarItem`*.
- **Capa 3 (Helpers Alto Nivel + Flows):** Orquestan múltiples POMs y acciones granulares para formar un flujo de negocio.
  *Ejemplo: `definirCantidadYRegistrarIngreso`, `emision-basica.flow.ts`*.
- **Capa 4 (Tests):** Listas declarativas usando `test.step` que leen a un alto nivel qué está comprobando el escenario,
  en su mayoría limpios de selectores de UI. *Ejemplo: `MS-1-ingreso.spec.ts`*.
- **Capa 5 (Setup Projects):** Scripts idempotentes que preparan el entorno de datos antes de la regresión.
  Usan el patrón "Find or Create" para garantizar que los datos base existan sin duplicarlos.
  *Ejemplo: `punto-venta-datos.setup.ts`, `punto-venta-items.setup.ts`*.
- **Capa 6 (Screenplay — solo PuntoVenta):** Actor `Cajero` con habilidades, tasks reutilizables y questions para
  observaciones. Los tests usan `cajero.intentaRealizar(task)` para ejecutar flujos de negocio.
  *Ejemplo: `BuscarYAgregarServicio`, `TotalEnCarrito`*.

### Componentes clave

| Componente | Ubicación | Función |
|---|---|---|
| **ItemFactory** | `src/factories/item-factory.ts` | 18 templates de ítems con **códigos dinámicos** (RUN_ID) para evitar colisiones entre ejecuciones y sobrecarga del Kardex |
| **Calculadora de impuestos** | `src/utils/calculadora-impuestos.ts` | Calcula base imponible e IGV desde precio unitario (IGV incluido, 10% o 18%) |
| **Precios dinámicos** | `src/utils/precio-item.helper.ts` | `calcularTotalesDeItem('KEY')` — lee precio del factory y devuelve subtotal, IGV, total formateados |
| **Error funcional** | `src/utils/functional-error.ts` | Clasifica fallos en: AMBIENTE, DATOS, SCRIPT o DESCONOCIDO |
| **Checkpoint system** | `setup-checkpoint.ts` | Permite reanudar el setup de ítems si falla a mitad, manteniendo el mismo RUN_ID |
| **Types** | `src/types/` | Tipos centralizados: `emision.types`, `movimiento.types`, `cliente.types`, `api-responses.types` |
| **Data Templates** | `src/data/` | 14 archivos Excel para carga masiva (productos, insumos, recetas, combos, etc.) |

---

## ❓ 13 — Preguntas frecuentes

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
