import {expect, type Locator, type Page} from '@playwright/test';
import type {EmisionResult} from '@app-types/emision.types';
import {throwFunctionalError} from '@utils/functional-error';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {esperarCargaOverlay, esperarDebounce} from '@utils/wait-helpers';

export class EmisionPage {

    public ultimaEmision: EmisionResult | null = null;

    constructor(private readonly page: Page) {
    }

    private get searchInput(): Locator {
        return this.page.getByRole('textbox', {name: 'Escanea o busca por nombre, c'});
    }

    private get btnPagar(): Locator {
        return this.page.getByRole('button', {name: 'PAGAR'});
    }

    private get btnMontoExacto(): Locator {
        return this.page.getByRole('button', {name: 'Monto exacto'});
    }

    private get btnRealizarPago(): Locator {
        return this.page.getByRole('button', {name: 'Realizar Pago'});
    }

    private get btnGuardarPedido(): Locator {
        return this.page.getByRole('button', {name: 'GUARDAR PEDIDO'});
    }

    private get btnActualizarPedido(): Locator {
        return this.page.getByRole('button', {name: 'ACTUALIZAR PEDIDO'});
    }

    private get btnNuevaVenta(): Locator {
        return this.page.getByRole('button', {name: 'Nueva Venta'});
    }

