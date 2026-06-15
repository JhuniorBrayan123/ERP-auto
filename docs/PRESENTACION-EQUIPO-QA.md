# 🏗️ Automatización ERP Perú 2

## Presentación Técnica para Equipo QA

> **190 tests E2E · 68 spec files · 2 patrones de diseño · Mayo 2026**

---

## Índice

1. [🏛️ Bloque 1: POM vs Screenplay — Por qué migramos](#️⃣-bloque-1-pom-vs-screenplay--por-qué-migramos)
   - [¿Qué es POM?](#-qué-es-pom)
   - [¿Qué es Screenplay?](#-qué-es-screenplay)
   - [Comparación Directa](#-comparación-directa)
   - [¿Por qué migramos? (5 razones)](#-por-qué-migramos-5-razones)
   - [Estado de la Migración](#-estado-de-la-migración)
   - [Kahoot — Bloque POM vs Screenplay](#-kahoot--bloque-pom-vs-screenplay)
2. [🔬 Bloque 2: Pipeline de Precondición + Captura de ID](#-bloque-2-pipeline-de-precondición--captura-de-id)
   - [El Network Intercept](#-el-network-intercept)
   - [Kahoot — Bloque Captura de ID](#-kahoot--bloque-captura-de-id)
3. [☀️ Bloque 3: Validación SUNAT (Async State Machine)](#️-bloque-3-validación-sunat-async-state-machine)
   - [Estrategia de no-fallo](#-estrategia-de-no-fallo)
   - [Kahoot — Bloque SUNAT](#-kahoot--bloque-sunat)
4. [📦 Bloque 4: Validación de Stock vía API (Kardex)](#-bloque-4-validación-de-stock-vía-api-kardex)
   - [Cross-module reuse](#-cross-module-reuse)
   - [Kahoot — Bloque Kardex/Stock](#-kahoot--bloque-kardexstock)
5. [🆕 Bloque 5: Pedidos PV-20 — Ciclo de Vida Completo](#-bloque-5-pedidos-pv-20--ciclo-de-vida-completo)
   - [Las 6 dimensiones](#-las-6-dimensiones)
   - [Kahoot — Bloque Pedidos](#-kahoot--bloque-pedidos)
6. [🆕 Bloque 6: Cotizaciones PV-19 — El Módulo Más Joven](#-bloque-6-cotizaciones-pv-19--el-módulo-más-joven)
   - [Gaps identificados](#-gaps-identificados)
   - [Kahoot — Bloque Cotizaciones](#-kahoot--bloque-cotizaciones)
7. [🔐 Bloque 7: Sistema de Sesiones (Auth)](#-bloque-7-sistema-de-sesiones-auth)
   - [Arquitectura de autenticación](#-arquitectura-de-autenticación)
   - [Kahoot — Bloque Sesiones](#-kahoot--bloque-sesiones)
8. [🔄 Bloque 8: Integraciones Futuras](#-bloque-8-integraciones-futuras)
   - [Flujo Cotización → Pedido → Factura](#-flujo-cotización--pedido--factura)
   - [Kahoot — Bloque Integraciones](#-kahoot--bloque-integraciones)
9. [📊 Bloque 9: Panorama General](#-bloque-9-panorama-general)
   - [190 tests en 68 archivos](#-190-tests-en-68-archivos)
   - [Kahoot — Bloque Panorama General](#-kahoot--bloque-panorama-general)

---

# 🏛️ Bloque 1: POM vs Screenplay — Por qué migramos

## 📖 ¿Qué es POM?

**Page Object Model** es un patrón de diseño donde cada página o componente de la UI tiene su propia clase que encapsula los selectores y las acciones.

### Cómo se ve en el código

```typescript
// ─── Clase POM (Logística: 23 clases así) ───
export class EmisionPage {
    // Selectores encapsulados como propiedades privadas
    private get searchInput(): Locator {
        return this.page.getByRole('textbox', {name: 'Escanea o busca por nombre, c'});
    }
    private get btnPagar(): Locator {
        return this.page.getByRole('button', {name: 'PAGAR'});
    }
    private get btnMontoExacto(): Locator {
        return this.page.getByRole('button', {name: 'Monto exacto'});
    }

    // Métodos que combinan acciones complejas
    async emitirConEfectivoExacto(): Promise<EmisionResult> {
        await this.btnPagar.click();
        await this.btnMontoExacto.click();
        await this.btnRealizarPago.click();
        return this.capturarEmisionResponse();
    }
}
```

### Cómo se usa en el test

```typescript
// ─── Test con POM (Boleta/Factura/NV: ~62 tests) ───
// Los page objects se INYECTAN via fixtures de Playwright
import {test, expect} from '@fixtures/PuntoVenta/validacion-fixture';

test('Emitir boleta con stock @PV-01.1', async ({
    cajaPage, emisionPage, comprobantePage, sunatApi, kardexApi,
}) => {
    await cajaPage.continuarVendiendo();
    await comprobantePage.seleccionarBoleta();
    await emisionPage.buscarItem('PROD001');
    await emisionPage.seleccionarItem('Producto X');
    await emisionPage.emitirConEfectivoExacto();
});
```

### Ventajas de POM

| Ventaja | Explicación |
|:--------|:------------|
| ✅ Separación de concerns | Selectores viven en la clase, no en el test |
| ✅ Reusabilidad | Un POM se usa en múltiples tests |
| ✅ Mantenibilidad | Si cambia un selector, se actualiza en 1 lugar |
| ✅ Legibilidad | `emisionPage.emitirConEfectivoExacto()` se lee solo |

### Desventajas de POM

| Desventaja | Explicación |
|:-----------|:------------|
| ❌ Clases grandes | `EmisionPage.ts` tiene **534 líneas** — Dios Objeto |
| ❌ Acoplamiento | El test conoce la inyección de dependencias (8+ parámetros) |
| ❌ Poco granular | Métodos como `emitirConEfectivoExacto()` hacen TODO |
| ❌ Steps manuales | Hay que escribir `test.step('Given:',...)` a mano |

---

## 🎭 ¿Qué es Screenplay?

**Screenplay** es un patrón de diseño donde un **Actor** (usuario) realiza **Tareas** (Tasks) usando **Habilidades** (Abilities) y verifica el estado mediante **Preguntas** (Questions). El test se lee como una historia.

### Los 4 Elementos del Screenplay

```
┌─────────────────────────────────────────────────────┐
│                   SCREENPLAY                          │
│                                                       │
│  ACTOR → realiza → TASKS → usando → ABILITIES        │
│    │                    │               │             │
│    │                    ▼               ▼             │
│    │            displayName         UsarNavegador     │
│    │            (step name)         (wraps Page)      │
│    │                                                  │
│    └──→ pregunta → QUESTIONS → validan estado        │
│                         │                             │
│                         ▼                             │
│                   Promise<boolean>                    │
└─────────────────────────────────────────────────────┘
```

### Cómo se ve en el código

```typescript
// ─── 1. ACTOR ───
const cajero = Cajero.con(page);

// ─── 2. TASK (una closure con displayName) ───
export const SeleccionarTipoComprobante = (tipo: TipoComprobante) => {
    const fn = async (page: Page): Promise<void> => {
        const comprobantePage = new ComprobantePage(page);
        await comprobantePage.seleccionarTipoComprobante(tipo);
    };
    fn.displayName = `Seleccionar tipo de comprobante: ${tipo}`;
    return fn;
};

// ─── 3. TEST (se lee como una historia) ───
await cajero.intentaRealizar(
    IniciarVentaEnCaja(CAJAS.AUTO.nombre),  // → auto-genera test.step()
    SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
    SeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
    AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
    RegistrarPedido(pedido)
);

expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
//                               └── Question retorna Promise<boolean>
```

### Ventajas de Screenplay

| Ventaja | Explicación |
|:--------|:------------|
| ✅ Tests legibles como historia | `cajero.intentaRealizar(SeleccionarCliente(...), BuscarItem(...))` |
| ✅ Tasks ultra granulares | Cada archivo = 1 tarea (~12 líneas) |
| ✅ Steps automáticos | `displayName` genera `test.step()` sin código extra |
| ✅ Questions reutilizables | Validaciones como closures componibles |
| ✅ Bajo acoplamiento | El Actor descubre sus habilidades |

### Desventajas de Screenplay

| Desventaja | Explicación |
|:-----------|:------------|
| ❌ Más archivos | 58 tasks + 20 questions + 18 interactions = ~96 archivos |
| ❌ Curva de aprendizaje | El equipo tiene que entender closures, displayName, Actor |
| ❌ Indirección | Para entender un test hay que seguir Task → POM |
| ❌ Debugging | Más abstracciones = más stack trace |

---

## ⚖️ Comparación Directa

| Criterio | POM + Fixture | Screenplay | ¿Quién gana? |
|:---------|:-------------:|:----------:|:------------:|
| Nº de archivos por feature | 1 POM + 1 test | 1 Task + 1 Question + 1 test | POM |
| Líneas por archivo | 500+ (EmisionPage) | ~12 (cada Task) | Screenplay |
| Reusabilidad | Media | Alta | Screenplay |
| Step naming automático | ❌ No | ✅ Sí (displayName) | Screenplay |
| Curva de aprendizaje | Baja | Media | POM |
| Inyección de dependencias | Explícita (8+ parámetros) | Implícita (Actor) | Screenplay |
| Tests existentes | 62 | 23 | POM (hoy) |

### Mismo escenario, 2 estilos:

```typescript
// ─── POM + FIXTURE ───                    // ─── SCREENPLAY ───
test('Emitir boleta @PV-01.1', async ({     const cajero = Cajero.con(page);
    cajaPage, emisionPage,                  await cajero.intentaRealizar(
    sunatApi, kardexApi,                    IniciarVentaEnCaja(),
}) => {                                     SeleccionarCliente(CLIENTES.X),
    await cajaPage.continuarVendiendo();    AgregarItemAlCarrito(ITEM),
    await comprobantePage.seleccionarBoleta();RegistrarPedido(outputRef)
    await emisionPage.buscarItem('X');      );
    await emisionPage.seleccionarItem('X'); expect(await cajero.pregunta(
    await emisionPage.emitirConEfectivoExacto();ModalPostEmision.estaVisible()
});                                         )).toBe(true);
```

---

## 🔄 ¿Por qué migramos? (5 razones)

### Razón #1: Page Objects convertidos en "Dioses Objeto"

```
EmisionPage.ts → 534 líneas
    ├── buscarItem()
    ├── seleccionarItem()
    ├── incrementarCantidad()
    ├── emitirConEfectivoExacto()
    ├── emitirConYape()
    ├── guardarPedido()
    ├── clickNuevaVenta()
    ├── clickVistaPrevia()
    └── ... más métodos
```

**Problema:** Un solo POM mezcla emisión, pedidos, vista previa, edición. Cada nueva feature engorda la clase.

**Solución Screenplay:** Cada Task es un archivo independiente de ~12 líneas.

### Razón #2: Steps manuales vs automáticos

```typescript
// POM: 399 llamadas a test.step() en todo el proyecto - todas manuales
await test.step('Given: la caja está abierta', async () => { ... });
await test.step('When: agregar producto y emitir', async () => { ... });

// Screenplay: el displayName genera el step automáticamente
await cajero.intentaRealizar(
    IniciarVentaEnCaja(),            // → test.step('Iniciar venta en caja (caja-auto)')
    SeleccionarCliente(CLIENTES.X), // → test.step('Seleccionar cliente: ...')
);
```

### Razón #3: Inyección vs Descubrimiento

```typescript
// POM: el test conoce toda la inyección (8+ parámetros)
test('test', async ({cajaPage, emisionPage, comprobantePage,
    busquedaComprobantes, sunatApi, kardexApi, page}) => { ... });
// Agregar un POM nuevo = type + fixture + parámetro

// Screenplay: el Actor descubre sus habilidades
const cajero = Cajero.con(page);
await cajero.intentaRealizar(AlgunaTask());
// La Task crea su POM internamente. El test no se entera.
```

### Razón #4: Reportes más descriptivos

**POM:**
```
✓ Given: la caja está abierta
✓ When: agregar producto y emitir
✕ Then: validar SUNAT → TimeoutError
```

**Screenplay (displayName incluye parámetros):**
```
✓ Iniciar venta en caja (caja-auto)
✓ Seleccionar tipo de comprobante: PEDIDO
✓ Seleccionar cliente: EMPRESA RUC AUTO
✓ Buscar y agregar item simple
✓ Registrar pedido
✕ ModalPostEmision.estaVisible → false
```

### Razón #5: Tasks que combinan UI + API

```typescript
// Screenplay permite Tasks que reciben el Actor completo
export const AlgoComplejo = () => {
    const fn = async (actor: Cajero): Promise<void> => {
        const navegador = actor.habilidad(UsarNavegador);
        const token = await getCachedToken(navegador.page);
        // Lógica híbrida UI + API en una sola Task
    };
    fn.displayName = 'Algo complejo';
    return fn;
};
```

Esto no es posible en POM sin acoplar servicios al page object.

---

## 📊 Estado de la Migración

```
         ┌─────────────────────────┐
         │   POM + FIXTURE         │  ← Boleta, Factura, NV, Logística
         │   152 tests / ~80%      │     (legado, funcional)
         └─────────────────────────┘
                      │
         ┌─────────────────────────┐
         │   SCREENPLAY            │  ← Pedidos, Cotizaciones
         │   23 tests / ~12%       │     (nuevos, en crecimiento)
         └─────────────────────────┘
                      │
         ┌─────────────────────────┐
         │   HÍBRIDO (el puente)   │
         │                         │
         │   Cajero.intentaRealizar│  ← soporta AMBOS estilos
         │   detecta Task(actor)   │     vs Task(page) automágicamente
         │   por la firma          │
         └─────────────────────────┘
```

El **puente bidireccional** permite migrar TASK por TASK sin romper tests:

```typescript
async intentaRealizar(...tasks) {
    for (const task of tasks) {
        if (task.length === 1 && task.toString().includes('actor')) {
            await task(this);                              // Nuevo: recibe Actor
        } else {
            await task(this.habilidad(UsarNavegador).page); // Legacy: recibe Page
        }
    }
}
```

---

## 🏗️ Caso Real: POM en Logística — Creación de Ítems (Setup)

### 📍 Mapa de Archivos

Este es el POM **más completo** del proyecto. Se usa en el setup que crea los 17 ítems dinámicos para los tests de PuntoVenta.

```
📁 src/pages/Logistica/
   ├── ItemFormBasePage.ts          ← Clase base abstracta (85 líneas)
   ├── ProductoFormPage.ts          ← POM para productos (293 líneas)
   ├── RecetaFormPage.ts            ← POM para recetas
   ├── ListaFormPage.ts             ← POM para listas
   ├── ComboFormPage.ts             ← POM para combos
   └── ListaItemsPage.ts            ← POM para la grilla de búsqueda

📁 tests/Emisiones/PuntoVenta/setup/
   ├── punto-venta-items.setup.ts   ← Setup Project (280 líneas)
   ├── crear-item-setup.helpers.ts  ← Helpers descompuestos (290 líneas)
   └── setup-checkpoint.ts          ← Checkpoint recovery

📁 src/factories/
   └── item-factory.ts              ← Templates de ítems (17 definiciones)
```

### 🏛️ Herencia: Base Class para evitar repetición

Todos los formularios de items heredan de `ItemFormBasePage`, que tiene lo común:

```typescript
// src/pages/Logistica/ItemFormBasePage.ts
export abstract class ItemFormBasePage {
    constructor(readonly page: Page) {}

    // Locators protegidos (los usan las subclases)
    protected get inputNombre(): Locator {
        return this.page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' });
    }
    protected get botonCrearItems(): Locator {
        return this.page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]');
    }

    // Métodos comunes a TODOS los tipos de items
    async llenarNombre(nombre: string): Promise<void> { ... }
    async expandirOpcionesAvanzadas(): Promise<void> { ... }
    async clickIrAListaItems(): Promise<void> { ... }
    async irATabEquivalencias(): Promise<void> { ... }
    async crearEquivalencia(config: EquivalenciaConfig): Promise<void> { ... }
}
```

### 🧩 Las 4 subclases POM

Cada tipo de ítem tiene su propio POM con métodos específicos:

```typescript
// ProductoFormPage — 293 líneas, métodos específicos de productos
export class ProductoFormPage extends ItemFormBasePage {
    async iniciarCreacionProducto(): Promise<void> { ... }
    async llenarPrecios(precioVenta: string, precioCompra: string): Promise<void> { ... }
    async seleccionarControlStock(tipo: 'estricto' | 'flexible'): Promise<void> { ... }
    async configurarISC(config: ISCConfig): Promise<void> { ... }
    async activarICBPER(): Promise<void> { ... }
    async irATabVariantes(): Promise<void> { ... }
    async crearAtributoVariante(titulo: string, opciones: string[]): Promise<void> { ... }
}
```

### 🔧 Helpers descompuestos (anti-God Function)

Los helpers NO son un solo método gigante — están **descompuestos** en funciones atómicas que se orquestan:

```typescript
// tests/Emisiones/PuntoVenta/setup/crear-item-setup.helpers.ts

// Helper 1: llenar info básica
export async function llenarProductoBase(
    productoForm: ProductoFormPage, codigo: string, template: ItemTemplate
): Promise<void> {
    await productoForm.iniciarCreacionProducto();
    const nombreFinal = template.esDinamico
        ? `${template.nombre} ${codigo.split('-')[1]}`
        : template.nombre;
    await productoForm.llenarNombre(nombreFinal);
    await productoForm.llenarCodigo(Number(codigo.replace(/-/g, '')));
    await productoForm.llenarPrecios(template.config.precioVenta, template.config.precioCompra);
    await productoForm.expandirOpcionesAvanzadas();
}

// Helper 2: configurar stock (solo si aplica)
export async function configurarStockProducto(
    productoForm: ProductoFormPage, template: ItemTemplate
): Promise<void> {
    await productoForm.irATabStock();
    if (template.config.almacen)
        await productoForm.seleccionarAlmacenEspecifico(template.config.almacen);
    await productoForm.seleccionarControlStock(template.config.controlStock);
    if (template.config.cantidadStock)
        await productoForm.llenarCantidadesStock(template.config.cantidadStock);
    await productoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
}

// Helper 3: extras condicionales (ISC, ICBPER, variantes, equivalencias)
export async function aplicarExtrasProducto(
    productoForm: ProductoFormPage, template: ItemTemplate, codigo: string
): Promise<void> {
    // Cada extra solo se ejecuta si el template lo tiene definido
    if (template.config.isc)      await productoForm.configurarISC(config.isc);
    if (template.config.icbper)   await productoForm.activarICBPER();
    if (template.config.variantes) { ... }
    if (template.config.equivalencias) { ... }
}

// Helper 4: guardar y verificar post-creación
export async function guardarProductoYVolver(
    page: Page, productoForm: ProductoFormPage, codigo: string
): Promise<void> {
    await productoForm.crearProducto();
    // verificarVisible es un wrapper que captura errores UI con mensajes descriptivos
    await verificarVisible(page, /* Ir a lista de ítems */, {
        elemento: 'botón Ir a lista de ítems',
        paso: `Guardar producto ${codigo}`,
        uiMessages: {
            errorModal: (texto) => `el ERP rechazó: "${texto.slice(0, 200)}"`,
            validation: (textos) => `errores en formulario: "${textos.join(' | ')}"`,
            loading: 'loader atascado',
        },
    });
    await productoForm.clickIrAListaItems();
}
```

### 🎯 Orquestador: `crearProductoDesdeTemplate()`

Los 4 helpers se combinan en un orquestador que también genera `test.step()` automático:

```typescript
export async function crearProductoDesdeTemplate(
    page: Page, productoForm: ProductoFormPage, codigo: string, template: ItemTemplate
): Promise<void> {
    await import('@playwright/test').then(({test}) =>
        test.step(`Crear producto ${codigo}`, async () => {
            await llenarProductoBase(productoForm, codigo, template);
            await configurarStockProducto(productoForm, template);
            await aplicarExtrasProducto(productoForm, template, codigo);
            await guardarProductoYVolver(page, productoForm, codigo);
        })
    );
}
```

> 💡 **Patrón decorator:** `test.step()` se importa dinámicamente dentro del helper, no como dependencia del archivo. Así el helper funciona tanto en setups como en tests.

### 🧪 El Setup Project que lo usa

`punto-venta-items.setup.ts` (280 líneas) orquesta la creación de 17 ítems con:

1. **Auto-skip** via `shouldSkipSetup()` — si ya se ejecutó, salta
2. **Checkpoint recovery** — si el setup falla a medio camino, retoma desde el último ítem creado
3. **Items con templates** — 17 definiciones en `ITEM_TEMPLATES` con fases ordenadas
4. **Resolución de códigos dinámicos** — `crearResolver()` resuelve dependencias entre combos/recetas

```typescript
// punto-venta-items.setup.ts — estructura
setup('Setup: Preparar ítems base para PuntoVenta', async ({page}) => {
    // Skip si ya completado
    if (shouldSkipSetup('punto-venta-items')) return;

    // PRD: usa JSON fijo (no crea items en producción)
    if (isPrd) { copiarItemsFijos(); return; }

    // Checkpoint: reanudar si hubo fallo previo
    const checkpoint = cargarCheckpoint();
    const RUN_ID = checkpoint?.RUN_ID ?? generarRunId();

    // Crear 17 items en orden de fase
    for (const template of ITEM_TEMPLATES.sort(byPhase)) {
        if (yaExiste(template)) continue;  // ← ya creado en intento anterior
        switch (template.tipo) {
            case 'producto': await crearProductoDesdeTemplate(...); break;
            case 'receta':   await crearRecetaDesdeTemplate(...);   break;
            case 'lista':    await crearListaDesdeTemplate(...);    break;
            case 'combo':    await crearComboDesdeTemplate(...);    break;
        }
        marcarDone(template.key);  // ← checkpoint: si falla, retoma acá
    }
});
```

### 🔁 Checkpoint Recovery — ¿Qué pasa si el setup falla?

Si el setup se cuelga en el ítem #12 de 17, el **checkpoint** persiste qué ítems ya se crearon:

```typescript
// setup-checkpoint.ts — persistencia de progreso
// checkpoint.json guarda:
// { "RUN_ID": "21726", "done": ["ITEM_SIMPLE", "ITEM_GRAVADO", ...] }

// En el próximo intento:
const checkpoint = cargarCheckpoint();     // Lee progreso guardado
itemsDone = new Set(checkpoint.done);      // ítems ya creados
for (const template of templates) {
    if (itemsDone.has(template.key)) continue;  // ← SKIP
    // crear ítem...
    marcarDone(template.key);                   // ← checkpoint
}
```

Sin checkpoint recovery, un fallo en el ítem #12 forza recrear los 11 anteriores — cada uno toma ~15s = ~3 minutos perdidos.

### 📊 Distribución de responsabilidades

| Capa | Archivos | Responsabilidad |
|:-----|:---------|:----------------|
| **POMs** | 5 clases en `src/pages/Logistica/` | Selectores + interacción con el DOM |
| **Helpers** | `crear-item-setup.helpers.ts` | Lógica de negocio descompuesta por paso |
| **Setup Project** | `punto-venta-items.setup.ts` | Orquestación, checkpoint, skip |
| **Templates** | `item-factory.ts` | Definiciones de 17 ítems con config |
| **Base Class** | `ItemFormBasePage.ts` | DRY: métodos comunes a todos los tipos |

### 🔗 Cross-module Reuse

Estos POMs de **Logística** (`src/pages/Logistica/`) son usados por el setup de **PuntoVenta**:

```typescript
// punto-venta-items.setup.ts — importa POMs de Logística
import {ProductoFormPage} from '@pages/Logistica/ProductoFormPage';
import {RecetaFormPage}   from '@pages/Logistica/RecetaFormPage';
import {ListaFormPage}    from '@pages/Logistica/ListaFormPage';
import {ComboFormPage}    from '@pages/Logistica/ComboFormPage';
```

Los Page Objects viven en Logística pero se usan en PuntoVenta — sin duplicación, sin acoplamiento directo.

---

## 🎯 Kahoot — Bloque POM vs Screenplay

### Preguntas Nivel 1: Conceptos Básicos

**1️⃣ ¿Qué significa POM?**
- A) **Page Object Model** ✅
- B) Project Object Manager
- C) Page Oriented Method
- D) Pattern Object Model

> *Explicación:* Es un patrón donde cada página tiene su propia clase que encapsula selectores y acciones. Ej: `EmisionPage.ts` tiene métodos como `buscarItem()` y `emitirConEfectivoExacto()`.

---

**2️⃣ ¿Cuál es el elemento principal de Screenplay?**
- A) El Page Object
- B) **El Actor** ✅
- C) La Fixture
- D) El Helper

> *Explicación:* En Screenplay, el Actor (Cajero) es el centro: realiza Tasks y hace preguntas (Questions). El test se lee como una historia del usuario.

---

**3️⃣ ¿Cómo se llaman las acciones en Screenplay?**
- A) Methods
- B) **Tasks** ✅
- C) Steps
- D) Functions

> *Explicación:* Cada acción es una Task: una closure que retorna una función con `displayName`. Ej: `SeleccionarCliente()`, `RegistrarPedido()`.

---

**4️⃣ ¿Cómo se llaman las validaciones en Screenplay?**
- A) Asserts
- B) **Questions** ✅
- C) Checks
- D) Verifications

> *Explicación:* Las Questions retornan `Promise<boolean>` y se usan con `cajero.pregunta(Question)`. Ej: `ModalPostEmision.estaVisible()`.

---

### Preguntas Nivel 2: Comparación

**5️⃣ ¿Cuál es la principal desventaja de POM en este proyecto?**
- A) Es muy lento
- B) **Los Page Objects se vuelven "Dioses Objeto" de 500+ líneas** ✅
- C) No funciona con TypeScript
- D) No es compatible con Playwright

> *Explicación:* `EmisionPage.ts` tiene 534 líneas mezclando emisión, pedidos, vista previa. En Screenplay, cada Task es ~12 líneas.

---

**6️⃣ ¿Qué ventaja tiene Screenplay sobre POM en los reportes?**
- A) Los reportes son más bonitos
- B) **Los steps se generan automáticamente desde `displayName`** ✅
- C) Los reportes son más rápidos
- D) No hay diferencia

> *Explicación:* La propiedad `displayName` de cada Task se convierte automáticamente en un `test.step()` en el reporte, incluyendo los parámetros.

---

**7️⃣ ¿Cuántos tests usan POM + Fixture actualmente?**
- A) 23
- B) **~152** ✅ (Logística 90 + PuntoVenta Emisiones 62)
- C) 90
- D) 190

> *Explicación:* La mayoría del proyecto (Logística + PuntoVenta legacy) usa POM + Fixture.

---

**8️⃣ ¿Cuántos tests usan Screenplay actualmente?**
- A) **23** ✅
- B) 62
- C) 17
- D) 6

