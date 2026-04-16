import {type Download, type Page} from '@playwright/test';

/**
 * Page Object para la lista/tabla de movimientos de almacén.
 *
 * Cubre:
 * - Menú contextual (kebab) por movimiento
 * - Acciones: Ver, Editar, Clonar, Eliminar, Despachar, Ver bitácora
 * - Tabs de tipo de movimiento (Todos, Ingresos, Salidas, etc.)
 * - Filtros avanzados
 * - Exportación
 * - Imprimir/Descargar/Enviar desde la lista
 */
export class ListadoMovimientosPage {
    constructor(private readonly page: Page) {
    }

    private readonly overloadLoading = this.page.locator('[id="cmn_cmp-overload:loading"]');

    /** Espera a que el overlay global no bloquee clicks (evita timeouts en menús). */
    private async esperarSinOverlayCarga(): Promise<void> {
        await this.overloadLoading.waitFor({state: 'hidden', timeout: 25_000}).catch(() => {
        });
    }

    // ─── Menú contextual ────────────────────────────────────────

    /** Abre el menú de acciones del primer movimiento visible */
    async abrirMenuAcciones(): Promise<void> {
        await this.esperarSinOverlayCarga();
        await this.page.locator('.cmp-dropdown-toggle.justify-content-center').first().click();
    }

    /** Abre menú usando el ícono v-icon-base (variante Codegen) */
    async abrirMenuAccionesIcono(): Promise<void> {
        await this.page.locator('.v-icon-base > .icon').first().click();
    }

    /** Click en "Editar movimiento" desde el menú */
    async clickEditarMovimiento(): Promise<void> {
        await this.page.getByText('Editar movimiento').click();
    }

    /** Click en "Clonar movimiento" desde el menú */
    async clickClonarMovimiento(): Promise<void> {
        await this.page.getByText('Clonar movimiento').click();
    }

    /** Click en "Eliminar movimiento" desde el menú */
    async clickEliminarMovimiento(): Promise<void> {
        await this.page.getByText('Eliminar movimiento').click();
    }

    /**
     * Click en "Elimina el movimiento permanentemente" desde el menú contextual.
     *
     * Usa waitFor({state:'visible'}) para esperar a que la opción del dropdown
     * esté completamente renderizada antes de intentar el click, evitando
     * "element is not stable" durante la animación de apertura del menú.
     */
    async clickEliminaElMovimiento(): Promise<void> {
        const opcion = this.page.getByText('Elimina el movimiento permanentemente').first();
        //await opcion.waitFor({state: 'visible', timeout: 10_000});
        await opcion.click();
    }

    /** Click en "Ver movimiento" desde el menú */
    async clickVerMovimiento(): Promise<void> {
        await this.page.getByText('Ver movimiento').click();
    }

    /** Click en "Despachar salida" desde el menú */
    async clickDespacharSalida(): Promise<void> {
        await this.page.getByText('Despachar salida').click();
    }

    /** Click en "Imprimir, descargar y enviar" desde el menú */
    async clickImprimirDescargarEnviar(): Promise<void> {
        await this.esperarSinOverlayCarga();
        // Acotar al menú abierto: hay spans con el mismo texto fuera del dropdown.
        const enPopup = this.page
            .locator('.v-popup, .cmp-dropdown-options, .v-select-base-options')
            .getByText('Imprimir, descargar y enviar')
            .first();
        if (await enPopup.isVisible().catch(() => false)) {
            await enPopup.click({timeout: 15_000});
            return;
        }
        await this.page.getByText('Imprimir, descargar y enviar').last().click({timeout: 15_000});
    }

    // ─── Bitácora ───────────────────────────────────────────────

    /** Click en "Ver bitácora" desde el menú contextual */
    async clickVerBitacora(): Promise<void> {
        await this.page.getByText('Ver bitácora').click();
    }

    /** Click en un evento de bitácora por nombre */
    async clickEventoBitacora(evento: string): Promise<void> {
        await this.page.getByText(evento, {exact: true}).click();
    }

    /** Cierra el panel de bitácora */
    async cerrarBitacora(): Promise<void> {
        await this.page.locator('.drape.is-open > .button-close > .icon').click();
    }

    /** Cierra bitácora usando el button-close sin icono */
    async cerrarBitacoraAlternativo(): Promise<void> {
        await this.page.locator('.drape.is-open > .button-close').click();
    }

    // ─── Confirmaciones de eliminación ──────────────────────────

    /** Click en botón "Eliminar" de confirmación */
    async confirmarEliminacion(): Promise<void> {
        await this.page.getByRole('button', {name: 'Eliminar'}).click();
    }

    /** Click en botón "Aceptar" (alerta de stock negativo) */
    async aceptarAlertaStockNegativo(): Promise<void> {
        await this.page.getByRole('button', {name: 'Aceptar'}).click();
    }

    // ─── Despacho ───────────────────────────────────────────────

    /** Click en botón "DESPACHAR SALIDA" de confirmación */
    async confirmarDespacho(): Promise<void> {
        await this.page.getByRole('button', {name: 'DESPACHAR SALIDA'}).click();
    }

