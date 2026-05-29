# ⚡ Quick Reference — ERP Perú 2 Automation

> **Para el equipo QA:** Referencia rápida de qué está automatizado y cómo ejecutarlo.
> Para documentación completa (instalación, arquitectura, convenciones, troubleshooting) ver [README.md](README.md).

---

## 📋 Tests automatizados

### 🔐 Login

| ID | Descripción |
|:---|:------------|
| `auth.setup` | Login y guardado de sesión (automático antes de cada suite) |

---

### 📦 Logística — Movimientos

| ID | Descripción | Tag |
|:---|:------------|:----|
| `MS-1` | Ingreso de almacén + verificación stock + Kardex | `@MS-1` |
| `MS-2` | Salida de almacén + verificación descuento stock | `@MS-2` |
| `MS-3` | Ajuste de stock (positivo y negativo) | `@MS-3` |
| `MS-4` | Traslado entre almacenes | `@MS-4` |
| `MS-5` | Edición de movimiento | `@MS-5` |
| `MS-6` | Clonación de movimiento | `@MS-6` |
| `MS-7` | Movimiento masivo (Excel) | `@MS-7` |
| `MS-8` | Impresión | `@MS-8` |
| `MS-9` | Eliminación de movimiento | `@MS-9` |
| `MS-10/11` | Exportaciones | `@MS-10` |
| `MS-12` | Movimientos rápidos | `@MS-12` |

---

### 🏷️ Logística — Productos & Stock

| ID | Descripción | Tag |
|:---|:------------|:----|
| `PS-2` | Carga masiva (Excel) | `@PS-2` |
| `PS-3` | Creación de ítems (producto, servicio, combo, receta, lista) | `@PS-3` |
| `PS-4` | Editar ítem | `@PS-4` |
| `PS-5` | Clonar ítem | `@PS-5` |
| `PS-6` | Actualización masiva (Excel) | `@PS-6` |
| `PS-7` | Actualización masiva de stock (Excel) | `@PS-7` |
| `PS-8` | Exportar lista de ítems | `@PS-8` |

---

### 🛒 Punto de Venta — Emisiones

| ID | Descripción | Comprobantes | Tag |
|:---|:------------|:-------------|:----|
| `PV-01` | Emisión con control stock, datos adicionales, SUNAT | Boleta, Factura | `@PV-01` |
| `PV-03` | Equivalencias, variantes, descuentos por ítem | Boleta, Factura | `@PV-03` |
| `PV-04` | Nota de venta con descuento por ítem | Nota de Venta | `@PV-04` |
| `PV-14` | Retención | Factura | `@PV-14` |
| `PV-15` | Adelanto | — | `@PV-15` |
| `PV-16` | Exportación con receta | Factura | `@PV-16` |
| `PV-17` | Detracción | — | `@PV-17` |
| `PV-18` | Selección y edición de ítem en caja | — | `@PV-18` |

---

### 🩺 Health Checks — ⚠️ Pendiente

| Descripción | Estado |
|:------------|:------:|
| Seguridad, Logística, Finanzas, Punto de Venta | 🚧 |

---

## ▶️ Comandos de ejecución

### Menú interactivo (recomendado)

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

### Comandos rápidos

```bash
# Todo un módulo
npx playwright test --grep "@logistica"
npx playwright test --grep "@punto-venta"

# Un caso específico
npx playwright test --grep "@MS-1"
npx playwright test --grep "@PV-01"

# Un archivo
npx playwright test tests/Logistica/Movimientos/MS-1_ingreso/MS-1-ingreso.spec.ts

# Todo (con setups automáticos)
npx playwright test

# UI gráfica
npx playwright test --ui
```

### Ver reportes

```bash
npx playwright show-report        # HTML completo
npm run report:summary            # Resumen en consola
npx allure serve allure-results   # Allure visual
```

### Cambiar entorno

Editar `config/environment.env`:

```env
APP_ENV=crt      # CRT
APP_ENV=crt-2    # CRT-2
APP_ENV=crt-3    # CRT-3
APP_ENV=crt-4    # CRT-4
APP_ENV=prd      # Producción
```

---

## ⚙️ Primera vez

```bash
npm install
npx playwright install
# Crear config/environment.env con APP_ENV, USER_EMAIL, USER_PASSWORD
npx playwright test --project=setup
```

---

## 🗂️ Estructura resumida

```
erpperu2-automation/
├── config/environment.env       ← Tu configuración
├── tests/
│   ├── auth.setup.ts            ← Login automático
│   ├── Logistica/               ← MS-1 a MS-12, PS-2 a PS-8
│   └── Emisiones/PuntoVenta/    ← PV-01 a PV-18
├── src/
│   ├── pages/                   ← Page Objects
│   ├── helpers/                 ← Lógica reutilizable
│   ├── fixtures/                ← Inyección de dependencias
│   ├── factories/               ← ItemFactory (códigos dinámicos)
│   └── services/                ← APIs (Kardex, Comprobante, etc.)
├── scripts/
│   └── test-runner.ts           ← Menú interactivo
└── playwright.config.ts         ← Configuración principal
```

---

*Última actualización: Mayo 2026 — Equipo QA Automatización ERP Perú 2*