> *Explicación:* Los tests de Pedidos (PV-20) y Cotizaciones (PV-19) se crearon con Screenplay desde el inicio.

---

### Preguntas Nivel 3: Arquitectura

**9️⃣ ¿Cómo detecta `Cajero.intentaRealizar()` si una Task espera un Actor o un Page?**
- A) Por el tipo de retorno
- B) **Por la cantidad de parámetros y el contenido del `toString()`** ✅
- C) Por una anotación @Task
- D) No lo detecta, hay que especificarlo

> *Explicación:* Si `task.length === 1 && task.toString().includes('actor')`, recibe el Actor. Si no, recibe el Page. Esto permite migrar gradualmente.

---

**🔟 ¿Por qué NO se puede simplemente reemplazar todo POM con Screenplay de golpe?**
- A) **Porque ~152 tests existentes necesitan migración gradual** ✅
- B) Porque Screenplay es incompatible con TypeScript
- C) Porque Playwright no soporta Screenplay
- D) Porque POM es más rápido

> *Explicación:* La migración es TASK por TASK, no se puede detener el proyecto para reescribir todo. El puente bidireccional permite la coexistencia.

---

**1️⃣1️⃣ ¿Qué ventaja tiene Screenplay que POM no puede lograr sin acoplamiento?**
- A) Tests más rápidos
- B) **Tasks que combinan UI + API dentro de un mismo Actor** ✅
- C) Tests sin navegador
- D) Tests en paralelo

