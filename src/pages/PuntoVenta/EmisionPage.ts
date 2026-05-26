/**
 * Page Object para la pantalla de emisión de comprobantes.
 *
 * Locators reales del codegen:
 * - Búsqueda: getByRole('textbox', { name: 'Escanea o busca por nombre, c' })
 * - Pagar: getByRole('button', { name: 'PAGAR' })
 * - Monto exacto: getByRole('button', { name: 'Monto exacto' })
 * - Realizar Pago: getByRole('button', { name: 'Realizar Pago' })
 * - Nueva Venta: getByRole('button', { name: 'Nueva Venta' })
 * - Cantidad increase: locator con id pv_cmp-punto-venta_..._div:increase
 * - Editar item: locator con id pv_cmp-punto-venta_..._dv:btn-editar
 * - Descuento input: locator con id pv_cmp-punto-venta_..._v-input:descuento
 * - Descuento global: locator con id pv_punto-venta_..._cmp-descuento-pedido_v-input:valor
 */
import {expect, type Locator, type Page} from '@playwright/test';
import type {EmisionResult} from '../../helpers/PuntoVenta/emision.types';
import {throwFunctionalError} from '../../utils/functional-error';
import {FUNCTIONAL_CATALOG} from '../../utils/functional-catalog';
import {esperarDebounce} from '../../utils/wait-helpers';

export class EmisionPage {
    /**
     * Último resultado de emisión capturado del network.
     * Se llena al usar emitirConEfectivoExacto() o emitirConYape().
     */
    public ultimaEmision: EmisionResult | null = null;

    constructor(private readonly page: Page) {
    }

    // ─── Locators reales ──────────────────────────────────────────────

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

    // ─── Intercepción de respuesta de emisión ─────────────────────────