    private get btnEditar(): Locator {
        return this.page.locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        );
    }

    private get btnYape(): Locator {
        return this.page.getByRole('button', {name: 'YAPE'});
    }

    private get btnAceptar(): Locator {
        return this.page.getByRole('button', {name: 'Aceptar'});
    }

    private async interceptarEmision(): Promise<EmisionResult> {
        const responsePromise = this.page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 30_000},
        );

        await this.clickRealizarPago();

        const response = await responsePromise;
        const body = await response.json();

        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] || '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;

        const result: EmisionResult = {serie, correlativo, comprobanteId};

        console.log(`   Emisión capturada: ${serie}-${correlativo} (ID: ${comprobanteId})`);
        this.ultimaEmision = result;
        return result;
    }

    async buscarItem(codigo: string): Promise<void> {
        try {
            await this.searchInput.click();
            await this.searchInput.fill(codigo);
            await esperarDebounce(this.page, 800, 'Debounce del buscador de items en ERP');
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.agregarItem,
                technicalDetail: `Error al buscar ítem. Código: ${codigo}.`,
                cause: error,
            });
        }
    }

    async seleccionarItem(nombre: string): Promise<void> {
        try {

            await esperarCargaOverlay(this.page, 30_000).catch(() => {
            });

            const item = this.page
                .locator('.body')
                .filter({hasText: nombre})
                .first().or(
                    this.page
                        .locator('.card-item-dropdown')
                        .filter({hasText: nombre})
                        .first()
                );

            await expect(item).toBeVisible({timeout: 30_000});
            await item.click();

            const overload = this.page.locator('[id="cmn_cmp-overload:loading"]');
            await overload.waitFor({state: 'visible', timeout: 2_000}).catch(() => {
            });
            await overload.waitFor({state: 'hidden', timeout: 15_000}).catch(() => {
            });

            await esperarDebounce(this.page, 800, 'Debounce al agregar ítem al carrito');
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.agregarItem,
                technicalDetail: `Error al seleccionar ítem. Nombre: ${nombre}.`,
                cause: error,
            });
        }
    }

    async incrementarCantidadImagen(veces: number = 1, nombre: string): Promise<void> {
        try {
            const btnIncrease = this.page
                .locator('.cmp-producto-img')
                .filter({hasText: nombre})
                .first();

            await expect(btnIncrease).toBeVisible({timeout: 10_000});

            for (let i = 0; i < veces; i++) {
                await btnIncrease.click();
                await this.page.waitForTimeout(200);
            }

            const overload = this.page.locator('[id="cmn_cmp-overload:loading"]');
            await overload.waitFor({state: 'visible', timeout: 2_000}).catch(() => {
            });
            await overload.waitFor({state: 'hidden', timeout: 15_000}).catch(() => {
            });

            await esperarDebounce(this.page, 800, 'Debounce al incrementar cantidad');
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.incrementarCantidadImagen,
                technicalDetail: `Error al incrementar cantidad. Veces: ${veces}.`,
                cause: error,
            });
        }
    }

    async incrementarCantidad(veces: number = 1): Promise<void> {
        const btnIncrease = this.page.locator(
            '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
        );
        for (let i = 0; i < veces; i++) {
            await btnIncrease.click();
        }
    }

    async editarPrecioItem(nuevoPrecio: string): Promise<void> {
        await this.btnEditar.click();
        const inputPrecio = this.page.locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]',
        );
        await inputPrecio.click();
        await inputPrecio.fill(nuevoPrecio);
        await this.btnEditar.click();
    }

    async activarDocAdelanto(): Promise<void> {
        const input = this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-switch:adelanto"]'
        );
        const slider = this.page.locator(
            'label:has([id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-switch:adelanto"]) .slider'
        );
        const isChecked = await input.evaluate((el: HTMLInputElement) => el.checked);

        if (!isChecked) {
            await slider.scrollIntoViewIfNeeded();
            await slider.click({force: true});
        }
    }

    async abrirEdicionItem(): Promise<void> {
        await this.btnEditar.click();
    }

    async seleccionarTipoDescuentoMonto(): Promise<void> {
        await this.page.getByText('%', {exact: true}).click();
        await this.page.getByText('Monto').click();
    }

    async seleccionarTipoDescuentoPorcentaje(): Promise<void> {
        await this.page.getByText('%', {exact: true}).click();
        await this.page.getByText('Porcentaje').click();
    }

    async llenarDescuentoItem(valor: string): Promise<void> {
        const input = this.page.locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descuento"]',
        );
        await input.click();
        await input.fill(valor);
    }

    async cerrarEdicionItem(): Promise<void> {
        await this.btnEditar.click();
    }

    async desplegarPanelCalculos(): Promise<void> {
        const btnColapsable = this.page.locator('.collapse-icon').first();
        try {
            await btnColapsable.waitFor({state: 'attached', timeout: 5000});
            const isCerrado = await btnColapsable.locator('.icon.cerrado').isVisible();
            if (isCerrado) {
                await btnColapsable.click();

                await esperarDebounce(this.page, 500, 'Animación de colapso de panel');
            }
        } catch (e) {

        }
    }

    async abrirDescuentoGlobal(): Promise<void> {
        await this.desplegarPanelCalculos();
        await this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:detalles"]',
        ).click();
    }

    async llenarDescuentoGlobal(valor: string): Promise<void> {
        const input = this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]',
        );
        await input.click();
        await input.fill(valor);
    }

    async aplicarDescuentoGlobal(): Promise<void> {
        await this.page.getByRole('button', {name: 'Aplicar descuento'}).click();
    }

    async abrirTotales(): Promise<void> {
        await this.desplegarPanelCalculos();
        await this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]',
        ).click();
    }

    async capturarResumenPedido(): Promise<Record<string, string>> {
        const filas = await this.page.locator('.cmp-resumen-pedido .content .subtotal').all();
        const resultado: Record<string, string> = {};

        for (const fila of filas) {
            const spans = await fila.locator('span.v-text').all();
            if (spans.length < 2) continue;
            const label = (await spans[0].textContent())?.trim() ?? '';
            const valor = (await spans[1].textContent())?.trim() ?? '';
            if (label && valor) {
                const sinPrefijo = valor.replace(/^S\/\s*/, '');
                resultado[label] = sinPrefijo;
            }
        }

        const totalLabel = await this.page.locator('.cmp-resumen-pedido .content .total .texto-total span.v-text').first().textContent();
        const totalValor = await this.page.locator('.cmp-resumen-pedido .content .total .monto span.v-text').last().textContent();
        if (totalLabel && totalValor) {
            const label = totalLabel.trim();
            const sinPrefijo = totalValor.trim().replace(/^S\/\s*/, '');
            resultado[label] = sinPrefijo;
        }

        return resultado;
    }

    async capturarTotalesPopup(): Promise<Record<string, string>> {
        const filas = await this.page.locator('.cmp-totales-comprobante .cuerpo div.texto').all();
        const resultado: Record<string, string> = {};

        for (const fila of filas) {
            const spans = await fila.locator('span.v-text, span.v-p').all();
            if (spans.length < 2) continue;
            const label = (await spans[0].textContent())?.trim() ?? '';
            const valor = (await spans[1].textContent())?.trim() ?? '';
            if (label && valor) {
                const sinPrefijo = valor.replace(/^S\/\s*/, '');
                resultado[label] = sinPrefijo;
            }
        }

        return resultado;
    }

    async clickPagar(): Promise<void> {
        await this.btnPagar.click();
    }

    async clickMontoExacto(): Promise<void> {
        await this.btnMontoExacto.click();
    }

    async clickRealizarPago(): Promise<void> {
        await this.btnRealizarPago.click();
    }

    async clickGuardarPedido(): Promise<void> {
        await this.btnGuardarPedido.click();
    }

    async clickActualizarPedido(): Promise<void> {
        await this.btnActualizarPedido.click();
    }

    async clickNuevaVenta(): Promise<void> {
        await this.btnNuevaVenta.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(500);
    }

    async clickYape(): Promise<void> {
        await this.btnYape.click();
    }

    async clickAceptarError(): Promise<void> {
        await this.btnAceptar.click();
    }

    async emitirConEfectivoExacto(): Promise<EmisionResult> {
        try {
            await this.clickPagar();
            await this.clickMontoExacto();
            return await this.interceptarEmision();
        } catch (error) {
            return await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.emitirComprobante,
                cause: error,
            });
        }
    }

    async emitirConYape(): Promise<EmisionResult> {
        try {
            await this.clickPagar();
            await this.clickYape();
            return await this.interceptarEmision();
        } catch (error) {
            return await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.emitirComprobante,
                cause: error,
            });
        }
    }

    async guardarPedido(): Promise<EmisionResult> {
        try {
            const responsePromise = this.page.waitForResponse(
                (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
                {timeout: 30_000},
            );

            await this.clickGuardarPedido();

            const response = await responsePromise;
            const body = await response.json();

            const nombrePdf: string = body.FilePdf?.Nombre ?? '';
            const serie = nombrePdf.split('-')[0] || '';
            const correlativo = String(body.CorrelativoDocumento ?? '');
            const comprobanteId = body.IdComprobante ?? 0;

            const result: EmisionResult = {serie, correlativo, comprobanteId};

            console.log(`   Pedido guardado capturado: ${serie}-${correlativo} (ID: ${comprobanteId})`);
            this.ultimaEmision = result;
            return result;
        } catch (error) {
            return await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.emitirComprobante,
                cause: error,
            });
        }
    }

    async volverAlInicio(): Promise<void> {
        await this.page.locator('.icon').first().click();
    }

    async clickPrecuenta(): Promise<void> {
        await this.page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-button:precuenta"]').click()
        await this.page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-button:precuenta_li:imprimir_a4"]').click();
    }

    async clickVistaPrevia(): Promise<void> {
        await this.page.getByRole('button', {name: 'VISTA PREVIA'}).click();
    }

    async cerrarVistaPrevia(): Promise<void> {
        await this.page.locator('.icon-close').click();
    }

    async seleccionarMonedaDolares(): Promise<void> {
        await this.page.getByText('Precio estándar (S/)').first().click();
        await this.page.getByText('Precio dolares ($)').click();
    }

    async llenarTipoCambio(valor: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Cambio'});
        await input.click();
        await input.fill(valor);
    }

    async abrirSelectorFecha(): Promise<void> {
        await this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]',
        ).click();
    }

    async seleccionarFecha(nombreBoton: string): Promise<void> {
        await this.page.getByRole('button', {name: nombreBoton}).click();
    }

    async obtenerFechaMostrada(): Promise<string> {
        return (await this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"] .v-text'
        ).innerText()).trim();
    }

    async clickFechaFueraDeRango(diasLimite: number): Promise<string> {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - (diasLimite + 1));
        const diasSemana = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const ariaLabel = `${diasSemana[fecha.getDay()]}, ${meses[fecha.getMonth()]} ${fecha.getDate()}, ${fecha.getFullYear()}`;
        await this.abrirSelectorFecha();
        const fechaObjetivo = new Date()
        fechaObjetivo.setDate(fechaObjetivo.getDate() - (diasLimite + 1));
        const hoy = new Date();
        if (
            fechaObjetivo.getMonth() !== hoy.getMonth() ||
            fechaObjetivo.getFullYear() !== hoy.getFullYear()
        ) {
            await this.page.locator('button.vc-arrow.vc-prev').click()
        }

        const botonFecha = this.page.locator(
            `.vc-day:not(.is-not-in-month) [aria-label="${ariaLabel}"]`
        );
        await botonFecha.waitFor({state: 'attached', timeout: 5_000});
        await botonFecha.dispatchEvent('click');
        console.log(`   Click disparado en fecha fuera de rango: ${ariaLabel}`);
        return ariaLabel;
    }
}