> *Explicación:* Una Task puede recibir el Actor y acceder tanto al navegador como a servicios API mediante las habilidades del Actor.

---

**1️⃣2️⃣ ¿Qué patrón usa Logística (Productos-Stock, Movimientos)?**
- A) Screenplay
- B) **POM + Fixture** ✅
- C) Data-Driven
- D) Keyword-Driven

> *Explicación:* Logística se construyó primero y usa POM clásico con fixtures que inyectan Page Objects.

---

### Preguntas Nivel 4: Código

**1️⃣3️⃣ ¿Qué propiedad de una Task genera el nombre del `test.step()` automático?**
- A) `task.name`
- B) **`task.displayName`** ✅
- C) `task.title`
- D) `task.label`

> *Explicación:* Cuando se asigna `fn.displayName = 'Buscar y agregar item'`, el Actor lo usa como nombre del step en el reporte.

---

**1️⃣4️⃣ ¿Cuántas líneas tiene el Page Object más grande del proyecto?**
- A) 200
- B) **534 (EmisionPage.ts)** ✅
- C) 1000
- D) 150

> *Explicación:* `EmisionPage.ts` tiene 534 líneas y mezcla lógica de emisión, pedidos y otras funciones — el典型 "Dios Objeto".

---

**1️⃣5️⃣ ¿Qué permite el puente bidireccional de `Cajero.intentaRealizar()`?**
- A) Correr tests en 2 navegadores
- B) **Migrar TASK por TASK sin romper tests existentes** ✅
- C) Usar 2 actores simultáneamente
- D) Correr tests en paralelo

