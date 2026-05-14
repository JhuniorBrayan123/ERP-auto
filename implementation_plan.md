# Automatización Dinámica de Ítems Base

Este plan detalla cómo modificaremos el framework para crear los ítems base (`111111`, `121212`, etc.) de forma dinámica en cada ejecución de pruebas, usando un prefijo temporal. Esto mantendrá el Kardex limpio, aislará las pruebas y evitará problemas de bloqueos en la base de datos a largo plazo.

## User Review Required

> [!IMPORTANT]
> Esta arquitectura requiere un cambio en cómo los helpers (como `emision-data.helper.ts`) obtienen los datos. Usaremos un archivo temporal `.auth/dynamic-items.json` generado por el setup, para que todos los tests puedan saber cuál fue el ID generado en la ejecución actual sin tener que modificar los archivos `.spec.ts`.

## Open Questions

> [!WARNING]
> 1. **Falta de Locators para Variantes/Equivalencias:** En `ProductoFormPage.ts` no existen los métodos para agregar "Variantes" ni "Equivalencias" desde la interfaz. No tengo acceso visual al ERP para conocer los IDs o clases de esos botones. ¿Prefieres que te deje la estructura lista con locators tentativos (y tú los corriges) o usamos la API (haciendo un `page.request.post`) para crear esos ítems complejos más rápido?
> 2. **Formato del Código:** ¿Qué longitud máxima soporta el campo de "Código" en el ERP? Si usamos un timestamp corto, el código quedaría así: `111111-654321`. ¿Es aceptable?

## Proposed Changes

---

### Shared Data State (Helpers)

#### [MODIFY] `src/helpers/PuntoVenta/emision-data.helper.ts`
- Se añadirá una lógica al inicio del archivo que intente leer el archivo `playwright/.auth/dynamic-items.json`.
- Si el archivo existe, modificará dinámicamente los códigos de los ítems en memoria (ej. `ITEMS_PV.PRODUCTO_SIMPLE.codigo = json.PRODUCTO_SIMPLE`).

#### [MODIFY] `src/helpers/Logistica/movimiento-data.helper.ts`
- Misma lógica de interceptación para actualizar `ITEMS_TEST` con los códigos dinámicos generados en el setup.

---

### Page Object Model (POM)

#### [MODIFY] `src/pages/Logistica/ProductoFormPage.ts`
- Añadir métodos `irATabVariantes()`, `agregarVariante(nombre)`, `llenarPrecioVariante()`.
- Añadir métodos `agregarEquivalencia(factor, unidad)`.

---

### Setup y Ejecución

#### [MODIFY] `tests/Emisiones/PuntoVenta/setup/punto-venta-items.setup.ts`
- Generar un `RUN_ID` único (ej: los últimos 5 dígitos del timestamp) al inicio del script.
- Añadir 6 nuevos pasos para crear los siguientes ítems usando el código dinámico:
  - **Producto Simple (111111)**: Stock Estricto.
  - **Producto Gravado (121212)**: Stock Flexible.
  - **Sin Stock (111222)**: Stock Estricto, cantidades en 0.
  - **Equivalencia (202020)**: Equivalencias X2, X6.
  - **Variante Estricta (131313)**: Variantes y stock estricto.
  - **Variante Flexible (313131)**: Variantes y stock flexible.
- Al final del setup, guardar el mapa de `CÓDIGO_ORIGINAL -> CÓDIGO_DINÁMICO` en `playwright/.auth/dynamic-items.json`.

## Verification Plan

### Automated Tests
- Ejecutaré el setup de forma aislada: `npx playwright test punto-venta-items.setup.ts --project=setup`.
- Revisaré que el archivo `dynamic-items.json` se haya creado correctamente.
- Ejecutaré un test (ej: `pv-01-factura-stock.spec.ts` o el `MS-1-ingreso`) para verificar que el helper importa el código dinámico correctamente y que la búsqueda en la UI funciona.