    /**
     * Intercepta la response del API de emisión para capturar serie/correlativo.
     *
     * Endpoint: DocumentosContables/Emisiones/v2
     * Response: { IdComprobante, CorrelativoDocumento, FilePdf: { Nombre: "B001-00000017-..." } }
     *
     * Se extrae la serie del nombre del PDF: "B001-00000017-1004-PDF.pdf" → serie = "B001"
     */
    private async interceptarEmision(): Promise<EmisionResult> {
        const responsePromise = this.page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 30_000},
        );

        await this.clickRealizarPago();

        const response = await responsePromise;
        const body = await response.json();

        // Extraer serie del nombre del PDF: "B001-00000017-1004-PDF.pdf"
        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] || '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;

        const result: EmisionResult = {serie, correlativo, comprobanteId};

        console.log(`   Emisión capturada: ${serie}-${correlativo} (ID: ${comprobanteId})`);
        this.ultimaEmision = result;
        return result;
    }

    // ─── Ítems ────────────────────────────────────────────────────────

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
            const item = this.page
                .locator('.cmp-producto-img')
                .filter({hasText: nombre})
                .first();

            await expect(item).toBeVisible({timeout: 10_000});
            await item.click();

            // 3. Esperar a que el spinner desaparezca
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

    async seleccionarItemPorCodigo(codigo: string): Promise<void> {
        try {
            await this.page.getByText(`${codigo})`).click();
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.agregarItem,
                technicalDetail: `Error al seleccionar ítem por código. Código: ${codigo}.`,
                cause: error,
            });
        }
    }

    /** Lee el precio unitario del item actualmente en el carrito */
    async obtenerPrecioItem(): Promise<number> {
        const precioTexto = await this.page
            .locator('[id*="item_v-text:precio"]')
            .first()
            .textContent({timeout: 5000})
            .catch(() => 'S/ 0');
        const limpio = precioTexto?.replace(/[S\/$\s,]/g, '') ?? '0';
        return parseFloat(limpio);
    }

    /** Lee el subtotal del item en el carrito (precio × cantidad) */
    async obtenerSubtotalItem(): Promise<number> {
        const subtotalTexto = await this.page
            .locator('[id*="item_v-text:subtotal"]')
            .first()
            .textContent({timeout: 5000})
            .catch(() => 'S/ 0');
        const limpio = subtotalTexto?.replace(/[S\/$\s,]/g, '') ?? '0';
        return parseFloat(limpio);
    }

    /** Incrementa la cantidad del ítem con el botón + */
    async incrementarCantidad(veces: number = 1): Promise<void> {
        const btnIncrease = this.page.locator(
            '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
        );
        for (let i = 0; i < veces; i++) {
            await btnIncrease.click();
        }
    }

    /** Editar precio del ítem directamente */
    async editarPrecioItem(nuevoPrecio: string): Promise<void> {
        await this.btnEditar.click();
        const inputPrecio = this.page.locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]',
        );
        await inputPrecio.click();
        await inputPrecio.fill(nuevoPrecio);
        await this.btnEditar.click();
    }

    /** Activa el switch de Doc. Adelanto */
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

    // ─── Descuentos por ítem ──────────────────────────────────────────

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

    // ─── Descuento global ─────────────────────────────────────────────

    /**
     * Despliega el panel inferior de cálculos si se encuentra colapsado (nuevo componente UI).
     */
    async desplegarPanelCalculos(): Promise<void> {
        const btnColapsable = this.page.locator('.collapse-icon').first();
        try {
            await btnColapsable.waitFor({state: 'attached', timeout: 5000});
            const isCerrado = await btnColapsable.locator('.icon.cerrado').isVisible();
            if (isCerrado) {
                await btnColapsable.click();
                // Esperar brevemente para que termine la animación de despliegue
                await esperarDebounce(this.page, 500, 'Animación de colapso de panel');
            }
        } catch (e) {
            // Si el contenedor no existe, no está visible o ocurre un error, continuamos
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

    /**
     * Captura todas las filas visibles del resumen de totales (.cmp-resumen-pedido).
     * Auto-detecta qué conceptos están presentes (Subtotal, IGV, Total retenciones,
     * Monto Detracción Soles, etc.) y omite los que no aparecen.
     *
     * @returns Record<string, string> con label → valor (ej. { "Subtotal": "8.10", "IGV": "1.46" })
     */
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

    /**
     * Captura todas las filas visibles del popup de totales (.cmp-totales-comprobante).
     * Se usa después de llamar a abrirTotales().
     * Auto-detecta qué conceptos están presentes.
     *
     * @returns Record<string, string> con label → valor (ej. { "Operaciones Gravadas": "16.95", "IGV": "3.05" })
     */
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


    // ─── Emisión / Pago ───────────────────────────────────────────────

    async clickPagar(): Promise<void> {
        await this.btnPagar.click();
    }

    async clickMontoExacto(): Promise<void> {
        await this.btnMontoExacto.click();
    }

    async clickRealizarPago(): Promise<void> {
        await this.btnRealizarPago.click();
    }

    async clickNuevaVenta(): Promise<void> {
        await this.btnNuevaVenta.click();
    }

    async clickYape(): Promise<void> {
        await this.btnYape.click();
    }

    async clickAceptarError(): Promise<void> {
        await this.btnAceptar.click();
    }

    /**
     * Flujo completo de emisión con pago en efectivo (monto exacto).
     * Intercepta la API para capturar serie/correlativo del comprobante emitido.
     */
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

    /**
     * Flujo completo de emisión con YAPE.
     * Intercepta la API para capturar serie/correlativo del comprobante emitido.
     */
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

    // ─── Regresar ─────────────────────────────────────────────────────

    async volverAlInicio(): Promise<void> {
        await this.page.locator('.icon').first().click();
    }

    // ─── Precuenta / Vista previa ─────────────────────────────────────

    async clickPrecuenta(): Promise<void> {
        await this.page.getByRole('button', {name: 'PRECUENTA'}).click();
    }

    async clickVistaPrevia(): Promise<void> {
        await this.page.getByRole('button', {name: 'VISTA PREVIA'}).click();
    }

    async cerrarVistaPrevia(): Promise<void> {
        await this.page.locator('.icon-close').click();
    }


    /** Cambia la moneda de Soles a Dólares en el selector de precios */
    async seleccionarMonedaDolares(): Promise<void> {
        await this.page.getByText('Precio estándar (S/)').first().click();
        await this.page.getByText('Precio dolares ($)').click();
    }

    /** Llena el campo de tipo de cambio */
    async llenarTipoCambio(valor: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Cambio'});
        await input.click();
        await input.fill(valor);
    }

    // ─── Fecha ────────────────────────────────────────────────────────

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

        // El calendario usa aria-labels en INGLÉS con formato: "Wednesday, May 6, 2026"
        const diasSemana = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Formato exacto que usa el DOM: "Wednesday, May 6, 2026"
        const ariaLabel = `${diasSemana[fecha.getDay()]}, ${meses[fecha.getMonth()]} ${fecha.getDate()}, ${fecha.getFullYear()}`;

        await this.abrirSelectorFecha();

        const botonFecha = this.page.locator(`[aria-label="${ariaLabel}"]`);
        await botonFecha.waitFor({state: 'attached', timeout: 5_000});

        await botonFecha.dispatchEvent('click');

        console.log(`   Click disparado en fecha fuera de rango: ${ariaLabel}`);
        return ariaLabel;
    }
}