> *Explicación:* Tasks nuevas reciben Actor, tasks legacy reciben Page. Se pueden migrar de a una sin cambiar los tests que usan las otras.

---

### Preguntas Nivel 5: Caso Real — Creación de Ítems POM

**1️⃣6️⃣ ¿Cuántos Page Objects manejan la creación de ítems en Logística?**
- A) 1
- B) **5 (ItemFormBasePage + 4 subclases)** ✅
- C) 17
- D) 6

> *Explicación:* `ItemFormBasePage` (base) + `ProductoFormPage`, `RecetaFormPage`, `ListaFormPage`, `ComboFormPage`. Cada tipo de ítem tiene su propio POM.

---

**1️⃣7️⃣ ¿Qué pasa si `punto-venta-items.setup.ts` falla en el ítem #12 de 17?**
- A) Hay que empezar de cero
- B) **El checkpoint persiste el progreso y retoma desde el #12** ✅
- C) Se reintenta automáticamente 3 veces
- D) El setup entero se considera fallido

> *Explicación:* `setup-checkpoint.ts` guarda qué ítems ya se crearon. En el próximo intento, los 11 primeros se saltan y retoma desde el que falló.

---

**1️⃣8️⃣ ¿Qué módulo contiene los POMs `ProductoFormPage`, `RecetaFormPage`?**
- A) PuntoVenta
- B) **Logística** ✅
- C) Screenplay
- D) Emisiones

> *Explicación:* Viven en `src/pages/Logistica/` pero los importa el setup de PuntoVenta (`punto-venta-items.setup.ts`). Ejemplo de cross-module reuse.

---

# 🔬 Bloque 2: Pipeline de Precondición + Captura de ID

## 📡 El Network Intercept

Este es **el patrón más importante** del framework. Cómo creamos datos, capturamos su ID via API, y lo reusamos en validaciones.

### ✨ Paso 1: Crear data y capturar ID

```typescript
// ─── En el test ───
const pedido: EmisionOutputRef = {current: null};   // ← contenedor mutable

await cajero.intentaRealizar(
    SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
    SeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
    BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
    RegistrarPedido(pedido)                          // ← Task muta el ref
);

const correlativo = pedido.current?.correlativo ?? '';
expect(correlativo).not.toBe('');                    // ← guard: fail fast
```

### 🔧 ¿Cómo captura el correlativo? Network Intercept

```typescript
// ─── EmisionPage.guardarPedido() ───
async guardarPedido(): Promise<EmisionResult> {
    // ⚠️ REGLA DE ORO: Listener ANTES de la acción
    const responsePromise = this.page.waitForResponse(
        (resp) => resp.url().includes('DocumentosContables/Emisiones')
              && resp.status() === 200,
        {timeout: 30_000},
    );

    await this.clickGuardarPedido();  // ← Acción

    const response = await responsePromise;  // ← Espera respuesta
    const body = await response.json();

    const nombrePdf: string = body.FilePdf?.Nombre ?? '';
    const serie = nombrePdf.split('-')[0];              // "PD01"
    const correlativo = String(body.CorrelativoDocumento ?? '');
    const comprobanteId = body.IdComprobante ?? 0;

    return {serie, correlativo, comprobanteId};
}
```

> ⚠️ **Regla de oro del Network Intercept**: El `waitForResponse` se registra SIEMPRE antes del click. Si se hiciera al revés, hay race condition y el test falla intermitentemente.

### 🔗 Paso 2: Usar el ID capturado

```typescript
const referenciaPedido = `PD01-${correlativo}`;

// Validación visual
expect(await cajero.pregunta(TarjetaPedidoVisible(referenciaPedido))).toBe(true);

// Validación de datos
expect(await cajero.pregunta(TarjetaPedidoContieneTexto(
    referenciaPedido, CLIENTES.EMPRESA_RUC_AUTO.nombre
))).toBe(true);

// Validación de acciones disponibles
expect(await cajero.pregunta(TarjetaPedidoTieneOpciones(referenciaPedido))).toBe(true);
```

---

## 🎯 Kahoot — Bloque Captura de ID

**1️⃣ ¿Por qué se registra `waitForResponse` ANTES del click?**
- A) Porque TypeScript lo exige
- B) **Para evitar race conditions** ✅
- C) Porque el click tarda 30s
- D) No hay diferencia

> *Explicación:* Si el click se ejecuta antes del listener, la respuesta de la API puede llegar antes de que empecemos a escuchar, y el test queda esperando para siempre (timeout).

---

**2️⃣ ¿Qué técnica usa el framework para capturar el correlativo sin parsear el DOM?**
- A) XPath
- B) **Network Intercept (`waitForResponse`)** ✅
- C) Leer localStorage
- D) WebSocket

> *Explicación:* Se intercepta la respuesta HTTP de la API de emisiones (`DocumentosContables/Emisiones`), se parsea el JSON y se extrae `CorrelativoDocumento`.

---

**3️⃣ ¿Qué es `EmisionOutputRef`?**
- A) Una clase que guarda el resultado en disco
- B) **Un contenedor mutable `{current: null}` que la Task muta para devolver el resultado** ✅
- C) Un tipo de comprobante
- D) Una función de callback

> *Explicación:* Es un objeto con una propiedad `current` que se pasa por referencia a la Task. La Task asigna el resultado y el test lo lee después.

---

**4️⃣ ¿Qué endpoint intercepta `guardarPedido()`?**
- A) `/api/login`
- B) **`DocumentosContables/Emisiones`** ✅
- C) `/api/productos`
- D) `/api/sunat`

> *Explicación:* El método espera una respuesta HTTP 200 de la URL que contenga `DocumentosContables/Emisiones` con el JSON de la emisión.

---

# ☀️ Bloque 3: Validación SUNAT (Async State Machine)

## 📡 Estrategia de no-fallo

La SUNAT es asíncrona — el comprobante no se acepta al instante. El framework usa una **máquina de estados** que NUNCA falla el test.

### Servicio de polling

```typescript
export class SunatEstadoApi {
    async obtenerEstado(idComprobanteERP: number): Promise<number> {
        const url = `${env.apiUrl}PuntoVenta/api/v2/DocumentosContables/Consultas`;
        const response = await this.request.get(url, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
        return response.IdestadoSunat;
    }

    async esperarEstadoFinal(id: number, options?: WaitSunatOptions) {
        return waitForEstadoSunatFinal(
            () => this.obtenerEstado(id),
            options,  // default: poll cada 3s, max 60s
        );
    }
}
```

### Máquina de estados

```typescript
export enum EstadoSunat {
    PENDIENTE_ENVIO     = 1,   // Estado inicial
    ACEPTADA            = 2,   // ✅ Éxito
    ACEPTADA_OBSERVADA  = 3,   // ✅ Con observaciones
    PENDIENTE_RESPUESTA = 4,   // ⏳ Todavía polling
    RECHAZADA           = 5,   // ❌ Rechazada
    IGNORADA            = 6,
    ERRONEO             = 7,
    NO_DISPONIBLE       = 8,
    ELIMINADO           = 9,
    DADO_DE_BAJA        = 10,
}
```

### Estrategia

| Estado | Acción |
|:-------|:-------|
| `PENDIENTE_ENVIO` | Poll cada 3s, hasta 60s |
| `ACEPTADA` | ✅ Log success |
| `ACEPTADA_OBSERVADA` | ✅ Log success |
| `RECHAZADA` | ⚠️ **WARNING** — test continúa |
| `PENDIENTE_RESPUESTA` | Timeout → ⚠️ **WARNING** — test continúa |

**Filosofía:** La SUNAT puede fallar por razones ajenas al código. El test reporta pero no se rompe. Los warnings se revisan en dashboard, no en CI blocker.

### Integración en el test

```typescript
await test.step('Then: validar estado SUNAT desde API', async () => {
    return await busquedaComprobantes.validarEstadoSunat();
});

await test.step('And: abrir bitácora y verificar emisión', async () => {
    await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
    await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
    await busquedaComprobantes.cerrarBitacora();
});
```

---

## 🎯 Kahoot — Bloque SUNAT

**1️⃣ ¿Qué pasa si la SUNAT rechaza un comprobante?**
- A) El test falla inmediatamente
- B) **Se logea un WARNING y el test continúa** ✅
- C) Se reintenta automáticamente
- D) Se cancela toda la ejecución

> *Explicación:* La SUNAT es un sistema externo. Si rechaza, el test lo reporta como warning para revisión, pero no bloquea el pipeline.

---

**2️⃣ ¿Cuánto es el timeout máximo de espera SUNAT?**
- A) 10 segundos
- B) **60 segundos** ✅
- C) 30 segundos
- D) 120 segundos

> *Explicación:* El polling espera hasta 60s con intervalos de 3s entre cada intento. Si no hay respuesta en ese tiempo, se logea warning.

---

**3️⃣ ¿Qué estado SUNAT indica éxito?**
- A) PENDIENTE_ENVIO
- B) **ACEPTADA (2)** ✅
- C) RECHAZADA
- D) NO_DISPONIBLE

> *Explicación:* `EstadoSunat.ACEPTADA = 2` significa que SUNAT procesó y aceptó el comprobante.

