import {type Locator, type Page} from '@playwright/test';

/**
 * Page Object para el formulario de registro de movimientos de almacén.
 *
 * Cubre los 4 tipos de movimiento: Ingreso, Salida, Traslado, Ajuste.
 * Todos comparten la misma estructura de formulario con variaciones en
 * botones, selects y flujos específicos.
 *
 * Responsabilidades:
 * - Iniciar nuevo movimiento (desde botón o menú)
 * - Seleccionar almacén, motivo
 * - Buscar y seleccionar ítems (producto, variante, equivalente, insumo)
 * - Llenar cantidad
 * - Registrar / Actualizar / Clonar movimiento
 *
 * NO contiene assertions de negocio.
 */
export class RegistroMovimientoPage {
    constructor(private readonly page: Page) {
    }

    // ─── Locators ───────────────────────────────────────────────

    private get btnNuevoMovimiento(): Locator {
        return this.page.locator(
            '[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]',
        );
    }

    private get searchInput(): Locator {
        return this.page.getByRole('textbox', {name: 'Buscar por nombre, código o c'});
    }

    private get cantidadInput(): Locator {
        return this.page.locator(
            '[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]',
        );
    }

    // ─── Iniciar nuevo movimiento ───────────────────────────────

    /** Click en el botón "Nuevo movimiento" (dropdown) */
    async clickNuevoMovimiento(): Promise<void> {
        await this.btnNuevoMovimiento.click();
    }

    /** Click en "Agregar ingreso" desde submenu o texto directo */
    async clickAgregarIngreso(): Promise<void> {
        await this.page.getByText('Agregar ingreso').click();
    }

    /** Click en "Nuevo ingreso" desde el dropdown del botón nuevo movimiento */
    async clickNuevoIngreso(): Promise<void> {
        await this.page
            .locator('[id="lgt_movimientos_content_cmp-header-movimientos.li:nuevo-ingreo"]')
            .click();
    }

    /** Click en "Agregar salida" */
    async clickAgregarSalida(): Promise<void> {
        await this.page.getByText('Agregar salida').click();
    }

    /** Click en "Agregar traslado" */
    async clickAgregarTraslado(): Promise<void> {
        await this.page.getByText('Agregar traslado').click();
    }

    /** Click en "Agregar ajuste" */
    async clickAgregarAjuste(): Promise<void> {
        await this.page.getByText('Agregar ajuste').click();
    }

    // ─── Selección de almacén ───────────────────────────────────

