/**
 * Factories de semillas para los tests de Búsqueda de Comprobantes.
 *
 * Responsabilidad única: crear comprobantes en el estado correcto y
 * retornar un objeto ComprobanteInfo que el spec usa como fuente de verdad.
 *
 * Las funciones aquí NO pertenecen a ningún Page Object porque combinan
 * múltiples POs para completar un flujo de negocio de preparación.
 * Son helpers de setup, no de producción.
 */

import {type Page} from '@playwright/test';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {CAJAS, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esperarCargaOverlay} from '@utils/wait-helpers';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Navega al PV de una caja y se asegura de que esté abierta. */
async function irACaja(page: Page, caja: CajaPage): Promise<void> {
    await page.goto('/');
    await page.getByText('Ventas y compras').click();
    await page.getByText('Ver cajas').click();
    await caja.asegurarCajaAbierta();
}

/** Extrae serie y correlativo del número completo y construye el objeto base. */
function buildInfo(tipo: string, numeroCompleto: string, cliente: string, estado?: string): ComprobanteInfo {
    const [serie, correlativo] = numeroCompleto.split('-');
    return {tipo, serie: serie ?? '', correlativo: correlativo ?? '', numeroCompleto, cliente, estado};
}

// ---------------------------------------------------------------------------
// Semilla: Cotización (para BC-23 – eliminar)
// ---------------------------------------------------------------------------

export async function crearCotizacionSemilla(page: Page): Promise<ComprobanteInfo> {
    const caja        = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobante = new ComprobantePage(page);
    const cliente     = new ClientePage(page);
    const emision     = new EmisionPage(page);
    const post        = new PostEmisionPage(page);

    await irACaja(page, caja);
    await comprobante.seleccionarCotizacion();
    await emision.buscarItem(ITEMS_PV.PRODUCTO_SIN_STOCK.codigo);
    await emision.seleccionarItem(ITEMS_PV.PRODUCTO_SIN_STOCK.nombre);
    await cliente.seleccionarClienteDNI(
        CLIENTES.PERSONA_DNI.documento,
        `DNIDoc. Nacional de Identidad${CLIENTES.PERSONA_DNI.documento}99999999${CLIENTES.PERSONA_DNI.nombre}`,
    );
    await emision.guardarPedido();
    const num = await post.obtenerCorrelativoDinamico();
    await emision.clickNuevaVenta();
    return buildInfo('Cotización', num, CLIENTES.PERSONA_DNI.nombre);
}

// ---------------------------------------------------------------------------
// Semilla: Boleta emitida (para BC-25 – validar que "Emitir" NO aparece)
// ---------------------------------------------------------------------------

export async function crearBoletaEmitidaSemilla(page: Page): Promise<ComprobanteInfo> {
    const caja        = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobante = new ComprobantePage(page);
    const cliente     = new ClientePage(page);
    const emision     = new EmisionPage(page);
    const post        = new PostEmisionPage(page);

    await irACaja(page, caja);
    await comprobante.seleccionarBoleta();
    await cliente.seleccionarClienteDNI(
        CLIENTES.PERSONA_DNI.documento,
        `DNIDoc. Nacional de Identidad${CLIENTES.PERSONA_DNI.documento}99999999${CLIENTES.PERSONA_DNI.nombre}`,
    );
    await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
    await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
    await emision.emitirConEfectivoExacto();
    const num = await post.obtenerCorrelativoDinamico();
    await emision.clickNuevaVenta();
    return buildInfo('Boleta', num, CLIENTES.PERSONA_DNI.nombre, 'EMITIDO');
}

// ---------------------------------------------------------------------------
// Semilla: Guía de Remisión guardada (para BC-24 y BC-25b)
// ---------------------------------------------------------------------------