---

**4️⃣ ¿Cómo se obtiene el token para llamar a la API de SUNAT?**
- A) Con un login separado
- B) **Del `localStorage` del navegador, cacheado por 50 minutos** ✅
- C) De un archivo .env
- D) No necesita token

> *Explicación:* `getCachedToken(page)` extrae el JWT del localStorage del navegador donde ya hicimos login, sin necesidad de autenticación adicional.

---

# 📦 Bloque 4: Validación de Stock vía API (Kardex)

## 🔄 Cross-module reuse

**KardexApi** es un servicio del módulo de **Logística** que se reutiliza en los tests de **PuntoVenta**. No hay duplicación de código entre módulos.

### Patrón antes-después

```typescript
// ─── 1. CAPTURAR stock ANTES de emitir ───
let saldoAntes = 0;
await test.step('And: capturar stock actual del producto vía API', async () => {
    saldoAntes = await kardexApi.obtenerSaldoPorProducto({
        codigoProducto: ITEMS_PV.PRODUCTO_GRAVADO.codigo,
        almacenFiltro: 'AUTO',
    });
});

// ─── 2. EMITIR ───
await test.step('When: agregar producto y emitir', async () => {
    await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
    await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
    await emisionPage.emitirConEfectivoExacto();
});

// ─── 3. CAPTURAR stock DESPUÉS y COMPARAR ───
await test.step('Then: verificar que el stock disminuyó vía API', async () => {
    const saldoDespues = await kardexApi.obtenerSaldoPorProducto({
        codigoProducto: ITEMS_PV.PRODUCTO_GRAVADO.codigo,
        almacenFiltro: 'AUTO',
    });
    expect(saldoDespues).toBe(saldoAntes - 1);  // Disminuyó exactamente 1
});
```

### Inyección vía fixture

```typescript
// validacion-fixture.ts — reusa KardexApi desde Logística
export const test = emisionTest.extend({
    kardexApi: async ({ request, page }, use) => {
        const token = await getCachedToken(page);
        const almacenesApi = new AlmacenesApi(request, token);
        const almacenesQuery = await almacenesApi.buildAlmacenesQuery();
        await use(new KardexApi(request, token, almacenesQuery));
    },
});
```

---

## 🎯 Kahoot — Bloque Kardex/Stock

**1️⃣ ¿Qué servicio de Logística se reutiliza en los tests de PuntoVenta?**
- A) **KardexApi** ✅
- B) SunatEstadoApi
- C) ComprobanteApi
- D) NavigationPage

> *Explicación:* `KardexApi` es un servicio de Logística (consulta de stock) que se inyecta en los fixtures de PuntoVenta. No hay código duplicado.

---

**2️⃣ ¿Cuál es el patrón de validación de stock?**
- A) Validar solo después
- B) **Capturar stock antes → emitir → capturar stock después → comparar** ✅
- C) Validar solo antes
- D) No se valida stock

> *Explicación:* Patrón before/after: se obtiene el saldo vía API, se ejecuta la acción, se obtiene el saldo de nuevo, y se verifica que la diferencia sea exactamente 1 unidad.

---

**3️⃣ ¿Qué validación es específica de Pedido pero NO de Boleta/Factura?**
- A) Validar que SUNAT aceptó
- B) **Validar que NO hay descargo de inventario** ✅
- C) Validar que el stock disminuyó
- D) Validar el correlativo

> *Explicación:* Los pedidos no afectan stock físico (a diferencia de boletas/facturas). `BitacoraComprobante.noMuestraDescargoInventario()` valida exactamente eso.

---

# 🆕 Bloque 5: Pedidos PV-20 — Ciclo de Vida Completo

## 🧪 Las 6 dimensiones

Los pedidos no son solo "emitir". Cubrimos todo el ciclo de vida:

```
Emisión → Validación → Listar/Buscar → Cargar → Compartir/Descargar
```

| Archivo | Tests | IDs | ¿Qué cubre? |
|:---------|:-----:|:---|:------------|
| PV-20-pedido-emision | 4 | `@PV-20.1-4` | Con/sin cliente, sin documento, sin stock |
| PV-20-pedido-validaciones | 2 | `@PV-20.5-6` | No genera XML, acciones post-registro |
| PV-20-pedido-lista | 5 | `@PV-20.7-11` | Listar, buscar por #/cliente/caja, ver detalle |
| PV-20-pedido-buscar-cargar | 2 | `@PV-20.12-13` | Cargar pedido emitido + actualizar |
| PV-20-pedido-compartir-descargar | 3 | `@PV-20.14-16` | Email, PDF, imprimir |
| PV-20-pedido-busqueda-correlativo | 1 | `@PV-20.17` | Buscar por correlativo |

### Diferencia crítica con Boleta/Factura

```typescript
// En Pedidos — NO descarga inventario
expect(await cajero.pregunta(
    BitacoraComprobante.noMuestraDescargoInventario(resultadoPedido)
)).toBe(true);

// En Boleta/Factura — SÍ descarga inventario
expect(await cajero.pregunta(
    BitacoraComprobante.muestraDescargoInventario(resultado)
)).toBe(true);
```

---

## 🎯 Kahoot — Bloque Pedidos

**1️⃣ ¿Cuántos tests de Pedidos (PV-20) tenemos?**
- A) 6
- B) 12
- C) **17** ✅
- D) 27

---

**2️⃣ ¿Cuántos archivos de test cubren Pedidos?**
- A) 2
- B) **6** ✅
- C) 9
- D) 17

---

**3️⃣ ¿Qué diferencia clave tiene un Pedido vs una Boleta en la validación?**
- A) El pedido valida SUNAT
- B) **El pedido NO descarga inventario; la boleta SÍ** ✅
- C) No hay diferencia
- D) El pedido usa otro navegador

---

**4️⃣ ¿Qué prueba el test `@PV-20.12`?**
- A) Emitir pedido sin cliente
- B) **Cargar pedido emitido previamente** ✅
- C) Compartir pedido por email
- D) Buscar por correlativo

---

**5️⃣ ¿Qué técnica se usa para descargar el PDF de un pedido?**
- A) `page.goto()`
- B) **`page.waitForEvent('download')`** ✅
- C) `page.evaluate()`
- D) `page.request()`

---

# 🆕 Bloque 6: Cotizaciones PV-19 — El Módulo Más Joven

## ⚠️ Gaps identificados

Solo **6 tests** — el módulo con más oportunidades de expansión.

### Tests que SÍ tenemos

```
PV-19.1: Emitir cotización con cliente registrado      ✅
PV-19.2: Emitir cotización con cliente sin documento    ✅
PV-19.3: No permitir emitir sin productos               ✅
PV-19.4: Emitir cotización con producto sin stock       ✅
PV-19.5: Cotización con imagen y descripción            ✅
PV-19.6: Cotización con vigencia configurada            ✅
```

### Validaciones comentadas

```typescript
// En PV-19-cotizacion-emision.spec.ts — LÍNEAS COMENTADAS:
// expect(await cajero.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
// expect(await cajero.pregunta(BitacoraComprobante.noMuestraDescargoInventario())).toBe(true);
```

> 🔍 **¿Por qué están comentadas?** La funcionalidad de post-emisión de cotizaciones aún no está completa en el ERP. Los tests comentados marcan el camino de lo que falta implementar.

### Lo que FALTA (gaps identificados)

| Funcionalidad | Impacto |
|:--------------|:--------|
| Conversión Cotización → Pedido | Flujo de negocio real |
| Conversión Cotización → Factura/Boleta | Venta directa desde cotización |
| Compartir cotización por email | Funcionalidad existente sin test |
| Descargar PDF de cotización | Funcionalidad existente sin test |
| Cotización con descuentos | Cálculos financieros |
| Vigencia expirada → advertencia | UX de oferta vencida |

---

## 🎯 Kahoot — Bloque Cotizaciones

**1️⃣ ¿Cuántos tests de Cotizaciones (PV-19) tenemos actualmente?**
- A) **6** ✅
- B) 12
- C) 17
- D) 27

---

**2️⃣ ¿Por qué hay assertions comentadas en los tests de Cotización?**
- A) Porque el equipo no tuvo tiempo
- B) **Porque la funcionalidad post-emisión de cotizaciones aún no está completa en el ERP** ✅
- C) Porque rompían el CI
- D) Para que el test sea más rápido

---

**3️⃣ ¿Qué funcionalidad de cotización NO está testeada?**
- A) Emitir con cliente registrado
- B) **Convertir Cotización → Pedido** ✅
- C) Emitir con imagen
- D) Configurar vigencia

---

**4️⃣ ¿Qué valida `@PV-19.5`?**
- A) Emitir cotización sin cliente
- B) **Cotización con imagen y descripción (Vista Previa)** ✅
- C) Cotización con vigencia
- D) No permitir sin productos

---

# 🔐 Bloque 7: Sistema de Sesiones (Auth)

## 📍 Mapa de Archivos

El sistema de sesión NO está en un solo archivo — son **4 archivos** que se conectan entre sí:

```
📁 tests/
   └── auth.setup.ts                        ← Login + storageState

📁 src/
   ├── utils/setup-state.ts                 ← Cache de setups (279 líneas)
   └── fixtures/auth/token-cache.fixture.ts ← Cache de token JWT (21 líneas)

📁 helpers/Logistica/
   └── get-access-token.helper.ts           ← Extrae JWT de localStorage

📁 playwright/.auth/
   ├── user.{envGroup}__{account}.json      ← Sesión serializada (auto-generado)
   └── setup-state.json                     ← Estado de setups (auto-generado)
```

