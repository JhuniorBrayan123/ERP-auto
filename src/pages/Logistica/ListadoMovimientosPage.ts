import {type Download, Locator, type Page} from '@playwright/test';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {expectVisibleFunctional, runFunctionalAction} from '@utils/functional-step';

export class ListadoMovimientosPage {
    constructor(private readonly page: Page) {
    }

    private readonly overloadLoading = this.page.locator('[id="cmn_cmp-overload:loading"]');

    private async esperarSinOverlayCarga(): Promise<void> {
        await this.overloadLoading.waitFor({state: 'hidden', timeout: 35_000}).catch(() => {
        });
    }

    async abrirMenuAcciones(): Promise<void> {
        await this.esperarSinOverlayCarga();
        await this.page.locator('.cmp-dropdown-toggle.justify-content-center').first().click();
    }

    async buscarMovimientoPorCodigo(codigo: string): Promise<void> {
        await runFunctionalAction(this.page, {
            ...FUNCTIONAL_CATALOG.movimientos.verificarBitacora,
            flowStep: 'Buscar movimiento por código en listado',
            userMessage: 'No se pudo ubicar el movimiento en el listado.',
            technicalDetail: `Falla en el buscador o la grilla no mostró el movimiento con código ${codigo}.`,
        }, async () => {
            await this.esperarSinOverlayCarga();

            const buscador = this.page.locator(
                'input[id="lgt_movimientos_cmp-filtro-movimientos:ver_v-input:busqueda_compuesta"]',
            );

            await expectVisibleFunctional(this.page, buscador, {
                ...FUNCTIONAL_CATALOG.movimientos.verificarBitacora,
                flowStep: 'Validar buscador de movimientos visible',
                userMessage: 'No se encontró el buscador de movimientos.',
                technicalDetail: 'El input de búsqueda por código o comprobante no está visible.',
            });

            await buscador.click();
            await buscador.fill('');
            await buscador.fill(codigo);
            await buscador.press('Enter');

            await this.esperarSinOverlayCarga();

            await expectVisibleFunctional(this.page, this.obtenerFilaPorCodigo(codigo), {
                ...FUNCTIONAL_CATALOG.movimientos.verificarBitacora,
                flowStep: 'Confirmar que el movimiento aparece en el listado',
                userMessage: 'El movimiento no apareció en el listado después de buscarlo.',
                technicalDetail: `La fila con código ${codigo} no se visualizó dentro del tiempo esperado.`,
            });
        });
    }

    async abrirMenuAccionesPorCodigo(codigo: string): Promise<void> {
        await runFunctionalAction(this.page, {
            ...FUNCTIONAL_CATALOG.movimientos.verificarBitacora,
            flowStep: 'Abrir menú de acciones del movimiento',
            userMessage: 'No se pudo abrir el menú de acciones del movimiento seleccionado.',
            technicalDetail: `No se visualizó la fila o no respondió el botón de acciones para el código ${codigo}.`,
        }, async () => {
            await this.esperarSinOverlayCarga();

            const fila = this.obtenerFilaPorCodigo(codigo);
            await expectVisibleFunctional(this.page, fila, {
                ...FUNCTIONAL_CATALOG.movimientos.verificarBitacora,
                flowStep: 'Localizar movimiento antes de abrir acciones',
                userMessage: 'No se encontró el movimiento para abrir sus acciones.',
                technicalDetail: `La fila para código ${codigo} no estuvo visible en el listado.`,
            });

            const botonAcciones = fila.locator('.cmp-dropdown-toggle.justify-content-center').first();
            await botonAcciones.click();
        });
    }

    private obtenerFilaPorCodigo(codigo: string): Locator {
        return this.page.locator('tr', {hasText: codigo}).first();
    }

    async abrirMenuAccionesIcono(): Promise<void> {
        await this.page.locator('.v-icon-base > .icon').first().click();
    }

    async clickEditarMovimiento(): Promise<void> {
        await this.page.getByText('Editar movimiento').click();
    }

    async clickClonarMovimiento(): Promise<void> {
        await this.page.getByText('Clonar movimiento').click();
    }

    async clickEliminarMovimiento(): Promise<void> {
        await this.page.getByText('Eliminar movimiento').click();
    }

    async clickEliminaElMovimiento(): Promise<void> {
        const opcion = this.page.getByText('Elimina el movimiento permanentemente').first();
        await opcion.click();
    }

    async clickVerMovimiento(): Promise<void> {
        await this.page.getByText('Ver movimiento').click();
    }

    async clickDespacharSalida(): Promise<void> {
        await this.page.getByText('Despachar salida').click();
    }

