import {type Page} from '@playwright/test';

/**
 * Page Object para los modales de Aumentar/Disminuir stock rápido.
 *
 * Se accede desde la lista de ítems (Productos o Insumos):
 * - Click en kebab del ítem → Aumentar stock / Disminuir stock
 * - O desde el modal "Ver item" → botón de stock en almacén
 *
 * Controla:
 * - Selección de almacén
 * - Selección de motivo
 * - Cantidad
 * - Botón Aumentar/Retirar stock
 */
export class MovimientoRapidoPage {
    constructor(private readonly page: Page) {
    }

    // ─── Desde lista de ítems ───────────────────────────────────

    /**
     * Abre el menú de acciones del ítem encontrado.
     *
     * Espera a que la búsqueda termine (tabla con solo la fila del ítem buscado)
     * antes de hacer click para evitar strict mode violation cuando hay varios
     * resultados en pantalla mientras el filtro aún está cargando.
     *
     * @param codigoItem  Código del ítem que se buscó, para usarlo como ancla de la fila.
     */
    async abrirMenuItemAcciones(codigoItem: string): Promise<void> {
        // Esperar a que la fila del ítem específico sea la primera de la tabla
        const filaItem = this.page
            .getByRole('row')
            .filter({hasText: codigoItem})
            .first();

        await filaItem.waitFor({state: 'visible', timeout: 15_000});

        // Click en el toggle del menú kebab dentro de ESA fila (anclado, sin ambigüedad)
        await filaItem
            .locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle')
            .click();
    }