/** Datos del conductor de prueba configurado en el ambiente. */
const CONDUCTOR_DNI      = '75652545';
const CONDUCTOR_SELECTOR = 'DNI75652545Conductor automatizado qa';
const PLACA_VEHICULO     = 'ABC123';
const LICENCIA_VEHICULO  = 'A12345678';
const REGISTRO_MTC       = 'MTC123';
const DNI_DESTINATARIO   = '76975258';

export async function crearGuiaRemisionGuardada(page: Page): Promise<ComprobanteInfo> {
    const caja        = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobante = new ComprobantePage(page);
    const emision     = new EmisionPage(page);
    const post        = new PostEmisionPage(page);

    await irACaja(page, caja);

    await page.locator('.v-select-small-value').first().click(); // Click on the active type to open the dropdown
    await page.locator(
        '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3005"]',
    ).click();
    await esperarCargaOverlay(page);

    // Destinatario
    await page.locator(
        '[id="pv_cmp-guia-remision-remitente_cmp-card-destinatario:form-destino_v-input:filtrar-entidad"]',
    ).fill(DNI_DESTINATARIO);
    await page.locator(
        '[id="pv_cmp-guia-remision-remitente_cmp-card-destinatario:form-destino_item:seleccion-entidad_div-0"]',
    ).click();

    // Ubigeo inicio
    await page.getByRole('article').filter({hasText: 'Datos de inicio de'}).locator('input[type="text"]').fill('arequipa');
    await page.getByText('- Arequipa - Arequipa - Arequipa').click();

    // Ubigeo destino
    await page.getByRole('textbox', {name: 'Busca por distrito, ciudad,'}).fill('juliaca');
    await page.getByText('- Juliaca - San Roman - Puno').click();

    // Dirección destino
    await page.locator(
        '[id="pv_cmp-guia-remision-remitente_cmp-card-destinatario:form-destino_v-input:direccion-destino"]',
    ).fill('juliaca-automatización');

    // Conductor
    await page.locator(
        '[id="pv_cmp-guia-remision-remitente_cmp-card-transporte:form-transporte-conductor_v-input:filtrar-entidad"]',
    ).fill(CONDUCTOR_DNI);
    await page.getByText(CONDUCTOR_SELECTOR).click();

    // Vehículo
    await page.getByRole('textbox', {name: 'Ej. A1A000'}).fill(PLACA_VEHICULO);
    await page.getByRole('textbox', {name: 'Ej. A23456723'}).fill(LICENCIA_VEHICULO);

    // Transportista
    await page.getByRole('textbox', {name: 'Digite N° de documento'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
    await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();

    // Registro MTC
    await page.locator(
        '[id="pv_cmp-guia-remision-remitente_cmp-card-transporte:form-transporte_v-input:registro-mtc"]',
    ).fill(REGISTRO_MTC);

    // Producto y peso
    await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
    await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
    await page.getByRole('textbox', {name: 'Kg'}).fill('10');

    // GUARDAR (no emitir) → estado Guardado
    await page.getByRole('button', {name: 'Guardar', exact: true}).click();
    await esperarCargaOverlay(page);

    const num = await post.obtenerCorrelativoDinamico();
    return buildInfo('Guía de Remisión', num, CLIENTES.PERSONA_DNI.nombre, 'GUARDADO');
}

// ---------------------------------------------------------------------------
// Semilla: Boleta en EURO (para BC-22 – clonar a caja sin EUR)
// ---------------------------------------------------------------------------

/**
 * Asegura que la moneda EURO existe en el sistema y que la caja de venta
 * la tiene habilitada. Es idempotente (no falla si ya existe).
 */
export async function asegurarConfiguracionEuro(page: Page, codigoItemPV: string): Promise<void> {
    // 1. Ir a Impuestos y monedas
    await page.goto('/configuracion/sistema/sucursales');
    await page.getByRole('link', {name: 'Impuestos y monedas'}).click();
    await esperarCargaOverlay(page);

    // 2. Crear EURO si no existe
    const eurVisible = await page.getByText('EUROS', {exact: true}).isVisible({timeout: 3_000}).catch(() => false);
    if (!eurVisible) {
        await page.getByRole('button', {name: 'Crear moneda'}).click();
        await page.getByRole('textbox', {name: 'Buscar nombre de la moneda Ej'}).fill('euros');
        await page.getByText('EUROS').click();
        await page.getByRole('button', {name: 'Crear moneda'}).nth(1).click();
        await page.locator('.v-modal > div').first().click();
    }

    // 3. Habilitar EURO en la caja de venta
    await page.getByRole('link', {name: 'Caja de ventas'}).click();
    await esperarCargaOverlay(page);
    await page.locator('[id*="cmp_dropdown:opciones-0-0"]').first().click();
    await page.locator('[id*="editar-caja-0-0"]').click();
    await esperarCargaOverlay(page);
    await page.locator('div').filter({hasText: /^Monedas$/}).click();
    const switchEuro = page.locator('tr:nth-child(3) > .celda.celda-activar .slider');
    if (await switchEuro.isVisible()) await switchEuro.click();
    await page.getByRole('button', {name: 'Editar caja de ventas'}).click();
    await page.locator('.v-modal > div').first().click();

    // 4. Crear lista de precios EURO en el producto y asignar precio
    await page.getByText('Productos y servicios').click();
    await page.locator('[id*="select-module-203-item-2007"]').click();
    await esperarCargaOverlay(page);
    await page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}).fill(codigoItemPV);
    await esperarCargaOverlay(page);
    await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
    await page.getByText('Editar ítem').click();
    await esperarCargaOverlay(page);

    const listaPrecioEuroVisible = await page.getByText('Precio euros').isVisible({timeout: 3_000}).catch(() => false);
    if (!listaPrecioEuroVisible) {
        await page.getByRole('button', {name: 'Crear lista de precios'}).click();
        await page.getByRole('textbox', {name: 'Digita el nombre de la lista'}).fill('Precio euros');
        await page.locator('div').filter({hasText: /^SOLES \(S\/\)$/}).nth(3).click();
        await page.getByText('EUROS (€)').click();
        await page.getByRole('button', {name: 'Crear lista de precios'}).nth(1).click();
        await page.locator('.v-modal > div').first().click();
    }

    // Asignar precio EUR al producto
    const inputPrecioEur = page.getByRole('textbox', {name: 'Monto final'}).nth(2);
    await inputPrecioEur.click();
    await inputPrecioEur.fill('15.42');
    await page.getByRole('button', {name: 'Actualizar producto'}).click();
    await page.locator('.v-modal > div').first().click();
}

/**
 * Emite una boleta en EURO desde la caja de venta.
 * Precondición: `asegurarConfiguracionEuro` debe haberse ejecutado antes.
 */
export async function crearBoletaEnEuro(page: Page): Promise<ComprobanteInfo> {
    const caja        = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobante = new ComprobantePage(page);
    const cliente     = new ClientePage(page);
    const emision     = new EmisionPage(page);
    const post        = new PostEmisionPage(page);

    await irACaja(page, caja);

    // Cambiar lista de precios a EURO
    await page.getByText('Precio estándar (S/)').first().click();
    await page.getByText('Precio euros (€)').click();

    await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
    await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
    await comprobante.seleccionarBoleta();
    await cliente.seleccionarClienteDNI(
        CLIENTES.PERSONA_DNI.documento,
        `DNIDoc. Nacional de Identidad${CLIENTES.PERSONA_DNI.documento}99999999${CLIENTES.PERSONA_DNI.nombre}`,
    );
    await emision.emitirConEfectivoExacto();
    const num = await post.obtenerCorrelativoDinamico();
    await emision.clickNuevaVenta();
    return buildInfo('Boleta', num, CLIENTES.PERSONA_DNI.nombre, 'EMITIDO');
}
