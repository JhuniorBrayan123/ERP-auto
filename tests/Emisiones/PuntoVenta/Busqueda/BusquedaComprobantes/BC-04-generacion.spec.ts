import {
    expect,
    resolveActiveStorageState,
    resolveBaseUrl,
    test
} from '@fixtures/PuntoVenta/busqueda-comprobantes.fixture';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {BC_CATEGORIAS, BC_TIPOS_COMPROBANTE,} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {CAJAS, CLIENTES, ITEMS_PV,} from '@helpers/PuntoVenta/emision-data.helper';
import {VincularComprobanteTargets} from '@screenplay/targets/common/VincularComprobanteTargets';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";
import {EmitirCotizacion} from "@task/PuntoVenta/EmitirCotizacion.task";

test.describe('BC-12 | Generar nota de crédito desde una factura', {tag: ['@busqueda']}, () => {
    let semilla: ComprobanteInfo;

    test.beforeAll(async ({browser}) => {
        const context = await browser.newContext({
            storageState: resolveActiveStorageState(),
            baseURL: resolveBaseUrl(),
        });
        const page = await context.newPage();
        try {
            const caja = new CajaPage(page, CAJAS.VENTA.nombre);
            const comprobante = new ComprobantePage(page);
            const cliente = new ClientePage(page);
            const emision = new EmisionPage(page);
            const postEmision = new PostEmisionPage(page);

            await page.goto('/');
            await page.getByText('Ventas y compras').click();
            await page.getByText('Ver cajas').click();
            await caja.asegurarCajaAbierta();

            await comprobante.seleccionarFactura();
            await cliente.seleccionarClienteRUCAuto();
            await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            const emisionF = await emision.emitirConEfectivoExacto();
            const numero = await postEmision.obtenerCorrelativoDinamico();
            const [serie, correlativo] = numero.split('-');
            semilla = {
                tipo: 'Factura', serie: serie ?? emisionF.serie,
                correlativo: correlativo ?? emisionF.correlativo,
                numeroCompleto: numero || `${emisionF.serie}-${emisionF.correlativo}`,
                cliente: CLIENTES.EMPRESA_RUC_AUTO.nombre,
            };
            console.log(`[BC-12] Semilla Factura creada: ${semilla.numeroCompleto}`);
        } finally {
            await context.close();
        }
    });

    test.beforeEach(async ({page}) => {
        await page.goto('/punto-venta/comprobantes');
    });

    test('SC-01: Generar nota de crédito desde una factura emitida @BC-12.1', async ({busquedaPage}) => {
        test.skip(!semilla, 'Semilla factura no disponible');
        const s = semilla!;

        await test.step('Given: filtrar la factura semilla en categoría Facturación', async () => {
            await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.FACTURACION);
            await busquedaPage.abrirFiltrosAvanzados();
            await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.FACTURA);
            await busquedaPage.filtrarPorCorrelativos(s.correlativo);
        });

        await test.step('When: abre el menú y selecciona Generar → Nota de crédito', async () => {
            await busquedaPage.abrirAccionesDeComprobante(s.numeroCompleto);
            await busquedaPage.validarOpcionesGenerarComprobante([
                'Nota de crédito', 'Nota de débito',
            ]);

            const popupPage = await busquedaPage.abrirGenerarComprobante(
                BC_TIPOS_COMPROBANTE.NOTA_CREDITO,
                CAJAS.VENTA.nombre,
            );

            await test.step('And: vincular la factura original en el popup', async () => {
                await VincularComprobanteTargets.btnVincularYCrearNC(popupPage).click();
                await expect(VincularComprobanteTargets.datosComprobanteCargado(popupPage))
                    .toBeVisible({timeout: 15_000});
            });

            await test.step('Then: la pantalla de nota de crédito carga con datos de la factura', async () => {
                await esperarCargaOverlaySiVisible(popupPage);
                await expect(popupPage.getByText(
                    ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre,
                )).toBeVisible({timeout: 30_000});
            });
            await popupPage.close();
        });
    });
});