    /**
     * Selecciona un almacén del dropdown.
     * El Codegen usa `div.filter({ hasText: /^ALMACEN-AUTO$/ }).nth(N)` porque
     * hay múltiples divs con el mismo texto. Usamos el patrón del ERP.
     */
    async seleccionarAlmacen(almacenActual: string, almacenDestino: string): Promise<void> {
        if (almacenActual === almacenDestino) {
            // Si el almacén destino es el mismo que el actual (ej. almacen-auto por defecto), no hacer nada.
            return;
        }
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${this.escapeRegex(almacenActual)}$`)})
            .nth(2)
            .click();
        await this.page.waitForTimeout(500); // Esperar a que renderice la lista
        await this.page.getByText(almacenDestino).click();
    }

    /**
     * Selecciona solo el almacén haciendo click en el texto nth(1).
     * Variante usada cuando el almacen ya está preseleccionado y hay que elegir otro.
     */
    async seleccionarAlmacenNth(almacenActual: string, almacenDestino: string, nth: number = 2): Promise<void> {
        if (almacenActual === almacenDestino) {
            return;
        }
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${this.escapeRegex(almacenActual)}$`)})
            .nth(nth)
            .click();
        await this.page.waitForTimeout(500); // Esperar a que renderice la lista
        await this.page.getByText(almacenDestino).click();
    }

    /** Selecciona almacenes para traslado: origen y destino */
    async seleccionarAlmacenesTraslado(origenActual: string, origenDestino: string, destinoActual: string, destinoNuevo: string): Promise<void> {
        await this.seleccionarAlmacenNth(origenActual, origenDestino, 2);
        await this.seleccionarAlmacenNth(destinoActual, destinoNuevo, 3);
    }

    /**
     * Para traslados: selecciona almacén origen y destino.
     * El formulario de traslado tiene dos selectores separados.
     * El problema es que habian los funciones haciendlo lo mismo y uno era como una capa para el otro
     */
    async seleccionarAlmacenesTraslado1(
        origenActual: string,
        origenNuevo: string,
        destinoActual: string,
        destinoNuevo: string,
    ): Promise<void> {
        // Origen
        await this.page.getByText(origenActual).first().click();
        await this.page.getByText(origenNuevo).first().click();
        // Destino
        await this.page.getByText(destinoActual).nth(2).click();
        await this.page.getByText(destinoNuevo).nth(1).click();
    }

    // ─── Selección de motivo ────────────────────────────────────

    /**
     * Selecciona un motivo del dropdown.
     * El Codegen muestra que algunos motivos requieren clickear el selector
     * y luego el texto del motivo deseado.
     */
    async seleccionarMotivo(motivoActual: string, motivoNuevo: string): Promise<void> {
        if (motivoActual === motivoNuevo) {
            return;
        }
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${this.escapeRegex(motivoActual)}$`)})
            .nth(2)
            .click();
        await this.page.waitForTimeout(500); // Esperar a que renderice la lista
        await this.page.getByText(motivoNuevo).click();
    }

    /** Selecciona motivo clickeando directamente en el texto (para selects ya abiertos) */
    async seleccionarMotivoDirecto(motivo: string): Promise<void> {
        await this.page.getByText(motivo).click();
    }

    /** Selecciona motivo desde el selector CSS del motivo */
    async abrirSelectorMotivo(): Promise<void> {
        await this.page
            .locator('.motivo > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow')
            .click();
    }

    /** Para ajustes: selecciona motivo desde el panel nth(3) */
    async seleccionarMotivoAjuste(motivoActual: string, motivoNuevo: string): Promise<void> {
        if (motivoActual === motivoNuevo) {
            return;
        }
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${this.escapeRegex(motivoActual)}$`)})
            .nth(3)
            .click();
        await this.page.waitForTimeout(500); // Esperar a que renderice la lista
        await this.page.getByText(motivoNuevo).click();
    }

    // ─── Búsqueda y selección de ítems ──────────────────────────

    /** Busca un ítem por código en el campo de búsqueda */
    async buscarItem(codigo: string): Promise<void> {
        await this.searchInput.click();
        await this.searchInput.fill(codigo);
        await this.page.waitForTimeout(1000); // Esperar respuesta de debounce/búsqueda del ERP
    }

    /** Selecciona un ítem del listado de resultados por nombre */
    async seleccionarItemEnResultados(nombre: string): Promise<void> {
        await this.page.getByText(nombre).click();
    }

    /** Selecciona un ítem del listado con texto completo (para coincidencias exactas) */
    async seleccionarItemTextoCompleto(textoCompleto: string): Promise<void> {
        await this.page.getByText(textoCompleto).click();
    }

    /** Selecciona una variante específica de un ítem */
    async seleccionarVariante(nombreVariante: string): Promise<void> {
        await this.page.getByText(nombreVariante).click();
    }

    /** Selecciona un equivalente de un ítem (después de buscar) */
    async seleccionarEquivalente(nombreEquivalente: string): Promise<void> {
        await this.page.getByText(nombreEquivalente).click();
    }

    // ─── Cantidad ───────────────────────────────────────────────

    /** Llena la cantidad del ítem en la grilla */
    async llenarCantidad(cantidad: string): Promise<void> {
        await this.cantidadInput.click();
        await this.cantidadInput.fill(cantidad);
    }

    // ─── Factor de ajuste ───────────────────────────────────────

    /** Selecciona el factor de ajuste: 'Agregar' o 'Quitar' */
    async seleccionarFactorAjuste(tipo: 'Agregar' | 'Quitar'): Promise<void> {
        // Abrir el select de factor
        await this.page
            .locator('div')
            .filter({hasText: /^Agregar$/})
            .nth(1)
            .click();

        if (tipo === 'Agregar') {
            await this.page
                .locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-select:factor_v-option:opcion-1"]')
                .getByText('Agregar')
                .click();
        } else {
            await this.page.getByText('Quitar').click();
        }
    }

    // ─── Botones de registro ────────────────────────────────────

    /** Click en REGISTRAR INGRESO */
    async clickRegistrarIngreso(): Promise<void> {
        await this.page.getByRole('button', {name: 'REGISTRAR INGRESO'}).click();
    }

    /** Click en REGISTRAR SALIDA (abre submenu con opciones) */
    async clickRegistrarSalida(): Promise<void> {
        await this.page.locator('div').filter({hasText: /^REGISTRAR SALIDA$/}).first().click();
    }

    /** Click en "Registrar y despachar" (submenu de salida) */
    async clickRegistrarYDespachar(): Promise<void> {
        await this.page.getByText('Registrar y despachar').click();
    }

    /** Click en "Registrar" exacto (submenu de salida — solo registrar) */
    async clickRegistrarSoloSalida(): Promise<void> {
        await this.page.getByText('Registrar', {exact: true}).click();
    }

    /** Click en texto REGISTRAR SALIDA directo (para variantes/equivalentes que no usan botón) */
    async clickTextoRegistrarSalida(): Promise<void> {
        await this.page.getByText('REGISTRAR SALIDA').click();
    }

    /** Click en REGISTRAR TRASLADO */
    async clickRegistrarTraslado(): Promise<void> {
        await this.page.getByRole('button', {name: 'REGISTRAR TRASLADO'}).click();
    }

    /** Click en REGISTRAR AJUSTE */
    async clickRegistrarAjuste(): Promise<void> {
        await this.page.getByRole('button', {name: 'REGISTRAR AJUSTE'}).click();
    }

    // ─── Botones de actualización ───────────────────────────────

    /** Click en ACTUALIZAR INGRESO */
    async clickActualizarIngreso(): Promise<void> {
        await this.page.getByRole('button', {name: 'ACTUALIZAR INGRESO'}).click();
    }

    /** Click en ACTUALIZAR SALIDA */
    async clickActualizarSalida(): Promise<void> {
        await this.page.getByRole('button', {name: 'ACTUALIZAR SALIDA'}).click();
    }

    // ─── Botones de clonación ───────────────────────────────────

    /** Click en CLONAR INGRESO */
    async clickClonarIngreso(): Promise<void> {
        await this.page.getByRole('button', {name: 'CLONAR INGRESO'}).click();
    }

    // ─── Acciones auxiliares ────────────────────────────────────

    /** Click en LIMPIAR */
    async clickLimpiar(): Promise<void> {
        await this.page.getByRole('button', {name: 'LIMPIAR'}).click();
    }

    /** Click en "Limpiar" (confirmación) */
    async clickLimpiarConfirmacion(): Promise<void> {
        await this.page.getByRole('button', {name: 'Limpiar', exact: true}).click();
    }

    /** Click en CANCELAR */
    async clickCancelar(): Promise<void> {
        await this.page.getByRole('button', {name: 'CANCELAR'}).click();
    }

    /** Click en "Datos opcionales" */
    async clickDatosOpcionales(): Promise<void> {
        await this.page.getByRole('button', {name: 'Datos opcionales'}).click();
    }

    /** Cerrar modal (overlay) */
    async cerrarModal(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }

    /** Eliminar ítem de la grilla */
    async eliminarItemGrilla(): Promise<void> {
        await this.page
            .locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_div:btn-eliminar-item"]')
            .click();
    }

    /** Click en celda de cantidad (para edición) */
    async clickCeldaCantidad(): Promise<void> {
        await this.page.locator('td:nth-child(2) > .cantidad').click();
    }

    // ─── Utilidades internas ────────────────────────────────────

    /** Escapa caracteres especiales de regex */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