    async clickImprimirDescargarEnviar(): Promise<void> {
        await this.esperarSinOverlayCarga();
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

    async clickVerBitacora(): Promise<void> {
        await this.page.getByText('Ver bitácora').click();
    }

    async clickEventoBitacora(evento: string): Promise<void> {
        await this.page.getByText(evento, {exact: true}).click();
    }

    async cerrarBitacora(): Promise<void> {
        await this.page.locator('.drape.is-open > .button-close > .icon').click();
    }

    async cerrarBitacoraAlternativo(): Promise<void> {
        await this.page.locator('.drape.is-open > .button-close').click();
    }

    async confirmarEliminacion(): Promise<void> {
        await this.page.getByRole('button', {name: 'Eliminar'}).click();
    }

    async aceptarAlertaStockNegativo(): Promise<void> {
        await this.page.getByRole('button', {name: 'Aceptar'}).click();
    }

    async confirmarDespacho(): Promise<void> {
        await this.page.getByRole('button', {name: 'DESPACHAR SALIDA'}).click();
    }

    async clickTabTodos(): Promise<void> {
        await this.page.getByText('Todos', {exact: true}).click();
    }

    async clickTabPorIndice(indice: number): Promise<void> {
        await this.page
            .locator(`[id="lgt_movimientos_cmp-header-movimientos:section_v-button:tipo_movimiento:${indice}"]`)
            .click();

    }

    async clickTabPorIndice2(indice: number): Promise<void> {
        const tab = this.page
            .locator(`[id="lgt_movimientos_cmp-header-movimientos:section_v-button:tipo_movimiento:${indice}"]`)
        ;
        await tab.click();

        await this.esperarSinOverlayCarga();

        await this.page
            .locator('.cmp-dropdown-toggle.justify-content-center')
            .first()
            .waitFor({state: 'visible', timeout: 10_000});
    }

    async clickIconoOpciones(): Promise<void> {
        await this.page.locator('.icon-container > .icon').click();
    }

    async abrirFiltrosAvanzados(): Promise<void> {
        await this.page.getByRole('button', {name: 'Ver filtros avanzados'}).click();
    }

    async filtrarPorTipoMov(tipo: string): Promise<void> {
        await this.page.getByText('Tipo mov.').click();
        await this.page.getByText(tipo, {exact: true}).click();
    }

    async filtrarPorAlmacen(almacen: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Almacén$/}).nth(2).click();
        await this.page.locator('thead').getByText(almacen).click();
    }

    async exportarTodosMovimientos(): Promise<Download> {
        await this.page.getByText('Descargar todos los movimientos').waitFor({state: 'visible'});
        const downloadPromise = this.page.waitForEvent('download');
        await this.page.getByText('Descargar todos los movimientos').click();
        return downloadPromise;
    }

    async exportarfiltrados(): Promise<Download> {
        await this.page.getByText('Descargar movimientos filtrados').waitFor({state: 'visible'});
        const downloadPromise = this.page.waitForEvent('download');
        await this.page.getByText('Descargar movimientos filtrados').click();
        return downloadPromise;
    }

    async clickCrearDesdeExcel(): Promise<void> {
        await this.page.getByText('Crear movimientos desde excel').click();
    }

    async imprimirA4DesdeLista(): Promise<void> {
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:impresion-a4"]')
            .click();
    }

    async imprimirTicketDesdeLista(): Promise<void> {
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:impresion-ticket"]')
            .click();
    }

    async clickWhatsAppDesdeLista(): Promise<void> {
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:envio-whatsapp"]')
            .click();
    }

    async clickEmailDesdeLista(): Promise<void> {
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:envio-correo"]')
            .click();
    }

    async descargarPDFDesdeLista(): Promise<Download> {
        const downloadPromise = this.page.waitForEvent('download');
        await this.page
            .locator('[id="lgt_movimientos_v-modal:opciones-adicionales-movimiento_div:descarga-pdf"] div')
            .filter({hasText: /^Descargar PDF$/})
            .click();
        return downloadPromise;
    }

    async enviarWhatsAppDesdeLista(telefono: string): Promise<Page> {
        await this.clickWhatsAppDesdeLista();
        const inputTelefono = this.page.getByRole('textbox', {name: 'Ej.'});
        await inputTelefono.click();
        await inputTelefono.fill(telefono);
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByText('Enviar', {exact: true}).click();
        return popupPromise;
    }

    async enviarEmailDesdeLista(email: string): Promise<void> {
        await this.clickEmailDesdeLista();
        const inputEmail = this.page.getByRole('textbox', {name: 'Ej. email1@gmail.com, email2@'});
        await inputEmail.click();
        await inputEmail.fill(email);
        await this.page.getByText('Enviar', {exact: true}).click();
    }

    async cerrarModal(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }

    async clickDatosOpcionalesEnDetalle(): Promise<void> {
        await this.page.getByText('Datos opcionales').click();
    }

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

    async clickStockComprometido(): Promise<void> {
        await this.page.getByText('Stock comprometido').click();
    }
}