```
auth.setup.ts (login + storageState)
    │
    ├── setup-state.ts ─── decide si skip o re-login
    │       │
    │       ├── playwright/.auth/user.{envGroup}__{account}.json ✅
    │       └── playwright/.auth/setup-state.json ✅
    │
    ├── fixture layer: cada test arranca CON SESIÓN
    │
    └── Token API: get-access-token.helper.ts
                       │
                       ▼
                   token-cache.fixture.ts  ← 50min TTL
                       │
                  ┌────┴────┐
                  ▼         ▼
               SunatApi  KardexApi
```

---

## 📄 Archivo 1: `tests/auth.setup.ts` (83 líneas)

**Ruta real:** `tests/auth.setup.ts`

Es el **Setup Project** de Playwright — corre antes que todos los tests y ejecuta el login real.

### Cómo sabe qué archivo de sesión usar:

```typescript
// tests/auth.setup.ts — líneas 11-16
function resolveStorageStatePath(): string {
    const envGroup = detectEnvironmentGroup();  // ← "crt-group" | "prd"
    const account = detectAccount();            // ← email del usuario
    const slug = generarSlugCache(envGroup, account);
    return path.join(authDir, `user.${slug}.json`);
    // Resultado: playwright/.auth/user.crt-group__admin@empresa.com.json
}
```

### El flujo completo del login:

```typescript
// tests/auth.setup.ts — líneas 32-83
setup('authenticate', async ({page}) => {
    // 1. CHECKEAR si ya hay sesión válida
    if (shouldSkipSetup(SETUP_NAME) && tieneSesionReal()) {
        console.log(`[setup-state] ${SETUP_NAME} already completed`);
        return;  // ← SKIP: ya estamos logueados
    }

    // 2. ASEGURAR que el directorio existe
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, {recursive: true});
    }

    // 3. LIMPIAR sesión previa (crítico para entornos compartidos)
    await page.context().clearCookies();
    await page.goto('/auth/login');
    await page.evaluate(() => localStorage.clear());

    // 4. LOGIN REAL con credenciales de config/env.ts
    await page.getByRole('textbox', {name: /Coloca aquí tu correo/i})
        .fill(env.userEmail);
    await page.getByRole('textbox', {name: /Coloca aquí tu contraseña/i})
        .fill(env.userPassword);
    await page.getByRole('button', {name: /INICIAR SESION/i}).click();
    await expect(page).not.toHaveURL(/auth\/login/, {timeout: 15000});

    // 5. SERIALIZAR sesión a archivo JSON
    const authFile = resolveStorageStatePath();
    await page.context().storageState({path: authFile});
    console.log(`Sesión guardada en ${authFile}`);

    // 6. MARCAR como completado en setup-state.json
    markSetupComplete(SETUP_NAME);
});
```

### ⚠️ ¿Por qué limpia cookies + localStorage?

Si corres tests en `crt-2` con usuario A y luego en `crt-3` con usuario B, el navegador puede mantener la sesión vieja y hacer **redirect loop**. La limpieza forzada previene contaminación entre entornos y cuentas.

### Validación de sesión real antes de skip:

```typescript
// tests/auth.setup.ts — líneas 18-30
function tieneSesionReal(): boolean {
    const authFile = resolveStorageStatePath();
    try {
        if (!fs.existsSync(authFile)) return false;
        const content = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
        if (content.cookies?.length > 0) return true;
        if (content.origins?.length > 0) return true;
        return false;
    } catch {
        return false;
    }
}
```

No solo verifica que el archivo existe — verifica que **contenga datos reales** (cookies o localStorage), no un `{}` vacío.

---

## 📄 Archivo 2: `src/utils/setup-state.ts` (279 líneas)

**Ruta real:** `src/utils/setup-state.ts`

Es el **sistema de cache de setups** — persiste en disco qué setups ya se ejecutaron y en qué entorno+cuenta.

### Estructura de datos persistida:

```typescript
// src/utils/setup-state.ts — líneas 57-64
export interface SetupState {
    environment: string;              // "crt-group" | "prd"
    account?: string;                 // email del usuario
    setups: Record<string, {          // mapa: setup → estado
        completed: boolean;
        timestamp: string;            // ISO datetime
    }>;
}
```

### Orden de decisión de `shouldSkipSetup` (6 pasos):

```typescript
// src/utils/setup-state.ts — líneas 142-181
export function shouldSkipSetup(setupName: string): boolean {
    // 1. Variable de entorno SKIP_* (backward compat — prioridad absoluta)
    if (envVar === '1') return true;

    // 2. No hay entries registradas → NO skip
    // 3. Cambió el grupo de ambiente (crt-group ↔ prd) → NO skip
    // 4. Cambió la cuenta (USER_EMAIL) → NO skip
    // 5. Setup está completado → SKIP ✅
    // 6. Default → NO skip (ejecutar login)
}
```

### Setups registrados por módulo:

```typescript
// src/utils/setup-state.ts — líneas 27-33
export const PV_SETUP_NAMES = ['auth', 'punto-venta-datos', 'punto-venta-items'] as const;
export const LOG_SETUP_NAMES = ['auth', 'datos-adicionales'] as const;
```

### Funciones de la API pública:

| Función | Línea | Qué hace |
|:--------|:-----:|:---------|
| `detectEnvironmentGroup()` | 72 | Normaliza `APP_ENV` → `"crt-group"` o `"prd"` |
| `detectAccount()` | 81 | Lee `env.userEmail` → email en minúsculas |
| `loadSetupState()` | 111 | Lee `setup-state.json` del disco |
| `saveSetupState()` | 127 | Escribe `setup-state.json` al disco |
| `shouldSkipSetup(name)` | 142 | Decide si skip o re-ejecutar (6 pasos) |
| `markSetupComplete(name)` | 187 | Marca setup como completado + timestamp |
| `markSetupIncomplete(name)` | 204 | Elimina entrada (fuerza re-ejecución) |
| `getSetupStateSummary()` | 218 | Resumen legible para reportes |
| `areAllSetupsComplete()` | 264 | Chequea si todos los setups están hechos |

### Ejemplo de estado persistido:

```json
// playwright/.auth/setup-state.json
{
  "environment": "crt-group",
  "account": "admin@erp.com",
  "setups": {
    "auth": {
      "completed": true,
      "timestamp": "2026-05-27T10:30:00.000Z"
    },
    "punto-venta-datos": {
      "completed": true,
      "timestamp": "2026-05-27T10:30:15.000Z"
    }
  }
}
```

Si cambias `APP_ENV=crt-2` a `APP_ENV=prd` o cambias `USER_EMAIL`, el sistema **invalida automáticamente** todos los setups y fuerza re-login.

---

## 📄 Archivo 3: `src/fixtures/auth/token-cache.fixture.ts` (21 líneas)

**Ruta real:** `src/fixtures/auth/token-cache.fixture.ts`

Cache **en memoria** del JWT para evitar leer `localStorage` en cada llamada API.

```typescript
// src/fixtures/auth/token-cache.fixture.ts — archivo completo
import {Page} from '@playwright/test';
import {getAccessToken} from '../../helpers/Logistica/get-access-token.helper';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const CACHE_TTL_MS = 50 * 60 * 1000;  // 50 minutos

export async function getCachedToken(page: Page): Promise<string> {
    const now = Date.now();

    // Cache hit: token vigente → devolver sin tocar el navegador
    if (cachedToken && tokenExpiry && now < tokenExpiry) {
        return cachedToken;
    }

    // Cache miss o expirado: extraer token fresco del navegador
    cachedToken = await getAccessToken(page);
    tokenExpiry = now + CACHE_TTL_MS;

    return cachedToken;
}
```

### ¿Por qué 50 minutos?

El ERP usa JWT con expiración de 1 hora. El cache de 50 minutos da un margen de 10 minutos antes de que el token expire realmente, evitando errores 401 en llamadas API.

### ¿Dónde se usa?

```typescript
// En validacion-fixture.ts — inyecta servicios que necesitan token
export const test = emisionTest.extend({
    sunatApi: async ({ request, page }, use) => {
        const token = await getCachedToken(page);
        await use(new SunatEstadoApi(request, token));
    },
    kardexApi: async ({ request, page }, use) => {
        const token = await getCachedToken(page);
        // ...
        await use(new KardexApi(request, token, almacenesQuery));
    },
});
```

---

## 📄 Archivo 4: `src/helpers/Logistica/get-access-token.helper.ts` (29 líneas)

**Ruta real:** `src/helpers/Logistica/get-access-token.helper.ts`

El helper más simple — extrae el JWT del navegador.

```typescript
export async function getAccessToken(page: Page): Promise<string> {
    const token = await page.evaluate(() =>
        localStorage.getItem('AccessToken')
    );

    if (!token) {
        throw new Error(
            'getAccessToken: No se encontró AccessToken en localStorage. ' +
            'Verifica que el storageState esté configurado.'
        );
    }

    return token;
}
```

**Está en `helpers/Logistica/` por herencia histórica** — Logística se construyó primero. Ahora lo usan también los tests de PuntoVenta (cross-module reuse).

---

## 🔗 Diagrama de Conexiones Reales

```
                        playwright.config.ts
                        define los Setup Projects
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
          auth.setup.ts              pv-items-setup.ts
          (tests/auth.setup.ts)      (...)
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
   setup-state.ts  tieneSesionReal()  resolveStorageStatePath()
   ─────────────   ────────────────   ──────────────────────
   src/utils/      Verifica si el     Genera nombre del
   setup-state.ts  archivo JSON       archivo según
   (279 líneas)    tiene datos reales  envGroup + account
         │
         ├── Lee/Escribe: playwright/.auth/setup-state.json
         │
         └── Funciones que exporta:
             shouldSkipSetup(name)
             markSetupComplete(name)
             detectEnvironmentGroup()
             detectAccount()
             getSetupStateSummary()
             areAllSetupsComplete()

                    ▼
         playwright/.auth/user.{envGroup}__{account}.json
         ─────────────────────────────────────────────────
         Archivo JSON con cookies + localStorage
         Generado por page.context().storageState()
         Reutilizado en CADA test via storageState en config
                    │
                    ▼
         tests usan fixtures que inyectan páginas con sesión
                    │
                    ▼
         token-cache.fixture.ts ← getAccessToken helper
         src/fixtures/auth/        src/helpers/Logistica/
         (21 líneas)               (29 líneas)
                    │
                    ▼
          sunatApi / kardexApi / comprobanteApi
          (llamadas API autenticadas sin login extra)
```