    // ─── Tabs ───────────────────────────────────────────────────

    /** Click en tab "Todos" */
    async clickTabTodos(): Promise<void> {
        await this.page.getByText('Todos', {exact: true}).click();
    }

    /** Click en tab tipo movimiento por índice (0 = Todos, 1 = Ingresos, etc.) */
    async clickTabPorIndice(indice: number): Promise<void> {
        await this.page
            .locator(`[id="lgt_movimientos_cmp-header-movimientos:section_v-button:tipo_movimiento:${indice}"]`)
            .click();
    }

    // ─── Filtros avanzados ──────────────────────────────────────

    /** Abre el menú de opciones superior (icono) */
    async clickIconoOpciones(): Promise<void> {
        await this.page.locator('.icon-container > .icon').click();
    }

    /** Click en "Ver filtros avanzados" */
    async abrirFiltrosAvanzados(): Promise<void> {
        await this.page.getByRole('button', {name: 'Ver filtros avanzados'}).click();
    }

    /** Filtra por tipo de movimiento */
    async filtrarPorTipoMov(tipo: string): Promise<void> {
        await this.page.getByText('Tipo mov.').click();
        await this.page.getByText(tipo, {exact: true}).click();
    }

    /** Filtra por almacén */
    async filtrarPorAlmacen(almacen: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Almacén$/}).nth(2).click();
        await this.page.locator('thead').getByText(almacen).click();
    }

    // ─── Exportación ────────────────────────────────────────────

    /** Click en "Exportar todos los movimientos" y retorna download */
    async exportarTodosMovimientos(): Promise<Download> {
        const downloadPromise = this.page.waitForEvent('download');
        await this.page.getByText('Exportar todos los movimientos').click();
        return downloadPromise;
    }

    /** Click en "Crear movimientos desde excel" */
    async clickCrearDesdeExcel(): Promise<void> {
        await this.page.getByText('Crear movimientos desde excel').click();
    }

    // ─── Impresión desde lista ──────────────────────────────────

    /** Click en imprimir A4 desde el modal de opciones */
    async imprimirA4DesdeLista(): Promise<void> {
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:impresion-a4"]')
            .click();
    }

    /** Click en imprimir Ticket desde el modal de opciones */
    async imprimirTicketDesdeLista(): Promise<void> {
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:impresion-ticket"]')
            .click();
    }

    /** Click en WhatsApp desde el modal de acciones de lista */
    async clickWhatsAppDesdeLista(): Promise<void> {
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:envio-whatsapp"]')
            .click();
    }

    /** Click en Email desde el modal de acciones de lista */
    async clickEmailDesdeLista(): Promise<void> {
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:envio-correo"]')
            .click();
    }

    /** Descargar PDF desde lista */
    async descargarPDFDesdeLista(): Promise<Download> {
        const downloadPromise = this.page.waitForEvent('download');
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:descarga-pdf"] div')
            .filter({hasText: /^Descargar PDF$/})
            .click();
        return downloadPromise;
    }

    /** Enviar WhatsApp desde lista con teléfono */
    async enviarWhatsAppDesdeLista(telefono: string): Promise<Page> {
        await this.clickWhatsAppDesdeLista();
        const inputTelefono = this.page.getByRole('textbox', {name: 'Ej.'});
        await inputTelefono.click();
        await inputTelefono.fill(telefono);
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByText('Enviar', {exact: true}).click();
        return popupPromise;
    }

    /** Enviar Email desde lista */
    async enviarEmailDesdeLista(email: string): Promise<void> {
        await this.clickEmailDesdeLista();
        const inputEmail = this.page.getByRole('textbox', {name: 'Ej. email1@gmail.com, email2@'});
        await inputEmail.click();
        await inputEmail.fill(email);
        await this.page.getByText('Enviar', {exact: true}).click();
    }

    // ─── Modales ────────────────────────────────────────────────

    /** Cerrar modal de resultado/confirmación */
    async cerrarModal(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }

    /** Ver datos opcionales desde modal de detalle */
    async clickDatosOpcionalesEnDetalle(): Promise<void> {
        await this.page.getByText('Datos opcionales').click();
    }

    // ─── Comprobantes ───────────────────────────────────────────

    /** Click en tab "Comprobantes" */
    async clickTabComprobantes(): Promise<void> {
        const enModal = this.page.locator('.v-modal, .v-dialog--active').getByText('Comprobantes', {exact: true});
        if (await enModal.count()) {
            await enModal.first().click();
            return;
        }
        const tab = this.page.getByRole('tab', {name: 'Comprobantes'});
        if (await tab.count()) {
            await tab.first().click();
            return;
        }
        await this.page.getByText('Comprobantes', {exact: true}).first().click();
    }

    // ─── Stock comprometido ─────────────────────────────────────

    /** Click en "Stock comprometido" */
    async clickStockComprometido(): Promise<void> {
        await this.page.getByText('Stock comprometido').click();
    }
}