    async clickVerStockSimple(): Promise<void> {
        await this.page
            .locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]')
            .click();
    }

    /** Click en "Aumentar stock" desde el menú de visualización del ítem */
    async clickAumentarStockDesdeVisualizacion(): Promise<void> {
        await this.page
            .locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]')
            .click();
        await this.page
            .locator('[id="lgt_items_v-modal:stock-item_cmp-dropdown:stock-almacen-opciones"]')
            .first()
            .click();
        await this.page
            .locator('[id="lgt_items_v-modal:stock-item_cmp-dropdown:stock-almacen-opciones_cmp-dropdown-item:aumentar-stock"]')
            .getByText('Aumentar stock')
            .click();
    }

    /** Click en "Incrementar stock" desde el menú de la variante */
    async clickIncrementarStockVariante(): Promise<void> {
        await this.page
            .locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:incrementar-stock"]')
            .click();
    }

    /** Click en "Disminuir stock" desde el menú directo */
    async clickDisminuirStockDesdeMenu(): Promise<void> {
        await this.page
            .locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:disminuir-stock"]')
            .click();
    }

    // ─── Modal de movimiento rápido ─────────────────────────────

    /** Selecciona almacén en modal de movimiento rápido */
    async seleccionarAlmacenRapido(almacen: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:almacen"] div')
            .filter({hasText: /^Seleccionar$/})
            .click();
        await this.page.locator('form').getByText(almacen).click();
    }

    /** Selecciona motivo en modal de movimiento rápido (para ingresos) */
    async seleccionarMotivoIngresoRapido(motivoActual: string, motivoNuevo: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:motivo"] div')
            .filter({hasText: new RegExp(`^${motivoActual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)})
            .click();
        await this.page.getByText(motivoNuevo, {exact: true}).click();
    }

    async clickexpandeVariante(codigoItem: string): Promise<void> {
        await this.page
            .getByRole('row')
            .filter({hasText: '313131'})
            .locator('.icon-item')
            .first()
            .click();
        ;
    }

    async seleccionarAccionVarianter(codigoItem: string): Promise<void> {
        await this.page.locator('.cmp-dropdown-toggle.justify-content-center')
            .filter({hasText: new RegExp(`^${codigoItem}`)})
            .first().click();
    }

    /** Selecciona motivo de ingreso a almacén con segundo nivel */
    async seleccionarMotivoIngresoAlmacenNth(motivo: string, nth: number = 1): Promise<void> {
        await this.page.getByText(motivo).nth(nth).click();
    }

    /** Selecciona motivo en modal de movimiento rápido (para salidas) */
    async seleccionarMotivoSalidaRapido(motivoActual: string, motivoNuevo: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:motivo"]')
            .getByText(motivoActual)
            .click();
        await this.page.getByText(motivoNuevo).click();
    }

    /** Selecciona motivo de salida desde el div del select */
    async seleccionarMotivoSalidaDesdeDiv(motivoActual: string, motivoNuevo: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:motivo"] div')
            .filter({hasText: new RegExp(`^${motivoActual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)})
            .click();
        await this.page.getByText(motivoNuevo).click();
    }

    // ─── Cantidad ───────────────────────────────────────────────

    /** Llena la cantidad del movimiento rápido */
    async llenarCantidadRapida(cantidad: string): Promise<void> {
        const input = this.page.locator(
            '[id="lgt_items_v-modal:movimiento-stock_v-step:cantidad"]',
        );
        await input.click();
        await input.fill(cantidad);
    }

    // ─── Botones de acción ──────────────────────────────────────

    /** Click en "Aumentar stock" (botón del modal) */
    async clickBtnAumentarStock(): Promise<void> {
        await this.page.getByRole('button', {name: 'Aumentar stock'}).click();
    }

    /** Click en "Retirar stock" (botón del modal) */
    async clickBtnRetirarStock(): Promise<void> {
        await this.page.getByRole('button', {name: 'Retirar stock'}).click();
    }

    // ─── Lectura de stock ────────────────────────────────────────

    /**
     * Lee el stock actual de un almacén específico desde el modal "Ver Stock".
     *
     * Precondición: el modal debe estar abierto (tras `clickVerStockSimple()`).
     *
     * Estrategia:
     *   Lee el texto completo del modal y usa un regex POSICIONAL que busca
     *   el nombre del almacén y captura el primer "Stock: X" que aparece
     *   inmediatamente después (max 300 chars para no cruzar al siguiente almacén).
     *   Esto evita el problema anterior donde el filter de cards resultaba en el
     *   div raíz del modal (que contiene TODOS los almacenes) y el regex siempre
     *   matcheaba el primer "Stock:" sin importar el almacén.
     *
     * @param nombreAlmacen  Nombre exacto del almacén (ej. 'ALMACEN-AUTO').
     * @returns Stock actual como número entero (0 si no hay datos o falla el parse).
     */
    async leerStockDelAlmacenEnModal(nombreAlmacen: string): Promise<number> {
        // Esperar a que el modal muestre al menos un "Stock:" antes de leer
        await this.page
            .locator('.v-modal')
            .getByText(/Stock:/i)
            .first()
            .waitFor({state: 'visible', timeout: 10_000});

        // Leer el texto completo del modal una sola vez
        const textoModal = (await this.page.locator('.v-modal').first().textContent() ?? '').trim();

        // Regex posicional: encuentra el nombre del almacén y captura el número
        // que aparece dentro del siguiente bloque de texto "Stock: X".
        // {0,300} limita el gap para no cruzar al bloque del siguiente almacén.
        const escapedName = nombreAlmacen.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedName}[\\s\\S]{0,300}?Stock:\\s*([\\d.,]+)`, 'i');
        const match = textoModal.match(regex);

        if (!match) return 0;

        // Normalizar separadores de miles (ej. "1,300" → "1300") y parsear
        const valorBruto = match[1]
            .replace(/[.,](\d{3})(?!\d)/g, '$1') // quita separador de miles
            .replace(',', '.');                    // normaliza decimal residual

        const stockActual = parseInt(valorBruto, 10);
        return isNaN(stockActual) ? 0 : stockActual;
    }

    // ─── Utilidades ─────────────────────────────────────────────

    /** Cerrar modal de confirmación */
    async cerrarModalConfirmacion(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }

    /**
     * Cierra el modal de visualización de stock del ítem.
     * Presiona Escape como mecanismo fiable para cerrar sin depender de un selector de botón.
     */
    async cerrarModalCancelarModal(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }

    async cerrarModalStock(): Promise<void> {
        await this.page.keyboard.press('Escape');
        // Esperar a que el modal desaparezca
        await this.page
            .locator('.v-modal')
            .first()
            .waitFor({state: 'hidden', timeout: 5_000})
            .catch(() => { /* si ya no estaba visible, no pasa nada */
            });
    }

    /**
     * Busca un ítem por código en la lista de ítems.
     *
     * Presiona Enter tras el fill para disparar el filtro inmediatamente,
     * en lugar de depender del debounce del input. Esto garantiza que
     * `abrirMenuItemAcciones` encuentre la fila ya filtrada y no una fila
     * residual de la carga anterior.
     */
    async buscarItemPorCodigo(codigo: string): Promise<void> {
        const searchInput = this.page.getByRole('textbox', {name: 'Buscar por nombre, código o c'});
        await searchInput.click();
        await searchInput.fill(codigo);
        await searchInput.press('Enter');
    }

    /** Click en variante dentro de la lista (por fila tr:nth-child) */
    async clickVarianteEnLista(nthChild: number): Promise<void> {
        await this.page
            .locator(`tr:nth-child(${nthChild}) > td:nth-child(13) > .flex-row-align-items-center-justify-content-center`)
            .click();
    }

    /** Click en tipo de ítem para filtrar (ej. "Producto") */
    async filtrarPorTipoItem(tipo: string): Promise<void> {
        await this.page.getByText(tipo, {exact: true}).first().click();
    }

    async abrirTabInsumos(): Promise<void> {
        await this.page.locator('[id="lgt_items_cmp-datos-item:filter_section:section_tipo_tipo_item:3"]');
    }

    async seleccionarcardProductos(): Promise<void> {
        await this.page.locator('[id="lgt_movimientos_creacion-masivo_cmp-tipo-movimiento:elegir-tipo-movimiento_cmp-card-movimiento:ingreso"]').first().click();
    }

    /** Click en búsqueda de ítems */
    async clickBusquedaDeItems(): Promise<void> {
        await this.page
            .locator('div')
            .filter({hasText: /^Búsqueda de ítems$/})
            .nth(2)
            .click();
    }
}