---

## 👥 Separación de Usuarios — ¿Cómo trabajan N personas sin pisarse?

Este es el punto clave que responde: **¿cómo hacen 5 QAs para correr tests sin que sus sesiones se mezclen?**

### El problema real

```
Antes (sin separación):
  QA-1 corre en crt-3 con usuario A  →  storageState: user.json
  QA-2 corre en crt-3 con usuario B  →  storageState: user.json (SOBREESCRITO)
  Resultado: QA-1 falla porque su sesión fue reemplazada ❌
```

### La solución: storageState dinámico por entorno + cuenta

```
Ahora (con separación):
  QA-1: APP_ENV=crt-3, USER_EMAIL=junior@mail.com
       → playwright/.auth/user.crt-group__junior_at_mail.com.json ✅

  QA-2: APP_ENV=crt-3, USER_EMAIL=erp2auto@mail.com
       → playwright/.auth/user.crt-group__erp2auto_at_mail.com.json ✅

  QA-3: APP_ENV=prd, USER_EMAIL=automatizacion@mail.com
       → playwright/.auth/user.prd__automatizacion_at_mail.com.json ✅

  ¡Ninguno pisa el storageState del otro!
```

### ¿Cómo funciona? 3 pasos

#### Paso 1 — `config/environment.env` tiene TODAS las cuentas

```env
# Cada QA comenta/descomenta su cuenta según necesite
APP_ENV=crt-3

# Cuentas disponibles (cada QA tiene la suya):
#USER_EMAIL=gutierrezmamanijhuniorb+122@gmail.com
#USER_EMAIL=gutierrezmamanijhuniorb+133@gmail.com
#USER_EMAIL=gutierrezmamanijhuniorb+144@gmail.com
#USER_EMAIL=erp2auto1@mail.com
#USER_EMAIL=gutierrezmamanijhuniorb+199@gmail.com

USER_EMAIL=automatizacionerp2@gmail.com  ← activa
USER_PASSWORD=Qa123456
```

Cada miembro del equipo descomenta SU cuenta. Nunca hay que tocar código.

#### Paso 2 — `setup-state.ts` normaliza entorno + cuenta

```typescript
// src/utils/setup-state.ts
export function detectEnvironmentGroup(): string {
    const env = (process.env.APP_ENV ?? '').trim().toLowerCase();
    return env === 'prd' ? 'prd' : 'crt-group';      // crt / crt-2 / crt-3 → "crt-group"
}

export function detectAccount(): string {
    return (env.userEmail ?? '').trim().toLowerCase() || 'unknown';
}
```

**Normaliza los entornos:** `crt`, `crt-2`, `crt-3`, `crt-4` todos → `crt-group`. Así si cambias de `crt-2` a `crt-3`, el storageState se REUSA (misma cuenta, mismo grupo). Si cambias a `prd`, se invalida.

#### Paso 3 — `playwright.config.ts` resuelve el path dinámico

```typescript
// playwright.config.ts — línea 18
function resolveStoragePath(): string {
    const envGroup = detectEnvironmentGroup();   // "crt-group" | "prd"
    const account = detectAccount();             // "junior@mail.com"
    const slug = generarSlugCache(envGroup, account);
    // → "crt-group__junior_at_mail.com"

    const fullPath = `playwright/.auth/user.${slug}.json`;

    // Si es primera vez, crea placeholder vacío (evita error ENOENT)
    if (!existsSync(fullPath)) {
        writeFileSync(fullPath, '{}', 'utf-8');
    }
    return fullPath;   // → playwright/.auth/user.crt-group__junior_at_mail.com.json
}
```

### ¿Qué pasa si cambia el usuario o entorno?

```
Escenario: Hoy corres con cuenta A en crt-3
           Mañana cambias a cuenta B en prd

1. playwright.config.ts resuelve:
   → user.prd__cuentaB_at_mail.com.json (archivo NUEVO, no existe)

2. auth.setup.ts corre:
   → shouldSkipSetup('auth') detecta que account cambió
   → Retorna FALSE → fuerza login real
   → Guarda storageState en el NUEVO path

3. setup-state.ts:
   → El estado guardado dice environment="crt-group", account="cuentaA"
   → Ahora environment="prd", account="cuentaB"
   → TODOS los setups se invalidan automáticamente
   → Se re-ejecutan con la nueva cuenta

4. El storageState de cuentaA queda intacto:
   → playwright/.auth/user.crt-group__cuentaA_at_mail.com.json
   → NO se borra, NO se pisa
```

### ¿Qué pasa si 2 QAs corren en el MISMO entorno con la MISMA cuenta?

Ahí SÍ pueden pisarse. Por eso `fullyParallel: true` está desactivado para PuntoVenta (`workers: 1`) y Logística (`workers: 1`). El proyecto está configurado para que en cada módulo solo corra 1 worker a la vez.

### Mapa visual: cómo se ven los archivos en disco

```
playwright/.auth/
├── setup-state.json                          ← Estado de setups (entorno, cuenta, timestamps)
├── user.crt-group__junior_at_mail.com.json   ← QA Junior (crt-3)
├── user.crt-group__erp2auto_at_mail.com.json ← QA Auto (crt-3)
├── user.prd__automatizacion_at_mail.com.json ← QA Prod (prd)
├── user.crt-group__gutierrez122_at_gmail.com.json  ← QA 122 (crt-2)
└── user.crt-group__gutierrez133_at_gmail.com.json  ← QA 133 (crt-2)
```

**Cada archivo contiene:** cookies + localStorage de la sesión. Se genera una vez y se reusa hasta que el entorno o cuenta cambien.

---

## 🎯 Kahoot — Bloque Sesiones

### Preguntas Nivel 1: Archivos y Rutas

**1️⃣ ¿Cuál es la ruta REAL del archivo que ejecuta el login?**
- A) `src/utils/auth.ts`
- B) **`tests/auth.setup.ts`** ✅
- C) `src/fixtures/auth/login.ts`
- D) `helpers/auth.setup.ts`

> *Explicación:* `tests/auth.setup.ts` es el Setup Project de Playwright — corre antes que todos los tests en el pipeline de autenticación.

---

**2️⃣ ¿Dónde está el archivo `setup-state.ts`?**
- A) `tests/setup-state.ts`
- B) **`src/utils/setup-state.ts`** ✅
- C) `playwright/.auth/setup-state.ts`
- D) `config/setup-state.ts`

> *Explicación:* `src/utils/setup-state.ts` (279 líneas) es el gestor centralizado de estado de setups. Lee y escribe `playwright/.auth/setup-state.json`.

---

**3️⃣ ¿Dónde se guarda el `storageState` serializado?**
- A) En `tests/.auth/`
- B) **En `playwright/.auth/user.{slug}.json`** ✅
- C) En `node_modules/`
- D) En `config/state.json`

> *Explicación:* `auth.setup.ts` → `resolveStorageStatePath()` genera: `playwright/.auth/user.{envGroup}__{account}.json`

---

**4️⃣ ¿Qué archivo cachea el JWT para llamadas API?**
- A) `setup-state.ts`
- B) **`src/fixtures/auth/token-cache.fixture.ts`** ✅
- C) `auth.setup.ts`
- D) `helpers/Logistica/get-access-token.helper.ts`

> *Explicación:* `token-cache.fixture.ts` (21 líneas) mantiene el token en memoria con TTL de 50 minutos. Evita leer localStorage en cada llamada.

---

### Preguntas Nivel 2: Mecanismos

**5️⃣ ¿Cómo decide `auth.setup.ts` si debe saltarse el login?**
- A) Solo verifica si el archivo storageState existe
- B) **Llama a `shouldSkipSetup()` + verifica que el JSON tenga datos reales** ✅
- C) Siempre hace login, no hay skip
- D) Pregunta al usuario por consola

> *Explicación:* La función `tieneSesionReal()` (línea 18) verifica que el JSON tenga `cookies.length > 0` o `origins.length > 0` — no solo que el archivo exista.

---

**6️⃣ ¿Qué pasa si cambias `USER_EMAIL` entre ejecuciones?**
- A) El test falla
- B) **`shouldSkipSetup()` detecta el cambio y fuerza re-login** ✅
- C) Nada, reusa la sesión anterior
- D) Debes borrar manualmente la carpeta `.auth`

> *Explicación:* `setup-state.ts` línea 169 compara `state.account !== detectAccount()`. Si cambió, retorna `false` → fuerza re-ejecución.

---

**7️⃣ ¿Cuántos pasos tiene la lógica de `shouldSkipSetup()`?**
- A) 2
- B) **6** ✅
- C) 10
- D) 3

> *Explicación:* 1. SKIP env var → 2. No entries → 3. Env changed → 4. Account changed → 5. Completed → 6. Default (no skip)

---

**8️⃣ ¿Qué función de `setup-state.ts` genera un resumen legible del estado de setups?**
- A) `loadSetupState()`
- B) **`getSetupStateSummary()`** ✅
- C) `areAllSetupsComplete()`
- D) `detectEnvironmentGroup()`

> *Explicación:* `getSetupStateSummary()` (línea 218) retorna un string con ambiente, cuenta, y estado de cada setup particionado por módulo (PuntoVenta/Logistica).

---

### Preguntas Nivel 3: Conexiones

**9️⃣ ¿Cómo se conecta `token-cache.fixture.ts` con `get-access-token.helper.ts`?**
- A) No se conectan, son independientes
- B) **`getCachedToken()` llama a `getAccessToken()` en cache miss** ✅
- C) `getAccessToken()` llama a `getCachedToken()`
- D) Se comunican via WebSocket

