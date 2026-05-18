# Automatización Dinámica de Ítems — Variantes y Equivalencias

Extiende el setup dinámico existente (`punto-venta-items.setup.ts` + `item-factory.ts`) para crear ítems con **variantes** y **equivalencias** de forma automática. Los locators fueron extraídos del archivo codegen `tests/_codegen/casos-cajas.ts`.

## Estado Actual

Ya está implementado:
- ✅ `item-factory.ts` con `generarRunId()`, `generarMapaCodigos()`, `guardarMapaCodigos()`
- ✅ `ITEM_TEMPLATES` con 14 templates (productos simples, ISC, ICBPER, receta, lista, selectores)
- ✅ Setup crea 6 ítems (ISC, ICBPER, receta, lista, almacén-auto, almacén-ventas)
- ✅ `ProductoFormPage` con métodos base (nombre, código, precios, stock, info adicional)
- ✅ `ItemFormBasePage` con `irATabEquivalencias()` (ya existe)

**Falta implementar:**
- ❌ Métodos para crear **variantes** en `ProductoFormPage` (tab Variantes, atributos, stock por variante)
- ❌ Métodos para crear **equivalencias** en `ProductoFormPage` (nombre, factor, tipo afectación, precios)
- ❌ Templates de variantes/equivalencias en `item-factory.ts`
- ❌ Bloques de setup en `punto-venta-items.setup.ts` para los 4 ítems faltantes

## User Review Required

> [!IMPORTANT]
> Se van a añadir **4 ítems nuevos** al setup: variante estricto, variante flexible, equivalente estricto, equivalente flexible. El setup pasará de crear 6 a 10 ítems (timeout de 5min → 8min).

> [!WARNING]
> **Formato del código:** El factory actual genera `111111-65432` (12 chars). ¿Es aceptable para el campo Código del ERP o hay un límite menor? Si hay restricción, puedo reducir el RUN_ID a 3-4 dígitos.

---

## Proposed Changes

### 1. Page Object Model — Variantes

#### [MODIFY] [ProductoFormPage.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/src/pages/Logistica/ProductoFormPage.ts)

Añadir los siguientes métodos basados en los locators del codegen (líneas 34-136):

```typescript
// ─── Tab Variantes ────────────────────────────────────────────────

async irATabVariantes(): Promise<void> {
    await this.page.getByText('Variantes(Opcional)').click();
}

/**
 * Crea un atributo de variante con sus opciones.
 * Flujo: "Añadir atributo" → "Crear nuevo atributo" → título + opciones → "Crear atributo"
 * 
 * Locators extraídos del codegen líneas 35-56:
 * - Botón añadir: getByText('Añadir atributo')
 * - Botón crear nuevo: getByRole('button', { name: 'Crear nuevo atributo' })
 * - Input título: getByRole('textbox', { name: 'Digita el título del nuevo' })
 * - Inputs opciones: getByRole('textbox', { name: 'Opción 1|2|3' })
 * - Confirmar: getByRole('button', { name: 'Crear atributo' })
 * - Cerrar modal: .v-modal > div (first)
 */
async crearAtributoVariante(titulo: string, opciones: string[]): Promise<void>

/**
 * Añade una nueva variante, le cambia el nombre y opcionalmente configura su stock.
 * 
 * Locators del codegen líneas 93-134:
 * - Añadir: getByText('Añadir una nueva variante')
 * - Dropdown opciones (nth): [id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:opciones"]
 * - Cambiar nombre: getByText('Cambiar nombre')
 * - Input nombre: [id="lgt_reg-item_v-tab:variantes-item_combinacion-variante-item-list:combinacion_v-input:nombre"]
 * - Confirmar edición: [id="lgt_reg-item_v-tab:variantes-item_combinacion-variantes-item-list:item_div:btn-editar-combinacion"]
 * - Admin stock: getByText('Administrar stock de esta')
 * - Inputs stock: [id="lgt_cmp-card-almacen_v-step:cantidad"] (first = max, nth(1) = min)
 * - Guardar stock: getByRole('button', { name: 'Guardar stock' })
 */
async agregarVariante(
    indice: number,
    nombre: string,
    stock?: { cantidadMaxima: string; cantidadMinima: string }
): Promise<void>
```

### 2. Page Object Model — Equivalencias

#### [MODIFY] [ProductoFormPage.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/src/pages/Logistica/ProductoFormPage.ts)

Añadir métodos para equivalencias basados en el codegen (líneas 160-197):

