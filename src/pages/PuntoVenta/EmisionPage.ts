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
import {type Locator, type Page} from '@playwright/test';
import type {EmisionResult} from '../../helpers/PuntoVenta/emision.types';
import {CLIENTES} from "@helpers/PuntoVenta/emision-data.helper";

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
        await this.searchInput.click();
        await this.searchInput.fill(codigo);
        await this.page.waitForTimeout(800); // debounce del ERP
    }

    async seleccionarItem(nombre: string): Promise<void> {
        await this.page.getByText(nombre).click();
    }

    async seleccionarItemPorCodigo(codigo: string): Promise<void> {
        await this.page.getByText(`${codigo})`).click();
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

    async abrirDescuentoGlobal(): Promise<void> {
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
        await this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]',
        ).click();
    }

    // ─── Datos Opcionales ─────────────────────────────────────────────

    async abrirDatosOpcionales(): Promise<void> {
        await this.page.getByRole('button', {name: 'Datos'}).click();
    }

    async llenarDatosOpcionales(): Promise<void> {
        // Seleccionar Vendedor / Cliente
        const cliente = CLIENTES.PERSONA_AUTO;

        const inputVendedor = this.page.getByRole("textbox", {name: "Nombre del vendedor"});
        await inputVendedor.click();
        await inputVendedor.fill(cliente.documento)

        await this.page.locator(".card-entidad-cliente").filter({hasText: cliente.nombre}).first().click();

        // Llenar campos de datos opcionales
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]').fill("121");
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]').fill("12");
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]').fill("observacion para datos adicionales");
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]').fill("texto");
        await this.page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]').fill("123123");

        // Guardar
        await this.page.getByRole("button", {name: "Guardar datos"}).click();
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
        await this.clickPagar();
        await this.clickMontoExacto();
        return this.interceptarEmision();
    }

    /**
     * Flujo completo de emisión con YAPE.
     * Intercepta la API para capturar serie/correlativo del comprobante emitido.
     */
    async emitirConYape(): Promise<EmisionResult> {
        await this.clickPagar();
        await this.clickYape();
        return this.interceptarEmision();
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

    // ─── Campos adicionales ───────────────────────────────────────────

    async clickAnadirCampos(): Promise<void> {
        await this.page.getByText('AÑADIR CAMPOS').click();
    }

    /** Activa el switch de Doc. Adelanto */
    async activarDocAdelanto(): Promise<void> {
        await this.page
            .locator(
                'div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider',
            )
            .click();
    }

    // ─── Moneda ────────────────────────────────────────────────────────

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

        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

        const ariaLabel = `${diasSemana[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;

        await this.abrirSelectorFecha();

        const botonFecha = this.page.locator(`[aria-label="${ariaLabel}"]`);

        await botonFecha.waitFor({state: 'attached', timeout: 5_000});

        // ✅ dispatchEvent bypasea aria-disabled y todos los checks de Playwright
        await botonFecha.dispatchEvent('click');

        console.log(`   Click disparado en fecha fuera de rango: ${ariaLabel}`);

        return ariaLabel;
    }
}