> *Explicación:* En cache miss, `getCachedToken(page)` llama a `getAccessToken(page)` que ejecuta `localStorage.getItem('AccessToken')` en el navegador.

---

**🔟 ¿Por qué `get-access-token.helper.ts` está en `helpers/Logistica/` si lo usa PuntoVenta?**
- A) Por error, debería estar en shared
- B) **Por herencia histórica — Logística se construyó primero y ahora es cross-module** ✅
- C) Porque solo funciona con Logística
- D) Es un symlink

> *Explicación:* Es cross-module reuse: el helper vive en Logística pero `token-cache.fixture.ts` y `validacion-fixture.ts` lo importan para tests de PuntoVenta.

---

**1️⃣1️⃣ ¿Qué función genera el nombre del archivo `user.{slug}.json`?**
- A) `generarSlugCache()` desde `item-factory.ts` ✅
- B) `resolveStorageStatePath()` la construye
- C) Playwright lo genera automáticamente
- D) `detectEnvironmentGroup()`

> *Explicación:* `generarSlugCache(envGroup, account)` normaliza el nombre, y `resolveStorageStatePath()` arma la ruta completa.

---

**1️⃣2️⃣ ¿Dónde se inyecta `getCachedToken()` en los tests?**
- A) Directamente en cada test
- B) **En los fixtures (`validacion-fixture.ts`, etc.)** ✅
- C) En `playwright.config.ts`
- D) En cada Page Object

> *Explicación:* `validacion-fixture.ts` usa `getCachedToken(page)` dentro de su bloque `extend` para inicializar `sunatApi` y `kardexApi` — el test nunca ve el token.

---

### Preguntas Nivel 4: Separación de Usuarios

**1️⃣3️⃣ ¿Cómo evita el proyecto que 2 QAs se pisen la sesión al correr en el mismo entorno?**
- A) No pueden correr al mismo tiempo
- B) **Cada cuenta genera su propio archivo `user.{slug}.json`** ✅
- C) Se usa una cuenta compartida
- D) Playwright lo maneja automáticamente

> *Explicación:* El path del storageState incluye `detectAccount()` → `user.crt-group__email.json`. Cada cuenta = archivo diferente.

---

**1️⃣4️⃣ ¿Qué pasa si cambias de `APP_ENV=crt-2` a `APP_ENV=prd`?**
- A) El storageState se reusa
- B) **`shouldSkipSetup()` detecta el cambio de entorno y fuerza re-login** ✅
- C) Nada, la sesión sigue funcionando
- D) Hay que borrar la carpeta .auth manualmente

> *Explicación:* `detectEnvironmentGroup()` retorna "crt-group" para crt-2, pero "prd" para prd. Como cambió, el estado se invalida y los setups se re-ejecutan.

---

**1️⃣5️⃣ ¿Cuántos archivos `user.*.json` puede haber en `playwright/.auth/`?**
- A) Siempre 1
- B) **Uno por cada combinación (entorno × cuenta)** ✅
- C) 5 máximo
- D) Ilimitado, pero solo el activo se usa

> *Explicación:* Cada par (entorno, cuenta) genera un archivo distinto. Todos conviven sin pisarse. Solo el que coincide con la config actual se usa.

---

**1️⃣6️⃣ ¿Qué pasaría si 2 QAs usan la MISMA cuenta en el MISMO entorno?**
- A) Funciona perfecto
- B) **Se pisan el storageState — por eso los módulos usan `workers: 1`** ✅
- C) Playwright previene el conflicto
- D) Se lanza una excepción

> *Explicación:* Si usan la misma cuenta + mismo entorno, el storageState es el mismo archivo. `workers: 1` en los proyectos evita que 2 tests del mismo módulo corran simultáneamente.

---

# 🔄 Bloque 8: Integraciones Futuras

## 🌉 Flujo Cotización → Pedido → Factura

El **siguiente nivel** de testing: flujos cross-módulo que nadie testea todavía.

### Flujo de negocio real

```
Cotización (PV-19)
    │
    ├──→ Pedido (PV-20) → Aprobación → Factura/Boleta (PV-01)
    │
    └──→ Factura directa (PV-01)
```

### Preguntas sin responder (gaps)

| Pregunta | Estado |
|:---------|:-------|
| ¿Crear Cotización → Convertir a Pedido? | ❌ Sin test |
| ¿Cargar Pedido → Editar ítems → Emitir Factura? | ❌ Sin test |
| ¿El comprobante final tiene los mismos items + precios? | ❌ Sin test |
| ¿El stock se descuenta solo al facturar, no al pedir? | ❌ Sin test |
| ¿La sesión sobrevive a recarga de página? | ❌ Sin test |
| ¿Redirige al login cuando la sesión expira? | ❌ Sin test |

### Screenplay Questions propuestas

```typescript
// ¿El botón "Generar pedido desde cotización" está visible?
CotizacionConvertibleAPedido

// ¿El pedido cargado tiene exactamente los items de la cotización?
PedidoCargadoTieneItemsCorrectos

// ¿Al aprobar el pedido cambia su badge de estado?
EstadoPedido.es('APROBADO')

// ¿La sesión sigue activa después de N acciones sin recargar?
SesionSigueActiva

// ¿El storageState realmente contiene cookies de sesión?
StorageStateTieneSesion
```

---

## 🎯 Kahoot — Bloque Integraciones

**1️⃣ ¿Qué flujo de negocio NO está cubierto por ningún test actual?**
- A) Emitir factura con retención
- B) **Convertir Cotización → Pedido → Factura** ✅
- C) Emitir boleta con descuento
- D) Buscar pedido por cliente

---

**2️⃣ ¿Cuál de los siguientes NO es un gap identificado?**
- A) Sin test de sesión expirada
- B) Sin test de Cotización → Pedido
- C) **Sin test de emitir boleta** ✅
- D) Sin test de storageState real

---

**3️⃣ ¿Qué pregunta NO existe todavía pero debería?**
- A) `ModalPostEmision.estaVisible()`
- B) `TarjetaPedidoVisible()`
- C) **`EstadoPedido.es('APROBADO')`** ✅
- D) `MensajeVisible()`

---

# 📊 Bloque 9: Panorama General

## 190 tests en 68 archivos

| Módulo | Tests | Archivos | % |
|:-------|:-----:|:--------:|:-:|
| 📦 **Logística** (MS + PS) | **90** | 33 | 47% |
| 🛒 **PuntoVenta Emisiones** | **62** | 21 | 33% |
| 🆕 **Pedidos PV-20** | **17** | 6 | 9% |
| 🆕 **Cotizaciones PV-19** | **6** | 2 | 3% |
| ⚙️ **Otros** (setup, teardown) | **15** | 6 | 8% |
| **TOTAL** | **190** | **68** | **100%** |

### Logística: 90 tests

| Submódulo | Tests |
|:----------|:-----:|
| Movimientos de Almacén (MS-1 a MS-12) | 49 |
| Productos-Stock (PS-2 a PS-8) | 41 |

### PuntoVenta Emisiones: 62 tests

| Tipo | Tests |
|:-----|:-----:|
| Boleta | 11 |
| Factura | 14 |
| Nota de Venta | 6 |
| Validaciones Generales | 4 |
| PV-18 Selección/Edición | 27 |

---

## 🎯 Kahoot — Bloque Panorama General

**1️⃣ ¿Cuántos tests E2E tenemos en total?**
- A) 90
- B) 150
- C) **190** ✅
- D) 250

---

**2️⃣ ¿Qué módulo tiene más tests?**
- A) PuntoVenta Emisiones
- B) **Logística** ✅ (90 tests)
- C) Pedidos
- D) Cotizaciones

---

**3️⃣ ¿Cuántos archivos de test tiene todo el proyecto?**
- A) 21
- B) 33
- C) **68** ✅
- D) 90

---

**4️⃣ ¿Cuántos tests del PV-18 (selección/edición de ítem) tenemos?**
- A) 17
- B) **27** ✅
- C) 6
- D) 49

---

**5️⃣ ¿Qué tipo de comprobante tiene más tests en PuntoVenta?**
- A) Boleta (11)
- B) **Factura (14)** ✅
- C) Nota de Venta (6)
- D) Validaciones (4)

---

**6️⃣ ¿Cuántos Setup Projects tenemos?**
- A) 2
- B) **5** ✅ (auth + datos-setup + pv-datos-setup + pv-items-setup + teardown)
- C) 8
- D) 12

---

**7️⃣ ¿Cuántas Tasks (Screenplay) tenemos?**
- A) 20
- B) **58** ✅
- C) 90
- D) 190

---

**8️⃣ ¿Cuántos Page Objects tenemos en total?**
- A) 15
- B) **38** ✅ (23 Logística + 15 PuntoVenta)
- C) 58
- D) 20

---

## 📋 Resumen de la Presentación

| Bloque | Tema | Duración | Preguntas Kahoot |
|:------:|:-----|:--------:|:----------------:|
| 1 | POM vs Screenplay — Por qué migramos | 18 min | 18 |
| 2 | Pipeline de Precondición + Captura de ID | 5 min | 4 |
| 3 | Validación SUNAT (Async State Machine) | 5 min | 4 |
| 4 | Validación de Stock vía API (Kardex) | 3 min | 3 |
| 5 | Pedidos PV-20 — Ciclo de Vida Completo | 5 min | 5 |
| 6 | Cotizaciones PV-19 — El Módulo Más Joven | 4 min | 4 |
| 7 | Sistema de Sesiones (Auth) | 12 min | 16 |
| 8 | Integraciones Futuras | 3 min | 3 |
| 9 | Panorama General | 3 min | 8 |
| | **TOTAL** | **~58 min** | **65 preguntas** |

---

*Documento generado para presentación del equipo QA — ERP Perú 2 Automation*
