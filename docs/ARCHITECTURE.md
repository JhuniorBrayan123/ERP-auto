# Arquitectura y Estructura

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
│       ├── Factura/                  # PV-14 al PV-17
│       ├── NotaVenta/                # PV-03 al PV-15
│       ├── Cotizacion/               # PV-19: Cotizaciones (emisión, imagen, vigencia)
│       ├── Pedido/                   # PV-20: Pedidos (emisión, búsqueda, compartir, lista)
│       ├── GuiasRemision/            # GRR + GRT: Guías de Remisión (27 tests)
│       │   ├── remitente/            # GRR-01 al GRR-18
│       │   └── transportista/        # GRT-17 al GRT-27
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

## 🏗️ 12 — Arquitectura

### Estrategia dual: POM + Screenplay

El proyecto utiliza **dos patrones de diseño** que coexisten de forma complementaria:

| Módulo | Patrón | Estado | Rationale |
|--------|--------|--------|-----------|
| **Logística** | POM puro | ✅ Maduro y estable | Ya funcionaba bien, no requiere cambio |
| **Punto de Venta** | POM como base + Screenplay como capa de composición | ✅ Estable | Screenplay mejora legibilidad en flujos complejos de emisión |
| **Guías de Remisión** | POM + Screenplay (tasks + actor) | ✅ Estable | Tasks reutilizables con validación de stock vía ApiKardex |
| **Cotizaciones** | Screenplay puro | ✅ Estable | Actor + tasks + questions para validación visual |
| **Pedidos** | Screenplay puro | 🚧 En desarrollo | Flujos de emisión, búsqueda y lista de pedidos |

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