test.describe('BC-13 | Generar nota de venta desde una boleta', {tag: ['@busqueda']}, () => {
    let semilla: ComprobanteInfo;

    test.beforeAll(async ({browser}) => {
        const context = await browser.newContext({
            storageState: resolveActiveStorageState(),
            baseURL: resolveBaseUrl(),
        });
        const page = await context.newPage();
        try {
            const caja = new CajaPage(page, CAJAS.VENTA.nombre);
            const comprobante = new ComprobantePage(page);
            const cliente = new ClientePage(page);
            const emision = new EmisionPage(page);
            const postEmision = new PostEmisionPage(page);

            await page.goto('/');
            await page.getByText('Ventas y compras').click();
            await page.getByText('Ver cajas').click();
            await caja.asegurarCajaAbierta();

            await comprobante.seleccionarBoleta();
            await cliente.seleccionarClienteDNI(
                CLIENTES.PERSONA_DNI_2.documento,
                CLIENTES.PERSONA_DNI_2.textoSelector,
            );
            await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await emision.emitirConEfectivoExacto();
            const numero = await postEmision.obtenerCorrelativoDinamico();
            const [serie, correlativo] = numero.split('-');
            semilla = {
                tipo: 'Boleta', serie: serie ?? '', correlativo: correlativo ?? '',
                numeroCompleto: numero, cliente: CLIENTES.PERSONA_DNI_2.nombre,
            };
            console.log(`[BC-13] Semilla Boleta creada: ${semilla.numeroCompleto}`);
        } finally {
            await context.close();
        }
    });

    test.beforeEach(async ({page}) => {
        await page.goto('/punto-venta/comprobantes');
    });

    test('SC-01: Generar nota de venta desde una boleta emitida @BC-13.1', async ({busquedaPage}) => {
        test.skip(!semilla, 'Semilla boleta no disponible');
        const s = semilla!;

        await test.step('Given: filtrar la boleta semilla', async () => {
            await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.FACTURACION);
            await busquedaPage.abrirFiltrosAvanzados();
            await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.BOLETA);
            await busquedaPage.filtrarPorCorrelativos(s.correlativo);
        });

        await test.step('When: abre menú y selecciona Generar → Nota de venta', async () => {
            await busquedaPage.abrirAccionesDeComprobante(s.numeroCompleto);
            const popupPage = await busquedaPage.abrirGenerarComprobante(
                BC_TIPOS_COMPROBANTE.NOTA_VENTA,
                CAJAS.VENTA.nombre,
            );

            await test.step('Then: la NV carga con el cliente y producto de la boleta origen', async () => {
                await expect(popupPage.getByRole('main')).toContainText(s.cliente, {timeout: 20_000});
                await expect(popupPage.getByRole('main')).toContainText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            });

            await popupPage.close();
        });
    });
});


test.describe('BC-14 | Generar factura desde una NV', {tag: ['@busqueda']}, () => {
    let semilla: ComprobanteInfo;

    test.beforeAll(async ({browser}) => {
        const context = await browser.newContext({
            storageState: resolveActiveStorageState(),
            baseURL: resolveBaseUrl(),
        });
        const page = await context.newPage();
        try {
            const caja = new CajaPage(page, CAJAS.VENTA.nombre);
            const comprobante = new ComprobantePage(page);
            const cliente = new ClientePage(page);
            const emision = new EmisionPage(page);
            const postEmision = new PostEmisionPage(page);

            await page.goto('/');
            await page.getByText('Ventas y compras').click();
            await page.getByText('Ver cajas').click();
            await caja.asegurarCajaAbierta();

            await comprobante.seleccionarNotaVenta();
            await cliente.seleccionarClienteDNI(
                CLIENTES.PERSONA_DNI.documento,
                `DNIDoc. Nacional de Identidad${CLIENTES.PERSONA_DNI.documento}99999999${CLIENTES.PERSONA_DNI.nombre}`,
            );
            await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await emision.emitirConEfectivoExacto();
            const numero = await postEmision.obtenerCorrelativoDinamico();
            const [serie, correlativo] = numero.split('-');
            semilla = {
                tipo: 'Nota de venta', serie: serie ?? '', correlativo: correlativo ?? '',
                numeroCompleto: numero, cliente: CLIENTES.PERSONA_DNI.nombre,
            };
            console.log(`[BC-14] Semilla NV creada: ${semilla.numeroCompleto}`);
        } finally {
            await context.close();
        }
    });

    test.beforeEach(async ({page}) => {
        await page.goto('/punto-venta/comprobantes');
    });

    test('SC-01: Generar factura desde una nota de venta @BC-14.1', async ({busquedaPage}) => {
        test.skip(!semilla, 'Semilla NV no disponible');
        const s = semilla!;

        await test.step('Given: filtrar la nota de venta semilla', async () => {
            await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.VENTAS);
            await busquedaPage.abrirFiltrosAvanzados();
            await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.NOTA_VENTA);
            await busquedaPage.filtrarPorCorrelativos(s.correlativo);
        });

        await test.step('When: abre menú y genera Factura desde la NV', async () => {
            await busquedaPage.abrirAccionesDeComprobante(s.numeroCompleto);
            const popupPage = await busquedaPage.abrirGenerarComprobante(
                BC_TIPOS_COMPROBANTE.FACTURA,
                CAJAS.VENTA.nombre,
            );

            await test.step('Then: la factura carga con el ítem de la NV origen', async () => {
                await expect(popupPage.getByRole('main')).toContainText(
                    ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre, {timeout: 20_000},
                );
            });

            await popupPage.close();
        });
    });
});

