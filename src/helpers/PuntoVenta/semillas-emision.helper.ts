import {type Page} from '@playwright/test';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {GuiaRemitentePage} from '@pages/PuntoVenta/guias-remision/GuiaRemitentePage';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {CAJAS, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {CotizacionTargets} from '@screenplay/targets/cotizacion/CotizacionTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

async function irACaja(page: Page, caja: CajaPage): Promise<void> {
    await page.goto('/');
    await page.getByText('Ventas y compras').click();
    await page.getByText('Ver cajas').click();
    await caja.asegurarCajaAbierta();
}


function buildInfo(tipo: string, numeroCompleto: string, cliente: string, estado?: string): ComprobanteInfo {
    const [serie, correlativo] = numeroCompleto.split('-');
    return {tipo, serie: serie ?? '', correlativo: correlativo ?? '', numeroCompleto, cliente, estado};
}

export async function crearCotizacionSemilla(page: Page): Promise<ComprobanteInfo> {
    const caja = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobante = new ComprobantePage(page);
    const cliente = new ClientePage(page);
    const emision = new EmisionPage(page);
    const post = new PostEmisionPage(page);

    await irACaja(page, caja);
    await comprobante.seleccionarCotizacion();
    await emision.buscarItem(ITEMS_PV.PRODUCTO_SIN_STOCK.codigo);
    await emision.seleccionarItem(ITEMS_PV.PRODUCTO_SIN_STOCK.nombre);
    await cliente.seleccionarClienteDNI(
        CLIENTES.PERSONA_DNI.documento,
        `DNIDoc. Nacional de Identidad${CLIENTES.PERSONA_DNI.documento}99999999${CLIENTES.PERSONA_DNI.nombre}`,
    );
    await CotizacionTargets.btnEmitir(page).click();
    const num = await post.obtenerCorrelativoDinamico();
    await emision.clickNuevaVenta();
    return buildInfo('Cotización', num, CLIENTES.PERSONA_DNI.nombre);
}

export async function crearBoletaEmitidaSemilla(page: Page): Promise<ComprobanteInfo> {
    const caja = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobante = new ComprobantePage(page);
    const cliente = new ClientePage(page);
    const emision = new EmisionPage(page);
    const post = new PostEmisionPage(page);

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

const CONDUCTOR_DNI = '75652545';
const CONDUCTOR_SELECTOR = 'DNI75652545Conductor automatizado qa';
const PLACA_VEHICULO = 'ABC123';
const LICENCIA_VEHICULO = 'A12345678';
const REGISTRO_MTC = 'MTC123';
const DNI_DESTINATARIO = '76975258';

export async function crearGuiaRemisionGuardada(page: Page): Promise<ComprobanteInfo> {
    const caja = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobante = new ComprobantePage(page);
    const emision = new EmisionPage(page);
    const post = new PostEmisionPage(page);
    const guia = new GuiaRemitentePage(page);

    await irACaja(page, caja);
    await esperarCargaOverlay(page);

    await comprobante.abrirSelectorTipo();
    await page.locator(
        '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3005"]',
    ).click();
    await guia.esperarFormularioEstable();

    await guia.seleccionarDestinatario(DNI_DESTINATARIO, DNI_DESTINATARIO);

    await guia.completarPuntoPartidaYLlegada(
        'arequipa - Arequipa - Arequipa',
        'juliaca - San Roman - Puno',
        'arequipa-automatización',
        'juliaca-automatización',
    );

    await guia.seleccionarConductor(CONDUCTOR_DNI);
    await guia.completarPlacaYLicencia(PLACA_VEHICULO, LICENCIA_VEHICULO);

    await guia.seleccionarTransportista(CLIENTES.EMPRESA_RUC_AUTO.documento);
    await guia.completarMTC(REGISTRO_MTC);

    await guia.buscarYSeleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
    await guia.definirPesoTotal('Kg', '10');

    
    await guia.guardarGuia();
    await esperarCargaOverlay(page);
    await page.waitForURL('**/punto-venta/comprobantes', {timeout: 20_000});
    await esperarCargaOverlay(page);
    await page.locator('tbody tr').first().waitFor({state: 'visible', timeout: 15_000});

    const busqueda = new BusquedaComprobantesPage(page);
    const ids = await busqueda.obtenerIdentificadoresPrimeraPagina();
    const numero = ids.length > 0 ? ids[0] : '0-0';

    return buildInfo('Guía de Remisión', numero, CLIENTES.PERSONA_DNI.nombre, 'GUARDADO');
}


export async function asegurarConfiguracionEuro(page: Page, codigoItemPV: string): Promise<void> {

    await page.goto('/configuracion/sistema/sucursales');
    const btnMonedas = page.locator('[id="cfg_cmp-menu-configuracion.v-button:menu-1-0"]');
    await btnMonedas.waitFor({state: 'visible', timeout: 20_000});
    await btnMonedas.click();
    await esperarCargaOverlay(page);

    const eurVisible = await page.getByText('EUROS', {exact: true}).isVisible({timeout: 5_000}).catch(() => false);
    if (!eurVisible) {
        await page.getByRole('button', {name: 'Crear moneda'}).click();
        await page.getByRole('textbox', {name: 'Buscar nombre de la moneda Ej'}).fill('euros');
        await page.getByText('EUROS').click();
        await page.getByRole('button', {name: 'Crear moneda'}).nth(1).click();
        await page.locator('.v-modal > div').first().click();
    }

    const btnCaja = page.locator('[id="cfg_cmp-menu-configuracion.v-button:menu-1-2"]');
    await btnCaja.waitFor({state: 'visible', timeout: 15_000});
    await btnCaja.click();

    const btnVariantes = page.locator('[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:opciones-0-0"]').first();
    await btnVariantes.waitFor({state: 'visible', timeout: 15_000});
    await btnVariantes.click();

    const btnEditarCaja = page.locator('[id="config_cmp-configuracion-caja-item:caja-venta_cmp_dropdown:editar-caja-0-0"]');
    await btnEditarCaja.waitFor({state: 'visible', timeout: 15_000});
    await btnEditarCaja.click();

    const cardMoneda = page.locator('[id="config_cmp-configuracion-caja-ventas_drapes_registro-configuracion-caja.card-moneda"]');
    await cardMoneda.waitFor({state: 'visible', timeout: 15_000});
    await cardMoneda.click();

    const euroRow = page.locator('.fila.fila-body').filter({hasText: 'EUROS'});
    await euroRow.waitFor({state: 'visible', timeout: 10_000});
    const euroSwitchCheckbox = euroRow.locator('.v-switch input[type="checkbox"]');
    const isActive = await euroSwitchCheckbox.isChecked();
    if (!isActive) {
        await euroRow.locator('.slider').click();
    }

    await page.locator('[id="config_registro-configuracion-caja:caja-venta_v_button:registrar-caja"]').click();
    const btnCerrarModal = page.locator('.v-modal.is-open > .icon');
    await btnCerrarModal.waitFor({state: 'visible', timeout: 15_000});
    await btnCerrarModal.click();

    await page.getByText('Productos y servicios').click();
    const btnItems = page.locator('[id*="select-module-203-item-2007"]');
    await btnItems.waitFor({state: 'visible', timeout: 15_000});
    await btnItems.click();

    const txtBuscar = page.getByRole('textbox', {name: 'Buscar por nombre, código o c'});
    await txtBuscar.waitFor({state: 'visible', timeout: 15_000});
    await txtBuscar.fill(codigoItemPV);

    const btnDropdownItem = page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first();
    await btnDropdownItem.waitFor({state: 'visible', timeout: 15_000});
    await btnDropdownItem.click();
    await page.getByText('Editar ítem').click();
    await esperarCargaOverlay(page);

    const listaPrecioEuroVisible = await page.getByText('Precio euros').isVisible({timeout: 5_000}).catch(() => false);
    if (!listaPrecioEuroVisible) {
        await page.getByRole('button', {name: 'Crear lista de precios'}).click();
        await page.getByRole('textbox', {name: 'Digita el nombre de la lista'}).fill('Precio euros');
        await page.locator('div').filter({hasText: /^SOLES \(S\/\)$/}).nth(3).click();
        await page.getByText('EUROS (€)').click();
        await page.getByRole('button', {name: 'Crear lista de precios'}).nth(1).click();
        await page.locator('.v-modal > div').first().click();
    }

    const inputPrecioEur = page.getByRole('textbox', {name: 'Monto final'}).nth(2);
    await inputPrecioEur.waitFor({state: 'visible', timeout: 15_000});
    await inputPrecioEur.click();
    await inputPrecioEur.fill('15.42');
    await page.getByRole('button', {name: 'Actualizar producto'}).click();
    await page.locator('.v-modal > div').first().waitFor({state: 'visible', timeout: 15_000}).catch(() => {});
    await page.locator('.v-modal > div').first().click().catch(() => {});
}

export async function crearBoletaEnEuro(page: Page): Promise<ComprobanteInfo> {
    const caja = new CajaPage(page, CAJAS.VENTA.nombre);
    const comprobante = new ComprobantePage(page);
    const cliente = new ClientePage(page);
    const emision = new EmisionPage(page);
    const post = new PostEmisionPage(page);

    await irACaja(page, caja);

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