```typescript
// ─── Tab Equivalencias ────────────────────────────────────────────

/**
 * Crea una equivalencia con nombre, factor, tipo de afectación y precios.
 * 
 * Locators del codegen líneas 160-177:
 * - Primer botón (`.arc`): abre el drape de equivalencia
 * - Siguientes: getByRole('button', { name: 'Agregar equivalencia' })
 * - Input nombre: getByRole('textbox', { name: 'Digita el nombre de la' })
 * - Botón incrementar factor: [id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]
 * - Input factor (manual): [id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad"]
 * - Selector tipo afectación: div filter hasText /^Seleccionar$/ → 'Gravado (Paga IGV 18%)'
 * - Precios: getByRole('textbox', { name: 'Monto final' }) first/nth(1)
 * - Confirmar: getByRole('button', { name: 'Crear Equivalencia' })
 */
async crearEquivalencia(config: {
    nombre: string;
    factor: number;
    tipoAfectacion: string;
    precioVenta: string;
    precioCompra: string;
    esPrimera: boolean; // primera usa .arc, siguientes usan 'Agregar equivalencia'
}): Promise<void>
```

### 3. Item Factory — Nuevos Templates

#### [MODIFY] [item-factory.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/src/factories/item-factory.ts)

Añadir al tipo `ItemConfig`:

```typescript
// Nuevo en ItemConfig:
variantes?: {
    atributos: Array<{ titulo: string; opciones: string[] }>;
    variantes: Array<{
        nombre: string;
        stock?: { cantidadMaxima: string; cantidadMinima: string };
    }>;
};
equivalencias?: Array<{
    nombre: string;
    factor: number;
    tipoAfectacion: string;
    precioVenta: string;
    precioCompra: string;
}>;
```

Añadir **4 nuevos templates** a `ITEM_TEMPLATES`:

| Key | Código Base | Nombre | Tipo Especial |
|-----|------------|--------|---------------|
| `ITEM_VARIANTE_ESTRICTO` | `131313` | item variante estricto gravado | 3 atributos (Marca, RAM, Memoria) + 3 variantes con stock |
| `ITEM_VARIANTE_FLEXIBLE` | `313131` | item con variante flexible | 3 atributos + 3 variantes con sufijo `[flexible]` |
| `ITEM_EQUIVALENTE_ESTRICTO` | `101010` | item equivalente estricto gravado | Equivalencia X2 y X6 |
| `ITEM_EQUIVALENTE_FLEXIBLE` | `202020` | item equivalente flexible | Equivalencia X2 y X6 |

> [!NOTE]
> Los templates para `ITEM_VARIANTE_ESTRICTO` y `ITEM_VARIANTE_FLEXIBLE` ya existen en el factory pero **sin la config de variantes**. Los de equivalentes estricto (`101010`) no existen aún. `ITEM_EQUIVALENTE` (`202020`) existe pero sin config de equivalencias.

### 4. Setup — Bloques de Creación

#### [MODIFY] [punto-venta-items.setup.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/tests/Emisiones/PuntoVenta/setup/punto-venta-items.setup.ts)

Añadir **4 nuevos bloques** al setup (después del bloque 6 actual), siguiendo el patrón existente:

**Bloque 7 — Variante Estricto (`131313-XXXXX`):**
1. `productoForm.iniciarCreacionProducto()`
2. Llenar nombre, código, precios
3. Stock estricto + Info adicional
4. `productoForm.irATabVariantes()`
5. Crear 3 atributos: Marca (Acer/Hp/Apple), RAM (32GB/24GB/16GB), Memoria (500GB/250GB/128GB)
6. Añadir 3 variantes → renombrar a `Variante N {estricto}` → admin stock (1001/100)
7. `productoForm.crearProducto()`

**Bloque 8 — Variante Flexible (`313131-XXXXX`):**
- Mismo flujo pero con stock `flexible` y nombres `Variante N [flexible]`

**Bloque 9 — Equivalente Estricto (`101010-XXXXX`):**
1. Producto base (nombre, código, precios, stock estricto)
2. Info adicional
3. `irATabEquivalencias()` (ya existe en `ItemFormBasePage`)
4. Crear Equivalencia X2: factor=2, Gravado 18%, precios 20.11/5.4552
5. Crear Equivalencia X6: factor=6, Gravado 18%, precios 60.454/20.5254
6. `productoForm.crearProducto()`

**Bloque 10 — Equivalente Flexible (`202020-XXXXX`):**
- Mismo flujo pero con stock `flexible`

---

## Resumen de Archivos Tocados

| Archivo | Acción | Riesgo |
|---------|--------|--------|
| `ProductoFormPage.ts` | +2 métodos variantes, +1 método equivalencias | Bajo — nuevos métodos, no modifica existentes |
| `item-factory.ts` | +4 templates, extensión de `ItemConfig` | Bajo — aditivo |
| `punto-venta-items.setup.ts` | +4 bloques de setup | Medio — timeout mayor, depende de UI |

---

## Verification Plan

### Automated Tests
1. `npx tsc --noEmit` → 0 errores
2. Ejecutar setup aislado: `npx playwright test punto-venta-items.setup.ts --project=setup`
3. Verificar `playwright/.auth/dynamic-items.json` contiene las 4 nuevas claves
4. Ejecutar un test que use variantes para confirmar que el código dinámico se resuelve correctamente

### Manual Verification
- Verificar en el ERP que los ítems creados aparecen con los atributos, variantes y equivalencias correctas