test.describe('BC-15 | Generar pedido desde una cotización', {tag: ['@busqueda']}, () => {
    let semilla: ComprobanteInfo;

    test.beforeAll(async ({browser}) => {
        const context = await browser.newContext({
            storageState: resolveActiveStorageState(),
            baseURL: resolveBaseUrl(),
        });
        const page = await context.newPage();
        try {
            const caja = new CajaPage(page, CAJAS.VENTA.nombre);
            const comprobante = new ComprobantePage(page);
            const cliente = new ClientePage(page);
            const emision = new EmisionPage(page);
            const postEmision = new PostEmisionPage(page);

            await page.goto('/');
            await page.getByText('Ventas y compras').click();
            await page.getByText('Ver cajas').click();
            await caja.asegurarCajaAbierta();

            await comprobante.seleccionarCotizacion();
            await cliente.seleccionarClienteDNI(
                CLIENTES.PERSONA_DNI_2.documento,
                CLIENTES.PERSONA_DNI_2.textoSelector,
            );
            await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await EmitirCotizacion()(page);
            const numero = await postEmision.obtenerCorrelativoDinamico();
            const [serie, correlativo] = numero.split('-');
            semilla = {
                tipo: 'Cotización', serie: serie ?? '', correlativo: correlativo ?? '',
                numeroCompleto: numero, cliente: CLIENTES.PERSONA_DNI_2.nombre,
            };
            console.log(`[BC-15] Semilla Cotización creada: ${semilla.numeroCompleto}`);
        } finally {
            await context.close();
        }
    });

    test.beforeEach(async ({page}) => {
        await page.goto('/punto-venta/comprobantes');
    });

    test('SC-01: Generar pedido desde una cotización @BC-15.1', async ({busquedaPage}) => {
        test.skip(!semilla, 'Semilla cotización no disponible');
        const s = semilla!;

        await test.step('Given: filtrar la cotización semilla', async () => {
            await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.COTIZACIONES);
            await busquedaPage.abrirFiltrosAvanzados();
            await busquedaPage.filtrarPorCorrelativos(s.correlativo);
        });

        await test.step('When: abre menú y genera un Pedido desde la cotización', async () => {
            await busquedaPage.abrirAccionesDeComprobante(s.numeroCompleto);
            const popupPage = await busquedaPage.abrirGenerarComprobante(
                'Pedido',
                CAJAS.VENTA.nombre,
            );

            await test.step('Then: la pantalla de pedido carga con los datos de la cotización', async () => {
                await expect(popupPage.getByRole('main')).toContainText(s.cliente, {timeout: 20_000});
                await expect(popupPage.getByRole('main')).toContainText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            });

            await popupPage.close();
        });
    });
});


test.describe('BC-16 | Generar boleta desde un pedido', {tag: ['@busqueda']}, () => {
    let semilla: ComprobanteInfo;

    test.beforeAll(async ({browser}) => {
        const context = await browser.newContext({
            storageState: resolveActiveStorageState(),
            baseURL: resolveBaseUrl(),
        });
        const page = await context.newPage();
        try {
            const caja = new CajaPage(page, CAJAS.VENTA.nombre);
            const comprobante = new ComprobantePage(page);
            const cliente = new ClientePage(page);
            const emision = new EmisionPage(page);
            const postEmision = new PostEmisionPage(page);

            await page.goto('/');
            await page.getByText('Ventas y compras').click();
            await page.getByText('Ver cajas').click();
            await caja.asegurarCajaAbierta();

            await comprobante.seleccionarPedido();
            await cliente.seleccionarClienteDNI(
                CLIENTES.PERSONA_DNI.documento,
                `DNIDoc. Nacional de Identidad${CLIENTES.PERSONA_DNI.documento}99999999${CLIENTES.PERSONA_DNI.nombre}`,
            );
            await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            const pedidoResult = await emision.guardarPedido();
            const numero = await postEmision.obtenerCorrelativoDinamico();
            const [serie, correlativo] = numero.split('-');
            semilla = {
                tipo: 'Pedido', serie: serie ?? pedidoResult.serie,
                correlativo: correlativo ?? pedidoResult.correlativo,
                numeroCompleto: numero || `${pedidoResult.serie}-${pedidoResult.correlativo}`,
                cliente: CLIENTES.PERSONA_DNI.nombre,
            };
            console.log(`[BC-16] Semilla Pedido creada: ${semilla.numeroCompleto}`);
        } finally {
            await context.close();
        }
    });

    test.beforeEach(async ({page}) => {
        await page.goto('/punto-venta/comprobantes');
    });

    test('SC-01: Generar boleta desde un pedido guardado @BC-16.1', async ({busquedaPage}) => {
        test.skip(!semilla, 'Semilla pedido no disponible');
        const s = semilla!;

        await test.step('Given: filtrar el pedido semilla', async () => {
            await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.PEDIDOS);
            await busquedaPage.abrirFiltrosAvanzados();
            await busquedaPage.filtrarPorCorrelativos(s.correlativo);
        });

        await test.step('When: abre menú y genera una Boleta desde el pedido', async () => {
            await busquedaPage.abrirAccionesDeComprobante(s.numeroCompleto);
            const popupPage = await busquedaPage.abrirGenerarComprobante(
                BC_TIPOS_COMPROBANTE.BOLETA,
                CAJAS.VENTA.nombre,
            );

            await test.step('Then: la boleta carga con los datos del pedido origen', async () => {
                await expect(popupPage.getByRole('main')).toContainText(s.cliente, {timeout: 20_000});
                await expect(popupPage.getByRole('main')).toContainText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            });

            await popupPage.close();
        });
    });
});
