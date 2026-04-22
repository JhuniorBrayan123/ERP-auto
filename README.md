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
6. [Cómo ejecutar los tests](#-6--cómo-ejecutar-los-tests)
7. [Variables de entorno](#-7--variables-de-entorno)
8. [Convenciones y estándares](#-8--convenciones-y-estándares)
9. [Arquitectura](#-9--arquitectura)

---

## 📋 1 — Descripción del proyecto
Este proyecto contiene la automatización de pruebas End-to-End (E2E) para el sistema **ERP Perú 2**.
El foco principal actual de la automatización cubre los módulos de:
- **Logística**: Movimientos de almacén, ingresos, ajustes.
- **Productos - Stock**: Creación de ítems, edición, clonación, exportación y actualización masiva mediante Excel.
- **Login / Autenticación**: Acceso al sistema.

**Propósito general**: Validar de manera automatizada y robusta la integridad de las operaciones logísticas y de inventario (Kardex, stock) combinando validaciones desde la UI con comprobaciones en la base de datos a través de la API, asegurando la calidad antes de despliegues a producción.

---

## 🛠️ 2 — Stack tecnológico

| Tecnología | Versión | Propósito |
| :--- | :--- | :--- |
| **@playwright/test** | `^1.58.2` | Core framework para automatización de pruebas End-to-End y control del navegador. |
| **@types/node** | `^25.5.0` | Definiciones de tipos de TypeScript para Node.js. |
| **exceljs** | `^4.4.0` | Lectura, escritura y manipulación de archivos Excel (usado en tests de carga/actualización masiva). |
| **dotenv** | `^17.3.1` | Gestión y carga de variables de entorno desde el archivo de configuración `.env`. |

---

## ⚙️ 3 — Requisitos previos
Para ejecutar este proyecto de forma local, necesitas instalar:
- **Node.js** (Versión 18 o superior recomendada, según tipados).
- **npm** (Viene integrado con Node.js).
- **Git** para clonar el repositorio.
- **Navegadores soportados por Playwright**.

---

## 🚀 4 — Instalación y configuración

Sigue estos pasos en orden para configurar tu entorno local:

**1. Clonar el repositorio**
```bash
git clone <!-- TODO: completar URL del repo -->
cd erpperu2-automation
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Configurar variables de entorno**
```bash
# Copiar el entorno (ver sección 7) a config/environment.env
# Editar config/environment.env con los datos correctos
```

**4. Instalar browsers de Playwright**
```bash
npx playwright install
```

**5. Verificar que todo funciona**
```bash
npm run test
```

---

## 📁 5 — Estructura del proyecto
La estructura está organizada aplicando Page Object Model y separación de responsabilidades:

```text
erpperu2-automation/
├── config/                  # Contiene la configuración de variables de entorno y env.ts
├── src/                     # Core de automatización
│   ├── data/                # Datos estáticos o mock data (@data/)
│   ├── fixtures/            # Inyectores personalizados de Playwright (@fixtures/)
│   ├── helpers/             # Funciones reutilizables de lógica de negocio y acciones (@helpers/)
│   ├── pages/               # Clases del Page Object Model (@pages/)
│   ├── services/            # Funciones para consumo de APIs (ej. kardexApi) (@services/)
│   └── utils/               # Utilidades de uso general (reportes maven, etc)
├── tests/                   # Archivos de prueba (specs) agrupados por módulos
│   ├── Login/               # Pruebas de acceso
│   └── Logistica/           # Módulo logístico
│       ├── Movimientos/     # Tests de ingresos y ajustes de almacén
│       └── Productos-Stock/ # Tests de edición de ítems, Excel masivo, etc.
├── playwright.config.ts     # Configuración principal de Playwright (workers, retries, reporters)
└── tsconfig.json            # Configuración y paths alias de TypeScript
```

---

## ▶️ 6 — Cómo ejecutar los tests

El proyecto utiliza tags de Playwright para ejecutar flujos específicos. Algunos tags disponibles son `@logistica`, `@productos-stock`, `@movimientos`, `@ingreso`, `@MS-1`, `@PS-6`, etc.

**Correr todos los tests**
```bash
npx playwright test
```

**Correr por tag específico (ej. @logistica)**
```bash
npx playwright test --grep "@logistica"
```

**Correr un archivo específico**
```bash
npx playwright test tests/Logistica/Movimientos/MS-1_ingreso/MS-1-ingreso.spec.ts
```

**Correr en modo UI (interfaz gráfica de Playwright)**
```bash
npx playwright test --ui
```

**Correr en entorno CRT vs PRD**
Debes modificar la variable `APP_ENV` en el archivo `config/environment.env` (ej. `APP_ENV=prd` o `APP_ENV=crt`) y luego ejecutar:
```bash
npx playwright test
```

**Correr en modo debug**
```bash
npx playwright test --debug
```

---

## 🔐 7 — Variables de entorno

La gestión de configuración ocurre centralizada en `config/env.ts` que lee desde `config/environment.env`.

| Variable | Para qué sirve | Valores posibles | Obligatoria |
| :--- | :--- | :--- | :--- |
| `APP_ENV` | Define a qué entorno de ERP Perú 2 apuntarán las pruebas. Autogenera las URLs en `env.ts`. | `crt`, `crt-2`, `crt-3`, `crt-4`, `prd` | **Sí** |
| `USER_EMAIL` | Correo de la cuenta de pruebas. | Un correo válido del sistema | **Sí** |
| `USER_PASSWORD` | Contraseña del usuario. | Contraseña válida | **Sí** |
| `BROWSER` | Sobrescribe el navegador a usar. | `chromium`, `firefox`, `webkit` | Opcional |

**Plantilla base de `.env.example` (para usar en `config/environment.env`):**
```env
# Entorno activo: crt | crt-2 | crt-3 | crt-4 | prd
APP_ENV=prd

# Credenciales de acceso
USER_EMAIL=automatizacionerp2@gmail.com
USER_PASSWORD=Qa123456
```

---

## 📐 8 — Convenciones y estándares

A partir de la arquitectura actual se infieren las siguientes reglas:

- **Nomenclatura de archivos:** Sigue el patrón `<IdTicket>-<descripcion-corta>.spec.ts`. Ejemplo: `PS-6-edicion-masiva-servicios.spec.ts`.
- **Nomenclatura de clases POM:** Sigue `PascalCase` terminando en la palabra `Page`. Ejemplo: `KardexVerificacionPage`, `RegistroMovimientoPage`.
- **Nomenclatura de helpers:** Funciones exportadas en `camelCase` describiendo acciones. Ejemplo: `verificarStockYKardex`, `definirAlmacenYMotivo`.
- **Estructura de un test:** Todo el flujo se envuelve en `test.step()` de manera declarativa indicando intención de negocio (Given/When/Then o And). Ejemplo: `await test.step('And: abrir datos opcionales...', async () => {...})`.
- **Patrón AAA (Arrange, Act, Assert):** Especialmente notable al integrar API. Ejemplo:
  - *Arrange:* `await test.step('API kardex: antes...', async () => { saldoAfectadoApi = ... })`
  - *Act:* Acciones sobre la UI para realizar un movimiento de almacén.
  - *Assert:* `await test.step('Asser API: verificar kardex en DB', async () => { expect(saldoPosIngreso).toBe(saldoAfectadoApi + 150) })`.
- **Uso de Helpers (Granular vs Alto nivel):**
  - *Helpers de Alto nivel:* Encapsulan varios pasos de una misma vista (`navegarAIngresosYNuevo`). Útiles para agilizar el Arrange.
  - *Helpers Granulares:* Realizan validaciones o clics específicos que se repiten con variaciones menores en diferentes flujos (`buscarYSeleccionarItem`).

---

## 🏗️ 9 — Arquitectura

El sistema se compone de capas funcionales diseñadas de abajo hacia arriba para promover la reutilización:

```text
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
- **Capa 0 (Fixtures):** Inicializan dependencias como Pages y llamadas API, inyectándolas en las pruebas. *Ejemplo: `@fixtures/Logistica/movimientos-fixture`*.
- **Capa 1 (POM):** Encapsulan los localizadores web y acciones directas en la pantalla sin llevar aserciones de negocio. *Ejemplo: `RegistroMovimientoPage`*.
- **Capa 2 (Granular / Service):** Realizan aserciones pequeñas y consultan directo al backend vía HTTP. *Ejemplo: `kardexApi.obtenerSaldoPorProducto`, `buscarYSeleccionarItem`*.
- **Capa 3 (Helpers Alto Nivel):** Orquestan múltiples POMs y acciones granulares para formar un flujo de negocio. *Ejemplo: `definirCantidadYRegistrarIngreso`*.
- **Capa 4 (Tests):** Listas declarativas usando `test.step` que leen a un alto nivel qué está comprobando el escenario, en su mayoría limpios de selectores de UI. *Ejemplo: `MS-1-ingreso.spec.ts`*.
