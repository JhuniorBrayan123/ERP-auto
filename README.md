# 🚀 erpperu2-automation

![Playwright](https://img.shields.io/badge/Playwright-1.58.2-blue?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-ES2020-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)
![ExcelJS](https://img.shields.io/badge/ExcelJS-4.4.0-brightgreen)

## 📋 Índice

1. [Descripción del proyecto](#-1--descripción-del-proyecto)
2. [Stack tecnológico](#-2--stack-tecnológico)
3. [Requisitos previos](#-3--requisitos-previos)
4. [Instalación y configuración](#-4--instalación-y-configuración)
5. [Estructura del proyecto](#-5--estructura-del-proyecto)
6. [Pipeline de ejecución (Setup Projects)](#-6--pipeline-de-ejecución-setup-projects)
7. [Cómo ejecutar los tests](#-7--cómo-ejecutar-los-tests)
8. [Variables de entorno](#-8--variables-de-entorno)
9. [Convenciones y estándares](#-9--convenciones-y-estándares)
10. [Arquitectura](#-10--arquitectura)

---

## 📋 1 — Descripción del proyecto

Este proyecto contiene la automatización de pruebas End-to-End (E2E) para el sistema **ERP Perú 2**.
El foco principal actual de la automatización cubre los módulos de:

- **Logística**: Movimientos de almacén, ingresos, ajustes.
- **Productos - Stock**: Creación de ítems, edición, clonación, exportación y actualización masiva mediante Excel.
- **Punto de Venta**: Emisión de comprobantes (Boleta, Factura, Nota de Venta), con setup automático de datos.
- **Login / Autenticación**: Acceso al sistema.

**Propósito general**: Validar de manera automatizada y robusta la integridad de las operaciones logísticas, de
inventario (Kardex, stock) y de punto de venta, combinando validaciones desde la UI con comprobaciones en la base de
datos a través de la API, asegurando la calidad antes de despliegues a producción.

---

## 🛠️ 2 — Stack tecnológico

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

## ⚙️ 3 — Requisitos previos

Para ejecutar este proyecto de forma local, necesitas instalar:

- **Node.js** (Versión 18 o superior recomendada).
- **npm** (Viene integrado con Node.js).
- **Git** para clonar el repositorio.
- **Navegadores soportados por Playwright** (se instalan automáticamente).

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

```bash
# Crear/editar el archivo config/environment.env con los datos de tu cuenta
# Ver sección 8 para las variables disponibles
```

Plantilla base (`config/environment.env`):

```env
# Entorno activo: crt | crt-2 | crt-3 | crt-4 | prd
APP_ENV=prd

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

---

## 📁 5 — Estructura del proyecto

La estructura está organizada aplicando Page Object Model y separación de responsabilidades:

```text
erpperu2-automation/
├── config/                           # Variables de entorno y configuración
│   ├── env.ts                        # Centraliza la lectura de env vars
│   └── environment.env               # Variables de entorno (no se sube a Git)
├── src/                              # Core de automatización
│   ├── fixtures/                     # Inyectores personalizados de Playwright
│   │   ├── Logistica/                # Fixtures para módulo Logística
│   │   └── PuntoVenta/               # Fixtures para módulo Punto de Venta
│   ├── helpers/                      # Funciones reutilizables de lógica de negocio
│   │   ├── Logistica/                # Helpers de Logística (items, stock, kardex)
│   │   └── PuntoVenta/               # Helpers de PuntoVenta (emisión, descuentos)
│   ├── pages/                        # Clases del Page Object Model (POM)
│   │   ├── Logistica/                # POMs de Logística
│   │   └── PuntoVenta/               # POMs de PuntoVenta (Caja, Cliente, Setup)
│   ├── services/                     # Funciones para consumo de APIs
│   └── utils/                        # Utilidades (reportes, formateadores)
├── tests/                            # Archivos de prueba (specs) por módulos
│   ├── auth.setup.ts                 # 🔐 Setup: autenticación (genera storageState)
│   ├── Login/                        # Tests de acceso
│   ├── Logistica/                    # Módulo logístico
│   │   ├── datos-adicionales.setup.ts# 📦 Setup: datos adicionales de Logística
│   │   ├── Movimientos/              # Tests de ingresos y ajustes
│   │   └── Productos-Stock/          # Tests de ítems, Excel masivo, etc.
│   └── PuntoVenta/                   # Módulo Punto de Venta
│       ├── setup/                    # Setup Projects de PdV
│       │   ├── punto-venta-datos.setup.ts  # 📦 Setup: vendedor, campos, clientes
│       │   └── punto-venta-items.setup.ts  # 📦 Setup: ítems ISC, ICBPER, recetas
│       ├── Boleta/                   # Tests de emisión de Boletas
│       ├── Factura/                  # Tests de emisión de Facturas
│       └── NotaVenta/                # Tests de emisión de Notas de Venta
├── scripts/                          # Scripts de utilidad
│   ├── test-runner.ts                # Menú interactivo de ejecución
│   └── summarize-results.ts          # Resumen de resultados estilo Maven
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
                    ┌─────────▼─────────┐
                    │     chromium      │  ← Suite de regresión principal
                    └───────────────────┘
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

### Menú interactivo (recomendado)

```bash
npm run test:menu
```

Abre un menú interactivo en terminal donde puedes seleccionar qué módulos o suites ejecutar.

### Comandos directos

**Correr todos los tests** (incluye setup automático)

```bash
npx playwright test
```

**Correr solo los Setup Projects**

```bash
# Setup de datos de Punto de Venta (vendedor, campos, clientes)
npx playwright test --project=pv-datos-setup

# Setup de ítems de Punto de Venta (ISC, ICBPER, Receta, Lista)
npx playwright test --project=pv-items-setup

# Setup de datos adicionales de Logística
npx playwright test --project=datos-setup
```

**Correr por tag específico**

```bash
npx playwright test --grep "@logistica"
npx playwright test --grep "@productos-stock"
npx playwright test --grep "@movimientos"
npx playwright test --grep "@PS-3"
```

**Correr un archivo específico**

```bash
npx playwright test tests/Logistica/Movimientos/MS-1_ingreso/MS-1-ingreso.spec.ts
```

**Correr en modo UI (interfaz gráfica de Playwright)**

```bash
npx playwright test --ui
```

**Correr en modo debug**

```bash
npx playwright test --debug
```

**Correr en entorno CRT vs PRD**

Modifica `APP_ENV` en `config/environment.env`:

```bash
# Editar config/environment.env → APP_ENV=crt  o  APP_ENV=prd
npx playwright test
```

### Ver reportes

```bash
# Reporte HTML nativo de Playwright
npx playwright show-report

# Resumen estilo Maven en consola
npm run report:summary

# Reporte Allure (si está configurado)
npx allure serve allure-results
```

---

## 🔐 8 — Variables de entorno

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

## 📐 9 — Convenciones y estándares

A partir de la arquitectura actual se infieren las siguientes reglas:

- **Nomenclatura de archivos:** Sigue el patrón `<IdTicket>-<descripcion-corta>.spec.ts`. Ejemplo:
  `PS-6-edicion-masiva-servicios.spec.ts`.
- **Nomenclatura de clases POM:** Sigue `PascalCase` terminando en la palabra `Page`. Ejemplo: `KardexVerificacionPage`,
  `RegistroMovimientoPage`.
- **Nomenclatura de helpers:** Funciones exportadas en `camelCase` describiendo acciones. Ejemplo:
  `verificarStockYKardex`, `definirAlmacenYMotivo`.
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

---

## 🏗️ 10 — Arquitectura

El sistema se compone de capas funcionales diseñadas de abajo hacia arriba para promover la reutilización:

```text
Capa 5 — Setup Projects (.setup.ts)
     ↓ preparan datos para
Capa 4 — Tests (.spec.ts)
     ↓ usan
Capa 3 — Helpers de alto nivel
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
  negocio. *Ejemplo: `RegistroMovimientoPage`, `PuntoVentaSetupPage`*.
- **Capa 2 (Granular / Service):** Realizan aserciones pequeñas y consultan directo al backend vía HTTP.
  *Ejemplo: `kardexApi.obtenerSaldoPorProducto`, `buscarYSeleccionarItem`*.
- **Capa 3 (Helpers Alto Nivel):** Orquestan múltiples POMs y acciones granulares para formar un flujo de negocio.
  *Ejemplo: `definirCantidadYRegistrarIngreso`, `prepararProductoBase`*.
- **Capa 4 (Tests):** Listas declarativas usando `test.step` que leen a un alto nivel qué está comprobando el escenario,
  en su mayoría limpios de selectores de UI. *Ejemplo: `MS-1-ingreso.spec.ts`*.
- **Capa 5 (Setup Projects):** Scripts idempotentes que preparan el entorno de datos antes de la regresión.
  Usan el patrón "Find or Create" para garantizar que los datos base existan sin duplicarlos.
  *Ejemplo: `punto-venta-datos.setup.ts`, `punto-venta-items.setup.ts`*.
